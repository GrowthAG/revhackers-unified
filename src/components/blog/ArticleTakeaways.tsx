import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TakeawayItem {
    title: string;
    description: string;
}

interface ArticleTakeawaysProps {
    title: string;
    items: TakeawayItem[];
}

export const ArticleTakeaways: React.FC<ArticleTakeawaysProps> = ({ title, items }) => {
    return (
        <div className="my-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-revgreen" />
                </div>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">{title}</h3>
            </div>
            <div className="grid gap-4">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-white border border-gray-100 rounded">
                        <div className="w-1 h-full bg-revgreen shrink-0 rounded-full" />
                        <div>
                            <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
