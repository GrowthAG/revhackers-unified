import React from 'react';
import { Target, Users, Key } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingKickoffSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 1"
                    titleLine1="O Kickoff"
                    titleLine2="Estratégico"
                    description="O momento de transferência de contexto entre Vendas e Operação. Alinhamento absoluto de expectativas, prazos e donos das tarefas."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-12 w-full flex flex-col items-center justify-start max-w-6xl mx-auto">
                {/* Central Statement */}
                <div className="text-center mb-16 max-w-4xl w-full">
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        <EditableField
                            placeholder="O sucesso dos próximos 90 dias é decidido nesta primeira reunião."
                            path="onboarding_data.kickoff.main_title"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        <EditableField
                            placeholder="Sem escopo oculto. O que não for mapeado aqui, não será entregue."
                            path="onboarding_data.kickoff.subtitle"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </p>
                    <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full mt-10" />
                </div>

                {/* 3 Pillars of Kickoff - Minimalist Notion Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-left">
                    {/* Alinhamento de Metas */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Target className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Revisão das Metas"
                                path="onboarding_data.kickoff.p1_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Validação final dos OKRs (Objetivos e Resultados Chaves) aprovados na proposta comercial. Garantia de que a equipe de execução entende o alvo financeiro."
                                path="onboarding_data.kickoff.p1_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">Saída</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="text-xs font-bold text-zinc-700">
                                <EditableField
                                    placeholder="Ata de Metas Assinada"
                                    path="onboarding_data.kickoff.p1_output"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </span>
                        </div>
                    </div>

                    {/* Definição de Stakeholders */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Users className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Matriz de Responsabilidade"
                                path="onboarding_data.kickoff.p2_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Definição clara do papel de cada pessoa envolvida no projeto. Quem aprova copy, quem levanta base de dados, quem libera pagamentos."
                                path="onboarding_data.kickoff.p2_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">Saída</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="text-xs font-bold text-zinc-700">
                                <EditableField
                                    placeholder="Matriz RACI Documentada"
                                    path="onboarding_data.kickoff.p2_output"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </span>
                        </div>
                    </div>

                    {/* Liberação de Acessos */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Key className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Chaves do Castelo"
                                path="onboarding_data.kickoff.p3_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Coleta de todos os acessos necessários de infraestrutura: Meta Business Manager, Google Ads, CRM, Hospedagem (DNS) e plataformas de automação."
                                path="onboarding_data.kickoff.p3_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A]">Saída</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="text-xs font-bold text-zinc-700">
                                <EditableField
                                    placeholder="Cofre de Senhas Populado"
                                    path="onboarding_data.kickoff.p3_output"
                                    className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
