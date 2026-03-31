import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
    clientName?: string;
}

export default function OnboardingTrainingSection({ plan, clientName = "Cliente" }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    const getFirstName = (name: string) => name.split(' ')[0];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding - Etapa 3"
                    titleLine1="Treinamento"
                    titleLine2="Da Operação"
                    description="O sistema construído na fase anterior agora é transicionado para quem fará ele girar: sua equipe."
                />

                <div className="mt-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        
                        {/* Left Side: Context & Milestone */}
                        <div className="lg:col-span-5 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-[2px] bg-[#00CC6A] mb-8" />
                                <h3 className="text-2xl font-black text-zinc-900 leading-tight tracking-tight mb-4">
                                    <EditableField
                                        placeholder="Tecnologia sem adoção de equipe é custo vazio."
                                        path="onboarding_data.training.main_title"
                                        className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        multiline
                                    />
                                </h3>
                                <p className="text-mini text-zinc-500 leading-[1.6] font-medium mb-8">
                                    Com as fundações prontas, entramos no treinamento imersivo. 
                                    O objetivo não é ensinar a clicar em botões, mas sim mudar 
                                    o comportamento e a cultura da operação comercial da {getFirstName(clientName)}.
                                </p>
                            </div>

                            {/* O Ponto Sem Retorno - Sleek Milestone */}
                            <div className="bg-zinc-950 p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00CC6A]/10 blur-3xl transform translate-x-10 -translate-y-10" />
                                
                                <span className="text-xxs font-black uppercase tracking-[0.2em] text-[#00CC6A] block mb-4">
                                    Marco Zero • O Ponto Sem Retorno
                                </span>
                                
                                <h4 className="text-xl font-bold text-white mb-3">
                                    <EditableField
                                        placeholder="Dia da Virada"
                                        path="onboarding_data.training.p3_title"
                                        className="bg-transparent text-white focus:bg-zinc-800 outline-none w-full"
                                    />
                                </h4>
                                
                                <p className="text-mini text-zinc-400 leading-[1.6] font-medium">
                                    <EditableField
                                        placeholder="A data oficial onde o sistema antigo (planilhas ou processos soltos) morre, e o novo começa a governar a sua empresa 100%."
                                        path="onboarding_data.training.p3_desc"
                                        multiline
                                        className="bg-transparent text-zinc-400 focus:bg-zinc-800 outline-none w-full"
                                    />
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Training Tracks */}
                        <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
                            
                            {/* Track 1 */}
                            <div className="flex gap-6 relative">
                                <div className="absolute left-3.5 top-10 bottom-[-40px] w-[1px] bg-zinc-100" />
                                <div className="shrink-0 relative z-10 bg-white pt-1">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 text-xxs font-bold text-zinc-400 font-mono">
                                        01
                                    </span>
                                </div>
                                <div className="flex-1 pb-2">
                                    <h4 className="text-reading font-bold text-zinc-900 mb-2 tracking-tight">
                                        <EditableField
                                            placeholder="Aulas Técnicas Gravadas"
                                            path="onboarding_data.training.p1_title"
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </h4>
                                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                        <EditableField
                                            placeholder="Sessões técnicas passando por cada fase do funil e processo criado. Gravado em plataforma sob demanda para que novos membros do time também tenham acesso."
                                            path="onboarding_data.training.p1_desc"
                                            multiline
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </p>
                                </div>
                            </div>

                            {/* Track 2 */}
                            <div className="flex gap-6 relative">
                                <div className="shrink-0 relative z-10 bg-white pt-1">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-[#00CC6A] bg-[#00CC6A]/5 text-[#00CC6A] text-xxs font-bold font-mono">
                                        02
                                    </span>
                                </div>
                                <div className="flex-1 pb-2">
                                    <h4 className="text-reading font-bold text-zinc-900 mb-2 tracking-tight">
                                        <EditableField
                                            placeholder="Avaliação e Simulação Prática"
                                            path="onboarding_data.training.p2_title"
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </h4>
                                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                        <EditableField
                                            placeholder="Não mostramos só onde clicar. Criamos cenários de simulação das dificuldades do dia a dia da equipe para validarmos que absorveram a nova cultura."
                                            path="onboarding_data.training.p2_desc"
                                            multiline
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
