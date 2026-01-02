import React from 'react';
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from 'lucide-react';

interface TechStackCardProps {
    category: string;
    items: string[];
    status?: 'detected' | 'missing' | 'warning';
}

export const TechStackCard = ({ category, items, status = 'detected' }: TechStackCardProps) => {
    return (
        <div className="p-6 border border-zinc-900 bg-zinc-950/50 h-full flex flex-col hover:border-zinc-700 transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-medium uppercase tracking-wide rounded-sm"
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
