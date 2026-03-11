import React from 'react';
import { MonitorPlay, Trophy, CalendarCheck } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingTrainingSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 3"
                    titleLine1="Treinamento"
                    titleLine2="Da Operação"
                    description="O sistema construído na fase anterior agora é transicionado para quem fará ele girar: sua equipe."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-12 w-full flex flex-col items-center justify-start max-w-6xl mx-auto">
                <div className="text-center mb-16 max-w-4xl w-full">
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        <EditableField
                            placeholder="Tecnologia sem adoção de equipe é custo vazio."
                            path="onboarding_data.training.main_title"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        <EditableField
                            placeholder="Nosso treinamento não é teórico. Ele é focado em transformar a rotina real de operação."
                            path="onboarding_data.training.subtitle"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </p>
                    <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full mt-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full text-left">
                    {/* Masterclasses */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <MonitorPlay className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Masterclasses Gravadas"
                                path="onboarding_data.training.p1_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                            <EditableField
                                placeholder="Sessões técnicas passando por cada fase do funil e processo criado. Gravado em plataforma sob demanda para que novos membros do seu time no futuro também tenham acesso."
                                path="onboarding_data.training.p1_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* Roleplay */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <Trophy className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Avaliação & Casos de Uso"
                                path="onboarding_data.training.p2_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                            <EditableField
                                placeholder='Não mostramos só "onde clica". Criamos cenários de "Roleplay" das dificuldades do dia a dia da equipe para validarmos que absorveram a nova cultura.'
                                path="onboarding_data.training.p2_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* Go Live */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <CalendarCheck className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Go-Live: Dia de Virada"
                                path="onboarding_data.training.p3_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full text-zinc-900"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="A data oficial onde o sistema antigo (planilhas ou processos soltos) morre, e o novo começa a governar a sua empresa 100%."
                                path="onboarding_data.training.p3_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full text-zinc-500"
                            />
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] inline-block border-b border-[#00CC6A]/30 pb-0.5 mt-auto">The "No Turning Back" Point</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
