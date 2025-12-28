import React from 'react';
import { Code } from 'lucide-react';

interface TechItem {
    role: string;
    tools: string;
}

interface ArticleTechStackProps {
    title?: string;
    items: TechItem[];
}

const ArticleTechStack = ({ title = "A Stack Técnica Mínima Viável", items }: ArticleTechStackProps) => {
    return (
        <section className="mb-16 border border-gray-200 p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center tracking-tight">
                <Code className="w-5 h-5 mr-3 text-black" />
                {title}
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(items.length, 4)} gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 border border-gray-100`}>
                {items.map((item, index) => (
                    <div key={index} className="p-4 text-center">
                        <span className="block font-bold text-gray-900 mb-1 text-sm">{item.role}</span>
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-sm mt-1 inline-block">{item.tools}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ArticleTechStack;
