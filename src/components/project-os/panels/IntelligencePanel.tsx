import React, { useState } from 'react';
import { BrainCircuit, ChevronDown, ChevronUp, Gauge, Lightbulb, AlertCircle, Swords, Target, Cpu } from 'lucide-react';
import type { ReiProject } from '@/api/reiProjects';

export interface IntelligencePanelProps {
    project: ReiProject;
}

export function IntelligencePanel({ project }: IntelligencePanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    const opportunityData = project.opportunity_data as {
        score_fechamento?: number;
        sinais_compra?: string[];
        objecoes_detectadas?: string[];
        sentimento?: string;
    } | null;

    const marketData = project.market_data as {
        strategic_intelligence?: {
            competitors?: string[];
            challenges?: string[];
            tech_stack?: string[];
        };
    } | null;

    const strategicIntel = marketData?.strategic_intelligence;
    const hasOpportunity = opportunityData && (opportunityData.score_fechamento || opportunityData.sinais_compra?.length);
    const hasIntel = strategicIntel && (strategicIntel.competitors?.length || strategicIntel.challenges?.length || strategicIntel.tech_stack?.length);

    if (!hasOpportunity && !hasIntel) return null;

    return (
        <div className="border border-zinc-200 bg-white overflow-hidden">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-zinc-900" />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                        Intelligence
                    </span>
                </div>
                {collapsed ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
            </button>

            {!collapsed && (
                <div className="px-5 pb-5 space-y-5 border-t border-zinc-100">
                    {/* Score de Fechamento */}
                    {hasOpportunity && (
                        <div className="pt-4 space-y-3">
                            {opportunityData.score_fechamento != null && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gauge className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Score de Fechamento
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                                            {opportunityData.score_fechamento}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 mb-1">/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-100 mt-2 overflow-hidden">
                                        <div
                                            className="h-full"
                                            style={{
                                                width: `${Math.min(100, opportunityData.score_fechamento)}%`,
                                                backgroundColor: opportunityData.score_fechamento >= 70 ? '#00CC6A' : opportunityData.score_fechamento >= 40 ? '#a1a1aa' : '#d4d4d8',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Sinais de Compra */}
                            {opportunityData.sinais_compra && opportunityData.sinais_compra.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Sinais de Compra
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.sinais_compra.map((sinal, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-[#00CC6A] shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{sinal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Objecoes */}
                            {opportunityData.objecoes_detectadas && opportunityData.objecoes_detectadas.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Objecoes Detectadas
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {opportunityData.objecoes_detectadas.map((obj, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-zinc-400 shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{obj}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Strategic Intelligence */}
                    {hasIntel && (
                        <div className="pt-4 space-y-3 border-t border-zinc-100">
                            {strategicIntel.competitors && strategicIntel.competitors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Swords className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Concorrentes
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.competitors.map((c, i) => (
                                            <span key={`comp-${i}`} className="text-xxs font-bold text-zinc-600 bg-zinc-100 px-2 py-1">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {strategicIntel.challenges && strategicIntel.challenges.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Desafios
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {strategicIntel.challenges.map((ch, i) => (
                                            <div key={`chal-${i}`} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-zinc-400 shrink-0 mt-1.5" />
                                                <span className="text-xs text-zinc-600 font-medium leading-relaxed">{ch}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {strategicIntel.tech_stack && strategicIntel.tech_stack.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cpu className="w-4 h-4 text-zinc-500" />
                                        <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                            Tech Stack
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strategicIntel.tech_stack.map((t, i) => (
                                            <span key={`tech-${i}`} className="text-xxs font-bold text-zinc-600 bg-zinc-100 px-2 py-1">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
