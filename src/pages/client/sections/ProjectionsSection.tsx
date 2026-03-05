import React from 'react';
import { Target } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────
const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

function getContractMonths(plan: any) {
    return plan.premises_data?.duration_months || plan.budget_data?.contract_months || plan.financial_projections?.total_months || plan.investment_data?.duration_months || 6;
}

function getBaseMRR(plan: any) {
    const fp = plan.financial_projections;
    // New format: generateProjections now stores current_mrr directly
    if (fp?.current_mrr && fp.current_mrr > 0) return fp.current_mrr;
    if (plan.budget_data?.current_mrr > 0) return plan.budget_data.current_mrr;

    // Parse REI select-box MRR values
    const answers = plan.diagnostic_data?.answers || plan.premises_data?.answers || {};
    const mrr = answers.mrr || fp?.context?.mrr_atual || '';
    const mrrMap: Record<string, number> = {
        'ate-50k': 35000, '50k-200k': 100000, '200k-500k': 300000,
        '500k-1m': 700000, 'acima-1m': 1500000,
    };
    if (mrrMap[mrr]) return mrrMap[mrr];

    // Try parsing as number
    const num = parseFloat(String(mrr).replace(/[^0-9,]/g, '').replace(',', '.'));
    if (!isNaN(num) && num > 0) return num;

    // Try annual revenue
    const annual = answers.faturamentoAnual || answers.annualRevenue || answers.faturamento || '';
    if (annual) {
        const aNum = parseFloat(String(annual).replace(/[^0-9,]/g, '').replace(',', '.'));
        if (!isNaN(aNum) && aNum > 0) return Math.round(aNum / 12);
    }

    return 8000;
}

function buildProjections(plan: any) {
    const months = getContractMonths(plan);
    const fp = plan.financial_projections;
    const monthly = fp?.monthly_projections;

    // Use pre-calculated projections from DiagnosticService (new format)
    if (Array.isArray(monthly) && monthly.length > 0 && monthly.some((m: any) => (m.mrr || 0) > 0)) {
        return monthly.slice(0, months).map((m: any) => ({
            label: m.month || m.label || 'Mês',
            leads: m.leads || 0,
            mrr: m.mrr || 0,
            display: m.mrr_formatted || formatBRL(m.mrr || 0),
        }));
    }

    // Fallback: generate from base MRR
    const base = getBaseMRR(plan);
    const growthRate = 1.15; // More conservative than old 1.42
    return Array.from({ length: months }, (_, i) => ({
        label: `Mês ${i + 1}`,
        leads: Math.round(20 * Math.pow(1.2, i)),
        mrr: Math.round(base * Math.pow(growthRate, i * 0.8)),
        display: formatBRL(Math.round(base * Math.pow(growthRate, i * 0.8))),
    }));
}

export default function ProjectionsSection({ plan }: { plan: any }) {
    const data = buildProjections(plan);
    const months = getContractMonths(plan);
    const maxMRR = Math.max(...data.map(d => d.mrr));
    const maxLeads = Math.max(...data.map(d => d.leads));
    const last = data[data.length - 1];
    const mid = data[Math.floor(data.length / 2)];
    const horizonLabel = months === 12 ? '12 meses' : months === 6 ? '6 meses' : `${months} meses`;

    return (
        <div className="space-y-10">
            {/* Header + KPIs */}
            <div className="flex items-start justify-between gap-8">
                <div className="shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-px bg-zinc-900" />
                        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Resultados Esperados</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-[1.05]">
                        Projeção de<br />
                        <span className="text-zinc-400">Crescimento</span>
                    </h2>
                    <p className="text-zinc-500 text-sm mt-3">
                        Estimativa baseada no diagnóstico e nas médias do segmento — <strong>horizonte de {horizonLabel}</strong>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                    {[
                        { label: `Receita no Mês ${months}`, value: last?.display || formatBRL(95000) },
                        { label: `Leads no Mês ${months}`, value: `${last?.leads || 340} leads` },
                        { label: 'Ponto de Equilíbrio', value: months <= 6 ? 'Mês 2 a 3' : 'Mês 3 a 4' },
                        { label: `Receita no Mês ${Math.floor(months / 2)}`, value: mid?.display || formatBRL(32000) },
                    ].map((kpi, i) => (
                        <div key={i} className={`p-4 text-center min-w-32 ${i === 0 ? 'bg-zinc-950 text-white' : 'bg-zinc-100'}`}>
                            <p className={`text-xl font-bold mb-0.5 ${i === 0 ? 'text-[#00CC6A]' : 'text-black'}`}>{kpi.value}</p>
                            <p className={`text-xs uppercase tracking-widest leading-tight ${i === 0 ? 'text-white/40' : 'text-zinc-400'}`}>{kpi.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-8">
                {/* MRR Bar Chart */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-medium">Receita Mensal Recorrente por Mês</p>
                        <div className="flex items-center gap-1.5 text-xs text-[#00CC6A]">
                            <Target className="w-3 h-3" />
                            <span className="font-semibold">{last?.display}</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-1.5 h-44">
                        {data.map((d, i) => {
                            const pct = maxMRR > 0 ? (d.mrr / maxMRR) * 100 : 0;
                            const isLast = i === data.length - 1;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className="text-xs text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.display}</span>
                                    <div className="w-full relative flex items-end" style={{ height: '8rem' }}>
                                        <div className={`w-full transition-all duration-700 ${isLast ? 'bg-zinc-950' : 'bg-zinc-200 group-hover:bg-zinc-400'}`} style={{ height: `${Math.max(pct, 5)}%` }} />
                                    </div>
                                    <span className="text-xs text-zinc-400 font-medium">M{i + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-px bg-zinc-200 mt-1" />
                </div>

                {/* Leads Pipeline */}
                <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-medium mb-4">Pipeline de Leads por Mês</p>
                    <div className="space-y-2">
                        {data.map((d, i) => {
                            const pct = maxLeads > 0 ? (d.leads / maxLeads) * 100 : 0;
                            const isLast = i === data.length - 1;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-400 w-6 shrink-0 font-mono">M{i + 1}</span>
                                    <div className="flex-1 h-6 bg-zinc-50 relative overflow-hidden border border-zinc-100">
                                        <div className={`h-full transition-all duration-700 ${isLast ? 'bg-zinc-950' : 'bg-zinc-200'}`} style={{ width: `${Math.max(pct, 6)}%` }} />
                                    </div>
                                    <span className={`text-xs font-mono w-16 text-right shrink-0 ${isLast ? 'font-bold text-black' : 'text-zinc-500'}`}>{d.leads} leads</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <p className="text-xs text-zinc-300 text-center pt-2">
                Projeções baseadas em benchmarks de mercado. Resultados reais dependem de execução e contexto específico do projeto.
            </p>
        </div>
    );
}
