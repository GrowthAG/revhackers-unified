import React, { useState } from 'react';
import { Check, Loader2, Rocket, Handshake, ChevronRight } from 'lucide-react';
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
    onReject: (feedback: string) => void;
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
        if (!adjustmentNotes.trim()) return;
        setSubmittingAdjustments(true);
        // Simulate minor delay for UX
        setTimeout(() => {
            onReject(adjustmentNotes);
            setShowAdjustments(false);
            setSubmittingAdjustments(false);
        }, 1000);
    };

    const defaultSteps: any[] = [];

    const steps = displaySteps.length > 0 ? displaySteps : defaultSteps;

    return (
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    PRÓXIMOS PASSOS
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    Plano de <span className="text-zinc-300">Ação</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Ações imediatas para iniciar a execução do planejamento.
                </p>
            </div>

            {steps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steps.map((step: any, index: number) => {
                        const title = step.title || step.action;
                        const label = step.day || `Passo ${index + 1}`;

                        return (
                            <div key={index} className="flex items-start gap-4 p-4 border border-zinc-100 rounded-xl hover:shadow-sm transition-all">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#00CC6A] font-bold uppercase tracking-widest">{label}</p>
                                    <p className="text-sm font-bold text-zinc-900">{title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-zinc-400 border border-zinc-100 rounded-xl">
                    <p className="text-sm font-medium">Ações serão definidas após a aprovação do planejamento.</p>
                </div>
            )}

            {/* Approval Console */}
            <div className="pt-8 border-t border-zinc-100">
                {status === 'approved' ? (
                    <div className="text-center py-20 bg-zinc-950/50 border border-revgreen/20 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-revgreen/5 blur-[100px]"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-20 h-20 mx-auto bg-revgreen rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(3,252,59,0.3)]">
                                <Check className="w-10 h-10 text-black border-none" />
                            </div>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                                Missão Iniciada
                            </h3>
                            <p className="text-zinc-500 font-medium uppercase tracking-widest max-w-sm mx-auto">
                                Protocolo aprovado. Nossa equipe de engenharia de growth já está em campo.
                            </p>
                        </div>
                    </div>
                ) : status === 'rejected' ? (
                    <div className="text-center py-16 border border-zinc-900 rounded-[3rem] bg-zinc-950/30">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                            Ajustes Solicitados
                        </h3>
                        <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">
                            Em revisão técnica. Retornaremos em menos de 24h.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        <div className="text-center space-y-4">
                            <Rocket className="w-12 h-12 mx-auto text-revgreen animate-pulse" />
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                                Pronto para a Execução?
                            </h3>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
                                Ao autorizar, ativamos o ecossistema RevHackers para escalar sua operação imediatamente.
                            </p>
                        </div>

                        {/* Action Primary */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => setShowAdjustments(true)}
                                className="px-12 py-4 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:border-white hover:text-white transition-all"
                                disabled={approving}
                            >
                                Solicitar Ajustes
                            </button>

                            <button
                                onClick={onApprove}
                                className="px-16 py-5 bg-revgreen text-black font-black uppercase tracking-[0.3em] text-xs rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(3,252,59,0.2)] flex items-center gap-3"
                                disabled={approving}
                            >
                                {approving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Ativando...
                                    </>
                                ) : (
                                    <>
                                        Autorizar Execução
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Adjustments Terminal (Dialog) */}
            <Dialog open={showAdjustments} onOpenChange={setShowAdjustments}>
                <DialogContent className="max-w-lg bg-zinc-950 border border-zinc-900 text-white rounded-[2rem] p-10">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-xl font-bold">
                            Solicitar Ajustes
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                            Descreva os pontos de fricção para ajuste imediato.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8">
                        <Textarea
                            value={adjustmentNotes}
                            onChange={(e) => setAdjustmentNotes(e.target.value)}
                            placeholder="Descreva os ajustes necessários..."
                            className="min-h-[160px] bg-black border-zinc-900 rounded-2xl p-6 text-sm text-white placeholder:text-zinc-800 focus:border-revgreen transition-all resize-none shadow-none focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setShowAdjustments(false)}
                            disabled={submittingAdjustments}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleRequestAdjustments}
                            disabled={!adjustmentNotes.trim() || submittingAdjustments}
                            className="px-10 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all"
                        >
                            {submittingAdjustments ? 'Transmitindo...' : 'Enviar Protocolo'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
