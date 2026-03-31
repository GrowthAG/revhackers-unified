import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import DiagnosticBookingEmbed from './DiagnosticBookingEmbed';

interface DiagnosticBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    source?: string;
    diagnosticType?: string;
}

export const DiagnosticBookingModal = ({ isOpen, onClose, source = 'diagnostic', diagnosticType }: DiagnosticBookingModalProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-none shadow-sm overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]"
                    >
                        {/* Header Context */}
                        <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                            <div className="space-y-1">
                                <span className="text-xxs font-mono font-black text-zinc-400 uppercase tracking-[0.4em]">DEBRIEFING ESTRATÉGICO</span>
                                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tighter leading-none italic uppercase">
                                    Agende com um Especialista
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-200 transition-colors rounded-full bg-zinc-100">
                                <X className="w-5 h-5 text-black" />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto w-full min-h-[500px]">
                            <DiagnosticBookingEmbed diagnosticType={diagnosticType} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
