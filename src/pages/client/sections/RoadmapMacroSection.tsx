import React from 'react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import { Clock, Check } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

type ItemStatus = 'pending' | 'in_progress' | 'done';

const NEXT_STATUS: Record<ItemStatus, ItemStatus> = {
    pending: 'in_progress',
    in_progress: 'done',
    done: 'pending',
};

// ── Duration detection ────────────────────────────────────────────────────
function detectDuration(plan: any): string {
    // Priority: rei_projects.project_duration > roadmap_data.project_duration > type-based fallback
    const fromProject = plan?.rei_projects?.project_duration;
    const fromRoadmap = plan?.roadmap_data?.project_duration || plan?.project_duration;
    if (fromProject) return fromProject;
    if (fromRoadmap) return fromRoadmap;
    const pt = plan?.rei_projects?.type || plan?.project_type || 'full';
    return pt === 'dev' || pt === 'site' ? '6 semanas' : '90 dias';
}

// ── Status Indicator ──────────────────────────────────────────────────────
function StatusDot({ status, dark, interactive, onClick }: {
    status: ItemStatus;
    dark: boolean;
    interactive: boolean;
    onClick?: () => void;
}) {
    const base = `shrink-0 flex items-center justify-center transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-[1.2]' : ''}`;

    if (status === 'done') {
        return (
            <div className={base} onClick={interactive ? onClick : undefined} title={interactive ? 'Voltar para pendente' : 'Concluído'}>
                <div className="w-[17px] h-[17px] rounded-full bg-[#00CC6A] flex items-center justify-center">
                    <Check className="w-[10px] h-[10px] text-white" strokeWidth={3} />
                </div>
            </div>
        );
    }

    if (status === 'in_progress') {
        return (
            <div className={base} onClick={interactive ? onClick : undefined} title={interactive ? 'Marcar concluído' : 'Em andamento'}>
                <div className={`w-[17px] h-[17px] rounded-full border-2 ${dark ? 'border-zinc-500' : 'border-zinc-400'} flex items-center justify-center`}>
                    <div className={`w-[7px] h-[7px] rounded-full ${dark ? 'bg-zinc-500' : 'bg-zinc-400'}`} />
                </div>
            </div>
        );
    }

    // pending
    return (
        <div className={base} onClick={interactive ? onClick : undefined} title={interactive ? 'Marcar em andamento' : 'Pendente'}>
            <div className={`w-[17px] h-[17px] rounded-full border-2 ${dark ? 'border-zinc-700' : 'border-zinc-200'}`} />
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function RoadmapSection({ plan }: { plan: any }) {
    const { isEditing, getField, setField } = usePlanEdit();
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'full';
    const duration = detectDuration(plan);

    const rawPhases = plan?.roadmap_data?.phases || [
        { name: 'Mês 01', title: 'Fundação e Setup', items: ['Alinhamento e acessos', 'Configuração técnica', 'Mapeamento de processos', 'Primeiras automações'] },
        { name: 'Mês 02', title: 'Execução e Validação', items: ['Campanhas ativas', 'Pipeline em operação', 'Métricas iniciais coletadas', 'Ajustes de rota'] },
        { name: 'Mês 03', title: 'Otimização e Entrega', items: ['Revisão de resultados', 'Otimização de conversão', 'Documentação de processos', 'Passagem de bastão'] },
    ];

    const phases = rawPhases.map((p: any) => ({
        ...p,
        name: p.name || p.period || 'Ciclo',
        title: p.title || 'Fase',
        items: p.items || p.tasks || [],
    }));

    const eyebrowMap: Record<string, string> = {
        crm_ops: 'Roadmap CRM',
        founder: 'Roadmap Founder',
        dev: 'Roadmap de Entrega',
        site: 'Roadmap de Entrega',
    };

    // ── Status helpers ────────────────────────────────────────────────────
    const getStatuses = (phaseIdx: number): ItemStatus[] => {
        const path = `roadmap_data.phases.${phaseIdx}.item_statuses`;
        return getField(path) || plan?.roadmap_data?.phases?.[phaseIdx]?.item_statuses || [];
    };

    const getItemStatus = (phaseIdx: number, itemIdx: number): ItemStatus => {
        return getStatuses(phaseIdx)[itemIdx] || 'pending';
    };

    const toggleStatus = (phaseIdx: number, itemIdx: number) => {
        if (!isEditing) return;
        const path = `roadmap_data.phases.${phaseIdx}.item_statuses`;
        const current = [...getStatuses(phaseIdx)];
        while (current.length <= itemIdx) current.push('pending');
        current[itemIdx] = NEXT_STATUS[(current[itemIdx] as ItemStatus) || 'pending'];
        setField(path, current);
    };

    const getPhaseProgress = (phaseIdx: number, total: number) => {
        const statuses = getStatuses(phaseIdx);
        const done = statuses.filter((s: string) => s === 'done').length;
        return { done, total };
    };

    // ── Global progress ───────────────────────────────────────────────────
    const totalItems = phases.reduce((sum: number, p: any) => sum + (p.items?.length || 0), 0);
    const totalDone = phases.reduce((sum: number, _: any, i: number) => {
        return sum + getStatuses(i).filter((s: string) => s === 'done').length;
    }, 0);
    const totalInProgress = phases.reduce((sum: number, _: any, i: number) => {
        return sum + getStatuses(i).filter((s: string) => s === 'in_progress').length;
    }, 0);
    const hasAnyStatus = totalDone > 0 || totalInProgress > 0;

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-14 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow={eyebrowMap[projectType] || 'Execução Plena'}
                    titleLine1="Cronograma"
                    titleLine2="Detalhado"
                    description="O desdobramento prático, documentando as entregas exatas de cada fase a partir do diagnóstico."
                />

                {/* ── Duration + Global Progress ── */}
                <div className="flex items-center gap-3 mt-8 mb-8 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#00CC6A]" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                            Projeto de {duration}
                        </span>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400">
                        {phases.length} {phases.length === 1 ? 'fase' : 'fases'} de execução
                    </span>
                    {hasAnyStatus && (
                        <>
                            <div className="w-[1px] h-4 bg-zinc-200" />
                            <span className="text-[11px] font-bold text-[#00CC6A]">
                                {totalDone} de {totalItems} concluídos
                            </span>
                        </>
                    )}
                </div>

                {/* ── Status Legend (edit mode only) ── */}
                {isEditing && (
                    <div className="flex items-center gap-5 mb-6 px-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status:</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full border-2 border-zinc-200" />
                            <span className="text-[11px] text-zinc-400">Pendente</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full border-2 border-zinc-400 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            </div>
                            <span className="text-[11px] text-zinc-400">Em andamento</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#00CC6A] flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-zinc-400">Concluído</span>
                        </div>
                        <span className="text-[10px] text-zinc-300 ml-1">Clique nos indicadores para alternar</span>
                    </div>
                )}

                {/* ── Phase Cards ── */}
                <div className={`grid gap-5 ${phases.length === 2 ? 'grid-cols-1 md:grid-cols-2' : phases.length >= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {phases.map((phase: any, index: number) => {
                        const itemsArray = phase.items || [];
                        const isLast = index === phases.length - 1;
                        const { done, total } = getPhaseProgress(index, itemsArray.length);
                        const progressPct = total > 0 ? (done / total) * 100 : 0;

                        return (
                            <div
                                key={index}
                                className={`overflow-hidden flex flex-col ${isLast
                                    ? 'bg-zinc-950 rounded-xl'
                                    : 'border border-zinc-200 bg-white rounded-xl'
                                }`}
                            >
                                {/* ── Progress bar (top edge) ── */}
                                <div className={`h-[3px] ${isLast ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                    {progressPct > 0 && (
                                        <div
                                            className="h-full bg-[#00CC6A] transition-all duration-500 ease-out rounded-full"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    )}
                                </div>

                                {/* ── Phase Header ── */}
                                <div className={`px-5 pt-5 pb-4 ${isLast ? '' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md inline-block">
                                            <EditableField
                                                placeholder="Período"
                                                path={`roadmap_data.phases.${index}.name`}
                                                className="bg-transparent text-[#00CC6A] focus:bg-white outline-none"
                                            />
                                        </span>
                                        {hasAnyStatus && total > 0 && (
                                            <span className={`text-[11px] font-bold tabular-nums ${done === total && total > 0 ? 'text-[#00CC6A]' : isLast ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                                {done}/{total}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-[17px] font-bold tracking-tight leading-tight ${isLast ? 'text-white' : 'text-zinc-900'}`}>
                                        <EditableField
                                            placeholder="Nome da Fase"
                                            path={`roadmap_data.phases.${index}.title`}
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </h3>
                                </div>

                                {/* ── Separator ── */}
                                <div className={`mx-5 h-px ${isLast ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

                                {/* ── Task List ── */}
                                <div className="px-5 py-4 space-y-3 flex-1">
                                    {itemsArray.map((_item: any, itemIndex: number) => {
                                        const status = getItemStatus(index, itemIndex);
                                        const isDone = status === 'done';
                                        return (
                                            <div key={itemIndex} className="flex items-start gap-3">
                                                <div className="mt-[3px]">
                                                    <StatusDot
                                                        status={status}
                                                        dark={isLast}
                                                        interactive={isEditing}
                                                        onClick={() => toggleStatus(index, itemIndex)}
                                                    />
                                                </div>
                                                <p className={`text-[13px] font-medium leading-relaxed w-full transition-colors duration-200 ${isDone
                                                    ? (isLast ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-zinc-300 line-through decoration-zinc-300')
                                                    : (isLast ? 'text-zinc-400' : 'text-zinc-600')
                                                }`}>
                                                    <EditableField
                                                        placeholder="Ação tática..."
                                                        path={`roadmap_data.phases.${index}.items.${itemIndex}`}
                                                        className="bg-transparent focus:bg-zinc-50 outline-none w-full break-words"
                                                        multiline
                                                    />
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Footer ── */}
                <div className="mt-6 flex items-center gap-3">
                    <span className="text-[#00CC6A] shrink-0 text-sm">/</span>
                    <span className="text-[11px] font-bold text-[#00CC6A] uppercase tracking-widest">
                        {totalDone === totalItems && totalItems > 0
                            ? 'Projeto Concluído'
                            : 'Entrega & Passagem de Bastão'
                        }
                    </span>
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}
