import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';

interface PipelineArchitectureSectionProps {
    plan: any;
}

export default function PipelineArchitectureSection({ plan }: PipelineArchitectureSectionProps) {
    const formData = plan.form_data || plan.diagnostic_data?.form_data || {};
    const pipelines = formData.revops_custom_pipelines || [];
    const lostReasons = formData.revops_custom_lost_reasons || [];

    if (pipelines.length === 0 && lostReasons.length === 0) return null;

    const categoryLabels: Record<string, string> = {
        bad_fit: 'Fit Inadequado',
        price: 'Preço / Budget',
        ghosted: 'Sem Resposta',
        competitor: 'Concorrência',
        timing: 'Timing',
        other: 'Outros',
    };

    const categoryColors: Record<string, string> = {
        bad_fit: 'bg-red-500',
        price: 'bg-amber-500',
        ghosted: 'bg-zinc-400',
        competitor: 'bg-blue-500',
        timing: 'bg-purple-500',
        other: 'bg-zinc-300',
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-14 py-8 max-w-[1400px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Arquitetura Comercial"
                    titleLine1="Pipeline"
                    titleLine2="& Motivos de Perda"
                    description="O escopo atual do funil comercial e as travas de perda identificadas no diagnóstico."
                />

                {pipelines.length > 0 && (
                    <div className="mt-14 space-y-12">
                        {pipelines.map((pipeline: any, pIdx: number) => (
                            <div key={pIdx}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                    <h3 className="text-[15px] font-bold text-zinc-900 tracking-wider uppercase">
                                        {pipeline.name}
                                    </h3>
                                    <span className="text-[13px] text-zinc-400 font-medium ml-3">
                                        {pipeline.stages?.length || 0} etapas
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
                                    {(pipeline.stages || []).map((stage: string, sIdx: number) => {
                                        const isLast = sIdx === (pipeline.stages?.length || 0) - 1;
                                        return (
                                            <React.Fragment key={sIdx}>
                                                <div className="flex items-center gap-3 px-5 py-3 rounded-lg border border-zinc-200/80 bg-zinc-50/50 shadow-sm">
                                                    <span className="text-[12px] font-bold text-zinc-400 font-mono">
                                                        {sIdx + 1}.
                                                    </span>
                                                    <span className="text-[14px] font-semibold text-zinc-800">
                                                        {stage}
                                                    </span>
                                                </div>
                                                {!isLast && (
                                                    <div className="w-8 h-[2px] bg-zinc-200 shrink-0" />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {lostReasons.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-zinc-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                            <h3 className="text-[15px] font-bold text-zinc-900 tracking-wider uppercase">
                                Motivos de Perda (Lost Reasons)
                            </h3>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {lostReasons.map((lr: any, i: number) => {
                                const cat = lr.category || 'other';
                                const dotColor = categoryColors[cat] || categoryColors.other;
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-5 py-3.5 rounded-lg border border-zinc-200/80 bg-white shadow-sm"
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-semibold text-zinc-800">
                                                {lr.reason}
                                            </span>
                                            <span className="text-[11px] uppercase font-bold text-zinc-400 px-2 py-0.5 bg-zinc-100 rounded-full">
                                                {categoryLabels[cat] || cat}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bottom accent */}
                <div className="flex items-center gap-3 mt-14">
                    <span className="w-2 h-2 rounded-full border-[1.5px] border-[#00CC6A] shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                        Base para CRM
                    </span>
                    <div className="h-[1px] flex-1 bg-zinc-100" />
                </div>
            </div>
        </div>
    );
}
