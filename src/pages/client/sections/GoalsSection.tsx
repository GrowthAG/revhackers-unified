import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Target } from 'lucide-react';

// ── Default OKRs ──────────────────────────────────────────────────────────
const defaultOKRs = [
    {
        objective: 'Objetivo Estratégico do Período', label: 'O',
        description: 'Construir a fundação para crescimento de receita previsível e escalável',
        krs: [
            { label: 'RK 1', text: 'Revenue Stack 100% implementado: CRM, rastreamento e automações ativas', target: 'Sem. 2' },
            { label: 'RK 2', text: 'Pipeline com 3x o target de fechamento em oportunidades qualificadas', target: 'Mês 2' },
            { label: 'RK 3', text: 'Ciclo de vendas reduzido em 20% com automações de nutrição', target: 'Mês 3' },
        ],
        dark: true,
    },
    {
        objective: 'RK 1 — Infraestrutura e Fundação', label: '01',
        krs: [
            { label: 'RK 1.1', text: 'CRM implementado com adoção do time acima de 80%', target: 'Sem. 2' },
            { label: 'RK 1.2', text: 'Conversões rastreadas de ponta a ponta: clique, lead, oportunidade e fechamento', target: 'Sem. 3' },
            { label: 'RK 1.3', text: '3 automações de acompanhamento ativas antes de qualquer campanha paga', target: 'Sem. 3' },
        ],
    },
    {
        objective: 'RK 2 — Geração de Demanda', label: '02',
        krs: [
            { label: 'RK 2.1', text: 'Custo por lead abaixo do benchmark do segmento nos primeiros 30 dias', target: 'Mês 1' },
            { label: 'RK 2.2', text: 'Taxa de conversão de Lead para SQL acima de 15%', target: 'Mês 2' },
            { label: 'RK 2.3', text: '3 canais de aquisição ativos e mensurados de forma independente', target: 'Mês 2' },
        ],
    },
    {
        objective: 'RK 3 — Conversão e Pipeline', label: '03',
        krs: [
            { label: 'RK 3.1', text: 'Conversão de SQL para fechamento acima de 20%', target: 'Mês 2' },
            { label: 'RK 3.2', text: 'Ciclo médio de vendas abaixo de 30 dias para tickets até R$10K', target: 'Mês 2' },
            { label: 'RK 3.3', text: 'Velocidade de pipeline positiva com oportunidades evoluindo a cada semana', target: 'Contínuo' },
        ],
    },
    {
        objective: 'RK 4 — Retenção e Expansão', label: '04',
        krs: [
            { label: 'RK 4.1', text: 'CAC recuperado em até 90 dias (payback abaixo de 90 dias)', target: 'Mês 3' },
            { label: 'RK 4.2', text: 'Proporção LTV:CAC igual ou acima de 3:1 como sinal de escala autorizada', target: 'Trim. 2' },
            { label: 'RK 4.3', text: 'Churn abaixo de 5% ao mês e NPS acima de 50 medido trimestralmente', target: 'Contínuo' },
        ],
    },
];

const horizonte12m = [
    { title: 'Validação', subtitle: 'Mês 1 – 3', metric: 'Prova de Conceito', krs: ['Fundação testada', 'CAC calculado', 'Primeira conversão registrada'] },
    { title: 'Crescimento', subtitle: 'Mês 4 – 8', metric: 'Escala Controlada', krs: ['LTV:CAC ≥ 3:1', 'Velocidade de pipeline positiva', '3 canais escalados'] },
    { title: 'Consolidação', subtitle: 'Mês 9 – 12', metric: 'Liderança de Mercado', krs: ['Churn < 3%', 'Indicações como canal', 'Playbook documentado'] },
];

export default function GoalsSection({ plan }: { plan: any }) {
    const okrs = (plan.goals_data || {}).okrs || [];
    const displayOKRs = okrs.length > 0 ? okrs.map((o: any, i: number) => ({ ...(defaultOKRs[i] || {}), ...o })) : defaultOKRs;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">Desempenho</span>
                </div>
                <h2 className="text-2xl font-bold text-black tracking-tight">
                    OKRs & <span className="text-zinc-400">Indicadores</span>
                </h2>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { symbol: 'O', color: 'bg-zinc-950 text-white', symbolColor: 'text-[#00CC6A]', title: 'Objetivo', desc: 'Qualitativo e aspiracional. Define a direção do período.' },
                    { symbol: 'RK', color: 'border border-zinc-200', symbolColor: 'text-zinc-300', title: 'Resultados-Chave', desc: 'Mensuráveis e estruturais. Estrutura, não valor monetário.' },
                    { symbol: 'KPI', color: 'border border-zinc-200 bg-zinc-50', symbolColor: 'text-zinc-200', title: 'Indicadores', desc: 'Sinais de risco antecipados antes de afetar os objetivos.' },
                ].map((item, i) => (
                    <div key={i} className={`p-3 flex gap-3 items-start ${item.color}`}>
                        <div className={`text-lg font-black shrink-0 ${item.symbolColor}`}>{item.symbol}</div>
                        <div>
                            <h4 className={`font-bold text-xs mb-0.5 ${item.color.includes('bg-zinc-950') ? 'text-white' : 'text-zinc-800'}`}>{item.title}</h4>
                            <p className={`text-xs leading-relaxed ${item.color.includes('bg-zinc-950') ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main OKR (first one - dark) */}
            {displayOKRs.slice(0, 1).map((okr: any, i: number) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10">
                        <div className="w-7 h-7 bg-[#00CC6A] text-black flex items-center justify-center font-black text-xs shrink-0">O</div>
                        <div>
                            <p className="text-xs text-[#00CC6A]/70 uppercase tracking-widest font-bold mb-0.5">Objetivo do Período</p>
                            <EditableField path={`goals_data.okrs.${i}.description`} className="text-sm font-semibold text-white leading-snug" placeholder={okr.description} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-white/10">
                        {(okr.krs || []).slice(0, 3).map((kr: any, j: number) => (
                            <div key={j} className="px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-white/40">{kr.label}</span>
                                    {kr.target && <span className="text-xs px-1.5 py-0.5 font-mono bg-white/10 text-white/50">{kr.target}</span>}
                                </div>
                                <EditableField path={`goals_data.okrs.${i}.krs.${j}.text`} className="text-xs text-white/75 leading-relaxed" placeholder={kr.text} multiline />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Secondary OKRs (2x2 grid) */}
            <div className="grid grid-cols-2 gap-3">
                {displayOKRs.slice(1, 5).map((okr: any, i: number) => (
                    <div key={i} className="border border-zinc-200 bg-white">
                        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100">
                            <div className="w-7 h-7 bg-zinc-100 text-zinc-700 flex items-center justify-center font-black text-xs shrink-0">
                                {okr.label || String(i + 1).padStart(2, '0')}
                            </div>
                            <EditableField path={`goals_data.okrs.${i + 1}.objective`} className="text-sm font-bold text-zinc-800 leading-tight" placeholder={okr.objective || okr.kr} />
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {(okr.krs || []).slice(0, 3).map((kr: any, j: number) => (
                                <div key={j} className="flex items-start gap-2.5 px-4 py-2.5">
                                    <span className="text-xs font-black uppercase text-zinc-300 mt-0.5 shrink-0 w-10">{kr.label}</span>
                                    <EditableField path={`goals_data.okrs.${i + 1}.krs.${j}.text`} className="text-xs text-zinc-600 leading-relaxed flex-1" placeholder={kr.text} />
                                    {kr.target && <span className="text-xs px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 text-zinc-400 font-mono shrink-0">{kr.target}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 12-Month Horizon */}
            <div className="bg-zinc-950 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#00CC6A]" />
                    <span className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold">Horizonte de 12 Meses</span>
                </div>
                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {horizonte12m.map((h, i) => (
                        <div key={i} className="px-5 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-bold text-sm">{h.title}</h4>
                                <span className="text-xs text-white/30 uppercase tracking-widest font-mono">{h.subtitle}</span>
                            </div>
                            <p className="text-[#00CC6A] text-xs font-bold mb-3">{h.metric}</p>
                            <div className="space-y-1.5 pt-3 border-t border-white/10">
                                {h.krs.map((kr, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/30 shrink-0 mt-1.5" />
                                        <span className="text-xs text-white/60 leading-snug">{kr}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
