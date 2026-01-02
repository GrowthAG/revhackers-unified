import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ScoreGaugeProps {
    score: number;
    label?: string;
    description?: string;
}

export const ScoreGauge = ({ score, label = "Diagnostic Score", description = "Pontuação Sintética" }: ScoreGaugeProps) => {
    const data = [
        { name: 'Score', value: score },
        { name: 'Gap', value: 100 - score }
    ];

    // Determine color based on strict ranges
    const getColor = (s: number) => {
        if (s >= 80) return '#03FC3B'; // RevGreen
        if (s >= 50) return '#FCD34D'; // Warning
        return '#333333'; // Critical/Low (Neutral)
    };

    return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center relative shadow-sm h-full">
            <div className="absolute top-6 left-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
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
                            <Cell key="gap" fill="#18181b" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-7xl font-bold text-white tracking-tighter leading-none">{score}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-2 tracking-widest uppercase">Pontos</div>
                </div>
            </div>
            <div className="mt-2 text-center">
                <div className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                    {label}
                </div>
                <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto leading-tight">
                    {description}
                </p>
            </div>
        </div>
    );
};
