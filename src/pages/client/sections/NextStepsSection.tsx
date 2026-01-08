import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface NextStepsSectionProps {
    plan: any;
    onApprove: () => void;
    onReject: () => void;
    approving: boolean;
    status: string;
}

export default function NextStepsSection({ plan, onApprove, onReject, approving, status }: NextStepsSectionProps) {
    const [showAdjustments, setShowAdjustments] = useState(false);
    const [adjustmentNotes, setAdjustmentNotes] = useState('');
    const [submittingAdjustments, setSubmittingAdjustments] = useState(false);

    const implementationSteps = plan.diagnostic_data?.implementation_steps || [];
    const displaySteps = implementationSteps.length > 0 ? implementationSteps : plan.next_steps_data?.week1_actions || [];

    const handleRequestAdjustments = async () => {
        setSubmittingAdjustments(true);
        setTimeout(() => {
            onReject();
            setShowAdjustments(false);
            setSubmittingAdjustments(false);
        }, 1000);
    };

    // Default steps if none provided
    const defaultSteps = [
        { day: 'Dia 1', action: 'Configuração Técnica' },
        { day: 'Dia 2', action: 'Kick-off de Conteúdo' },
        { day: 'Dia 3', action: 'Setup de Campanhas' },
        { day: 'Dia 4', action: 'Validação de Tracking' },
        { day: 'Dia 5', action: 'Go Live' },
    ];

    const steps = displaySteps.length > 0 ? displaySteps : defaultSteps;

    return (
        <div className="space-y-16">
            {/* Header - Apple Style */}
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                    Próximos Passos
                </h2>
                <p className="text-lg text-zinc-500 font-light leading-relaxed">
                    Roadmap de execução para as próximas 48 horas.
                </p>
            </div>

            {/* Steps - Minimalist List */}
            <div className="max-w-xl mx-auto">
                {steps.map((step: any, index: number) => {
                    const title = step.title || step.action;
                    const label = step.day || `Passo ${index + 1}`;

                    return (
                        <div
                            key={index}
                            className="flex items-center gap-6 py-6 border-b border-zinc-200"
                        >
                            <div className="w-10 h-10 border border-zinc-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-zinc-400">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-lg font-medium text-black">{title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approval Section */}
            {status === 'approved' ? (
                <div className="max-w-md mx-auto text-center py-12 border-2 border-black">
                    <div className="w-12 h-12 mx-auto mb-4 border-2 border-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-xl font-medium text-black mb-2">
                        Aprovado
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Aguardando início da execução.
                    </p>
                </div>
            ) : status === 'rejected' ? (
                <div className="max-w-md mx-auto text-center py-12 border border-zinc-200">
                    <h3 className="text-xl font-medium text-black mb-2">
                        Ajustes Solicitados
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Em revisão pela equipe.
                    </p>
                </div>
            ) : (
                <div className="max-w-lg mx-auto text-center">
                    <h3 className="text-xl font-medium text-black mb-2">
                        Aprovação do Plano
                    </h3>
                    <p className="text-sm text-zinc-500 mb-8">
                        Ao aprovar, você autoriza o início das ações descritas.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={() => setShowAdjustments(true)}
                            variant="outline"
                            className="h-12 px-6 border border-zinc-300 text-zinc-600 hover:text-black hover:border-black rounded-none"
                            disabled={approving}
                        >
                            Solicitar Ajustes
                        </Button>

                        <Button
                            onClick={onApprove}
                            className="h-12 px-8 bg-black text-white hover:bg-zinc-800 rounded-none"
                            disabled={approving}
                        >
                            {approving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processando
                                </>
                            ) : (
                                'Aprovar Execução'
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Adjustments Dialog */}
            <Dialog open={showAdjustments} onOpenChange={setShowAdjustments}>
                <DialogContent className="max-w-lg rounded-none border-2 border-black">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-medium">
                            Solicitar Ajustes
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Descreva os ajustes que você gostaria de ver no planejamento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Textarea
                            value={adjustmentNotes}
                            onChange={(e) => setAdjustmentNotes(e.target.value)}
                            placeholder="Descreva os ajustes necessários..."
                            className="min-h-[120px] resize-none border-zinc-200 focus:border-black rounded-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAdjustments(false)}
                            disabled={submittingAdjustments}
                            className="rounded-none"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRequestAdjustments}
                            disabled={!adjustmentNotes.trim() || submittingAdjustments}
                            className="bg-black text-white hover:bg-zinc-800 rounded-none"
                        >
                            {submittingAdjustments ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
