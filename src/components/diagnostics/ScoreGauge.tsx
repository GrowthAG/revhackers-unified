import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
    score: number;
    label?: string;
    description?: string;
    variant?: 'light' | 'dark';
}

export const ScoreGauge = ({ score, label = "Diagnostic Score", description = "Pontuação Sintética", variant = 'dark' }: ScoreGaugeProps) => {
    const data = [
        { name: 'Score', value: score },
        { name: 'Gap', value: 100 - score }
    ];

    // Determine color based on strict ranges
    const getColor = (s: number) => {
        // User requested "RevHackers Green" always, no yellow/warning states for the main gauge.
        if (variant === 'dark') return '#03FC3B';
        return '#000000'; // Black on Light
    };

    return (
        <div className={cn(
            "border rounded-lg p-8 flex flex-col items-center justify-center relative shadow-sm h-full transition-colors duration-300",
            variant === 'dark' ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"
        )}>
            <div className="absolute top-6 left-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Index
            </div>

            <div className="relative w-64 h-64 my-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="88%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="score" fill={getColor(score)} />
                            <Cell key="gap" fill={variant === 'dark' ? "#18181b" : "#f4f4f5"} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className={cn(
                        "text-7xl font-semibold tracking-tighter leading-none",
                        variant === 'dark' ? "text-white" : "text-black"
                    )}>{score}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-2 tracking-widest uppercase">Pontos</div>
                </div>
            </div>
            <div className="mt-4 text-center">
                <div className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    variant === 'dark' ? "text-white" : "text-black"
                )}>
                    {label}
                </div>
                <p className="text-[10px] text-zinc-500 max-w-[200px] mx-auto leading-tight font-medium uppercase tracking-wide">
                    {description}
                </p>
            </div>
        </div>
    );
};
