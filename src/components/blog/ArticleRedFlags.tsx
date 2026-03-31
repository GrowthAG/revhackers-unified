import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ArticleRedFlagsProps {
    title: string;
    flags: string[];
}

export const ArticleRedFlags: React.FC<ArticleRedFlagsProps> = ({ title, flags }) => {
    return (
        <div className="my-12 p-6 bg-red-50 border border-red-200 ">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">{title}</h3>
            </div>
            <ul className="space-y-3">
                {flags.map((flag, index) => (
                    <li key={index} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 shrink-0" />
                        <span className="text-sm text-red-900 leading-relaxed">{flag}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
