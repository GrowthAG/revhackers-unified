import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface InvestmentSectionProps {
    plan: any;
    onBudgetChange?: (budget: any) => void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
};

const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
};

export default function InvestmentSection({ plan, onBudgetChange }: InvestmentSectionProps) {
    const budget = plan.budget_data || {};

    const [channelBudgets, setChannelBudgets] = useState({
        google_ads: budget.google_ads || 0,
        meta_ads: budget.meta_ads || 0,
        linkedin_ads: budget.linkedin_ads || 0,
    });

    const channels = [
        { key: 'google_ads', name: 'Google Ads' },
        { key: 'meta_ads', name: 'Meta Ads' },
        { key: 'linkedin_ads', name: 'LinkedIn Ads' },
    ];

    const totalBudget = Object.values(channelBudgets).reduce((sum, val) => sum + val, 0);

    const handleBudgetChange = (key: string, value: string) => {
        const numValue = parseCurrency(value);
        const newBudgets = { ...channelBudgets, [key]: numValue };
        setChannelBudgets(newBudgets);

        if (onBudgetChange) {
            onBudgetChange({
                ...newBudgets,
                total: Object.values(newBudgets).reduce((sum, val) => sum + val, 0)
            });
        }
    };

    return (
        <div className="space-y-16">
            {/* Header - Apple Style */}
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                    Investimento em Mídia
                </h2>
                <p className="text-lg text-zinc-500 font-light leading-relaxed">
                    Defina o investimento mensal por canal de mídia paga.
                </p>
            </div>

            {/* Total Card - White with black border */}
            <div className="max-w-md mx-auto">
                <div className="border-2 border-black p-8 text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                        Investimento Total Mensal
                    </p>
                    <p className="text-5xl md:text-6xl font-light text-black tracking-tight">
                        {formatCurrency(totalBudget)}
                    </p>
                </div>
            </div>

            {/* Channel Inputs - Minimalist */}
            <div className="max-w-2xl mx-auto space-y-6">
                {channels.map((channel) => {
                    const value = channelBudgets[channel.key as keyof typeof channelBudgets];

                    return (
                        <div
                            key={channel.key}
                            className="flex items-center justify-between py-6 border-b border-zinc-200"
                        >
                            <span className="text-lg font-medium text-black">
                                {channel.name}
                            </span>

                            <div className="relative w-48">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    R$
                                </span>
                                <Input
                                    type="text"
                                    value={value > 0 ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                                    onChange={(e) => handleBudgetChange(channel.key, e.target.value)}
                                    placeholder="0,00"
                                    className="pl-10 h-12 text-lg font-light text-right border-zinc-200 focus:border-black focus:ring-0 rounded-none"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Note */}
            <div className="text-center">
                <p className="text-sm text-zinc-400">
                    Valores mensais estimados para campanhas de mídia paga.
                </p>
            </div>
        </div>
    );
}
