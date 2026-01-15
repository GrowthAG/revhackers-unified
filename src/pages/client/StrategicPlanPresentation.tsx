import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Send, AlertCircle, CheckCircle2, Target, BrainCircuit, Zap, TrendingUp, ShieldAlert, Radio, User, MessageSquare, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const SECTIONS = [
    { id: 'cover', name: 'Capa' },
    { id: 'diagnostic', name: 'Diagnóstico' },
    { id: 'premises', name: 'Premissas' },
    { id: 'persona', name: 'Persona' },
    { id: 'methodology', name: 'Metodologia' },
    { id: 'roadmap', name: 'Cronograma' },
    { id: 'goals', name: 'Objetivos' },
    { id: 'projections', name: 'Projeções' },
    { id: 'investment', name: 'Investimento' },
    { id: 'nextsteps', name: 'Próximos Passos' }
];

export default function StrategicPlanPresentation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [plan, setPlan] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    async function loadData() {
        try {
            // Updated to fetch by access_token (id from URL is actually the token)
            const { data: planData, error: planError } = await supabase
                .from('strategic_plans')
                .select('*, clients(*)')
                .eq('access_token', id)
                .single();

            if (planError) throw planError;
            setPlan(planData);

            if (planData.clients) {
                setClient(planData.clients);
            }
        } catch (error) {
            console.error('Error loading presentation:', error);
            toast({
                title: 'Erro ao carregar',
                description: 'Não foi possível carregar os dados do planejamento.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove() {
        setApproving(true);
        try {
            const { error } = await supabase
                .from('strategic_plans')
                .update({ status: 'approved', approved_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setPlan({ ...plan, status: 'approved' });
            toast({ title: 'Planejamento Aprovado!', description: 'Nossa equipe entrará em contato para o kick-off.' });
        } catch (error: any) {
            toast({ title: 'Erro ao aprovar', description: error.message, variant: 'destructive' });
        } finally {
            setApproving(false);
        }
    }

    async function handleReject(feedback: string) {
        try {
            const { error } = await supabase
                .from('strategic_plans')
                .update({ status: 'rejected', rejection_feedback: feedback })
                .eq('id', id);

            if (error) throw error;

            setPlan({ ...plan, status: 'rejected' });
            toast({ title: 'Feedback Enviado', description: 'Revisaremos os pontos solicitados.' });
        } catch (error: any) {
            toast({ title: 'Erro ao enviar feedback', description: error.message, variant: 'destructive' });
        }
    }

    function renderSection() {
        const props = { plan, client };
        switch (currentSection) {
            case 0: return <CoverSection {...props} />;
            case 1: return <DiagnosticSection plan={plan} />;
            case 2: return <PremisesSection plan={plan} />;
            case 3: return <PersonaSection plan={plan} />;
            case 4: return <MethodologySection plan={plan} />;
            case 5: return <RoadmapSection plan={plan} />;
            case 6: return <GoalsSection plan={plan} />;
            case 7: return <ProjectionsSection plan={plan} />;
            case 8: return <InvestmentSection plan={plan} />;
            case 9: return <NextStepsSection plan={plan} onApprove={handleApprove} onReject={handleReject} approving={approving} status={plan?.status} />;
            default: return null;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-revgreen rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Encrypting Strategy...</p>
                </div>
            </div>
        );
    }

    if (!plan || !client) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Planejamento não encontrado</h1>
                    <p className="text-zinc-600 text-sm">Verifique se o link está correto ou entre em contato conosco.</p>
                </div>
            </div>
        );
    }

    const isDarkSection = currentSection === 0;

    return (
        <div className={`min-h-screen transition-colors duration-700 ${isDarkSection ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'} selection:bg-revgreen selection:text-black`}>
            {/* Premium Header */}
            <header className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b transition-colors duration-700 ${isDarkSection ? 'bg-black/50 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Brand Left */}
                    <div className="flex items-center gap-8">
                        <span className={`text-sm font-black tracking-[0.3em] uppercase select-none ${isDarkSection ? 'text-white' : 'text-black'}`}>
                            Rev<span className="text-revgreen">Hackers</span>
                        </span>

                        {/* Vertical Divider */}
                        <div className={`h-4 w-[1px] hidden md:block ${isDarkSection ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>

                        {/* Client Context */}
                        <div className="hidden md:block">
                            <span className={`text-[10px] font-black uppercase tracking-widest block leading-none mb-1 ${isDarkSection ? 'text-zinc-500' : 'text-zinc-400'}`}>Empresa</span>
                            <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkSection ? 'text-white' : 'text-black'}`}>{client.company}</span>
                        </div>
                    </div>

                    {/* Central Navigation - Pill Style */}
                    <nav className={`hidden lg:flex items-center border rounded-full px-2 py-1.5 backdrop-blur-md transition-all ${isDarkSection ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100/50 border-zinc-200'}`}>
                        {SECTIONS.map((section, index) => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(index)}
                                className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currentSection === index
                                    ? (isDarkSection ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white text-black shadow-sm ring-1 ring-zinc-200')
                                    : (isDarkSection ? 'text-zinc-500 hover:text-revgreen' : 'text-zinc-400 hover:text-black')
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </nav>

                    {/* Right Action */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCurrentSection(prev => Math.min(SECTIONS.length - 1, prev + 1))}
                            className="bg-revgreen text-black px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(3,252,59,0.2)]"
                        >
                            Próxima Seção
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={`pt-20 min-h-screen transition-colors duration-700 ${isDarkSection ? 'bg-black' : 'bg-zinc-50'}`}>
                {/* Progress Indicator (Subtle) */}
                <div className={`fixed top-20 left-0 right-0 h-[1px] z-50 transition-colors ${isDarkSection ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <div
                        className="h-full bg-revgreen shadow-[0_0_10px_rgba(3,252,59,0.5)] transition-all duration-700"
                        style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }}
                    ></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {renderSection()}
                    </div>
                </div>
            </main>

            {/* Floating Navigation Controls */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                <button
                    onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                    disabled={currentSection === 0}
                    className={`p-4 backdrop-blur-md border rounded-full transition-all disabled:opacity-30 ${isDarkSection ? 'bg-zinc-900/80 border-white/5 text-white hover:bg-zinc-800' : 'bg-white/80 border-zinc-200 text-black hover:bg-zinc-100 shadow-xl'}`}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className={`px-6 py-3 backdrop-blur-md border rounded-full transition-all ${isDarkSection ? 'bg-zinc-900/80 border-white/5' : 'bg-white/80 border-zinc-200 shadow-xl'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkSection ? 'text-white' : 'text-black'}`}>
                        {String(currentSection + 1).padStart(2, '0')} <span className={isDarkSection ? 'text-zinc-600' : 'text-zinc-300'}>/</span> {String(SECTIONS.length).padStart(2, '0')}
                    </span>
                </div>

                <button
                    onClick={() => setCurrentSection(prev => Math.min(SECTIONS.length - 1, prev + 1))}
                    disabled={currentSection === SECTIONS.length - 1}
                    className={`p-4 backdrop-blur-md border rounded-full transition-all disabled:opacity-30 ${isDarkSection ? 'bg-zinc-900/80 border-white/5 text-white hover:bg-zinc-800 border-r-revgreen/50' : 'bg-white/80 border-zinc-200 text-black hover:bg-zinc-100 shadow-xl border-r-revgreen/50'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
