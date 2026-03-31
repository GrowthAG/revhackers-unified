import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Map,
    Zap,
    BookOpen,
    TrendingUp,
    Users,
    ChevronLeft,
    Loader2,
    Link as LinkIcon,
    QrCode,
    Presentation,
    Columns,
    Sparkles,
    BrainCircuit,
    CheckCircle2,
    AlertTriangle,
    Upload,
    Unlock,
    Video,
    ArrowRight,
    Clock,
    Target,
    Shield,
    Eye,
    FileEdit,
    Send,
    MessageSquare,
    Trophy,
    Rocket,
    Activity,
    XCircle,
    UserMinus,
    UserPlus,
    UserCheck,
    ClipboardCheck,
    ChevronDown,
    ChevronUp,
    Gauge,
    Lightbulb,
    AlertCircle,
    Cpu,
    Swords,
    FileSignature,
    Globe,
    Share2,
} from 'lucide-react';
import { updateReiProject } from '@/api/reiProjects';
import { toast as sonnerToast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { QRCodeSVG } from 'qrcode.react';
import { getReiProjectById } from '@/api/reiProjects';
import type { ReiProject } from '@/api/reiProjects';
import OrchestratedOnboarding from '@/pages/admin/OrchestratedOnboarding';
import { ProjectOsContainer } from '@/components/project-os/ProjectOsContainer';

import { useToast } from '@/hooks/use-toast';
import ProjectWiki from './ProjectWiki';
import { AIPlaybookGenerator } from '@/components/admin/playbook/AIPlaybookGenerator';
import DiagnosticResponsesPanel from '@/components/admin/DiagnosticResponsesPanel';
import { MarketIntelligenceTab } from '@/components/project-os/views/MarketIntelligenceTab';
import { SalesRoomTab } from '@/components/project-os/views/SalesRoomTab';
import { MeetingVaultTab } from '@/components/project-os/views/MeetingVaultTab';
import { KickoffSignaturePanel } from '@/components/rei/KickoffSignaturePanel';
import { SuccessPlanTab } from '@/components/admin/SuccessPlanTab';

import {
    PipelineStage,
    PIPELINE_STAGES,
    STAGE_CONFIGS,
    STAGE_CATEGORIES,
    StageCategory,
    getStageCategory,
    getStageIndex,
} from '@/types/pipeline';
import { advanceStage, getStageHistory } from '@/services/PipelineService';
import type { StageChangeEvent } from '@/types/pipeline';

// ---- Icon map for pipeline stages ----
const STAGE_ICON_MAP: Record<string, React.ElementType> = {
    UserPlus,
    UserCheck,
    ClipboardCheck,
    FileEdit,
    Send,
    Eye,
    MessageSquare,
    Trophy,
    Rocket,
    Activity,
    CheckCircle2,
    XCircle,
    UserMinus,
};

function getStageIcon(iconName: string): React.ElementType {
    return STAGE_ICON_MAP[iconName] || Target;
}

// ---- Helpers ----

/** Main pipeline stages (excluding terminal lost/churned) for the journey bar */
const JOURNEY_STAGES: PipelineStage[] = PIPELINE_STAGES.filter(
    (s) => s !== 'lost' && s !== 'churned'
);

import { getDisplayName as utilGetDisplayName } from '@/lib/projectUtils';

function getDisplayName(project: ReiProject | null): string {
    if (!project) return 'Projeto';
    return utilGetDisplayName({
        trade_name: project.trade_name,
        client_company: project.client_company,
        client_name: project.client_name
    });
}

function getDaysInStage(history: StageChangeEvent[], currentStage: PipelineStage | null): number {
    if (!currentStage || history.length === 0) return 0;
    const lastTransition = [...history].reverse().find(h => h.to_stage === currentStage);
    if (!lastTransition) return 0;
    const enteredAt = new Date(lastTransition.changed_at);
    const now = new Date();
    return Math.max(0, Math.ceil((now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Determine which tab set to show based on stage category */
function getVisibleTabs(category: StageCategory | null): string[] {
    switch (category) {
        case 'diagnostico':
            return ['jornada', 'osint', 'diagnostico', 'reunioes', 'kickoff'];
        case 'vendas':
            return ['jornada', 'osint', 'sales-room', 'reunioes', 'kickoff'];
        case 'execucao':
            return ['jornada', 'orqflow', 'success', 'reunioes', 'biblioteca', 'kickoff'];
        case 'encerrado':
            return ['jornada', 'osint', 'success', 'reunioes', 'biblioteca'];
        default:
            // Fallback: show all core tabs
            return ['jornada', 'osint', 'reunioes', 'kickoff'];
    }
}

// ---- Pipeline Journey Bar ----
interface PipelineJourneyBarProps {
    currentStage: PipelineStage;
    history: StageChangeEvent[];
    daysInStage: number;
    onAdvance: (stage: PipelineStage) => void;
}

function PipelineJourneyBar({ currentStage, history, daysInStage, onAdvance }: PipelineJourneyBarProps) {
    const category = STAGE_CONFIGS[currentStage]?.category;

    // Dynamically calculate which macro-stages to show based on the phase of the project
    const visibleStages = useMemo(() => {
        const isExecutionPhase = category === 'execucao' || category === 'encerrado' || currentStage === 'won';
        let stages: PipelineStage[];

        if (isExecutionPhase) {
            // Se já fechou, suprime as granulações chatas de proposta (rascunho, enviada, etc)
            // e mostra a jornada macro do delivery.
            stages = ['lead_inbound', 'diagnostic_done', 'won', 'onboarding', 'active', 'completed'];
            if (currentStage === 'churned') {
                stages.push('churned');
            }
        } else {
            // Em pré-vendas, mostra o funil de oportunidade. Removemos 'lost' por padrão, só mostra se for current.
            stages = ['lead_inbound', 'lead_qualified', 'diagnostic_done', 'proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation', 'won'];
            if (currentStage === 'lost') {
                stages.push('lost');
            }
        }

        // Garante que o estágio atual sempre existe na barra, mesmo em edições forçadas de base de dados
        if (!stages.includes(currentStage)) {
            stages.push(currentStage);
        }

        // Ordenar pela cronologia oficial para não ficar pulando
        return stages.sort((a, b) => getStageIndex(a) - getStageIndex(b));
    }, [category, currentStage]);

    const currentIndex = visibleStages.indexOf(currentStage);

    return (
        <div className="bg-white border-b border-zinc-200 px-8 py-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400">
                    Pipeline
                </span>
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-tiny font-bold text-zinc-500">
                        {daysInStage} {daysInStage === 1 ? 'dia' : 'dias'} em {STAGE_CONFIGS[currentStage].label}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {visibleStages.map((stage, idx) => {
                    const config = STAGE_CONFIGS[stage];
                    const isCurrent = stage === currentStage;
                    const isPast = !isCurrent && getStageIndex(stage) < getStageIndex(currentStage);
                    const isFuture = !isCurrent && !isPast;
                    const Icon = getStageIcon(config.icon);

                    return (
                        <React.Fragment key={stage}>
                            <button
                                onClick={() => {
                                    const allowed = STAGE_CONFIGS[currentStage].allowedTransitions;
                                    if (allowed.includes(stage)) {
                                        onAdvance(stage);
                                    }
                                }}
                                title={`${config.label}${STAGE_CONFIGS[currentStage].allowedTransitions.includes(stage) ? ' - clique para avancar' : ''}`}
                                className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-3xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border ${
                                    isCurrent
                                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-[0_3px_0_0_#00CC6A]'
                                        : isPast
                                        ? 'border-zinc-200 bg-white text-zinc-500'
                                        : 'border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-400'
                                } ${STAGE_CONFIGS[currentStage].allowedTransitions.includes(stage) ? 'cursor-pointer hover:border-zinc-900 hover:text-zinc-900' : 'cursor-default'}`}
                            >
                                {isCurrent && (
                                    <span className="w-1.5 h-1.5 bg-white shrink-0" />
                                )}
                                {isPast && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                                )}
                                {isFuture && (
                                    <span className="w-1.5 h-1.5 bg-zinc-300 shrink-0" />
                                )}
                                <span className="hidden lg:inline">{config.labelShort}</span>
                            </button>
                            {idx < visibleStages.length - 1 && (
                                <div className={`w-3 h-px shrink-0 ${
                                    isPast ? 'bg-zinc-900' : isCurrent ? 'bg-zinc-300' : 'bg-zinc-200'
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ---- Stage Transition Buttons ----
interface StageTransitionButtonsProps {
    currentStage: PipelineStage;
    onAdvance: (stage: PipelineStage) => void;
    advancing: boolean;
}

function StageTransitionButtons({ currentStage, onAdvance, advancing }: StageTransitionButtonsProps) {
    const config = STAGE_CONFIGS[currentStage];
    const allowed = config.allowedTransitions;

    if (allowed.length === 0) return null;

    const dangerStages: PipelineStage[] = ['lost', 'churned'];

    return (
        <div className="flex items-center gap-2">
            {allowed.filter(s => !dangerStages.includes(s)).map((stage) => {
                const targetConfig = STAGE_CONFIGS[stage];
                return (
                    <Button
                        key={stage}
                        size="sm"
                        disabled={advancing}
                        onClick={() => onAdvance(stage)}
                        className="text-xxs font-black uppercase tracking-widest border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 gap-1.5 transition-all rounded-none"
                    >
                        {advancing ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <ArrowRight size={12} />
                        )}
                        {targetConfig.labelShort}
                    </Button>
                );
            })}

            {allowed.filter(s => dangerStages.includes(s)).map((stage) => {
                const targetConfig = STAGE_CONFIGS[stage];
                return (
                    <AlertDialog key={stage}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={advancing}
                                className="text-xxs font-black uppercase tracking-widest text-zinc-400 border-zinc-200 hover:text-zinc-600 hover:border-zinc-300 gap-1.5"
                            >
                                <XCircle size={12} />
                                {targetConfig.labelShort}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-black tracking-tight">
                                    Confirmar: {targetConfig.label}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-500">
                                    Essa acao vai mover o projeto para "{targetConfig.label}". {
                                        stage === 'lost'
                                            ? 'O lead sera marcado como perdido.'
                                            : 'O cliente sera marcado como churned.'
                                    } Tem certeza?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-xxs font-bold uppercase tracking-widest">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onAdvance(stage)}
                                    className="text-xxs font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800"
                                >
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            })}
        </div>
    );
}

// ---- Focal Points Panel ----
interface FocalPointsPanelProps {
    project: ReiProject;
}

function FocalPointsPanel({ project }: FocalPointsPanelProps) {
    if (!project.focal_points || project.focal_points.length === 0) return null;

    return (
        <div className="border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                    Pontos Focais (Contatos)
                </span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.focal_points.map((fp, i) => (
                    <div key={i} className="flex flex-col space-y-1 p-3 border border-zinc-100 bg-zinc-50 relative group">
                        {fp.is_main && (
                            <span className="absolute top-3 right-3 flex items-center justify-center w-4 h-4 bg-zinc-100" title="Contato Principal">
                                <Sparkles className="w-2.5 h-2.5 text-zinc-500" />
                            </span>
                        )}
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-900 pr-5">{fp.name}</span>
                        <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">{fp.role || 'Sem Cargo'}</span>
                        <a href={`mailto:${fp.email}`} className="text-tiny font-medium text-zinc-600 hover:text-zinc-900 hover:underline pt-1">
                            {fp.email}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---- Intelligence Panel ----
interface IntelligencePanelProps {
    project: ReiProject;
}

function IntelligencePanel({ project }: IntelligencePanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    const opportunityData = project.opportunity_data as {
        score_fechamento?: number;
        sinais_compra?: string[];
        objecoes_detectadas?: string[];
        sentimento?: string;
    } | null;

    const marketData = project.market_data as {
        strategic_intelligence?: {
            competitors?: string[];
            challenges?: string[];
            tech_stack?: string[];
        };
    } | null;

    const strategicIntel = marketData?.strategic_intelligence;
    const hasOpportunity = opportunityData && (opportunityData.score_fechamento || opportunityData.sinais_compra?.length);
    const hasIntel = strategicIntel && (strategicIntel.competitors?.length || strategicIntel.challenges?.length || strategicIntel.tech_stack?.length);

    if (!hasOpportunity && !hasIntel) return null;

    return (
        <div className="border border-zinc-200 bg-white overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-zinc-900" />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                        Intelligence
                    </span>
                </div>
                {collapsed ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
            </button>

            {!collapsed && (
                <div className="px-5 pb-5 space-y-5 border-t border-zinc-100">
                    {/* Score de Fechamento */}
                    {hasOpportunity && (
                        <div className="pt-4 space-y-3">
                            {opportunityData.score_fechamento != null && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gauge className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Score de Fechamento
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                                            {opportunityData.score_fechamento}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 mb-1">/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-100 mt-2 overflow-hidden">
                                        <div
                                            className="h-full"
                                            style={{
                                                width: `${Math.min(100, opportunityData.score_fechamento)}%`,
                                                backgroundColor: opportunityData.score_fechamento >= 70 ? '#00CC6A' : opportunityData.score_fechamento >= 40 ? '#a1a1aa' : '#d4d4d8',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Sinais de Compra */}
                            {opportunityData.sinais_compra && opportunityData.sinais_compra.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Sinais de Compra
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.sinais_compra.map((sinal, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-[#00CC6A] shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{sinal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Objecoes */}
                            {opportunityData.objecoes_detectadas && opportunityData.objecoes_detectadas.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Objecoes Detectadas
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.objecoes_detectadas.map((obj, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-zinc-400 shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{obj}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Strategic Intelligence */}
                    {hasIntel && (
                        <div className="pt-4 space-y-3 border-t border-zinc-100">
                            {strategicIntel.competitors && strategicIntel.competitors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Swords className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Concorrentes
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.competitors.map((c, i) => (
                                            <span className="text-xxs font-bold text-zinc-600 bg-zinc-100 px-2 py-1">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {strategicIntel.challenges && strategicIntel.challenges.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Desafios
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {strategicIntel.challenges.map((ch, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-zinc-400 shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{ch}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {strategicIntel.tech_stack && strategicIntel.tech_stack.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cpu className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Tech Stack
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.tech_stack.map((t, i) => (
                                            <span key={i} className="text-xxs font-bold text-zinc-600 bg-zinc-100 px-2 py-1">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---- Placeholders removed - DiagnosticResponsesPanel replaces DiagnosticoPlaceholder ----

// ---- Main Component ----

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [advancing, setAdvancing] = useState(false);
    const [stageHistory, setStageHistory] = useState<StageChangeEvent[]>([]);
    const [confirmStage, setConfirmStage] = useState<PipelineStage | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    // Pipeline stage (cast via any since not in typed schema)
    const currentStage = (project?.pipeline_stage as PipelineStage) || null;
    const stageCategory = currentStage ? getStageCategory(currentStage) : null;

    // Determine visible tabs based on pipeline stage
    const visibleTabs = useMemo(() => {
        if (!currentStage) {
            // Fallback for projects without pipeline_stage
            const status = project?.status;
            if (status === 'lead') return ['osint', 'diagnostico', 'reunioes'];
            return ['orqflow', 'jornada', 'reunioes', 'biblioteca', 'kickoff'];
        }
        return getVisibleTabs(stageCategory);
    }, [currentStage, stageCategory, project?.status]);

    // Default tab based on stage
    const defaultTab = visibleTabs[0] || 'osint';
    const activeTab = searchParams.get('tab') || defaultTab;

    // If active tab is not visible, reset to default
    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
            setSearchParams({ tab: defaultTab });
        }
    }, [visibleTabs, activeTab, defaultTab]);

    const daysInStage = useMemo(
        () => getDaysInStage(stageHistory, currentStage),
        [stageHistory, currentStage]
    );

    useEffect(() => {
        if (id) {
            loadProject();
            loadHistory();
        }
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            const data = await getReiProjectById(id!);
            if (!data) {
                toast({ title: 'Projeto nao encontrado', variant: 'destructive' });
                navigate('/admin/rei');
                return;
            }
            setProject(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        if (!id) return;
        const history = await getStageHistory(id);
        setStageHistory(history);
    };

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    const handleAdvanceStage = async (targetStage: PipelineStage) => {
        if (!project) return;
        setAdvancing(true);
        try {
            const result = await advanceStage(project.id, targetStage);
            if (!result.success) {
                sonnerToast.error('Erro ao avancar', { description: result.error });
                return;
            }

            const targetLabel = STAGE_CONFIGS[targetStage].label;
            sonnerToast.success(`Movido para ${targetLabel}`, {
                description: `${getDisplayName(project)} agora esta em "${targetLabel}".`,
            });
            await loadProject();
            await loadHistory();
        } catch (e: any) {
            sonnerToast.error('Erro ao avancar stage', { description: e.message });
        } finally {
            setAdvancing(false);
            setConfirmStage(null);
        }
    };

    const handleUnlockMaterials = async () => {
        if (!project) return;
        try {
            await updateReiProject(project.id, { materials_status: 'delivered' });

            sonnerToast.success('Cronograma Destravado!', {
                description: 'Os materiais foram confirmados. Planejamento Estrategico liberado.',
            });
            await loadProject();
        } catch (e: any) {
            sonnerToast.error('Erro ao destravar', { description: e.message });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-300 w-8 h-8" />
            </div>
        );
    }

    if (!project) return null;

    // Tab definitions with icons
    const TAB_DEFS: Record<string, { label: string; icon: React.ElementType }> = {
        orqflow: { label: 'OrqFlow OS', icon: Columns },
        osint: { label: 'Inteligencia B2B', icon: BrainCircuit },
        diagnostico: { label: 'Diagnostico', icon: ClipboardCheck },
        jornada: { label: 'Planejamento', icon: Map },
        'sales-room': { label: 'Proposta', icon: Presentation },
        reunioes: { label: 'Reunioes', icon: Video },
        biblioteca: { label: 'Documentos', icon: BookOpen },
        playbook: { label: 'Playbook AI', icon: Sparkles },
        kickoff: { label: 'Kick-off Validação', icon: FileSignature },
        success: { label: 'Success Plan', icon: Target },
    };

    return (
        <AdminLayout>
            <div className="h-full flex flex-col">
                {/* Project Header */}
                <div className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 w-full overflow-hidden">
                    <div className="flex items-center gap-4 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/rei')} className="text-zinc-400 hover:text-zinc-900 h-8 w-8">
                            <ChevronLeft size={16} />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-3">
                                {project.client_id ? (
                                    <Link to={`/admin/clients/${project.client_id}`} className="hover:underline transition-colors decoration-2 underline-offset-4 cursor-pointer" title="Ver Perfil do Cliente">
                                        {getDisplayName(project)}
                                    </Link>
                                ) : (
                                    getDisplayName(project)
                                )}
                                {currentStage && (
                                    <span className={`text-xxs font-black uppercase tracking-widest px-3 py-1 ${
                                        stageCategory === 'execucao'
                                            ? 'text-[#00CC6A] bg-[#00CC6A]/10'
                                            : stageCategory === 'encerrado'
                                            ? 'text-zinc-400 bg-zinc-100'
                                            : 'text-zinc-500 bg-zinc-100'
                                    }`}>
                                        {STAGE_CONFIGS[currentStage].labelShort}
                                    </span>
                                )}
                                {!currentStage && (
                                    <span className={`text-xxs font-black uppercase tracking-widest px-3 py-1 ${
                                        project.status === 'lead'
                                            ? 'text-zinc-500 bg-zinc-100'
                                            : 'text-[#00CC6A] bg-[#00CC6A]/10'
                                    }`}>
                                        {project.status === 'lead' ? 'Lead' : project.status === 'active' ? 'Ativo' : 'Onboarding'}
                                    </span>
                                )}
                            </h1>
                            <p className="text-tiny text-zinc-400 font-medium mt-0.5">
                                {project.type === 'crm_ops' ? 'CRM & RevOps' :
                                    project.type === 'founder' ? 'Founder Led Sales' :
                                    project.type === 'dev' ? 'Dev Web & Design' :
                                    project.type === 'funnels_impl' ? 'Site & Funil' : 'Consultoria 360'
                                } | {project.quarter} {project.year}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
                        {/* Stage transition buttons */}
                        {currentStage && (
                            <StageTransitionButtons
                                currentStage={currentStage}
                                onAdvance={handleAdvanceStage}
                                advancing={advancing}
                            />
                        )}

                        {/* Fallback: old qualify button for projects without pipeline_stage */}
                        {!currentStage && project.status === 'lead' && (
                            <Button
                                size="sm"
                                disabled={advancing}
                                onClick={() => handleAdvanceStage('lead_qualified')}
                                className="text-xxs font-black uppercase tracking-widest border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 gap-1.5 transition-all rounded-none"
                            >
                                <CheckCircle2 size={12} /> Qualificar
                            </Button>
                        )}

                        <div className="w-px h-6 bg-zinc-200 mx-1" />

                        {stageCategory === 'execucao' && (
                            <Button
                                variant="default"
                                size="sm"
                                disabled={project.materials_status === 'pending'}
                                onClick={() => navigate(`/admin/planejamento/${project.id}`)}
                                className={`text-xxs font-bold uppercase tracking-widest rounded-none transition-all ${project.materials_status === 'pending' ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' : 'border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950'}`}
                            >
                                <Sparkles size={12} className="mr-2" /> Planejamento IA
                            </Button>
                        )}

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-xxs font-bold uppercase tracking-widest rounded-none transition-all"
                                >
                                    <Share2 size={12} className="mr-2" /> Acessos do Cliente
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-zinc-200">
                                <div className="p-6 bg-zinc-950 text-white">
                                    <DialogTitle className="font-black text-xl tracking-tight mb-1 text-white">Acessos do Cliente</DialogTitle>
                                    <DialogDescription className="text-zinc-400 text-xs">
                                        Compartilhe os links mágicos e Hub de controle com a conta {getDisplayName(project)}.
                                    </DialogDescription>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Link do Hub */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-4 h-4 text-zinc-500" />
                                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">Hub do Cliente (Portal Principal)</span>
                                        </div>
                                        <div className="flex">
                                            <div className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 px-3 flex items-center overflow-hidden h-9">
                                                <span className="text-xs font-mono text-zinc-500 truncate">{`${window.location.origin}/hub/${project.id}`}</span>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/hub/${project.id}`);
                                                    toast({ title: 'Hub Copiado', description: 'Link enviado para a área de transferência.' });
                                                }} 
                                                className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 rounded-none px-4 h-9 uppercase text-2xs font-bold tracking-wider transition-all"
                                            >
                                                Copiar
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Link de Uploads */}
                                    {stageCategory === 'execucao' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Upload className="w-4 h-4 text-zinc-500" />
                                                <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">Recebimento de Materiais (Acervo)</span>
                                            </div>
                                            <div className="flex">
                                                <div className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 px-3 flex items-center overflow-hidden h-9">
                                                    <span className="text-xs font-mono text-zinc-500 truncate">{`${window.location.origin}/upload-materiais/${project.id}`}</span>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/upload-materiais/${project.id}`);
                                                        toast({ title: 'Upload Copiado', description: 'Formulário de acervo enviado para área de transferência.' });
                                                    }} 
                                                    className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 rounded-none px-4 h-9 uppercase text-2xs font-bold tracking-wider transition-all"
                                                >
                                                    Copiar
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* QR Code */}
                                    <div className="pt-6 border-t border-zinc-100 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-2 mb-4">
                                            <QrCode className="w-4 h-4 text-zinc-500" />
                                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">QR Code: Hub Presencial</span>
                                        </div>
                                        <div className="p-3 bg-white border border-zinc-200 shadow-sm">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/hub/${project.id}`}
                                                size={140}
                                                level={"Q"}
                                                includeMargin={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Pipeline Journey Bar */}
                {currentStage && (
                    <PipelineJourneyBar
                        currentStage={currentStage}
                        history={stageHistory}
                        daysInStage={daysInStage}
                        onAdvance={(stage) => {
                            const dangerStages: PipelineStage[] = ['lost', 'churned'];
                            if (dangerStages.includes(stage)) {
                                // Danger transitions are handled by the AlertDialog in StageTransitionButtons
                                return;
                            }
                            handleAdvanceStage(stage);
                        }}
                    />
                )}

                {/* Materials lock banner */}
                {project.materials_status === 'pending' && stageCategory === 'execucao' && (
                    <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">Trava Estrategica Ativada</h3>
                                <p className="text-tiny text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                    O cronograma e o Planejamento Estrategico estao suspensos. O cliente {getDisplayName(project)} deve enviar os arquivos pendentes para que a operacao prossiga.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button
                                variant="outline"
                                onClick={() => window.open('/admin/materials/new', '_blank')}
                                className="flex-1 sm:flex-none bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 text-xxs font-bold uppercase tracking-widest h-9"
                            >
                                <Upload className="w-3.5 h-3.5 mr-2" />
                                Subir Arquivo
                            </Button>
                            <Button
                                onClick={handleUnlockMaterials}
                                className="flex-1 sm:flex-none border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-xxs font-bold uppercase tracking-widest h-9 transition-all rounded-none"
                            >
                                <Unlock className="w-3.5 h-3.5 mr-2" />
                                Sinal Verde
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main content area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Tabs content */}
                    <div className={`flex-1 ${activeTab === 'orqflow' ? 'p-0 overflow-hidden' : 'p-8 overflow-y-auto w-full max-w-7xl mx-auto'} bg-white flex flex-col`}>
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col w-full">
                            <TabsList className={`bg-transparent border-b border-zinc-100 p-0 flex-nowrap overflow-x-auto no-scrollbar justify-start md:justify-center mx-auto w-fit max-w-[90vw] gap-6 shrink-0 h-auto ${(activeTab === 'orqflow') ? 'mt-6' : ''}`}>
                                {visibleTabs.map((tabKey) => {
                                    const def = TAB_DEFS[tabKey];
                                    if (!def) return null;
                                    const Icon = def.icon;
                                    return (
                                        <TabsTrigger
                                            key={tabKey}
                                            value={tabKey}
                                            className="px-2 py-3 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-[0_2px_0_0_#18181b] transition-all flex gap-2 items-center shrink-0 rounded-none border-b-2 border-transparent"
                                        >
                                            <Icon size={15} className="mb-0.5" strokeWidth={2} /> {def.label}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {/* Panels Group - Always visible above tab contents */}
                            <div className="mt-4 flex flex-col gap-4">
                                <FocalPointsPanel project={project} />
                                
                                {/* Intelligence Panel - show below tabs on diagnostico/vendas stages */}
                                {(stageCategory === 'diagnostico' || stageCategory === 'vendas') && (
                                    <IntelligencePanel project={project} />
                                )}
                            </div>

                            {/* Tab Contents */}
                            <TabsContent value="orqflow" className="m-0 flex-1 flex flex-col pt-4">
                                <ProjectOsContainer projectId={project.id} />
                            </TabsContent>

                            <TabsContent value="osint" className="m-0 pt-6">
                                <MarketIntelligenceTab project={project} onUpdateProject={loadProject} />
                            </TabsContent>

                            <TabsContent value="diagnostico" className="m-0 pt-6">
                                <DiagnosticResponsesPanel projectId={project.id} projectType={project.type || undefined} />
                            </TabsContent>

                            <TabsContent value="jornada" className={`m-0 ${activeTab === 'orqflow' ? 'hidden' : ''}`}>
                                <OrchestratedOnboarding projectId={project.id} embedded={true} />
                            </TabsContent>

                            <TabsContent value="sales-room" className="m-0 flex-1 flex flex-col pt-0">
                                <SalesRoomTab project={project} />
                            </TabsContent>

                            <TabsContent value="reunioes" className="m-0 pt-6 bg-zinc-50/30">
                                <MeetingVaultTab projectId={project.id} />
                            </TabsContent>

                            <TabsContent value="biblioteca" className="m-0">
                                <ProjectWiki projectId={project.id} projectName={project.client_name} />
                            </TabsContent>

                            <TabsContent value="kickoff" className="m-0 pt-6">
                                <KickoffSignaturePanel project={project} onUpdate={loadProject} />
                            </TabsContent>

                            <TabsContent value="playbook" className="m-0">
                                <AIPlaybookGenerator projectId={project.id} projectName={project.client_name} />
                            </TabsContent>

                            <TabsContent value="success" className="m-0 pt-6">
                                <SuccessPlanTab projectId={project.id} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
