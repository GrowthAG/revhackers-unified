import React from 'react';
import { Target, TrendingUp, Check } from 'lucide-react';

interface GoalsSectionProps {
    plan: any;
}

export default function GoalsSection({ plan }: GoalsSectionProps) {
    const goals = plan.goals_data || {};
    const okrs = goals.okrs || [];
    const month1Targets = goals.month1_targets || [];

    return (
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    DESEMPENHO
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    OKRs & <span className="text-zinc-300">Indicadores</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Objetivo do período, resultados-chave mensuráveis e indicadores de acompanhamento.
                </p>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-950 text-white rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#00CC6A] flex-shrink-0" />
                    <div><span className="text-xs font-bold">Objetivo</span><br /><span className="text-[10px] text-zinc-400">Qualitativo e aspiracional. Define a direção do período.</span></div>
                </div>
                <div className="bg-zinc-100 rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500">KR</span>
                    <div><span className="text-xs font-bold">Resultados-Chave</span><br /><span className="text-[10px] text-zinc-400">Mensuráveis e estruturais. Estrutura, não valor monetário.</span></div>
                </div>
                <div className="bg-zinc-100 rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400">KPI</span>
                    <div><span className="text-xs font-bold">Indicadores</span><br /><span className="text-[10px] text-zinc-400">Sinais de risco antecipados antes de afetar os objetivos.</span></div>
                </div>
            </div>

            {/* OKR Cards */}
            <div className="space-y-8">
                {/* Objective */}
                <div className="bg-zinc-950 text-white rounded-xl px-6 py-4 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-[#00CC6A] flex items-center justify-center text-black text-xs font-black">O</span>
                    <div>
                        <p className="text-[10px] text-[#00CC6A] font-bold uppercase tracking-widest">Objetivo do Período</p>
                        <p className="text-lg font-bold">{goals.objective || goals.okr_objective || '—'}</p>
                    </div>
                </div>

                {/* KR Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {okrs.map((okr: any, index: number) => (
                        <div key={index} className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">KR {index + 1}</p>
                            <p className="text-sm font-bold text-zinc-900 leading-snug">{okr.description}</p>
                            {okr.timeline && <span className="inline-block mt-2 text-[10px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded">{okr.timeline}</span>}
                        </div>
                    ))}
                </div>

                {/* KR Details */}
                {okrs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {okrs.map((okr: any, index: number) => (
                            <div key={index} className="border border-zinc-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl font-black text-zinc-200">{String(index + 1).padStart(2, '0')}</span>
                                    <h4 className="text-base font-bold text-zinc-900">KR {index + 1} — {okr.category || okr.area || okr.description?.split(' ').slice(0, 3).join(' ')}</h4>
                                </div>
                                {okr.sub_results && okr.sub_results.length > 0 ? (
                                    <div className="space-y-2">
                                        {okr.sub_results.map((sub: any, j: number) => (
                                            <div key={j} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                                                <span className="text-sm text-zinc-600 flex items-center gap-2">
                                                    <span className="text-[10px] text-zinc-300 font-mono">KR {index + 1}.{j + 1}</span>
                                                    {sub.description || sub}
                                                </span>
                                                {sub.timeline && <span className="text-[10px] text-zinc-400 font-mono bg-zinc-50 px-2 py-0.5 rounded">{sub.timeline}</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500">{okr.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Horizonte Temporal */}
            <div className="bg-zinc-950 text-white rounded-xl px-6 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00CC6A]" />
                <span className="text-xs font-bold uppercase tracking-widest">Horizonte de 12 meses</span>
            </div>
        </div>
    );
}
