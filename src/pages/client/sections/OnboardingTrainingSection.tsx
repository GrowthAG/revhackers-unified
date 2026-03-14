import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingTrainingSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 3"
                    titleLine1="Treinamento"
                    titleLine2="Da Operação"
                    description="O sistema construído na fase anterior agora é transicionado para quem fará ele girar: sua equipe."
                />

                <div className="mt-8 space-y-6">
                    {/* 3 cards: primeiros dois claros, último escuro (marco de virada) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs text-zinc-300 font-mono">01</span>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Aulas Técnicas Gravadas"
                                    path="onboarding_data.training.p1_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="Sessões técnicas passando por cada fase do funil e processo criado. Gravado em plataforma sob demanda para que novos membros do time também tenham acesso."
                                    path="onboarding_data.training.p1_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs text-zinc-300 font-mono">02</span>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Avaliação e Simulação Prática"
                                    path="onboarding_data.training.p2_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="Não mostramos só onde clicar. Criamos cenários de simulação das dificuldades do dia a dia da equipe para validarmos que absorveram a nova cultura."
                                    path="onboarding_data.training.p2_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>

                        {/* Card 3 — Dark (Dia da Virada) */}
                        <div className="bg-zinc-950 rounded-xl p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs text-zinc-600 font-mono">03</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                <EditableField
                                    placeholder="Dia da Virada"
                                    path="onboarding_data.training.p3_title"
                                    className="bg-transparent text-white focus:bg-zinc-800 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-400 leading-relaxed font-medium flex-1 mb-4">
                                <EditableField
                                    placeholder="A data oficial onde o sistema antigo (planilhas ou processos soltos) morre, e o novo começa a governar a sua empresa 100%."
                                    path="onboarding_data.training.p3_desc"
                                    multiline
                                    className="bg-transparent text-zinc-400 focus:bg-zinc-800 outline-none w-full"
                                />
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md inline-block self-start">
                                O Ponto Sem Retorno
                            </span>
                        </div>
                    </div>

                    {/* Editable accent callout */}
                    <div className="border-l-2 border-zinc-900 pl-5 py-2">
                        <p className="text-[15px] text-zinc-500 font-medium">
                            <EditableField
                                placeholder="Tecnologia sem adoção de equipe é custo vazio."
                                path="onboarding_data.training.main_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
