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

function getDisplayName(project: ReiProject | null): string {
    if (!project) return 'Projeto';
    if (project.trade_name) return project.trade_name;
    const raw = project.client_name || 'Projeto';

    if (raw.toUpperCase().includes('SARAH PENIDO')) return 'Arquiter';
    if (raw.toUpperCase().includes('TUNAD')) return 'Tunad';

    const cleaned = raw
        .replace(/\s+(LTDA|EIRELI|S\.?A\.?|ME|EPP|S\/S|SERVICOS|SERVIÇOS|MARKETING|CONSULTORIA|TECNOLOGIA|PLATAFORM|PLATFORM|DIGITAL|SOLUCOES|SOLUÇÕES|MOMENT|GROUP|BRASIL)\b/gi, '')
        .trim();
    const words = cleaned.split(/\s+/);
    const brandName = words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;
    return brandName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || raw;
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
            return ['osint', 'diagnostico', 'reunioes'];
        case 'vendas':
            return ['osint', 'jornada', 'sales-room', 'reunioes'];
        case 'execucao':
            return ['orqflow', 'jornada', 'reunioes', 'biblioteca'];
        case 'encerrado':
            return ['osint', 'jornada', 'reunioes', 'biblioteca'];
        default:
            // Fallback: show all core tabs
            return ['osint', 'jornada', 'reunioes'];
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
    const currentIndex = JOURNEY_STAGES.indexOf(currentStage);
    const visitedStages = new Set(history.map(h => h.to_stage));
    visitedStages.add(currentStage);

    return (
        <div className="bg-white border-b border-zinc-200 px-8 py-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Pipeline
                </span>
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] font-bold text-zinc-500">
                        {daysInStage} {daysInStage === 1 ? 'dia' : 'dias'} em {STAGE_CONFIGS[currentStage].label}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {JOURNEY_STAGES.map((stage, idx) => {
                    const config = STAGE_CONFIGS[stage];
                    const isCurrent = stage === currentStage;
                    const isPast = visitedStages.has(stage) && !isCurrent && getStageIndex(stage) < getStageIndex(currentStage);
                    const isFuture = !isPast && !isCurrent;
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
                                className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                    isCurrent
                                        ? 'bg-zinc-950 text-white'
                                        : isPast
                                        ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                        : 'bg-zinc-50 text-zinc-300'
                                } ${STAGE_CONFIGS[currentStage].allowedTransitions.includes(stage) ? 'cursor-pointer ring-1 ring-transparent hover:ring-zinc-300' : 'cursor-default'}`}
                            >
                                {isCurrent && (
                                    <span className="w-2 h-2 rounded-full bg-[#00CC6A] shrink-0 animate-pulse" />
                                )}
                                {isPast && (
                                    <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                                )}
                                {isFuture && (
                                    <span className="w-2 h-2 rounded-full bg-zinc-200 shrink-0" />
                                )}
                                <span className="hidden lg:inline">{config.labelShort}</span>
                            </button>
                            {idx < JOURNEY_STAGES.length - 1 && (
                                <div className={`w-3 h-px shrink-0 ${
                                    isPast || isCurrent ? 'bg-zinc-400' : 'bg-zinc-200'
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
                        className="text-[10px] font-black uppercase tracking-widest bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm gap-1.5"
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
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-zinc-200 hover:text-zinc-600 hover:border-zinc-300 shadow-sm gap-1.5"
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
                                <AlertDialogCancel className="text-[10px] font-bold uppercase tracking-widest">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onAdvance(stage)}
                                    className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800"
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

    const diagnosticData = project.diagnostic_data as {
        strategic_intelligence?: {
            competitors?: string[];
            challenges?: string[];
            tech_stack?: string[];
        };
    } | null;

    const strategicIntel = diagnosticData?.strategic_intelligence;
    const hasOpportunity = opportunityData && (opportunityData.score_fechamento || opportunityData.sinais_compra?.length);
    const hasIntel = strategicIntel && (strategicIntel.competitors?.length || strategicIntel.challenges?.length || strategicIntel.tech_stack?.length);

    if (!hasOpportunity && !hasIntel) return null;

    return (
        <div className="border border-zinc-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-zinc-900" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Score de Fechamento
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                                            {opportunityData.score_fechamento}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 mb-1">/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Sinais de Compra
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.sinais_compra.map((sinal, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A] shrink-0 mt-1.5" />
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Objecoes Detectadas
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.objecoes_detectadas.map((obj, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-1.5" />
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Concorrentes
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.competitors.map((c, i) => (
                                            <span key={i} className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md">
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Desafios
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {strategicIntel.challenges.map((ch, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-1.5" />
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            Tech Stack
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.tech_stack.map((t, i) => (
                                            <span key={i} className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md">
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

    // Pipeline stage (cast via any since not in typed schema)
    const currentStage = (project?.pipeline_stage as PipelineStage) || null;
    const stageCategory = currentStage ? getStageCategory(currentStage) : null;

    // Determine visible tabs based on pipeline stage
    const visibleTabs = useMemo(() => {
        if (!currentStage) {
            // Fallback for projects without pipeline_stage
            const status = project?.status;
            if (status === 'lead') return ['osint', 'diagnostico', 'reunioes'];
            return ['orqflow', 'jornada', 'reunioes', 'biblioteca'];
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
    };

    return (
        <AdminLayout>
            <div className="h-full flex flex-col">
                {/* Project Header */}
                <div className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
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
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${
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
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${
                                        project.status === 'lead'
                                            ? 'text-zinc-500 bg-zinc-100'
                                            : 'text-[#00CC6A] bg-[#00CC6A]/10'
                                    }`}>
                                        {project.status === 'lead' ? 'Lead' : project.status === 'active' ? 'Ativo' : 'Onboarding'}
                                    </span>
                                )}
                            </h1>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                {project.type === 'crm_ops' ? 'CRM & RevOps' :
                                    project.type === 'founder' ? 'Founder Led Sales' :
                                    project.type === 'dev' ? 'Dev Web & Design' :
                                    project.type === 'funnels_impl' ? 'Site & Funil' : 'Consultoria 360'
                                } | {project.quarter} {project.year}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                                className="text-[10px] font-black uppercase tracking-widest bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm gap-1.5"
                            >
                                <CheckCircle2 size={12} /> Qualificar
                            </Button>
                        )}

                        <div className="w-px h-6 bg-zinc-200 mx-1" />

                        {stageCategory === 'execucao' && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={project.materials_status === 'pending'}
                                    onClick={() => navigate(`/admin/planejamento/${project.id}`)}
                                    className={`text-[10px] font-bold uppercase tracking-widest shadow-sm ${project.materials_status === 'pending' ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 hover:bg-zinc-800 text-white'}`}
                                >
                                    <Sparkles size={12} className="mr-2" /> Gerador REI
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/admin/strategic-plan/${project.id}`, '_blank')}
                                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm"
                                >
                                    <Presentation size={12} className="mr-2" /> The Vault
                                </Button>
                            </>
                        )}

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm"
                                >
                                    <QrCode size={12} className="mr-2" /> QR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center font-black text-xl tracking-tight">QR Code de Acesso</DialogTitle>
                                    <DialogDescription className="text-center">
                                        Peca para o cliente apontar a camera na reuniao para acessar o Hub.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-8">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/hub/${project.id}`}
                                            size={200}
                                            level={"Q"}
                                            includeMargin={true}
                                        />
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/hub/${project.id}`);
                                toast({ title: 'Link copiado!', description: 'Link magico do cliente copiado.' });
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        >
                            <LinkIcon size={12} className="mr-2" /> Link
                        </Button>
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
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">Trava Estrategica Ativada</h3>
                                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                    O cronograma e o Planejamento Estrategico estao suspensos. O cliente {getDisplayName(project)} deve enviar os arquivos pendentes para que a operacao prossiga.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button
                                variant="outline"
                                onClick={() => window.open('/admin/materials/new', '_blank')}
                                className="flex-1 sm:flex-none bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest h-9"
                            >
                                <Upload className="w-3.5 h-3.5 mr-2" />
                                Subir Arquivo
                            </Button>
                            <Button
                                onClick={handleUnlockMaterials}
                                className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest h-9"
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
                    <div className={`flex-1 ${activeTab === 'orqflow' ? 'p-0 overflow-hidden' : 'p-8 overflow-y-auto'} bg-white flex flex-col`}>
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
                            <TabsList className={`bg-white border border-zinc-200 p-1 h-auto rounded-xl flex-wrap gap-2 shrink-0 ${(activeTab === 'orqflow') ? 'mx-8 mt-6' : ''}`}>
                                {visibleTabs.map((tabKey) => {
                                    const def = TAB_DEFS[tabKey];
                                    if (!def) return null;
                                    const Icon = def.icon;
                                    return (
                                        <TabsTrigger
                                            key={tabKey}
                                            value={tabKey}
                                            className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center shrink-0"
                                        >
                                            <Icon size={14} /> {def.label}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {/* Intelligence Panel - show below tabs on diagnostico/vendas stages */}
                            {(stageCategory === 'diagnostico' || stageCategory === 'vendas') && (
                                <div className="mt-4">
                                    <IntelligencePanel project={project} />
                                </div>
                            )}

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

                            <TabsContent value="playbook" className="m-0">
                                <AIPlaybookGenerator projectId={project.id} projectName={project.client_name} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
