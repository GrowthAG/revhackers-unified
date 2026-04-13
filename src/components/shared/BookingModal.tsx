
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BookingModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    triggerText?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const BookingModal = ({ isOpen, onClose, triggerText = "Aplicar para Auditoria", className, variant = "default" }: BookingModalProps) => {
    const navigate = useNavigate();

    // When modal "opens", navigate to /booking page directly
    useEffect(() => {
        if (isOpen) {
            navigate('/booking');
            if (onClose) {
                setTimeout(() => onClose(), 100);
            }
        }
    }, [isOpen, onClose, navigate]);

    // Standalone button mode (no controlled isOpen/onClose)
    if (isOpen === undefined && onClose === undefined) {
        return (
            <Button
                variant={variant}
                className={className}
                onClick={() => navigate('/booking')}
            >
                {triggerText}
            </Button>
        );
    }

    // Controlled mode renders nothing - the useEffect navigates
    return null;
};

export default BookingModal;
