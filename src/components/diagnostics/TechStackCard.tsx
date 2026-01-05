import React from 'react';
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from 'lucide-react';

interface TechStackCardProps {
    category: string;
    items: string[];
    status?: 'detected' | 'missing' | 'warning';
    variant?: 'light' | 'dark';
}

export const TechStackCard = ({ category, items, status = 'detected', variant = 'dark' }: TechStackCardProps) => {
    return (
        <div className={cn(
            "p-6 border transition-all duration-300 h-full flex flex-col",
            variant === 'dark'
                ? "bg-zinc-950 border-zinc-900 hover:border-zinc-700"
                : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
        )}>
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    {category}
                </span>
                {status === 'missing' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {status === 'detected' && items.length > 0 && <Check className="w-4 h-4 text-revgreen" />}
            </div>

            <div className="flex-1">
                {items.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {items.map((item, idx) => (
                            <span
                                key={idx}
                                className={cn(
                                    "px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors",
                                    variant === 'dark'
                                        ? "bg-zinc-900 border-zinc-800 text-white"
                                        : "bg-white border-zinc-200 text-zinc-900"
                                )}
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-zinc-600 text-xs italic flex items-center gap-2">
                        {status === 'missing' ? 'Stack não identificado' : 'Nenhuma ferramenta detectada'}
                    </div>
                )}
            </div>
        </div>
    );
};
