import React from 'react';
import { cn } from '@/lib/utils';

interface BlueprintItem {
    label: string;
    content: string | React.ReactNode;
    isHighlight?: boolean;
    isAction?: boolean;
}

interface ArticleBlueprintProps {
    title: string;
    description?: string;
    number?: string;
    items: BlueprintItem[];
    result?: string;
}

const ArticleBlueprint = ({ title, description, number = "01", items, result }: ArticleBlueprintProps) => {
    return (
        <section className="mb-16 mt-12">
            <div className="border-t border-zinc-100 pt-6 mb-8">
                <span className="text-xs font-bold text-revgreen uppercase tracking-widest block mb-3">
                    Blueprint {number}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-zinc-500 mt-4 text-lg font-light leading-relaxed max-w-3xl">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-0">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            "group flex flex-col md:grid md:grid-cols-[180px_1fr] py-6 border-b border-zinc-200 transition-colors hover:bg-zinc-50",
                            item.isHighlight && "bg-zinc-50"
                        )}
                    >
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider mb-2 md:mb-0 pt-1",
                            item.isAction ? "text-revgreen" : "text-black/60 group-hover:text-black transition-colors"
                        )}>
                            {item.label}
                        </span>
                        <span className="text-zinc-700 leading-relaxed text-base">
                            {item.content}
                        </span>
                    </div>
                ))}
            </div>

            {result && (
                <div className="mt-8 flex items-start gap-4 p-6 bg-black text-white rounded-sm shadow-sm">
                    <div className="w-16 text-revgreen font-bold text-xs uppercase tracking-widest pt-1 shrink-0">
                        Result
                    </div>
                    <p className="text-lg font-medium leading-tight text-white/90">
                        {result}
                    </p>
                </div>
            )}
        </section>
    );
};

export default ArticleBlueprint;
