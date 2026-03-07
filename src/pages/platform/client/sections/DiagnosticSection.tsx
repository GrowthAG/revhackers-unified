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
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    DIAGNÓSTICO
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    Análise <span className="text-zinc-300">Estratégica</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Contexto, sinais de oportunidade, riscos mapeados e decisões fundamentadas no diagnóstico.
                </p>
            </div>

            {/* Context Mirror Modules */}
            {context && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Segmento', value: context.segment },
                        { label: 'Objetivo Principal', value: context.objective },
                        { label: 'Maturidade Digital', value: context.maturity },
                        { label: 'Restrições', value: context.restrictions },
                    ].map((item, i) => (
                        <div key={i} className="bg-zinc-950 border border-zinc-200 p-6 rounded-xl hover:border-zinc-400 transition-all group">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-2">{item.label}</span>
                            <p className="text-base font-bold text-white">{item.value || '—'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Signals & Risks Intensity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sinais Estratégicos */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> Sinais Estratégicos
                    </h4>
                    <div className="space-y-3">
                        {signals.map((signal: any, i: number) => (
                            <div key={i} className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-sm transition-all">
                                <p className="text-sm font-bold text-zinc-900 mb-1">{signal.text}</p>
                                <p className="text-xs text-zinc-400">{signal.impact}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Análise de Riscos */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={14} /> Análise de Riscos
                    </h4>
                    <div className="space-y-3">
                        {risks.map((risk: any, i: number) => (
                            <div key={i} className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-sm transition-all">
                                <p className="text-sm font-bold text-zinc-900 mb-2">{risk.text}</p>
                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Mitigação:</span>
                                    <span className="text-xs text-zinc-500">{risk.mitigation}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decisions Banner */}
            {decisions.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900">Decisões Mandatórias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {decisions.map((decision: any, i: number) => (
                            <div key={i} className="bg-white border border-zinc-200 p-6 rounded-xl hover:shadow-md transition-all">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">{decision.basedOn?.join(' + ')}</span>
                                <h4 className="text-base font-bold text-zinc-900 mb-2">{decision.title}</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">{decision.recommendation}</p>
                                {decision.ruleApplied && (
                                    <div className="mt-4 pt-3 border-t border-zinc-100">
                                        <span className="text-[9px] font-bold text-[#00CC6A] uppercase tracking-widest">{decision.ruleApplied}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Hub */}
            {scores && scores.performance > 0 && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8">
                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-1">Auditoria Técnica</span>
                            <h3 className="text-xl font-bold text-zinc-900">Infraestrutura & SEO</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(scores).map(([key, value]: [string, any]) => {
                                const labelMap: Record<string, string> = {
                                    performance: 'Performance',
                                    seo: 'SEO',
                                    accessibility: 'Acessibilidade',
                                    bestPractices: 'Boas Práticas',
                                };
                                return (
                                    <div key={key} className="bg-white border border-zinc-100 rounded-xl p-4">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">{labelMap[key] || key}</span>
                                        <span className={`text-3xl font-black ${value >= 90 ? 'text-[#00CC6A]' : 'text-zinc-900'}`}>{value}</span>
                                        <div className="h-1 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-zinc-900" style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {stack.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {stack.map((tech: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-white border border-zinc-100 text-[10px] font-bold text-zinc-600 rounded-lg uppercase tracking-widest">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
