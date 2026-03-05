import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Eye, BrainCircuit, Loader2, Users, TrendingUp, Target, ShieldAlert, BadgeCheck } from 'lucide-react';
import { ProjectTimeline } from '@/components/admin/ProjectTimeline';
import { StrategicEnrichmentService, StrategicEnrichmentResult } from '@/services/StrategicEnrichmentService';
import { DiagnosticService } from '@/services/DiagnosticService';

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
            // 1. Resolve Client ID (RPC bypass)
            let clientId = client?.id;

            if (!clientId || clientId === 'legacy-or-missing') {
                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('email', reiProject.client_email)
                    .maybeSingle();

                if (existingClient) {
                    clientId = existingClient.id;
                } else {
                    const { data: newClient, error: createClientError } = await supabase
                        .from('clients')
                        .insert({
                            email: reiProject.client_email,
                            name: reiProject.client_name,
                            company: reiProject.client_company || reiProject.client_name,
                            status: 'lead'
                        })
                        .select('id')
                        .single();

                    if (createClientError) throw createClientError;
                    clientId = newClient.id;
                }
            }

            // 2. Intelligence Enrichment
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

            const answers = latestResponse.responses as any;
            const segment = answers.segmento || 'B2B';
            const objective = answers.objetivoPrincipal || 'Crescimento';

            // Try AI enrichment (non-blocking)
            let enrichmentResult: any = { benchmark: null, personas: null, market: null };
            let aiSuccess = false;

            try {
                console.log('Invoking StrategicEnrichmentService...');
                const aiResult = await StrategicEnrichmentService.getFullEnrichment(segment, {
                    objective,
                    rei_responses: answers
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

            // Fallback market context (used by DiagnosticService)
            const marketCtx = {
                industry_trends: enrichmentResult.market?.tendencias_2025?.map((t: any) => t.titulo) || ['Automação de vendas', 'Revenue Operations', 'IA Generativa aplicada a vendas'],
                competitor_benchmarks: [],
                market_sizing: {
                    tam: enrichmentResult.market?.tam_sam_som?.tam || 'A ser definido na pesquisa profunda',
                    sam: enrichmentResult.market?.tam_sam_som?.sam || 'A ser definido na pesquisa profunda',
                    som: enrichmentResult.market?.tam_sam_som?.som || 'A ser definido na pesquisa profunda'
                },
                personas: [],
                strategic_advice: "Foco em eficiência operacional e decisões baseadas em dados."
            };

            const fullDiagnostic = DiagnosticService.generateDiagnosis(latestResponse, marketCtx);
            const { plan_data, ...diagnosticContext } = fullDiagnostic;

            // 3. Define Plan Data (only columns that exist in strategic_plans table)
            // Destructure to exclude market_intelligence which is NOT a DB column
            const { market_intelligence, ...dbSafePlanData } = plan_data;

            const finalPlanData = {
                ...dbSafePlanData,
                rei_project_id: reiProjectId,
                client_id: clientId,
                created_by: (await supabase.auth.getUser()).data.user?.id,
                status: existingPlan ? existingPlan.status : 'draft',
                diagnostic_data: {
                    ...diagnosticContext,
                    enriched_analysis: enrichmentResult,
                    market_intelligence: market_intelligence || null
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

        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Erro crítico ao gerar planejamento. Consulte o console para detalhes.');
        } finally {
            setGenerating(false);
        }
    }

    async function handleDeepResearch(type: 'benchmark' | 'personas' | 'market') {
        if (!reiProjectId || !reiProject) return;
        setIsDeepResearching(type);
        try {
            const answers = (reiProject.data as any) || {};
            const segment = answers.segmento || 'B2B';
            const objective = answers.objetivoPrincipal || 'Crescimento';
            const competitors = answers.concorrentes || [];

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
                            <Button onClick={handleSaveEdits} disabled={sending} className="bg-green-600 text-white hover:bg-green-700">
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

                {editMode && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-amber-600" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Modo de Edição Ativo</p>
                                <p className="text-xs text-amber-700">Você está alterando os dados que serão exibidos para o cliente.</p>
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
                                    <div className={`w-3 h-3 rounded-full ${existingPlan.status === 'sent' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                                    <span className="font-semibold capitalize text-black">{existingPlan.status === 'sent' ? 'Enviado ao Cliente' : 'Rascunho Interno'}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={handlePreview} variant="outline" className="w-full justify-start"><Eye className="w-4 h-4 mr-2" /> Visualizar Página Pública</Button>
                                    {existingPlan.status === 'draft' && (
                                        <Button onClick={handleSendToClient} disabled={sending} className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
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
                                                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded mr-2">OPORTUNIDADES</span>
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
                                                    <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded mr-2">AMEAÇAS</span>
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
                                            <div key={idx} className="group relative border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-all pt-12 pb-6 px-6 text-center">
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
                                <div className="bg-zinc-900 text-white p-8 rounded-xl shadow-xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700"><BadgeCheck size={20} className="text-revgreen" /></div>
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
                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-revgreen w-full"
                                                />
                                            ) : (
                                                <p className="text-xl font-bold text-revgreen tracking-tight">{enrichedData.benchmark.taxa_conversao}</p>
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
                                                    <span className="text-revgreen font-bold mr-2">Insight:</span>
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
