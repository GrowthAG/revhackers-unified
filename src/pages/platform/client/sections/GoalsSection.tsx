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
        <div className="py-20 space-y-32">
            {/* Section Header */}
            <div className="text-center space-y-6">
                <h2 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-[-0.05em] select-none">
                    Objetivos
                </h2>
                <div className="w-40 h-[1px] bg-revgreen mx-auto shadow-[0_0_20px_rgba(3,252,59,0.5)]"></div>
                <p className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.4em]">
                    Targets & Success Metrics
                </p>
            </div>

            {/* Smart OKRs */}
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Strategic OKRs</h3>
                    <Target className="text-revgreen animate-pulse" size={32} />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {okrs.map((okr: any, index: number) => (
                        <div key={index} className="bg-black border border-zinc-900 p-8 rounded-xl hover:border-revgreen/50 transition-all group relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-revgreen/30 group-hover:bg-revgreen transition-colors"></div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4 group-hover:text-revgreen transition-colors">{okr.kr}</span>
                            <p className="text-lg font-black text-white uppercase tracking-tight leading-tight">{okr.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Month 1: Proof of Concept */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 overflow-hidden relative">
                    <div className="relative z-10 space-y-16">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-revgreen uppercase tracking-[0.4em] block mb-2">Cycle 01 - Launch</span>
                                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Prova de Conceito</h3>
                            </div>
                            <p className="text-zinc-500 font-medium max-w-sm uppercase tracking-widest text-right hidden md:block">
                                5 metas mandatórias para validação do modelo de growth.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-6">
                            {(month1Targets.length > 0 ? month1Targets : [
                                { name: '5 Clientes Pagos', status: 'pending' },
                                { name: 'R$15-30K MRR', status: 'pending' },
                                { name: 'RevPlaybook v1', status: 'pending' },
                                { name: '3 Success Cases', status: 'pending' },
                                { name: '50 SQOs Pipeline', status: 'pending' },
                            ]).map((target: any, index: number) => {
                                const isDone = target.status === 'done';
                                const isInProgress = target.status === 'in_progress';

                                return (
                                    <div key={index} className="p-6 bg-black border border-zinc-900 rounded-2xl hover:border-revgreen/30 transition-all group">
                                        <div className="flex flex-col h-full justify-between gap-6">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest leading-tight group-hover:text-revgreen transition-colors">{target.name}</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Status</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isDone ? 'text-revgreen' : 'text-zinc-400'}`}>
                                                        {isDone ? 'Deployed' : isInProgress ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${isDone ? 'bg-revgreen shadow-[0_0_10px_rgba(3,252,59,0.5)]' : 'bg-zinc-700'}`}
                                                        style={{ width: isDone ? '100%' : isInProgress ? '50%' : '5%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Phases: Master Scaling */}
            <div className="max-w-7xl mx-auto pt-20 border-t border-zinc-900">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Escala Trimestral</h3>
                </div>

                <div className="space-y-8">
                    {[
                        { title: 'Validação', subtitle: 'Mês 1-4', desc: 'Foco em unit economics e canal primário.', stats: [{ l: 'R$15K MRR', v: 'Target 1' }, { l: 'ROI > 3x', v: 'Metric' }] },
                        { title: 'Crescimento', subtitle: 'Mês 5-8', desc: 'Expansão de budget e diversificação de canais.', stats: [{ l: 'R$70K MRR', v: 'Target 2' }, { l: 'Scale Engine', v: 'LTV' }] },
                        { title: 'Dominação', subtitle: 'Mês 9-12', desc: 'Liderança de mercado e maximização de EBITDA.', stats: [{ l: 'R$120K MRR', v: 'Target 3' }, { l: 'Market Leader', v: 'Exit Readiness' }] }
                    ].map((phase, i) => (
                        <div key={i} className="bg-black border border-zinc-900 p-10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-start md:items-center hover:bg-zinc-950 transition-all group">
                            <div className="shrink-0 flex items-center gap-6">
                                <span className="text-6xl font-black text-zinc-900 group-hover:text-revgreen/10 transition-colors">0{i + 1}</span>
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{phase.title}</h4>
                                    <span className="text-[10px] text-revgreen font-bold uppercase tracking-widest">{phase.subtitle}</span>
                                </div>
                            </div>

                            <p className="flex-1 text-sm text-zinc-500 font-medium leading-relaxed md:border-l md:border-zinc-900 md:pl-10">
                                {phase.desc}
                            </p>

                            <div className="flex gap-4 w-full md:w-auto">
                                {phase.stats.map((stat, j) => (
                                    <div key={j} className="flex-1 md:flex-none p-4 bg-zinc-950 border border-zinc-900 rounded-xl min-w-[140px] group-hover:border-zinc-800 transition-all text-center">
                                        <div className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">{stat.v}</div>
                                        <div className="text-sm font-black text-white uppercase tracking-tight">{stat.l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

