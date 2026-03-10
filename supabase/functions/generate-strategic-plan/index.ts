import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateParams {
  rei_responses: any;
  segment?: string;
  objective?: string;
  isB2B?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rei_responses, segment, objective, isB2B }: GenerateParams = await req.json();

    if (!rei_responses) {
      throw new Error('rei_responses is required');
    }

    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured on the server');
    }

    console.log('[generate-strategic-plan] Initiating generation for segment:', segment);

    // Sanitize REI responses to remove noise, empty fields, and internal UI state
    // This ensures the AI only sees real data and saves tokens
    const sanitizeAnswers = (raw: any) => {
      if (!raw || typeof raw !== 'object') return raw;
      const cleaned: any = {};

      for (const [key, value] of Object.entries(raw)) {
        // Ignore internal metadata, boolean flags, or empty strings
        if (key.startsWith('_') || key === 'id' || key === 'project_id' || key === 'metadata') continue;
        if (value === '' || value === null || value === undefined) continue;
        if (Array.isArray(value) && value.length === 0) continue;
        if (typeof value === 'object' && Object.keys(value).length === 0) continue;

        cleaned[key] = value;
      }
      return cleaned;
    };

    const cleanResponses = sanitizeAnswers(rei_responses);
    const scoringContext = rei_responses.radar_data ? `Radar de Maturidade: ${JSON.stringify(rei_responses.radar_data)}` : '';
    const isCrmOps = objective?.includes('CRM') || objective?.includes('RevOps') || objective?.includes('Operações');

    let strategicContext = `Tendo em vista estas dores e gargalos explícitos nas respostas, crie um plano puramente tático e cirúrgico para os próximos 90 dias (Mês 1 a Mês 3).
Para preencher o Roadmap, foque primeiro em resolver as notas mais baixas do diagnóstico (gargalos críticos).`;

    if (isCrmOps) {
      strategicContext = `Tendo em vista as dores mapeadas, crie um Roadmap cirúrgico focado EXATAMENTE em 90 DIAS de implementação de elite ("World-Class").
O objetivo deste roadmap de 90 dias é transformar o caos atual em uma máquina de RevOps impecável e previsível:
1. Mês 1 (Fundação Operacional): Centralizar dados, arrumar a casa, acabar com sistemas isolados.
2. Mês 2 (Tração de Vendas e SLA): Otimizar "Speed to Lead", Passagem de bastão e fechamentos.
3. Mês 3 (Retenção e Onboarding Orquestrado): Focar brutalmente na experiência do cliente no "Dia 1", garantindo que a base receba cross-sell e up-sell constantes.
IMPORTANTE: O Mês 3 OBRIGATORIAMENTE deve preparar o terreno e deixar engatilhado o Upsell para a nossa "Consultoria Growth 360" (uma evolução onde a RevHackers escala tráfego sobre esta base perfeita de CRM).`;
    }

    const prompt = `Você é o Diretor Estratégico "World-Class" de Growth & RevOps na RevHackers.
Acabamos de realizar uma reunião de Onboarding (Kickoff) com um cliente B2B de alto nível.
As respostas do diagnóstico (REI) fornecidas revelam os gargalos, o caos interno e os vazamentos de receita da empresa.

CONTEXTO DO CLIENTE:
Segmento: ${segment || 'B2B'}
Objetivo Principal: ${objective || 'Crescimento Previsível'}
Modelo B2B: ${isB2B !== false ? 'Sim' : 'Não'}

Respostas Reais do Diagnóstico:
${JSON.stringify(cleanResponses, null, 2)}
${scoringContext}

${strategicContext}

VOCÊ DEVE OBRIGATORIAMENTE RETORNAR UM JSON VÁLIDO EXATAMENTE NESTE FORMATO:
{
  "objective": "Objetivo de Alta Performance Traduzido",
  "okrs": [
    { 
      "description": "Ex: Estruturar Onboarding Orquestrado de Classe Mundial", 
      "timeline": "Mês 1", 
      "sub_results": [
         "Mapear Hand-off Sales para CS", 
         "Ativar Plays de Retenção"
      ] 
    }
  ],
  "roadmap": {
    "phases": [
      { 
        "period": "Mês 1", 
        "title": "Configuração", 
        "deliverables": ["Configuração Inicial"], 
        "responsible": "Equipe RevHackers" 
      },
      ... continue os outros meses com os dados gerados de forma profunda.
    ]
  },
  "warnings": [
    "Dê 2 ou 3 alertas SÉRIOS de RISCO VITAL para a operação identificados através das respostas do cliente."
  ]
}

Não justifique, não formata em Markdown externo e não invente campos. Apenas o JSON puro.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Responda APENAS com um objeto JSON estrito sem formatação e sem blocos markdown. Use o schema solicitado.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2 // Low temp for consistent strategic mapping focused on real problems
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[generate-strategic-plan] OpenAI API Error:', err);
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Recieved empty response from OpenAI');
    }

    let planData;
    try {
      planData = JSON.parse(content);
    } catch (e) {
      console.error('[generate-strategic-plan] Parse error on raw output:', content);
      throw new Error('Failed to parse JSON out of AI response');
    }

    return new Response(JSON.stringify({ result: planData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[generate-strategic-plan] Caught Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
