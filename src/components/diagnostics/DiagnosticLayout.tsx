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
}

export const DiagnosticLayout = ({
    children,
    title,
    subtitle,
    showGovernanceFooter = true,
    variant = 'light',
    centered = true
}: DiagnosticLayoutProps) => {
    const isDark = variant === 'dark';

    return (
        <PageLayout>
            <div className={cn(
                "min-h-screen transition-colors duration-500",
                isDark ? "bg-black text-white" : "bg-white text-black"
            )}>
                <Section
                    variant={isDark ? 'dark' : 'light'}
                    className={cn(
                        "pt-24 pb-20 min-h-screen flex flex-col",
                        centered ? "justify-center" : "justify-start"
                    )}
                >
                    <div className="container-custom max-w-6xl mx-auto relative z-10 w-full mb-auto mt-auto">
                        {/* Standard Header */}
                        <div className={cn("mb-10 border-b pb-8", isDark ? "border-zinc-900" : "border-zinc-200")}>
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-revgreen rounded-full shadow-[0_0_10px_#03FC3B]" />
                                        <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500">
                                            RevHackers Intelligence
                                        </span>
                                    </div>
                                    <h1 className={cn(
                                        "text-3xl md:text-5xl font-black uppercase tracking-tight leading-none",
                                        isDark ? "text-white" : "text-black"
                                    )}>
                                        {title}
                                    </h1>
                                    <p className={cn(
                                        "text-sm max-w-xl leading-relaxed",
                                        isDark ? "text-zinc-500" : "text-zinc-600"
                                    )}>
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        {children}

                        {/* Governance Footer */}
                        {showGovernanceFooter && (
                            <div className="mt-24 pt-8 border-t border-zinc-900 text-center">
                                <p className="text-[9px] text-zinc-700 font-mono uppercase tracking-wider leading-relaxed max-w-2xl mx-auto">
                                    Esta análise utiliza exclusivamente dados públicos ou fornecidos pelo usuário no momento da coleta.
                                    <br />Os dados podem variar ao longo do tempo e não representam avaliação de autoridade, reputação ou performance profissional.
                                </p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </PageLayout>
    );
};
