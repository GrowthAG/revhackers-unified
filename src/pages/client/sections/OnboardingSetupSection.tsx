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
                    eyebrow="Onboarding | Etapa 2"
                    titleLine1="Máquina"
                    titleLine2="Operacional"
                    description="Configuramos as fundações de rastreamento, processos e integrações antes do treinamento oficial."
                />

                <div className="mt-8 space-y-12">
                    
                    {/* Status banner - Sleek & Modern */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                        <div>
                            <span className="text-xxs font-black uppercase tracking-[0.2em] text-[#00CC6A] block mb-1">Status de Implementação</span>
                            <span className="text-body font-bold text-zinc-900 tracking-tight">100% Finalizado antes da Equipe Logar</span>
                        </div>
                        <div className="flex-1 max-w-sm hidden md:block">
                            <div className="h-[3px] w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00CC6A] rounded-full w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Steps - Clean Vertical List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
                        {steps.map((step, i) => {
                            return (
                                <div key={i} className="flex flex-col group">
                                    <div className="mb-5 flex items-center justify-between">
                                        <span className="text-tiny font-black text-zinc-300 font-mono tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                                        <div className="w-12 h-[1px] bg-zinc-200 group-hover:w-24 group-hover:bg-[#00CC6A] transition-all duration-300" />
                                    </div>
                                    <h3 className="text-reading font-bold text-zinc-900 mb-3 tracking-tight">
                                        <EditableField
                                            placeholder={step.titlePlaceholder}
                                            path={step.titlePath}
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </h3>
                                    <p className="text-mini text-zinc-500 leading-[1.6] font-medium">
                                        <EditableField
                                            placeholder={step.descPlaceholder}
                                            path={step.descPath}
                                            multiline
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Editable accent callout - Minimalist Quote Footer */}
                    <div className="mt-16 pt-8 border-t border-zinc-100 flex items-start gap-4 max-w-3xl">
                        <span className="text-xxs font-black uppercase tracking-[0.2em] text-zinc-400 mt-1 shrink-0">Insight</span>
                        <p className="text-body text-zinc-600 font-medium leading-relaxed">
                            "
                            <EditableField
                                placeholder="Sem arquitetura correta, dados entram sujos e vendas são perdidas no limbo."
                                path="onboarding_data.setup.main_title"
                                multiline
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
