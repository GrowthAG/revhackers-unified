import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

interface DiagnosticSectionProps {
    plan: any;
}

export default function DiagnosticSection({ plan }: DiagnosticSectionProps) {
    const diagnostic = plan.diagnostic_data || {};
    const risks = diagnostic.risks || [];
    const decisions = diagnostic.decisions || [];

    // Technical scores (only if available from site analysis)
    const scores = diagnostic.scores || (plan.market_intelligence ? null : null);
    const stack = diagnostic.stack || [];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full text-foreground">
            {/* Cabeçalho */}
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Diagnóstico"
                    titleLine1="Causa"
                    titleLine2="Raiz & Riscos"
                    description="As origens ocultas dos sintomas atuais e o impacto caso não sejam mitigados imediatamente."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full flex flex-col justify-start gap-10">

                {/* ── Causas Raiz - Individual Numbered Cards ── */}
                {risks.length > 0 && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-bold text-zinc-900 uppercase tracking-[0.2em]">Causas Raiz & Riscos</h4>
                            <span className="text-[11px] font-bold text-zinc-400 ml-auto">
                                {risks.length} {risks.length === 1 ? 'causa identificada' : 'causas identificadas'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {risks.map((risk: any, i: number) => {
                                const isHigh = risk.severity === 'high';
                                return (
                                    <div key={i} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                                        <div className="flex items-stretch">
                                            {/* Number block */}
                                            <div className="flex-none w-20 md:w-24 bg-zinc-950 flex items-center justify-center">
                                                <span className="text-2xl md:text-3xl font-bold text-white font-mono">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6">
                                                <div className="mb-4">
                                                    <EditableField
                                                        path={`diagnostic_data.risks.${i}.text`}
                                                        className="text-lg font-bold text-zinc-900 leading-snug tracking-tight"
                                                        placeholder={risk.text}
                                                        multiline
                                                    />
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-[3px] h-full min-h-[2rem] bg-zinc-200 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.25em] block mb-1 ${isHigh ? 'text-zinc-900' : 'text-zinc-500'}`}>
                                                            Estratégia de Mitigação
                                                        </span>
                                                        <EditableField
                                                            path={`diagnostic_data.risks.${i}.mitigation`}
                                                            className="text-[15px] font-medium text-zinc-500 leading-relaxed"
                                                            placeholder={risk.mitigation}
                                                            multiline
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Decisões Mandatórias - Dark Banner ── */}
                {decisions.length > 0 && (
                    <div className="bg-zinc-950 rounded-xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-zinc-800">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.25em]">
                                Decisões Mandatórias
                            </span>
                        </div>
                        <div className={`grid grid-cols-1 ${decisions.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                            {decisions.map((decision: any, i: number) => (
                                <div key={i} className={`p-8 flex flex-col justify-between ${i !== decisions.length - 1 ? 'border-b md:border-b-0 md:border-r border-zinc-800' : ''}`}>
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-3">
                                            {(decision.basedOn || []).join(' + ')}
                                        </span>
                                        <EditableField
                                            path={`diagnostic_data.decisions.${i}.title`}
                                            className="text-lg font-bold text-white mb-2.5 leading-tight block"
                                            placeholder={decision.title}
                                        />
                                        <EditableField
                                            path={`diagnostic_data.decisions.${i}.recommendation`}
                                            className="text-[15px] font-medium text-zinc-400 leading-relaxed"
                                            placeholder={decision.recommendation}
                                            multiline
                                        />
                                    </div>
                                    {decision.ruleApplied && (
                                        <div className="pt-5 mt-6 border-t border-zinc-800 flex items-center gap-2">
                                            <ArrowRight className="w-3.5 h-3.5 text-[#00CC6A]" />
                                            <span className="text-[10px] font-bold text-[#00CC6A] uppercase tracking-widest">
                                                {decision.ruleApplied}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Technical Hub (only if site analysis data exists) ── */}
                {scores && scores.performance > 0 && (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Auditoria Técnica</span>
                            <h3 className="text-lg font-bold text-zinc-900 mt-1">Infraestrutura & SEO</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4">
                            {Object.entries(scores).map(([key, value]: [string, any], i: number, arr) => {
                                const labelMap: Record<string, string> = {
                                    performance: 'Performance',
                                    seo: 'SEO',
                                    accessibility: 'Acessibilidade',
                                    bestPractices: 'Boas Práticas',
                                };
                                return (
                                    <div key={key} className={`p-6 ${i !== arr.length - 1 ? 'border-r border-zinc-100' : ''}`}>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">{labelMap[key] || key}</span>
                                        <span className={`text-3xl font-black block mb-2 ${value >= 90 ? 'text-[#00CC6A]' : 'text-zinc-900'}`}>{value}</span>
                                        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${value >= 90 ? 'bg-[#00CC6A]' : 'bg-zinc-900'}`} style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {stack.length > 0 && (
                            <div className="px-8 py-5 border-t border-zinc-100 flex flex-wrap gap-2">
                                {stack.map((tech: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600 rounded-lg uppercase tracking-widest">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
