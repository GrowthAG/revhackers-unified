import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import {
    Check,
    ArrowLeft,
    Loader2,
    Zap,
    Target,
    RefreshCw,
    Lock,
    Code,
    Crown,
    Clock,
    FileText,
    Database,
    Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { getReiProjectById } from '@/api/reiProjects';
import { getLatestReiResponse, getReiResponsesByProject } from '@/api/reiResponses'; // Added getReiResponsesByProject
import type { ReiProject } from '@/api/reiProjects';
import type { ReiResponse } from '@/api/reiResponses';
import ReiDashboard from '@/components/rei/ReiDashboard'; // Added ReiDashboard import

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black mb-6 border-b border-zinc-100 pb-2 flex items-center gap-3">
        {children}
    </h3>
);

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("OrchestratedOnboarding Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold mb-4">Algo deu errado.</h2>
                    <Button onClick={() => window.location.reload()} variant="outline">Recarregar Página</Button>
                </div>
            );
        }

        return this.props.children;
    }
}

const OrchestratedOnboarding = ({ embedded = false, projectId: propProjectId }: { embedded?: boolean; projectId?: string }) => {
    const { id: paramId } = useParams();
    const id = propProjectId || paramId;
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [project, setProject] = useState<ReiProject | null>(null);
    const [latestResponse, setLatestResponse] = useState<ReiResponse | null>(null);
    const [history, setHistory] = useState<ReiResponse[]>([]); // New history state
    const [loading, setLoading] = useState(true);

    const steps = [
        { title: 'Fase 01: Onboarding', desc: 'Kickoff & Diagnóstico Profundo' },
        { title: 'Fase 02: Agendamento', desc: 'Reserva de Apresentação' },
        { title: 'Fase 03: Planejamento', desc: 'Estratégia & Roadmap' },
        { title: 'Fase 04: Go Live', desc: 'Implementação & Tração' },
    ];

    const isStepLocked = (stepIndex: number) => {
        if (!project) return true;
        if (project.status === 'active') return false; // Unlock everything for active projects
        if (stepIndex === 0) return false;
        if (stepIndex === 1) return !(latestResponse && latestResponse.total_score > 0);
        if (stepIndex === 2) return !project.scheduling_completed;
        if (stepIndex === 3) return !project.scheduling_completed;
        return false;
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    // Auto-navigate to correct step based on project state
    useEffect(() => {
        if (!project || loading) return;

        // Determine correct step based on progress
        if (project.status === 'active') {
            setCurrentStep(3);
        } else if (project.scheduling_completed) {
            setCurrentStep(2);
        } else if (latestResponse && latestResponse.total_score > 0) {
            setCurrentStep(1);
        } else {
            setCurrentStep(0);
        }
    }, [project, latestResponse, loading]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Validate ID before proceeding
            if (!id || id === 'undefined' || id === 'null' || id.length < 10) {
                console.error("Invalid project ID:", id);
                toast({ title: 'ID do projeto inválido', description: 'Redirecionando para lista de projetos...', variant: 'destructive' });
                setTimeout(() => navigate('/admin/rei'), 1500);
                return;
            }

            const proj = await getReiProjectById(id);

            if (!proj) {
                toast({ title: 'Projeto não encontrado', description: 'Verifique se o projeto existe.', variant: 'destructive' });
                setTimeout(() => navigate('/admin/rei'), 1500);
                return;
            }

            setProject(proj);

            // Fetch all history
            try {
                const allResponses = await getReiResponsesByProject(proj.id);
                setHistory(allResponses);
                setLatestResponse(allResponses.length > 0 ? allResponses[0] : null);
            } catch (historyError) {
                console.warn("Could not load response history:", historyError);
                // Non-critical error, continue without history
            }

        } catch (error: any) {
            console.error("Error loading onboarding data:", error);
            toast({
                title: 'Erro ao carregar dados',
                description: error?.message || 'Não foi possível carregar o projeto. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmScheduling = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('rei_projects')
                .update({ scheduling_completed: true } as never)
                .eq('id', id as string);

            if (error) throw error;

            setProject(prev => prev ? ({ ...prev, scheduling_completed: true } as ReiProject) : null);
            toast({ title: 'Agendamento Confirmado', description: 'Fase de Planejamento Desbloqueada.' });
            setCurrentStep(2);
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao confirmar agendamento.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 0: {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-1">
                                    Fase 01: Setup & Diagnóstico
                                </h3>
                                <p className="text-xs text-zinc-500 max-w-lg leading-relaxed">
                                    Configure as informações vitais do cliente e execute o diagnóstico inicial para calibrar a estratégia.
                                </p>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-black text-white hover:bg-zinc-800 rounded-none h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-lg shadow-zinc-200">
                                        <Zap size={14} className="mr-2" />
                                        {latestResponse ? 'Atualizar Diagnóstico' : 'Iniciar Diagnóstico'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl border-0 p-0 bg-transparent shadow-none">
                                    <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                                        <div className="bg-black p-8 text-center">
                                            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Selecione o Protocolo</h2>
                                            <p className="text-xs text-zinc-400">Escolha a profundidade da análise para este projeto.</p>
                                        </div>
                                        <div className="grid grid-cols-5 divide-x divide-zinc-100">
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=consulting`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-14 h-14 bg-white border border-zinc-100 flex items-center justify-center mb-8 text-black group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Target size={22} strokeWidth={1} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-center mb-3 text-black">Consultoria 360º</h3>
                                                <p className="text-[10px] text-zinc-400 text-center leading-relaxed mb-4 uppercase tracking-widest">Diagnóstico Completo</p>
                                                <div className="text-center">
                                                    <Badge className="bg-zinc-100 text-zinc-500 group-hover:bg-black group-hover:text-white text-[9px] uppercase tracking-widest transition-colors">Recomendado</Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=funnel`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Database size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Funnels & CRM</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Máquina de Vendas</p>
                                            </div>
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=dev`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Code size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Dev Web & Design</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Briefing Técnico</p>
                                            </div>
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=site`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Globe size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Site & LPs</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Presença Digital</p>
                                            </div>
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=founder`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Crown size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Founder Led Sales</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Posicionamento Pessoal</p>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {latestResponse && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 mb-2 cursor-pointer hover:bg-zinc-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 text-zinc-400">
                                                <FileText size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black">Resultado do Diagnóstico</p>
                                                <p className="text-[9px] text-zinc-500">Última atualização: {new Date(latestResponse.completed_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black">
                                            Ver Painel Completo →
                                        </span>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0 border-0 bg-transparent">
                                    <ReiDashboard
                                        type={(((latestResponse as any).responses?.diagnostic_type || (latestResponse as any).diagnostic_type) || 'CONSULTING').toUpperCase() as any}
                                        score={latestResponse.total_score}
                                        radarData={Array.isArray((latestResponse as any).responses?.radar_data) ? (latestResponse as any).responses.radar_data : []}
                                        insights={Array.isArray((latestResponse as any).responses?.insights) ? (latestResponse as any).responses.insights : []}
                                        onAction={() => { }}
                                        clientName={project?.client_name}
                                        answers={((latestResponse as any).responses?.form_data || {}) as Record<string, any>}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Diagnostic Status Card */}
                        <div className="grid grid-cols-12 gap-0 border border-zinc-100">
                            <div className="md:col-span-4 space-y-0 border-r border-zinc-100">
                                <div className="bg-white p-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 font-mono">// DIAGNOSTIC_STATUS</h4>
                                    {latestResponse ? (
                                        <div className="space-y-6">
                                            <div className="text-7xl font-black text-black tracking-ultratight leading-none">{Math.round(latestResponse.total_score)}%</div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Score calculado em {new Date(latestResponse.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Zap className="w-8 h-8 text-zinc-100 mx-auto mb-4" strokeWidth={1} />
                                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Aguardando Início</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-0">
                                <div className="bg-white p-12 border-b border-zinc-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2 mb-8 font-mono">
                                        <Target size={14} strokeWidth={1.5} /> // CONTEXT_ANALYSIS
                                    </h4>
                                    {!latestResponse ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50/30">
                                            <h3 className="text-4xl font-black text-black tracking-ultratight uppercase mb-4">Aguardando Dados</h3>
                                            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                                                O motor de estratégia REI necessita do diagnóstico para calibrar a execução.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-8 border-l-4 border-l-black bg-zinc-50/50">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 font-mono">// HYPOTHESIS_V1</p>
                                                <p className="text-2xl font-medium text-black leading-tight tracking-tight">
                                                    Diagnóstico concluído. Protocolo de tração cirúrgica pronto para implementação.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* History Section */}
                                {history.length > 0 && (
                                    <div className="bg-white border border-zinc-200 p-8 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Histórico de Diagnósticos</h4>
                                        <div className="space-y-4">
                                            {history.map((resp) => (
                                                <Dialog key={resp.id}>
                                                    <DialogTrigger asChild>
                                                        <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 hover:border-zinc-300 cursor-pointer transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold">
                                                                    {Math.round(resp.total_score)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-black">{(resp as any).diagnostic_type || 'Diagnóstico'}</p>
                                                                    <p className="text-[10px] text-zinc-400">{new Date(resp.created_at).toLocaleDateString()} às {new Date(resp.created_at).toLocaleTimeString()}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="text-[10px] uppercase font-bold text-zinc-400 group-hover:text-black">
                                                                Ver Detalhes
                                                            </Button>
                                                        </div>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0 border-0 bg-transparent">
                                                        <ReiDashboard
                                                            type={(((resp as any).responses?.diagnostic_type || (resp as any).diagnostic_type) || 'CONSULTING').toUpperCase() as any}
                                                            score={resp.total_score}
                                                            radarData={Array.isArray((resp as any).responses?.radar_data) ? (resp as any).responses.radar_data : []}
                                                            insights={Array.isArray((resp as any).responses?.insights) ? (resp as any).responses.insights : []}
                                                            onAction={() => { }}
                                                            clientName={project?.client_name}
                                                            answers={((resp as any).responses?.form_data || {}) as Record<string, any>}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >
                );
            }

            case 1: {
                const isDiagnosisDone = latestResponse && latestResponse.total_score > 0;

                if (!isDiagnosisDone) {
                    return (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-zinc-50/50 border border-dashed border-zinc-200">
                            <Lock className="w-8 h-8 text-zinc-300" />
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Etapa Bloqueada</h3>
                                <p className="text-xs text-zinc-500 max-w-sm mt-2">Conclua o Diagnóstico na Etapa 01 para liberar o agendamento.</p>
                            </div>
                            <Button onClick={() => setCurrentStep(0)} variant="outline" size="sm" className="uppercase text-[10px] font-bold">Voltar</Button>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <SectionTitle>Agendamento de Apresentação</SectionTitle>
                            {(project as any)?.scheduling_completed && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-none uppercase text-[9px] tracking-widest">
                                    Agendamento Confirmado
                                </Badge>
                            )}
                        </div>

                        <div className="bg-white border border-zinc-100 p-24 text-center min-h-[500px] flex flex-col items-center justify-center space-y-12">
                            <div className="w-24 h-24 border border-zinc-100 flex items-center justify-center">
                                <Clock className={`w-8 h-8 ${project.scheduling_completed || project.status === 'active' ? 'text-black' : 'text-zinc-200'}`} strokeWidth={1} />
                            </div>
                            <div className="max-w-xl">
                                <h3 className="text-6xl font-black text-black tracking-ultratight uppercase mb-6 leading-none">
                                    {project.scheduling_completed || project.status === 'active' ? 'Data Confirmada' : 'Agendamento'}
                                </h3>
                                <p className="text-sm text-zinc-400 mb-12 leading-relaxed uppercase tracking-widest">
                                    {project.scheduling_completed || project.status === 'active'
                                        ? `O agendamento estratégico está ativo${project.next_rei_date ? ` para ${new Date(project.next_rei_date).toLocaleDateString()}` : ''}.`
                                        : 'Aguardando seleção de slot para apresentação de roadmap.'}
                                </p>
                                <div className="flex flex-col gap-4 items-center">
                                    <Button
                                        onClick={confirmScheduling}
                                        disabled={project.scheduling_completed || project.status === 'active'}
                                        className="bg-black text-white hover:bg-zinc-800 rounded-none h-16 px-12 uppercase text-xs font-black tracking-[0.3em] transition-all disabled:opacity-20"
                                    >
                                        {project.scheduling_completed || project.status === 'active' ? 'CONCLUÍDO' : 'CONFIRMAR AGENDAMENTO'}
                                    </Button>

                                    {(project.scheduling_completed || project.status === 'active') && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black mt-4"
                                        >
                                            AVANÇAR PARA PLANEJAMENTO →
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            case 2: {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionTitle>Planejamento Estratégico</SectionTitle>
                        <div className="bg-white border border-zinc-200 p-8 text-center min-h-[400px] flex items-center justify-center">
                            <div className="max-w-md">
                                <h3 className="text-xl font-bold text-black mb-3">Construção do Roadmap</h3>
                                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">O diagnóstico foi concluído. Agora, vamos estruturar o planejamento estratégico e o roteiro de implementação para o cliente.</p>
                                <Button
                                    onClick={() => navigate(`/admin/planejamento/${id}`)}
                                    className="bg-black text-white hover:bg-zinc-800 rounded-none h-12 px-8 uppercase text-[11px] font-black tracking-[0.2em] shadow-lg shadow-zinc-200 transition-all"
                                >
                                    Abrir Gerador de Planejamento
                                </Button>
                            </div>
                        </div>

                        {/* Summary of Insights if available */}
                        {latestResponse && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                                <div className="p-6 border border-zinc-100 bg-zinc-50/30">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Input do REI</h4>
                                    <div className="text-[11px] text-zinc-500 leading-relaxed italic">
                                        "Diagnóstico concluído com score de {latestResponse.total_score}. Clique acima para sincronizar esses dados com o roadmap estratégico."
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            case 3: {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionTitle>Go Live: Implementação Tática</SectionTitle>
                        <div className="bg-white border border-zinc-200 p-8 text-center min-h-[400px] flex items-center justify-center">
                            <div className="max-w-md">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-black mb-4">Projeto em Execução</h3>
                                <p className="text-sm text-zinc-500">O planejamento foi aprovado. Acompanhe a implementação das ações táticas.</p>
                            </div>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-200" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center h-screen bg-white flex-col gap-6">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-zinc-900 mb-2">Projeto não encontrado</h2>
                    <p className="text-sm text-zinc-500 mb-4">O projeto solicitado não existe ou foi removido.</p>
                </div>
                <Button onClick={() => navigate('/admin/rei')} className="bg-black text-white hover:bg-zinc-800">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Projetos
                </Button>
            </div>
        )
    }

    // Simplified embedded layout (inside ProjectDetails)
    if (embedded) {
        return (
            <ErrorBoundary>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    {/* Minimal Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                                Progresso da Jornada
                            </span>
                            <span className="text-[10px] text-zinc-400">
                                {currentStep + 1} / {steps.length}
                            </span>
                        </div>
                        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-zinc-900 transition-all duration-500 ease-out"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                        {/* Step Pills */}
                        <div className="flex gap-2 mt-4">
                            {steps.map((step, i) => {
                                const isLocked = isStepLocked(i);
                                const isActive = currentStep === i;
                                const isCompleted = currentStep > i;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => !isLocked && setCurrentStep(i)}
                                        disabled={isLocked}
                                        className={`text-[10px] px-3 py-1.5 rounded-full transition-all ${isActive
                                            ? 'bg-zinc-900 text-white'
                                            : isCompleted
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                : isLocked
                                                    ? 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                                                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                            }`}
                                    >
                                        {step.title.split(':')[0]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white border border-zinc-100 rounded-xl p-8">
                        {renderContent()}
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    // Full standalone layout (with AdminPageLayout)
    return (
        <ErrorBoundary>
            <AdminPageLayout
                title={project?.client_company || project?.client_name || 'Projeto'}
                description={`Jornada ${project?.quarter || 'Q1'} ${project?.year || ''} — Onboarding Estratégico`}
                backTo="/admin/rei"
            >
                {/* Progress Bar - Visual indicator of journey progress */}
                <div className="mb-8 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Progresso da Jornada {project?.quarter}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                            Etapa {currentStep + 1} de {steps.length}
                        </span>
                    </div>
                    <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        {steps.map((step, i) => (
                            <span
                                key={i}
                                className={`text-[8px] uppercase tracking-wider ${i <= currentStep ? 'text-black font-bold' : 'text-zinc-300'
                                    }`}
                            >
                                {i + 1}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Steps */}
                    <div className="w-72 shrink-0 border-r border-zinc-100 pr-8">
                        {/* Quarter Badge */}
                        <div className="mb-6 p-4 bg-black text-white text-center">
                            <span className="text-4xl font-black tracking-tighter">{project?.quarter || 'Q1'}</span>
                            <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mt-1">{project?.year}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            {steps.map((step, i) => {
                                const locked = isStepLocked(i);
                                const completed = !locked && i < currentStep;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => !locked && setCurrentStep(i)}
                                        disabled={locked}
                                        className={`flex items-center gap-4 py-4 px-6 text-left transition-all border-l-2 ${currentStep === i
                                            ? 'border-black bg-zinc-50 text-black'
                                            : locked
                                                ? 'border-transparent text-zinc-300 cursor-not-allowed opacity-50'
                                                : completed
                                                    ? 'border-green-500 text-zinc-600 hover:bg-zinc-50'
                                                    : 'border-transparent text-zinc-400 hover:text-black hover:bg-zinc-50/50'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border ${currentStep === i ? 'bg-black text-white border-black' :
                                            locked ? 'bg-zinc-100 text-zinc-300 border-zinc-200' :
                                                completed ? 'bg-green-500 text-white border-green-500' :
                                                    'border-zinc-200 text-zinc-300'
                                            }`}>
                                            {locked ? <Lock size={10} /> : completed ? <Check size={10} /> : i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black tracking-widest uppercase">{step.title}</span>
                                            <span className="text-[9px] text-zinc-400 font-medium hidden lg:block">{step.desc}</span>
                                            {locked && <span className="text-[8px] text-zinc-300 uppercase tracking-widest lg:hidden">Bloqueado</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </AdminPageLayout>
        </ErrorBoundary>
    );
};

export default OrchestratedOnboarding;
