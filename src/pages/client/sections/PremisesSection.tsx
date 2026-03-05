import React, { Fragment, cloneElement } from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Settings, Search, BarChart3, Handshake, Lock, ChevronRight, MessageCircle } from 'lucide-react';

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
        <div className="space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-400 uppercase tracking-[0.2em]">Base Estratégica</span>
                </div>
                <h2 className="text-2xl font-bold text-black tracking-tight">
                    Premissas do <span className="text-zinc-400">Projeto</span>
                </h2>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
                {pillars.slice(0, 4).map((pillar: any, i: number) => (
                    <div
                        key={i}
                        className={`group border p-4 transition-all duration-300 ${i === 0 ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-900'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-7 h-7 flex items-center justify-center ${i === 0 ? 'bg-[#00CC6A] text-black' : 'bg-zinc-950 text-white'}`}>
                                {cloneElement(getIcon(pillar.icon || 'target'), { className: 'w-3.5 h-3.5' })}
                            </div>
                            <span className={`text-xs font-mono ${i === 0 ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                0{i + 1}
                            </span>
                        </div>

                        <h3 className={`text-xs font-bold mb-2 ${i === 0 ? 'text-white' : 'text-black'}`}>
                            <EditableField
                                path={`premises_data.pillars.${i}.name`}
                                className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-black'}`}
                                placeholder={pillar.name}
                            />
                        </h3>

                        <ul className="space-y-1.5">
                            {(pillar.items || []).map((item: string, j: number) => (
                                <li key={j} className="flex items-start gap-2">
                                    <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-[#00CC6A]' : 'bg-zinc-900'}`} />
                                    <EditableField
                                        path={`premises_data.pillars.${i}.items.${j}`}
                                        className={`text-xs leading-relaxed ${i === 0 ? 'text-zinc-400' : 'text-zinc-600'}`}
                                        placeholder={item}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* 5 Etapas */}
            <div className="bg-zinc-950 p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium mb-4">
                    Nossa Abordagem em 5 Etapas
                </p>
                <div className="flex gap-0">
                    {[
                        { number: '01', title: 'Diagnóstico', sub: 'Mapeamento completo' },
                        { number: '02', title: 'Fundação', sub: 'Revenue Stack' },
                        { number: '03', title: 'Geração', sub: 'Demanda ativada' },
                        { number: '04', title: 'Conversão', sub: 'Pipeline' },
                        { number: '05', title: 'Escala', sub: 'Otimização' },
                    ].map((step, i, arr) => (
                        <Fragment key={i}>
                            <div className="flex-1 py-2 px-4 first:pl-0 last:pr-0">
                                <span className="text-xs text-zinc-600 font-mono block mb-1">{step.number}</span>
                                <h4 className="text-white text-xs font-semibold mb-0.5">{step.title}</h4>
                                <p className="text-xs text-zinc-500">{step.sub}</p>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="flex items-center text-zinc-700 px-1">
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
