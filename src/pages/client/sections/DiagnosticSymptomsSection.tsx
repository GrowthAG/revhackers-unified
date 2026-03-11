import React from 'react';
import { TrendingUp, Zap, Eye, CheckCircle, BarChart, Globe, Info, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

interface DiagnosticSectionProps {
    plan: any;
}

export default function DiagnosticSection({ plan }: DiagnosticSectionProps) {
    const diagnostic = plan.diagnostic_data || {};
    const context = diagnostic.context_mirror || null;
    const signals = diagnostic.signals || [];
    const risks = diagnostic.risks || [];
    const decisions = diagnostic.decisions || [];

    // Prioritize strategic intelligence over technical site scores if both exist
    const scores = diagnostic.scores || (plan.market_intelligence ? null : {
        performance: 0,
        seo: 0,
        accessibility: 0,
        bestPractices: 0,
    });

    const stack = diagnostic.stack || [];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full text-foreground">
            {/* Cabeçalho */}
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Diagnóstico"
                    titleLine1="Sintomas e Cenário"
                    titleLine2="Visão do Campo"
                    description="O contexto de negócio que você vive hoje e os sinais mapeados em nossa imersão inicial."
                />
            </div>
            
            
            {/* Corpo do Relatório ocupando 100% da tela disponível (sem max-w restritivo central) */}
            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full flex flex-col justify-start gap-8">
                {/* Context Mirror Modules */}
                {context && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-zinc-200 overflow-hidden bg-white rounded-2xl shadow-sm">
                    {[
                        { label: 'Segmento', value: context.segment },
                        { label: 'Objetivo Principal', value: context.objective },
                        { label: 'Maturidade Digital', value: context.maturity },
                        { label: 'Restrições', value: context.restrictions },
                    ].map((item, i) => (
                        <div key={i} className={`p-6 ${i !== 3 ? 'border-b md:border-b-0 md:border-r border-zinc-200' : ''}`}>
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-2">{item.label}</span>
                            <p className="text-base font-bold text-zinc-900 leading-snug">{item.value || '—'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Signals Grid - Single Column Centered */}
            <div className="max-w-4xl w-full mx-auto">
                
                {/* Sinais Estratégicos - Master Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                        <TrendingUp size={20} className="text-[#00CC6A]" />
                        <h4 className="text-[13px] font-black text-zinc-900 uppercase tracking-[0.2em]">Sinais Estratégicos</h4>
                    </div>
                    
                    <div className="flex flex-col divide-y divide-zinc-100 flex-1">
                        {signals.map((signal: any, i: number) => {
                            const isPositive = signal.type === 'positive';
                            const isNegative = signal.type === 'negative';

                            return (
                                <div key={i} className="p-6 transition-colors hover:bg-zinc-50/50">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`mt-0.5 shrink-0 ${isPositive ? 'text-[#00CC6A]' : isNegative ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            {isPositive ? <CheckCircle size={20} /> : isNegative ? <AlertTriangle size={20} /> : <Info size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-zinc-900 leading-snug tracking-tight mb-4">
                                                "{signal.text}"
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-fit shrink-0">Impacto Real</span>
                                                <p className="text-sm font-medium text-zinc-500 leading-snug">{signal.impact}</p>
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
        </div>
    );
}
