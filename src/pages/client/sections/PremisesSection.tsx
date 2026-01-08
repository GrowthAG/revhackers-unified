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
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    🎯 Premissas do Projeto
                </h2>
                <p className="text-zinc-600">
                    Os 4 pilares que fundamentam nossa estratégia de crescimento
                </p>
            </div>

            {/* Pillars Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {pillars.map((pillar: any, index: number) => (
                    <div
                        key={index}
                        className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Pillar Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                                {getIcon(pillar.icon)}
                            </div>
                            <h3 className="text-xl font-semibold text-black">{pillar.name}</h3>
                        </div>

                        {/* Pillar Items */}
                        <ul className="space-y-2">
                            {pillar.items && pillar.items.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} className="flex items-start gap-2 text-sm text-zinc-700">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {pillars.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-zinc-500">Nenhuma premissa definida ainda.</p>
                </div>
            )}

            {/* Etapas Section */}
            <div className="mt-12 pt-12 border-t border-zinc-200">
                <h3 className="text-2xl font-semibold text-black mb-6">Etapas do Projeto</h3>
                <div className="grid md:grid-cols-5 gap-4">
                    {[
                        { number: '01', title: 'Encontrar processos', description: 'Mapeamento completo' },
                        { number: '02', title: 'Indicadores', description: 'Definição de KPIs' },
                        { number: '03', title: 'Resultados', description: 'Metas claras' },
                        { number: '04', title: 'Growth Hacking', description: 'Estratégias de crescimento' },
                        { number: '05', title: 'Objetivos', description: 'Alinhamento de expectativas' },
                    ].map((etapa, index) => (
                        <div key={index} className="text-center">
                            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                                {etapa.number}
                            </div>
                            <h4 className="font-semibold text-black mb-1">{etapa.title}</h4>
                            <p className="text-xs text-zinc-600">{etapa.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
