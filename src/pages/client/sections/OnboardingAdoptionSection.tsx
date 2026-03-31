import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingAdoptionSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding | Etapa 4"
                    titleLine1="Adoção &"
                    titleLine2="Mapeamento"
                    description="Período de uso real onde monitoramos atritos da equipe com a ferramenta e comportamentos dos novos canais."
                />

                <div className="mt-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Column 1: Auditoria */}
                        <div className="flex flex-col group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-zinc-100 hidden lg:block" />
                            <div className="mb-6">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-400 font-mono text-tiny font-bold">
                                    01
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                                <EditableField
                                    placeholder="Auditoria Silenciosa"
                                    path="onboarding_data.adoption.p1_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                <EditableField
                                    placeholder="Verificamos se a equipe está preenchendo os campos vitais corretamente e onde estão pulando etapas. Retreinamos individualmente sem alarde."
                                    path="onboarding_data.adoption.p1_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>

                        {/* Column 2: Ajustes */}
                        <div className="flex flex-col group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-zinc-100 hidden lg:block" />
                            <div className="mb-6">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-400 font-mono text-tiny font-bold">
                                    02
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                                <EditableField
                                    placeholder="Micro-Ajustes Estruturais"
                                    path="onboarding_data.adoption.p2_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                <EditableField
                                    placeholder="Adição ou remoção de etapas de funil extras ou propriedades que foram identificadas como vitais na prática."
                                    path="onboarding_data.adoption.p2_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 space-y-8">
                        {/* Ciclo de Retorno Banner (Sleek) */}
                        <div className="bg-zinc-50 border border-zinc-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-200 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-2 h-2 bg-[#00CC6A] shadow-[0_0_8px_rgba(0,204,106,0.6)]" />
                                <div>
                                    <h4 className="text-body text-zinc-900 font-bold mb-1">Ciclo Rápido de Retorno</h4>
                                    <p className="text-mini text-zinc-500 font-medium">Reunião semanal de 15min com a liderança para reportar atritos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xxs font-black uppercase tracking-[0.2em] text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 ">
                                    Semanal
                                </span>
                            </div>
                        </div>

                        {/* Editable accent callout - Minimalist Quote */}
                        <div className="pt-4 border-t border-zinc-100 flex items-start gap-4">
                            <span className="text-xxs font-black uppercase tracking-[0.2em] text-zinc-400 mt-1 shrink-0">Insight</span>
                            <p className="text-body text-zinc-800 font-medium leading-relaxed max-w-2xl">
                                "
                                <EditableField
                                    placeholder="Nenhum modelo sobrevive ileso ao campo de batalha."
                                    path="onboarding_data.adoption.main_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full inline"
                                />
                                "
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
