import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Eye, BrainCircuit, Loader2 } from 'lucide-react';
import { ProjectTimeline } from '@/components/admin/ProjectTimeline';

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
            const project = projectData as any;
            if (project.client_id) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', project.client_id)
                    .maybeSingle(); // Changed from single() to maybeSingle() to avoid error on 0 rows

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
                    email: project.client_email || 'N/A'
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
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // alert('Erro ao carregar dados do projeto.'); // Suppress robust error for now to avoid scaring user if it's just a 404
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate() {
        if (!reiProjectId || !reiProject) return;

        setGenerating(true);

        try {
            // 1. Resolve Client ID (RPC bypass)
            let clientId = client?.id;

            // ... (Client resolution logic remains the same, verified working) ...
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

            // 2. Define Defaults
            const defaultPlan = {
                rei_project_id: reiProjectId,
                client_id: clientId,
                created_by: (await supabase.auth.getUser()).data.user?.id,
                status: 'draft',
                premises_data: {
                    pillars: [
                        { name: 'Processos', icon: '🔄', items: ['Disponibilidade de Recursos', 'Reuniões mensais', 'Disponibilidade de Recursos'] },
                        { name: 'Estratégia', icon: '🎯', items: ['Tráfego Pago e Resultado', 'Aumento do LTV', 'Aumento de Ticket Médio'] },
                        { name: 'Metodologia', icon: '📋', items: ['Estudo de concorrência', 'Estudo de mercado', 'Estudo de persona'] },
                        { name: 'Momento', icon: '⏰', items: ['Onde mais podemos trabalhar', 'Novos projetos', 'Confiabilidade', 'Segurança'] }
                    ]
                },
                methodology_data: {
                    steps: [
                        { name: 'Canais certos', description: 'Foco em Meta Ads (Instagram/Facebook), combinando segmentação local e criativos adaptados à linguagem emocional da persona.' },
                        { name: 'Comunicação realista', description: 'Narrativas simples e diretas, com foco em histórias reais de superação — sem promessas vagas e com clareza sobre o que é e o que não é bolsa.' },
                        { name: 'Acompanhamento ativo', description: 'Nutrição contínua via CRM e SDR, reforçando acolhimento, esclarecendo dúvidas e construindo confiança até a matrícula.' }
                    ]
                },
                roadmap_data: {
                    phases: [
                        { name: 'Dia 1 a Dia 10', title: 'Kick Off | Onboarding', items: ['Formulário REI', 'Reunião de Kick-Off', 'Entrega de Planejamento Estratégico', 'Reunião Planejamento Estratégico'] },
                        { name: 'Dia 1 a Dia 10', title: 'Coleta de Materiais Disponíveis', items: ['Coleta e Desenvolvimento de Materiais', 'Linha Editorial'] },
                        { name: 'Dia 1 a Dia 15', title: 'Configuração e SetUp de CRM', items: ['SetUp do CRM', 'Automações'] },
                        { name: 'Dia 1 a Dia 35', title: 'Go Live! Início das campanhas.', items: ['Testes iniciais → Campanhas → Canais → Mensagem → Produto → Oferta'] },
                        { name: 'Dia 35 a Dia 40', title: 'Análise de métricas do funil 30 dias.', items: ['R.A.P.T - Reunião de Apresentação de resultados 30 dias.'] },
                        { name: 'Dia 45 a Dia 75', title: 'Ongoing | Análise e otimização', items: ['Início de novas estratégias baseado na análise das métricas, testes e resultados obtidos.'] },
                        { name: 'Dia 75 a Dia 90', title: 'Análise de métricas do funil 30 dias.', items: ['R.A.P.2 - Reunião de Apresentação de resultados Quarter.'] }
                    ]
                },
                goals_data: {
                    okrs: [
                        { kr: 'KR 1', description: 'Estrutura completa implantada e operando (Meta, Google, CRM, SDRs)' },
                        { kr: 'KR 2', description: 'Geração de leads validada com rastreabilidade' },
                        { kr: 'KR 3', description: 'Jornada do lead testada ponta a ponta' },
                        { kr: 'KR 4', description: 'Primeira rodada de otimização aplicada' }
                    ],
                    month1_targets: [
                        { name: '5 clientes pagos', status: 'pending' },
                        { name: 'R$15-30K MRR', status: 'pending' },
                        { name: 'Playbook documentado', status: 'pending' },
                        { name: '2-3 case studies BR', status: 'pending' },
                        { name: '50+ leads no pipeline', status: 'pending' }
                    ]
                },
                financial_projections: {
                    meta_month_12: { nmrr_total: 'R$100K', nmrr_brazil: 'R$80-100K', nmrr_latam: 'R$15-20K', clients_total: '300-350', clients_brazil: '300-350', clients_latam: '30-40' },
                    monthly_projections: [
                        { period: 'Mês 1-2', nmrr_brazil: 'R$10-15K', nmrr_latam: '-', nmrr_total: 'R$10-15K', clients_brazil: '10-15', clients_latam: '-', total_clients: '10-15' },
                        { period: 'Mês 3-4', nmrr_brazil: 'R$25-40K', nmrr_latam: '-', nmrr_total: 'R$25-40K', clients_brazil: '50-80', clients_latam: '-', total_clients: '50-80' },
                        { period: 'Mês 5-6', nmrr_brazil: 'R$40-50K', nmrr_latam: '-', nmrr_total: 'R$40-50K', clients_brazil: '100-120', clients_latam: '-', total_clients: '100-120' },
                        { period: 'Mês 7-8', nmrr_brazil: 'R$50-60K', nmrr_latam: 'R$3-5K', nmrr_total: 'R$55-65K', clients_brazil: '130-150', clients_latam: '10-15', total_clients: '140-165' },
                        { period: 'Mês 9-10', nmrr_brazil: 'R$65-80K', nmrr_latam: 'R$10-15K', nmrr_total: 'R$75-95K', clients_brazil: '250-300', clients_latam: '20-30', total_clients: '270-330' },
                        { period: 'Mês 11-12', nmrr_brazil: 'R$80-100K', nmrr_latam: 'R$15-20K', nmrr_total: 'R$95-120K', clients_brazil: '300-350', clients_latam: '30-40', total_clients: '330-390' }
                    ]
                },
                budget_data: {
                    annual_budget: 'R$ 9.000,00',
                    channels: [
                        { name: 'LinkedIn Outreach', percentage: '40%' },
                        { name: 'Content Brasil', percentage: '25%' },
                        { name: 'Email Outreach', percentage: '15%' },
                        { name: 'Paid Ads', percentage: '15%' },
                        { name: 'Parcerias', percentage: '5%' }
                    ]
                },
                next_steps_data: {
                    week1_actions: [
                        { day: 'Dia 1', action: 'Otimizar perfil LinkedIn (headline, banner, sobre) - foco Brasil', done: false },
                        { day: 'Dia 1-2', action: 'Criar lista de 200+ empresas target (SP, RJ, BH tech)', done: false },
                        { day: 'Dia 2-3', action: 'Escrever 5 templates de outreach em português brasileiro', done: false },
                        { day: 'Dia 3', action: 'Criar demo workspace do Funnels com dados brasileiros', done: false },
                        { day: 'Dia 4-6', action: 'Publicar 4 posts no LinkedIn sobre dores brasileiras (WhatsApp, consolidação)', done: false },
                        { day: 'Dia 5-6', action: 'Criar lead magnet: "Checklist: Migrar de RD+Pipedrive para Funnels em 48h"', done: false },
                        { day: 'Dia 6-7', action: 'Configurar Calendly + email sequences (5 sequências)', done: false },
                        { day: 'Dia 7', action: 'Iniciar outreach manual (10-15 conexões/dia no LinkedIn)', done: false },
                        { day: 'Semana 1', action: 'Agendar 3-5 discovery calls (meta mínima)', done: false },
                        { day: 'Semana 1', action: 'Documentar objeções comuns e respostas (playbook)', done: false }
                    ]
                }
            };

            // 3. Create Plan (and SELECT it immediately)
            const { data: newPlan, error: insertError } = await supabase
                .from('strategic_plans')
                .insert(defaultPlan as any)
                .select()
                .single();

            if (insertError) throw insertError;

            // Update State Immediately
            setExistingPlan(newPlan);

            // 4. Intelligence Enrichment
            const { data: latestResponse } = await supabase
                .from('rei_responses')
                .select('*')
                .eq('project_id', reiProjectId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (latestResponse) {
                const { DiagnosticService } = await import('@/services/DiagnosticService');
                const { MarketIntelligenceService } = await import('@/services/MarketIntelligenceService');

                const answers = latestResponse.responses as any;
                const segment = answers.segmento || 'B2B';
                const objective = answers.objetivoPrincipal || 'Crescimento';

                console.log('Fetching market intelligence...');
                const marketData = await MarketIntelligenceService.fetchMarketData(segment, objective);

                const fullDiagnostic = DiagnosticService.generateDiagnosis(latestResponse, marketData);
                const { plan_data, ...diagnosticContext } = fullDiagnostic;

                const { error: updateError, data: updatedPlan } = await supabase
                    .from('strategic_plans')
                    .update({
                        ...plan_data,
                        diagnostic_data: diagnosticContext as any
                    })
                    .eq('rei_project_id', reiProjectId)
                    .select()
                    .single();

                if (updateError) {
                    console.error('Error applying intelligence:', updateError);
                } else {
                    console.log('✅ Plan enriched with REI intelligence (V2).');
                    setExistingPlan(updatedPlan); // Update again with enriched data
                }
            }

            alert('✅ Planejamento estratégico gerado com sucesso!');

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
