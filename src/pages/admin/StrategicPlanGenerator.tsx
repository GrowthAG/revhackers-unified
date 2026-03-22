import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Eye, BrainCircuit, Loader2, Users, TrendingUp, Target, ShieldAlert, BadgeCheck, FileText, ExternalLink, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ProjectTimeline } from '@/components/admin/ProjectTimeline';
import { StrategicEnrichmentService, StrategicEnrichmentResult } from '@/services/StrategicEnrichmentService';
import { DiagnosticService } from '@/services/DiagnosticService';
import { getMaterialsByProject, ReiMaterial } from '@/api/reiMaterials';

interface REIProject {
    id: string;
    client_id: string;
    data: any;
}

interface Client {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
}

export default function StrategicPlanGenerator() {
    const { reiProjectId } = useParams<{ reiProjectId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [isDeepResearching, setIsDeepResearching] = useState<string | null>(null);
    const [reiProject, setREIProject] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [existingPlan, setExistingPlan] = useState<any>(null);
    const [enrichedData, setEnrichedData] = useState<StrategicEnrichmentResult | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState<any>(null);
    const [errorLog, setErrorLog] = useState<string | null>(null);
    const [materials, setMaterials] = useState<ReiMaterial[]>([]);
    const [copiedLink, setCopiedLink] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisDone, setSynthesisDone] = useState(false);
    const [pendingJob, setPendingJob] = useState<any>(null);

    // Escuta mudanças na tabela ai_generation_jobs em background
    useEffect(() => {
        if (!reiProjectId) return;

        const checkJobs = async () => {
            const { data } = await supabase
                .from('ai_generation_jobs')
                .select('*')
                .eq('project_id', reiProjectId)
                .in('status', ['pending', 'processing', 'completed'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setPendingJob(data);
                if (data.status === 'completed') {
                    finalizePlanFromJob(data);
                } else if (!generating) {
                    setGenerating(true);
                }
            }
        };

        checkJobs();

        const channel = supabase
            .channel(`public:ai_generation_jobs:project_id=eq.${reiProjectId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'ai_generation_jobs',
                filter: `project_id=eq.${reiProjectId}`
            }, (payload) => {
                const updatedJob = payload.new;
                setPendingJob(updatedJob);
                if (updatedJob.status === 'completed') {
                    finalizePlanFromJob(updatedJob);
                } else if (updatedJob.status === 'failed') {
                    setGenerating(false);
                    setErrorLog(updatedJob.error_log || 'A IA falhou em background.');
                }
            }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [reiProjectId]);

    const finalizePlanFromJob = async (jobPayload: any) => {
        try {
            setGenerating(true);
            
            // Re-fetch the job directly from the DB to ensure we have the full JSONB payloads
            // Supabase Realtime sometimes omits extremely large columns in `payload.new`
            const { data: job, error: fetchError } = await supabase
                .from('ai_generation_jobs')
                .select('*')
                .eq('id', jobPayload.id)
                .single();
                
            if (fetchError || !job) throw new Error('Falha ao recuperar os dados completos do Job.');

            const aiPlanData = job.result_data as any;
            const context_data = job.context_data as any;
            if (!context_data) throw new Error('O job nao tem context_data salvo no banco de dados.');

            const {
                diagnosticResponse, marketCtx, projectType, clientId,
                personaData, enrichmentResult, normalizedAnswers, aiSuccess
            } = context_data;

            const fullDiagnostic = DiagnosticService.generateDiagnosis(diagnosticResponse, marketCtx, projectType, aiPlanData);
            const { plan_data, ...diagnosticContext } = fullDiagnostic;
            const { market_intelligence, ...dbSafePlanData } = plan_data;

            const finalPlanData = {
                ...dbSafePlanData,
                onboarding_data: aiPlanData?.onboarding_data || null,
                persona_data: personaData,
                rei_project_id: reiProjectId,
                client_id: clientId,
                created_by: (await supabase.auth.getUser()).data.user?.id,
                status: existingPlan ? existingPlan.status : 'draft',
                diagnostic_data: {
                    ...diagnosticContext,
                    executive_summary: aiPlanData?.executive_summary || diagnosticContext.executive_summary || null,
                    current_vs_future: aiPlanData?.current_vs_future || diagnosticContext.current_vs_future || null,
                    quick_wins: aiPlanData?.quick_wins || diagnosticContext.quick_wins || null,
                    thesis_statement: aiPlanData?.thesis_statement || diagnosticContext.thesis_statement || null,
                    context_mirror: aiPlanData?.context_mirror || diagnosticContext.context_mirror || null,
                    signals: aiPlanData?.signals || diagnosticContext.signals || null,
                    risks: aiPlanData?.risks || diagnosticContext.risks || null,
                    decisions: aiPlanData?.decisions || diagnosticContext.decisions || null,
                    pillars: aiPlanData?.pillars || diagnosticContext.pillars || null,
                    thesis_pillars: aiPlanData?.thesis_pillars || diagnosticContext.thesis_pillars || null,
                    methodology_steps: aiPlanData?.methodology_steps || diagnosticContext.methodology_steps || null,
                    roadmap_phases: aiPlanData?.roadmap_phases || diagnosticContext.roadmap_phases || null,
                    okrs: aiPlanData?.okrs || diagnosticContext.okrs || null,
                    summary: aiPlanData?.summary || diagnosticContext.summary || null,
                    scores: reiProject?.site_analysis?.ai_analysis?.technical_scores || diagnosticContext.scores,
                    stack: reiProject?.site_analysis?.ai_analysis?.tech_stack || diagnosticContext.stack,
                    enriched_analysis: enrichmentResult,
                    market_intelligence: market_intelligence || null,
                    ai_base_success: true,
                    form_data: {
                        revops_custom_pipelines: normalizedAnswers.revops_custom_pipelines || [],
                        revops_custom_lost_reasons: normalizedAnswers.revops_custom_lost_reasons || [],
                    },
                } as any
            };

            // Use explicit insert or update depending on existingPlan to avoid ON CONFLICT errors
            let upserted;
            if (existingPlan?.id) {
                const { data, error } = await supabase
                    .from('strategic_plans')
                    .update(finalPlanData)
                    .eq('id', existingPlan.id)
                    .select()
                    .single();
                if (error) throw error;
                upserted = data;
            } else {
                // Generate a consistent ID for the new plan
                const newPlanId = crypto.randomUUID();
                const { data, error } = await supabase
                    .from('strategic_plans')
                    .insert({ ...finalPlanData, id: newPlanId })
                    .select()
                    .single();
                if (error) throw error;
                upserted = data;
            }

            setExistingPlan(upserted);
            
            // Mark the job as completed
            await supabase.from('ai_generation_jobs').update({ status: 'merged' }).eq('id', job.id);
            setPendingJob(null);
            
            // Refresh data from DB to ensure UI updates with the newly created ID
            await loadData();
            
            if (aiSuccess) {
                toast({ title: 'Sucesso', description: 'Planejamento estratégico gerado com Inteligência de Mercado no Background!' });
            } else {
                toast({ title: 'Sucesso', description: 'Planejamento base finalizado no Background!' });
            }
        } catch (e: any) {
            console.error('Finalization error:', e);
            setErrorLog(`Falha na Montagem do Job Background: ${e.message}`);
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [reiProjectId]);

    useEffect(() => {
        if (enrichedData) {
            setEditedData(JSON.parse(JSON.stringify(enrichedData)));
        }
    }, [enrichedData]);

    async function loadData() {
        if (!reiProjectId) return;

        try {
            // Load REI Project
            const { data: projectData, error: projectError } = await supabase
                .from('rei_projects')
                .select('*')
                .eq('id', reiProjectId)
                .single();

            if (projectError) throw projectError;
            setREIProject(projectData);

            // Load Client (Resilient)
            let clientFinal = null;
            const project = projectData as any;
            if (project.client_id) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', project.client_id)
                    .maybeSingle();

                if (clientData) {
                    clientFinal = clientData;
                }
            }

            // Fallback: If no related client found, use the data stored in the project itself
            if (!clientFinal) {
                clientFinal = {
                    id: 'legacy-or-missing',
                    company_name: project.client_company || project.client_name || 'N/A',
                    contact_name: project.client_name || 'N/A',
                    email: project.client_email || 'N/A',
                    logo_url: '/revhackers-logo.png' // Default fallback
                };
            }

            setClient(clientFinal);

            // Check if plan already exists
            const { data: planData } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('rei_project_id', reiProjectId)
                .maybeSingle();

            if (planData) {
                setExistingPlan(planData);
                // Extract enriched data from diagnostic_data if available
                const diagData = planData.diagnostic_data as any;
                if (diagData?.enriched_analysis) {
                    setEnrichedData(diagData.enriched_analysis);
                }
            }

            // Load reference materials
            const mats = await getMaterialsByProject(reiProjectId);
            setMaterials(mats);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveEdits() {
        if (!existingPlan || !editedData) return;
        setSending(true);
        try {
            const diagData = { ...(existingPlan.diagnostic_data as any) };
            diagData.enriched_analysis = editedData;

            const { data: updated, error } = await supabase
                .from('strategic_plans')
                .update({
                    diagnostic_data: diagData as any,
                    // If client updated logo, we might want to update it in the client table too
                    // but for now let's just save it in the plan context if needed
                })
                .eq('id', existingPlan.id)
                .select()
                .single();

            if (error) throw error;
            setExistingPlan(updated);
            setEnrichedData(editedData);
            setEditMode(false);
            toast({ title: 'Salvo', description: 'Alterações salvas com sucesso!' });
        } catch (error) {
            console.error('Save failed:', error);
            toast({ title: 'Erro', description: 'Erro ao salvar as alterações.', variant: 'destructive' });
        } finally {
            setSending(false);
        }
    }

    async function handleUpdateLogo(newLogoUrl: string) {
        if (!client || client.id === 'legacy-or-missing') return;
        try {
            const { error } = await supabase
                .from('clients')
                .update({ logo_url: newLogoUrl })
                .eq('id', client.id);
            if (error) throw error;
            setClient({ ...client, logo_url: newLogoUrl });
            toast({ title: 'Logo atualizada!' });
        } catch (error) {
            console.error('Logo update failed:', error);
        }
    }

    async function handleGenerate() {
        if (!reiProjectId || !reiProject) return;

        setGenerating(true);

        try {
            // 1. Fetch REI Responses first - needed for email resolution and CRM Ops normalization
            console.log('Fetching latest REI responses...');
            const { data: latestResponse } = await supabase
                .from('rei_responses')
                .select('*')
                .eq('project_id', reiProjectId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!latestResponse) {
                toast({ title: 'Erro', description: 'Nenhuma resposta do REI encontrada para este projeto.', variant: 'destructive' });
                setGenerating(false);
                return;
            }

            const rawResponses = latestResponse.responses as any;
            // FIX: REI wizard wraps form data inside responses.form_data
            // Legacy responses may have flat structure, so fallback to rawResponses
            const answers = rawResponses?.form_data || rawResponses || {};

            // CRM Ops normalization: inject standard camelCase field names alongside revops_* so
            // DiagnosticService (generateProjections, generateBudget, etc.) reads correct values
            const isCrmOps = reiProject?.type === 'crm_ops';
            const normalizedAnswers = isCrmOps ? {
                ...answers,
                // Financial metrics - DiagnosticService reads camelCase names
                mrr: answers.revops_mrr_atual || answers.mrr || '',
                ticketMedio: answers.revops_ticket_medio || answers.ticketMedio || '',
                cacAtual: answers.revops_cac_atual || answers.cacAtual || '',
                taxaChurn: answers.taxaChurn || '',
                metaCrescimento: 'entre_20_e_50', // RevOps default: operational scale target
                // Identity
                segmento: answers.revops_segmento || answers.segmento || '',
                empresa: answers.revops_empresa || '',
                nomeEmpresa: answers.revops_empresa || '',
                email: answers.revops_email || '',
                // Competitors - DiagnosticService reads concorrente1_nome (snake_case, no prefix)
                concorrente1_nome: answers.revops_concorrente1_nome || '',
                concorrente1_site: answers.revops_concorrente1_site || '',
                concorrente2_nome: answers.revops_concorrente2_nome || '',
                concorrente2_site: answers.revops_concorrente2_site || '',
                concorrente3_nome: answers.revops_concorrente3_nome || '',
                concorrente3_site: answers.revops_concorrente3_site || '',
            } : answers;

            // diagnosticResponse: latestResponse rebuilt with normalized form_data so
            // DiagnosticService.generateDiagnosis() reads correct fields for CRM Ops
            const diagnosticResponse = isCrmOps
                ? { ...latestResponse, responses: { ...(latestResponse.responses as any), form_data: normalizedAnswers } }
                : latestResponse;

            // Effective client identity - CRM Ops stores email/company in form, not in rei_projects
            const effectiveEmail = answers.revops_email || reiProject.client_email;
            const effectiveCompany = answers.revops_empresa || reiProject.client_company || reiProject.client_name;
            const effectiveName = reiProject.client_name || answers.revops_empresa || 'Cliente Sem Nome';

            // 2. Resolve Client ID (RPC bypass)
            let clientId = client?.id;

            if (!clientId || clientId === 'legacy-or-missing') {
                try {
                    console.log('Buscando cliente pelo email:', effectiveEmail);
                    const { data: existingClient, error: fetchError } = await supabase
                        .from('clients')
                        .select('id')
                        .eq('email', effectiveEmail)
                        .maybeSingle();

                    if (fetchError) {
                        console.warn('Erro ao buscar cliente:', fetchError);
                    }

                    if (existingClient && existingClient.id) {
                        clientId = existingClient.id;
                        console.log('Cliente encontrado com ID:', clientId);
                    } else {
                        console.log('Cliente não encontrado. Criando novo cliente lead...');
                        const { data: newClient, error: createClientError } = await supabase
                            .from('clients')
                            .insert({
                                email: effectiveEmail,
                                name: effectiveName,
                                company: effectiveCompany || effectiveName,
                                status: 'lead'
                            })
                            .select('id')
                            .single();

                        if (createClientError) {
                            console.error('Falha crítica ao criar cliente:', createClientError);
                            throw new Error(`Falha ao criar cliente atrelado: ${createClientError.message}`);
                        }

                        if (newClient) {
                            clientId = newClient.id;
                            console.log('Novo cliente criado com ID:', clientId);
                        }
                    }
                } catch (clientCreationCatchError: any) {
                    console.error('Erro na etapa 1 (Criação de Cliente):', clientCreationCatchError);
                    toast({ title: 'Falha de Vínculo', description: `Falha ao atrelar Perfil de Cliente neste Projeto REI: ${clientCreationCatchError.message}`, variant: 'destructive' });
                    setGenerating(false);
                    return;
                }
            }

            // Segment resolution: use company identity as primary signal
            const companyName = reiProject?.client_company || answers.revops_empresa || answers.companyName || answers.nome_empresa || '';
            const companySite = reiProject?.site_analysis?.url || answers.companySite || answers.revops_site || answers.site || '';
            const segmentFromAnswers = normalizedAnswers.segmento
                || normalizedAnswers.sector
                || normalizedAnswers.segmento_outro
                || '';
            
            // If we have company identity, use it to anchor the segment so the AI researches the REAL business
            const segment = (companyName && companySite)
                ? `${segmentFromAnswers || 'Identificar segmento real'} - Empresa: ${companyName} (${companySite}). Identifique o segmento real do negócio a partir do site antes de gerar qualquer análise.`
                : (companyName
                    ? `${segmentFromAnswers || 'Identificar segmento real'} - Empresa: ${companyName}. Pesquise o que esta empresa faz antes de gerar análise.`
                    : segmentFromAnswers || 'B2B');
            
            // Objective resolution: each REI type uses different field names for primary goal
            const objective = answers.revops_objetivo_principal   // crm_ops
                || answers.results12Months                        // consulting
                || answers.primaryGoal                            // dev
                || answers.successVision                          // founder
                || answers.metaCrescimento
                || answers.objetivoPrincipal
                || (isCrmOps ? 'Eficiência Operacional & Escala RevOps' : 'Crescimento');
            console.log('[Generator] segment:', segment, '| companyName:', companyName, '| companySite:', companySite);

            // Extract competitors from REI context if any (from Gap 2 addition)
            const competitorsList: { nome: string, url?: string }[] = [];
            if (normalizedAnswers.concorrente1_nome) competitorsList.push({ nome: normalizedAnswers.concorrente1_nome, url: normalizedAnswers.concorrente1_site });
            if (normalizedAnswers.concorrente2_nome) competitorsList.push({ nome: normalizedAnswers.concorrente2_nome, url: normalizedAnswers.concorrente2_site });
            if (normalizedAnswers.concorrente3_nome) competitorsList.push({ nome: normalizedAnswers.concorrente3_nome, url: normalizedAnswers.concorrente3_site });
            
            // Try AI enrichment (non-blocking)
            let enrichmentResult: any = { benchmark: null, personas: null, market: null };
            let aiSuccess = false;

            try {
                console.log('Invoking StrategicEnrichmentService...');
                const aiResult = await StrategicEnrichmentService.getFullEnrichment(segment, {
                    objective,
                    rei_responses: normalizedAnswers,
                    competitors: competitorsList.length > 0 ? competitorsList : undefined,
                    siteAnalysis: reiProject?.site_analysis || undefined,
                    projectType: reiProject?.type || 'consulting'
                });

                if (aiResult.error) {
                    console.warn('AI Enrichment returned error:', aiResult.error);
                } else if (aiResult.benchmark || aiResult.personas || aiResult.market) {
                    enrichmentResult = aiResult;
                    aiSuccess = true;
                    setEnrichedData(enrichmentResult);
                }
            } catch (aiError) {
                console.warn('AI Enrichment failed (non-blocking):', aiError);
            }

            // ── Map Perplexity personas → PersonaSection format ──────────────
            const mappedPersonas = (enrichmentResult.personas?.personas || []).map((p: any, i: number) => ({
                name: p.nome || `Persona ${i + 1}`,
                role: p.cargo || 'Decisor',
                age: p.idade ? parseInt(p.idade) : (35 + i * 5),
                location: 'Brasil',
                company_context: p.empresa_tipo || segment,
                bio: p.bio_curta || '',
                channels: p.canais_favoritos || ['LinkedIn', 'E-mail', 'WhatsApp'],
                personality: {
                    analytical_creative: 30 + (i * 20),
                    passive_active: 60 + (i * 10),
                    reserved_extroverted: 45 + (i * 15),
                    reactive_preventive: 40 + (i * 10)
                },
                pain: (p.dores_principais || []).join('. ') || 'A ser detalhado na consultoria.',
                trigger: (p.gatilhos_mentais || []).slice(0, 2).join('. ') || 'Pressão por resultados.',
                message: p.pitch_elevador || (p.ganhos_desejados || []).join(' - ') || 'Mensagem a ser definida.',
                wiifm: (p.ganhos_desejados || []).slice(0, 2).join('. ') || 'Resultado concreto e mensurável.',
            }));

            // ── Map Perplexity market → BenchmarkSection format ──────────────
            const mappedCompetitors = (enrichmentResult.market?.concorrentes_benchmark || []).map((c: any) => ({
                company_name: c.nome || 'Concorrente',
                domain: c.url || '',
                monthly_traffic: '-',
                domain_authority: 0,
                avg_cpc: '-',
                top_keywords: [],
                strengths: c.pontos_fortes || '',
                weaknesses: c.pontos_fracos || '',
            }));

            const mappedTrends = (enrichmentResult.market?.tendencias_2025 || []).map((t: any) =>
                typeof t === 'string' ? t : `${t.titulo}: ${t.descricao || t.impacto || ''}`
            );

            const mappedMarketSizing = {
                tam: enrichmentResult.market?.tam_sam_som?.tam || 'A ser definido na pesquisa profunda',
                sam: enrichmentResult.market?.tam_sam_som?.sam || 'A ser definido na pesquisa profunda',
                som: enrichmentResult.market?.tam_sam_som?.som || 'A ser definido na pesquisa profunda',
            };

            const mappedAdvice = enrichmentResult.market?.analise_swot_rapida
                ? `Oportunidades: ${(enrichmentResult.market.analise_swot_rapida.oportunidades || []).join('; ')}. Ameaças: ${(enrichmentResult.market.analise_swot_rapida.ameacas || []).join('; ')}.`
                : 'Foco em eficiência operacional e decisões baseadas em dados.';

            // ── REI-based fallbacks (used when Perplexity AI fails) ───────────
            // These are built from real client answers - uses normalizedAnswers so CRM Ops
            // fields (revops_*) are correctly mapped before DiagnosticService reads them.
            const reiFallbackPersonas = DiagnosticService.generatePersonasFromREI(normalizedAnswers);
            const reiFallbackCompetitors = DiagnosticService.generateBenchmarkFromREI(normalizedAnswers);
            const reiFallbackTrends = DiagnosticService.generateDefaultTrends(normalizedAnswers);

            if (!aiSuccess) {
                console.log(
                    `[Generator] Perplexity unavailable. Using REI fallback: ${reiFallbackPersonas.length} persona(s), ${reiFallbackCompetitors.length} competitor(s).`
                );
            }

            // ── Build persona_data (for PersonaSection + BenchmarkSection) ────
            // Priority: AI (Perplexity) > REI answers > undefined (frontend fallback)
            const personaData = {
                personas: mappedPersonas.length > 0
                    ? mappedPersonas
                    : (reiFallbackPersonas.length > 0 ? reiFallbackPersonas : undefined),
                competitor_benchmarks: mappedCompetitors.length > 0
                    ? mappedCompetitors
                    : (reiFallbackCompetitors.length > 0 ? reiFallbackCompetitors : undefined),
                industry_trends: mappedTrends.length > 0
                    ? mappedTrends
                    : reiFallbackTrends,
                market_sizing: mappedMarketSizing,
                strategic_advice: mappedAdvice,
                avg_cac_benchmark: enrichmentResult.benchmark?.cac_medio || undefined,
                conversion_benchmarks: enrichmentResult.benchmark
                    ? `Lead→SQL: ${enrichmentResult.benchmark.taxa_conversao || '-'} | Ciclo: ${enrichmentResult.benchmark.ciclo_vendas || '-'} | LTV:CAC: ${enrichmentResult.benchmark.ltv_cac_ratio || '-'}`
                    : undefined,
                key_differentiators: enrichmentResult.market?.analise_swot_rapida?.oportunidades || undefined,
                // Metadata: lets the frontend know where data came from
                _data_source: aiSuccess ? 'ai_enriched' : 'rei_fallback',
            };

            // Fallback market context (used by DiagnosticService)
            const marketCtx = {
                industry_trends: mappedTrends.length > 0 ? mappedTrends : ['Automação de vendas', 'Revenue Operations', 'IA Generativa aplicada a vendas'],
                competitor_benchmarks: mappedCompetitors,
                market_sizing: mappedMarketSizing,
                personas: mappedPersonas,
                strategic_advice: mappedAdvice,
            };

            // ── Background Job Setup ──
            const jobContext = {
                diagnosticResponse,
                marketCtx,
                projectType: reiProject?.type || 'consulting',
                clientId: clientId,
                personaData,
                enrichmentResult,
                normalizedAnswers,
                aiSuccess
            };

            const { data: newJob, error: jobError } = await supabase
                .from('ai_generation_jobs')
                .insert({
                    project_id: reiProjectId,
                    type: 'strategic_plan',
                    status: 'processing',
                    context_data: jobContext
                })
                .select()
                .single();

            if (jobError) throw jobError;
            setPendingJob(newJob);

            // ── AI Base Generation (GPT-4o via Edge Function) in Background ──
            console.log('Invoking Base AI Generation (GPT-4o) in background...');
            supabase.functions.invoke('generate-strategic-plan', {
                body: {
                    jobId: newJob.id,
                    rei_responses: answers,
                    segment: segment,
                    objective: objective,
                    isB2B: reiProject?.type === 'crm_ops' ? true : DiagnosticService['checkIsB2B'](answers),
                    projectType: reiProject?.type || 'consulting',
                    projectId: reiProjectId,
                    projectDuration: reiProject?.project_duration || undefined,
                    siteAnalysis: reiProject?.site_analysis || undefined,
                    enrichedIntelligence: aiSuccess ? {
                        personas: enrichmentResult.personas,
                        benchmark: enrichmentResult.benchmark,
                        market: enrichmentResult.market,
                    } : undefined,
                    clientName: reiProject?.client_name || '',
                    clientCompany: reiProject?.client_company || '',
                    tradeName: reiProject?.trade_name || undefined,
                }
            }).catch(err => {
                console.warn('Background AI trigger warning (HTTP may drop but execution continues):', err);
            });

            // We do NOT setGenerating(false) here, we leave it spinning. 
            // The realtime listener (or finalize function) will turn it off.

        } catch (error: any) {
            console.error('Error generating plan:', error);
            setErrorLog(`Falha na Iniciação do Job ou Enriquecimento: ${error.message} \nDetalhes: ${JSON.stringify(error)}`);
            setGenerating(false);
        }

    }

    async function handlePlanSynthesis(currentEnrichedData: StrategicEnrichmentResult) {
        if (!existingPlan || !reiProject) return;
        setIsSynthesizing(true);
        setSynthesisDone(false);

        try {
            const planData = existingPlan.diagnostic_data as any;
            const contextMirror = planData?.context_mirror || {};
            const formAnswers = reiProject.data || {};

            const enrichedContext = {
                ...formAnswers,
                segment: contextMirror.segment || formAnswers.segment || formAnswers.revops_segmento || '',
                objective: contextMirror.objective || formAnswers.objective || formAnswers.revops_objetivo || '',
                companyName: formAnswers.revops_empresa || formAnswers.empresa || formAnswers.companyName || client?.company_name || '',
                companySite: formAnswers.revops_site || formAnswers.site || formAnswers.companySite || '',
            };

            const segment = enrichedContext.segment || 'B2B Tech';
            const objective = enrichedContext.objective || 'crescimento';

            const synthesisResult = await StrategicEnrichmentService.researchIntelligence('synthesis' as any, segment, {
                objective,
                context: enrichedContext,
                siteAnalysis: reiProject?.site_analysis || undefined,
                projectType: reiProject?.type || 'consulting',
                enrichedData: {
                    market: currentEnrichedData?.market || null,
                    personas: currentEnrichedData?.personas || null,
                    benchmark: currentEnrichedData?.benchmark || null,
                }
            });

            if (synthesisResult?.executive_summary) {
                const diagData = { ...(existingPlan.diagnostic_data as any) };
                diagData.executive_summary = synthesisResult.executive_summary;

                if (synthesisResult.diagnostic_signals?.length > 0) {
                    diagData.enriched_analysis = {
                        ...(diagData.enriched_analysis || {}),
                        synthesis_signals: synthesisResult.diagnostic_signals,
                        strategic_opportunities: synthesisResult.strategic_opportunities || [],
                    };
                }

                await supabase
                    .from('strategic_plans')
                    .update({ diagnostic_data: diagData })
                    .eq('id', existingPlan.id);

                setExistingPlan((prev: any) => ({ ...prev, diagnostic_data: diagData }));
                setSynthesisDone(true);
                setTimeout(() => setSynthesisDone(false), 5000);
            }
        } catch (e: any) {
            console.error('Plan synthesis failed:', e);
        } finally {
            setIsSynthesizing(false);
        }
    }

    async function handleDeepResearch(type: 'benchmark' | 'personas' | 'market') {

        if (!reiProjectId || !reiProject) return;
        setIsDeepResearching(type);
        try {
            // Fetch actual REI responses (reiProject.data is null for most projects)
            const { data: latestResp } = await supabase
                .from('rei_responses')
                .select('responses')
                .eq('project_id', reiProjectId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const rawResp = (latestResp?.responses as any) || {};
            const answers = rawResp?.form_data || rawResp || {};

            // Build context from ALL available sources (priority order: form answers > reiProject.data > context_mirror)
            const contextMirror = (existingPlan?.diagnostic_data as any)?.context_mirror || {};
            const reiData = (reiProject?.data as any) || {};
            const contextData = Object.keys(answers).length > 0 ? answers : Object.keys(reiData).length > 0 ? reiData : {};

            const isCrmType = reiProject?.type === 'crm_ops';

            const companyName = reiProject?.client_company || reiProject?.client_name || contextData.revops_empresa || contextData.companyName || '';
            const companySite = reiProject?.client_site || contextData.revops_site || contextData.companySite || '';

            const segmentFromAnswers = contextData.revops_segmento || contextData.sector || contextData.segmento || '';
            const segmentFromMirror = contextMirror.segment || contextMirror.segmento || '';
            const objectiveFromAnswers = contextData.revops_objetivo_principal || contextData.results12Months || contextData.primaryGoal || contextData.successVision || '';
            const objectiveFromMirror = contextMirror.objective || '';

            // Build a rich context object merging context_mirror + form answers + company info
            const enrichedContext = {
                ...contextData,
                companyName,
                companySite,
                segmento: segmentFromAnswers || segmentFromMirror || '',
                objetivo: objectiveFromAnswers || objectiveFromMirror || 'Crescimento',
                maturidade_comercial: contextMirror.maturity,
                restricoes: contextMirror.restrictions,
            };

            // CRITICAL: When no segment was filled in the form and we have company context,
            // instruct the AI to infer the real segment from the company site -
            // NOT default to the consulting project type (crm_ops, founder, etc.).
            const hasCompanyContext = !!(companyName || companySite);
            const segment = segmentFromAnswers || segmentFromMirror
                || (hasCompanyContext
                    ? `Identificar segmento real de ${companyName} (site: ${companySite}) - nao informado no formulario`
                    : 'B2B Tech');

            const objective = objectiveFromAnswers || objectiveFromMirror || 'Crescimento';

            // Debug log - will appear in browser console
            console.log('[DeepResearch] Debug:', {
                type,
                reiProjectType: reiProject?.type,
                isCrmType,
                segment,
                objective,
                hasAnswers: Object.keys(answers).length > 0,
                hasContextMirror: Object.keys(contextMirror).length > 0,
                companyName: enrichedContext.companyName,
                companySite: enrichedContext.companySite,
            });


            // Extract competitors from normalized fields (try all sources)
            const competitors: { nome: string, url?: string }[] = [];
            const cn1 = enrichedContext.revops_concorrente1_nome || enrichedContext.concorrente1_nome;
            const cn2 = enrichedContext.revops_concorrente2_nome || enrichedContext.concorrente2_nome;
            const cn3 = enrichedContext.revops_concorrente3_nome || enrichedContext.concorrente3_nome;
            if (cn1) competitors.push({ nome: cn1, url: enrichedContext.revops_concorrente1_site || enrichedContext.concorrente1_site });
            if (cn2) competitors.push({ nome: cn2, url: enrichedContext.revops_concorrente2_site || enrichedContext.concorrente2_site });
            if (cn3) competitors.push({ nome: cn3, url: enrichedContext.revops_concorrente3_site || enrichedContext.concorrente3_site });

            const result = await StrategicEnrichmentService.researchIntelligence(type, segment, {
                objective,
                competitors,
                context: enrichedContext,
                siteAnalysis: reiProject?.site_analysis || undefined,
                projectType: reiProject?.type || 'consulting'
            });

            // Merge into existing plan
            if (existingPlan) {
                const diagData = { ...(existingPlan.diagnostic_data as any) };
                if (!diagData.enriched_analysis) diagData.enriched_analysis = {};
                
                // Keep the exact same interface shape as the initial generation
                if (type === 'market') {
                     diagData.enriched_analysis.market = {
                         ...(diagData.enriched_analysis.market || {}),
                         ...result
                     };
                } else if (type === 'benchmark') {
                     diagData.enriched_analysis.benchmark = {
                         ...(diagData.enriched_analysis.benchmark || {}),
                         ...result
                     };
                } else if (type === 'personas') {
                     diagData.enriched_analysis.personas = {
                         ...(diagData.enriched_analysis.personas || {}),
                         ...result
                     };
                }

                diagData.enriched_analysis.isDeepResearch = true;

                // Also update the UI-facing persona_data!
                const updatedPersonaData = { ...(existingPlan.persona_data || {}) };
                
                if (type === 'market') {
                     if (result.concorrentes_benchmark) {
                         updatedPersonaData.competitor_benchmarks = result.concorrentes_benchmark.map((c: any) => ({
                             company_name: c.nome || 'Concorrente',
                             domain: c.url || '',
                             monthly_traffic: '-',
                             domain_authority: 0,
                             avg_cpc: '-',
                             top_keywords: [],
                             strengths: c.pontos_fortes || '',
                             weaknesses: c.pontos_fracos || '',
                         }));
                     }
                     if (result.analise_swot_rapida) {
                         updatedPersonaData.strategic_advice = `Oportunidades: ${(result.analise_swot_rapida.oportunidades || []).join('; ')}. Ameaças: ${(result.analise_swot_rapida.ameacas || []).join('; ')}.`;
                         updatedPersonaData.key_differentiators = result.analise_swot_rapida.oportunidades;
                     }
                     if (result.tendencias_2025) {
                          updatedPersonaData.industry_trends = result.tendencias_2025.map((t: any) =>
                              typeof t === 'string' ? t : `${t.titulo}: ${t.descricao || t.impacto || ''}`
                          );
                     }
                     if (result.tam_sam_som) {
                          updatedPersonaData.market_sizing = result.tam_sam_som;
                     }
                } else if (type === 'benchmark') {
                     if (result.cac_medio) {
                          updatedPersonaData.avg_cac_benchmark = result.cac_medio;
                     }
                     const conv = [];
                     if (result.taxa_conversao) conv.push(`Conversão: ${result.taxa_conversao}`);
                     if (result.ciclo_vendas) conv.push(`Ciclo Médio: ${result.ciclo_vendas}`);
                     if (result.ltv_cac_ratio) conv.push(`LTV:CAC: ${result.ltv_cac_ratio}`);
                     if (conv.length > 0) {
                          updatedPersonaData.conversion_benchmarks = conv.join(' | ');
                     }

                } else if (type === 'personas' && result.personas) {
                     updatedPersonaData.personas = result.personas.map((p: any, i: number) => ({
                          name: p.nome || `Persona ${i + 1}`,
                          role: p.cargo || 'Decisor',
                          age: p.idade ? parseInt(p.idade) : (35 + i * 5),
                          location: 'Brasil',
                          company_context: p.empresa_tipo || segment,
                          bio: p.bio_curta || '',
                          channels: p.canais_favoritos || ['LinkedIn', 'E-mail', 'WhatsApp'],
                          personality: {
                              analytical_creative: 30 + (i * 20),
                              passive_active: 60 + (i * 10),
                              reserved_extroverted: 45 + (i * 15),
                              reactive_preventive: 40 + (i * 10)
                          },
                          pain: (p.dores_principais || []).join('. ') || 'A ser detalhado na consultoria.',
                          trigger: (p.gatilhos_mentais || []).slice(0, 2).join('. ') || 'Pressão por resultados.',
                          message: p.pitch_elevador || (p.ganhos_desejados || []).join(' - ') || 'Mensagem a ser definida.',
                          wiifm: (p.ganhos_desejados || []).slice(0, 2).join('. ') || 'Resultado concreto e mensurável.',
                     }));
                }

                const { data: updated, error } = await supabase
                    .from('strategic_plans')
                    .update({ 
                        diagnostic_data: diagData as any,
                        persona_data: updatedPersonaData as any 
                    })
                    .eq('id', existingPlan.id)
                    .select()
                    .single();

                if (error) throw error;
                setExistingPlan(updated);
                setEnrichedData(diagData.enriched_analysis);
                toast({ title: 'Sucesso', description: `Pesquisa Profunda de ${type} concluída!`, variant: 'default' });
            } else {
                toast({ title: 'Atenção', description: 'Gere o planejamento base primeiro antes de rodar a pesquisa profunda.', variant: 'default' });
            }
        } catch (error) {
            console.error('Deep research failed:', error);
            toast({ title: 'Erro', description: 'Falha na pesquisa profunda.', variant: 'destructive' });
        } finally {
            setIsDeepResearching(null);
        }
    }

    async function handleSendToClient() {
        if (!existingPlan || !client) return;
        setSending(true);
        try {
            const { error: updateError } = await supabase.from('strategic_plans').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', existingPlan.id);
            if (updateError) throw updateError;
            const clientLink = `${window.location.origin}/plan/${existingPlan.access_token}`;
            toast({ title: 'Sucesso', description: `Planejamento enviado! Link: ${clientLink}` });
            await loadData();
        } catch (error) {
            toast({ title: 'Erro', description: 'Erro ao enviar.', variant: 'destructive' });
        } finally {
            setSending(false);
        }
    }

    function handlePreview() {
        if (!existingPlan) return;
        window.open(`/plan/${existingPlan.access_token}`, '_blank');
    }

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    if (!reiProject || !client) return <div>Projeto não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <ProjectTimeline currentStage={existingPlan ? (existingPlan.status === 'sent' ? 3 : 2) : 2} reiDate={reiProject?.created_at} planDate={existingPlan?.created_at} />

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Button variant="ghost" onClick={() => navigate(`/admin/jornada/${reiProjectId}`)} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black mb-2 pl-0">
                            <ArrowLeft className="w-3 h-3 mr-2" /> Voltar para Jornada
                        </Button>
                        <h1 className="text-3xl font-bold text-black tracking-tight">Painel Estratégico</h1>
                        <p className="text-zinc-500">Cliente: <span className="font-semibold text-black">{client.company_name}</span></p>
                    </div>
                    <div className="flex gap-3">
                        {existingPlan && (
                            <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                                {editMode ? 'Cancelar Edição' : 'Editar Plano'}
                            </Button>
                        )}
                        {editMode ? (
                            <Button onClick={handleSaveEdits} disabled={sending} className="bg-zinc-900 text-white hover:bg-zinc-800">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                                Salvar Alterações
                            </Button>
                        ) : (
                            <Button onClick={handleGenerate} disabled={generating || !!pendingJob} className="bg-black text-white hover:bg-zinc-800">
                                {(generating || pendingJob) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                                {(generating || pendingJob) ? 'Gerando em Background...' : (existingPlan ? 'Regerar Inteligência Base' : 'Gerar Planejamento')}
                            </Button>
                        )}
                    </div>
                </div>

                {errorLog && (
                    <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 p-4 rounded-md mb-8 shadow-sm">
                        <h3 className="font-bold mb-2">Erro Crítico Reportado Pelo Sistema:</h3>
                        <p className="whitespace-pre-wrap font-mono text-sm">{errorLog}</p>
                    </div>
                )}

                {/* Materials Section */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                                Materiais do Cliente
                            </h3>
                            {materials.length > 0 && (
                                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                                    {materials.length}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    window.open(`/upload-materiais/${reiProjectId}`, '_blank');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-900 rounded-md text-[10px] font-bold uppercase tracking-widest text-white hover:bg-black transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Fazer Upload Agora
                            </button>
                            <button
                                onClick={() => {
                                    const uploadUrl = `${window.location.origin}/upload-materiais/${reiProjectId}`;
                                    navigator.clipboard.writeText(uploadUrl);
                                    setCopiedLink(true);
                                    setTimeout(() => setCopiedLink(false), 2000);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                            >
                                {copiedLink ? <Check className="w-3 h-3 text-[#00CC6A]" /> : <Copy className="w-3 h-3" />}
                                {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
                            </button>
                        </div>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-6 text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
                            Nenhum material adicionado. Clique em &quot;Fazer Upload Agora&quot; ou envie o link para o cliente.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {materials.map(mat => (
                                <div key={mat.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 rounded-lg">
                                    {mat.source_type === 'link' ? (
                                        <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 truncate">{mat.original_name || 'Material'}</p>
                                        {mat.description && <p className="text-[11px] text-zinc-400 truncate">{mat.description}</p>}
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">{mat.material_type}</span>
                                    {mat.file_url && mat.source_type === 'link' && (
                                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600">
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editMode && (
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-zinc-500" />
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Modo de Edição Ativo</p>
                                <p className="text-xs text-zinc-500">Você está alterando os dados que serão exibidos para o cliente.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Logo do Cliente (URL):</label>
                            <input
                                type="text"
                                defaultValue={client.logo_url}
                                onBlur={(e) => handleUpdateLogo(e.target.value)}
                                className="bg-white border border-zinc-300 rounded px-3 py-1 text-xs w-64"
                                placeholder="https://logo.url/logo.png"
                            />
                        </div>
                    </div>
                )}

                {existingPlan && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${existingPlan.status === 'sent' ? 'bg-[#00CC6A]' : 'bg-zinc-400'}`} />
                            <span className="text-sm font-semibold text-black">{existingPlan.status === 'sent' ? 'Enviado ao Cliente' : 'Rascunho Interno'}</span>
                            <span className="text-xs text-zinc-400">|</span>
                            <span className="text-xs text-zinc-400 font-mono">{new Date(existingPlan.updated_at || existingPlan.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handlePreview} variant="outline" size="sm" className="text-xs">
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar
                            </Button>
                            {existingPlan.status === 'draft' && (
                                <Button onClick={handleSendToClient} disabled={sending} size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs">
                                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />} Enviar para Cliente
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!!isDeepResearching || isSynthesizing}
                                onClick={async () => {
                                    await handleDeepResearch('benchmark');
                                    await handleDeepResearch('personas');
                                    await handleDeepResearch('market');
                                    // After all 3 complete, get the latest enriched data and synthesize into plan
                                    const { data: latestPlan } = await supabase
                                        .from('strategic_plans')
                                        .select('*')
                                        .eq('id', existingPlan.id)
                                        .single();
                                    const latestEnriched = (latestPlan?.diagnostic_data as any)?.enriched_analysis || {};
                                    await handlePlanSynthesis({
                                        market: latestEnriched.market,
                                        personas: latestEnriched.personas,
                                        benchmark: latestEnriched.benchmark,
                                    });
                                }}
                                className={`text-xs font-bold transition-colors ${synthesisDone ? 'border-[#00CC6A] text-[#00CC6A] bg-[#00CC6A]/5' : 'border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white'}`}
                            >
                                {isSynthesizing ? (
                                    <span className="flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Sintetizando Plano...</span>
                                ) : isDeepResearching ? (
                                    <span className="flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />{isDeepResearching === 'benchmark' ? 'Benchmark...' : isDeepResearching === 'personas' ? 'Personas...' : 'Mercado...'}</span>
                                ) : synthesisDone ? (
                                    <span className="flex items-center"><BadgeCheck className="w-3.5 h-3.5 mr-1.5" />Plano Sincronizado!</span>
                                ) : (
                                    <span className="flex items-center"><BrainCircuit className="w-3.5 h-3.5 mr-1.5" />Deep Intelligence</span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}


                {existingPlan && (enrichedData?.market || enrichedData?.personas?.personas || enrichedData?.benchmark) && (
                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <BrainCircuit className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Inteligência Profunda: Resumo</h3>
                            <span className="text-[10px] text-zinc-300 ml-auto">Detalhes completos nos slides do plano</span>
                        </div>

                        {/* Compact Market Strip */}
                        {enrichedData?.market && (
                            <div className="bg-white border border-zinc-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center"><TrendingUp size={16} className="text-zinc-600" /></div>
                                    <h4 className="text-sm font-semibold text-zinc-900">Mercado</h4>
                                    {enrichedData.market.tendencias_2025?.length > 0 && (
                                        <span className="text-[10px] font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full ml-auto">
                                            {enrichedData.market.tendencias_2025.length} tendências
                                        </span>
                                    )}
                                </div>
                                {editMode ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            {['tam', 'sam', 'som'].map(k => (
                                                <div key={k} className="flex flex-col">
                                                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">{k.toUpperCase()}</label>
                                                    <input
                                                        type="text"
                                                        value={editedData.market.tam_sam_som?.[k] || ''}
                                                        onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, tam_sam_som: { ...editedData.market.tam_sam_som, [k]: e.target.value } } })}
                                                        className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Oportunidades</label>
                                                <textarea
                                                    value={editedData.market.analise_swot_rapida?.oportunidades?.join(', ') || ''}
                                                    onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, analise_swot_rapida: { ...editedData.market.analise_swot_rapida, oportunidades: e.target.value.split(',').map((s: string) => s.trim()) } } })}
                                                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[50px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Ameaças</label>
                                                <textarea
                                                    value={editedData.market.analise_swot_rapida?.ameacas?.join(', ') || ''}
                                                    onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, analise_swot_rapida: { ...editedData.market.analise_swot_rapida, ameacas: e.target.value.split(',').map((s: string) => s.trim()) } } })}
                                                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[50px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'TAM', meaning: '(Total Addressable Market)', value: enrichedData.market.tam_sam_som?.tam },
                                            { label: 'SAM', meaning: '(Serviceable Available Market)', value: enrichedData.market.tam_sam_som?.sam },
                                            { label: 'SOM', meaning: '(Serviceable Obtainable Market)', value: enrichedData.market.tam_sam_som?.som },
                                        ].map(({ label, meaning, value }) => (
                                            <div key={label} className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                                                    <span className="text-zinc-500 font-bold">{label}</span> <span className="font-medium text-zinc-300 ml-0.5">{meaning}</span>
                                                </p>
                                                <p className="text-xs text-zinc-700 font-medium leading-snug line-clamp-2">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Compact Personas Strip */}
                        {enrichedData?.personas?.personas && (
                            <div className="bg-white border border-zinc-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center"><Users size={16} className="text-zinc-600" /></div>
                                    <h4 className="text-sm font-semibold text-zinc-900">Personas (ICP)</h4>
                                    <span className="text-[10px] font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full ml-auto">
                                        {(enrichedData.personas?.personas || []).length} perfis
                                    </span>
                                </div>
                                {editMode ? (
                                    <div className="space-y-3">
                                        {editedData.personas.personas.map((persona: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                <img src={persona.foto_url || `https://ui-avatars.com/api/?name=${persona.nome}&size=32`} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                <input type="text" value={persona.nome} onChange={(e) => { const n = [...editedData.personas.personas]; n[idx].nome = e.target.value; setEditedData({ ...editedData, personas: { ...editedData.personas, personas: n } }); }} className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-semibold flex-1" />
                                                <input type="text" value={persona.cargo} onChange={(e) => { const n = [...editedData.personas.personas]; n[idx].cargo = e.target.value; setEditedData({ ...editedData, personas: { ...editedData.personas, personas: n } }); }} className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {enrichedData.personas.personas.map((persona: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 px-4 py-2.5 bg-zinc-50 rounded-lg border border-zinc-100 min-w-[200px]">
                                                <img src={persona.foto_url || `https://ui-avatars.com/api/?name=${persona.nome}&size=32`} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-900">{persona.nome}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{persona.cargo}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Compact Benchmark Strip */}
                        {enrichedData?.benchmark && (
                            <div className="bg-zinc-950 text-white rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700"><BadgeCheck size={16} className="text-[#00CC6A]" /></div>
                                    <h4 className="text-sm font-semibold text-white">Benchmarks</h4>
                                    <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700 ml-auto">Métricas de Referência</span>
                                </div>
                                {editMode ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'CAC Médio', key: 'cac_medio' },
                                            { label: 'Conversão', key: 'taxa_conversao' },
                                            { label: 'Ciclo', key: 'ciclo_vendas' },
                                            { label: 'LTV:CAC', key: 'ltv_cac_ratio' },
                                        ].map(({ label, key }) => (
                                            <div key={key} className="flex flex-col">
                                                <label className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">{label}</label>
                                                <textarea
                                                    value={(editedData.benchmark as any)[key] || ''}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, [key]: e.target.value } })}
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white min-h-[60px]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { label: 'CAC Médio', value: enrichedData.benchmark.cac_medio, accent: false },
                                                { label: 'Conversão', value: enrichedData.benchmark.taxa_conversao, accent: true },
                                                { label: 'Ciclo', value: enrichedData.benchmark.ciclo_vendas, accent: false },
                                                { label: 'LTV:CAC', value: enrichedData.benchmark.ltv_cac_ratio, accent: false },
                                            ].map(({ label, value, accent }) => (
                                                <div key={label} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
                                                    <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1.5 ${accent ? 'text-[#00CC6A]' : 'text-zinc-500'}`}>{label}</p>
                                                    <p className={`text-xs font-medium leading-snug line-clamp-3 ${accent ? 'text-[#00CC6A]' : 'text-white/80'}`}>{value || 'N/A'}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {enrichedData.benchmark.comparativo_mercado && (
                                            <p className="text-xs text-zinc-400 mt-3 leading-relaxed line-clamp-2">
                                                <span className="text-[#00CC6A] font-semibold mr-1">Insight:</span>
                                                {enrichedData.benchmark.comparativo_mercado}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
