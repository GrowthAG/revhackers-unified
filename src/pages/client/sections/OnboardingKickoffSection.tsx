import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingKickoffSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    const pillars = [
        {
            titlePath: 'onboarding_data.kickoff.p1_title',
            titlePlaceholder: 'Revisão das Metas',
            descPath: 'onboarding_data.kickoff.p1_desc',
            descPlaceholder: 'Validação final dos OKRs aprovados na proposta comercial. Garantia de que a equipe de execução entende o alvo financeiro.',
            outputPath: 'onboarding_data.kickoff.p1_output',
            outputPlaceholder: 'Ata de Metas Assinada',
        },
        {
            titlePath: 'onboarding_data.kickoff.p2_title',
            titlePlaceholder: 'Matriz de Responsabilidade',
            descPath: 'onboarding_data.kickoff.p2_desc',
            descPlaceholder: 'Definição clara do papel de cada pessoa envolvida no projeto. Quem aprova texto, quem levanta base de dados, quem libera pagamentos.',
            outputPath: 'onboarding_data.kickoff.p2_output',
            outputPlaceholder: 'Matriz RACI Documentada',
        },
        {
            titlePath: 'onboarding_data.kickoff.p3_title',
            titlePlaceholder: 'Chaves do Castelo',
            descPath: 'onboarding_data.kickoff.p3_desc',
            descPlaceholder: 'Coleta de todos os acessos necessários de infraestrutura: Meta Business Manager, Google Ads, CRM, Hospedagem (DNS) e plataformas de automação.',
            outputPath: 'onboarding_data.kickoff.p3_output',
            outputPlaceholder: 'Cofre de Senhas Populado',
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-12 py-8 max-w-[1600px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 1"
                    titleLine1="O Kickoff"
                    titleLine2="Estratégico"
                    description="Transferência de contexto entre Vendas e Operação. Alinhamento absoluto de expectativas, prazos e responsáveis."
                />

                <div className="mt-8 space-y-6">
                    {/* 3 Pillars in bordered cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pillars.map((pillar, i) => {
                            return (
                                <div key={i} className="border border-zinc-200 rounded-xl p-8 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs text-zinc-300 font-mono">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                                        <EditableField
                                            placeholder={pillar.titlePlaceholder}
                                            path={pillar.titlePath}
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </h3>
                                    <p className="text-[15px] text-zinc-500 leading-relaxed font-medium flex-1 mb-4">
                                        <EditableField
                                            placeholder={pillar.descPlaceholder}
                                            path={pillar.descPath}
                                            multiline
                                            className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                        />
                                    </p>
                                    <div className="border-t border-zinc-100 pt-3 flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A]">Saída</span>
                                        <span className="text-zinc-300 shrink-0 text-sm">/</span>
                                        <span className="text-xs font-bold text-zinc-700">
                                            <EditableField
                                                placeholder={pillar.outputPlaceholder}
                                                path={pillar.outputPath}
                                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                            />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Compact accent bar */}
                    <div className="bg-zinc-950 rounded-xl px-6 py-5 flex items-center justify-between">
                        <p className="text-sm text-white/70 font-medium flex-1">
                            <EditableField
                                placeholder="O sucesso dos próximos 90 dias é decidido nesta primeira reunião."
                                path="onboarding_data.kickoff.main_title"
                                className="bg-transparent text-white/70 focus:bg-zinc-800 outline-none w-full"
                            />
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00CC6A] shrink-0 ml-4">Dia 01</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
