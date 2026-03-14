import React from 'react';
import { Target } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

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
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <SectionHeader
                        eyebrow="Resultados Esperados"
                        titleLine1="Projeção de"
                        titleLine2="Crescimento"
                        description={`Estimativa baseada no diagnóstico e nas médias do segmento — horizonte de ${horizonLabel}`}
                    />

                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        {[
                            { label: `Receita no Mês ${months}`, value: last?.display || formatBRL(95000) },
                            { label: `Leads no Mês ${months}`, value: `${last?.leads || 340} leads` },
                            { label: 'Ponto de Equilíbrio', value: months <= 6 ? 'Mês 2 a 3' : 'Mês 3 a 4' },
                            { label: `Receita no Mês ${Math.floor(months / 2)}`, value: mid?.display || formatBRL(32000) },
                        ].map((kpi, i) => (
                            <div key={i} className={`p-4 text-center min-w-32 ${i === 0 ? 'bg-black text-white rounded-lg shadow-sm' : 'bg-white border border-zinc-200 rounded-lg shadow-sm'}`}>
                                <p className={`text-xl font-black mb-0.5 ${i === 0 ? 'text-[#00CC6A]' : 'text-black'}`}>{kpi.value}</p>
                                <p className={`text-xs font-black uppercase tracking-widest leading-tight ${i === 0 ? 'text-white/60' : 'text-zinc-400'}`}>{kpi.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full bg-white space-y-10">

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
                        <div className="flex items-end gap-2 h-64 mt-4">
                            {data.map((d, i) => {
                                const pct = maxMRR > 0 ? (d.mrr / maxMRR) * 100 : 0;
                                const isLast = i === data.length - 1;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                                        <span className="text-sm font-bold text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.display}</span>
                                        <div className="w-full max-w-[6rem] relative flex items-end flex-1">
                                            <div className={`w-full transition-all duration-700 rounded-t-lg ${isLast ? 'bg-black shadow-sm' : 'bg-zinc-200 group-hover:bg-zinc-300'}`} style={{ height: `${Math.max(pct, 5)}%` }} />
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-widest mt-1 ${isLast ? 'text-black' : 'text-zinc-400'}`}>M{i + 1}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-px bg-zinc-200 mt-1" />
                    </div>

                    {/* Leads Pipeline */}
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-medium mb-4">Pipeline de Leads por Mês</p>
                        <div className="space-y-4 flex flex-col justify-end h-64 mt-4">
                            {data.map((d, i) => {
                                const pct = maxLeads > 0 ? (d.leads / maxLeads) * 100 : 0;
                                const isLast = i === data.length - 1;
                                return (
                                    <div key={i} className="flex items-center gap-3 w-full">
                                        <span className={`text-xs font-black uppercase tracking-widest w-8 text-right shrink-0 ${isLast ? 'text-black' : 'text-zinc-400'}`}>M{i + 1}</span>
                                        <div className="flex-1 h-6 bg-zinc-50 relative overflow-hidden rounded-r-md">
                                            <div className={`h-full transition-all duration-700 rounded-r-md ${isLast ? 'bg-black shadow-sm' : 'bg-zinc-200'}`} style={{ width: `${Math.max(pct, 6)}%` }} />
                                        </div>
                                        <span className={`text-sm uppercase font-black tracking-widest w-20 shrink-0 ${isLast ? 'text-black' : 'text-zinc-400'}`}>{d.leads} leads</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <p className="text-xs text-zinc-300 text-center pt-2">
                    {plan.financial_projections?.note || 'Projeções baseadas em benchmarks de mercado. Resultados reais dependem de execução e contexto específico do projeto.'}
                </p>
            </div>
        </div>
    );
}
