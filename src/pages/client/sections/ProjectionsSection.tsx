import React from 'react';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

interface ProjectionsSectionProps {
    plan: any;
}

export default function ProjectionsSection({ plan }: ProjectionsSectionProps) {
    const projections = plan.financial_projections || {};
    const metaMonth12 = projections.meta_month_12 || {};
    const monthlyProjections = projections.monthly_projections || [];

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    💰 Projeções Financeiras
                </h2>
                <p className="text-zinc-600">
                    Evolução de MRR, clientes e ARR ao longo de 12 meses
                </p>
            </div>

            {/* Meta Month 12 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-black">🎯 Meta Mês 12</h3>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">NMRR Total</p>
                        <p className="text-3xl font-bold text-green-600">{metaMonth12.nmrr_total || 'R$100K'}</p>
                        <p className="text-xs text-zinc-500 mt-1">R$1.2M ARR</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">Clientes Totais</p>
                        <p className="text-3xl font-bold text-black">{metaMonth12.clients_total || '300-350'}</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">Brasil</p>
                        <p className="text-3xl font-bold text-green-600">{metaMonth12.nmrr_brazil || 'R$80-100K'}</p>
                        <p className="text-xs text-zinc-500 mt-1">{metaMonth12.clients_brazil || '300-350'} clientes</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">LATAM</p>
                        <p className="text-3xl font-bold text-yellow-600">{metaMonth12.nmrr_latam || 'R$15-20K'}</p>
                        <p className="text-xs text-zinc-500 mt-1">{metaMonth12.clients_latam || '30-40'} clientes</p>
                    </div>
                </div>
            </div>

            {/* Monthly Projections Table */}
            <div className="mb-12">
                <h3 className="text-2xl font-semibold text-black mb-6">📊 Números Detalhados por Período</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border border-zinc-200 rounded-lg overflow-hidden">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Período</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">NMRR Brasil</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">NMRR LATAM</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">NMRR Total</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Clientes Brasil</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Clientes LATAM</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Total Clientes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {monthlyProjections.map((projection: any, index: number) => (
                                <tr key={index} className={index === monthlyProjections.length - 1 ? 'bg-green-50' : 'bg-white'}>
                                    <td className="px-4 py-3 text-sm font-medium text-black">{projection.period}</td>
                                    <td className="px-4 py-3 text-sm text-green-700 font-semibold">{projection.nmrr_brazil}</td>
                                    <td className="px-4 py-3 text-sm text-yellow-700 font-semibold">{projection.nmrr_latam || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-blue-700 font-semibold">{projection.nmrr_total}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{projection.clients_brazil}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{projection.clients_latam || '-'}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-black">{projection.total_clients}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Growth Chart Visualization */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-black mb-6">📈 Crescimento Projetado</h3>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-64">
                    {monthlyProjections.map((projection: any, index: number) => {
                        const maxNMRR = 120000; // R$120K
                        const nmrrValue = parseInt(projection.nmrr_total.replace(/[^0-9]/g, '')) * 1000;
                        const heightPercentage = (nmrrValue / maxNMRR) * 100;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600" style={{ height: `${heightPercentage}%` }}>
                                    <div className="text-xs text-white font-semibold p-1 text-center">
                                        {projection.nmrr_total}
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-600 text-center">{projection.period}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-zinc-600 italic">
                        "Mês 12: R$100K NMRR = R$1.2M ARR. Brasil responde por 80-85% da receita. LATAM é validação inicial."
                    </p>
                </div>
            </div>
        </div>
    );
}
