
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface BookingModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    triggerText?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const BookingModal = ({ isOpen, onClose, triggerText = "Agendar Diagnóstico", className, variant = "default" }: BookingModalProps) => {

    useEffect(() => {
        // Load the embed script dynamically when the component mounts or modal opens
        // But since the iframe is always present when modal content is rendered, we can just ensure the script is loaded.
        const scriptId = "revhackers-booking-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://pages.revhackers.com.br/js/form_embed.js";
            script.type = "text/javascript";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && onClose) onClose();
        }}>
            {!isOpen && onClose === undefined && (
                <DialogTrigger asChild>
                    <Button variant={variant} className={className}>
                        {triggerText}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 bg-white border-0 overflow-hidden">
                <DialogHeader className="px-0 py-0 border-b border-gray-100 bg-black text-white shrink-0 z-10">
                    <div className="flex items-center justify-between px-6 py-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-mono">PROTOCOLO // ID-9090</span>
                            <DialogTitle className="text-white font-bold text-sm uppercase tracking-[0.2em] mt-1">
                                Sessão de Diagnóstico
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-revgreen animate-pulse shadow-[0_0_8px_#03FC3B]"></div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-revgreen">
                                Sistema Ativo
                            </span>
                        </div>
                    </div>
                    {/* Progress Loader Simulation */}
                    <div className="w-full h-0.5 bg-gray-900 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-revgreen w-1/3 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </DialogHeader>
                <div className="flex-1 w-full p-0 bg-white overflow-y-auto">
                    <iframe
                        src="https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh"
                        style={{ width: '100%', border: 'none', minHeight: '1100px' }}
                        scrolling="yes"
                        id="E6Mw5guvWZc7ADFgxnJh_1766095834075"
                        title="Agendar Diagnóstico"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
