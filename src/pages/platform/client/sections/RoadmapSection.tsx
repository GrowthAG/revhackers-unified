import React from 'react';
import { Calendar, Check } from 'lucide-react';

interface RoadmapSectionProps {
    plan: any;
}

export default function RoadmapSection({ plan }: RoadmapSectionProps) {
    const roadmap = plan.roadmap_data || {};
    const phases = roadmap.phases || [];

    return (
        <div className="py-20 space-y-24 text-left">
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-12 mb-12">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase mb-4">
                    Cronograma de Execução
                </h2>
                <p className="text-xl text-zinc-500 font-light max-w-3xl">
                    Um roadmap cirúrgico de 90 dias focado em resultados rápidos e escala sustentável.
                </p>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto relative">
                {/* Vertical Line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-zinc-100 hidden md:block"></div>

                {/* Phases */}
                <div className="space-y-16">
                    {phases.map((phase: any, index: number) => (
                        <div key={index} className={`relative flex flex-col md:flex-row items-center gap-12 ${index % 2 === 0 ? 'md:flex-row-reverse text-right' : 'text-left'}`}>

                            {/* Marker */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-zinc-100 bg-white flex items-center justify-center z-10 hidden md:flex shadow-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-revgreen"></div>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 w-full group">
                                <div className="bg-white border border-zinc-100 p-10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500">
                                    <p className="text-[10px] text-revgreen font-black uppercase tracking-[0.3em] mb-4">
                                        {phase.name}
                                    </p>
                                    <h3 className="text-2xl font-bold text-black tracking-tight mb-6">
                                        {phase.title}
                                    </h3>

                                    {/* Items */}
                                    <ul className={`space-y-4 ${index % 2 === 0 ? 'md:items-end' : ''} flex flex-col`}>
                                        {(phase.items || phase.tasks || phase.deliverables || []).map((item: any, itemIndex: number) => (
                                            <li key={itemIndex} className={`flex items-start gap-3 text-sm text-zinc-600 font-medium ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                                <div className="w-5 h-5 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-100 group-hover:border-revgreen/30">
                                                    <Check className="w-3 h-3 text-revgreen" />
                                                </div>
                                                <span>{typeof item === 'string' ? item : item?.task || item?.item || JSON.stringify(item)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex-1 hidden md:block italic text-zinc-100 font-black text-5xl select-none uppercase tracking-tighter">
                                Fase 0{index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Milestones */}
            <div className="pt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(roadmap.milestones || [
                        { cycle: 'Ciclo 1', title: 'Integração & Lab', desc: 'Protocolo de transição e setup técnico concluídos.' },
                        { cycle: 'Ciclo 2', title: 'Plano de Sucesso', desc: 'Kickoff estratégico e ativação de canais secundários.' },
                        { cycle: 'Ciclo 3', title: 'Expansão RevOps', desc: 'Revisão de ROI e escala de budget por performance.' },
                    ]).map((milestone: any, i: number) => (
                        <div key={i} className="p-10 bg-zinc-50 border border-zinc-100 rounded-3xl group hover:border-revgreen/30 transition-all shadow-sm">
                            <div className="text-3xl font-black text-zinc-200 group-hover:text-revgreen/20 transition-colors mb-4">{milestone.cycle}</div>
                            <h4 className="text-lg font-bold text-black tracking-tight mb-2">{milestone.title}</h4>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed">{milestone.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
