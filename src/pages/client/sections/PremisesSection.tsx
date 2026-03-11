import React, { Fragment, cloneElement } from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Settings, Search, BarChart3, Handshake, Lock, ChevronRight, MessageCircle } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Icon resolver ──────────────────────────────────────────────────────────
function getIcon(iconName: string) {
    switch (iconName) {
        case 'building': return <Settings className="w-5 h-5" />;
        case 'settings': return <Settings className="w-5 h-5" />;
        case 'search': return <Search className="w-5 h-5" />;
        case 'handshake': return <Handshake className="w-5 h-5" />;
        case 'lock': return <Lock className="w-5 h-5" />;
        case 'chart': return <BarChart3 className="w-5 h-5" />;
        case 'message-circle': return <MessageCircle className="w-5 h-5" />;
        default: return <Settings className="w-5 h-5" />;
    }
}

// ── Default Pillars ────────────────────────────────────────────────────────
const defaultPillars = [
    {
        icon: 'building',
        name: 'Contexto do Cliente',
        items: [
            'Segmento e modelo de vendas identificados',
            'Ciclo de venda e ticket médio mapeados',
            'Maturidade digital avaliada',
            'Stakeholders e aprovadores definidos',
        ],
    },
    {
        icon: 'search',
        name: 'Diagnóstico de Maturidade',
        items: [
            'CRM: avaliado — prioridade de implementação definida',
            'Canais de aquisição: estrutura atual mapeada',
            'Rastreamento: gaps identificados e plano de correção',
            'Automações: nível atual vs. necessário para escalar',
        ],
    },
    {
        icon: 'chart',
        name: 'Mercado & Concorrência',
        items: [
            'Benchmark de CAC do segmento levantado',
            'Top 3 concorrentes analisados em tráfego e posicionamento',
            'Oportunidades de diferenciação identificadas',
            'Tendências de crescimento do setor mapeadas',
        ],
    },
    {
        icon: 'handshake',
        name: 'Compromissos Mútuos',
        items: [
            'Reuniões mensais de RAPT — Revisão, Alinhamento, Prioridade, Tática',
            'Disponibilidade de materiais e aprovações em até 48h',
            'Acesso compartilhado a CRM, Ads e Analytics',
            'Compartilhamento de resultados de vendas para fechar o loop de atribuição',
        ],
    },
];

export default function PremisesSection({ plan }: { plan: any }) {
    let pillars = (plan.premises_data || {}).pillars || [];
    if (pillars.length < 4) {
        pillars = [...pillars, ...defaultPillars.slice(pillars.length)];
    }

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Base Estratégica"
                    titleLine1="Premissas do"
                    titleLine2="Projeto"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full bg-white space-y-8 flex flex-col justify-start">

                {/* 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pillars.slice(0, 4).map((pillar: any, i: number) => {
                        const isQuotePillar = pillar.name === 'Observações do Cliente' || pillar.name === 'Dores Originais';
                        const cardBg = isQuotePillar ? 'bg-white border-zinc-200 border-2 shadow-sm relative overflow-hidden' : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm';
                        const titleColor = 'text-zinc-900';
                        const iconBg = isQuotePillar ? 'bg-zinc-50 text-[#00CC6A] border border-zinc-200' : (i === 0 ? 'bg-[#00CC6A] text-white border-none' : 'bg-zinc-50 text-zinc-900 border border-zinc-200');
                        const itemBg = isQuotePillar ? 'bg-zinc-50 border border-zinc-100 mt-2 shadow-sm' : '';
                        const bulletColor = 'bg-[#00CC6A]';
                        const textColor = 'text-zinc-600 font-medium';

                        return (
                            <div
                                key={i}
                                className={`group border p-8 rounded-2xl shadow-sm transition-all duration-300 ${cardBg}`}
                            >
                                {isQuotePillar && (
                                     <span className="absolute -top-4 -right-2 text-8xl text-black/5 font-serif leading-none rotate-6 pointer-events-none">"</span>
                                )}

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-inner ${iconBg}`}>
                                            {cloneElement(getIcon(isQuotePillar ? 'message-circle' : pillar.icon || 'target'), { className: 'w-6 h-6' })}
                                        </div>
                                        {isQuotePillar && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A]">Transcrição Real</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-mono font-black text-zinc-300">
                                        0{i + 1}
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-xl font-bold mb-4 leading-tight ${titleColor}`}>
                                        <EditableField
                                            path={`premises_data.pillars.${i}.name`}
                                            className={`text-xl font-bold w-full truncate`}
                                            placeholder={pillar.name}
                                        />
                                    </h3>

                                    <ul className="space-y-3">
                                        {(pillar.items || []).map((item: string, j: number) => (
                                            <li key={j} className={`flex items-start gap-3 ${isQuotePillar ? `${itemBg} p-4 rounded-xl` : ''}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${bulletColor}`} />
                                                {isQuotePillar ? (
                                                    <span className="text-xl font-serif italic text-amber-950/90 leading-tight">
                                                        "{item}"
                                                    </span>
                                                ) : (
                                                    <EditableField
                                                        path={`premises_data.pillars.${i}.items.${j}`}
                                                        className={`text-base leading-relaxed ${textColor}`}
                                                        placeholder={item}
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 5 Etapas */}
                <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm mt-4">
                    <p className="text-[11px] text-zinc-400 uppercase tracking-[0.3em] font-black mb-6">
                        Nossa Abordagem em 5 Etapas
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        {[
                            { number: '01', title: 'Diagnóstico', sub: 'Mapeamento completo' },
                            { number: '02', title: 'Fundação', sub: 'Revenue Stack' },
                            { number: '03', title: 'Geração', sub: 'Demanda ativada' },
                            { number: '04', title: 'Conversão', sub: 'Pipeline' },
                            { number: '05', title: 'Escala', sub: 'Otimização' },
                        ].map((step, i, arr) => (
                            <Fragment key={i}>
                                <div className="flex-1 py-2 px-4 first:pl-0 last:pr-0">
                                    <span className="text-sm text-zinc-400 font-mono font-black block mb-2">{step.number}</span>
                                    <h4 className="text-zinc-900 text-base font-bold mb-1">{step.title}</h4>
                                    <p className="text-sm text-zinc-500 font-medium">{step.sub}</p>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden md:flex items-center text-zinc-300 px-2">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
