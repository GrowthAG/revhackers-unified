import React from 'react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    description?: string;
    subtext?: string;
    status?: 'neutral' | 'success' | 'warning' | 'critical';
    className?: string;
}

export const MetricCard = ({ label, value, description, subtext, status = 'neutral', className }: MetricCardProps) => {

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'success': return 'bg-revgreen';
            case 'warning': return 'bg-yellow-400';
            case 'critical': return 'bg-red-500';
            default: return 'bg-zinc-200';
        }
    };

    return (
        <div className={cn("p-6 border border-zinc-900 bg-zinc-950/50 h-full flex flex-col justify-between group hover:border-zinc-700 transition-colors duration-300", className)}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
                    {label}
                </span>
                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(status))} />
            </div>

            <div className="mb-4">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter block">
                    {value}
                </span>
            </div>

            <div>
                {description && (
                    <p className="text-[10px] font-bold text-white uppercase mb-1 leading-none">
                        {description}
                    </p>
                )}
                {subtext && (
                    <p className="text-[9px] text-zinc-600 leading-tight">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};
