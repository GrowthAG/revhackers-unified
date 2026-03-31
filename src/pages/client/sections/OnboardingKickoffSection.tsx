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
                    eyebrow="Onboarding - Etapa 1"
                    titleLine1="O Kickoff"
                    titleLine2="Estratégico"
                    description="Transferência de contexto entre Vendas e Operação. Alinhamento absoluto de expectativas, prazos e responsáveis."
                />

                <div className="mt-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
                    
                    {/* Left Column - Main Takeaway */}
                    <div className="lg:w-1/3 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-[2px] bg-zinc-900 mb-6" />
                            <h3 className="text-2xl font-black text-zinc-900 leading-tight tracking-tight mb-4">
                                <EditableField
                                    placeholder="O sucesso dos próximos 90 dias é decidido nesta primeira reunião."
                                    path="onboarding_data.kickoff.main_title"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                    multiline
                                />
                            </h3>
                            <p className="text-body text-zinc-500 font-medium leading-[1.6]">
                                O Kickoff não é uma formalidade. É o momento de alinhar os 
                                executivos, travar o escopo e garantir que todos têm a mesma
                                visão de sucesso para a operação de RevOps.
                            </p>
                        </div>
                        
                        <div className="mt-12 inline-flex items-center gap-2">
                            <span className="text-xxs font-black uppercase tracking-[0.2em] text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 ">
                                Dia 01
                            </span>
                            <span className="text-xxs uppercase font-bold text-zinc-400 tracking-widest px-2">
                                Início do Projeto
                            </span>
                        </div>
                    </div>

                    {/* Right Column - Pillars List */}
                    <div className="lg:w-2/3 space-y-8">
                        {pillars.map((pillar, i) => (
                            <div key={i} className="group relative border-b border-zinc-100 pb-8 last:border-0">
                                <div className="flex gap-6 md:gap-8">
                                    <div className="pt-1">
                                        <span className="text-xxs text-zinc-300 font-mono font-bold">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight group-hover:text-[#00CC6A] transition-colors">
                                            <EditableField
                                                placeholder={pillar.titlePlaceholder}
                                                path={pillar.titlePath}
                                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                            />
                                        </h4>
                                        <p className="text-body text-zinc-500 leading-[1.6] font-medium mb-4 max-w-xl">
                                            <EditableField
                                                placeholder={pillar.descPlaceholder}
                                                path={pillar.descPath}
                                                multiline
                                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                            />
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xs font-bold uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded">
                                                Saída Oficial
                                            </span>
                                            <p className="text-tiny font-bold text-zinc-700">
                                                <EditableField
                                                    placeholder={pillar.outputPlaceholder}
                                                    path={pillar.outputPath}
                                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
