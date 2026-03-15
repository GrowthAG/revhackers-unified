import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Eye, BrainCircuit, Loader2, Users, TrendingUp, Target, ShieldAlert, BadgeCheck, FileText, ExternalLink, Link as LinkIcon, Copy, Check } from 'lucide-react';
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
            alert('✅ Alterações salvas com sucesso!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Erro ao salvar as alterações.');
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
            alert('Logo atualizada!');
        } catch (error) {
            console.error('Logo update failed:', error);
        }
    }

    async function handleGenerate() {
        if (!reiProjectId || !reiProject) return;

        setGenerating(true);

        try {
            // 1. Fetch REI Responses first — needed for email resolution and CRM Ops normalization
            console.log('Fetching latest REI responses...');
            const { data: latestResponse } = await supabase
                .from('rei_responses')
                .select('*')
                .eq('project_id', reiProjectId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!latestResponse) {
                alert('Erro: Nenhuma resposta do REI encontrada para este projeto.');
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
                // Financial metrics — DiagnosticService reads camelCase names
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
                // Competitors — DiagnosticService reads concorrente1_nome (snake_case, no prefix)
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
                ? { ...latestResponse, responses: { ...latestResponse.responses, form_data: normalizedAnswers } }
                : latestResponse;

            // Effective client identity — CRM Ops stores email/company in form, not in rei_projects
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
                    alert(`Não foi possível gerar pois houve falha ao atrelar um Perfil de Cliente a este Projeto REI: ${clientCreationCatchError.message}`);
                    setGenerating(false);
                    return;
                }
            }

            // 3. Intelligence Enrichment
            // Segment resolution: each REI type uses different field names for sector/segment
            const segment = normalizedAnswers.segmento
                || normalizedAnswers.sector          // consulting REI
                || normalizedAnswers.segmento_outro
                || 'B2B';
            // Objective resolution: each REI type uses different field names for primary goal
            const objective = answers.revops_objetivo_principal   // crm_ops
                || answers.results12Months                        // consulting
                || answers.primaryGoal                            // dev
                || answers.successVision                          // founder
                || answers.metaCrescimento
                || answers.objetivoPrincipal
                || (isCrmOps ? 'Eficiência Operacional & Escala RevOps' : 'Crescimento');
            console.log('[Generator] answers keys:', Object.keys(answers));
            console.log('[Generator] segment:', segment, '| isCrmOps:', isCrmOps, '| effectiveEmail:', effectiveEmail);

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
                    competitors: competitorsList.length > 0 ? competitorsList : undefined
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
                message: p.pitch_elevador || (p.ganhos_desejados || []).join(' — ') || 'Mensagem a ser definida.',
                wiifm: (p.ganhos_desejados || []).slice(0, 2).join('. ') || 'Resultado concreto e mensurável.',
            }));

            // ── Map Perplexity market → BenchmarkSection format ──────────────
            const mappedCompetitors = (enrichmentResult.market?.concorrentes_benchmark || []).map((c: any) => ({
                company_name: c.nome || 'Concorrente',
                domain: c.url || '',
                monthly_traffic: '—',
                domain_authority: 0,
                avg_cpc: '—',
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
            // These are built from real client answers — uses normalizedAnswers so CRM Ops
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
                    ? `Lead→SQL: ${enrichmentResult.benchmark.taxa_conversao || '—'} | Ciclo: ${enrichmentResult.benchmark.ciclo_vendas || '—'} | LTV:CAC: ${enrichmentResult.benchmark.ltv_cac_ratio || '—'}`
                    : undefined,
                key_differentiators: enrichmentResult.market?.analise_swot_rapida?.oportunidades || undefined,
                // Metadata: lets the frontend know where data came from
                _data_source: aiSuccess ? 'ai_enriched' : 'rei_fallback',
            };

            // ── AI Base Generation (GPT-4o via Edge Function) ──
            let aiPlanData = null;
            let aiBaseSuccess = false;
            try {
                console.log('Invoking Base AI Generation (GPT-4o)...');
                const { data: baseAiData, error: baseAiError } = await supabase.functions.invoke('generate-strategic-plan', {
                    body: {
                        rei_responses: answers,
                        segment: segment,
                        objective: objective,
                        isB2B: reiProject?.type === 'crm_ops' ? true : DiagnosticService['checkIsB2B'](answers),
                        projectType: reiProject?.type || 'consulting',
                        projectId: reiProjectId
                    }
                });

                if (baseAiError) {
                    console.warn('Base AI generation error:', baseAiError);
                } else if (baseAiData?.result) {
                    aiPlanData = baseAiData.result;
                    aiBaseSuccess = true;
                }
            } catch (err) {
                console.warn('Failed to call Base AI Generation (GPT-4o):', err);
            }

            // Fallback market context (used by DiagnosticService)
            const marketCtx = {
                industry_trends: mappedTrends.length > 0 ? mappedTrends : ['Automação de vendas', 'Revenue Operations', 'IA Generativa aplicada a vendas'],
                competitor_benchmarks: mappedCompetitors,
                market_sizing: mappedMarketSizing,
                personas: mappedPersonas,
                strategic_advice: mappedAdvice,
            };

            // diagnosticResponse: latestResponse with normalized form_data for CRM Ops compatibility
            const fullDiagnostic = DiagnosticService.generateDiagnosis(diagnosticResponse, marketCtx, reiProject?.type, aiPlanData);
            const { plan_data, ...diagnosticContext } = fullDiagnostic;

            // 3. Define Plan Data (only columns that exist in strategic_plans table)
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
                    enriched_analysis: enrichmentResult,
                    market_intelligence: market_intelligence || null,
                    ai_base_success: aiBaseSuccess // Flag for debugging
                } as any
            };

            console.log('Final plan data keys:', Object.keys(finalPlanData));

            // 4. Save Plan (Insert or Update)
            if (existingPlan) {
                const { data: updated, error: upError } = await supabase
                    .from('strategic_plans')
                    .update(finalPlanData)
                    .eq('id', existingPlan.id)
                    .select()
                    .single();
                if (upError) throw upError;
                setExistingPlan(updated);
            } else {
                const { data: inserted, error: inError } = await supabase
                    .from('strategic_plans')
                    .insert(finalPlanData)
                    .select()
                    .single();
                if (inError) throw inError;
                setExistingPlan(inserted);
            }

            if (aiSuccess) {
                alert('✅ Planejamento estratégico gerado com Inteligência de Mercado!');
            } else {
                alert('✅ Planejamento base gerado! Para dados de mercado enriquecidos, configure a chave Perplexity AI nos secrets do Supabase.');
            }

        } catch (error: any) {
            console.error('Error generating plan:', error);
            setErrorLog(`Falha na Inserção SQL ou Montagem: ${error.message} \nDetalhes: ${JSON.stringify(error)}`);
        } finally {
            setGenerating(false);
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

            const isCrmType = reiProject?.type === 'crm_ops';
            const segment = answers.revops_segmento || answers.sector || answers.segmento || 'B2B';
            const objective = answers.revops_objetivo_principal || answers.results12Months || answers.primaryGoal || answers.successVision || 'Crescimento';

            // Extract competitors from normalized fields
            const competitors: { nome: string, url?: string }[] = [];
            const cn1 = answers.revops_concorrente1_nome || answers.concorrente1_nome;
            const cn2 = answers.revops_concorrente2_nome || answers.concorrente2_nome;
            const cn3 = answers.revops_concorrente3_nome || answers.concorrente3_nome;
            if (cn1) competitors.push({ nome: cn1, url: answers.revops_concorrente1_site || answers.concorrente1_site });
            if (cn2) competitors.push({ nome: cn2, url: answers.revops_concorrente2_site || answers.concorrente2_site });
            if (cn3) competitors.push({ nome: cn3, url: answers.revops_concorrente3_site || answers.concorrente3_site });

            const result = await StrategicEnrichmentService.researchIntelligence(type, segment, {
                objective,
                competitors,
                context: answers
            });

            // Merge into existing plan
            if (existingPlan) {
                const diagData = { ...(existingPlan.diagnostic_data as any) };
                if (!diagData.enriched_analysis) diagData.enriched_analysis = {};
                diagData.enriched_analysis[type] = result;
                diagData.enriched_analysis.isDeepResearch = true;

                const { data: updated, error } = await supabase
                    .from('strategic_plans')
                    .update({ diagnostic_data: diagData as any })
                    .eq('id', existingPlan.id)
                    .select()
                    .single();

                if (error) throw error;
                setExistingPlan(updated);
                setEnrichedData(diagData.enriched_analysis);
                alert(`✅ Pesquisa Profunda de ${type} concluída!`);
            } else {
                alert('Gere o planejamento base primeiro antes de rodar a pesquisa profunda.');
            }
        } catch (error) {
            console.error('Deep research failed:', error);
            alert('Falha na pesquisa profunda.');
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
            alert(`✅ Planejamento enviado! Link: ${clientLink}`);
            await loadData();
        } catch (error) {
            alert('Erro ao enviar.');
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
                        <h1 className="text-3xl font-bold text-black tracking-tight">Gerador Estratégico AI</h1>
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
                            <Button onClick={handleGenerate} disabled={generating} className="bg-black text-white hover:bg-zinc-800">
                                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                                {existingPlan ? 'Regerar Inteligência Base' : 'Gerar Planejamento'}
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
                        <button
                            onClick={() => {
                                const uploadUrl = `${window.location.origin}/upload-materiais/${reiProjectId}`;
                                navigator.clipboard.writeText(uploadUrl);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            {copiedLink ? <Check className="w-3 h-3 text-[#00CC6A]" /> : <Copy className="w-3 h-3" />}
                            {copiedLink ? 'Link Copiado!' : 'Copiar Link de Upload'}
                        </button>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-6 text-sm text-zinc-400">
                            Nenhum material enviado ainda. Compartilhe o link de upload com o cliente.
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
                    <div className="flex gap-2 mb-8 bg-zinc-100 p-1 rounded-lg w-fit">
                        <Button
                            variant={isDeepResearching === 'benchmark' ? 'secondary' : 'ghost'}
                            size="sm"
                            disabled={!!isDeepResearching}
                            onClick={() => handleDeepResearch('benchmark')}
                            className="text-[10px] font-bold uppercase tracking-widest h-8"
                        >
                            {isDeepResearching === 'benchmark' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <TrendingUp className="w-3 h-3 mr-2" />}
                            Deep Benchmark
                        </Button>
                        <Button
                            variant={isDeepResearching === 'personas' ? 'secondary' : 'ghost'}
                            size="sm"
                            disabled={!!isDeepResearching}
                            onClick={() => handleDeepResearch('personas')}
                            className="text-[10px] font-bold uppercase tracking-widest h-8"
                        >
                            {isDeepResearching === 'personas' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Users className="w-3 h-3 mr-2" />}
                            Deep Personas
                        </Button>
                        <Button
                            variant={isDeepResearching === 'market' ? 'secondary' : 'ghost'}
                            size="sm"
                            disabled={!!isDeepResearching}
                            onClick={() => handleDeepResearch('market')}
                            className="text-[10px] font-bold uppercase tracking-widest h-8"
                        >
                            {isDeepResearching === 'market' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <TrendingUp className="w-3 h-3 mr-2" />}
                            Deep Market Tech
                        </Button>
                    </div>
                )}

                {existingPlan && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Status & Actions */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Status do Plano</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${existingPlan.status === 'sent' ? 'bg-[#00CC6A]' : 'bg-zinc-400'}`} />
                                    <span className="font-semibold capitalize text-black">{existingPlan.status === 'sent' ? 'Enviado ao Cliente' : 'Rascunho Interno'}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={handlePreview} variant="outline" className="w-full justify-start"><Eye className="w-4 h-4 mr-2" /> Visualizar Página Pública</Button>
                                    {existingPlan.status === 'draft' && (
                                        <Button onClick={handleSendToClient} disabled={sending} className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 text-white">
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Enviar para Cliente
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Enriched Analysis Visualization */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* 1. Market Analysis */}
                            {enrichedData?.market && (
                                <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center"><TrendingUp size={20} /></div>
                                        <div>
                                            <h2 className="text-xl font-bold text-black">Análise de Mercado</h2>
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Tendências & Competitividade</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="p-5 bg-zinc-50 rounded-lg border border-zinc-100">
                                            <h4 className="font-bold text-black mb-3 flex items-center gap-2"><Target size={16} /> TAM/SAM/SOM</h4>
                                            {editMode ? (
                                                <div className="space-y-3">
                                                    <div className="flex flex-col">
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">TAM</label>
                                                        <input
                                                            type="text"
                                                            value={editedData.market.tam_sam_som?.tam || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, tam_sam_som: { ...editedData.market.tam_sam_som, tam: e.target.value } } })}
                                                            className="bg-white border border-zinc-200 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">SAM</label>
                                                        <input
                                                            type="text"
                                                            value={editedData.market.tam_sam_som?.sam || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, tam_sam_som: { ...editedData.market.tam_sam_som, sam: e.target.value } } })}
                                                            className="bg-white border border-zinc-200 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">SOM</label>
                                                        <input
                                                            type="text"
                                                            value={editedData.market.tam_sam_som?.som || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, tam_sam_som: { ...editedData.market.tam_sam_som, som: e.target.value } } })}
                                                            className="bg-white border border-zinc-200 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <ul className="space-y-3 text-sm text-zinc-600">
                                                    <li><b className="text-black">TAM:</b> {enrichedData.market.tam_sam_som?.tam || 'N/A'}</li>
                                                    <li><b className="text-black">SAM:</b> {enrichedData.market.tam_sam_som?.sam || 'N/A'}</li>
                                                    <li><b className="text-black">SOM:</b> {enrichedData.market.tam_sam_som?.som || 'N/A'}</li>
                                                </ul>
                                            )}
                                        </div>
                                        <div className="p-5 bg-zinc-50 rounded-lg border border-zinc-100">
                                            <h4 className="font-bold text-black mb-3 flex items-center gap-2"><ShieldAlert size={16} /> SWOT Rápida</h4>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-xs font-bold bg-[#00CC6A]/10 text-[#00CC6A] px-2 py-0.5 rounded mr-2">OPORTUNIDADES</span>
                                                    {editMode ? (
                                                        <textarea
                                                            value={editedData.market.analise_swot_rapida?.oportunidades?.join(', ') || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, analise_swot_rapida: { ...editedData.market.analise_swot_rapida, oportunidades: e.target.value.split(',').map(s => s.trim()) } } })}
                                                            className="w-full mt-2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[60px]"
                                                        />
                                                    ) : (
                                                        <p className="text-zinc-600 mt-1">{enrichedData.market.analise_swot_rapida?.oportunidades?.join(', ') || 'N/A'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded mr-2">AMEAÇAS</span>
                                                    {editMode ? (
                                                        <textarea
                                                            value={editedData.market.analise_swot_rapida?.ameacas?.join(', ') || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, market: { ...editedData.market, analise_swot_rapida: { ...editedData.market.analise_swot_rapida, ameacas: e.target.value.split(',').map(s => s.trim()) } } })}
                                                            className="w-full mt-2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[60px]"
                                                        />
                                                    ) : (
                                                        <p className="text-zinc-600 mt-1">{enrichedData.market.analise_swot_rapida?.ameacas?.join(', ') || 'N/A'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-black mb-4">Principais Tendências 2025</h4>
                                        <div className="grid gap-3">
                                            {(editMode ? editedData : enrichedData).market.tendencias_2025?.map((trend: any, i: number) => (
                                                <div key={i} className="flex items-start gap-4 p-3 hover:bg-zinc-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-black">
                                                    <span className="font-bold text-zinc-300 text-lg">0{i + 1}</span>
                                                    <div className="flex-1">
                                                        {editMode ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={trend.titulo}
                                                                    onChange={(e) => {
                                                                        const newTrends = [...editedData.market.tendencias_2025];
                                                                        newTrends[i].titulo = e.target.value;
                                                                        setEditedData({ ...editedData, market: { ...editedData.market, tendencias_2025: newTrends } });
                                                                    }}
                                                                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-sm font-bold"
                                                                />
                                                                <textarea
                                                                    value={trend.descricao}
                                                                    onChange={(e) => {
                                                                        const newTrends = [...editedData.market.tendencias_2025];
                                                                        newTrends[i].descricao = e.target.value;
                                                                        setEditedData({ ...editedData, market: { ...editedData.market, tendencias_2025: newTrends } });
                                                                    }}
                                                                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[40px]"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h5 className="font-bold text-black text-sm">{trend.titulo}</h5>
                                                                <p className="text-xs text-zinc-500 mt-1">{trend.descricao}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Personas */}
                            {enrichedData?.personas?.personas && (
                                <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center"><Users size={20} /></div>
                                        <div>
                                            <h2 className="text-xl font-bold text-black">Buyer Personas (ICP)</h2>
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Perfis Ideais Mapeados</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {(editMode ? editedData : enrichedData).personas.personas.map((persona: any, idx: number) => (
                                            <div key={idx} className="group relative border border-zinc-200 rounded-xl overflow-hidden hover:shadow-sm transition-all pt-12 pb-6 px-6 text-center">
                                                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-zinc-100 to-white" />
                                                <div className="relative w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden mb-4">
                                                    <img src={persona.foto_url || `https://ui-avatars.com/api/?name=${persona.nome}`} alt={persona.nome} className="w-full h-full object-cover" />
                                                </div>

                                                {editMode ? (
                                                    <div className="space-y-4 text-left">
                                                        <div className="flex flex-col">
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome</label>
                                                            <input
                                                                type="text"
                                                                value={persona.nome}
                                                                onChange={(e) => {
                                                                    const newPersonas = [...editedData.personas.personas];
                                                                    newPersonas[idx].nome = e.target.value;
                                                                    setEditedData({ ...editedData, personas: { ...editedData.personas, personas: newPersonas } });
                                                                }}
                                                                className="bg-white border border-zinc-200 rounded px-2 py-1 text-sm font-bold"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Cargo</label>
                                                            <input
                                                                type="text"
                                                                value={persona.cargo}
                                                                onChange={(e) => {
                                                                    const newPersonas = [...editedData.personas.personas];
                                                                    newPersonas[idx].cargo = e.target.value;
                                                                    setEditedData({ ...editedData, personas: { ...editedData.personas, personas: newPersonas } });
                                                                }}
                                                                className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Dores Principais (Vírgula)</p>
                                                            <textarea
                                                                value={persona.dores_principais?.join(', ') || ''}
                                                                onChange={(e) => {
                                                                    const newPersonas = [...editedData.personas.personas];
                                                                    newPersonas[idx].dores_principais = e.target.value.split(',').map(s => s.trim());
                                                                    setEditedData({ ...editedData, personas: { ...editedData.personas, personas: newPersonas } });
                                                                }}
                                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[60px]"
                                                            />
                                                        </div>
                                                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Pitch de Elevador</p>
                                                            <textarea
                                                                value={persona.pitch_elevador || ''}
                                                                onChange={(e) => {
                                                                    const newPersonas = [...editedData.personas.personas];
                                                                    newPersonas[idx].pitch_elevador = e.target.value;
                                                                    setEditedData({ ...editedData, personas: { ...editedData.personas, personas: newPersonas } });
                                                                }}
                                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs min-h-[40px] italic"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="font-bold text-black text-lg leading-tight">{persona.nome}</h3>
                                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-4">{persona.cargo}</p>

                                                        <div className="text-left space-y-4">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Dores Principais</p>
                                                                <ul className="text-xs text-zinc-600 list-disc ml-3 space-y-1">
                                                                    {persona.dores_principais?.slice(0, 3).map((dor: string, i: number) => (
                                                                        <li key={i}>{dor}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                                                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Pitch de Elevador</p>
                                                                <p className="text-xs text-black italic">"{persona.pitch_elevador || 'N/A'}"</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. Benchmarks */}
                            {enrichedData?.benchmark && (
                                <div className="bg-zinc-900 text-white p-8 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700"><BadgeCheck size={20} className="text-[#00CC6A]" /></div>
                                        <div>
                                            <h2 className="text-xl font-bold">Benchmarks do Setor</h2>
                                            <p className="text-xs text-zinc-400 uppercase tracking-widest">Métricas de Referência</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">CAC Médio</p>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editedData.benchmark.cac_medio}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, cac_medio: e.target.value } })}
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-white tracking-tight">{enrichedData.benchmark.cac_medio}</p>
                                            )}
                                        </div>
                                        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Conv. Média</p>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editedData.benchmark.taxa_conversao}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, taxa_conversao: e.target.value } })}
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-[#00CC6A] w-full"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-[#00CC6A] tracking-tight">{enrichedData.benchmark.taxa_conversao}</p>
                                            )}
                                        </div>
                                        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Ciclo Vendas</p>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editedData.benchmark.ciclo_vendas}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, ciclo_vendas: e.target.value } })}
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-white tracking-tight">{enrichedData.benchmark.ciclo_vendas}</p>
                                            )}
                                        </div>
                                        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">LTV:CAC</p>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editedData.benchmark.ltv_cac_ratio}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, ltv_cac_ratio: e.target.value } })}
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-white tracking-tight">{enrichedData.benchmark.ltv_cac_ratio}</p>
                                            )}
                                        </div>
                                    </div>

                                    {(editMode ? editedData : enrichedData).benchmark.comparativo_mercado && (
                                        <div className="mt-6 pt-6 border-t border-zinc-800">
                                            {editMode ? (
                                                <textarea
                                                    value={editedData.benchmark.comparativo_mercado}
                                                    onChange={(e) => setEditedData({ ...editedData, benchmark: { ...editedData.benchmark, comparativo_mercado: e.target.value } })}
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 min-h-[80px]"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                                                    <span className="text-[#00CC6A] font-bold mr-2">Insight:</span>
                                                    {enrichedData.benchmark.comparativo_mercado}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
