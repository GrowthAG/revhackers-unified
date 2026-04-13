import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { CheckCircle2, Workflow } from 'lucide-react';

export default function RoadmapSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};

    const phases = liveData.roadmap || [
        {
            phase: 'Engenharia Comercial',
            duration: 'Semana 1-2',
            description: 'Refatoração da máquina de vendas e arquitetura do ecossistema Funnels.',
            deliverables: ['Mapeamento de Funil', 'Setup de Pipelines']
        },
        {
            phase: 'Tração & Volume',
            duration: 'Semana 3-5',
            description: 'Lançamento de campanhas otimizadas e captura de Leads qualificados.',
            deliverables: ['Copys de Anúncio', 'Landing Pages de Alta Conversão']
        }
    ];

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-950 text-white p-8 lg:px-12 pt-20 pb-[200px] lg:pb-[200px] relative">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                
                <div className="text-center mb-24 max-w-2xl">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">PLANO DE AÇÃO</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-6">
                        <EditableField path="crm_data.live_proposal.roadmap_headline" placeholder="Roadmap de Execução Oficial" />
                    </h2>
                    <p className="text-sm font-light text-zinc-400">
                        <EditableField path="crm_data.live_proposal.roadmap_subheadline" multiline placeholder="Cronograma técnico da transformação comercial. Etapa por etapa." />
                    </p>
                </div>

                <div className="w-full relative">
                    {/* The Center Line */}
                    <div className="absolute left-[24px] lg:left-1/2 top-4 bottom-4 w-px bg-zinc-800 lg:-translate-x-1/2" />

                    {phases.map((phase: any, idx: number) => {
                        const isEven = idx % 2 === 0;
                        return (
                            <div key={idx} className="relative w-full mb-12 lg:mb-16">
                                
                                {/* DESKTOP LAYOUT (lg+) */}
                                <div className="hidden lg:grid grid-cols-[1fr_48px_1fr] w-full items-center">
                                    
                                    {/* Left Column */}
                                    <div className={`w-full ${isEven ? 'pr-12 xl:pr-16 flex justify-end' : ''}`}>
                                        {isEven && (
                                            <div className="w-full max-w-[420px] bg-[#09090b] p-8 border border-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden text-left shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                                <div className="absolute top-0 right-0 w-1 h-full bg-[#00CC6A]/30 group-hover:bg-[#00CC6A]/80 transition-colors" />
                                                
                                                <span className="inline-block text-xxs font-black tracking-widest uppercase text-zinc-400 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.duration`} placeholder="Ex: Mês 1" />
                                                </span>
                                                
                                                <h4 className="text-xl font-bold text-white mb-3">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.phase`} placeholder="Nome da Fase" />
                                                </h4>
                                                
                                                <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mb-6">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.description`} multiline placeholder="Visão executiva do que será construído." />
                                                </p>

                                                {phase.deliverables && (
                                                    <div className="space-y-3 pt-6 border-t border-zinc-900">
                                                        {phase.deliverables.map((item: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                                                                <CheckCircle2 className="w-4 h-4 text-[#00CC6A] shrink-0 mt-0.5" />
                                                                <span><EditableField path={`crm_data.live_proposal.roadmap.${idx}.deliverables.${i}`} placeholder="Entregável" /></span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Center Column (Node) */}
                                    <div className="w-[48px] h-[48px] mx-auto bg-zinc-950 flex items-center justify-center z-10 relative">
                                        <div className="w-8 h-8 bg-zinc-900 text-zinc-300 flex items-center justify-center text-sm font-black border border-zinc-700 rounded-full shadow-[0_0_15px_rgba(0,204,106,0.1)]">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className={`w-full ${!isEven ? 'pl-12 xl:pl-16 flex justify-start' : ''}`}>
                                        {!isEven && (
                                            <div className="w-full max-w-[420px] bg-[#09090b] p-8 border border-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden text-left shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#00CC6A]/30 group-hover:bg-[#00CC6A]/80 transition-colors" />
                                                
                                                <span className="inline-block text-xxs font-black tracking-widest uppercase text-zinc-400 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.duration`} placeholder="Ex: Mês 1" />
                                                </span>
                                                
                                                <h4 className="text-xl font-bold text-white mb-3">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.phase`} placeholder="Nome da Fase" />
                                                </h4>
                                                
                                                <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mb-6">
                                                    <EditableField path={`crm_data.live_proposal.roadmap.${idx}.description`} multiline placeholder="Visão executiva do que será construído." />
                                                </p>

                                                {phase.deliverables && (
                                                    <div className="space-y-3 pt-6 border-t border-zinc-900">
                                                        {phase.deliverables.map((item: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                                                                <CheckCircle2 className="w-4 h-4 text-[#00CC6A] shrink-0 mt-0.5" />
                                                                <span><EditableField path={`crm_data.live_proposal.roadmap.${idx}.deliverables.${i}`} placeholder="Entregável" /></span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* MOBILE LAYOUT (<lg) */}
                                <div className="lg:hidden flex flex-col pl-[60px] relative">
                                    <div className="absolute left-[8px] top-6 z-10 w-8 h-8 bg-zinc-900 text-zinc-300 flex items-center justify-center text-sm font-black border border-zinc-700 rounded-full shadow-sm">
                                        {idx + 1}
                                    </div>

                                    <div className="w-full bg-[#09090b] p-6 border border-zinc-800 relative text-left shadow-sm">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00CC6A]/30" />
                                        
                                        <span className="inline-block text-xxs font-black tracking-widest uppercase text-zinc-400 mb-3 bg-zinc-900 border border-zinc-800 px-3 py-1">
                                            <EditableField path={`crm_data.live_proposal.roadmap.${idx}.duration`} placeholder="Ex: Mês 1" />
                                        </span>
                                        <h4 className="text-lg font-bold text-white mb-2">
                                            <EditableField path={`crm_data.live_proposal.roadmap.${idx}.phase`} placeholder="Nome da Fase" />
                                        </h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed mb-6 block">
                                            <EditableField path={`crm_data.live_proposal.roadmap.${idx}.description`} multiline placeholder="Visão executiva do que será construído nesta etapa." />
                                        </p>

                                        {phase.deliverables && (
                                            <div className={`space-y-3 pt-5 border-t border-zinc-900`}>
                                                {phase.deliverables.map((item: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 text-xs text-zinc-400">
                                                        <CheckCircle2 className="w-3 h-3 text-[#00CC6A] shrink-0 mt-0.5" />
                                                        <span><EditableField path={`crm_data.live_proposal.roadmap.${idx}.deliverables.${i}`} placeholder="Entregável" /></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}

                    <div className="relative flex justify-center pt-8 z-10 lg:pl-0 pl-[4px]">
                        <div className="bg-zinc-950 p-2">
                            <div className="w-12 h-12 bg-[#00CC6A]/10 text-[#00CC6A] flex items-center justify-center border border-[#00CC6A]/20 rounded-full">
                                <Workflow className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
