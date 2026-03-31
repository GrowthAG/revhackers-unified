// @ts-nocheck
// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function withAutoRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`[Auto-Retry] Falha na rede/OpenAI. Tentativa ${i + 1} de ${retries}. Aguardando ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unreachable");
}

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
serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // ============================================================
    // AUTH GATE - JWT obrigatorio (extensao Chrome envia o token
    // do usuario logado no app RevHackers via Authorization header)
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, error: 'Autorizacao necessaria. Envie o token JWT no header Authorization.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
        return new Response(JSON.stringify({ success: false, error: 'Token invalido ou expirado.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const meetUrl = formData.get('meetUrl') as string;
        const meetTitle = formData.get('meetTitle') as string;
        const recordedAt = formData.get('recordedAt') as string;
        // Transcript do Web Speech API (gratis, tempo real no Chrome)
        const webSpeechTranscript = (formData.get('transcript') as string) || '';
        // Vinculo explicito de projeto
        const explicitProjectId = (formData.get('projectId') as string) || null;

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        console.log(`[process-meeting-audio] Processing meeting: "${meetTitle}" | project: ${explicitProjectId || 'nao vinculado'} | user: ${user.email}`);

        // ========================================
        // STEP 1: Obter transcript
        // Prioridade: Web Speech API (gratis) > Whisper (pago, fallback)
        // ========================================
        let transcript = '';

        if (webSpeechTranscript && webSpeechTranscript.length > 50) {
            // Caminho gratis: transcript ja veio pronto do Chrome Web Speech API
            transcript = webSpeechTranscript;
            console.log(`[process-meeting-audio] Using Web Speech API transcript (${transcript.length} chars) - Whisper SKIPPED`);
        } else if (audioFile && OPENAI_API_KEY) {
            // Fallback pago: transcrever com Whisper
            console.log(`[process-meeting-audio] No Web Speech transcript, falling back to Whisper...`);
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
            transcript = whisperResult.text;
        } else {
            throw new Error('Nenhum transcript disponivel: Web Speech vazio e Whisper sem API key.');
        }

        console.log(`Transcript length: ${transcript.length} chars`);

        // ========================================
        // STEP 2: Classify and Generate Smart Artifacts with GPT
        // ========================================
        const analysisResponse = await withAutoRetry(() => fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4-mini',
                response_format: { type: 'json_object' },
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
    "email": "email se mencionado, senão null",
    "cargo": "cargo se mencionado, senão null",
    "segmento_mercado": "segmento explicitamente mencionado ou null"
  },
  "resumo_executivo": "3-5 frases resumindo Fielmente a reunião",

  // EXTRAÇÃO DE INTELIGÊNCIA (CRÍTICO PARA STRATEGIC PLAN)
  "inteligencia_estrategica": {
    "concorrentes_mencionados": [
        {"nome": "Nome Concorrente", "url": "url se mencionada", "contexto": "pq foi citado"}
    ],
    "referencias_benchmarking": ["Empresa Ref 1", "Empresa Ref 2"],
    "desafios_especificos": ["Desafio real 1 narrado pelo cliente"],
    "ojectivos_curto_prazo": ["Obj real 1", "Obj real 2"],
    "stack_tecnologica": ["CRM X", "Ads Y"]
  },
  
  // SE FOR PROPOSTA
  "proposta": {
    "visao_projeto": "Visão literal baseada na transcrição...",
    "escopo_sugerido": ["Item discutido 1"],
    "timeline_sugerida": [
      {"fase": "Nome", "duracao": "tempo", "entregas": ["a", "b"]}
    ],
    "investimento_estimado": { "range_min": 0, "range_max": 0, "justificativa": "Apenas se falado" },
    "proximos_passos": [],
    "objecoes_detectadas": ["Ex: 'Achou o preço alto', 'Precisa falar com o sócio'"],
    "sinais_compra": ["Ex: 'Pediu o contrato', 'Gostou do escopo'"],
    "score_fechamento": 0 // de 0 a 100
  },
  
  // SE FOR KICKOFF OU ONBOARDING - Foco em Planejamento Estratégico
  "kickoff_data": {
    "contexto_cliente": "Resumo profundo do contexto narrado",
    "pontos_fortes": ["Ponto 1 narrado"],
    "gargalos_atuais": ["Gargalo 1 narrado"],
    "definicao_sucesso": "O que o cliente disse expressamente que é sucesso para ele?",
    "personas_alvo": [
        {"nome": "Persona 1 citada", "papel": "Decisor", "dor_principal": "X"}
    ],
    "cronograma_macrometras": [
        {"mes": 1, "foco": "X discutido"}
    ],
    "stakeholders": [{"nome": "X", "papel": "Y"}],
    "riscos_mapeados": ["Risco expresso na call"]
  },
  
  "acoes_proximas": ["Ação concreta 1", "Ação concreta 2"],
  "sentimento": "positivo" | "neutro" | "negativo",
  "score_engajamento": 0 // 0 a 100
}

REGRAS (ESCUDO ANTI-ALUCINAÇÃO E STRICT FIDELITY):
- PRINCÍPIO DA EXTRAÇÃO FIEL (ZERO INFERENCE): VOCÊ É ESTRITAMENTE PROIBIDO de deduzir, supor ou inventar dores, budgets, métricas financeiras, ferramentas da stack ou concorrentes se o cliente não os verbalizou textualmente na call. Responda com um array vazio ou 'null' caso o dado nunca tenha sido citado. Isso é crítico.
- Se for Kickoff/Onboarding/Start, classifique como "kickoff" e preencha "kickoff_data" e "inteligencia_estrategica" SOMENTE com o que foi confessado no áudio.
- Seja técnico e avalie QUEM demonstrou as objeções.
- NUNCA use o caractere em dash (traco longo). Use hifen simples (-).`
                    },
                    {
                        role: 'user',
                        content: `Título da reunião: ${meetTitle}\n\nTranscrição completa:\n${transcript.substring(0, 15000)}`
                    }
                ],
                temperature: 0.4,
                max_tokens: 3000,
            }),
        }));

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
        // STEP 3: Resolve Client and Project Links (Before Inserting)
        // ========================================
        // Estrategia de vinculo (prioridade decrescente):
        //   1. explicitProjectId passado pela extensao (confiavel)
        //   2. ILIKE por email/empresa extraido pelo GPT no clients + rei_projects ativos
        //   3. Match direto em rei_projects com status 'lead' ou 'diagnostic' (oportunidades top-of-funnel)
        let resolvedProjectId: string | null = null;
        let resolvedClientId: string | null = null;
        let existingData: any = {};
        // Tracking: 'explicit' | 'client_match' | 'opportunity_match' | 'unlinked'
        let linkStatus: string = 'unlinked';
        // Se o match foi com oportunidade (lead/diagnostic), nao com projeto ativo
        let isOpportunityMatch = false;

        if (explicitProjectId) {
            // Caminho feliz: extensao informou o projeto antes de gravar
            const { data: proj } = await supabaseClient
                .from('rei_projects')
                .select('id, client_id, diagnostic_data, status')
                .eq('id', explicitProjectId)
                .single();

            if (proj) {
                resolvedProjectId = proj.id;
                resolvedClientId = proj.client_id || null;
                existingData = proj.diagnostic_data || {};
                linkStatus = 'explicit';
                isOpportunityMatch = (proj.status === 'lead' || proj.status === 'diagnostic');
                console.log(`[process-meeting-audio] Project resolved via explicit id: ${resolvedProjectId} (status: ${proj.status})`);
            } else {
                console.warn(`[process-meeting-audio] explicitProjectId ${explicitProjectId} not found in rei_projects`);
            }
        } else {
            // Fallback: tentativa por ILIKE no nome/email extraido pelo GPT
            const clientInfo = analysis.cliente || analysis.cliente_identificado || {};

            if (clientInfo?.empresa || clientInfo?.email) {
                let clientQuery = supabaseClient.from('clients').select('id, name');

                if (clientInfo.email) {
                    clientQuery = clientQuery.ilike('email', `%${clientInfo.email}%`);
                } else if (clientInfo.empresa) {
                    clientQuery = clientQuery.ilike('name', `%${clientInfo.empresa}%`);
                }

                const { data: matchingClients } = await clientQuery.limit(1);

                if (matchingClients && matchingClients.length > 0) {
                    resolvedClientId = matchingClients[0].id;
                    const { data: projects } = await supabaseClient
                        .from('rei_projects')
                        .select('id, client_id, diagnostic_data, status')
                        .eq('client_id', resolvedClientId)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (projects && projects.length > 0) {
                        resolvedProjectId = projects[0].id;
                        existingData = projects[0].diagnostic_data || {};
                        linkStatus = 'client_match';
                        isOpportunityMatch = (projects[0].status === 'lead' || projects[0].status === 'diagnostic');
                        console.log(`[process-meeting-audio] Project resolved via ILIKE: ${resolvedProjectId} (status: ${projects[0].status})`);
                    }
                } else {
                    console.warn(`[process-meeting-audio] No client matched via ILIKE.`);
                }
            }

            // ── STEP 3b: Fallback - match diretamente em rei_projects (oportunidades/leads) ──
            // Se nao encontrou via clients, tenta match direto no rei_projects
            // pelo client_email ou client_company (leads criados pelo GHL webhook)
            if (!resolvedProjectId && (clientInfo?.email || clientInfo?.empresa)) {
                console.log(`[process-meeting-audio] No active project found. Trying opportunity match in rei_projects (lead/diagnostic)...`);

                let oppQuery = supabaseClient
                    .from('rei_projects')
                    .select('id, client_id, client_email, client_company, diagnostic_data, status')
                    .in('status', ['lead', 'diagnostic']);

                if (clientInfo.email) {
                    oppQuery = oppQuery.ilike('client_email', `%${clientInfo.email}%`);
                } else if (clientInfo.empresa) {
                    oppQuery = oppQuery.ilike('client_company', `%${clientInfo.empresa}%`);
                }

                const { data: opportunities } = await oppQuery
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (opportunities && opportunities.length > 0) {
                    const opp = opportunities[0];
                    resolvedProjectId = opp.id;
                    resolvedClientId = opp.client_id || null;
                    existingData = opp.diagnostic_data || {};
                    linkStatus = 'opportunity_match';
                    isOpportunityMatch = true;
                    console.log(`[process-meeting-audio] Opportunity matched: ${opp.id} (status: ${opp.status}, email: ${opp.client_email}, company: ${opp.client_company})`);
                } else {
                    console.warn(`[process-meeting-audio] No opportunity matched. Recording will be saved as unlinked.`);
                }
            }
        }

        console.log(`[process-meeting-audio] Link resolution: status=${linkStatus}, projectId=${resolvedProjectId}, isOpportunity=${isOpportunityMatch}`);

        // ========================================
        // STEP 4: Save Recording to DB
        // ========================================
        const { data: recording, error: recordingError } = await supabaseClient
            .from('meeting_recordings')
            .insert({
                title: meetTitle || 'Reuniao sem titulo',
                transcript: transcript,
                ai_summary: analysis.resumo_executivo,
                ai_insights: analysis,
                happened_at: recordedAt || new Date().toISOString(),
                transcript_status: 'completed',
                rei_project_id: resolvedProjectId,
                client_id: resolvedClientId
            })
            .select()
            .single();

        if (recordingError) {
            console.error('Error saving recording:', recordingError);
            throw new Error(`Database Insert Error: ${recordingError.message}`);
        }

        if (resolvedProjectId) {
            const projectId = resolvedProjectId;

            // ── ENRICHMENT BRANCH A: Active projects (existing behavior) ──
            if (!isOpportunityMatch) {

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
                                diagnostic_data: proposalData,
                                last_meeting_at: new Date().toISOString(),
                            })
                            .eq('id', projectId);

                        console.log(`[process-meeting-audio] Saved PROPOSAL artifacts to project ${projectId}`);
                        console.log(`[process-meeting-audio] Scope items: ${analysis.proposta.escopo_sugerido?.length || 0}, Timeline phases: ${analysis.proposta.timeline_sugerida?.length || 0}`);


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
                                diagnostic_data: onboardingData,
                                last_meeting_at: new Date().toISOString(),
                            })
                            .eq('id', projectId);

                        console.log(`[process-meeting-audio] Saved KICKOFF/ONBOARDING artifacts to project ${projectId}`);

                        // TRIGGER 1: Auto-fill REI form fields from transcript
                        if (recording?.id) {
                            try {
                                console.log(`[process-meeting-audio] Triggering fill-rei-from-transcript for recording ${recording.id}`);
                                const { error: fillError } = await supabaseClient.functions.invoke('fill-rei-from-transcript', {
                                    body: { recordingId: recording.id, projectId }
                                });
                                if (fillError) console.error('[process-meeting-audio] fill-rei-from-transcript failed:', fillError);
                                else console.log('[process-meeting-audio] REI auto-fill triggered successfully');
                            } catch (fillErr) {
                                console.error('[process-meeting-audio] Failed to invoke fill-rei-from-transcript:', fillErr);
                            }
                        }

                        // TRIGGER 2: Strategic plan enrichment & generation
                        try {
                            console.log(`[process-meeting-audio] Triggering Post-Kickoff Enrichment for ${projectId}`);

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

                            if (invokeError) console.error("[process-meeting-audio] Trigger enrichment failed:", invokeError);
                            else console.log("[process-meeting-audio] Enrichment triggered successfully");

                        } catch (err) {
                            console.error("[process-meeting-audio] Failed to invoke enrichment:", err);
                        }
                    }

            } else {
                // ── ENRICHMENT BRANCH B: Opportunity/Lead enrichment (top-of-funnel) ──
                // This branch handles rei_projects with status 'lead' or 'diagnostic'.
                // These are prospects who booked a diagnostic call via GHL but have not
                // yet signed as clients.
                console.log(`[process-meeting-audio] Enriching OPPORTUNITY ${projectId} (top-of-funnel lead)`);

                const clientInfo = analysis.cliente || analysis.cliente_identificado || {};
                const strategicIntel = analysis.inteligencia_estrategica || {};

                if (analysis.tipo_reuniao === 'proposta' && analysis.proposta) {
                    // PROPOSTA meeting on a lead - enrich with sales intelligence
                    // This is the critical path: diagnostic call where we pitch the service
                    const opportunityEnrichment = {
                        ...existingData,
                        opportunity_data: {
                            score_fechamento: analysis.proposta.score_fechamento || 0,
                            sinais_compra: analysis.proposta.sinais_compra || [],
                            objecoes_detectadas: analysis.proposta.objecoes_detectadas || [],
                            investimento_estimado: analysis.proposta.investimento_estimado || {},
                            visao_projeto: analysis.proposta.visao_projeto || '',
                            escopo_sugerido: analysis.proposta.escopo_sugerido || [],
                            timeline_sugerida: analysis.proposta.timeline_sugerida || [],
                            proximos_passos: analysis.proposta.proximos_passos || [],
                            sentimento: analysis.sentimento || 'neutro',
                            score_engajamento: analysis.score_engajamento || 0,
                            enriched_at: new Date().toISOString(),
                            meeting_id: recording?.id,
                        },
                        client_profile: {
                            nome_contato: clientInfo.nome_contato || '',
                            empresa: clientInfo.empresa || '',
                            email: clientInfo.email || '',
                            cargo: clientInfo.cargo || '',
                            segmento_mercado: clientInfo.segmento_mercado || '',
                        },
                        strategic_intelligence: strategicIntel,
                        last_meeting_summary: analysis.resumo_executivo,
                    };

                    await supabaseClient
                        .from('rei_projects')
                        .update({
                            diagnostic_data: opportunityEnrichment,
                            last_meeting_at: new Date().toISOString(),
                        })
                        .eq('id', projectId);

                    console.log(`[process-meeting-audio] Enriched OPPORTUNITY with proposta data: score_fechamento=${analysis.proposta.score_fechamento}, sinais=${analysis.proposta.sinais_compra?.length || 0}, objecoes=${analysis.proposta.objecoes_detectadas?.length || 0}`);

                } else {
                    // Any other meeting type on a lead - save general intelligence
                    const generalEnrichment = {
                        ...existingData,
                        meeting_intelligence: {
                            tipo_reuniao: analysis.tipo_reuniao,
                            resumo: analysis.resumo_executivo || '',
                            acoes_proximas: analysis.acoes_proximas || [],
                            sentimento: analysis.sentimento || 'neutro',
                            score_engajamento: analysis.score_engajamento || 0,
                            enriched_at: new Date().toISOString(),
                            meeting_id: recording?.id,
                        },
                        client_profile: {
                            nome_contato: clientInfo.nome_contato || '',
                            empresa: clientInfo.empresa || '',
                            email: clientInfo.email || '',
                            cargo: clientInfo.cargo || '',
                            segmento_mercado: clientInfo.segmento_mercado || '',
                        },
                        strategic_intelligence: strategicIntel,
                        last_meeting_summary: analysis.resumo_executivo,
                    };

                    await supabaseClient
                        .from('rei_projects')
                        .update({
                            diagnostic_data: generalEnrichment,
                            last_meeting_at: new Date().toISOString(),
                        })
                        .eq('id', projectId);

                    console.log(`[process-meeting-audio] Enriched OPPORTUNITY with general meeting data (type: ${analysis.tipo_reuniao})`);
                }
            }
        } // end if resolvedProjectId

        // ========================================
        // STEP 5: Auto-advance pipeline_stage based on meeting type
        // ========================================
        if (resolvedProjectId) {
            try {
                // Define the forward-only stage order
                const STAGE_ORDER = [
                    'lead_inbound',
                    'lead_qualified',
                    'diagnostic_done',
                    'proposal_draft',
                    'proposal_sent',
                    'proposal_viewed',
                    'negotiation',
                    'won',
                    'onboarding',
                    'active',
                    'completed',
                ];

                // Fetch current pipeline_stage
                const { data: currentProject } = await supabaseClient
                    .from('rei_projects')
                    .select('pipeline_stage')
                    .eq('id', resolvedProjectId)
                    .single();

                const currentStage = currentProject?.pipeline_stage || 'lead_inbound';
                const currentIdx = STAGE_ORDER.indexOf(currentStage);

                let targetStage: string | null = null;
                let stageNote = '';

                const meetingType = (analysis.tipo_reuniao || '').toLowerCase().trim();

                // Rule 1: "proposta" meeting + stage is lead_qualified or diagnostic_done
                //   -> advance to diagnostic_done (they had the diagnostic call)
                if (meetingType === 'proposta' && (currentStage === 'lead_qualified' || currentStage === 'lead_inbound')) {
                    targetStage = 'diagnostic_done';
                    stageNote = 'Auto-advanced: proposta meeting detected via process-meeting-audio';
                }

                // Rule 2: "kickoff" or "onboarding" meeting + stage is won or onboarding
                //   -> advance to onboarding
                if ((meetingType === 'kickoff' || meetingType === 'onboarding') && (currentStage === 'won' || currentStage === 'onboarding')) {
                    targetStage = 'onboarding';
                    stageNote = `Auto-advanced: ${meetingType} meeting detected via process-meeting-audio`;
                }

                // Rule 3: "proposta" + high score_fechamento (>= 70)
                //   -> if stage is proposal_sent or proposal_viewed, advance to negotiation
                const scoreFechamento = analysis.proposta?.score_fechamento || 0;
                if (meetingType === 'proposta' && scoreFechamento >= 70) {
                    if (currentStage === 'proposal_sent' || currentStage === 'proposal_viewed') {
                        targetStage = 'negotiation';
                        stageNote = `Auto-advanced: proposta meeting with high score_fechamento (${scoreFechamento}/100) via process-meeting-audio`;
                    }
                }

                // Rule 4: "proposta" meeting + stage is diagnostic_done
                //   -> advance to proposal_draft (diagnostico feito, call de proposta aconteceu)
                if (meetingType === 'proposta' && currentStage === 'diagnostic_done') {
                    targetStage = 'proposal_draft';
                    stageNote = 'Auto-advanced: proposta meeting after diagnostic via process-meeting-audio';
                }

                // Rule 5: "proposta" meeting + stage is proposal_draft
                //   -> advance to proposal_sent (proposta foi apresentada ao vivo na call)
                if (meetingType === 'proposta' && currentStage === 'proposal_draft') {
                    targetStage = 'proposal_sent';
                    stageNote = 'Auto-advanced: proposta presented live in meeting via process-meeting-audio';
                }

                // Only advance if target is forward from current position
                if (targetStage) {
                    const targetIdx = STAGE_ORDER.indexOf(targetStage);

                    if (targetIdx > currentIdx) {
                        console.log(`[process-meeting-audio] Pipeline stage advancing: ${currentStage} -> ${targetStage}`);

                        await supabaseClient
                            .from('rei_projects')
                            .update({ pipeline_stage: targetStage })
                            .eq('id', resolvedProjectId);

                        try {
                            await supabaseClient
                                .from('pipeline_stage_history')
                                .insert({
                                    rei_project_id: resolvedProjectId,
                                    from_stage: currentStage,
                                    to_stage: targetStage,
                                    changed_at: new Date().toISOString(),
                                    changed_by: 'process_meeting_audio',
                                    notes: stageNote,
                                });

                            console.log(`[process-meeting-audio] Pipeline stage history recorded: ${currentStage} -> ${targetStage}`);
                        } catch (historyErr: any) {
                            console.error(`[process-meeting-audio] pipeline_stage_history insert failed (non-blocking): ${historyErr.message}`);
                        }
                    } else {
                        console.log(`[process-meeting-audio] Pipeline stage NOT advanced (would go backward): current=${currentStage} (idx ${currentIdx}), target=${targetStage} (idx ${targetIdx})`);
                    }
                }
            } catch (stageErr: any) {
                // Non-blocking - pipeline stage advancement is not critical
                console.error(`[process-meeting-audio] Pipeline stage advancement failed (non-blocking): ${stageErr.message}`);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            recordingId: recording?.id,
            meetingType: analysis.tipo_reuniao,
            summary: analysis.resumo_executivo,
            clientIdentified: analysis.cliente || analysis.cliente_identificado || null,
            linkStatus,
            isOpportunity: isOpportunityMatch,
            projectId: resolvedProjectId,
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
