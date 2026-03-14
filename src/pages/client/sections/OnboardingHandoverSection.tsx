import React from 'react';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingHandoverSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 5"
                    titleLine1="Passagem"
                    titleLine2="De Bastão"
                    description="Marco zero da fase Sustentação. O projeto de Onboarding oficialmente acaba e a parceria de otimização de longo prazo começa."
                />

                <div className="mt-8 space-y-6">
                    {/* 2 cards side by side with deliverable tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Revisão Executiva do Trimestre"
                                    path="onboarding_data.handover.p1_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1 mb-4">
                                <EditableField
                                    placeholder="Reunião final de transição onde analisamos o atingimento dos OKRs propostos e validamos os novos baselines de CAC, Taxa de Conversão e Ciclo de Vendas pós-implementação."
                                    path="onboarding_data.handover.p1_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                            <div className="border-t border-zinc-100 pt-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A]">Entregável</span>
                                <span className="text-zinc-300 shrink-0 text-sm">/</span>
                                <span className="text-xs font-bold text-zinc-700">Relatório Trimestral de Resultados (QBR)</span>
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Tração e Foco em Crescimento"
                                    path="onboarding_data.handover.p2_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1 mb-4">
                                <EditableField
                                    placeholder="A partir deste ponto, o time consultivo deixa de falar sobre processos e setup e o foco da reunião semanal passa a ser única e exclusivamente testes de otimização e receita."
                                    path="onboarding_data.handover.p2_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                            <div className="border-t border-zinc-100 pt-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mudança</span>
                                <span className="text-zinc-300 shrink-0 text-sm">/</span>
                                <span className="text-xs font-bold text-zinc-700">De "Construtores" para "Otimizadores"</span>
                            </div>
                        </div>
                    </div>

                    {/* Editable accent callout */}
                    <div className="border-l-2 border-zinc-900 pl-5 py-2">
                        <p className="text-[15px] text-zinc-500 font-medium">
                            <EditableField
                                placeholder="No 90º dia não entregamos um relatório, entregamos uma máquina validada pronta para escalar."
                                path="onboarding_data.handover.main_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="pt-2 text-center">
                        <button className="px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 mx-auto">
                            Aprovar Planejamento e Iniciar
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
