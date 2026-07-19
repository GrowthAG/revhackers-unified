import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface HubNpsBlockerProps {
    projectId: string;
    clientName: string;
    onUnlock: () => void;
}

export const HubNpsBlocker: React.FC<HubNpsBlockerProps> = ({ projectId, clientName, onUnlock }) => {
    const { toast } = useToast();
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (score === null) {
            toast({
                title: 'Selecione uma nota',
                description: 'Por favor, avalie sua experiência de 0 a 10 antes de prosseguir.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Save to rei_responses as public feedback (RPC - RLS anonima
            // fechada, ver 20260718000000_secure_hub_public_access.sql)
            const { error } = await (supabase as any).rpc('submit_hub_nps', {
                p_project_id: projectId,
                p_score: score,
                p_comment: comment || null,
            });

            if (error) {
                console.error('Error saving NPS:', error);
                throw error;
            }

            // Save to LocalStorage to prevent re-prompting on same device
            localStorage.setItem(`rei_nps_unlocked_${projectId}`, 'true');

            setIsSuccess(true);
            
            // Wait a moment for success animation then unlock
            setTimeout(() => {
                onUnlock();
            }, 2000);

        } catch (error) {
            console.error('Failed to submit NPS:', error);
            // Even if it fails (e.g. RLS issues or network), we should let them in so they aren't fully locked out permanently
            toast({
                title: 'Obrigado pelo feedback!',
                description: 'Liberando seus acessos...',
            });
            localStorage.setItem(`rei_nps_unlocked_${projectId}`, 'true');
            onUnlock();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center flex-center text-center p-8"
                >
                    <div className="w-20 h-20 bg-green-500/20 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Acesso Liberado!</h2>
                    <p className="text-zinc-400">Preparando o seu Hub estratégico...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 shadow-sm overflow-hidden my-8"
            >
                {/* Header Section */}
                <div className="bg-zinc-950 p-8 text-center border-b border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <Star className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Bem-vindo(a) ao seu <span className="text-[#00CC6A]">Hub Estratégico</span>
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Olá {clientName}, seu kickoff foi concluído com sucesso. Antes de liberar todos os seus acessos e playbooks, queremos te ouvir rapidinho.
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold tracking-widest text-zinc-300 uppercase block text-center">
                            De 0 a 10, como você avalia nosso processo de Onboarding e Alinhamento?
                        </label>
                        
                        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setScore(num)}
                                    className={`w-10 h-12 sm:w-12 sm:h-14 font-bold text-lg transition-all duration-200 border
                                        ${score === num 
                                            ? 'bg-zinc-900 border-zinc-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] transform scale-110' 
                                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-500'
                                        }
                                    `}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 px-2 font-medium">
                            <span>Muito Detrator</span>
                            <span>Promotor Neutro</span>
                            <span>Altamente Promotor</span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {score !== null && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="space-y-3"
                            >
                                <label className="text-sm font-semibold tracking-widest text-zinc-300 uppercase block">
                                    O que motivou a sua nota? (Opcional)
                                </label>
                                <Textarea 
                                    placeholder="Conta pra gente o que mais gostou ou no que podemos melhorar drasticamente..."
                                    className="min-h-[100px] bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || score === null}
                        className="w-full h-14 text-white text-lg font-bold bg-zinc-900 hover:bg-black transition-all shadow-sm hover:-translate-y-0.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Liberando Acessos...
                            </>
                        ) : (
                            'Desbloquear Meu Hub 🚀'
                        )}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-zinc-600">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Seu feedback é fundamental para nossa evolução.</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
