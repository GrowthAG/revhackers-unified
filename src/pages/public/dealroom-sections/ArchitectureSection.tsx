import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Megaphone, Bot, DatabaseZap, LineChart, CornerRightDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArchitectureSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    const defaultFlow = [
        { title: 'Aquisição B2B', subtitle: 'LinkedIn & Materiais Ricos', icon: 'Megaphone', delay: '0' },
        { title: 'Qualificação Híbrida', subtitle: 'Chatbots & SDR Agents', icon: 'Bot', delay: '100' },
        { title: 'Zorro CRM', subtitle: 'Conversão & Fechamento', icon: 'DatabaseZap', delay: '200' },
        { title: 'Customer Success', subtitle: 'Retenção & Upsell', icon: 'LineChart', delay: '300' }
    ];

    const flowSteps = liveData.architecture_flow || defaultFlow;

    const renderIcon = (name: string) => {
        switch(name) {
            case 'Megaphone': return <Megaphone className="w-8 h-8 text-[#00CC6A]" />;
            case 'Bot': return <Bot className="w-8 h-8 text-[#00CC6A]" />;
            case 'DatabaseZap': return <DatabaseZap className="w-8 h-8 text-[#00CC6A]" />;
            case 'LineChart': return <LineChart className="w-8 h-8 text-[#00CC6A]" />;
            default: return <DatabaseZap className="w-8 h-8 text-[#00CC6A]" />;
        }
    };

    return (
        <section className="w-full min-h-[100dvh] flex flex-col justify-center items-center bg-black p-8 lg:p-12 pt-16 pb-[150px] lg:pb-[150px] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            
            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">A ENGENHARIA DO FUNIL</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-6">
                        <EditableField path="crm_data.live_proposal.architecture_headline" placeholder="O Fluxo da Máquina de Vendas." />
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                        <EditableField path="crm_data.live_proposal.architecture_subheadline" multiline placeholder="A jornada exata pela qual passaremos cada lead qualificado gerado na sua operação." />
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 relative w-full lg:px-10">
                    
                    {/* Horizontal connecting line on Desktop */}
                    <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#00CC6A]/30 to-transparent z-0" />

                    {flowSteps.map((step: any, i: number) => (
                        <React.Fragment key={i}>
                            <div className="flex flex-col items-center text-center relative z-10 group w-full lg:w-48">
                                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,204,106,0.05)] group-hover:border-[#00CC6A]/40 group-hover:scale-105 transition-all duration-300">
                                    {renderIcon(step.icon)}
                                </div>
                                <h3 className="text-base font-black text-white uppercase tracking-widest mb-2">
                                    <EditableField path={`crm_data.live_proposal.architecture_flow.${i}.title`} placeholder="Nome da Etapa" />
                                </h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest max-w-[150px]">
                                    <EditableField path={`crm_data.live_proposal.architecture_flow.${i}.subtitle`} placeholder="Descrição Técnica" />
                                </p>
                            </div>

                            {/* Arrow divider */}
                            {i < flowSteps.length - 1 && (
                                <div className="hidden lg:flex shrink-0 items-center justify-center z-10 w-12 pb-16">
                                    <ArrowRight className="w-6 h-6 text-zinc-700" />
                                </div>
                            )}
                            {i < flowSteps.length - 1 && (
                                <div className="lg:hidden shrink-0 flex items-center justify-center z-10 h-10">
                                    <CornerRightDown className="w-6 h-6 text-zinc-700" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

            </div>
        </section>
    );
}
