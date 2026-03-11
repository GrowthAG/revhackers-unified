import React from 'react';
import { Search, PenLine, Repeat } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingAdoptionSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 4"
                    titleLine1="Adoção &"
                    titleLine2="Mapeamento"
                    description="O período de uso real onde monitoramos atritos da equipe com a ferramenta e comportamentos dos novos canais."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-12 w-full flex flex-col items-center justify-start max-w-6xl mx-auto">
                <div className="text-center mb-16 max-w-4xl w-full">
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        <EditableField
                            placeholder="Nenhum modelo sobrevive ileso ao campo de batalha."
                            path="onboarding_data.adoption.main_title"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        <EditableField
                            placeholder='As semanas de "Uso Pleno" servem para acharmos as quebras invisíveis do projeto que nem a sua, nem a nossa equipe poderia ter previsto.'
                            path="onboarding_data.adoption.subtitle"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </p>
                    <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full mt-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl mx-auto text-left">
                    {/* Shadowing */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <Search className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">
                            <EditableField
                                placeholder="Auditoria Silenciosa (Shadowing)"
                                path="onboarding_data.adoption.p1_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
                            <EditableField
                                placeholder='Verificamos se a equipe está preenchendo os campos vitais corretamente e onde estão "pulando etapas". Retreinamos individualmente sem alarde.'
                                path="onboarding_data.adoption.p1_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* Micro Ajustes */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <PenLine className="w-5 h-5 text-zinc-900 mb-5" />
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">
                            <EditableField
                                placeholder="Micro-Ajustes Estruturais"
                                path="onboarding_data.adoption.p2_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
                            <EditableField
                                placeholder="Adição ou remoção de etapas de funil extras ou propriedades que foram identificadas como vitais na prática (Ex: faltou mapear a tributação logo de cara)."
                                path="onboarding_data.adoption.p2_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>
                </div>

                {/* Call Out Banner - Clean */}
                <div className="mt-16 w-full max-w-4xl border-t border-zinc-100 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Repeat className="w-5 h-5 text-zinc-900" />
                        <h4 className="text-zinc-900 font-bold text-sm">Loop Rápido de Feedback</h4>
                    </div>
                    <p className="text-zinc-500 text-[13px] font-medium uppercase tracking-wider">Weekly 15-min com a liderança para reportar atritos</p>
                </div>
            </div>
        </div>
    );
}
