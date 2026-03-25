import React from 'react';
import { Layers } from 'lucide-react';

interface BlueprintItem {
    number: string;
    title: string;
    description: string;
    isHighlight?: boolean;
}

interface ArticleBlueprintProps {
    title: string;
    items: BlueprintItem[];
}

export const ArticleBlueprint: React.FC<ArticleBlueprintProps> = ({ title, items }) => {
    return (
        <div className="my-12">
            <div className="flex items-center gap-3 mb-6">
                <Layers className="w-5 h-5 text-revgreen" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">{title}</h3>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 p-5 border rounded-lg transition-all ${item.isHighlight
                                ? 'bg-black border-black text-white'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${item.isHighlight ? 'bg-revgreen text-black' : 'bg-zinc-100 text-black'
                                }`}
                        >
                            {item.number}
                        </div>
                        <div className="flex-1">
                            <h4
                                className={`text-sm font-bold mb-1 ${item.isHighlight ? 'text-white' : 'text-black'
                                    }`}
                            >
                                {item.title}
                            </h4>
                            <p
                                className={`text-sm leading-relaxed ${item.isHighlight ? 'text-zinc-300' : 'text-zinc-600'
                                    }`}
                            >
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
