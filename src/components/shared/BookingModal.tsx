
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface BookingModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    triggerText?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const BOOKING_URL = "https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh";

const BookingModal = ({ isOpen, onClose, triggerText = "Agendar Diagnóstico", className, variant = "default" }: BookingModalProps) => {

    // When modal opens, auto-redirect to booking page
    useEffect(() => {
        if (isOpen) {
            window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
            // Close the modal immediately since we opened in new tab
            if (onClose) {
                setTimeout(() => onClose(), 300);
            }
        }
    }, [isOpen, onClose]);

    // If used as a standalone button (no controlled isOpen/onClose)
    if (!isOpen && onClose === undefined) {
        return (
            <Button
                variant={variant}
                className={className}
                onClick={() => window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')}
            >
                {triggerText}
            </Button>
        );
    }

    // Controlled mode: show a minimal confirmation dialog instead of broken iframe
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && onClose) onClose();
        }}>
            <DialogContent className="max-w-md p-8 bg-white border border-zinc-200 rounded-xl">
                <div className="flex flex-col items-center text-center gap-5">
                    <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Agendar Diagnostico</h3>
                        <p className="text-sm text-zinc-500">A pagina de agendamento foi aberta em uma nova aba.</p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onClose?.()}
                        >
                            Fechar
                        </Button>
                        <Button
                            className="flex-1 bg-zinc-950 text-white hover:bg-zinc-800"
                            onClick={() => window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')}
                        >
                            Abrir novamente
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
