
import { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LeadMagnetModal from '@/components/shared/LeadMagnetModal';

interface StrategicConclusionProps {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    leadMagnetId?: 'checklist' | 'roi-calculator' | 'template' | 'guide';
    onCTAClick?: () => void;
}

const StrategicConclusion = ({
    title = "Vamos construir sua Máquina de Vendas?",
    description = "Não perca mais tempo com processos que não escalam. Nossa consultoria desenha e implementa seus playbooks em 90 dias.",
    ctaText = "Agendar Diagnóstico",
    ctaLink = "/agenda-diagnostico",
    leadMagnetId,
    onCTAClick
}: StrategicConclusionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (leadMagnetId) {
            e.preventDefault();
            setIsModalOpen(true);
        } else if (onCTAClick) {
            e.preventDefault();
            onCTAClick();
        }
    };

    return (
        <div className="mt-16 sm:mt-24 pt-12 border-t border-gray-100">
            <div className="bg-white rounded-2xl p-8 md:p-12 relative overflow-hidden group text-center md:text-left border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Premium Abstract Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-revgreen/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-gray-600 text-lg mb-0 leading-relaxed font-light">
                            {description}
                        </p>
                    </div>
                    <div className="shrink-0">
                        {leadMagnetId ? (
                            <Button size="lg" onClick={handleClick} className="bg-revgreen text-black hover:bg-emerald-500 font-bold text-lg px-8 h-14 rounded-sm shadow-lg hover:shadow-revgreen/20 transition-all duration-300">
                                <Download className="w-5 h-5 mr-2" /> {ctaText}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleClick}
                                className="bg-revgreen text-black hover:bg-emerald-500 font-bold text-lg px-8 h-14 rounded-sm shadow-lg hover:shadow-revgreen/20 transition-all duration-300"
                            >
                                <span className="flex items-center gap-2">
                                    {ctaText} <ArrowRight className="w-5 h-5" />
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {leadMagnetId && (
                <LeadMagnetModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    magnet={leadMagnetId}
                />
            )}
        </div>
    );
};

export default StrategicConclusion;
