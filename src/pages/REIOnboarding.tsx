import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import REIWizard from '@/components/diagnostic/REIWizard';
import Section from '@/components/ui/Section';

const REIOnboardingPage = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-revgreen border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <PageLayout>
            <Section variant="light" className="py-16 bg-zinc-50 min-h-screen">
                <div className="container-custom">
                    <REIWizard />
                </div>
            </Section>
        </PageLayout>
    );
};

export default REIOnboardingPage;
