import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import {
    Check,
    ArrowLeft,
    ArrowRight,
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

/**
 * Extracts trade/brand name from full legal name (razão social).
 * "TUNAD MOMENT MARKETING PLATAFORM LTDA" → "Tunad"
 * "REVHACKERS CONSULTORIA LTDA" → "RevHackers"
 * Falls back to client_name if no company name.
 */
function getDisplayName(project: ReiProject | null): string {
    if (!project) return 'Projeto';
    const raw = project.client_company || project.client_name || 'Projeto';
    // Strip common legal suffixes
    const cleaned = raw
        .replace(/\s+(LTDA|EIRELI|S\.?A\.?|ME|EPP|S\/S|SERVICOS|SERVIÇOS|MARKETING|CONSULTORIA|TECNOLOGIA|PLATAFORM|PLATFORM|DIGITAL|SOLUCOES|SOLUÇÕES|MOMENT|GROUP|BRASIL)\b/gi, '')
        .trim();
    // If the cleaned result is just one word or very short, use it as-is
    // Otherwise use the first meaningful word(s)
    const words = cleaned.split(/\s+/);
    const brandName = words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;
    // Title-case the result
    return brandName
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
        || raw;
}

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
    const [planAccessToken, setPlanAccessToken] = useState<string | null>(null);

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
            }

            // Fetch plan access_token for Hub do Cliente button
            try {
                const { data: planData } = await supabase
                    .from('strategic_plans')
                    .select('access_token')
                    .eq('rei_project_id', proj.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (planData?.access_token) {
                    setPlanAccessToken(planData.access_token);
                }
            } catch (planError) {
                console.warn("Could not load plan access_token:", planError);
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
                            {project?.type ? (
                                <Button
                                    onClick={() => navigate(`/rei/wizard?projectId=${id}&type=${project.type}`)}
                                    className="bg-black text-white hover:bg-zinc-800 rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-sm"
                                >
                                    <Zap size={14} className="mr-2" />
                                    {latestResponse ? 'Atualizar Diagnóstico' : 'Iniciar Diagnóstico'}
                                </Button>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-black text-white hover:bg-zinc-800 rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-sm">
                                            <Zap size={14} className="mr-2" />
                                            {latestResponse ? 'Atualizar Diagnóstico' : 'Iniciar Diagnóstico'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg border-0 p-0 bg-transparent shadow-none">
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
                                            <div className="bg-zinc-950 p-6 text-center rounded-t-2xl">
                                                <h2 className="text-lg font-black uppercase tracking-widest text-white mb-1">Selecione o Protocolo</h2>
                                                <p className="text-xs text-zinc-400">Escolha a profundidade da análise para este projeto.</p>
                                            </div>
                                            <div className="divide-y divide-zinc-50">
                                                {[
                                                    { type: 'consulting', label: 'Consultoria 360°', desc: 'Diagnóstico completo de receita e Growth', icon: <Target size={18} />, badge: 'Recomendado' },
                                                    { type: 'crm_ops', label: 'CRM & RevOps', desc: 'Estruturação de CRM, SLA de Vendas e Retenção', icon: <Database size={18} /> },
                                                    { type: 'funnel', label: 'Funnels & Automação', desc: 'Funis, automações e jornada de conversão', icon: <Zap size={18} /> },
                                                    { type: 'dev', label: 'Dev Web & Design', desc: 'Briefing técnico para sites e plataformas', icon: <Code size={18} /> },
                                                    { type: 'site', label: 'Site & Landing Pages', desc: 'Presença digital e LP de alta conversão', icon: <Globe size={18} /> },
                                                    { type: 'founder', label: 'Founder Led Sales', desc: 'Posicionamento pessoal do fundador', icon: <Crown size={18} /> },
                                                ].map((item) => (
                                                    <button
                                                        key={item.type}
                                                        onClick={() => navigate(`/rei/wizard?projectId=${id}&type=${item.type}`)}
                                                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-zinc-50 transition-all group rounded-lg"
                                                    >
                                                        <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950 transition-colors shrink-0">
                                                            {item.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-black uppercase tracking-tight">{item.label}</p>
                                                            <p className="text-xs text-zinc-400">{item.desc}</p>
                                                        </div>
                                                        {item.badge && (
                                                            <Badge className="bg-zinc-100 text-zinc-500 group-hover:bg-black group-hover:text-white text-[9px] uppercase tracking-widest transition-colors shrink-0">{item.badge}</Badge>
                                                        )}
                                                        <ArrowRight className="w-4 h-4 text-zinc-200 group-hover:text-black transition-colors shrink-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
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
                                <Badge className="bg-[#00CC6A]/10 text-[#00CC6A] hover:bg-[#00CC6A]/10 rounded-md uppercase text-[9px] font-black tracking-widest border-0">
                                    Agendamento Confirmado
                                </Badge>
                            )}
                        </div>

                        <div className="bg-white border border-zinc-100 p-16 md:p-24 text-center min-h-[500px] flex flex-col items-center justify-center space-y-12">
                            <div className="w-24 h-24 border border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50">
                                <Clock className={`w-8 h-8 ${project.scheduling_completed || project.status === 'active' ? 'text-black' : 'text-zinc-500'}`} strokeWidth={1} />
                            </div>
                            <div className="max-w-xl w-full">
                                <h3 className="text-4xl md:text-5xl font-black text-black tracking-ultratight uppercase mb-4 leading-none">
                                    {project.scheduling_completed || project.status === 'active' ? 'Data Confirmada' : 'Agendamento'}
                                </h3>
                                
                                {!project.scheduling_completed && project.status !== 'active' ? (
                                    <div className="space-y-8 bg-zinc-50 p-8 rounded-2xl border border-zinc-200 text-left">
                                        <div className="space-y-4">
                                            <p className="text-sm text-zinc-600 font-medium">
                                                Para avançar para o planejamento, o cliente precisa selecionar uma data para a reunião de Kickoff/Apresentação.
                                            </p>
                                            <div className="flex flex-col gap-3 mt-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold">1</div>
                                                    <p className="text-xs text-zinc-700 font-medium">Envie o link de agendamento para o cliente</p>
                                                </div>
                                                <div className="flex gap-2 ml-9">
                                                    <Button 
                                                        variant="outline" 
                                                        className="text-xs font-bold w-full uppercase tracking-wider"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText('https://revhackers.com/agenda-kickoff');
                                                            toast({ title: 'Link Copiado!', description: 'Envie para o cliente via WhatsApp ou Email.' });
                                                        }}
                                                    >
                                                        Copiar Link de Agenda
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                                                <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold">2</div>
                                                <p className="text-xs text-zinc-700 font-medium">Após o cliente agendar, confirme manualmente abaixo</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400 mb-12 leading-relaxed uppercase tracking-widest">
                                        O agendamento estratégico está ativo{project.next_rei_date ? ` para ${new Date(project.next_rei_date).toLocaleDateString()}` : ''}.
                                    </p>
                                )}

                                <div className="flex flex-col gap-4 items-center mt-8">
                                    <Button
                                        onClick={confirmScheduling}
                                        disabled={project.scheduling_completed || project.status === 'active'}
                                        className="bg-black text-white hover:bg-zinc-800 rounded-xl h-14 px-12 uppercase text-xs font-black tracking-[0.2em] transition-all disabled:opacity-50"
                                    >
                                        {project.scheduling_completed || project.status === 'active' ? 'CONCLUÍDO' : 'Marcar como Agendado'}
                                    </Button>

                                    {(project.scheduling_completed || project.status === 'active') && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black mt-2"
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
                                    className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl h-12 px-8 uppercase text-[11px] font-black tracking-[0.2em] shadow-sm transition-all"
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
                        <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-1">
                                    Fase 04: Go Live
                                </h3>
                                <p className="text-xs text-zinc-500 max-w-lg leading-relaxed">
                                    O projeto está em fase de implementação. Use os atalhos abaixo para gerenciar a execução.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">
                                    Em Execução
                                </span>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-zinc-950 rounded-2xl p-8 md:p-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 border border-[#00CC6A]/20 rounded-xl flex items-center justify-center">
                                        <Check className="w-5 h-5 text-[#00CC6A]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">Projeto Ativo</p>
                                        <p className="text-[10px] text-zinc-500">
                                            Iniciado em {project?.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : '-'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                                    Ciclo {project?.quarter} {project?.year}
                                </span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                {getDisplayName(project)}
                            </h3>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate(`/admin/planejamento/${id}`)}
                                className="flex items-start gap-4 p-6 border border-zinc-200 rounded-2xl bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left group"
                            >
                                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors">
                                    <FileText className="w-4 h-4 text-zinc-900 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1">Plano Estratégico</p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">Abrir gerador de planejamento e roadmap</p>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    window.open(`/hub/${id}`, '_blank');
                                }}
                                className="flex items-start gap-4 p-6 border border-zinc-200 rounded-2xl bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left group"
                            >
                                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors">
                                    <Globe className="w-4 h-4 text-zinc-900 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1">Hub do Cliente</p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">Portal público do projeto</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate(`/admin/projects/${id}?tab=biblioteca`)}
                                className="flex items-start gap-4 p-6 border border-zinc-200 rounded-2xl bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left group"
                            >
                                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors">
                                    <Database className="w-4 h-4 text-zinc-900 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1">Wiki & Documentos</p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">Repositório de arquivos e entregáveis</p>
                                </div>
                            </button>
                        </div>

                        {/* Diagnostic Summary */}
                        {latestResponse && (
                            <div className="border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center">
                                            <Target className="w-4 h-4 text-zinc-900" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Score do Diagnóstico</p>
                                            <p className="text-lg font-black text-zinc-900">{Math.round(latestResponse.total_score)}%</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-medium">
                                        {new Date(latestResponse.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        )}
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
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${isActive
                                            ? 'bg-zinc-900 text-white'
                                            : isCompleted
                                                ? 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20'
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
                title={getDisplayName(project)}
                description={`Jornada ${project?.quarter || 'Q1'} ${project?.year || ''} - Onboarding Estratégico`}
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
                                                    ? 'border-[#00CC6A] text-zinc-600 hover:bg-zinc-50'
                                                    : 'border-transparent text-zinc-400 hover:text-black hover:bg-zinc-50/50'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border ${currentStep === i ? 'bg-black text-white border-black' :
                                            locked ? 'bg-zinc-100 text-zinc-300 border-zinc-200' :
                                                completed ? 'bg-[#00CC6A] text-white border-[#00CC6A]' :
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
