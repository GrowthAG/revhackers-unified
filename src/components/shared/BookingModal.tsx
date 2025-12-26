
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
    triggerText?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const BookingModal = ({ triggerText = "Agendar Diagnóstico", className, variant = "default" }: BookingModalProps) => {

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
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto p-0 bg-white border-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-100">
                    <DialogTitle className="text-black font-bold text-xl">Agendar Diagnóstico</DialogTitle>
                </DialogHeader>
                <div className="w-full h-full p-4 bg-white">
                    <iframe
                        src="https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh"
                        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
                        scrolling="no"
                        id="E6Mw5guvWZc7ADFgxnJh_1766095834075"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
