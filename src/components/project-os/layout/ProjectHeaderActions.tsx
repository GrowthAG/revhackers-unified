import React from 'react';
import { Button } from '@/components/ui/button';
import { Cpu, CheckCircle2, Map, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StageTransitionButtons } from '@/components/project-os/layout/StageTransitionButtons';
import type { ReiProject } from '@/api/reiProjects';
import type { PipelineStage } from '@/types/pipeline';

interface ProjectHeaderActionsProps {
    project: ReiProject;
    currentStage: PipelineStage | null;
    stageCategory: string | null;
    advancing: boolean;
    strategicPlanInfo: { id: string; access_token: string } | null;
    onAdvanceStage: (stage: PipelineStage) => void;
}

export function ProjectHeaderActions({
    project,
    currentStage,
    stageCategory,
    advancing,
    strategicPlanInfo,
    onAdvanceStage
}: ProjectHeaderActionsProps) {
    const navigate = useNavigate();

    return (
        <React.Fragment>
            {/* Stage transition buttons */}
            {currentStage && (
                <StageTransitionButtons
                    currentStage={currentStage}
                    onAdvance={onAdvanceStage}
                    advancing={advancing}
                />
            )}

            {/* Fallback: old qualify button for projects without pipeline_stage */}
            {!currentStage && project.status === 'lead' && (
                <Button
                    size="sm"
                    disabled={advancing}
                    onClick={() => onAdvanceStage('lead_qualified' as PipelineStage)}
                    className="text-xxs font-black uppercase tracking-widest border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 gap-1.5 transition-all rounded-none"
                >
                    <CheckCircle2 size={12} /> Qualificar
                </Button>
            )}

            <div className="w-px h-6 bg-zinc-200 mx-1" />

            {['execucao', 'fechamento', 'vendas', 'encerrado'].includes(stageCategory || '') && !strategicPlanInfo && (
                <Button
                    variant="default"
                    size="sm"
                    disabled={project.materials_status === 'pending'}
                    onClick={() => navigate(`/admin/planejamento/${project.id}`)}
                    className={`text-xxs font-bold uppercase tracking-widest rounded-none transition-all ${
                        project.materials_status === 'pending'
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            : 'border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950'
                    }`}
                >
                    <Cpu size={12} className="mr-2" /> Planejamento IA
                </Button>
            )}

            {['execucao', 'fechamento', 'vendas', 'encerrado'].includes(stageCategory || '') && strategicPlanInfo && (
                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/plan/${strategicPlanInfo.access_token}?edit=1`, '_blank')}
                        className="text-xxs font-bold uppercase tracking-widest rounded-none border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all font-mono shadow-sm"
                    >
                        <Map size={12} className="mr-2" />
                        Ver Planejamento
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/planejamento/${project.id}`)}
                        className="text-xxs font-bold uppercase tracking-widest rounded-none border border-zinc-200 bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all px-2"
                        title="Editar ou Regerar o plano com IA"
                    >
                        <Cpu size={12} />
                    </Button>
                    {!project.scheduling_completed && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                // A placeholder alert or navigation for the actual scheduling popup/link 
                                // that CS team should click to schedule the Kickoff/Presentation
                                alert('Abre modal ou envia link Calendly para o cliente B2B');
                            }}
                            className="text-xxs font-black uppercase tracking-widest rounded-none border border-black bg-black text-white hover:bg-zinc-800 transition-all font-mono shadow-sm ml-2 animate-pulse"
                        >
                            <CalendarClock size={12} className="mr-2" />
                            Agendar Apresentação
                        </Button>
                    )}
                </div>
            )}
        </React.Fragment>
    );
}
