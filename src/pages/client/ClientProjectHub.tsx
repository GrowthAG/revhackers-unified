import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPublicReiProjectById, type ReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Clock, Shield, FileText, LayoutTemplate, MessageSquare, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HubNpsBlocker } from '@/components/client/HubNpsBlocker';

const scopeByType: Record<string, string[]> = {
    crm_ops: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Uso dos Dashboards Nativos do CRM',
    ],
    founder: [
        'Diagnóstico de Posicionamento Digital',
        'Otimização de Perfil LinkedIn',
        'Estratégia de Conteúdo & Calendário',
        'Framework de Social Selling',
        'Benchmark de Contas Âncora',
        'Métricas de Engajamento & Conversão',
    ],
    site: [
        'Briefing Técnico Completo',
        'Wireframes e Aprovação de UX',
        'Design de Alta Fidelidade',
        'Desenvolvimento Front-end & Back-end',
        'Testes de Performance (LCP/GTmetrix)',
        'Go Live e Monitoramento',
    ],
    default: [
        'Diagnóstico de Receita Profundo (360º)',
        'Roadmap de Implementação de 90 dias',
        'Setup de CRM & Ferramentas de Vendas',
        'Playbook de Vendas (V1)',
        'Treinamento do Time Comercial',
        'Uso de Dashboards Nativos da Ferramenta',
    ],
};

// ── 3-Horizon Sprint Map ────────────────────────────────────────────────
const SPRINT_NAMES: Record<string, string[]> = {
    consulting:   ['Raio-X 360º', 'Engenharia de Receita', 'Ativação de Demanda', 'Escala & Governança'],
    crm_ops:      ['Diagnóstico & Arquitetura', 'Setup & Pipelines', 'Automação & Atrito', 'Governança & Adoção'],
    founder:      ['Posicionamento & Perfil', 'Conteúdo Âncora', 'Cadência & Volume', 'Loop de Conversão'],
    site:         ['Briefing & Wireframe', 'Design & Copy', 'Desenvolvimento', 'QA & Lançamento'],
    default:      ['Diagnóstico & Fundação', 'Geração de Demanda', 'Ativação & Onboarding', 'Expansão & Motor'],
};

// Taglines dinâmicas por duração real do projeto (30/60/90/180/360 dias)
const DURATION_TAGLINES: Record<string, string[]> = {
    '30':  ['Sem 1',   'Sem 2',   'Sem 3',   'Sem 4'],
    '60':  ['Sem 1–2', 'Sem 3–4', 'Sem 5–6', 'Sem 7–8'],
    '90':  ['Sem 1–2', 'Sem 2–4', 'Sem 5–8', 'Mês 3'],
    '180': ['Mês 1–2', 'Mês 2–3', 'Mês 3–5', 'Mês 5–6'],
    '360': ['Tri 1',   'Tri 2',   'Tri 3',   'Tri 4'],
};

// Normaliza project_duration para chave numérica (aceita '90 dias' ou '90')
const normalizeDuration = (raw: string | null): string => {
    if (!raw) return '90';
    return raw.replace(/\s*dias?/i, '').trim() || '90';
};

const getSprintTaglines = (duration: string | null): string[] => {
    const key = normalizeDuration(duration);
    return DURATION_TAGLINES[key] || DURATION_TAGLINES['90'];
};

const CATEGORY_LABELS: Record<string, string> = {
    'geral': 'Visão Geral',
    'kickoff': 'Kickoff & Alinhamento',
    'transcr': 'Transcrições e Reuniões',
    'strategy': 'Planejamento e Estratégia',
    'tech': 'Documentação Técnica',
    'playbook': 'Playbooks e SOPs',
    'final': 'Entregáveis Finais',
    'acessos': 'Acessos e Referências'
};

const ClientProjectHub = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Partial<ReiProject> | null>(null);
    const [planToken, setPlanToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientDocs, setClientDocs] = useState<any[]>([]);
    const [npsUnlocked, setNpsUnlocked] = useState(false);
    
    // Orqflow Live Data State
    const [liveTasks, setLiveTasks] = useState<any[]>([]);
    const [liveSprints, setLiveSprints] = useState<any[]>([]);

    useEffect(() => {
        const loadProject = async () => {
            if (!id) return;
            try {
                // 1. Fetch Project Public Data
                const data = await getPublicReiProjectById(id);
                if (data) {
                    setProject(data);
                    
                    // Fire-and-forget: Log client access (Health Score Analytics - Phase 20)
                    supabase.from('rei_projects')
                        .update({ last_login_at: new Date().toISOString() } as any)
                        .eq('id', id)
                        .then(({ error }) => {
                            if (error) console.warn('RLS might block direct update, consider RPC for login tracking.', error);
                        });
                }

                // 2. Fetch Plan Token if exists (for button link)
                const { data: planData } = await (supabase.from('strategic_plans') as any)
                    .select('access_token')
                    .eq('rei_project_id', id)
                    .maybeSingle();

                if (planData) setPlanToken(planData.access_token);

                // 2.5 Fetch NPS Status
                const localNps = localStorage.getItem(`rei_nps_unlocked_${id}`);
                if (localNps === 'true') {
                    setNpsUnlocked(true);
                } else {
                    const { data: npsData } = await (supabase as any)
                        .rpc('has_public_nps_response', { p_project_id: id });

                    if (npsData) {
                        setNpsUnlocked(true);
                        localStorage.setItem(`rei_nps_unlocked_${id}`, 'true');
                    }
                }

                // 3. Fetch Official Handover Documentation
                const { data: libId } = await (supabase as any)
                    .rpc('get_public_knowledge_library_id', { p_project_id: id });

                if (libId) {
                    const { data: docs } = await (supabase as any)
                        .rpc('get_public_shared_documents', { p_library_id: libId });

                    if (docs) setClientDocs(docs);
                }

                // 4. Fetch Live Orqflow Secure Data (The Heartbeat)
                // RPCs publicas escopadas por project_id (as tabelas nao tem
                // policy anonima - ver 20260718000000_secure_hub_public_access.sql)
                const { data: sprintsData } = await (supabase as any)
                    .rpc('get_public_project_sprints', { p_project_id: id });

                if (sprintsData) setLiveSprints(sprintsData);

                const { data: tasksData } = await (supabase as any)
                    .rpc('get_public_project_tasks', { p_project_id: id });

                if (tasksData) setLiveTasks(tasksData);

            } catch (error) {
                console.error("Error loading project hub:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-zinc-900 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <Shield className="w-12 h-12 text-zinc-200 mb-6" />
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Restrito</h1>
                <p className="text-zinc-500 text-sm">O projeto solicitado não foi encontrado ou o link expirou.</p>
            </div>
        );
    }

    // --- LOGIC: DETERMINE CURRENT PHASE & CTA ---
    const getPhaseStatus = () => {
        if (planToken) return 'execution';
        const isScheduled = project.scheduling_completed;
        if (!isScheduled) return 'scheduling';
        return 'execution';
    };

    const currentPhase = getPhaseStatus();
    
    // ── 3-Horizon derivation ─────────────────────────────────────────────────
    const projectType = (project as any).type?.trim().toLowerCase() || 'default';
    const projectDurationRaw = (project as any).project_duration as string | null;
    const projectDuration = normalizeDuration(projectDurationRaw); // '30' | '60' | '90' | '180' | '360'
    const durationLabel = `${projectDuration} dias`;
    const sprintNames = SPRINT_NAMES[projectType] || SPRINT_NAMES.default;
    const sprintTaglines = getSprintTaglines(projectDuration);

    // Live sprint progress from Orqflow
    const activeSprint = liveSprints.find((s: any) => s.status === 'active') || liveSprints[0] || null;
    const sprintTasks = activeSprint ? liveTasks.filter((t: any) => t.sprint_id === activeSprint.id) : liveTasks;
    const doneTasks = sprintTasks.filter((t: any) => t.status === 'done');
    const progressPct = sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0;
    const recentDeliveries = liveTasks.filter((t: any) => t.status === 'done').slice(0, 3);
    const upcomingTasks = liveTasks.filter((t: any) => t.status !== 'done').slice(0, 2);
    const reviewTasks = liveTasks.filter((t: any) => t.status === 'review');

    // Determine active sprint index (0-3) for the Horizon stepper
    const activeSprintIndex = activeSprint
        ? liveSprints.findIndex((s: any) => s.id === activeSprint.id)
        : (liveSprints.length > 0 ? 0 : -1);

    // Days remaining in active sprint
    const daysLeftInSprint = activeSprint?.end_date
        ? Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86_400_000)
        : null;

    // ── Expected end date: next_rei_date + project_duration (no DB column needed) ──
    const computedEndDate = (() => {
        const raw = (project as any).next_rei_date as string | null;
        if (!raw) return null;
        const start = new Date(raw);
        const days = parseInt(projectDuration, 10);
        if (isNaN(days)) return null;
        return new Date(start.getTime() + days * 86_400_000);
    })();
    const isProjectOver = computedEndDate ? Date.now() >= computedEndDate.getTime() : false;

    type HorizonKey = 'pre_projeto' | 'execucao' | 'sustentacao';
    const activeHorizon: HorizonKey =
        (project as any).status === 'completed' || isProjectOver ? 'sustentacao' :
        project.scheduling_completed ? 'execucao' : 'pre_projeto';

    const handleViewSchedule = () => {
        if (planToken) {
            window.open(`/plan/${planToken}`, '_blank');
        } else {
            document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ── Contexto da Próxima Ação ───────────────────────────────────────────────
    type CtaCtx = { urgency: 'high' | 'medium' | 'low'; headline: string; body: string; primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryAction?: () => void; };
    const ctaCtx: CtaCtx = (() => {
        const mailtoAnalyst = project.analyst_email
            ? `mailto:${project.analyst_email}`
            : '#';

        if (activeHorizon === 'sustentacao') return {
            urgency: 'low',
            headline: 'Fase de Sustentação.',
            body: 'O ciclo de execução foi concluído. Seu analista agendará o QBR trimestral para garantir que os resultados se mantenham e continuem crescendo.',
            primaryLabel: 'Agendar QBR',
            primaryHref: `${mailtoAnalyst}?subject=Agendamento QBR`,
        };

        if (activeHorizon === 'pre_projeto') {
            // Advisory waiting for first call
            if (projectType === 'advisory') return {
                urgency: 'medium',
                headline: 'Aguardando Kickoff Advisory.',
                body: `Seu analista entrará em contato para agendar a Call de Kickoff e iniciar o ciclo de ${durationLabel} de orientação estratégica.`,
                primaryLabel: 'Falar com Analista',
                primaryHref: mailtoAnalyst,
                secondaryLabel: planToken ? 'Acessar Plano' : undefined,
                secondaryAction: planToken ? () => window.open(`/plan/${planToken}`, '_blank') : undefined,
            };
            return {
                urgency: 'medium',
                headline: 'Aguardando Kickoff.',
                body: `Seu diagnóstico foi analisado pelo nosso time. Seu analista entrará em contato para agendar o Start Oficial e apresentar seu Roadmap de ${durationLabel}.`,
                primaryLabel: 'Falar com Analista',
                primaryHref: mailtoAnalyst,
                secondaryLabel: planToken ? 'Acessar Plano' : undefined,
                secondaryAction: planToken ? () => window.open(`/plan/${planToken}`, '_blank') : undefined,
            };
        }

        // ── Advisory-specific CTAs during execution ──────────────────────────
        if (projectType === 'advisory') {
            if (daysLeftInSprint !== null && daysLeftInSprint <= 5 && daysLeftInSprint >= 0) return {
                urgency: 'high',
                headline: `Call de orientação em ${daysLeftInSprint === 0 ? 'hoje' : `${daysLeftInSprint} dia${daysLeftInSprint > 1 ? 's' : ''}`}.`,
                body: 'Revise os encaminhamentos da última sessão e anote suas dúvidas antes da próxima call de orientação.',
                primaryLabel: 'Preparar para a Call',
                primaryHref: `${mailtoAnalyst}?subject=Preparação Call Advisory`,
            };
            if (reviewTasks.length > 0) return {
                urgency: 'high',
                headline: `${reviewTasks.length} documento${reviewTasks.length > 1 ? 's' : ''} aguardando sua revisão.`,
                body: 'Seu analista entregou frameworks ou playbooks para sua aprovação. Revise antes da próxima sessão.',
                primaryLabel: 'Revisar Documentos',
                primaryHref: `${mailtoAnalyst}?subject=Revisão de Documentos Advisory`,
            };
            return {
                urgency: 'low',
                headline: 'Orientação em Andamento.',
                body: `Ciclo ${activeSprintIndex >= 0 ? `0${activeSprintIndex + 1}` : ''} - ${activeSprint?.name || sprintNames[Math.max(activeSprintIndex, 0)]}. Execute o plano e registre o progresso. Sua próxima call de orientação está agendada.`,
                primaryLabel: 'Falar com Analista',
                primaryHref: `${mailtoAnalyst}?subject=Orientação Advisory`,
                secondaryLabel: planToken ? 'Acessar Plano' : 'Ver Roadmap',
                secondaryAction: handleViewSchedule,
            };
        }

        if (reviewTasks.length > 0) return {
            urgency: 'high',
            headline: `${reviewTasks.length} entregável${reviewTasks.length > 1 ? 'is' : ''} aguardando sua aprovação.`,
            body: `${reviewTasks.map((t: any) => t.title).slice(0, 2).join(' e ')}${reviewTasks.length > 2 ? ` e mais ${reviewTasks.length - 2}` : ''}. Revise e aprove para o time seguir.`,
            primaryLabel: 'Falar com Analista',
            primaryHref: `${mailtoAnalyst}?subject=Aprovação de entregáveis`,
        };

        if (daysLeftInSprint !== null && daysLeftInSprint <= 7 && daysLeftInSprint >= 0) return {
            urgency: 'high',
            headline: `Sprint encerra em ${daysLeftInSprint === 0 ? 'hoje' : `${daysLeftInSprint} dia${daysLeftInSprint > 1 ? 's' : ''}`}.`,
            body: `O sprint “${activeSprint?.name || sprintNames[activeSprintIndex]}” está chegando ao fim. Agende a revisão com seu analista para validar as entregas e dar start no próximo ciclo.`,
            primaryLabel: 'Agendar Revisão de Sprint',
            primaryHref: `${mailtoAnalyst}?subject=Revisão de Sprint`,
        };

        return {
            urgency: 'low',
            headline: 'Execução em Andamento.',
            body: `Sprint ${activeSprintIndex >= 0 ? `0${activeSprintIndex + 1}` : ''} - ${activeSprint?.name || sprintNames[Math.max(activeSprintIndex, 0)]} - ${progressPct}% concluído. Seu analista está operando o projeto. Agende uma apresentação estratégica quando quiser.`,
            primaryLabel: 'Agendar Apresentação',
            primaryHref: `${mailtoAnalyst}?subject=Apresentação Estratégica`,
            secondaryLabel: planToken ? 'Acessar Plano' : 'Ver Cronograma',
            secondaryAction: handleViewSchedule,
        };
    })();

    // Derived state determining if they should see the Blocker
    const shouldShowNpsBlocker = currentPhase === 'execution' && !npsUnlocked;

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-inter selection:bg-zinc-900 selection:text-white">
            {shouldShowNpsBlocker && (
                <HubNpsBlocker 
                    projectId={id!} 
                    clientName={project.client_name?.split(' ')[0] || 'Cliente'} 
                    onUnlock={() => setNpsUnlocked(true)} 
                />
            )}
            {/* 1. HEADER */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 w-full z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                            <span className="font-bold text-white text-xs tracking-wider">
                                {((project as any).trade_name || (project as any).client_company || project.client_name || 'CL').substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-zinc-900 leading-none mb-1">
                                {(project as any).trade_name || (project as any).client_company || project.client_name}
                            </h1>
                            <p className="text-xxs text-zinc-500 uppercase tracking-widest font-medium">Growth Hub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="text-xxs font-medium text-zinc-600 uppercase tracking-wider">
                                Ciclo 1 • {new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                            <span className="text-xs font-bold text-[#00CC6A] uppercase tracking-wider">Ativo</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. HERO / MAIN ACTION */}
            <main className="pt-12 pb-20 px-6">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* PROXIMA ACAO - Contextual */}
                    <div className={cn(
                        "border p-8 md:p-12 relative overflow-hidden transition-all",
                        ctaCtx.urgency === 'high'
                            ? "bg-zinc-900 border-zinc-800"
                            : "bg-white border-zinc-200 shadow-sm"
                    )}>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Badge className={cn(
                                    "border-0 uppercase tracking-widest text-2xs pl-2 pr-3 py-1.5 font-black",
                                    ctaCtx.urgency === 'high'
                                        ? "bg-white text-zinc-900 hover:bg-zinc-100"
                                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                                )}>
                                    <span className={cn("w-1.5 h-1.5 mr-2", ctaCtx.urgency === 'high' ? "bg-zinc-900" : "bg-white")} />
                                    Próxima Ação
                                </Badge>
                                {ctaCtx.urgency === 'high' && (
                                    <span className="text-2xs font-black uppercase tracking-widest text-[#00CC6A] border border-[#00CC6A]/30 bg-[#00CC6A]/10 px-2 py-1">
                                        Requer Atenção
                                    </span>
                                )}
                            </div>

                            <h2 className={cn(
                                "text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.05]",
                                ctaCtx.urgency === 'high' ? "text-white" : "text-zinc-900"
                            )}>
                                {ctaCtx.headline}
                            </h2>

                            <p className={cn(
                                "text-lg leading-relaxed mb-8 max-w-lg font-normal",
                                ctaCtx.urgency === 'high' ? "text-zinc-400" : "text-zinc-500"
                            )}>
                                {ctaCtx.body}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    className={cn(
                                        "h-12 px-8 font-medium text-sm shadow-sm",
                                        ctaCtx.urgency === 'high'
                                            ? "bg-white text-zinc-900 hover:bg-zinc-100"
                                            : "bg-zinc-900 hover:bg-zinc-800 text-white"
                                    )}
                                    onClick={() => window.open(ctaCtx.primaryHref, '_blank')}
                                >
                                    {ctaCtx.primaryLabel} <MessageSquare className="w-4 h-4 ml-2" />
                                </Button>
                                {ctaCtx.secondaryLabel && (
                                    <Button
                                        variant="outline"
                                        onClick={ctaCtx.secondaryAction}
                                        className={cn(
                                            "h-12 px-8 font-medium text-sm",
                                            ctaCtx.urgency === 'high'
                                                ? "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                        )}
                                    >
                                        {ctaCtx.secondaryLabel}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3-HORIZON STEPPER */}
                    <div id="timeline" className="scroll-mt-24">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2 pl-1">
                            <LayoutTemplate className="w-4 h-4" /> Horizonte do Projeto
                        </h3>

                        {/* Horizon blocks */}
                        <div className="flex flex-col gap-2">

                            {/* Horizonte 0: Pré-Projeto */}
                            <div className={cn(
                                "border transition-all",
                                activeHorizon === 'pre_projeto'
                                    ? "bg-zinc-900 border-zinc-800"
                                    : "bg-white border-zinc-200 opacity-60"
                            )}>
                                <div className="flex items-center gap-4 p-4">
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center shrink-0 font-mono text-xs font-bold",
                                        activeHorizon === 'pre_projeto' ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500"
                                    )}>H0</div>
                                    <div className="flex-1">
                                        <p className={cn("text-xxs uppercase tracking-widest font-bold",
                                            activeHorizon === 'pre_projeto' ? "text-zinc-400" : "text-zinc-400"
                                        )}>Pré-Projeto</p>
                                        <p className={cn("text-sm font-bold",
                                            activeHorizon === 'pre_projeto' ? "text-white" : "text-zinc-600"
                                        )}>Setup & Alinhamento</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 text-2xs font-black uppercase tracking-widest",
                                        activeHorizon === 'pre_projeto'
                                            ? "bg-white text-zinc-900"
                                            : "bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20"
                                    )}>
                                        {activeHorizon === 'pre_projeto' ? 'Ativo' : 'Concluído'}
                                    </div>
                                </div>
                            </div>

                            {/* Horizonte 1: Execução com sprints */}
                            <div className={cn(
                                "border transition-all",
                                activeHorizon === 'execucao'
                                    ? "bg-zinc-900 border-zinc-800"
                                    : activeHorizon === 'sustentacao' ? "bg-white border-zinc-200 opacity-60" : "bg-white border-zinc-200"
                            )}>
                                <div className="flex items-center gap-4 p-4 border-b border-zinc-800/20">
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center shrink-0 font-mono text-xs font-bold",
                                        activeHorizon === 'execucao' ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500"
                                    )}>H1</div>
                                    <div className="flex-1">
                                        <p className="text-xxs uppercase tracking-widest font-bold text-zinc-400">Execução</p>
                                        <p className={cn("text-sm font-bold",
                                            activeHorizon === 'execucao' ? "text-white" : "text-zinc-600"
                                        )}>{durationLabel} de {projectType === 'advisory' ? 'orientação estratégica' : projectType === 'consulting' ? 'implementação' : 'construção'}</p>
                                    </div>
                                    {activeHorizon === 'execucao' && liveTasks.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1 bg-zinc-700">
                                                <div className="h-full bg-[#00CC6A] transition-all" style={{ width: `${progressPct}%` }} />
                                            </div>
                                            <span className="text-xxs text-zinc-400 font-mono">{progressPct}%</span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "px-2 py-1 text-2xs font-black uppercase tracking-widest",
                                        activeHorizon === 'execucao'
                                            ? "bg-white text-zinc-900"
                                            : activeHorizon === 'sustentacao' ? "bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20" : "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {activeHorizon === 'execucao' ? 'Ativo' : activeHorizon === 'sustentacao' ? 'Concluído' : 'Aguardando'}
                                    </div>
                                </div>

                                {/* Sprint grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-zinc-200 md:border-zinc-800/20">
                                    {sprintNames.map((name, i) => {
                                        const isActiveSprint = activeHorizon === 'execucao' && i === activeSprintIndex;
                                        const isDoneSprint = activeHorizon === 'execucao'
                                            ? i < activeSprintIndex
                                            : activeHorizon === 'sustentacao';
                                        return (
                                            <div key={i} className={cn(
                                                "p-4 flex flex-col gap-1",
                                                isActiveSprint ? "bg-zinc-800" : ""
                                            )}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isDoneSprint ? (
                                                        <Check className="w-3 h-3 text-[#00CC6A] shrink-0" />
                                                    ) : isActiveSprint ? (
                                                        <div className="w-2 h-2 bg-[#00CC6A] animate-pulse shrink-0" />
                                                    ) : (
                                                        <div className={cn(
                                                            "w-2 h-2 shrink-0",
                                                            activeHorizon === 'execucao' ? "bg-zinc-700" : "bg-zinc-200"
                                                        )} />
                                                    )}
                                                    <span className={cn(
                                                        "font-mono text-2xs font-bold uppercase tracking-wider",
                                                        activeHorizon === 'execucao' ? "text-zinc-400" : "text-zinc-400"
                                                    )}>Sprint {String(i + 1).padStart(2, '0')}</span>
                                                </div>
                                                <p className={cn(
                                                    "text-xs font-bold leading-tight",
                                                    activeHorizon === 'execucao' ? (isActiveSprint ? "text-white" : "text-zinc-400") : "text-zinc-500"
                                                )}>{name}</p>
                                                <p className={cn(
                                                    "text-xxs font-medium",
                                                    activeHorizon === 'execucao' ? "text-zinc-600" : "text-zinc-400"
                                                )}>{sprintTaglines[i]}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Horizonte 2: Sustentação */}
                            <div className={cn(
                                "border transition-all",
                                activeHorizon === 'sustentacao'
                                    ? "bg-zinc-900 border-zinc-800"
                                    : "bg-white border-zinc-200"
                            )}>
                                <div className="flex items-center gap-4 p-4">
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center shrink-0 font-mono text-xs font-bold",
                                        activeHorizon === 'sustentacao' ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500"
                                    )}>H2</div>
                                    <div className="flex-1">
                                        <p className="text-xxs uppercase tracking-widest font-bold text-zinc-400">Sustentação</p>
                                        <p className={cn("text-sm font-bold",
                                            activeHorizon === 'sustentacao' ? "text-white" : "text-zinc-500"
                                        )}>QBR & Otimização Contínua</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 text-2xs font-black uppercase tracking-widest",
                                        activeHorizon === 'sustentacao' ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {activeHorizon === 'sustentacao' ? 'Ativo' : 'Futuro'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sprint progress: deliveries + upcoming */}
                        {activeHorizon === 'execucao' && liveTasks.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Provas de Trabalho */}
                                {recentDeliveries.length > 0 && (
                                    <div className="bg-white border border-zinc-200 p-5">
                                        <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-3">Entregas Recentes</p>
                                        <div className="flex flex-col gap-2">
                                            {recentDeliveries.map((t: any) => (
                                                <div key={t.id} className="flex items-center gap-3">
                                                    <Check className="w-3.5 h-3.5 text-[#00CC6A] shrink-0" />
                                                    <span className="text-sm text-zinc-700 font-medium line-clamp-1">{t.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Próximas tarefas */}
                                {upcomingTasks.length > 0 && (
                                    <div className="bg-white border border-zinc-200 p-5">
                                        <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-3">Em Andamento</p>
                                        <div className="flex flex-col gap-2">
                                            {upcomingTasks.map((t: any) => (
                                                <div key={t.id} className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                    <div>
                                                        <span className="text-sm text-zinc-700 font-medium line-clamp-1">{t.title}</span>
                                                        {t.due_date && (
                                                            <p className="text-xxs text-zinc-400 font-medium">
                                                                Prazo: {new Date(t.due_date).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty state only if no Orqflow data at all */}
                        {liveTasks.length === 0 && activeHorizon === 'execucao' && (
                            <div className="mt-4 text-center py-8 bg-white border border-zinc-200 border-dashed">
                                <LayoutTemplate className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                                <p className="text-xs text-zinc-400">Nosso time está construindo o Backlog da Sprint. Em breve aparecerão aqui as tarefas em progresso.</p>
                            </div>
                        )}
                    </div>

                    {/* 3.5. OFFICIAL DOCUMENTATION HANDOVER */}
                    {clientDocs.length > 0 && (
                        <div id="docs" className="py-8 scroll-mt-24">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2 pl-1">
                                <BookOpen className="w-4 h-4" /> Documentação Oficial
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {clientDocs.map(doc => {
                                    const meta = doc.metadata as any || {};
                                    const cat = meta.category || 'geral';
                                    const isFinal = meta.visibility === 'final';
                                    return (
                                        <div 
                                            key={doc.id}
                                            onClick={() => {
                                                if (meta.type === 'external_link' && meta.url) {
                                                    window.open(meta.url, '_blank');
                                                } else {
                                                    toast.info('Visualizador de documentos internos em breve. Se o link não abrir, peça ao analista adicionar a URL pública.');
                                                }
                                            }}
                                            className={cn(
                                                "group relative border p-5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden",
                                                isFinal ? "bg-zinc-900 border-zinc-800 text-white shadow-sm hover:bg-black" : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start z-10 relative mb-6">
                                                <div className={cn(
                                                    "w-10 h-10 flex items-center justify-center transition-colors",
                                                    isFinal ? "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white"
                                                )}>
                                                    {meta.type === 'external_link' ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> : <FileText size={20} />}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {isFinal && (
                                                        <span className="px-2 py-0.5 bg-[#00CC6A]/20 text-[#00CC6A] border border-[#00CC6A]/30 text-3xs font-black uppercase tracking-widest">
                                                            Entregável Final
                                                        </span>
                                                    )}
                                                    <span className={cn(
                                                        "px-2 py-0.5 border text-3xs font-bold uppercase tracking-wider",
                                                        isFinal ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-50 border-zinc-100 text-zinc-500"
                                                    )}>
                                                        {CATEGORY_LABELS[cat] || cat}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="z-10 relative">
                                                <h3 className={cn("font-bold mb-1 line-clamp-2", isFinal ? "text-white" : "text-zinc-900")}>
                                                    {doc.filename}
                                                </h3>
                                                <p className={cn("text-xs font-medium", isFinal ? "text-zinc-500" : "text-zinc-400")}>
                                                    Adicionado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4. SCOPE SUMMARY (CONTRACTED) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-zinc-200">
                        <div className="lg:col-span-1">
                            <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">Escopo Contratado</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                                Este é o resumo executivo das entregas previstas para este ciclo de 90 dias.
                                <span className="hidden opacity-0" id="debug-type-flag">{project.type}</span>
                            </p>
                            <div className="p-4 bg-white border border-zinc-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-50 flex items-center justify-center border border-zinc-200">
                                        <FileText className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xxs uppercase font-bold text-zinc-400 tracking-wider">Analista Líder</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs text-zinc-900 font-medium truncate" title={project.analyst_email || ''}>
                                                {project.analyst_email || 'Não atribuído'}
                                            </p>
                                            {project.analyst_email && <Check className="w-3 h-3 text-[#00CC6A]" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white border border-zinc-200 p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(scopeByType[project.type?.trim().toLowerCase() || 'default'] || scopeByType.default).map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors">
                                            <div className="mt-0.5 bg-zinc-900 text-white p-0.5 shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm text-zinc-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xxs text-center text-zinc-400 uppercase tracking-widest mt-8 font-medium">
                                RevHackers Growth Hub • Documento Oficial
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ClientProjectHub;
