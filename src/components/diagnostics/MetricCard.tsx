import React from 'react';
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    description?: string;
    subtext?: string;
    status?: 'neutral' | 'success' | 'warning' | 'critical';
    className?: string;
    variant?: 'light' | 'dark';
}

export const MetricCard = ({ label, value, description, subtext, status = 'neutral', className, variant = 'dark' }: MetricCardProps) => {

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'success': return variant === 'dark' ? 'bg-revgreen' : 'bg-black';
            case 'warning': return 'bg-yellow-400';
            case 'critical': return 'bg-red-500';
            default: return variant === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200';
        }
    };

    return (
        <div className={cn(
            "p-6 border transition-colors duration-300 h-full flex flex-col justify-between group",
            variant === 'dark'
                ? "border-zinc-900 bg-zinc-950/50 hover:border-zinc-700"
                : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
            className
        )}>
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] group-hover:text-zinc-500 transition-colors">
                    {label}
                </span>
                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(status))} />
            </div>

            <div className="mb-4">
                <span className={cn(
                    "text-lg md:text-xl font-bold tracking-tight block lowercase",
                    variant === 'dark' ? "text-white" : "text-black"
                )}>
                    {value}
                </span>
            </div>

            <div className="mt-auto">
                {description && (
                    <p className={cn(
                        "text-[9px] font-bold uppercase mb-1 tracking-widest",
                        variant === 'dark' ? "text-zinc-500" : "text-zinc-400"
                    )}>
                        {description}
                    </p>
                )}
                {subtext && (
                    <p className="text-[9px] text-zinc-500 leading-tight font-medium">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};
