import React from 'react';
import { Wrench } from 'lucide-react';

interface StackItem {
    role: string;
    tools: string;
}

interface ArticleStackProps {
    title: string;
    items: StackItem[];
}

export const ArticleStack: React.FC<ArticleStackProps> = ({ title, items }) => {
    return (
        <div className="my-12 p-6 bg-white border border-zinc-200 ">
            <div className="flex items-center gap-3 mb-6">
                <Wrench className="w-5 h-5 text-revgreen" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">{title}</h3>
            </div>
            <div className="grid gap-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded">
                        <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">{item.role}</span>
                        <span className="text-xs text-zinc-600 font-mono">{item.tools}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
