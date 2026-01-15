import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Wallet, Info, ArrowUpRight } from 'lucide-react';

interface InvestmentSectionProps {
    plan: any;
    onBudgetChange?: (budget: any) => void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
};

export default function InvestmentSection({ plan, onBudgetChange }: InvestmentSectionProps) {
    const budget = plan.budget_data || {};

    const [channelBudgets, setChannelBudgets] = useState({
        google_ads: budget.google_ads || 0,
        meta_ads: budget.meta_ads || 0,
        linkedin_ads: budget.linkedin_ads || 0,
        tiktok_ads: budget.tiktok_ads || 0,
        taboola: budget.taboola || 0,
        outbrain: budget.outbrain || 0,
    });

    const [inputValues, setInputValues] = useState<Record<string, string>>({
        google_ads: budget.google_ads ? formatCurrency(budget.google_ads) : '',
        meta_ads: budget.meta_ads ? formatCurrency(budget.meta_ads) : '',
        linkedin_ads: budget.linkedin_ads ? formatCurrency(budget.linkedin_ads) : '',
        tiktok_ads: budget.tiktok_ads ? formatCurrency(budget.tiktok_ads) : '',
        taboola: budget.taboola ? formatCurrency(budget.taboola) : '',
        outbrain: budget.outbrain ? formatCurrency(budget.outbrain) : '',
    });

    const channels = [
        {
            key: 'google_ads',
            name: 'Google Ads',
            color: 'bg-blue-600',
            icon: 'G'
        },
        {
            key: 'meta_ads',
            name: 'Meta Ads',
            color: 'bg-blue-500',
            icon: 'M'
        },
        {
            key: 'linkedin_ads',
            name: 'LinkedIn Ads',
            color: 'bg-sky-700',
            icon: 'in'
        },
        {
            key: 'tiktok_ads',
            name: 'TikTok Ads',
            color: 'bg-zinc-900',
            icon: 'TT'
        },
        {
            key: 'taboola',
            name: 'Taboola',
            color: 'bg-orange-600',
            icon: 'T'
        },
        {
            key: 'outbrain',
            name: 'Outbrain',
            color: 'bg-amber-600',
            icon: 'O'
        },
    ];

    const totalBudget = Object.values(channelBudgets).reduce((sum, val) => sum + val, 0);

    const handleInputChange = (key: string, value: string) => {
        setInputValues(prev => ({ ...prev, [key]: value }));
    };

    const handleInputBlur = (key: string, value: string) => {
        const numValue = parseCurrency(value);
        const newBudgets = { ...channelBudgets, [key]: numValue };
        setChannelBudgets(newBudgets);

        setInputValues(prev => ({
            ...prev,
            [key]: numValue > 0 ? formatCurrency(numValue) : ''
        }));

        if (onBudgetChange) {
            onBudgetChange({
                ...newBudgets,
                total: Object.values(newBudgets).reduce((sum, val) => sum + val, 0)
            });
        }
    };

    return (
        <div className="space-y-24">
            {/* Header */}
            <div className="border-b border-zinc-100 pb-8">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase mb-4">
                    Investimento em Mídia
                </h2>
                <p className="text-xl text-zinc-500 font-light max-w-3xl">
                    Planejamento de alocação de capital em canais de tração pagos.
                    <span className="block mt-2 text-black font-medium text-base">Os valores abaixo são sugestões iniciais baseadas no seu objetivo de escala.</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Channel Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {channels.map((channel) => {
                            const inputVal = inputValues[channel.key as keyof typeof inputValues] || '';

                            return (
                                <div
                                    key={channel.key}
                                    className="group flex flex-col p-6 border border-zinc-200 rounded-3xl bg-white hover:border-black transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-white text-xs font-black shadow-sm ${channel.color}`}>
                                                {channel.icon}
                                            </div>
                                            <span className="text-sm font-bold text-black uppercase tracking-wider">
                                                {channel.name}
                                            </span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-black transition-colors" />
                                    </div>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                                            R$
                                        </span>
                                        <Input
                                            type="text"
                                            value={inputVal}
                                            onChange={(e) => handleInputChange(channel.key, e.target.value)}
                                            onBlur={(e) => handleInputBlur(channel.key, e.target.value)}
                                            placeholder="0,00"
                                            className="pl-12 h-14 text-lg font-bold text-right border-zinc-100 bg-zinc-50/50 rounded-2xl focus:border-black focus:ring-0 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="space-y-6">
                    <div className="bg-black text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet className="w-24 h-24" />
                        </div>

                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                                Investimento Total Sugerido
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-light text-zinc-400">R$</span>
                                <span className="text-6xl font-black tracking-tighter">
                                    {formatCurrency(totalBudget)}
                                </span>
                            </div>

                            <div className="mt-12 pt-8 border-t border-zinc-800 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-medium">Investimento Direto</span>
                                    <span className="font-bold">100%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-medium">Gestão Estratégica</span>
                                    <span className="text-revgreen font-bold">Incluso no Fee</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl">
                        <div className="flex gap-4">
                            <Info className="w-5 h-5 text-zinc-400 shrink-0" />
                            <p className="text-xs text-zinc-500 leading-relaxed font-light">
                                Os valores aqui apresentados podem ser ajustados conforme a validação dos primeiros testes A/B e performance de conversão por canal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

