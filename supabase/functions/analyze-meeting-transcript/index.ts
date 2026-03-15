// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Analyze Meeting Transcript
 * 
 * Uses GPT to analyze a meeting transcript and extract:
 * - Executive summary (3-5 sentences)
 * - Action items identified
 * - Client objections/concerns
 * - Engagement score (0-100)
 * - Sentiment (positive/neutral/negative)
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { recordingId } = await req.json();

        if (!recordingId) {
            throw new Error('recordingId is required');
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        // Get recording with transcript
        const { data: recording, error: recordingError } = await supabaseClient
            .from('meeting_recordings')
            .select('*')
            .eq('id', recordingId)
            .single();

        if (recordingError || !recording) {
            throw new Error('Recording not found');
        }

        if (!recording.transcript) {
            throw new Error('No transcript available for analysis');
        }

        if (recording.ai_analyzed_at) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Already analyzed',
                insights: recording.ai_insights,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Truncate transcript if too long (for token limits)
        const maxChars = 12000;
        const transcriptForAnalysis = recording.transcript.length > maxChars
            ? recording.transcript.substring(0, maxChars) + '\n\n[...transcrição truncada por limite de tokens...]'
            : recording.transcript;

        // Analyze with GPT
        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4',
                messages: [
                    {
                        role: 'system',
                        content: `Você é um analista de negócios especializado em vendas B2B e consultoria. 
Analise a transcrição de reunião fornecida e retorne APENAS um JSON válido (sem markdown, sem explicações) com a seguinte estrutura:

{
  "resumo_executivo": "Resumo de 3-5 frases sobre o conteúdo principal da reunião",
  "acoes_identificadas": ["lista", "de", "próximos passos mencionados"],
  "objecoes_cliente": ["lista", "de", "dúvidas ou resistências detectadas"],
  "topicos_principais": ["lista", "dos", "3-5 tópicos mais discutidos"],
  "sentimento": "positivo | neutro | negativo",
  "score_engajamento": 75,
  "oportunidades_detectadas": ["lista", "de", "oportunidades de venda ou upsell identificadas"],
  "riscos_identificados": ["lista", "de", "possíveis riscos ao fechamento"]
}

Se não houver informação suficiente para algum campo, retorne array vazio [] ou string "N/A".
O score_engajamento deve ser um número de 0 a 100 baseado na participação do cliente.`
                    },
                    {
                        role: 'user',
                        content: `Analise esta transcrição de reunião:\n\n${transcriptForAnalysis}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1500,
            }),
        });

        if (!gptResponse.ok) {
            const errorText = await gptResponse.text();
            throw new Error(`GPT API error: ${errorText}`);
        }

        const gptResult = await gptResponse.json();
        const analysisText = gptResult.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        let insights;
        try {
            // Clean potential markdown formatting
            const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            insights = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse GPT response:', analysisText);
            insights = {
                resumo_executivo: analysisText,
                acoes_identificadas: [],
                objecoes_cliente: [],
                topicos_principais: [],
                sentimento: 'neutro',
                score_engajamento: 50,
                oportunidades_detectadas: [],
                riscos_identificados: [],
                parse_error: true,
            };
        }

        // Update recording with analysis
        await supabaseClient
            .from('meeting_recordings')
            .update({
                ai_summary: insights.resumo_executivo,
                ai_insights: insights,
                ai_analyzed_at: new Date().toISOString(),
            })
            .eq('id', recordingId);

        return new Response(JSON.stringify({
            success: true,
            message: 'Analysis completed',
            insights: insights,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Analysis error:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
