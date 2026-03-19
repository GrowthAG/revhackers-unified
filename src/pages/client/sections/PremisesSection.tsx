import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

const defaultPillars = [
    { name: 'Contexto do Cliente', items: ['Segmento e modelo de vendas identificados', 'Ciclo de venda e ticket médio mapeados', 'Maturidade digital avaliada', 'Stakeholders e aprovadores definidos'] },
    { name: 'Diagnóstico de Maturidade', items: ['CRM: avaliado, prioridade de implementação definida', 'Canais de aquisição: estrutura atual mapeada', 'Rastreamento: gaps identificados e plano de correção', 'Automações: nível atual vs. necessário para escalar'] },
    { name: 'Mercado & Concorrência', items: ['Benchmark de CAC do segmento levantado', 'Top 3 concorrentes analisados', 'Oportunidades de diferenciação identificadas', 'Tendências de crescimento mapeadas'] },
    { name: 'Compromissos Mútuos', items: ['Reuniões mensais de RAPT: Revisão, Alinhamento, Prioridade, Tática', 'Disponibilidade de materiais e aprovações em até 48h', 'Acesso compartilhado a CRM, Ads e Analytics', 'Compartilhamento de resultados de vendas'] },
];

export default function PremisesSection({ plan }: { plan: any }) {
    let pillars = (plan.premises_data || {}).pillars || [];
    if (pillars.length < 4) {
        pillars = [...pillars, ...defaultPillars.slice(pillars.length)];
    }

    const lightPillars = pillars.slice(0, 3);
    const darkPillar = pillars[3];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Base Estratégica"
                    titleLine1="Premissas do"
                    titleLine2="Projeto"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row shadow-sm border border-zinc-200/60 rounded-xl overflow-hidden min-h-[500px]">
                    
                    {/* Left Side - 3 Light Pillars */}
                    <div className="w-full lg:w-2/3 bg-white p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-zinc-200/60 flex flex-col justify-between">
                        <div className="space-y-10">
                            {lightPillars.map((pillar: any, i: number) => (
                                <div key={i} className="flex gap-6 group">
                                    <span className="text-[10px] font-mono font-bold text-zinc-300 mt-1 shrink-0 group-hover:text-zinc-400 transition-colors">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="text-[16px] font-bold text-zinc-900 mb-4 tracking-tight">
                                            <EditableField
                                                path={`premises_data.pillars.${i}.name`}
                                                placeholder={pillar.name}
                                            />
                                        </h3>
                                        <ul className="space-y-3">
                                            {(pillar.items || []).map((item: string, j: number) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    <span className="text-zinc-300 mt-[2px] shrink-0 text-[11px] leading-relaxed">/</span>
                                                    <EditableField
                                                        path={`premises_data.pillars.${i}.items.${j}`}
                                                        className="text-[15px] leading-relaxed text-zinc-500 font-medium group-hover:text-zinc-700 transition-colors"
                                                        placeholder={item}
                                                        multiline
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Dark Pillar (Compromissos) */}
                    {darkPillar && (
                        <div className="w-full lg:w-1/3 bg-[#0A0A0A] p-8 md:p-12 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-2 h-2 rounded-full bg-[#00CC6A]" />
                                    <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#00CC6A]">
                                        <EditableField
                                            path="premises_data.pillars.3.name"
                                            placeholder={darkPillar.name}
                                        />
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    {(darkPillar.items || []).map((item: string, j: number) => (
                                        <div key={j} className="flex gap-4 group">
                                            <span className="text-[10px] font-mono font-bold text-zinc-700 mt-1 shrink-0 group-hover:text-[#00CC6A]/50 transition-colors">
                                                {String(j + 1).padStart(2, '0')}
                                            </span>
                                            <EditableField
                                                path={`premises_data.pillars.3.items.${j}`}
                                                className="text-[15px] leading-[1.8] text-zinc-400 font-medium group-hover:text-white transition-colors"
                                                placeholder={item}
                                                multiline
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
