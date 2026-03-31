import React from 'react';
import { cn } from '@/lib/utils';

interface BenchmarkBarProps {
    userScore: number;
    type: 'growth' | 'revenue' | 'site' | 'founder';
    variant?: 'light' | 'dark';
}

const BENCHMARKS: Record<string, { avg: number; top10: number }> = {
    growth: { avg: 52, top10: 88 },
    revenue: { avg: 48, top10: 85 },
    site: { avg: 55, top10: 90 },
    founder: { avg: 45, top10: 82 },
};

export const BenchmarkBar = ({ userScore, type, variant = 'dark' }: BenchmarkBarProps) => {
    const benchmark = BENCHMARKS[type] || BENCHMARKS.growth;
    const diffAvg = userScore - benchmark.avg;
    const diffTop = userScore - benchmark.top10;

    const bars = [
        { label: 'Seu Score', value: userScore, accent: true },
        { label: 'Média do Mercado', value: benchmark.avg, accent: false },
        { label: 'Top 10% Empresas', value: benchmark.top10, accent: false },
    ];

    const comparisonText = diffAvg >= 0
        ? `Você está ${Math.abs(diffAvg)}% acima da média do mercado${diffTop < 0 ? `, mas ${Math.abs(diffTop)}% abaixo dos líderes do seu segmento` : ' e no nível dos líderes'}.`
        : `Você está ${Math.abs(diffAvg)}% abaixo da média do mercado. Há espaço significativo para evolução.`;

    return (
        <div className={cn(
            "p-6 border",
            variant === 'dark'
                ? "bg-zinc-950 border-zinc-900"
                : "bg-white border-zinc-200"
        )}>
            <div className="flex items-center gap-2 mb-6">
                <div className={cn("w-1 h-1 rounded-full", variant === 'dark' ? "bg-revgreen" : "bg-zinc-900")} />
                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                    Benchmark de Maturidade
                </span>
            </div>

            <div className="space-y-4">
                {bars.map((bar) => (
                    <div key={bar.label}>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className={cn(
                                "text-xs font-bold",
                                bar.accent
                                    ? (variant === 'dark' ? "text-white" : "text-black")
                                    : "text-zinc-500"
                            )}>
                                {bar.label}
                            </span>
                            <span className={cn(
                                "text-xs font-mono font-bold",
                                bar.accent
                                    ? (variant === 'dark' ? "text-white" : "text-black")
                                    : "text-zinc-500"
                            )}>
                                {bar.value}/100
                            </span>
                        </div>
                        <div className={cn(
                            "h-2 overflow-hidden",
                            variant === 'dark' ? "bg-zinc-900" : "bg-zinc-100"
                        )}>
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 ease-out",
                                    bar.accent
                                        ? "bg-revgreen"
                                        : (variant === 'dark' ? "bg-zinc-700" : "bg-zinc-300")
                                )}
                                style={{ width: `${bar.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <p className={cn(
                "mt-5 text-sm leading-relaxed",
                variant === 'dark' ? "text-zinc-400" : "text-zinc-500"
            )}>
                {comparisonText}
            </p>
        </div>
    );
};
