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
                    titleLine1="Causa"
                    titleLine2="Raiz & Riscos"
                    description="As origens ocultas dos sintomas atuais e o impacto caso não sejam mitigados imediatamente."
                />
            </div>
            
            
            {/* Corpo do Relatório ocupando 100% da tela disponível (sem max-w restritivo central) */}
            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full flex flex-col justify-start gap-8">
            {/* Risks Intensity Grid */}
            <div className="max-w-5xl w-full mx-auto">

                {/* Causas Raiz & Riscos - Master Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                        <AlertTriangle size={20} className="text-zinc-500" />
                        <h4 className="text-[13px] font-black text-zinc-900 uppercase tracking-[0.2em]">Causas Raiz & Riscos</h4>
                    </div>

                    <div className="flex flex-col divide-y divide-zinc-100 flex-1">
                        {risks.map((risk: any, i: number) => {
                            const isHigh = risk.severity === 'high';
                            
                            return (
                                <div key={i} className="p-6 transition-colors hover:bg-zinc-50/50">
                                    <div className="mb-5 relative flex items-start gap-4">
                                        <div className="mt-1 shrink-0">
                                            <span className="text-4xl text-zinc-300 font-serif leading-none">"</span>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-zinc-900 leading-snug tracking-tight">{risk.text}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mt-4 pl-6 md:pl-10 border-l-2 border-[#00CC6A]/30 sm:ml-10">
                                        <span className={`text-[10px] w-fit font-black uppercase tracking-widest block mb-1 ${isHigh ? 'text-[#00CC6A]' : 'text-zinc-500'}`}>
                                            Estratégia de Mitigação
                                        </span>
                                        <p className="text-[15px] font-medium text-zinc-600 leading-relaxed">
                                            {risk.mitigation}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Decisions Banner */}
            {decisions.length > 0 && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 text-zinc-400 text-sm font-black uppercase tracking-[0.2em] mb-2">
                        <span className="w-10 h-[2px] bg-black" />
                        DECISÕES MANDATÓRIAS
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-zinc-200 bg-white overflow-hidden rounded-2xl shadow-sm">
                        {decisions.map((decision: any, i: number) => (
                            <div key={i} className={`p-8 flex flex-col justify-start hover:bg-zinc-50/50 transition-colors ${i !== decisions.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-zinc-200' : ''}`}>
                                <div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4">
                                        {decision.basedOn?.join(' + ')}
                                    </span>
                                    <h4 className="text-lg font-bold text-zinc-900 mb-2.5 leading-tight">{decision.title}</h4>
                                    <p className="text-[15px] font-medium text-zinc-500 leading-relaxed mb-6">{decision.recommendation}</p>
                                </div>
                                {decision.ruleApplied && (
                                    <div className="pt-4 border-t border-zinc-100 mt-auto">
                                        <span className="text-[10px] font-bold text-[#00CC6A] uppercase tracking-widest block w-fit">
                                            {decision.ruleApplied}
                                        </span>
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
        </div>
    );
}
