import React from 'react';
import { Check, X, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextStepsSectionProps {
    plan: any;
    onApprove: () => void;
    onReject: () => void;
    approving: boolean;
    status: string;
}

export default function NextStepsSection({ plan, onApprove, onReject, approving, status }: NextStepsSectionProps) {
    const implementationSteps = plan.diagnostic_data?.implementation_steps || [];

    // Fallback if no specific implementation steps (backward compatibility)
    const displaySteps = implementationSteps.length > 0 ? implementationSteps : plan.next_steps_data?.week1_actions || [];

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    🚀 Próximos Passos (Go Live)
                </h2>
                <p className="text-zinc-600">
                    O que fazer AGORA para iniciar a implementação técnica.
                </p>
            </div>

            {/* Implementation Checklist */}
            <div className="mb-12">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-8 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-black">🔥 Etapa 3: Implementação</h3>
                            <p className="text-sm text-zinc-600">Execute estes passos para ativar a estratégia.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {displaySteps.map((step: any, index: number) => {
                        // Handle legacy structure (day/action) vs new structure (category/title)
                        const title = step.title || step.action;
                        const desc = step.description || step.day;
                        const category = step.category || 'Geral';

                        return (
                            <div key={index} className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-black text-white`}>
                                    <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wide bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                                            {category}
                                        </span>
                                        {step.estimated_time && (
                                            <span className="text-[10px] text-zinc-400">
                                                ⏱️ {step.estimated_time}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
                                    <p className="text-sm text-zinc-500 mt-1">{desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {week1Actions.length === 0 && (
                    <div className="space-y-3">
                        {[
                            { day: 'Dia 1', action: 'Otimizar perfil LinkedIn (headline, banner, sobre) - foco Brasil' },
                            { day: 'Dia 1-2', action: 'Criar lista de 200+ empresas target (SP, RJ, BH tech)' },
                            { day: 'Dia 2-3', action: 'Escrever 5 templates de outreach em português brasileiro' },
                            { day: 'Dia 3', action: 'Criar demo workspace do Funnels com dados brasileiros' },
                            { day: 'Dia 4-6', action: 'Publicar 4 posts no LinkedIn sobre dores brasileiras (WhatsApp, consolidação)' },
                            { day: 'Dia 5-6', action: 'Criar lead magnet: "Checklist: Migrar de RD+Pipedrive para Funnels em 48h"' },
                            { day: 'Dia 6-7', action: 'Configurar Calendly + email sequences (5 sequências)' },
                            { day: 'Dia 7', action: 'Iniciar outreach manual (10-15 conexões/dia no LinkedIn)' },
                            { day: 'Semana 1', action: 'Agendar 3-5 discovery calls (meta mínima)' },
                            { day: 'Semana 1', action: 'Documentar objeções comuns e respostas (playbook)' },
                        ].map((action, index) => (
                            <div key={index} className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-zinc-600">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{action.day}</p>
                                    <p className="text-sm text-zinc-700">{action.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approval Section */}
            {status === 'approved' ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-green-900 mb-2">
                        ✅ Planejamento Aprovado!
                    </h3>
                    <p className="text-zinc-700">
                        Nossa equipe entrará em contato em breve para iniciar a execução.
                    </p>
                </div>
            ) : status === 'rejected' ? (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-red-900 mb-2">
                        Planejamento Recusado
                    </h3>
                    <p className="text-zinc-700">
                        Nossa equipe entrará em contato para ajustar o planejamento.
                    </p>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-zinc-50 to-white border-2 border-zinc-300 rounded-lg p-8">
                    <h3 className="text-2xl font-semibold text-black mb-4 text-center">
                        Pronto para começar?
                    </h3>
                    <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
                        Revise todo o planejamento e, se estiver de acordo, aprove para iniciarmos a execução imediatamente.
                        Caso tenha alguma dúvida ou queira ajustar algo, entre em contato conosco.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={onReject}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={approving}
                        >
                            <X className="w-4 h-4" />
                            Preciso Ajustar
                        </Button>

                        <Button
                            onClick={onApprove}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            disabled={approving}
                        >
                            {approving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Aprovando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Aprovar Planejamento
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center mt-6">
                        Ao aprovar, você autoriza o início da execução conforme o planejamento apresentado.
                    </p>
                </div>
            )}
        </div>
    );
}
