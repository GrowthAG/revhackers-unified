import React from 'react';
import { Info } from 'lucide-react';

interface ArticleInfoBoxProps {
    children: React.ReactNode;
}

export const ArticleInfoBox: React.FC<ArticleInfoBoxProps> = ({ children }) => {
    return (
        <div className="my-8 flex gap-4 p-5 bg-zinc-50 border border-zinc-200 ">
            <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-sm text-zinc-900 leading-relaxed">
                {children}
            </div>
        </div>
    );
};
