import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, XCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PipelineStage, STAGE_CONFIGS } from '@/types/pipeline';

interface StageTransitionButtonsProps {
    currentStage: PipelineStage;
    onAdvance: (stage: PipelineStage) => void;
    advancing: boolean;
}

export function StageTransitionButtons({ currentStage, onAdvance, advancing }: StageTransitionButtonsProps) {
    const config = STAGE_CONFIGS[currentStage];
    const allowed = config.allowedTransitions;

    if (allowed.length === 0) return null;

    const dangerStages: PipelineStage[] = ['lost', 'churned'];

    return (
        <div className="flex items-center gap-2">
            {allowed.filter(s => !dangerStages.includes(s)).map((stage) => {
                const targetConfig = STAGE_CONFIGS[stage];
                return (
                    <Button
                        key={stage}
                        size="sm"
                        disabled={advancing}
                        onClick={() => onAdvance(stage)}
                        className="text-xxs font-black uppercase tracking-widest border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 gap-1.5 transition-all rounded-none"
                    >
                        {advancing ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <ArrowRight size={12} />
                        )}
                        {targetConfig.labelShort}
                    </Button>
                );
            })}

            {allowed.filter(s => dangerStages.includes(s)).map((stage) => {
                const targetConfig = STAGE_CONFIGS[stage];
                return (
                    <AlertDialog key={stage}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={advancing}
                                className="text-xxs font-black uppercase tracking-widest text-zinc-400 border-zinc-200 hover:text-zinc-600 hover:border-zinc-300 gap-1.5"
                            >
                                <XCircle size={12} />
                                {targetConfig.labelShort}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-red-100">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-black tracking-tight text-red-600">
                                    Confirmar: {targetConfig.label}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-500">
                                    Essa acao vai mover o projeto para "{targetConfig.label}". {
                                        stage === 'lost'
                                            ? 'O lead sera marcado como perdido.'
                                            : 'O cliente sera marcado como churned.'
                                    } Tem certeza?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-xxs font-bold uppercase tracking-widest">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onAdvance(stage)}
                                    className="text-xxs font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            })}
        </div>
    );
}
