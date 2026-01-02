import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import sections
import CoverSection from './sections/CoverSection';
import DiagnosticSection from './sections/DiagnosticSection';
import PremisesSection from './sections/PremisesSection';
import PersonaSection from './sections/PersonaSection';
import MethodologySection from './sections/MethodologySection';
import RoadmapSection from './sections/RoadmapSection';
import GoalsSection from './sections/GoalsSection';
import ProjectionsSection from './sections/ProjectionsSection';
import InvestmentSection from './sections/InvestmentSection';
import NextStepsSection from './sections/NextStepsSection';

interface StrategicPlan {
    id: string;
    client_id: string;
    diagnostic_data: any;
    persona_data: any;
    premises_data: any;
    methodology_data: any;
    roadmap_data: any;
    goals_data: any;
    financial_projections: any;
    budget_data: any;
    budget_data: any;
    next_steps_data: any;
    diagnostic_data?: {
        implementation_steps?: Array<{
            category: string;
            title: string;
            description: string;
            priority: string;
            estimated_time: string;
        }>;
    };
    status: string;
    created_at: string;
}

interface Client {
    id: string;
    company_name: string;
    contact_name: string;
    logo_url?: string;
}

const SECTIONS = [
    { id: 0, name: 'Capa', icon: '📄' },
    { id: 1, name: 'Diagnóstico', icon: '📊' },
    { id: 2, name: 'Premissas', icon: '🎯' },
    { id: 3, name: 'Persona', icon: '👤' },
    { id: 4, name: 'Metodologia', icon: '🔬' },
    { id: 5, name: 'Roadmap 90 Dias', icon: '🗓️' },
    { id: 6, name: 'Metas & KPIs', icon: '📈' },
    { id: 7, name: 'Projeções', icon: '💰' },
    { id: 8, name: 'Investimento', icon: '💵' },
    { id: 9, name: 'Próximos Passos', icon: '🚀' },
];

export default function StrategicPlanPresentation() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<StrategicPlan | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        loadPlan();
    }, [token]);

    useEffect(() => {
        // Mark as viewed when first loaded
        if (plan && plan.status === 'sent') {
            markAsViewed();
        }
    }, [plan]);

    async function loadPlan() {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Load plan by access token
            const { data: planData, error: planError } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('access_token', token)
                .single();

            if (planError) throw planError;

            setPlan(planData);

            // Load client data
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', planData.client_id)
                .single();

            if (clientError) throw clientError;

            setClient(clientData);
        } catch (error) {
            console.error('Error loading plan:', error);
            alert('Erro ao carregar planejamento. Verifique o link.');
        } finally {
            setLoading(false);
        }
    }

    async function markAsViewed() {
        if (!plan) return;

        try {
            await supabase
                .from('strategic_plans')
                .update({
                    status: 'viewed',
                    viewed_at: new Date().toISOString(),
                })
                .eq('id', plan.id);
        } catch (error) {
            console.error('Error marking as viewed:', error);
        }
    }

    async function handleApprove() {
        if (!plan) return;

        setApproving(true);

        try {
            const { error } = await supabase
                .from('strategic_plans')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                })
                .eq('id', plan.id);

            if (error) throw error;

            alert('✅ Planejamento aprovado com sucesso! Nossa equipe entrará em contato em breve.');
            setPlan({ ...plan, status: 'approved' });
        } catch (error) {
            console.error('Error approving plan:', error);
            alert('Erro ao aprovar planejamento. Tente novamente.');
        } finally {
            setApproving(false);
        }
    }

    async function handleReject() {
        if (!plan) return;

        const reason = prompt('Por favor, nos diga o motivo da recusa (opcional):');

        try {
            const { error } = await supabase
                .from('strategic_plans')
                .update({
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                })
                .eq('id', plan.id);

            if (error) throw error;

            alert('Planejamento recusado. Nossa equipe entrará em contato para ajustar.');
            setPlan({ ...plan, status: 'rejected' });
        } catch (error) {
            console.error('Error rejecting plan:', error);
            alert('Erro ao recusar planejamento. Tente novamente.');
        }
    }

    function handleNext() {
        if (currentSection < SECTIONS.length - 1) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function handlePrev() {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-600">Carregando planejamento...</p>
                </div>
            </div>
        );
    }

    if (!plan || !client) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-semibold text-black mb-4">Planejamento não encontrado</h1>
                    <p className="text-zinc-600">Verifique se o link está correto ou entre em contato conosco.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {client.logo_url && (
                            <img src={client.logo_url} alt={client.company_name} className="h-8 object-contain" />
                        )}
                        <div>
                            <h1 className="text-lg font-semibold text-black">{client.company_name}</h1>
                            <p className="text-xs text-zinc-500">Planejamento Estratégico de Crescimento</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="RevHackers" className="h-6" />
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-zinc-50 border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {SECTIONS.map((section, index) => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(index)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${currentSection === index
                                    ? 'bg-black text-white'
                                    : currentSection > index
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-white text-zinc-600 hover:bg-zinc-100'
                                    }`}
                            >
                                <span>{section.icon}</span>
                                <span className="hidden md:inline">{section.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 h-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-300"
                            style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {currentSection === 0 && <CoverSection plan={plan} client={client} />}
                {currentSection === 1 && <DiagnosticSection plan={plan} />}
                {currentSection === 2 && <PremisesSection plan={plan} />}
                {currentSection === 3 && <PersonaSection plan={plan} />}
                {currentSection === 4 && <MethodologySection plan={plan} />}
                {currentSection === 5 && <RoadmapSection plan={plan} />}
                {currentSection === 6 && <GoalsSection plan={plan} />}
                {currentSection === 7 && <ProjectionsSection plan={plan} />}
                {currentSection === 8 && <InvestmentSection plan={plan} />}
                {currentSection === 9 && <NextStepsSection plan={plan} onApprove={handleApprove} onReject={handleReject} approving={approving} status={plan.status} />}
            </main>

            {/* Navigation */}
            <footer className="border-t border-zinc-200 bg-white sticky bottom-0">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button
                        onClick={handlePrev}
                        disabled={currentSection === 0}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </Button>

                    <div className="text-sm text-zinc-600">
                        Seção {currentSection + 1} de {SECTIONS.length}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={currentSection === SECTIONS.length - 1}
                        className="flex items-center gap-2"
                    >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
