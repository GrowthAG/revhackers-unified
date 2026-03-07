import React from 'react';
import { Building2, Search, Check, Target } from 'lucide-react';

interface PremisesSectionProps {
    plan: any;
}

export default function PremisesSection({ plan }: PremisesSectionProps) {
    const premises = plan.premises_data || {};
    const pillars = premises.pillars || [];

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'building': return <Building2 className="w-6 h-6 text-black" />;
            case 'search': return <Search className="w-6 h-6 text-black" />;
            default: return <Target className="w-6 h-6 text-black" />;
        }
    };

    return (
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    PREMISSAS
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    Premissas <span className="text-zinc-300">Estratégicas</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Os pilares fundamentais que sustentam a orquestração do crescimento — processos, tecnologia e previsibilidade.
                </p>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pillars.map((pillar: any, index: number) => (
                    <div
                        key={index}
                        className="bg-white border border-zinc-100 p-10 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                    >
                        {/* Pillar Header */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-revgreen/10 transition-all duration-500">
                                {React.cloneElement(getIcon(pillar.icon) as React.ReactElement, {
                                    className: "w-8 h-8 text-black transition-colors"
                                })}
                            </div>
                            <h3 className="text-2xl font-bold text-black tracking-tight">{pillar.name}</h3>
                        </div>

                        {/* Pillar Items */}
                        <ul className="space-y-4">
                            {pillar.items && pillar.items.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} className="flex items-start gap-4 text-zinc-600">
                                    <div className="w-5 h-5 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-100 group-hover:border-revgreen/30">
                                        <Check className="w-3 h-3 text-revgreen" />
                                    </div>
                                    <span className="text-sm font-medium leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Etapas do Projeto */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                    <div className="shrink-0 space-y-1">
                        <h3 className="text-lg font-bold text-zinc-900">Etapas do Projeto</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Roadmap de Execução</p>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                        {(premises.steps || [
                            { number: '01', title: 'Processos', description: 'Mapeamento e otimização' },
                            { number: '02', title: 'Indicadores', description: 'Métricas em tempo real' },
                            { number: '03', title: 'Metas', description: 'Objetivos de crescimento' },
                            { number: '04', title: 'Escala', description: 'Motor de execução' },
                        ]).map((etapa: any, index: number) => (
                            <div key={index} className="space-y-2">
                                <div className="text-3xl font-black text-zinc-200">{etapa.number || String(index + 1).padStart(2, '0')}</div>
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">{etapa.title}</h4>
                                <p className="text-[10px] text-zinc-400">{etapa.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
