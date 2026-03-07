import React from 'react';
import { TrendingUp } from 'lucide-react';

interface MethodologySectionProps {
    plan: any;
}

export default function MethodologySection({ plan }: MethodologySectionProps) {
    const methodology = plan.methodology_data || {};
    const steps = methodology.steps || [];

    return (
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    METODOLOGIA DE ENTREGA
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    Estratégia de <span className="text-zinc-300">Execução</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Framework validado para escala previsível — cada etapa com entregáveis claros e prazos definidos.
                </p>
            </div>

            {/* Steps */}
            {steps.length > 0 ? (
                <div className="space-y-0">
                    {steps.map((step: any, index: number) => (
                        <div key={index} className="group relative flex gap-8 pb-10 last:pb-0">
                            <div className="flex flex-col items-center flex-shrink-0 relative">
                                <div className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-black flex items-center justify-center text-sm font-black z-10 group-hover:bg-zinc-950 group-hover:border-zinc-950 group-hover:text-white transition-all">
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="absolute top-10 bottom-0 w-[1px] bg-zinc-100" />
                                )}
                            </div>
                            <div className="flex-1 pt-1">
                                <h3 className="text-lg font-bold text-zinc-900 mb-1">{step.name}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-zinc-400 border border-zinc-100 rounded-xl">
                    <p className="text-sm font-medium">Metodologia será definida com base no diagnóstico do projeto.</p>
                </div>
            )}

            {/* Alocação de Esforço */}
            {methodology.allocation && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8">
                    <div className="mb-6">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-1">Alocação de Esforço</span>
                        <h4 className="text-xl font-bold text-zinc-900">Distribuição por Área</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(methodology.allocation || []).map((item: any, i: number) => (
                            <div key={i} className="bg-white border border-zinc-100 rounded-xl p-5">
                                <div className="text-2xl font-black text-zinc-900 mb-1">{item.pct || item.percentage}</div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.label || item.area}</p>
                                <div className="h-1 bg-zinc-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-zinc-900" style={{ width: item.pct || item.percentage }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
