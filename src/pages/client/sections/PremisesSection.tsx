import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

const defaultPillars = [
    { name: 'Contexto do Cliente', items: ['Segmento e modelo de vendas identificados', 'Ciclo de venda e ticket medio mapeados', 'Maturidade digital avaliada', 'Stakeholders e aprovadores definidos'] },
    { name: 'Diagnostico de Maturidade', items: ['CRM: avaliado, prioridade de implementacao definida', 'Canais de aquisicao: estrutura atual mapeada', 'Rastreamento: gaps identificados e plano de correcao', 'Automacoes: nivel atual vs. necessario para escalar'] },
    { name: 'Mercado & Concorrencia', items: ['Benchmark de CAC do segmento levantado', 'Top 3 concorrentes analisados', 'Oportunidades de diferenciacao identificadas', 'Tendencias de crescimento mapeadas'] },
    { name: 'Compromissos Mutuos', items: ['Reunioes mensais de RAPT: Revisao, Alinhamento, Prioridade, Tatica', 'Disponibilidade de materiais e aprovacoes em ate 48h', 'Acesso compartilhado a CRM, Ads e Analytics', 'Compartilhamento de resultados de vendas'] },
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
                    eyebrow="Base Estrategica"
                    titleLine1="Premissas do"
                    titleLine2="Projeto"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full bg-white space-y-6 flex flex-col justify-start">

                {/* Top 3 pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {lightPillars.map((pillar: any, i: number) => (
                        <div key={i} className="border border-zinc-200 rounded-xl overflow-hidden">
                            <div className="px-6 pt-6 pb-3 flex items-baseline justify-between">
                                <h3 className="text-base font-bold text-zinc-900 leading-tight">
                                    <EditableField
                                        path={`premises_data.pillars.${i}.name`}
                                        className="text-base font-bold"
                                        placeholder={pillar.name}
                                    />
                                </h3>
                                <span className="text-[10px] font-mono font-bold text-zinc-300">{String(i + 1).padStart(2, '0')}</span>
                            </div>

                            <div className="px-6 pb-6 pt-1">
                                <ul className="space-y-2.5">
                                    {(pillar.items || []).map((item: string, j: number) => (
                                        <li key={j} className="flex items-start gap-2.5">
                                            <span className="text-zinc-300 mt-[2px] shrink-0 text-sm leading-relaxed">/</span>
                                            <EditableField
                                                path={`premises_data.pillars.${i}.items.${j}`}
                                                className="text-[14px] leading-relaxed text-zinc-500 font-medium"
                                                placeholder={item}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compromissos Mutuos — dark block */}
                {darkPillar && (
                    <div className="bg-zinc-950 rounded-xl overflow-hidden">
                        <div className="flex items-baseline justify-between px-8 py-5 border-b border-zinc-800">
                            <h3 className="text-base font-bold text-white">
                                <EditableField
                                    path="premises_data.pillars.3.name"
                                    className="text-base font-bold text-white"
                                    placeholder={darkPillar.name}
                                />
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-zinc-600">04</span>
                        </div>
                        <div className={`grid grid-cols-1 ${(darkPillar.items || []).length > 2 ? 'md:grid-cols-2' : ''} gap-0`}>
                            {(darkPillar.items || []).map((item: string, j: number) => (
                                <div key={j} className="px-8 py-4 border-b border-zinc-800/50 last:border-b-0 flex items-start gap-3">
                                    <span className="text-zinc-600 mt-[1px] shrink-0 text-sm">/</span>
                                    <EditableField
                                        path={`premises_data.pillars.3.items.${j}`}
                                        className="text-[15px] leading-relaxed text-zinc-400 font-medium"
                                        placeholder={item}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
