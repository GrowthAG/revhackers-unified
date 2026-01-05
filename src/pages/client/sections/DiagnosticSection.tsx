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
    const gaps = diagnostic.gaps || [];

    function getScoreColor(score: number) {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    }

    function getScoreBarColor(score: number) {
        if (score >= 90) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    const marketIntel = plan.market_intelligence || null;

    return (
        <div className="space-y-12">
            {/* Context Mirror - Feedback on REI Responses */}
            {context && (
                <div className="animate-in fade-in slide-in-from-top-5 duration-700">
                    <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 mb-6">
                        <Target className="w-6 h-6 text-black" />
                        <h3 className="text-xl font-semibold text-black">Reflexo do Contexto (REI Input)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Segmento', value: context.segment },
                            { label: 'Objetivo Principal', value: context.objective },
                            { label: 'Maturidade Digital', value: context.maturity },
                            { label: 'Restrições / Budget', value: context.restrictions },
                        ].map((item, i) => (
                            <div key={i} className="bg-zinc-50 border border-zinc-100 p-4 rounded-lg">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">{item.label}</span>
                                <p className="text-sm font-bold text-black">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strategic Signals & Risks */}
            {(signals.length > 0 || risks.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {signals.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" /> Sinais Estratégicos Detectados
                            </h4>
                            <div className="space-y-3">
                                {signals.map((signal: any, i: number) => (
                                    <div key={i} className={`p-4 rounded-lg border flex items-start gap-3 ${signal.type === 'positive' ? 'bg-green-50 border-green-100' :
                                            signal.type === 'negative' ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${signal.type === 'positive' ? 'bg-green-500' :
                                                signal.type === 'negative' ? 'bg-red-500' : 'bg-zinc-400'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-bold text-black leading-tight">{signal.text}</p>
                                            <p className="text-xs text-zinc-500 mt-1">{signal.impact}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {risks.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" /> Matriz de Riscos REI
                            </h4>
                            <div className="space-y-3">
                                {risks.map((risk: any, i: number) => (
                                    <div key={i} className="p-4 bg-white border border-red-100 rounded-lg shadow-sm">
                                        <p className="text-sm font-bold text-red-900 mb-1">{risk.text}</p>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400">
                                            <span>Mitigação sugerida:</span>
                                            <span className="text-zinc-600">{risk.mitigation}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Strategic Decisions */}
            {decisions.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 mb-6">
                        <Zap className="w-6 h-6 text-black" />
                        <h3 className="text-xl font-semibold text-black">Decisões Mandatórias do Plano</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decisions.map((decision: any, i: number) => (
                            <div key={i} className="bg-black text-white p-6 rounded-xl hover:translate-y-[-4px] transition-transform duration-300">
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Pilar: {decision.basedOn?.join(' + ')}</div>
                                <h4 className="text-lg font-bold mb-3">{decision.title}</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{decision.recommendation}</p>
                                <div className="pt-4 border-t border-white/10">
                                    <span className="text-[10px] font-bold text-revgreen uppercase tracking-widest">Lógica RH: {decision.ruleApplied}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Original Technical Diagnostics (Site Audit) */}
            {scores && scores.performance > 0 && (
                <div className="bg-white p-8 rounded-2xl border border-zinc-200">
                    <div className="border-b border-zinc-100 pb-6 mb-8">
                        <h2 className="text-2xl font-semibold text-black mb-2">
                            🔍 Auditoria Técnica Adicional (Site)
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            Análise de infraestrutura realizada via PageSpeed Insights.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {Object.entries(scores).map(([key, value]: [string, any]) => (
                            <div key={key} className="bg-zinc-50 border border-zinc-100 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
                                        {key === 'performance' && <TrendingUp className="w-5 h-5 text-zinc-700" />}
                                        {key === 'seo' && <Eye className="w-5 h-5 text-zinc-700" />}
                                        {key === 'accessibility' && <CheckCircle className="w-5 h-5 text-zinc-700" />}
                                        {key === 'bestPractices' && <Zap className="w-5 h-5 text-zinc-700" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{key}</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
                                            {value}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getScoreBarColor(value)}`}
                                        style={{ width: `${value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stack.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Stack Tecnológica Detectada</h3>
                            <div className="flex flex-wrap gap-2">
                                {stack.map((tech: string, index: number) => (
                                    <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-md border border-zinc-200 uppercase">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Market Intelligence */}
            {marketIntel && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
                    <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 mb-8">
                        <Globe className="w-6 h-6 text-black" />
                        <h3 className="text-xl font-semibold text-black">Inteligência Estratégica de Mercado (Perplexity AI)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white border border-zinc-100 p-6 rounded-xl shadow-sm">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart className="w-4 h-4" /> Market Sizing
                            </h4>
                            <div className="space-y-4">
                                {['tam', 'sam', 'som'].map((metric) => (
                                    <div key={metric}>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter block">{metric.toUpperCase()}</span>
                                        <p className="text-sm font-bold text-black">{marketIntel.market_sizing?.[metric] || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-100 p-6 rounded-xl shadow-sm">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Tendências de Mercado
                            </h4>
                            <ul className="space-y-3">
                                {marketIntel.industry_trends?.map((trend: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                                        {trend}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-black text-white p-6 rounded-xl shadow-xl flex flex-col justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-revgreen" /> Conselho Tático RH
                                </h4>
                                <p className="text-sm font-medium leading-relaxed italic text-zinc-200">
                                    "{marketIntel.strategic_advice}"
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                                AI Analysis Protocol // V2.0
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-zinc-200 rounded-xl">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Benchmarks Competitivos Identificados
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {marketIntel.competitor_benchmarks?.map((bench: string, i: number) => (
                                <div key={i} className="px-4 py-2 bg-zinc-50 border border-zinc-100 text-[10px] font-black text-zinc-800 rounded-lg uppercase tracking-tight">
                                    {bench}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!context && !scores && !marketIntel && (
                <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-zinc-500 font-medium">Nenhum diagnóstico estratégico disponível para este planejamento.</p>
                </div>
            )}
        </div>
    );
}
