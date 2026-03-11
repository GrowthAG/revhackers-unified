import React from 'react';
import { Settings, Database, Activity } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';

interface OnboardingSectionProps {
    plan: any;
}

export default function OnboardingSetupSection({ plan }: OnboardingSectionProps) {
    const { isEditing } = usePlanEdit();

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Onboarding — Etapa 2"
                    titleLine1="Máquina"
                    titleLine2="Operacional"
                    description="A fase 'invisível' onde configuramos as fundações de rastreamento, processos e integrações antes do treinamento oficial."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-12 w-full flex flex-col items-center justify-start max-w-6xl mx-auto">
                {/* Central Statement */}
                <div className="text-center mb-16 max-w-4xl w-full">
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        <EditableField
                            placeholder="Construindo a sua nova Arquitetura de Conversão."
                            path="onboarding_data.setup.main_title"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        <EditableField
                            placeholder="Sem arquitetura correta, dados entram sujos e vendas são perdidas no limbo."
                            path="onboarding_data.setup.subtitle"
                            multiline
                            className="bg-transparent text-center focus:bg-zinc-50 outline-none w-full break-words"
                        />
                    </p>
                    <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full mt-10" />
                </div>

                {/* 3 Pillars of Setup - Minimalist Notion Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-left">
                    {/* Setup de CRM */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Settings className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Configuração Sistêmica"
                                path="onboarding_data.setup.p1_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Construção de funis, customização de propriedades, restrições condicionais e automação de roteamento de leads para sua equipe."
                                path="onboarding_data.setup.p1_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* Integrações */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Database className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Fluxo de Dados"
                                path="onboarding_data.setup.p2_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Ligação de todos os portais de entrada (Site, Landing Pages, Anúncios) caindo diretamente e qualificadamente dentro da ferramenta central."
                                path="onboarding_data.setup.p2_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>

                    {/* Rastreamento */}
                    <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-100 hover:border-zinc-300 transition-colors">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-5">
                            <Activity className="w-4 h-4 text-zinc-900" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-3">
                            <EditableField
                                placeholder="Tagueamento Avançado"
                                path="onboarding_data.setup.p3_title"
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium mb-5">
                            <EditableField
                                placeholder="Apenas rastrear cliques não é suficiente. Implementamos UTMs fixas e pixels otimizados para fechar o ciclo de onde veio a receita real."
                                path="onboarding_data.setup.p3_desc"
                                multiline
                                className="bg-transparent focus:bg-zinc-50 outline-none w-full"
                            />
                        </p>
                    </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="w-full mt-16 max-w-2xl border-t border-zinc-100 pt-8 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] block mb-1">Status Invisível</span>
                        <span className="text-zinc-600 font-bold text-sm">100% Finalizado antes da Equipe Logar</span>
                    </div>
                    <div className="w-1/2 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-[#00CC6A]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
