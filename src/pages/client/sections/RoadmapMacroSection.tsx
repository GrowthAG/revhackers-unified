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
                <div className="flex items-center gap-4 mt-4 mb-10 pb-6 border-b border-zinc-100 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] rounded-md">
                        <Clock className="w-3.5 h-3.5 text-[#00CC6A]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                            Projeto de {duration}
                        </span>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        {phases.length} {phases.length === 1 ? 'fase' : 'fases'} de execução
                    </span>
                    {hasAnyStatus && (
                        <>
                            <div className="w-[1px] h-3 bg-zinc-200" />
                            <span className="text-[11px] font-bold text-[#00CC6A] uppercase tracking-widest">
                                {totalDone} de {totalItems} entregas
                            </span>
                        </>
                    )}
                </div>

                {/* ── Status Legend (edit mode only) ── */}
                {isEditing && (
                    <div className="flex items-center gap-5 mb-8">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status Editável:</span>
                        <div className="flex items-center gap-1.5 cursor-help" title="Pendente">
                            <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-zinc-200" />
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Pendente</span>
                        </div>
                        <div className="flex items-center gap-1.5 cursor-help" title="Em andamento">
                            <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-zinc-400 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Em andabento</span>
                        </div>
                        <div className="flex items-center gap-1.5 cursor-help" title="Concluído">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#00CC6A] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Concluído</span>
                        </div>
                    </div>
                )}

                {/* ── Phase Vertical List ── */}
                <div className="space-y-12">
                    {phases.map((phase: any, index: number) => {
                        const itemsArray = phase.items || [];
                        const isLast = index === phases.length - 1;
                        const { done, total } = getPhaseProgress(index, itemsArray.length);
                        const progressPct = total > 0 ? (done / total) * 100 : 0;
                        const isFullyDone = done === total && total > 0;

                        return (
                            <div key={index} className="flex gap-6 lg:gap-12 relative">
                                
                                {/* Timeline line */}
                                {!isLast && (
                                    <div className="absolute left-[3px] lg:left-[5px] top-[30px] bottom-[-40px] w-px bg-zinc-100" />
                                )}

                                {/* Period indicator dot */}
                                <div className="pt-2 z-10 shrink-0">
                                    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full border-[2px] bg-white transition-colors duration-300 ${isFullyDone ? 'border-[#00CC6A] bg-[#00CC6A]' : 'border-zinc-300'}`} />
                                </div>

                                {/* Phase Content */}
                                <div className="flex-1 max-w-4xl">
                                    <div className="mb-6 flex flex-col lg:flex-row lg:items-end gap-2 lg:gap-8 border-b border-zinc-100 pb-4">
                                        <div className="flex-1">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00CC6A] mb-2 block">
                                                <EditableField
                                                    placeholder="Período"
                                                    path={`roadmap_data.phases.${index}.name`}
                                                    className="bg-transparent focus:bg-zinc-50 outline-none"
                                                />
                                            </span>
                                            <h3 className={`text-[17px] md:text-xl font-bold tracking-tight leading-tight ${isFullyDone ? 'text-zinc-500' : 'text-zinc-900'}`}>
                                                <EditableField
                                                    placeholder="Nome da Fase"
                                                    path={`roadmap_data.phases.${index}.title`}
                                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                                />
                                            </h3>
                                        </div>
                                        
                                        {total > 0 && (
                                            <div className="shrink-0 flex items-center gap-3">
                                                <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#00CC6A] transition-all duration-500" 
                                                        style={{ width: `${progressPct}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-mono font-bold ${isFullyDone ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                                                    {done}/{total}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Task List Grid inside Phase */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {itemsArray.map((_item: any, itemIndex: number) => {
                                            const status = getItemStatus(index, itemIndex);
                                            const isDone = status === 'done';
                                            return (
                                                <div key={itemIndex} className="flex items-start gap-4">
                                                    <div className="mt-[4px]">
                                                        <StatusDot
                                                            status={status}
                                                            dark={false}
                                                            interactive={isEditing}
                                                            onClick={() => toggleStatus(index, itemIndex)}
                                                        />
                                                    </div>
                                                    <p className={`text-[13px] font-medium leading-[1.6] w-full transition-colors duration-200 ${isDone
                                                        ? 'text-zinc-400 line-through decoration-zinc-300'
                                                        : 'text-zinc-700'
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
                            </div>
                        );
                    })}
                </div>

                {/* ── Footer / End of Roadmap ── */}
                <div className="mt-16 flex items-center gap-4 max-w-4xl ml-0 lg:ml-16">
                    <span className="text-zinc-300 shrink-0 text-sm">/</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {totalDone === totalItems && totalItems > 0
                            ? 'PROJETO CONCLUÍDO'
                            : 'ENTREGA E PASSAGEM DE BASTÃO'
                        }
                    </span>
                    <div className="h-[1px] flex-1 bg-zinc-200/50" />
                </div>
            </div>
        </div>
    );
}
