import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProjectionsSectionProps {
    plan: any;
}

export default function ProjectionsSection({ plan }: ProjectionsSectionProps) {
    const projections = plan.kpi_projections || {};

    // Minimalist KPI timeline
    const timeline = projections.timeline || [
        { quarter: 'Q1', month: '1-3', metrics: { campaigns: '3-5', automations: '8-12', integrations: '2-4' } },
        { quarter: 'Q2', month: '4-6', metrics: { campaigns: '6-10', automations: '15-20', integrations: '5-8' } },
        { quarter: 'Q3', month: '7-9', metrics: { campaigns: '10-15', automations: '20-25', integrations: '8-10' } },
        { quarter: 'Q4', month: '10-12', metrics: { campaigns: '15-20', automations: '25+', integrations: '12+' } },
    ];

    return (
        <div className="space-y-20">
            {/* Header - Apple Style */}
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                    Projeções de Execução
                </h2>
                <p className="text-lg text-zinc-500 font-light leading-relaxed">
                    Roadmap operacional baseado na implementação do plano estratégico.
                </p>
            </div>

            {/* Timeline - Ultra Minimalist */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-12 left-0 right-0 h-px bg-zinc-200" />

                <div className="grid grid-cols-4 gap-0">
                    {timeline.map((item, index) => (
                        <div key={index} className="relative pt-6">
                            {/* Quarter Dot */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    ${index === timeline.length - 1
                                        ? 'bg-black border-black'
                                        : 'bg-white border-zinc-300'}`}>
                                    {index === timeline.length - 1 && (
                                        <ArrowUpRight className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>

                            {/* Quarter Label */}
                            <div className="text-center mb-8 pt-8">
                                <span className="text-xs font-medium text-zinc-400 tracking-widest">
                                    MÊS {item.month}
                                </span>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-6 px-4">
                                <div className="text-center">
                                    <p className="text-3xl font-light text-black tracking-tight">
                                        {item.metrics.campaigns}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">
                                        Campanhas
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-light text-black tracking-tight">
                                        {item.metrics.automations}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">
                                        Automações
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-light text-black tracking-tight">
                                        {item.metrics.integrations}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">
                                        Integrações
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Note - Subtle */}
            <div className="text-center">
                <p className="text-sm text-zinc-400">
                    Métricas ajustáveis conforme evolução do projeto.
                </p>
            </div>
        </div>
    );
}
