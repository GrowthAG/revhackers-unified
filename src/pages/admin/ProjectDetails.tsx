import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProjectDetailsSkeleton } from '@/components/ui/skeleton';
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
// Tabs components unmounted as they were migrated to react-router-dom NavLink
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
import { supabase } from '@/integrations/supabase/client';
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
import { ClickUpStatusWidget } from '@/components/admin/ClickUpStatusWidget';
import { ClientAccountPanel } from '@/components/admin/ClientAccountPanel';
import { ClientAccessModal } from '@/components/project-os/layout/ClientAccessModal';
import { ProjectHeaderActions } from '@/components/project-os/layout/ProjectHeaderActions';

import { PipelineJourneyBar } from '@/components/project-os/layout/PipelineJourneyBar';
import { StageTransitionButtons } from '@/components/project-os/layout/StageTransitionButtons';
import { FocalPointsPanel } from '@/components/project-os/panels/FocalPointsPanel';
import { IntelligencePanel } from '@/components/project-os/panels/IntelligencePanel';

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
            return ['jornada', 'inteligencia', 'diagnostico', 'reunioes', 'kickoff'];
        case 'vendas':
            return ['jornada', 'inteligencia', 'diagnostico', 'proposta', 'reunioes', 'kickoff'];
        case 'execucao':
            return ['jornada', 'execucao', 'diagnostico', 'success', 'reunioes', 'biblioteca', 'kickoff'];
        case 'encerrado':
            return ['jornada', 'inteligencia', 'diagnostico', 'success', 'reunioes', 'biblioteca'];
        default:
            // Fallback: show all core tabs
            return ['jornada', 'inteligencia', 'diagnostico', 'reunioes', 'kickoff'];
    }
}



// ---- Placeholders removed - DiagnosticResponsesPanel replaces DiagnosticoPlaceholder ----

// ---- Main Component ----

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [strategicPlanInfo, setStrategicPlanInfo] = useState<{ id: string, access_token: string } | null>(null);
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
            if (status === 'lead') return ['inteligencia', 'diagnostico', 'reunioes'];
            return ['execucao', 'jornada', 'diagnostico', 'reunioes', 'biblioteca', 'kickoff'];
        }
        return getVisibleTabs(stageCategory);
    }, [currentStage, stageCategory, project?.status]);

    // Default tab based on stage
    const defaultTab = visibleTabs[0] || 'inteligencia';
    const currentPathTarget = location.pathname.split('/').pop() || '';

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

            // Tenta buscar se existe um planejamento estratégico gerado
            try {
                const { data: planData } = await supabase
                    .from('strategic_plans')
                    .select('id, access_token')
                    .eq('rei_project_id', id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (planData) {
                    setStrategicPlanInfo(planData);
                }
            } catch (planErr) {
                console.error("Error fetching strategic plan:", planErr);
            }

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
        return <ProjectDetailsSkeleton />;
    }

    if (!project) return null;

    // Tab definitions with icons
    const TAB_DEFS: Record<string, { label: string; icon: React.ElementType }> = {
        execucao: { label: 'OrqFlow OS', icon: Columns },
        inteligencia: { label: 'Inteligencia B2B', icon: BrainCircuit },
        diagnostico: { label: 'REI', icon: ClipboardCheck },
        jornada: { label: 'Planejamento', icon: Map },
        proposta: { label: 'Proposta', icon: Presentation },
        reunioes: { label: 'Reunioes', icon: Video },
        biblioteca: { label: 'Documentos', icon: BookOpen },
        playbook: { label: 'Playbook AI', icon: Cpu },
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
                            <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                                {editingName ? (
                                    <input
                                        autoFocus
                                        className="bg-zinc-100 border border-zinc-300 px-2 py-1 text-2xl md:text-4xl font-black text-zinc-900 tracking-tight outline-none focus:border-black transition-colors w-auto min-w-[120px]"
                                        value={editNameValue}
                                        onChange={(e) => setEditNameValue(e.target.value)}
                                        onBlur={async () => {
                                            const trimmed = editNameValue.trim();
                                            if (trimmed && trimmed !== project.client_name) {
                                                try {
                                                    await updateReiProject(project.id, { client_name: trimmed });
                                                    sonnerToast.success('Nome atualizado');
                                                    await loadProject();
                                                } catch (e: any) {
                                                    sonnerToast.error('Erro ao salvar nome', { description: e.message });
                                                }
                                            }
                                            setEditingName(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                            if (e.key === 'Escape') { setEditingName(false); }
                                        }}
                                    />
                                ) : (
                                    <span
                                        className="cursor-pointer hover:bg-zinc-100 px-1 -mx-1 transition-colors"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setEditNameValue(project.client_name || '');
                                            setEditingName(true);
                                        }}
                                        title="Clique para editar o nome"
                                    >
                                        {project.client_id ? (
                                            <Link to={`/admin/clients/${project.client_id}`} className="hover:underline transition-colors decoration-2 underline-offset-4 cursor-pointer" title="Ver Perfil do Cliente">
                                                {getDisplayName(project)}
                                            </Link>
                                        ) : (
                                            getDisplayName(project)
                                        )}
                                    </span>
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
                                Projeto #{project.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
                        <ProjectHeaderActions
                            project={project}
                            currentStage={currentStage}
                            stageCategory={stageCategory}
                            advancing={advancing}
                            strategicPlanInfo={strategicPlanInfo}
                            onAdvanceStage={handleAdvanceStage}
                        />

                        <ClientAccessModal project={project} stageCategory={stageCategory} />
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
                        category={stageCategory || null}
                    />
                )}

                {/* ── Project Metadata Table (Notion-style) ─────────── */}
                <div className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 divide-x divide-zinc-100">
                        {[
                            { label: 'Cliente', value: project.client_name || '-' },
                            { label: 'Empresa', value: project.client_company || project.trade_name || '-' },
                            { label: 'Tipo', value: project.type === 'crm_ops' ? 'CRM & RevOps' : project.type === 'founder' ? 'Founder Led' : project.type === 'dev' ? 'Dev & Design' : project.type === 'funnels_impl' ? 'Site & Funil' : '360' },
                            { label: 'Periodo', value: `${project.quarter || '-'} ${project.year || ''}`.trim() },
                            { label: 'Dias no Estagio', value: currentStage ? `${daysInStage}d` : '-' },
                            { label: 'Materiais', value: project.materials_status === 'delivered' ? 'Entregues' : project.materials_status === 'pending' ? 'Pendentes' : 'N/A' },
                        ].map(({ label, value }) => (
                            <div key={label} className="px-4 py-3 first:pl-0">
                                <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-0.5">{label}</p>
                                <p className="text-sm font-bold text-zinc-900 truncate">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

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
                    {/* Inner Sidebar for Desktop */}
                    <div className="w-64 bg-[#F8F9FA] border-r border-zinc-200 hidden md:flex flex-col shrink-0 overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-3">Cockpit Operacional</h2>
                            <div className="flex flex-col gap-0.5 mb-6">
                                {['inteligencia', 'diagnostico', 'execucao', 'success'].map(k => visibleTabs.includes(k) && TAB_DEFS[k] && (
                                    <NavLink key={k} to={k} replace className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-zinc-200/50 text-black border-l-2 border-black' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border-l-2 border-transparent'}`}>
                                        {({ isActive }) => (
                                            <>
                                                {React.createElement(TAB_DEFS[k].icon, { size: 14, strokeWidth: isActive ? 2.5 : 2 })}
                                                {TAB_DEFS[k].label}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>

                            <div className="h-px bg-zinc-200 mb-6" />

                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-3">Estrategia & Pitch</h2>
                            <div className="flex flex-col gap-0.5 mb-6">
                                {['jornada', 'proposta', 'playbook'].map(k => visibleTabs.includes(k) && TAB_DEFS[k] && (
                                    <NavLink key={k} to={k} replace className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-zinc-200/50 text-black border-l-2 border-black' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border-l-2 border-transparent'}`}>
                                        {({ isActive }) => (
                                            <>
                                                {React.createElement(TAB_DEFS[k].icon, { size: 14, strokeWidth: isActive ? 2.5 : 2 })}
                                                {TAB_DEFS[k].label}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>

                            <div className="h-px bg-zinc-200 mb-6" />

                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-3">Cofre & Dossie</h2>
                            <div className="flex flex-col gap-0.5">
                                {['reunioes', 'kickoff', 'biblioteca'].map(k => visibleTabs.includes(k) && TAB_DEFS[k] && (
                                    <NavLink key={k} to={k} replace className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-zinc-200/50 text-black border-l-2 border-black' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border-l-2 border-transparent'}`}>
                                        {({ isActive }) => (
                                            <>
                                                {React.createElement(TAB_DEFS[k].icon, { size: 14, strokeWidth: isActive ? 2.5 : 2 })}
                                                {TAB_DEFS[k].label}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>

                            {/* ClickUp - status de provisionamento em tempo real */}
                            <ClickUpStatusWidget projectId={project.id} />

                            {/* Conta unificada RevHackers + Funnels (client_accounts) */}
                            <ClientAccountPanel
                                clientEmail={project.client_email}
                                projectName={getDisplayName(project)}
                            />
                        </div>
                    </div>

                    {/* Sub-Routes content */}
                    <div className="flex-1 bg-white flex flex-col overflow-y-auto">
                        <div className="flex-1 flex flex-col w-full">
                            {/* Mobile Tab Bar (Visible only on mobile) */}
                            <div className="w-full border-b border-zinc-100 flex justify-start md:hidden bg-zinc-50/80 backdrop-blur-md">
                                <div className="p-0 flex flex-nowrap overflow-x-auto no-scrollbar w-full gap-4 shrink-0 px-4">
                                    {visibleTabs.map((tabKey) => {
                                        const def = TAB_DEFS[tabKey];
                                        if (!def) return null;
                                        const Icon = def.icon;
                                        return (
                                            <NavLink
                                                key={tabKey}
                                                to={tabKey}
                                                replace={true}
                                                className={({ isActive }) => 
                                                    `py-3 text-[13px] font-bold uppercase tracking-widest transition-all flex gap-2 items-center shrink-0 rounded-none border-b-2 ${
                                                        isActive 
                                                        ? 'text-zinc-900 border-[#18181b] shadow-[0_2px_0_0_#18181b]' 
                                                        : 'text-zinc-400 hover:text-zinc-800 border-transparent'
                                                    }`
                                                }
                                            >
                                                <Icon size={14} className="mb-0.5" strokeWidth={2} /> {def.label}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Panels Group - Always visible above tab contents */}
                            <div className="mt-4 flex flex-col gap-4 w-full max-w-7xl mx-auto px-4 md:px-8">
                                <FocalPointsPanel project={project} />
                                
                                {/* Intelligence Panel - show below tabs on diagnostico/vendas stages */}
                                {(stageCategory === 'diagnostico' || stageCategory === 'vendas') && (
                                    <IntelligencePanel project={project} />
                                )}
                            </div>

                            {/* Tab Contents: Execucao is edge-to-edge, others have standard padding container */}
                            <div className="flex-1 flex flex-col w-full relative">
                                <Routes>
                                    <Route path="/" element={<Navigate to={defaultTab} replace />} />
                                    
                                    <Route path="execucao" element={
                                        <div className="m-0 flex-1 flex flex-col pt-4">
                                            <ProjectOsContainer projectId={project.id} />
                                        </div>
                                    } />
                                    
                                    <Route path="*" element={
                                        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 flex-1 flex flex-col pt-6">
                                            <Routes>
                                                <Route path="inteligencia" element={<MarketIntelligenceTab project={project} onUpdateProject={loadProject} />} />
                                                <Route path="diagnostico" element={<DiagnosticResponsesPanel projectId={project.id} projectType={project.type || undefined} />} />
                                                <Route path="jornada" element={<OrchestratedOnboarding projectId={project.id} embedded={true} />} />
                                                <Route path="proposta" element={<SalesRoomTab project={project} />} />
                                                <Route path="reunioes" element={<MeetingVaultTab projectId={project.id} />} />
                                                <Route path="biblioteca" element={<ProjectWiki projectId={project.id} projectName={project.client_name} />} />
                                                <Route path="kickoff" element={<KickoffSignaturePanel project={project} onUpdate={loadProject} />} />
                                                <Route path="playbook" element={<AIPlaybookGenerator projectId={project.id} projectName={project.client_name} />} />
                                                <Route path="success" element={<SuccessPlanTab projectId={project.id} />} />
                                                <Route path="*" element={<Navigate to={`/admin/projects/${project.id}/${defaultTab}`} replace />} />
                                            </Routes>
                                        </div>
                                    } />
                                </Routes>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
