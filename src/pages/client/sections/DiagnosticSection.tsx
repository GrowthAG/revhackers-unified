import React from 'react';
import { TrendingUp, Zap, Eye, CheckCircle } from 'lucide-react';

interface DiagnosticSectionProps {
    plan: any;
}

export default function DiagnosticSection({ plan }: DiagnosticSectionProps) {
    const diagnostic = plan.diagnostic_data || {};
    const scores = diagnostic.scores || {
        performance: 0,
        seo: 0,
        accessibility: 0,
        bestPractices: 0,
    };

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

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    📊 Diagnóstico Atual
                </h2>
                <p className="text-zinc-600">
                    Análise técnica do seu site realizada em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                </p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-zinc-700" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Performance</p>
                            <p className={`text-2xl font-semibold ${getScoreColor(scores.performance)}`}>
                                {scores.performance}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getScoreBarColor(scores.performance)}`}
                            style={{ width: `${scores.performance}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-zinc-700" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">SEO</p>
                            <p className={`text-2xl font-semibold ${getScoreColor(scores.seo)}`}>
                                {scores.seo}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getScoreBarColor(scores.seo)}`}
                            style={{ width: `${scores.seo}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-zinc-700" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Acessibilidade</p>
                            <p className={`text-2xl font-semibold ${getScoreColor(scores.accessibility)}`}>
                                {scores.accessibility}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getScoreBarColor(scores.accessibility)}`}
                            style={{ width: `${scores.accessibility}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-zinc-700" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Best Practices</p>
                            <p className={`text-2xl font-semibold ${getScoreColor(scores.bestPractices)}`}>
                                {scores.bestPractices}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getScoreBarColor(scores.bestPractices)}`}
                            style={{ width: `${scores.bestPractices}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Stack Detected */}
            {stack.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-semibold text-black mb-4">Stack Tecnológico Detectado</h3>
                    <div className="flex flex-wrap gap-2">
                        {stack.map((tech: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-sm rounded-lg"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Gaps Identified */}
            {gaps.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Gaps Identificados</h3>
                    <div className="space-y-3">
                        {gaps.map((gap: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">!</span>
                                </div>
                                <p className="text-sm text-red-900">{gap}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!diagnostic.scores && (
                <div className="text-center py-12">
                    <p className="text-zinc-500">Nenhum diagnóstico disponível ainda.</p>
                </div>
            )}
        </div>
    );
}
