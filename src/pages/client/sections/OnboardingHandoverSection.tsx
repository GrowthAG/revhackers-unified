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
                    eyebrow="Onboarding | Etapa 5"
                    titleLine1="Passagem"
                    titleLine2="De Bastão"
                    description="Marco zero da fase Sustentação. O projeto de Onboarding oficialmente acaba e a parceria de otimização de longo prazo começa."
                />

                <div className="mt-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Box 1: Revisão Executiva */}
                        <div className="flex flex-col relative group">
                            <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-zinc-100 hidden lg:block" />
                            <div className="mb-6 flex items-center justify-between">
                                <span className="inline-flex items-center justify-center h-8 px-4 rounded-full border border-zinc-200 text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                                    Fase 1
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight group-hover:text-[#00CC6A] transition-colors">
                                <EditableField
                                    placeholder="Revisão Executiva do Trimestre"
                                    path="onboarding_data.handover.p1_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[14px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="Reunião final de transição onde analisamos o atingimento dos OKRs propostos e validamos os novos baselines de CAC, Taxa de Conversão e Ciclo de Vendas pós-implementação."
                                    path="onboarding_data.handover.p1_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00CC6A] bg-[#00CC6A]/10 px-2 py-0.5 rounded">
                                    Entregável
                                </span>
                                <span className="text-[12px] font-bold text-zinc-800">Relatório Trimestral de Resultados (QBR)</span>
                            </div>
                        </div>

                        {/* Box 2: Tração */}
                        <div className="flex flex-col relative group">
                            <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-zinc-100 hidden lg:block" />
                            <div className="mb-6 flex items-center justify-between">
                                <span className="inline-flex items-center justify-center h-8 px-4 rounded-full border border-zinc-200 text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                                    Fase 2
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight group-hover:text-[#00CC6A] transition-colors">
                                <EditableField
                                    placeholder="Tração e Foco em Crescimento"
                                    path="onboarding_data.handover.p2_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[14px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="A partir deste ponto, o time consultivo deixa de falar sobre processos e setup e o foco da reunião semanal passa a ser única e exclusivamente testes de otimização e receita."
                                    path="onboarding_data.handover.p2_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded">
                                    Mudança
                                </span>
                                <span className="text-[12px] font-bold text-zinc-800">De "Construtores" para "Otimizadores"</span>
                            </div>
                        </div>
                    </div>

                    {/* Editable accent callout */}
                    <div className="mt-16 pt-8 border-t border-zinc-100 flex items-start gap-4 max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1 shrink-0">Insight</span>
                        <p className="text-[16px] text-zinc-800 font-bold leading-relaxed">
                            "
                            <EditableField
                                placeholder="No 90º dia não entregamos um relatório, entregamos uma máquina validada pronta para escalar."
                                path="onboarding_data.handover.main_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full inline"
                            />
                            "
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
