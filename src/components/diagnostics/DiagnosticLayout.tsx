import React from 'react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

interface DiagnosticLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showGovernanceFooter?: boolean;
    variant?: 'light' | 'dark';
    centered?: boolean;
    hideHeader?: boolean;
    headerVariant?: 'default' | 'light';
}

export const DiagnosticLayout = ({
    children,
    title,
    subtitle,
    showGovernanceFooter = true,
    variant = 'light',
    centered = true,
    hideHeader = false,
    headerVariant = 'default'
}: DiagnosticLayoutProps) => {
    const isDark = variant === 'dark';

    return (
        <PageLayout headerVariant={headerVariant}>
            <div className={cn(
                "min-h-screen transition-colors duration-500",
                isDark ? "bg-black text-white" : "bg-white text-black"
            )}>
                <Section
                    variant={isDark ? 'dark' : 'light'}
                    className={cn(
                        "pt-24 md:pt-32 pb-20 min-h-screen flex flex-col",
                        centered ? "items-center justify-start text-center" : "items-center justify-start"
                    )}
                >
                    <div className="container-custom max-w-6xl mx-auto relative z-10 w-full mb-auto mt-auto flex flex-col items-center">
                        {/* Standard Header */}
                        {!hideHeader && (
                            <div className={cn(
                                "mb-20 md:mb-32 w-full",
                                isDark ? "border-zinc-900" : "border-zinc-100",
                                centered && "flex flex-col items-center text-center"
                            )}>
                                <div className={cn("space-y-8 w-full", centered && "flex flex-col items-center")}>
                                    <div className="flex items-center gap-3 animate-fade-in">
                                        <div className={cn(
                                            "w-1 h-1 rounded-full",
                                            isDark ? "bg-revgreen shadow-[0_0_15px_rgba(0,204,106,0.8)]" : "bg-zinc-900"
                                        )} />
                                        <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-zinc-400">
                                            RevHackers // Intelligence Unit
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <h1 className={cn(
                                            "text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.9] animate-fade-in w-full",
                                            isDark ? "text-white" : "text-black",
                                            centered && "text-center"
                                        )}>
                                            {title}
                                        </h1>
                                        <p className={cn(
                                            "text-lg md:text-xl max-w-2xl leading-relaxed font-medium tracking-tight animate-fade-in [animation-delay:200ms] w-full",
                                            isDark ? "text-zinc-500" : "text-zinc-600",
                                            centered && "text-center mx-auto"
                                        )}>
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content Area */}
                        <div className={cn(
                            "animate-fade-in [animation-delay:400ms] w-full",
                            centered && "flex flex-col items-center"
                        )}>
                            {children}
                        </div>

                        {/* Governance Footer - Surgical Minimalist */}
                        {showGovernanceFooter && (
                            <div className={cn(
                                "mt-32 pt-12 border-t text-center flex flex-col items-center gap-6",
                                isDark ? "border-zinc-900" : "border-zinc-100"
                            )}>
                                <div className={cn("w-8 h-px", isDark ? "bg-zinc-800" : "bg-zinc-100")} />
                                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto font-bold">
                                    ESTA ANÁLISE UTILIZA EXCLUSIVAMENTE DADOS PÚBLICOS OU FORNECIDOS PELO USUÁRIO NO MOMENTO DA COLETA.
                                    <br />OS DADOS PODEM VARIAR AO LONGO DO TEMPO E NÃO REPRESENTAM AVALIAÇÃO DE AUTORIDADE, REPUTAÇÃO OU PERFORMANCE PROFISSIONAL.
                                </p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </PageLayout>
    );
};
