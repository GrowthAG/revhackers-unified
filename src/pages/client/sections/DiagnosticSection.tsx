import React from 'react';
import { TrendingUp, Zap, Eye, CheckCircle, BarChart, Globe, Info, AlertTriangle, Lightbulb, Target } from 'lucide-react';

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
        <div className="py-20 space-y-32">
            {/* Section Header */}
            <div className="text-center space-y-6">
                <h2 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-[-0.05em] select-none">
                    Diagnóstico
                </h2>
                <div className="w-40 h-[1px] bg-revgreen mx-auto shadow-[0_0_20px_rgba(3,252,59,0.5)]"></div>
                <p className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.4em]">
                    Análise Inicial
                </p>
            </div>

            {/* Context Mirror Modules */}
            {context && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Segmento', value: context.segment },
                        { label: 'Objetivo', value: context.objective },
                        { label: 'Maturidade', value: context.maturity },
                        { label: 'Restrições', value: context.restrictions },
                    ].map((item, i) => (
                        <div key={i} className="bg-black border border-zinc-900 p-8 rounded-xl hover:border-revgreen/50 transition-all group relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-revgreen/30 group-hover:bg-revgreen transition-colors"></div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-4 group-hover:text-revgreen transition-colors">{item.label}</span>
                            <p className="text-xl font-black text-white uppercase tracking-tight">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Signals & Risks Intensity Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Strategic Signals */}
                <div className="space-y-8">
                    <h4 className="text-xs font-black text-revgreen uppercase tracking-[0.4em] flex items-center gap-3">
                        <TrendingUp size={16} /> Sinais Estratégicos
                    </h4>
                    <div className="space-y-4">
                        {signals.map((signal: any, i: number) => (
                            <div key={i} className="p-8 bg-black border border-zinc-900 rounded-xl relative overflow-hidden group hover:border-revgreen/30 transition-all">
                                <div className="absolute left-0 top-0 w-1 h-full bg-revgreen animate-pulse"></div>
                                <p className="text-base md:text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">{signal.text}</p>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{signal.impact}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Matrix */}
                <div className="space-y-8">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
                        <AlertTriangle size={16} /> Matriz de Riscos
                    </h4>
                    <div className="space-y-4">
                        {risks.map((risk: any, i: number) => (
                            <div key={i} className="p-8 bg-black border border-zinc-900 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                                <div className="absolute left-0 top-0 w-1 h-full bg-zinc-800 group-hover:bg-zinc-600"></div>
                                <p className="text-base font-black text-white uppercase tracking-tight mb-3 italic">{risk.text}</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-zinc-900">
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mitigação:</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">"{risk.mitigation}"</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decisions Banner */}
            {decisions.length > 0 && (
                <div className="max-w-7xl mx-auto space-y-12 pt-16">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
                        <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter shadow-sm">Decisões Mandatórias</h3>
                        <Zap className="text-revgreen animate-pulse" size={32} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {decisions.map((decision: any, i: number) => (
                            <div key={i} className="bg-black border border-zinc-800 p-10 rounded-xl group hover:border-white transition-all duration-500 relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4 group-hover:text-revgreen transition-colors">{decision.basedOn?.join(' + ')}</span>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-4">{decision.title}</h4>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">{decision.recommendation}</p>
                                <div className="mt-8 pt-6 border-t border-zinc-900">
                                    <span className="text-[9px] font-black text-revgreen uppercase tracking-widest border border-revgreen/20 px-3 py-1 rounded-full">{decision.ruleApplied}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Hub */}
            {scores && scores.performance > 0 && (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <BarChart size={400} className="text-white" />
                        </div>

                        <div className="relative z-10 space-y-16">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div>
                                    <span className="text-[10px] font-black text-revgreen uppercase tracking-[0.4em] block mb-2">Auditoria Técnica</span>
                                    <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Infraestrutura & Laboratório SEO</h3>
                                </div>
                                <p className="text-zinc-500 font-medium max-w-sm uppercase tracking-widest text-right hidden md:block">
                                    Análise em tempo real com motor Lighthouse V10.3.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {Object.entries(scores).map(([key, value]: [string, any]) => (
                                    <div key={key} className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{key}</span>
                                            <span className={`text-4xl font-black ${value >= 90 ? 'text-revgreen shadow-[0_0_20px_rgba(3,252,59,0.3)]' : 'text-white'}`}>{value}</span>
                                        </div>
                                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-revgreen" style={{ width: `${value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 flex flex-wrap gap-4">
                                {stack.map((tech: string, i: number) => (
                                    <span key={i} className="px-6 py-2 bg-black border border-zinc-900 text-[10px] font-black text-white rounded-full uppercase tracking-widest hover:border-revgreen transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
