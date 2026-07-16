import React from 'react';
import { cn } from '@/lib/utils';

interface StepItem {
    number: string;
    title: string;
    description: string;
    isHighlight?: boolean;
}

interface ArticleStepsGridProps {
    title: string;
    steps: StepItem[];
}

const ArticleStepsGrid = ({ title, steps }: ArticleStepsGridProps) => {
    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">{title}</h2>
            <div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-0 border border-black rounded-sm overflow-hidden`}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={cn(
                            "p-8 border-b md:border-b-0 md:border-r border-gray-200 last:border-0",
                            step.isHighlight ? "bg-black text-white" : "bg-white text-gray-900"
                        )}
                    >
                        <span className={cn(
                            "text-4xl font-black block mb-4",
                            step.isHighlight ? "text-gray-700" : "text-gray-200"
                        )}>
                            {step.number}
                        </span>
                        <h4 className={cn(
                            "font-bold text-lg mb-2",
                            step.isHighlight ? "text-white" : "text-black"
                        )}>
                            {step.title}
                        </h4>
                        <p className={cn(
                            "text-sm leading-relaxed",
                            step.isHighlight ? "text-gray-400" : "text-gray-500"
                        )}>
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ArticleStepsGrid;
