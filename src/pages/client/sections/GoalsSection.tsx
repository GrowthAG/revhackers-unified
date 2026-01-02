import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

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
                        <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{okr.kr}</p>
                                    <p className="text-sm text-zinc-700">{okr.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Month 1: Proof of Concept */}
            <div className="mb-12">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 mb-6">
                    <h3 className="text-2xl font-semibold text-black mb-2">
                        🚀 MÊS 1: Proof of Concept
                    </h3>
                    <p className="text-zinc-600">5 key targets com status tracker</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {month1Targets.map((target: any, index: number) => (
                        <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-black">{target.name}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${target.status === 'done' ? 'bg-green-100 text-green-700' :
                                        target.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-zinc-100 text-zinc-600'
                                    }`}>
                                    {target.status === 'done' ? 'Concluído' :
                                        target.status === 'in_progress' ? 'Em progresso' :
                                            'Não iniciado'}
                                </span>
                            </div>
                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${target.status === 'done' ? 'bg-green-500' :
                                            target.status === 'in_progress' ? 'bg-yellow-500' :
                                                'bg-zinc-300'
                                        }`}
                                    style={{
                                        width: target.status === 'done' ? '100%' :
                                            target.status === 'in_progress' ? '50%' :
                                                '0%'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State for Month 1 Targets */}
            {month1Targets.length === 0 && (
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 mb-6">
                        <h3 className="text-2xl font-semibold text-black mb-2">
                            🚀 MÊS 1: Proof of Concept
                        </h3>
                        <p className="text-zinc-600">5 key targets com status tracker</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: '5 clientes pagos', status: 'pending' },
                            { name: 'R$15-30K MRR', status: 'pending' },
                            { name: 'Playbook documentado', status: 'pending' },
                            { name: '2-3 case studies BR', status: 'pending' },
                            { name: '50+ leads no pipeline', status: 'pending' },
                        ].map((target, index) => (
                            <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-black">{target.name}</h4>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
                                        Não iniciado
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-300" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3 Phases Overview */}
            <div>
                <h3 className="text-2xl font-semibold text-black mb-6">📊 Visão Geral das 3 Fases</h3>
                <div className="space-y-4">
                    <div className="bg-white border-l-4 border-green-500 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-black">FASE 1: Validação Brasil</h4>
                            <span className="text-sm text-zinc-500">Mês 1-4</span>
                        </div>
                        <p className="text-sm text-zinc-700 mb-3">
                            Meta: 60-80 clientes, R$50-40K NMRR
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">R$10-15K NMRR</div>
                                <div className="text-sm font-semibold text-black">Mês 1-2</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">R$25-40K NMRR</div>
                                <div className="text-sm font-semibold text-black">Mês 3-4</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">50-80 clientes</div>
                                <div className="text-sm font-semibold text-black">Base total</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">5+ case studies</div>
                                <div className="text-sm font-semibold text-black">Prova social</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-black">FASE 2: Crescimento Brasil</h4>
                            <span className="text-sm text-zinc-500">Mês 5-8</span>
                        </div>
                        <p className="text-sm text-zinc-700 mb-3">
                            Meta: 130-150 clientes, R$60-70K NMRR
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">R$60-70K NMRR</div>
                                <div className="text-sm font-semibold text-black">Mês 7-8</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">130-150 clientes</div>
                                <div className="text-sm font-semibold text-black">Brasil</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">10-15 clientes</div>
                                <div className="text-sm font-semibold text-black">LATAM soft launch</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">ASP médio</div>
                                <div className="text-sm font-semibold text-black">Mid-market focus</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-black">FASE 3: Consolidação & NMRR</h4>
                            <span className="text-sm text-zinc-500">Mês 9-12</span>
                        </div>
                        <p className="text-sm text-zinc-700 mb-3">
                            Meta: 300-350 clientes, R$95-120K NMRR
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">R$95-120K NMRR</div>
                                <div className="text-sm font-semibold text-black">Mês 11-12</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">300-350 clientes</div>
                                <div className="text-sm font-semibold text-black">Brasil</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">30-40 clientes</div>
                                <div className="text-sm font-semibold text-black">LATAM</div>
                            </div>
                            <div className="bg-zinc-50 rounded p-3">
                                <div className="text-xs text-zinc-500 mb-1">R$1.2M ARR</div>
                                <div className="text-sm font-semibold text-black">Playbook documentado</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
