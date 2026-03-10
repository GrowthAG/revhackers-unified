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

    // Default steps if none provided
    const defaultSteps = [
        { day: 'DIA 1', action: 'Otimizar perfil LinkedIn (headline, banner, sobre) - foco Brasil' },
        { day: 'DIA 1-2', action: 'Criar lista de 200+ empresas target (SP, RJ, BH tech)' },
        { day: 'DIA 2-3', action: 'Escrever 5 templates de prospecao em portugues brasileiro' },
        { day: 'DIA 3', action: 'Criar demo workspace do Funnels com dados brasileiros' },
        { day: 'DIA 4-6', action: 'Publicar 4 posts no LinkedIn sobre dores brasileiras (WhatsApp, consolidacao)' },
        { day: 'DIA 5-6', action: 'Criar lead magnet: "Checklist: Migrar de RD+Pipedrive para Funnels em 48h"' },
        { day: 'DIA 6-7', action: 'Configurar Calendly + email sequences (5 sequencias)' },
        { day: 'DIA 7', action: 'Iniciar outreach manual (10-15 conexoes/dia no LinkedIn)' },
        { day: 'SEMANA 1', action: 'Agendar 3-5 discovery calls (meta minima)' },
        { day: 'SEMANA 1', action: 'Documentar objecoes comuns e respostas (playbook)' },
    ];

    const steps = displaySteps.length > 0 ? displaySteps : defaultSteps;

    return (
        <div className="py-20 space-y-32">
            {/* Section Header */}
            <div className="text-center space-y-6">
                <h2 className="text-7xl md:text-[8rem] font-black text-white leading-[0.8] tracking-[-0.05em] uppercase select-none">
                    Next <span className="text-revgreen">Steps</span>
                </h2>
                <div className="w-40 h-[1px] bg-revgreen mx-auto shadow-[0_0_20px_rgba(3,252,59,0.5)]"></div>
                <p className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.4em]">
                    Immediate Action Protocol
                </p>
            </div>

            {/* Steps - Surgical V2 Grid */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {steps.map((step: any, index: number) => {
                    const title = step.title || step.action;
                    const label = step.day || `STEP ${index + 1}`;

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-6 group"
                        >
                            <div className="w-12 h-12 rounded-full border border-zinc-900 bg-zinc-950 flex items-center justify-center flex-shrink-0 group-hover:border-revgreen transition-all shadow-[0_0_20px_rgba(3,252,59,0.05)]">
                                <span className="text-xs font-black text-zinc-500 group-hover:text-revgreen">{String(index + 1).padStart(2, '0')}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-revgreen font-black uppercase tracking-[0.3em]">{label}</p>
                                <p className="text-lg font-black text-white uppercase tracking-tight leading-tight">{title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approval Console */}
            <div className="max-w-4xl mx-auto pt-20 border-t border-zinc-900">
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
                                className="px-12 py-4 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs rounded-full hover:border-white hover:text-white transition-all"
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
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                            Technical Feedback
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
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
                            className="px-8 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleRequestAdjustments}
                            disabled={!adjustmentNotes.trim() || submittingAdjustments}
                            className="px-10 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all"
                        >
                            {submittingAdjustments ? 'Transmitindo...' : 'Enviar Protocolo'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
