import React from 'react';
import { Flag, Rocket, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingHandoverSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 5"
                    titleLine1="O Handover"
                    titleLine2="Passagem de Bastão"
                    description="O marco zero da fase Sustentação. Onde o projeto de Onboarding oficialmente acaba e a parceria de Longo Prazo de otimização começa."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-12 w-full flex flex-col items-center justify-start max-w-6xl mx-auto">
                <div className="text-center mb-16 max-w-4xl w-full">
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        <EditableField
                            placeholder="Do Onboarding Tático para a Estratégia Contínua."
                            path="onboarding_data.handover.main_title"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        <EditableField
                            placeholder="No 90º dia não entregamos um relatório, entregamos uma máquina validada pronta para escalar."
                            path="onboarding_data.handover.subtitle"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </p>
                    <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full mt-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl mx-auto text-left">
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <Flag className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Revisão Executiva do Quarter"
                                path="onboarding_data.handover.p1_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-6">
                            <EditableField
                                placeholder="Reunião final de transição onde analisamos o atingimento dos OKRs propostos e validamos os novos baselines de CAC, Taxa de Conversão e Ciclo de Vendas pós-implementação."
                                path="onboarding_data.handover.p1_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">Entregável</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="text-xs font-bold text-zinc-700">The QBR (Quarterly Business Review) Deck</span>
                        </div>
                    </div>

                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <Rocket className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Tração & Foco em Growth"
                                path="onboarding_data.handover.p2_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-6">
                            <EditableField
                                placeholder='A partir deste ponto, o time consultivo deixa de falar sobre "Processos e Setup" e o foco da nossa reunião semanal passa a ser única e exclusivamente testes de Otimização e Receita.'
                                path="onboarding_data.handover.p2_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mudança</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="text-xs font-bold text-zinc-700">De "Construtores" para "Otimizadores"</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-zinc-100 text-center w-full">
                    <button className="px-8 py-4 bg-zinc-900 text-white rounded-lg font-bold flex items-center justify-center gap-3 mx-auto hover:bg-[#00CC6A] hover:text-black transition-colors focus:outline-none">
                        Aprovar Planejamento e Iniciar
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
