import React from 'react';
import { Button } from '@/components/ui/button';

interface ArticleCTAProps {
    title?: string;
    description?: string;
    primaryBtnText?: string;
    secondaryBtnText?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
}

const ArticleCTA = ({
    title = "Ready to run?",
    description = "Transforme sua operação comercial com a nossa infraestrutura de Growth.",
    primaryBtnText = "Agendar Diagnóstico",
    secondaryBtnText,
    onPrimaryClick,
    onSecondaryClick
}: ArticleCTAProps) => {
    return (
        <div className="bg-white border-y-2 border-black/5 p-8 md:p-12 text-left relative overflow-hidden group my-16">
            {/* Gamification Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-revgreen group-hover:w-2 transition-all duration-300"></div>

            <div className="relative z-10 pl-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-revgreen font-bold">
                        Next Step
                    </span>
                    <div className="h-px w-8 bg-revgreen/30"></div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900 tracking-tight leading-none">
                    {title}
                </h2>

                <p className="text-lg text-zinc-600 mb-10 max-w-3xl font-light leading-relaxed text-balance">
                    {description}
                </p>

                <div className="flex flex-col md:flex-row justify-start gap-4 items-stretch md:items-center">
                    <Button
                        className="bg-black text-white px-8 py-6 text-xs uppercase tracking-[0.15em] hover:bg-revgreen hover:text-black rounded-none font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        onClick={onPrimaryClick}
                    >
                        {primaryBtnText}
                    </Button>

                    {secondaryBtnText && (
                        <Button
                            variant="outline"
                            className="border-2 border-black text-black px-8 py-6 text-xs uppercase tracking-[0.15em] bg-transparent hover:bg-black hover:text-white rounded-none font-bold transition-all"
                            onClick={onSecondaryClick}
                        >
                            {secondaryBtnText}
                        </Button>
                    )}
                </div>
            </div>

            {/* Minimalist Background Decoration */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-zinc-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>
    );
};

export default ArticleCTA;
