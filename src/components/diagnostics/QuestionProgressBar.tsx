import React from 'react';
import { cn } from '@/lib/utils';

interface QuestionProgressBarProps {
    current: number;
    total: number;
    variant?: 'light' | 'dark';
}

export const QuestionProgressBar = ({ current, total, variant = 'dark' }: QuestionProgressBarProps) => {
    const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

    return (
        <div className="w-full">
            <div className={cn(
                "h-1.5 w-full rounded-full overflow-hidden",
                variant === 'dark' ? "bg-zinc-900" : "bg-zinc-100"
            )}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        variant === 'dark' ? "bg-revgreen" : "bg-revgreen"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-2xs font-mono font-bold text-zinc-600 uppercase tracking-widest">
                    {current + 1} / {total}
                </span>
            </div>
        </div>
    );
};
