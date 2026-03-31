import React from 'react';
import { ListChecks } from 'lucide-react';

interface StepItem {
    number: string;
    title: string;
    description: string;
    isHighlight?: boolean;
}

interface ArticleStepsProps {
    title: string;
    steps: StepItem[];
}

export const ArticleSteps: React.FC<ArticleStepsProps> = ({ title, steps }) => {
    return (
        <div className="my-12">
            <div className="flex items-center gap-3 mb-6">
                <ListChecks className="w-5 h-5 text-revgreen" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">{title}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`p-5 border ${step.isHighlight
                                ? 'bg-revgreen border-revgreen'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            } transition-all`}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${step.isHighlight ? 'bg-black text-revgreen' : 'bg-zinc-100 text-black'
                                    }`}
                            >
                                {step.number}
                            </div>
                            <div className="flex-1">
                                <h4
                                    className={`text-sm font-bold mb-2 ${step.isHighlight ? 'text-black' : 'text-black'
                                        }`}
                                >
                                    {step.title}
                                </h4>
                                <p
                                    className={`text-xs leading-relaxed ${step.isHighlight ? 'text-zinc-900' : 'text-zinc-600'
                                        }`}
                                >
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
