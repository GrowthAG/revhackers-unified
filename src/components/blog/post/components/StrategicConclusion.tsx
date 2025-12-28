import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MaterialModal from '@/components/shared/MaterialModal';
import ArticleCTA from './ArticleCTA';

interface StrategicConclusionProps {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    leadMagnetId?: 'checklist' | 'roi-calculator' | 'template' | 'guide' | 'demo-framework' | 'cold-email-2025' | 'sales-playbook' | 'ltv-cac-calculator' | 'linkedin-revolution' | 'gtm-guide' | 'agent-blueprint';
    diagnosticPath?: string;
    onCTAClick?: () => void;
}

const StrategicConclusion = ({
    title = "Vamos construir sua Máquina de Vendas?",
    description = "Não perca mais tempo com processos que não escalam. Nossa consultoria desenha e implementa seus playbooks em 90 dias.",
    ctaText = "Agendar Diagnóstico",
    ctaLink = "/agenda-diagnostico",
    leadMagnetId,
    diagnosticPath,
    onCTAClick
}: StrategicConclusionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Mapeamento inteligente de textos baseados no Lead Magnet
    const getSecondaryBtnText = (magnet?: string) => {
        switch (magnet) {
            case 'demo-framework':
                return 'Baixar Framework da Demo';
            case 'sales-playbook':
                return 'Baixar Playbook de Vendas';
            case 'cold-email-2025':
                return 'Acessar Templates de Cold Email';
            case 'ltv-cac-calculator':
                return 'Baixar Calculadora LTV/CAC';
            case 'linkedin-revolution':
                return 'Acessar Guia LinkedIn';
            case 'gtm-guide':
                return 'Baixar Guia GTM';
            case 'agent-blueprint':
                return 'Baixar Blueprint de Agentes';
            case 'checklist':
                return 'Baixar Checklist';
            case 'template':
                return 'Acessar Templates';
            case 'roi-calculator':
                return 'Calcular ROI';
            case 'guide':
                return 'Ler Guia Oficial';
            default:
                return undefined;
        }
    };

    const getMaterialTitle = (magnet?: string) => {
        switch (magnet) {
            case 'demo-framework': return 'Framework da Demo Perfeita';
            case 'sales-playbook': return 'Playbook de Vendas B2B';
            case 'cold-email-2025': return 'Templates de Cold Email 2025';
            case 'ltv-cac-calculator': return 'Calculadora de LTV e CAC';
            case 'linkedin-revolution': return 'LinkedIn Outreach Revolution';
            case 'gtm-guide': return 'Guia Prático de Estratégia GTM';
            case 'agent-blueprint': return 'Blueprint de Agentes Autônomos';
            case 'checklist': return 'Checklist RevOps';
            case 'template': return 'Pacote de Templates';
            case 'roi-calculator': return 'Calculadora ROI';
            default: return 'Material Rico';
        }
    };

    const handlePrimaryClick = () => {
        if (diagnosticPath) {
            navigate(diagnosticPath);
            window.scrollTo(0, 0);
        } else if (onCTAClick) {
            onCTAClick();
        } else {
            window.location.href = ctaLink;
        }
    };

    const handleSecondaryClick = () => {
        if (leadMagnetId) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <ArticleCTA
                title={title}
                description={description}
                primaryBtnText={ctaText}
                secondaryBtnText={getSecondaryBtnText(leadMagnetId)}
                onPrimaryClick={handlePrimaryClick}
                onSecondaryClick={handleSecondaryClick}
            />

            {leadMagnetId && (
                <MaterialModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    material={{
                        title: getSecondaryBtnText(leadMagnetId),
                        material_name: getMaterialTitle(leadMagnetId),
                        type: "Material Rico",
                        id: leadMagnetId
                    }}
                    onSuccess={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default StrategicConclusion;
