import React from 'react';
import { User, Target, Zap, MessageSquare, Award, TrendingUp } from 'lucide-react';

interface PersonaSectionProps {
    plan: any;
}

export default function PersonaSection({ plan }: PersonaSectionProps) {
    const market = plan.market_intelligence || {};
    const personas = market.personas || [plan.persona_data] || []; // Fallback to old single persona if array missing
    const benchmarks = market.competitor_benchmarks || [];

    return (
        <div className="space-y-16">
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6">
                <h2 className="text-3xl font-semibold text-black tracking-tight mb-2">
                    Persona & Inteligência de Mercado
                </h2>
                <p className="text-zinc-500 font-light">
                    Análise profunda dos perfis de compra e benchmarks competitivos.
                </p>
            </div>

            {/* Personas Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {personas.slice(0, 3).map((persona: any, index: number) => (
                    <div key={index} className="group border border-zinc-200 p-8 rounded-xl hover:border-zinc-400 transition-colors bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-black">{persona.name || 'Persona'}</h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">{persona.role || 'Cargo'}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-zinc-800 font-medium text-sm">
                                    <Zap className="w-4 h-4" />
                                    <span>Principal Dor (Pain)</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {persona.pain}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2 text-zinc-800 font-medium text-sm">
                                    <Target className="w-4 h-4" />
                                    <span>Gatilho de Compra</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {persona.trigger}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2 text-zinc-800 font-medium text-sm">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Mensagem Chave</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed italic border-l-2 border-zinc-200 pl-3">
                                    "{persona.message}"
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2 text-zinc-800 font-medium text-sm">
                                    <Award className="w-4 h-4" />
                                    <span>WIIFM (Ganho Pessoal)</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {persona.wiifm}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Benchmarks Table */}
            {benchmarks.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-black" />
                        <h3 className="text-xl font-semibold text-black">Benchmarks Competitivos</h3>
                    </div>

                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-1/4">Empresa / Player</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-1/4">Métrica Chave</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Insight de Estratégia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {benchmarks.map((bench: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-black">
                                            {bench.company_name}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-600 font-mono">
                                            {bench.key_metric}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-600">
                                            {bench.strategy_insight}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-zinc-400 text-right">
                        * Dados de mercado aproximados coletados via Inteligência Artificial.
                    </p>
                </div>
            )}
        </div>
    );
}
