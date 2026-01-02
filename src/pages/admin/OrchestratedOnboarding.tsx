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
    Crown
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

const OrchestratedOnboarding = () => {
    const { id } = useParams();
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
        if (stepIndex === 0) return false;
        if (stepIndex === 1) return !(latestResponse && latestResponse.total_score > 0);
        if (stepIndex === 2) return !project.scheduling_completed;
        if (stepIndex === 3) return !project.scheduling_completed;
        return false;
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const proj = await getReiProjectById(id!);
            if (proj) {
                setProject(proj);
                // Fetch all history
                const allResponses = await getReiResponsesByProject(proj.id);
                setHistory(allResponses);
                setLatestResponse(allResponses.length > 0 ? allResponses[0] : null);
            }
        } catch (error) {
            console.error("Error loading onboarding data:", error);
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
                                        <div className="grid grid-cols-3 divide-x divide-zinc-100">
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=consulting`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Target size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Consultoria 360º</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Diagnóstico Completo (Padrão)</p>
                                                <div className="text-center">
                                                    <Badge className="bg-zinc-100 text-zinc-500 group-hover:bg-black group-hover:text-white text-[9px] uppercase tracking-widest transition-colors">Recomendado</Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 hover:bg-zinc-50 transition-colors group cursor-pointer relative" onClick={() => navigate(`/rei/wizard?projectId=${id}&type=dev`)}>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors mx-auto">
                                                    <Code size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-center mb-3 text-black">Dev Web & Design</h3>
                                                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mb-6">Briefing Técnico</p>
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

                        {/* Diagnostic Status Card */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="md:col-span-4 space-y-6">
                                <div className="bg-white border border-zinc-200 p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Status do Diagnóstico</h4>
                                    {latestResponse ? (
                                        <div className="space-y-4">
                                            <Badge className="bg-green-100 text-green-700 rounded-none text-[9px] uppercase tracking-widest">Completo</Badge>
                                            <p className="text-2xl font-black text-black">{Math.round(latestResponse.total_score)}/100</p>
                                            <p className="text-xs text-zinc-500">Score calculado em {new Date(latestResponse.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Zap className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
                                            <p className="text-xs text-zinc-400">Nenhum diagnóstico realizado</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-6">
                                <div className="bg-white border border-zinc-200 p-8 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-6">
                                        <Target size={14} /> Diagnóstico de Contexto
                                    </h4>
                                    {!latestResponse ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50/50 border border-zinc-100 rounded-sm">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                <Zap className="text-zinc-300" size={24} />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">Diagnóstico Não Iniciado</h3>
                                            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6 leading-relaxed">
                                                Para destravar o agendamento e o planejamento estratégico, é necessário completar o diagnóstico inicial do cliente.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-zinc-50 border-l-2 border-l-black">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Hipótese Inicial</p>
                                                <p className="text-sm font-medium text-black leading-relaxed">
                                                    Diagnóstico concluído com score de {latestResponse.total_score}. Pronto para a próxima fase.
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
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-black">{resp.diagnostic_type}</p>
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
                                                            type={resp.diagnostic_type.toUpperCase() as any}
                                                            score={resp.total_score}
                                                            radarData={Array.isArray(resp.radar_data) ? (resp.radar_data as any) : []}
                                                            insights={Array.isArray(resp.insights) ? (resp.insights as string[]) : []}
                                                            onAction={() => { }}
                                                            clientName={project?.client_name}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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

                        <div className="bg-white border border-zinc-200 p-8 text-center min-h-[400px] flex items-center justify-center">
                            <div className="max-w-md">
                                <h3 className="text-lg font-black text-black mb-4">Calendário de Agendamento</h3>
                                <p className="text-sm text-zinc-500 mb-6">Selecione um horário para a apresentação do planejamento estratégico.</p>
                                <Button onClick={confirmScheduling} disabled={(project as any)?.scheduling_completed} className="bg-black text-white hover:bg-zinc-800 rounded-none h-10 px-6 uppercase text-[10px] font-black tracking-widest">
                                    {(project as any)?.scheduling_completed ? 'Agendado' : 'Confirmar Agendamento'}
                                </Button>
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
                                <h3 className="text-lg font-black text-black mb-4">Construção do Roadmap</h3>
                                <p className="text-sm text-zinc-500 mb-6">Nesta fase, elaboramos o planejamento estratégico completo baseado no diagnóstico.</p>
                                <Button onClick={() => navigate(`/admin/planejamento/${id}`)} className="bg-black text-white hover:bg-zinc-800 rounded-none h-10 px-6 uppercase text-[10px] font-black tracking-widest">
                                    Acessar Planejamento
                                </Button>
                            </div>
                        </div>
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

    return (
        <AdminPageLayout
            title={project?.client_name || 'Projeto'}
            description="Jornada de Onboarding"
            backTo="/admin/rei"
        >
            <div className="flex gap-8">
                {/* Sidebar Steps */}
                <div className="w-72 shrink-0 border-r border-zinc-100 pr-8">
                    <div className="flex flex-col gap-1">
                        {steps.map((step, i) => {
                            const locked = isStepLocked(i);
                            return (
                                <button
                                    key={i}
                                    onClick={() => !locked && setCurrentStep(i)}
                                    disabled={locked}
                                    className={`flex items-center gap-4 py-4 px-6 text-left transition-all border-l-2 ${currentStep === i
                                        ? 'border-black bg-zinc-50 text-black'
                                        : locked
                                            ? 'border-transparent text-zinc-300 cursor-not-allowed opacity-50'
                                            : 'border-transparent text-zinc-400 hover:text-black hover:bg-zinc-50/50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border ${currentStep === i ? 'bg-black text-white border-black' :
                                        locked ? 'bg-zinc-100 text-zinc-300 border-zinc-200' :
                                            'border-zinc-200 text-zinc-300'
                                        }`}>
                                        {locked ? <Lock size={10} /> : i + 1}
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
    );
};

export default OrchestratedOnboarding;
