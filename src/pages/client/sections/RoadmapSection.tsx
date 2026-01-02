import React from 'react';
import { Calendar } from 'lucide-react';

interface RoadmapSectionProps {
    plan: any;
}

export default function RoadmapSection({ plan }: RoadmapSectionProps) {
    const roadmap = plan.roadmap_data || {};
    const phases = roadmap.phases || [];

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    🗓️ Roadmap 90 Dias
                </h2>
                <p className="text-zinc-600">
                    Timeline detalhada dos primeiros 3 meses de execução
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-200"></div>

                {/* Phases */}
                <div className="space-y-8">
                    {phases.map((phase: any, index: number) => (
                        <div key={index} className="relative flex gap-6">
                            {/* Timeline Dot */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-black border-4 border-white flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Phase Content */}
                            <div className="flex-1 pb-8">
                                <div className="bg-white border border-zinc-200 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                                                {phase.name}
                                            </p>
                                            <h3 className="text-xl font-semibold text-black">
                                                {phase.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <ul className="space-y-2">
                                        {phase.items && phase.items.map((item: string, itemIndex: number) => (
                                            <li key={itemIndex} className="flex items-start gap-2 text-sm text-zinc-700">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {phases.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-zinc-500">Nenhuma fase definida ainda.</p>
                </div>
            )}

            {/* Key Milestones */}
            <div className="mt-12 pt-12 border-t border-zinc-200">
                <h3 className="text-2xl font-semibold text-black mb-6">🎯 Marcos Principais</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="text-3xl font-bold text-green-700 mb-2">Dia 10</div>
                        <h4 className="font-semibold text-black mb-1">Kick-Off Completo</h4>
                        <p className="text-sm text-zinc-600">
                            Planejamento aprovado e materiais coletados
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-3xl font-bold text-blue-700 mb-2">Dia 35</div>
                        <h4 className="font-semibold text-black mb-1">Go Live!</h4>
                        <p className="text-sm text-zinc-600">
                            Campanhas ativas e primeiros leads
                        </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="text-3xl font-bold text-purple-700 mb-2">Dia 90</div>
                        <h4 className="font-semibold text-black mb-1">Quarter Review</h4>
                        <p className="text-sm text-zinc-600">
                            Análise completa e otimizações
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
