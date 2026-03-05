import React, { useState } from 'react';
import { BarChart3, Zap, Target, Settings } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────
const P = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function getSegmentConfig(segment: string) {
    const a = (segment || '').toLowerCase();
    if (a.includes('saas') || a.includes('tech') || a.includes('crm')) return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: '🔍', recommended: [5000, 15000], desc: 'Search fundo de funil + PMAX para captura de demanda ativa' },
            { key: 'meta_ads', name: 'Meta Ads', icon: '📱', recommended: [3000, 8000], desc: 'Retargeting + lookalike para awareness e nutrição' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: '💼', recommended: [2000, 6000], desc: 'Lead Gen Forms para decisores B2B de empresas-alvo' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [4500, 8000] },
        tools: { label: 'Stack de Ferramentas (CRM + Automação)', range: [500, 2000] },
        cac_benchmark: 'R$ 800–2.500', ltv_cac_target: '3:1 a 5:1', roas_target: '3x–6x em 90 dias', breakeven: 'Mês 2–3',
    };
    if (a.includes('ecommerce') || a.includes('e-commerce') || a.includes('loja') || a.includes('varejo')) return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: '🔍', recommended: [5000, 20000], desc: 'Shopping + Search + PMAX para captura de demanda de compra' },
            { key: 'meta_ads', name: 'Meta Ads', icon: '📱', recommended: [5000, 15000], desc: 'Catálogo dinâmico, lookalike de compradores e retargeting' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: '💼', recommended: [0, 2000], desc: 'Opcional para B2B wholesale ou parcerias corporativas' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [4000, 9000] },
        tools: { label: 'Stack de Ferramentas (CRM + Pixel + Analytics)', range: [300, 1200] },
        cac_benchmark: 'R$ 30–200', ltv_cac_target: '3:1 a 5:1', roas_target: '4x–8x em 60 dias', breakeven: 'Mês 1–2',
    };
    // Default
    return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: '🔍', recommended: [3000, 12000], desc: 'Captura de demanda ativa — keywords de intenção de compra' },
            { key: 'meta_ads', name: 'Meta Ads', icon: '📱', recommended: [2000, 8000], desc: 'Awareness, retargeting e geração de leads com criativos visuais' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: '💼', recommended: [1500, 5000], desc: 'Posicionamento B2B e geração de oportunidades com decisores' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [3500, 7000] },
        tools: { label: 'Stack de Ferramentas (CRM + Automação)', range: [400, 1500] },
        cac_benchmark: 'R$ 500–2.000', ltv_cac_target: '3:1 a 5:1', roas_target: '3x–5x em 90 dias', breakeven: 'Mês 2–3',
    };
}

export default function InvestmentSection({ plan, onBudgetChange }: { plan: any; onBudgetChange?: (data: any) => void }) {
    const budgetData = plan.budget_data || {};
    const segment = plan.diagnostic_data?.context_mirror?.segmento || plan.diagnostic_data?.context_mirror?.segment || plan.premises_data?.segmento || plan.premises_data?.segment || '';
    const config = getSegmentConfig(segment);

    const [values, setValues] = useState<Record<string, number>>({
        google_ads: budgetData.google_ads || 0,
        meta_ads: budgetData.meta_ads || 0,
        linkedin_ads: budgetData.linkedin_ads || 0,
    });
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [focusedKey, setFocusedKey] = useState<string | null>(null);

    const totalMedia = Object.values(values).reduce((s, v) => s + v, 0);
    const hasCustom = totalMedia > 0;
    const channelsDisplay = config.channels.map(ch => ({
        ...ch, value: values[ch.key] || 0, midpoint: Math.round((ch.recommended[0] + ch.recommended[1]) / 2),
    }));
    const mediaTotal = hasCustom ? totalMedia : channelsDisplay.reduce((s, c) => s + c.midpoint, 0);
    const feeAvg = Math.round((config.fee.range[0] + config.fee.range[1]) / 2);
    const toolsAvg = Math.round((config.tools.range[0] + config.tools.range[1]) / 2);
    const grandTotal = mediaTotal + feeAvg + toolsAvg;
    const barColors = ['bg-zinc-950', 'bg-zinc-600', 'bg-zinc-400'];

    const handleChange = (key: string, val: string) => setEditing(prev => ({ ...prev, [key]: val.replace(/[^\d.,]/g, '') }));
    const handleFocus = (key: string) => {
        const v = values[key]; setEditing(prev => ({ ...prev, [key]: v > 0 ? String(v).replace('.', ',') : '' }));
        setFocusedKey(key);
    };
    const handleBlur = (key: string) => {
        const raw = (editing[key] || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
        const num = parseFloat(raw) || 0;
        const newVals = { ...values, [key]: num };
        setValues(newVals); setEditing(prev => ({ ...prev, [key]: '' })); setFocusedKey(null);
        onBudgetChange?.({ ...newVals, total: Object.values(newVals).reduce((s, v) => s + v, 0) });
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Financeiro</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-[1.05] mb-4">
                    Investimento<br /><span className="text-zinc-400">& Retorno</span>
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    Breakdown de investimento por canal com faixas recomendadas para o segmento. Valores editáveis — ajuste conforme seu budget.
                </p>
            </div>

            {/* Grand Total + KPIs */}
            <div className="bg-zinc-950 p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-xs text-[#00CC6A]/70 uppercase tracking-[0.2em] font-semibold mb-2">Investimento Mensal Estimado</p>
                        <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {P(grandTotal)}<span className="text-lg text-white/30 font-normal">/mês</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 md:gap-8">
                        <div className="text-center">
                            <p className="text-xl font-bold text-[#00CC6A]">{config.roas_target}</p>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">ROAS Target</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white">{config.breakeven}</p>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Break-Even</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white">{config.ltv_cac_target}</p>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">LTV:CAC</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-5 h-5 text-black" />
                    <h3 className="text-xl font-bold text-black">Distribuição por Canal</h3>
                </div>
                <div className="h-3 flex rounded-full overflow-hidden mb-8 bg-zinc-100">
                    {channelsDisplay.map((ch, i) => {
                        const val = hasCustom ? ch.value : ch.midpoint;
                        const pct = mediaTotal > 0 ? (val / mediaTotal) * 100 : 33;
                        return <div key={i} className={`${barColors[i]} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${ch.name}: ${Math.round(pct)}%`} />;
                    })}
                </div>
                <div className="space-y-4">
                    {channelsDisplay.map((ch, i) => {
                        const val = hasCustom ? ch.value : ch.midpoint;
                        const pct = mediaTotal > 0 ? Math.round((val / mediaTotal) * 100) : 33;
                        return (
                            <div key={i} className="border border-zinc-200 hover:border-zinc-400 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${barColors[i]}`} />
                                            <span className="text-lg font-semibold text-black">{ch.icon} {ch.name}</span>
                                            <span className="text-xs text-zinc-400 font-mono">{pct}%</span>
                                        </div>
                                        <p className="text-[12px] text-zinc-500 leading-relaxed ml-[22px]">{ch.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-zinc-400 uppercase tracking-widest">Faixa Recomendada</p>
                                            <p className="text-sm text-zinc-600 font-medium">{P(ch.recommended[0])} – {P(ch.recommended[1])}</p>
                                        </div>
                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                                            <input
                                                type="text" inputMode="decimal"
                                                value={focusedKey === ch.key ? (editing[ch.key] ?? '') : ch.value > 0 ? ch.value.toLocaleString('pt-BR') : ''}
                                                onChange={e => handleChange(ch.key, e.target.value)}
                                                onFocus={() => handleFocus(ch.key)}
                                                onBlur={() => handleBlur(ch.key)}
                                                placeholder={ch.midpoint.toLocaleString('pt-BR')}
                                                className="pl-9 h-11 w-full text-right font-mono text-sm border border-zinc-200 focus:border-zinc-900 focus:ring-0 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fee + Tools */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-zinc-400" />
                        <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">{config.fee.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-black mb-1">{P(config.fee.range[0])} – {P(config.fee.range[1])}</p>
                    <p className="text-xs text-zinc-400">Setup, gestão de campanhas, otimização e relatórios</p>
                </div>
                <div className="border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">{config.tools.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-black mb-1">{P(config.tools.range[0])} – {P(config.tools.range[1])}</p>
                    <p className="text-xs text-zinc-400">CRM, automação de marketing, tracking e analytics</p>
                </div>
            </div>

            {/* ROI Projection */}
            <div className="bg-zinc-950 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Target className="w-4 h-4 text-[#00CC6A]" />
                    <h3 className="text-lg font-bold text-white">Projeção de Retorno</h3>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">CAC Benchmark</p>
                        <p className="text-xl font-bold text-white">{config.cac_benchmark}</p>
                        <p className="text-xs text-white/30 mt-1">Custo por aquisição do segmento</p>
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Leads Estimados/Mês</p>
                        <p className="text-xl font-bold text-[#00CC6A]">{Math.round(mediaTotal / 150)}–{Math.round(mediaTotal / 60)}</p>
                        <p className="text-xs text-white/30 mt-1">Baseado no investimento em mídia</p>
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Revenue Potencial</p>
                        <p className="text-xl font-bold text-white">{P(grandTotal * 2)}–{P(grandTotal * 4)}</p>
                        <p className="text-xs text-white/30 mt-1">ROAS target {config.roas_target}</p>
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Break-Even</p>
                        <p className="text-xl font-bold text-white">{config.breakeven}</p>
                        <p className="text-xs text-white/30 mt-1">Tempo estimado para payback</p>
                    </div>
                </div>
            </div>

            {/* Próximos Passos + Retorno potential */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-8">
                    <p className="text-xs text-[#00CC6A] uppercase tracking-[0.2em] font-semibold mb-6">Próximos Passos</p>
                    <div className="space-y-5">
                        {[
                            { n: '01', title: 'Aprovação', desc: 'Client assina o planejamento e autoriza o início', timing: 'Hoje' },
                            { n: '02', title: 'Kick-Off', desc: 'Reunião de abertura + onboarding de acessos e contas', timing: 'Dia 1–3' },
                            { n: '03', title: 'Fundação Live', desc: 'CRM, tracking e automações ativas. Campanhas preparadas.', timing: 'Dia 7–21' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="text-zinc-700 font-black font-mono text-2xl leading-none mt-0.5">{step.n}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white font-bold text-sm">{step.title}</p>
                                        <span className="text-xs text-[#00CC6A] font-mono">{step.timing}</span>
                                    </div>
                                    <p className="text-zinc-500 text-xs mt-0.5">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border border-zinc-200 p-8 flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold mb-6">Potencial de Retorno</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <span className="text-sm text-zinc-600">Investimento mensal</span>
                                <span className="font-bold text-black font-mono">{P(grandTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <span className="text-sm text-zinc-600">Revenue alvo (ROAS {config.roas_target})</span>
                                <span className="font-bold text-black font-mono">{P(grandTotal * 3)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <span className="text-sm text-zinc-600">Payback estimado</span>
                                <span className="font-bold text-black">{config.breakeven}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-600">LTV:CAC meta</span>
                                <span className="font-bold text-[#00CC6A] text-lg">{config.ltv_cac_target}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-200">
                        <p className="text-xs text-zinc-300 text-center">Valores baseados em benchmarks do segmento • Ajuste os campos para personalizar</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
