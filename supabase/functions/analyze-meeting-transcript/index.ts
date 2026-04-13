// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * analyze-meeting-transcript
 *
 * Analisa a transcricao de uma reuniao e extrai insights estruturados.
 * Usa OpenAI Structured Outputs (json_schema) para garantir JSON valido
 * sem try/catch ou fallbacks frageis.
 *
 * Schema de saida alinhado com MeetingRecordingDoc e MeetingIntelligenceTimeline.
 */

const INSIGHTS_SCHEMA = {
  name: "meeting_insights",
  strict: true,
  schema: {
    type: "object",
    properties: {
      tipo_reuniao: {
        type: "string",
        enum: ["proposta", "kickoff", "followup", "diagnostico", "outro"]
      },
      resumo_executivo: { type: "string" },
      sentimento: {
        type: "string",
        enum: ["positivo", "neutro", "negativo"]
      },
      score_engajamento: { type: "number" },
      acoes_proximas: {
        type: "array",
        items: { type: "string" }
      },
      topicos_principais: {
        type: "array",
        items: { type: "string" }
      },
      proposta: {
        type: "object",
        properties: {
          sinais_compra: {
            type: "array",
            items: { type: "string" }
          },
          objecoes_detectadas: {
            type: "array",
            items: { type: "string" }
          },
          valor_discutido: { type: "string" },
          prazo_decisao: { type: "string" }
        },
        required: ["sinais_compra", "objecoes_detectadas", "valor_discutido", "prazo_decisao"],
        additionalProperties: false
      },
      kickoff_data: {
        type: "object",
        properties: {
          objetivos_alinhados: {
            type: "array",
            items: { type: "string" }
          },
          riscos_mapeados: {
            type: "array",
            items: { type: "string" }
          },
          responsaveis: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["objetivos_alinhados", "riscos_mapeados", "responsaveis"],
        additionalProperties: false
      },
      inteligencia_estrategica: {
        type: "object",
        properties: {
          diferenciais_cliente: {
            type: "array",
            items: { type: "string" }
          },
          dores_mencionadas: {
            type: "array",
            items: { type: "string" }
          },
          concorrentes_citados: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["diferenciais_cliente", "dores_mencionadas", "concorrentes_citados"],
        additionalProperties: false
      }
    },
    required: [
      "tipo_reuniao", "resumo_executivo", "sentimento", "score_engajamento",
      "acoes_proximas", "topicos_principais", "proposta", "kickoff_data",
      "inteligencia_estrategica"
    ],
    additionalProperties: false
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recordingId } = await req.json();
    if (!recordingId) throw new Error('recordingId obrigatorio');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurada');

    const { data: recording, error: recErr } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recErr || !recording) throw new Error('Gravacao nao encontrada');
    if (!recording.transcript) throw new Error('Sem transcricao disponivel');

    if (recording.ai_analyzed_at) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Ja analisado',
        insights: recording.ai_insights,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Limita a 15k chars para nao estourar contexto
    const transcript = recording.transcript.length > 15000
      ? recording.transcript.substring(0, 15000) + '\n\n[...truncado por limite de tokens...]'
      : recording.transcript;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Voce e um analista de negocios especializado em vendas B2B e consultoria de crescimento.
Analise a transcricao de reuniao e extraia insights estruturados com precisao.

Regras:
- tipo_reuniao: classifique com base no conteudo (proposta=apresentacao de proposta comercial, kickoff=inicio de projeto, followup=acompanhamento, diagnostico=levantamento de informacoes)
- score_engajamento: 0-100 baseado na participacao e interesse do cliente
- acoes_proximas: acoes concretas combinadas na reuniao (nao suposicoes)
- proposta: preencha apenas se tipo_reuniao="proposta", caso contrario deixe arrays vazios e strings vazias
- kickoff_data: preencha apenas se tipo_reuniao="kickoff", caso contrario deixe arrays vazios
- Nao use o caractere em dash (U+2014) em nenhum campo - use hifen simples`,
          },
          {
            role: 'user',
            content: `Transcricao:\n\n${transcript}`,
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: INSIGHTS_SCHEMA
        },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const result = await res.json();
    // Com Structured Outputs o JSON e garantido - sem try/catch necessario
    const insights = JSON.parse(result.choices[0].message.content);

    await supabase
      .from('meeting_recordings')
      .update({
        ai_summary: insights.resumo_executivo,
        ai_insights: insights,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', recordingId);

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[analyze-meeting-transcript]', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
