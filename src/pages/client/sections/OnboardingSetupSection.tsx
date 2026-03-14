import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingSetupSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    const steps = [
        {
            titlePath: 'onboarding_data.setup.p1_title',
            titlePlaceholder: 'Configuração Sistêmica',
            descPath: 'onboarding_data.setup.p1_desc',
            descPlaceholder: 'Construção de funis, customização de propriedades, restrições condicionais e automação de roteamento de leads para sua equipe.',
        },
        {
            titlePath: 'onboarding_data.setup.p2_title',
            titlePlaceholder: 'Fluxo de Dados',
            descPath: 'onboarding_data.setup.p2_desc',
            descPlaceholder: 'Ligação de todos os portais de entrada (Site, Landing Pages, Anúncios) caindo diretamente e qualificadamente dentro da ferramenta central.',
        },
        {
            titlePath: 'onboarding_data.setup.p3_title',
            titlePlaceholder: 'Rastreamento Avançado',
            descPath: 'onboarding_data.setup.p3_desc',
            descPlaceholder: 'Apenas rastrear cliques não é suficiente. Implementamos UTMs fixas e pixels otimizados para fechar o ciclo de onde veio a receita real.',
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 2"
                    titleLine1="Máquina"
                    titleLine2="Operacional"
                    description="Configuramos as fundações de rastreamento, processos e integrações antes do treinamento oficial."
                />

                <div className="mt-8 space-y-6">
                    {/* Status banner */}
                    <div className="bg-zinc-950 rounded-xl px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A]">Status</span>
                            <span className="text-sm text-white font-bold">100% Finalizado antes da Equipe Logar</span>
                        </div>
                        <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-[#00CC6A] rounded-full" />
                        </div>
                    </div>

                    {/* 3 steps as stacked rows inside a single card */}
                    <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
                        {steps.map((step, i) => {
                            return (
                                <div key={i} className="flex items-start gap-5 p-6">
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className="text-xs text-zinc-300 font-mono">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-zinc-900 mb-1">
                                            <EditableField
                                                placeholder={step.titlePlaceholder}
                                                path={step.titlePath}
                                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                            />
                                        </h3>
                                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                                            <EditableField
                                                placeholder={step.descPlaceholder}
                                                path={step.descPath}
                                                multiline
                                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                            />
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Editable accent callout */}
                    <div className="border-l-2 border-zinc-900 pl-5 py-2">
                        <p className="text-[15px] text-zinc-500 font-medium">
                            <EditableField
                                placeholder="Sem arquitetura correta, dados entram sujos e vendas são perdidas no limbo."
                                path="onboarding_data.setup.main_title"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
