import React from 'react';
import { DollarSign, PieChart } from 'lucide-react';

interface InvestmentSectionProps {
    plan: any;
}

export default function InvestmentSection({ plan }: InvestmentSectionProps) {
    const budget = plan.budget_data || {};
    const channels = budget.channels || [];

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    💵 Investimento
                </h2>
                <p className="text-zinc-600">
                    Planejamento financeiro e alocação de budget por canal
                </p>
            </div>

            {/* Annual Budget */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-8 mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-black">Investimento Anual</h3>
                        <p className="text-sm text-zinc-600">Budget total para os primeiros 12 meses</p>
                    </div>
                </div>

                <div className="text-center py-6">
                    <p className="text-5xl font-bold text-blue-600">{budget.annual_budget || 'R$ 9.000,00'}</p>
                    <p className="text-sm text-zinc-600 mt-2">Investimento total em marketing e vendas</p>
                </div>
            </div>

            {/* Channel Distribution */}
            <div className="mb-12">
                <h3 className="text-2xl font-semibold text-black mb-6">📊 Distribuição de Budget por Canal</h3>

                <div className="grid md:grid-cols-5 gap-4 mb-8">
                    {channels.map((channel: any, index: number) => (
                        <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">{channel.percentage}</div>
                            <p className="text-sm text-zinc-600">{channel.name}</p>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {channels.length === 0 && (
                    <div className="grid md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">40%</div>
                            <p className="text-sm text-zinc-600">LinkedIn Outreach</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">25%</div>
                            <p className="text-sm text-zinc-600">Content Brasil</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">15%</div>
                            <p className="text-sm text-zinc-600">Email Outreach</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">15%</div>
                            <p className="text-sm text-zinc-600">Paid Ads</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-black mb-2">5%</div>
                            <p className="text-sm text-zinc-600">Parcerias</p>
                        </div>
                    </div>
                )}

                {/* Visual Pie Chart */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8">
                    <div className="flex items-center justify-center gap-12">
                        {/* Simplified Pie Chart Representation */}
                        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                                <PieChart className="w-16 h-16 text-zinc-400" />
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-blue-500"></div>
                                <span className="text-sm text-zinc-700">LinkedIn Outreach (40%)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-cyan-500"></div>
                                <span className="text-sm text-zinc-700">Content Brasil (25%)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                <span className="text-sm text-zinc-700">Email Outreach (15%)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                                <span className="text-sm text-zinc-700">Paid Ads (15%)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-purple-500"></div>
                                <span className="text-sm text-zinc-700">Parcerias (5%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROI Expected */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-black mb-4">💡 ROI Esperado</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">Investimento Total</p>
                        <p className="text-2xl font-bold text-black">R$ 9.000</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">ARR Projetado (Mês 12)</p>
                        <p className="text-2xl font-bold text-green-600">R$ 1.200.000</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-zinc-600 mb-2">ROI</p>
                        <p className="text-2xl font-bold text-green-600">133x</p>
                    </div>
                </div>
                <p className="text-sm text-zinc-600 text-center mt-6 italic">
                    Para cada R$1 investido, esperamos retornar R$133 em receita anual recorrente
                </p>
            </div>
        </div>
    );
}
