import React from 'react';
import { Share2, Printer } from 'lucide-react';

interface ShareButtonsProps {
    score: number;
    type: string;
    className?: string;
}

export const ShareButtons = ({ score, type, className = '' }: ShareButtonsProps) => {
    const shareText = `Fiz o diagnóstico de ${type} da RevHackers e meu score foi ${score}/100. Descubra o seu:`;
    const shareUrl = window.location.href;

    const handleLinkedInShare = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=500');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                onClick={handleLinkedInShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xxs font-black uppercase tracking-widest transition-colors"
            >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar
            </button>
            <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xxs font-black uppercase tracking-widest transition-colors"
            >
                <Printer className="w-3.5 h-3.5" />
                PDF
            </button>
        </div>
    );
};
