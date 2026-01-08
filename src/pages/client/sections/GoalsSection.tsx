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
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    📈 Metas & KPIs
                </h2>
                <p className="text-zinc-600">
                    Objetivos mensuráveis e indicadores-chave de performance
                </p>
            </div>

            {/* Smart OKRs */}
            <div className="mb-12">
                <h3 className="text-2xl font-semibold text-black mb-6">🎯 Smart OKR's</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {okrs.map((okr: any, index: number) => (
                        <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6 hover:border-black transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{okr.kr}</p>
                                    <p className="text-sm text-zinc-900 font-medium">{okr.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Month 1: Proof of Concept */}
            <div className="mb-12">
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 mb-6">
                    <h3 className="text-2xl font-semibold text-black mb-2">
                        🚀 MÊS 1: Proof of Concept
                    </h3>
                    <p className="text-zinc-600">5 key targets com status tracker</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {(month1Targets.length > 0 ? month1Targets : [
                        { name: '5 clientes pagos', status: 'pending' },
                        { name: 'R$15-30K MRR', status: 'pending' },
                        { name: 'Playbook documentado', status: 'pending' },
                        { name: '2-3 case studies BR', status: 'pending' },
                        { name: '50+ leads no pipeline', status: 'pending' },
                    ]).map((target: any, index: number) => {
                        const isDone = target.status === 'done';
                        const isInProgress = target.status === 'in_progress';

                        return (
                            <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-black">{target.name}</h4>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${isDone ? 'bg-black text-white' :
                                        isInProgress ? 'bg-zinc-100 text-zinc-900' :
                                            'bg-zinc-50 text-zinc-400'
                                        }`}>
                                        {isDone ? 'Concluído' : isInProgress ? 'Em Andamento' : 'Pendente'}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${isDone ? 'bg-black' : isInProgress ? 'bg-zinc-400' : 'bg-zinc-200'}`}
                                        style={{ width: isDone ? '100%' : isInProgress ? '50%' : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3 Phases Overview */}
            <div>
                <h3 className="text-2xl font-semibold text-black mb-6">📊 Visão Geral das 3 Fases</h3>
                <div className="space-y-4">
                    {[
                        { title: 'FASE 1: Validação', subtitle: 'Mês 1-4', desc: 'Meta: 60-80 clientes, R$50-40K NMRR', stats: [{ l: 'R$10-15K NMRR', v: 'Mês 1-2' }, { l: 'R$25-40K NMRR', v: 'Mês 3-4' }] },
                        { title: 'FASE 2: Crescimento', subtitle: 'Mês 5-8', desc: 'Meta: 130-150 clientes, R$60-70K NMRR', stats: [{ l: 'R$60-70K NMRR', v: 'Mês 7-8' }, { l: '130-150 clientes', v: 'Brasil' }] },
                        { title: 'FASE 3: Consolidação', subtitle: 'Mês 9-12', desc: 'Meta: 300-350 clientes, R$95-120K NMRR', stats: [{ l: 'R$95-120K NMRR', v: 'Mês 11-12' }, { l: '300-350 clientes', v: 'Escala' }] }
                    ].map((phase, i) => (
                        <div key={i} className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-8 h-8 flex items-center justify-center bg-black text-white font-bold text-sm rounded-full">{i + 1}</span>
                                    <h4 className="text-lg font-bold text-black">{phase.title}</h4>
                                    <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 font-medium">{phase.subtitle}</span>
                                </div>
                                <p className="text-sm text-zinc-600 pl-11">{phase.desc}</p>
                            </div>
                            <div className="flex gap-4">
                                {phase.stats.map((stat, j) => (
                                    <div key={j} className="bg-zinc-50 px-4 py-2 rounded border border-zinc-100 min-w-[120px]">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{stat.v}</div>
                                        <div className="text-sm font-bold text-black">{stat.l}</div>
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

