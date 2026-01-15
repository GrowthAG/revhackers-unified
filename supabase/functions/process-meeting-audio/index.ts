// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Process Meeting Audio
 * 
 * Receives audio from Chrome extension, transcribes it using Whisper,
 * classifies the meeting type (proposal/onboarding/other),
 * and updates the appropriate client record.
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const meetUrl = formData.get('meetUrl') as string;
        const meetTitle = formData.get('meetTitle') as string;
        const recordedAt = formData.get('recordedAt') as string;

        if (!audioFile) {
            throw new Error('No audio file provided');
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`Processing meeting: ${meetTitle}`);

        // ========================================
        // STEP 1: Transcribe with Whisper
        // ========================================
        const whisperFormData = new FormData();
        whisperFormData.append('file', audioFile, 'audio.webm');
        whisperFormData.append('model', 'whisper-1');
        whisperFormData.append('language', 'pt');

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: whisperFormData,
        });

        if (!whisperResponse.ok) {
            const errorText = await whisperResponse.text();
            throw new Error(`Whisper error: ${errorText}`);
        }

        const whisperResult = await whisperResponse.json();
        const transcript = whisperResult.text;

        console.log(`Transcript length: ${transcript.length} chars`);

        // ========================================
        // STEP 2: Classify and Generate Smart Artifacts with GPT
        // ========================================
        const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                        content: `Você é um estrategista de negócios B2B da RevHackers. Analise a transcrição e gere artefatos RICOS baseados no tipo de reunião.

Retorne APENAS um JSON válido (sem markdown) com a seguinte estrutura:

{
  "tipo_reuniao": "proposta" | "kickoff" | "onboarding" | "followup" | "suporte" | "outro",
  "cliente": {
    "nome_contato": "Nome do cliente",
    "empresa": "Nome da empresa",
    "email": "email se mencionado",
    "cargo": "cargo se mencionado",
    "segmento_mercado": "ex: SaaS B2B, Varejo, Fintech"
  },
  "resumo_executivo": "3-5 frases resumindo a reunião",

  // EXTRAÇÃO DE INTELIGÊNCIA (CRÍTICO PARA STRATEGIC PLAN)
  "inteligencia_estrategica": {
    "concorrentes_mencionados": [
        {"nome": "Nome Concorrente", "url": "url se mencionada ou inferida", "contexto": "pq foi citado"}
    ],
    "referencias_benchmarking": ["Empresa Ref 1", "Empresa Ref 2"],
    "desafios_especificos": ["Desafio 1", "Desafio 2"],
    "ojectivos_curto_prazo": ["Obj 1", "Obj 2"],
    "stack_tecnologica": ["CRM X", "Ads Y"]
  },
  
  // SE FOR PROPOSTA
  "proposta": {
    "visao_projeto": "Visão...",
    "escopo_sugerido": ["Item 1", "Item 2"],
    "timeline_sugerida": [
      {"fase": "Nome", "duracao": "tempo", "entregas": ["a", "b"]}
    ],
    "investimento_estimado": { "range_min": 0, "range_max": 0, "justificativa": "" },
    "proximos_passos": [],
    "objecoes_detectadas": [],
    "sinais_compra": [],
    "score_fechamento": 0-100
  },
  
  // SE FOR KICKOFF OU ONBOARDING - Foco em Planejamento Estratégico
  "kickoff_data": {
    "contexto_cliente": "Resumo profundo do contexto",
    "pontos_fortes": ["Ponto 1", "Ponto 2"],
    "gargalos_atuais": ["Gargalo 1", "Gargalo 2"],
    "definicao_sucesso": "O que é sucesso para eles?",
    "personas_alvo": [
        {"nome": "Persona 1", "papel": "Decisor", "dor_principal": "X"}
    ],
    "cronograma_macrometras": [
        {"mes": 1, "foco": "X"},
        {"mes": 2, "foco": "Y"},
        {"mes": 3, "foco": "Z"}
    ],
    "stakeholders": [{"nome": "X", "papel": "Y"}],
    "riscos_mapeados": []
  },
  
  "acoes_proximas": ["Ação 1", "Ação 2"],
  "sentimento": "positivo" | "neutro" | "negativo",
  "score_engajamento": 0-100
}

REGRAS:
- Se for Kickoff/Onboarding/Start, classifique como "kickoff" e preencha "kickoff_data" e "inteligencia_estrategica".
- Extraia o MÁXIMO de URLs ou nomes de concorrentes para nosso scraper.
- Seja técnico e estratégico.`
                    },
                    {
                        role: 'user',
                        content: `Título da reunião: ${meetTitle}\n\nTranscrição completa:\n${transcript.substring(0, 15000)}`
                    }
                ],
                temperature: 0.4,
                max_tokens: 3000,
            }),
        });

        const analysisResult = await analysisResponse.json();
        let analysis;

        try {
            const content = analysisResult.choices?.[0]?.message?.content || '';
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleanContent);
        } catch (e) {
            console.error('Failed to parse analysis:', e);
            analysis = {
                tipo_reuniao: 'outro',
                resumo_executivo: 'Análise não disponível',
                cliente_identificado: {},
                acoes_proximas: [],
                objecoes_detectadas: [],
                score_interesse: 50,
                sentimento: 'neutro',
                sinais_compra: [],
                riscos: []
            };
        }

        console.log(`Meeting type: ${analysis.tipo_reuniao}`);

        // ========================================
        // STEP 3: Save Recording
        // ========================================
        const { data: recording, error: recordingError } = await supabaseClient
            .from('meeting_recordings')
            .insert({
                title: meetTitle,
                transcript: transcript,
                ai_summary: analysis.resumo_executivo,
                ai_insights: analysis,
                happened_at: recordedAt || new Date().toISOString(),
                transcript_status: 'completed',
                transcribed_at: new Date().toISOString(),
                ai_analyzed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (recordingError) {
            console.error('Error saving recording:', recordingError);
        }

        // ========================================
        // STEP 4: Update Client/Project Based on Type with Rich Artifacts
        // ========================================
        const clientInfo = analysis.cliente || analysis.cliente_identificado || {};

        if (clientInfo?.empresa || clientInfo?.email) {
            // Try to find matching client
            let clientQuery = supabaseClient.from('clients').select('id, name');

            if (clientInfo.email) {
                clientQuery = clientQuery.ilike('email', `%${clientInfo.email}%`);
            } else if (clientInfo.empresa) {
                clientQuery = clientQuery.ilike('name', `%${clientInfo.empresa}%`);
            }

            const { data: matchingClients } = await clientQuery.limit(1);

            if (matchingClients && matchingClients.length > 0) {
                const clientId = matchingClients[0].id;

                // Update recording with client link
                if (recording) {
                    await supabaseClient
                        .from('meeting_recordings')
                        .update({ client_id: clientId })
                        .eq('id', recording.id);
                }

                // Find associated project
                const { data: projects } = await supabaseClient
                    .from('rei_projects')
                    .select('id, status, diagnostic_data')
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (projects && projects.length > 0) {
                    const projectId = projects[0].id;
                    const existingData = projects[0].diagnostic_data || {};

                    // Update recording with project link
                    if (recording) {
                        await supabaseClient
                            .from('meeting_recordings')
                            .update({ rei_project_id: projectId })
                            .eq('id', recording.id);
                    }

                    // Update project based on meeting type
                    if (analysis.tipo_reuniao === 'proposta' && analysis.proposta) {
                        // PROPOSTA: Save scope and timeline
                        const proposalData = {
                            ...existingData,
                            proposal_artifacts: {
                                visao_projeto: analysis.proposta.visao_projeto,
                                escopo_sugerido: analysis.proposta.escopo_sugerido,
                                timeline_sugerida: analysis.proposta.timeline_sugerida,
                                investimento_estimado: analysis.proposta.investimento_estimado,
                                proximos_passos: analysis.proposta.proximos_passos,
                                objecoes_detectadas: analysis.proposta.objecoes_detectadas,
                                sinais_compra: analysis.proposta.sinais_compra,
                                score_fechamento: analysis.proposta.score_fechamento,
                                generated_at: new Date().toISOString(),
                                meeting_id: recording?.id,
                            },
                            last_meeting_summary: analysis.resumo_executivo,
                        };

                        await supabaseClient
                            .from('rei_projects')
                            .update({
                                status: 'proposal_sent',
                                diagnostic_data: proposalData,
                                last_meeting_at: new Date().toISOString(),
                            })
                            .eq('id', projectId);

                        console.log(`✅ Saved PROPOSAL artifacts to project ${projectId}`);
                        console.log(`   → Scope: ${analysis.proposta.escopo_sugerido?.length || 0} items`);
                        console.log(`   → Timeline: ${analysis.proposta.timeline_sugerida?.length || 0} phases`);


                    } else if ((analysis.tipo_reuniao === 'kickoff' || analysis.tipo_reuniao === 'onboarding') && (analysis.kickoff_data || analysis.onboarding)) {

                        // KICKOFF/ONBOARDING: Save documentation & Intelligence
                        const kickoffData = analysis.kickoff_data || analysis.onboarding;

                        // Merge Intelligence into Diagnostic Data for Strategic Plan usage
                        const strategicIntelligence = analysis.inteligencia_estrategica || {};

                        const onboardingData = {
                            ...existingData,
                            onboarding_artifacts: {
                                ...kickoffData,
                                generated_at: new Date().toISOString(),
                                meeting_id: recording?.id,
                            },
                            strategic_intelligence: strategicIntelligence,
                            last_meeting_summary: analysis.resumo_executivo,
                        };

                        await supabaseClient
                            .from('rei_projects')
                            .update({
                                status: 'onboarding',
                                diagnostic_data: onboardingData,
                                last_meeting_at: new Date().toISOString(),
                            })
                            .eq('id', projectId);

                        console.log(`✅ Saved KICKOFF/ONBOARDING artifacts to project ${projectId}`);

                        // TRIGGER ENRICHMENT & STRATEGIC PLAN GENERATION
                        // We pass the extracted intelligence to the enrichment function
                        try {
                            console.log(`🚀 Triggering Post-Kickoff Enrichment for ${projectId}`);

                            const { error: invokeError } = await supabaseClient.functions.invoke('trigger-post-rei-enrichment', {
                                body: {
                                    projectId,
                                    source: 'kickoff',
                                    kickoffData: {
                                        ...kickoffData,
                                        ...strategicIntelligence
                                    }
                                }
                            });

                            if (invokeError) console.error("Trigger enrichment failed:", invokeError);
                            else console.log("✅ Enrichment triggered successfully");

                        } catch (err) {
                            console.error("Failed to invoke enrichment:", err);
                        }
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            recordingId: recording?.id,
            meetingType: analysis.tipo_reuniao,
            summary: analysis.resumo_executivo,
            clientIdentified: analysis.cliente_identificado,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Processing error:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
