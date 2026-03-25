import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getReiProjectById } from '@/api/reiProjects';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import REIWizard from '@/components/rei/REIWizard';
import { REIType } from '@/types/rei';

export default function REIWizardPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    const projectId = searchParams.get('projectId');
    const [type, setType] = useState<REIType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                navigate('/rei-hub');
                return;
            }

            try {
                const project = await getReiProjectById(projectId);
                setType(project?.type as REIType);
            } catch (error) {
                console.error('Erro ao carregar projeto:', error);
                navigate('/rei-hub');
            } finally {
                setLoading(false);
            }
        };

        if (!isLoading) {
            if (!user) {
                navigate('/login');
            } else {
                loadProject();
            }
        }
    }, [projectId, user, isLoading, navigate]);

    const handleComplete = (projectId: string) => {
        // Redireciona para a jornada (onde está o agendamento) em vez de ir direto para o resultado,
        // garantindo que o passo de agendamento não seja 'pulado'.
        navigate(`/admin/jornada/${projectId}`);
    };

    if (isLoading || loading) {
        return (
            <PageLayout>
                <Section variant="light" className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-black text-lg">Carregando...</div>
                </Section>
            </PageLayout>
        );
    }

    if (!type || !projectId) {
        return null;
    }

    return (
        <PageLayout>
            <Section variant="light" className="min-h-screen pt-28 pb-20 bg-white">
                <div className="container-custom">
                    <REIWizard
                        projectId={projectId}
                        type={type}
                        onComplete={handleComplete}
                    />
                </div>
            </Section>
        </PageLayout>
    );
}
