import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Eye, BrainCircuit, Loader2 } from 'lucide-react';

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
    const [reiProject, setREIProject] = useState<any>(null); // Using any to avoid Supabase/JSON type conflicts
    const [client, setClient] = useState<any>(null);
    const [existingPlan, setExistingPlan] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [reiProjectId]);

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
            if (projectData.client_id) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', projectData.client_id)
                    .maybeSingle(); // Changed from single() to maybeSingle() to avoid error on 0 rows

                if (clientData) {
                    clientFinal = clientData;
                }
            }

            // Fallback: If no related client found, use the data stored in the project itself
            if (!clientFinal) {
                clientFinal = {
                    id: 'legacy-or-missing',
                    company_name: projectData.client_company || projectData.client_name || 'N/A',
                    contact_name: projectData.client_name || 'N/A',
                    email: projectData.client_email || 'N/A'
                };
            }

            setClient(clientFinal);

            // Check if plan already exists
            const { data: planData } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('rei_project_id', reiProjectId)
                .single();

            if (planData) {
                setExistingPlan(planData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Erro ao carregar dados do projeto.');
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate() {
        if (!reiProjectId) return;

        setGenerating(true);

        try {
            // 1. Fetch the latest REI Response (The "Brain" Input)
            const { data: latestResponse, error: responseError } = await supabase
                .from('rei_responses')
                .select('*')
                .eq('project_id', reiProjectId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .single();

            if (responseError) {
                console.warn('No REI response found, generating generic plan.');
            }

            // 2. Execute the RPC to initialize the row (Standard Procedure)
            const { data: planId, error: rpcError } = await supabase.rpc('generate_strategic_plan', {
                p_rei_project_id: reiProjectId,
            });

            if (rpcError) throw rpcError;

            // 3. If we have real data, overwrite the generic template with specific intelligence
            if (latestResponse) {
                // Dynamically import the service to avoid circular deps if any
                const { DiagnosticService } = await import('@/services/DiagnosticService');

                // V2: Generate Full Diagnosis (Voice + Brain)
                const fullDiagnostic = DiagnosticService.generateDiagnosis(latestResponse);
                const { plan_data, ...diagnosticContext } = fullDiagnostic;

                // Update the plan with the intelligent data AND the diagnostic context
                const { error: updateError } = await supabase
                    .from('strategic_plans')
                    .update({
                        ...plan_data, // Overwrite generic plan sections (roadmap, goals, etc)
                        diagnostic_data: diagnosticContext as any // Store the "Why" (Signals, Risks, Decisions)
                    })
                    .eq('rei_project_id', reiProjectId);

                if (updateError) {
                    console.error('Error applying intelligence:', updateError);
                    // Non-blocking error, user still gets the generic plan
                } else {
                    console.log('✅ Plan enriched with REI intelligence (V2).');
                }
            }

            alert('✅ Planejamento estratégico gerado com sucesso!');

            // Reload to show the generated plan
            await loadData();
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Erro ao gerar planejamento. Tente novamente.');
        } finally {
            setGenerating(false);
        }
    }

    async function handleSendToClient() {
        if (!existingPlan || !client) return;

        setSending(true);

        try {
            // Update plan status to 'sent'
            const { error: updateError } = await supabase
                .from('strategic_plans')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                })
                .eq('id', existingPlan.id);

            if (updateError) throw updateError;

            // TODO: Send email to client with link
            const clientLink = `${window.location.origin}/plan/${existingPlan.access_token}`;

            console.log('Client link:', clientLink);
            console.log('Send email to:', client.email);

            alert(`✅ Planejamento enviado para ${client.contact_name}!\n\nLink: ${clientLink}`);

            // Reload to update status
            await loadData();
        } catch (error) {
            console.error('Error sending plan:', error);
            alert('Erro ao enviar planejamento. Tente novamente.');
        } finally {
            setSending(false);
        }
    }

    function handlePreview() {
        if (!existingPlan) return;
        window.open(`/plan/${existingPlan.access_token}`, '_blank');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!reiProject || !client) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-black mb-4">Projeto não encontrado</h2>
                    <Button onClick={() => navigate('/admin/onboarding')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <ProjectTimeline
                    currentStage={existingPlan ? (existingPlan.status === 'sent' ? 3 : 2) : 2}
                    reiDate={reiProject?.created_at}
                    planDate={existingPlan?.created_at}
                />

                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => navigate(`/admin/jornada/${reiProjectId}`)}
                        variant="outline"
                        className="mb-4 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Voltar para Jornada
                    </Button>

                    <h1 className="text-3xl font-semibold text-black mb-2">
                        Gerador de Planejamento Estratégico
                    </h1>
                    <p className="text-zinc-600">
                        Cliente: <span className="font-semibold text-black">{client.company_name}</span>
                    </p>
                </div>

                {/* Content */}
                {existingPlan ? (
                    <div className="bg-white border border-zinc-200 rounded-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-black mb-2">
                                    ✅ Planejamento Gerado
                                </h2>
                                <p className="text-sm text-zinc-600">
                                    Status: <span className={`font-semibold ${existingPlan.status === 'approved' ? 'text-green-600' :
                                        existingPlan.status === 'sent' ? 'text-blue-600' :
                                            existingPlan.status === 'viewed' ? 'text-yellow-600' :
                                                'text-zinc-600'
                                        }`}>
                                        {existingPlan.status === 'approved' ? 'Aprovado' :
                                            existingPlan.status === 'sent' ? 'Enviado' :
                                                existingPlan.status === 'viewed' ? 'Visualizado' :
                                                    'Rascunho'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Criado em</p>
                                <p className="text-sm font-semibold text-black">
                                    {new Date(existingPlan.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            {existingPlan.sent_at && (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Enviado em</p>
                                    <p className="text-sm font-semibold text-black">
                                        {new Date(existingPlan.sent_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            {existingPlan.viewed_at && (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Visualizado em</p>
                                    <p className="text-sm font-semibold text-black">
                                        {new Date(existingPlan.viewed_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}

                            {existingPlan.approved_at && (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Aprovado em</p>
                                    <p className="text-sm font-semibold text-black">
                                        {new Date(existingPlan.approved_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Link */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Link do Cliente</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/plan/${existingPlan.access_token}`}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded text-sm"
                                />
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/plan/${existingPlan.access_token}`);
                                        alert('Link copiado!');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Copiar
                                </Button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handlePreview}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                Visualizar
                            </Button>

                            <Button
                                onClick={handleGenerate}
                                disabled={generating}
                                variant="secondary"
                                className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200"
                                title="Atualizar diagnóstico com últimas respostas do REI"
                            >
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                                Regerar Inteligência
                            </Button>

                            {existingPlan.status === 'draft' && (
                                <Button
                                    onClick={handleSendToClient}
                                    disabled={sending}
                                    className="flex items-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Enviar para Cliente
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-semibold text-black mb-4">
                            Nenhum planejamento gerado ainda
                        </h2>
                        <p className="text-zinc-600 mb-8">
                            Gere o planejamento estratégico baseado nos dados do REI preenchido.
                        </p>

                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            size="lg"
                            className="flex items-center gap-2 mx-auto"
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Gerar Planejamento Estratégico
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
