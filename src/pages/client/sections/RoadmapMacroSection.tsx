import React from 'react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

export default function RoadmapSection({ plan }: { plan: any }) {
    const { isEditing } = usePlanEdit();
    
    // IA gera roadmap_phases e o backend traduz para a coluna jsonb roadmap_data.phases
    const rawPhases = plan?.roadmap_data?.phases || [
        { name: "Ciclo 01", title: "Setup Inicial", items: ["Alinhamento e acessos", "Configuração técnica"] },
        { name: "Ciclo 02", title: "Campanhas e Automações", items: ["Subir campanhas", "Validar automações"] },
        { name: "Ciclo 03", title: "Otimização", items: ["Revisão de ROI", "Ajuste de lances"] }
    ];

    const phases = rawPhases.map((p: any) => ({
        ...p,
        name: p.name || p.period || 'Dia N',
        title: p.title || 'Fase Omitida',
        items: p.items || p.tasks || []
    }));

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Execução Plena"
                    titleLine1="Cronograma"
                    titleLine2="Detalhado"
                    description="O desdobramento prático, documentando as tarefas exatas criadas a partir do diagnóstico."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-4 w-full flex flex-col justify-start max-w-5xl mx-auto">
                {/* Linha vertical principal */}
                <div className="relative border-l-2 border-zinc-100 ml-3 md:ml-4 space-y-16 pb-10 mt-8">
                    {phases.map((phase: any, index: number) => {
                        // Support for legacy tasks array inside roadmap_phases (which AI generated in some versions)
                        const itemsArray = (phase.items || phase.tasks || []);
                        
                        return (
                            <div key={index} className="relative pl-8 md:pl-12">
                                {/* Timeline Dot */}
                                <div className="absolute -left-2 top-2 w-4 h-4 bg-zinc-900 rounded-full ring-8 ring-white" />
                                
                                {/* Header da Fase */}
                                <div className="mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md inline-block">
                                        <EditableField
                                            placeholder="Período/Ciclo"
                                            path={`roadmap_data.phases.${index}.name`}
                                            className="bg-transparent text-[#00CC6A] focus:bg-white outline-none"
                                        />
                                    </span>
                                </div>
                                
                                <h3 className="text-3xl font-black text-zinc-900 mb-8 tracking-tight">
                                    <EditableField
                                        placeholder="Nome da Fase"
                                        path={`roadmap_data.phases.${index}.title`}
                                        className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                    />
                                </h3>

                                {/* Tasks / Items */}
                                <div className="space-y-4">
                                    {itemsArray.map((item: any, itemIndex: number) => {
                                        // Some old schemas used {task: "string", key: bool}. AI uses just strings.
                                        const textValue = typeof item === 'string' ? item : (item.task || JSON.stringify(item));
                                        
                                        return (
                                            <div key={itemIndex} className="flex items-start gap-4 group">
                                                <CheckCircle2 className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors shrink-0 mt-0.5" />
                                                <p className="text-[16px] font-medium text-zinc-600 leading-relaxed w-full">
                                                    <EditableField
                                                        placeholder="Ação tática..."
                                                        path={`roadmap_data.phases.${index}.items.${itemIndex}`}
                                                        className="bg-transparent focus:bg-zinc-50 outline-none w-full break-words"
                                                        multiline
                                                    />
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
