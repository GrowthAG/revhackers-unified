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

                <div className="mt-8 space-y-6">
                    {/* 2 large cards side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-xs text-zinc-300 font-mono">01</span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Auditoria Silenciosa"
                                    path="onboarding_data.adoption.p1_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="Verificamos se a equipe está preenchendo os campos vitais corretamente e onde estão pulando etapas. Retreinamos individualmente sem alarde."
                                    path="onboarding_data.adoption.p1_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>

                        <div className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-xs text-zinc-300 font-mono">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                <EditableField
                                    placeholder="Micro-Ajustes Estruturais"
                                    path="onboarding_data.adoption.p2_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1">
                                <EditableField
                                    placeholder="Adição ou remoção de etapas de funil extras ou propriedades que foram identificadas como vitais na prática."
                                    path="onboarding_data.adoption.p2_desc"
                                    multiline
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </p>
                        </div>
                    </div>

                    {/* Ciclo de Retorno Banner (dark) */}
                    <div className="bg-zinc-950 rounded-xl px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h4 className="text-sm text-white font-bold">Ciclo Rápido de Retorno</h4>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Reunião semanal de 15min com a liderança para reportar atritos</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A] shrink-0">Semanal</span>
                    </div>

                    {/* Editable accent callout */}
                    <div className="border-l-2 border-zinc-900 pl-5 py-2">
                        <p className="text-[15px] text-zinc-500 font-medium">
                            <EditableField
                                placeholder="Nenhum modelo sobrevive ileso ao campo de batalha."
                                path="onboarding_data.adoption.main_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
