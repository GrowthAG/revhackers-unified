import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Wallet, Info, ArrowUpRight, TrendingUp } from 'lucide-react';

interface InvestmentSectionProps {
    plan: any;
    onBudgetChange?: (budget: any) => void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
};

// ── Mapeia canais do REI para canais de investimento ──────────────────────────
const CHANNEL_CONFIG: Record<string, { name: string; color: string; icon: string; defaultPct: number }> = {
    'google-ads': { name: 'Google Ads', color: 'bg-blue-600', icon: 'G', defaultPct: 35 },
    'meta-ads': { name: 'Meta Ads', color: 'bg-indigo-600', icon: 'M', defaultPct: 25 },
    'linkedin-ads': { name: 'LinkedIn Ads', color: 'bg-sky-700', icon: 'in', defaultPct: 30 },
    'tiktok-ads': { name: 'TikTok Ads', color: 'bg-zinc-900', icon: 'TT', defaultPct: 15 },
    'outbound': { name: 'Outbound (SDR/BDR)', color: 'bg-emerald-700', icon: 'OB', defaultPct: 20 },
    'seo': { name: 'SEO & Content', color: 'bg-amber-600', icon: 'S', defaultPct: 15 },
    'email-marketing': { name: 'E-mail Marketing', color: 'bg-rose-600', icon: 'E', defaultPct: 10 },
    'eventos': { name: 'Eventos & Webinars', color: 'bg-violet-600', icon: 'EV', defaultPct: 10 },
};

function extractBudgetRange(orcamento: string): { min: number; max: number; display: string } {
    if (!orcamento) return { min: 5000, max: 10000, display: 'R$ 5k - R$ 10k' };
    if (orcamento.includes('1.500') || orcamento.includes('5.000') || orcamento.includes('ate-5k'))
        return { min: 1500, max: 5000, display: 'R$ 1.5k - R$ 5k' };
    if (orcamento.includes('5.000') || orcamento.includes('15.000') || orcamento.includes('5k-15k'))
        return { min: 5000, max: 15000, display: 'R$ 5k - R$ 15k' };
    if (orcamento.includes('10') && orcamento.includes('30') || orcamento.includes('10k-30k'))
        return { min: 10000, max: 30000, display: 'R$ 10k - R$ 30k' };
    if (orcamento.includes('30') && orcamento.includes('100') || orcamento.includes('30k'))
        return { min: 30000, max: 100000, display: 'R$ 30k - R$ 100k' };
    if (orcamento.includes('100') || orcamento.includes('100k'))
        return { min: 100000, max: 300000, display: 'R$ 100k+' };
    return { min: 5000, max: 15000, display: 'R$ 5k - R$ 15k' };
}

export default function InvestmentSection({ plan, onBudgetChange }: InvestmentSectionProps) {
    const budget = plan.budget_data || {};
    const diagnostic = plan.diagnostic_data || {};
    const context = diagnostic.context_mirror || {};

    // ── Extrair dados do REI ─────────────────────────────────────────────────
    // Canais selecionados pelo cliente no diagnóstico
    const reiChannels: string[] = diagnostic.selected_channels ||
        diagnostic.canaisAquisicao ||
        context.channels || [];

    // Orçamento informado pelo cliente
    const reiOrcamento: string = diagnostic.budget_range ||
        diagnostic.orcamento ||
        context.budget || '';

    // Prazo esperado
    const reiPrazo: string = diagnostic.timeframe ||
        diagnostic.prazoResultados ||
        context.timeline || '';

    const budgetRange = extractBudgetRange(reiOrcamento);
    const suggestedMonthly = Math.round((budgetRange.min + budgetRange.max) / 2);

    // ── Construir lista de canais (priorizando os do REI) ────────────────────
    const activeChannels = reiChannels.length > 0
        ? reiChannels
            .map(ch => {
                const key = ch.toLowerCase().replace(/\s+/g, '-');
                return CHANNEL_CONFIG[key] ? { key, ...CHANNEL_CONFIG[key] } : null;
            })
            .filter(Boolean) as Array<{ key: string; name: string; color: string; icon: string; defaultPct: number }>
        : [
            { key: 'google-ads', ...CHANNEL_CONFIG['google-ads'] },
            { key: 'meta-ads', ...CHANNEL_CONFIG['meta-ads'] },
            { key: 'linkedin-ads', ...CHANNEL_CONFIG['linkedin-ads'] },
        ];

    // Normalizar percentuais para somar 100%
    const totalPct = activeChannels.reduce((sum, ch) => sum + ch.defaultPct, 0);

    // ── State para valores editáveis ─────────────────────────────────────────
    const [channelBudgets, setChannelBudgets] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        activeChannels.forEach(ch => {
            const normalizedPct = ch.defaultPct / totalPct;
            initial[ch.key] = budget[ch.key] || Math.round(suggestedMonthly * normalizedPct);
        });
        return initial;
    });

    const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        activeChannels.forEach(ch => {
            const val = channelBudgets[ch.key] || 0;
            initial[ch.key] = val > 0 ? formatCurrency(val) : '';
        });
        return initial;
    });

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
        <div className="space-y-16 py-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    INVESTIMENTO
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter leading-[0.95]">
                    Alocação de<br />
                    <span className="text-zinc-300">Mídia</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Sugestão de investimento mensal baseada no seu diagnóstico. Os valores são ajustáveis — o cliente define o investimento final.
                </p>
            </div>

            {/* Contexto do REI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-zinc-200 bg-zinc-50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Orçamento Informado</p>
                    <p className="text-lg font-black text-black">{budgetRange.display}/mês</p>
                </div>
                <div className="p-5 border border-zinc-200 bg-zinc-50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Canais Selecionados</p>
                    <p className="text-lg font-black text-black">{activeChannels.length} canais</p>
                </div>
                <div className="p-5 border border-zinc-200 bg-zinc-50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Prazo Esperado</p>
                    <p className="text-lg font-black text-black">{reiPrazo || '6-12 meses'}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Channel Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeChannels.map((channel) => {
                            const inputVal = inputValues[channel.key] || '';
                            const pct = totalBudget > 0
                                ? Math.round((channelBudgets[channel.key] / totalBudget) * 100)
                                : Math.round((channel.defaultPct / totalPct) * 100);

                            return (
                                <div
                                    key={channel.key}
                                    className="group flex flex-col p-6 border border-zinc-200 bg-white hover:border-black transition-all"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 flex items-center justify-center text-white text-xs font-black ${channel.color}`}>
                                                {channel.icon}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-black block">{channel.name}</span>
                                                <span className="text-[10px] text-zinc-400">{pct}% do budget</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-zinc-200 group-hover:text-black transition-colors" />
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
                                            placeholder="0"
                                            className="pl-12 h-12 text-lg font-bold text-right border-zinc-100 bg-zinc-50/50 focus:border-black focus:ring-0 focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Bar */}
                                    <div className="h-1 bg-zinc-100 mt-3 overflow-hidden">
                                        <div
                                            className={`h-full ${channel.color} transition-all duration-500`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="space-y-6">
                    <div className="bg-black text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Wallet className="w-20 h-20" />
                        </div>

                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                                Investimento Mensal Sugerido
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-light text-zinc-400">R$</span>
                                <span className="text-5xl font-black tracking-tighter">
                                    {formatCurrency(totalBudget)}
                                </span>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-medium">Investimento em Mídia</span>
                                    <span className="font-bold">100%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-medium">Gestão Estratégica</span>
                                    <span className="text-[#00CC6A] font-bold">Incluso no Fee</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 p-6">
                        <div className="flex gap-3">
                            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Esta é uma <strong className="text-zinc-700">sugestão baseada no seu diagnóstico REI</strong> — canais selecionados, orçamento informado e prazo de resultado esperado. Os valores podem ser ajustados conforme a validação dos primeiros testes e performance de conversão por canal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
