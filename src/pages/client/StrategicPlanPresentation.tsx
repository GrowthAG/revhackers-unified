import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PlanEditProvider } from '@/components/plan/PlanEditContext';
import { Check, Loader2, ArrowLeft, ArrowRight, FileText, Target, BarChart3, Calendar, Users, Briefcase, TrendingUp, DollarSign, Settings, PanelLeftClose, PanelLeftOpen, Pencil, Maximize2, Minimize2, Smartphone, AlertTriangle, Lightbulb, ShieldCheck, Printer, Upload, GitBranch } from 'lucide-react';
import { EditToolbar } from '@/components/plan/PlanEditContext';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { SignatureEngine } from '@/components/legal/SignatureEngine';

// Section imports
import CoverSection from './sections/CoverSection';
import ExecutiveSummarySection from './sections/ExecutiveSummarySection';
import CurrentVsFutureSection from './sections/CurrentVsFutureSection';
import DiagnosticSymptomsSection from './sections/DiagnosticSymptomsSection';
import DiagnosticCausesSection from './sections/DiagnosticCausesSection';
import PipelineArchitectureSection from './sections/PipelineArchitectureSection';
import ThesisSection from './sections/ThesisSection';
import PremisesSection from './sections/PremisesSection';
import PersonaSection from './sections/PersonaSection';
import BenchmarkSection from './sections/BenchmarkSection';
import MethodologySection from './sections/MethodologySection';
import GoalsSection from './sections/GoalsSection';
import RoadmapMacroSection from './sections/RoadmapMacroSection';
import OnboardingKickoffSection from './sections/OnboardingKickoffSection';
import OnboardingSetupSection from './sections/OnboardingSetupSection';
import OnboardingTrainingSection from './sections/OnboardingTrainingSection';
import OnboardingAdoptionSection from './sections/OnboardingAdoptionSection';
import OnboardingHandoverSection from './sections/OnboardingHandoverSection';
import SlaSection from './sections/SlaSection';
import QuickWinsSection from './sections/QuickWinsSection';
import ProjectionsSection from './sections/ProjectionsSection';
import InvestmentSection from './sections/InvestmentSection';
import ContractOverviewSection from './sections/ContractOverviewSection';

// ── Navigation ────────────────────────────────────────────────────────────
// ── Section order reflects the narrative arc:
// 1. Show you listened (Context Mirror / Diagnosis) → 2. Show the problem (Causes) →
// 3. Show the solution (Thesis) → 4. Show the agreements (Premises) →
// 5. Show the plan (Methodology, OKRs, Roadmap) → 6. Show the execution (Onboarding) →
// 7. Close (Investment → Approval)
const NAV_SECTIONS = [
    { id: 'cover',               name: 'Capa',                   chapter: 'Fase 1 • Raio-X', icon: <FileText className="w-4 h-4" /> },
    { id: 'executive_summary',   name: 'Resumo Executivo',        chapter: 'Fase 1 • Raio-X', icon: <FileText className="w-4 h-4" /> },
    { id: 'diagnostic_symptoms', name: 'Sintomas e Cenário',      chapter: 'Fase 1 • Raio-X', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'diagnostic_causes',   name: 'Causa Raiz',              chapter: 'Fase 1 • Raio-X', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'pipeline_architecture', name: 'Arquitetura do Pipeline', chapter: 'Fase 2 • Engenharia', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'current_vs_future',   name: 'Atual vs Futuro',         chapter: 'Fase 2 • Engenharia', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'thesis',              name: 'Tese de Crescimento',     chapter: 'Fase 2 • Engenharia', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'premises',            name: 'Premissas',               chapter: 'Fase 2 • Engenharia', icon: <Target className="w-4 h-4" /> },
    { id: 'persona',             name: 'Persona',                 chapter: 'Fase 2 • Engenharia', icon: <Users className="w-4 h-4" /> },
    { id: 'benchmark',           name: 'Análise de Mercado',      chapter: 'Fase 2 • Engenharia', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'methodology',         name: 'Metodologia',             chapter: 'Fase 3 • Estratégia', icon: <Settings className="w-4 h-4" /> },
    { id: 'goals',               name: 'Metas e Indicadores',     chapter: 'Fase 3 • Estratégia', icon: <Target className="w-4 h-4" /> },
    { id: 'roadmap_macro',       name: 'Marcos do Projeto',       chapter: 'Fase 3 • Estratégia', icon: <Calendar className="w-4 h-4" /> },
    { id: 'quick_wins',          name: 'Primeiros 7 Dias',        chapter: 'Fase 3 • Estratégia', icon: <Calendar className="w-4 h-4" /> },
    { id: 'contract_overview',   name: 'Acordo Definitivo',       chapter: 'Horizonte 1 • Execução', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'onboarding_kickoff',  name: 'Alinhamento & Kickoff',   chapter: 'Horizonte 1 • Execução', icon: <Calendar className="w-4 h-4" /> },
    { id: 'onboarding_setup',    name: 'Setup & Arquitetura',     chapter: 'Horizonte 1 • Execução', icon: <Settings className="w-4 h-4" /> },
    { id: 'onboarding_training', name: 'Treinamento & Produção',  chapter: 'Horizonte 1 • Execução', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'onboarding_adoption', name: 'Adoção & Mapeamento',     chapter: 'Horizonte 1 • Execução', icon: <Target className="w-4 h-4" /> },
    { id: 'onboarding_handover', name: 'Passagem de Bastão',      chapter: 'Horizonte 2 • Sustentação', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'sla',                 name: 'Regras do Jogo',          chapter: 'Horizonte 2 • Sustentação', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'projections',         name: 'Projeções',               chapter: 'Horizonte 2 • Sustentação', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'investment',          name: 'Investimento',            chapter: 'Horizonte 2 • Sustentação', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'approval',            name: 'Aprovação',               chapter: 'Horizonte 2 • Sustentação', icon: <Check className="w-4 h-4" /> },
];

function getStatusBadge(status: string) {
    if (status === 'approved') return { label: 'Aprovado', cls: 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/30' };
    if (status === 'revision_requested') return { label: 'Revisão Solicitada', cls: 'bg-zinc-100 text-zinc-600 border border-zinc-300' };
    if (status === 'viewed') return { label: 'Visualizado', cls: 'bg-zinc-100 text-zinc-600 border border-zinc-200' };
    return { label: 'Enviado', cls: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
}

function getProjectLabel(pt?: string) {
    if (pt === 'crm_ops') return 'Máquina de Vendas';
    if (pt === 'funnels_impl' || pt === 'site') return 'Site & Funil';
    if (pt === 'founder') return 'Founder';
    if (pt === 'content_seo') return 'SEO';
    if (pt === 'consulting' || pt === 'full') return 'Estratégico';
    return 'Estratégico';
}


export default function StrategicPlanPresentation() {
    const { token } = useParams<{ token: string }>();
    const location = useLocation();
    const [plan, setPlan] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [dealSlug, setDealSlug] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    const activeCompanyName = plan?.rei_projects?.trade_name || plan?.cover_data?.company_override || client?.trade_name || client?.company || 'Cliente';

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Planejamento_Estrategico_${activeCompanyName.replace(/\s+/g, '_')}`,
    });

    // Clean up external chat widgets (GHL, etc.) - they should NOT appear on presentation pages
    useEffect(() => {
        const cleanupChatWidgets = () => {
            const selectors = [
                'chat-widget',
                '#leadconnector-chat-widget',
                '[id*="leadconnector"]',
                '[class*="leadconnector"]',
                'iframe[src*="leadconnectorhq"]',
                'iframe[src*="widget.leadconnectorhq"]',
                'div[data-chat-widget]',
                '#hl-chat-widget-container',
                '#hl-chat-widget-bubble',
                '.hl-chat-widget',
                '#ghl-chat-script',
                '[id*="gptengineer"]',
                '[class*="gptengineer"]',
            ];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });
        };
        cleanupChatWidgets();
        // Run again after a delay (widgets may load asynchronously)
        const timer1 = setTimeout(cleanupChatWidgets, 2000);
        const timer2 = setTimeout(cleanupChatWidgets, 5000);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);
    const [approving, setApproving] = useState(false);
    const [showApproved, setShowApproved] = useState(false);
    const [approvedName, setApprovedName] = useState('');
    const [contractAccepted, setContractAccepted] = useState(false);
    const [showSign, setShowSign] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectText, setRejectText] = useState('');
    const [rejecting, setRejecting] = useState(false);
    const [rejectSent, setRejectSent] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const params = new URLSearchParams(location.search);
    const isPresentation = params.get('present') === '1';
    const [isEditing, setIsEditing] = useState(params.get('edit') === '1');
    const [sidebarOpen, setSidebarOpen] = useState(!isPresentation);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.warn('Fullscreen not supported:', err);
        }
    }, []);

    const onPlanUpdate = (updated: any) => setPlan(updated);

    // Filter sections based on project type
    const sections = NAV_SECTIONS.filter(s => {
        const pt = plan?.rei_projects?.type || plan?.project_type || 'full';

        // Projections only for growth/funnel types (requires media investment data)
        if (s.id === 'projections') {
            return pt === 'full' || pt === 'consulting' || pt === 'funnels_impl' || pt === 'content_seo' || !pt;
        }

        // Investment hidden for CRM/onboarding - o cliente já está em operação, não faz sentido falar em investimento
        if (s.id === 'investment') {
            return pt !== 'crm_ops';
        }

        // Persona and Benchmark: now visible for all project types including CRM Ops
        if (s.id === 'persona' || s.id === 'benchmark') {
            return true;
        }

        return true;
    });

    // Load plan
    useEffect(() => {
        loadPlan();
    }, [token]);

    // Mark as viewed
    useEffect(() => {
        if (plan && plan.status === 'sent') markViewed();
    }, [plan?.id]);

    // Auto-show sign modal
    useEffect(() => {
        if (!loading && plan && plan.status !== 'approved' && params.get('sign') === '1') setShowSign(true);
    }, [loading, plan?.id, location.search]);

    // Track read sections
    useEffect(() => {
        if (!plan?.id) return;
        const sectionId = NAV_SECTIONS[currentIndex]?.id;
        if (!sectionId) return;
        const timeout = setTimeout(async () => {
            try {
                const existing = plan.next_steps_data || {};
                const read = existing.read_sections || [];
                if (!read.includes(sectionId)) {
                    await supabase.from('strategic_plans').update({ next_steps_data: { ...existing, read_sections: [...read, sectionId] } }).eq('id', plan.id);
                }
            } catch (trackErr) {
                console.warn('[plan-tracking] falha ao registrar seção lida:', trackErr);
            }
        }, 3000);
        return () => clearTimeout(timeout);
    }, [currentIndex, plan?.id]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (showSign || showRejectModal) return;
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === 'textarea' || tag === 'input') return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCurrentIndex(i => Math.min(i + 1, sections.length - 1)); scrollToTop(); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCurrentIndex(i => Math.max(i - 1, 0)); scrollToTop(); }
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
            if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSidebarOpen(prev => !prev); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [sections.length, showSign, showRejectModal, toggleFullscreen]);

    // Fullscreen change listener
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    async function loadPlan() {
        if (!token) { setLoading(false); return; }
        try {
            // RPCs publicas escopadas por token/nome - RLS anonima fechada,
            // ver 20260718000002_secure_strategic_plans_proposals.sql
            const { data, error } = await (supabase as any)
                .rpc('get_public_strategic_plan', { p_token: token })
                .single();
            if (error) throw error;
            setPlan(data);
            if (data.client_id) {
                const { data: cl } = await supabase.from('clients').select('*').eq('id', data.client_id).single();
                if (cl) setClient(cl);
            }

            // Try to find if there is a Deal Room proposal for this client
            const clientName = (data as any)?.client_company || (data as any)?.client_name;
            if (clientName) {
                const { data: dealSlugData } = await (supabase as any)
                    .rpc('get_proposal_slug_by_client', { p_client_name: clientName });
                if (dealSlugData) {
                    setDealSlug(dealSlugData);
                }
            }
        } catch (err) { console.error('Erro ao carregar plano:', err); }
        finally { setLoading(false); }
    }

    async function markViewed() {
        if (!plan) return;
        await supabase.from('strategic_plans').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', plan.id);
    }

    async function handleReject() {
        if (!plan || !rejectText.trim()) return;
        setRejecting(true);
        try {
            const existing = plan.next_steps_data || {};
            await supabase.from('strategic_plans').update({
                status: 'revision_requested', rejected_at: new Date().toISOString(),
                next_steps_data: { ...existing, adjustment_notes: rejectText.trim(), adjustment_requested_at: new Date().toISOString() },
            }).eq('id', plan.id);
            setPlan({ ...plan, status: 'revision_requested' });
            setRejectSent(true);
            setTimeout(() => { setShowRejectModal(false); setRejectSent(false); setRejectText(''); }, 2500);
        } catch (err) { console.error('Erro ao solicitar ajuste:', err); }
        finally { setRejecting(false); }
    }

    function goPrev() { if (currentIndex > 0) { setCurrentIndex(i => i - 1); scrollToTop(); } }
    function goNext() { 
        if (sections[currentIndex]?.id === 'contract_overview' && !contractAccepted) return;
        if (currentIndex < sections.length - 1) { setCurrentIndex(i => i + 1); scrollToTop(); } 
    }

    // ── Loading ─────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-zinc-700 border-t-[#00CC6A] rounded-full animate-spin mx-auto mb-6" />
                <p className="text-zinc-500 text-sm tracking-widest uppercase">Carregando planejamento</p>
            </div>
        </div>
    );

    // ── Not found ───────────────────────────────────────────────────────────
    if (!plan) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold text-black mb-4">Planejamento não encontrado</h1>
                <p className="text-zinc-500 text-sm">Verifique se o link está correto ou entre em contato conosco.</p>
            </div>
        </div>
    );

    // ── Variables ───────────────────────────────────────────────────────────
    const companyName = client?.company || 'Cliente';
    const currentSectionId = sections[currentIndex]?.id;
    const currentChapter = sections[currentIndex]?.chapter || '';
    const progress = ((currentIndex + 1) / sections.length) * 100;
    const isApproved = plan.status === 'approved';
    const isRejected = plan.status === 'revision_requested';
    const badge = getStatusBadge(plan.status || 'sent');
    const typeLabel = getProjectLabel(plan?.rei_projects?.type || plan?.project_type);
    
    // Gerar URL do QR Code (garante que puxe a url base certa e adicione ?sign=1 para disparar o modal no celular)
    const signUrl = `${window.location.origin}/plan/${token}?sign=1`;

    // ── Section renderer ───────────────────────────────────────────────────
    const renderSectionById = (id: string) => {
        switch (id) {
            case 'cover': return <CoverSection plan={plan} client={client} />;
            case 'executive_summary': return <ExecutiveSummarySection plan={plan} />;
            case 'diagnostic_symptoms': return <DiagnosticSymptomsSection plan={plan} />;
            case 'diagnostic_causes': return <DiagnosticCausesSection plan={plan} />;
            case 'pipeline_architecture': return <PipelineArchitectureSection plan={plan} />;
            case 'current_vs_future': return <CurrentVsFutureSection plan={plan} />;
            case 'thesis': return <ThesisSection plan={plan} />;
            case 'premises': return <PremisesSection plan={plan} />;
            case 'persona': return <PersonaSection plan={plan} />;
            case 'benchmark': return <BenchmarkSection plan={plan} />;
            case 'methodology': return <MethodologySection plan={plan} />;
            case 'roadmap_macro': return <RoadmapMacroSection plan={plan} />;
            case 'quick_wins': return <QuickWinsSection plan={plan} />;
            case 'contract_overview': return <ContractOverviewSection plan={plan} project={plan?.rei_projects} contractAccepted={contractAccepted} setContractAccepted={setContractAccepted} />;
            case 'onboarding_kickoff': return <OnboardingKickoffSection plan={plan} />;
            case 'onboarding_setup': return <OnboardingSetupSection plan={plan} />;
            case 'onboarding_training': return <OnboardingTrainingSection plan={plan} clientName={activeCompanyName} />;
            case 'onboarding_adoption': return <OnboardingAdoptionSection plan={plan} />;
            case 'onboarding_handover': return <OnboardingHandoverSection plan={plan} />;
            case 'sla': return <SlaSection plan={plan} client={client} />;
            case 'goals': return <GoalsSection plan={plan} />;
            case 'projections': return <ProjectionsSection plan={plan} />;
            case 'investment': return <InvestmentSection plan={plan} />;
            case 'approval': return (
                <div className="flex flex-col items-center justify-center min-vh-70 text-center px-6 print:hidden mt-20 mb-20">
                    <div className="max-w-5xl w-full mx-auto">
                    {isApproved ? (
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-6 "><Check className="w-8 h-8 text-[#00CC6A]" /></div>
                            <h2 className="text-3xl font-black text-black mb-3">Planejamento Aprovado</h2>
                            <p className="text-zinc-500 text-sm mb-2">Assinado por <strong>{plan.next_steps_data?.approved_by_name || 'cliente'}</strong></p>
                            <p className="text-zinc-500 text-sm mb-8">Nossa equipe já está em ação. Você receberá as próximas etapas em até 24h.</p>
                            
                            <div className="bg-zinc-50 border border-zinc-200 p-6 text-left">
                                <span className="text-xxs font-bold uppercase tracking-widest text-[#00CC6A] mb-2 block">Passo 2 / 2</span>
                                <h3 className="text-lg font-black text-zinc-900 mb-2">Anexar Materiais do Projeto</h3>
                                <p className="text-xs text-zinc-500 mb-6">Envie agora os acessos, planilhas, logos ou arquivos necessários para iniciarmos a execução do projeto sem atrasos.</p>
                                
                                <button 
                                    onClick={() => window.open(`/upload-materiais/${plan.rei_projects?.id || plan.project_id}`, '_blank')}
                                    className="w-full py-3 bg-zinc-900 text-white text-sm font-bold rounded-none hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" /> Enviar Arquivos e Acessos
                                </button>
                                
                                {plan.next_steps_data?.certificate_hash && (
                                    <button 
                                        onClick={() => window.open(`/legal/certificado/${plan.next_steps_data.certificate_hash}`, '_blank')}
                                        className="w-full mt-3 py-3 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-none hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-[#00CC6A]" /> Visualizar Cofre Legal (Certificado)
                                    </button>
                                )}
                            </div>

                            <div className="mt-12 pt-6 border-t border-zinc-200"><span className="text-xs text-zinc-400 uppercase tracking-widest">▲ RevHackers Growth Hub</span></div>
                        </div>
                    ) : isRejected ? (
                        <div className="bg-white border border-zinc-200 p-10 md:p-14 text-center max-w-2xl mx-auto">
                            <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-6 h-6 text-zinc-900 animate-spin" />
                            </div>
                            <h3 className="text-2xl font-black text-black mb-3">Reconstrução em Andamento</h3>
                            <p className="text-zinc-500 text-sm max-w-md mx-auto">
                                Nossa IA Especialista (REI) está analisando seus apontamentos e gerando uma nova versão otimizada do planejamento estratégico.
                            </p>
                            <div className="mt-8 pt-6 border-t border-zinc-100">
                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">REVENUE ENGINE INTELLIGENCE™</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-left">
                            
                            {/* Left Side: Copy */}
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 mb-4 leading-tight">
                                    Autorização e Assinatura
                                </h2>
                                <p className="text-reading text-zinc-500 font-medium leading-[1.6] mb-8 pr-4">
                                    Revisamos juntos o cenário, as metas e o plano de ação prático. Se estiver tudo alinhado, assine digitalmente para dar o OK e nossa equipe iniciar a execução.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={() => setShowSign(true)} 
                                        className="flex-1 bg-zinc-950 text-white font-bold py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                                    >
                                        <Check className="w-4 h-4" /> Assinar Agora
                                    </button>
                                    <button 
                                        onClick={() => setShowRejectModal(true)} 
                                        className="flex-1 bg-white border border-zinc-200 text-zinc-600 font-bold py-3.5 px-6 flex items-center justify-center hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                                    >
                                        Solicitar Ajuste
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: QR Code Card */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 w-full max-w-sm flex flex-col items-center text-center bg-white relative">
                                    <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center mb-5 shrink-0">
                                        <Smartphone className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-zinc-900 mb-2">Assinatura Rápida no Celular</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 px-2">
                                        Aponte a câmera para assinar na própria tela do celular e envie a autorização direto para nossa equipe, sem burocracia.
                                    </p>
                                    <div className="border border-zinc-100 p-2 mb-8">
                                        <QRCodeSVG value={signUrl} size={180} level="M" fgColor="#09090b" />
                                    </div>
                                    <div className="bg-[#00CC6A]/10 px-4 py-1.5 rounded uppercase tracking-[0.2em] font-black text-xxs text-[#00CC6A]">
                                        Válido Assinatura Digital
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            );
            default: return null;
        }
    };

    // ── Main render ─────────────────────────────────────────────────────────
    return (
        <PlanEditProvider plan={plan} planId={plan.id} isEditing={isEditing} onPlanUpdate={onPlanUpdate}>
            {/* Approved celebration overlay */}
            {showApproved && (
                <div className="fixed inset-0 bg-zinc-950 z-[60] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 border-2 border-[#00CC6A] flex items-center justify-center mx-auto mb-8"><Check className="w-10 h-10 text-[#00CC6A]" /></div>
                        <h2 className="text-3xl font-black text-white mb-3">Planejamento Aprovado</h2>
                        <p className="text-white/50 text-sm mb-2">Assinado por <strong className="text-white">{plan.next_steps_data?.approved_by_name || approvedName}</strong></p>
                        <p className="text-white/30 text-xs mb-8">Nossa equipe já está em ação. Você receberá as próximas etapas em até 24h.</p>
                        
                        <button 
                            onClick={() => window.open(`/upload-materiais/${plan.rei_projects?.id || plan.project_id}`, '_blank')}
                            className="w-full py-3 bg-[#00CC6A] text-black text-sm font-bold rounded-none hover:bg-[#00CC6A]/90 transition-colors flex items-center justify-center gap-2 mb-4"
                        >
                            <Upload className="w-4 h-4" /> Passo 2: Enviar Materiais do Projeto
                        </button>
                        
                        <button onClick={() => setShowApproved(false)} className="px-8 py-3 border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white transition-colors">Voltar para o Documento</button>
                    </div>
                </div>
            )}

            {/* Sign modal */}
            {showSign && !isApproved && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto pt-20 pb-20">
                    <div className="max-w-xl w-full" onClick={e => e.stopPropagation()}>
                        <SignatureEngine 
                            projectId={plan.rei_projects?.id || plan.project_id}
                            referenceType="strategic_plan"
                            referenceId={plan.id}
                            documentContentToHash={JSON.stringify({ ...plan.sla_data, legal_ratification: "RATIFICO O ESCOPO, METAS, CONDIÇÕES COMERCIAIS E PRAZOS DO ACORDO DEFINITIVO LIDOS E ACEITOS NESTA SESSÃO." })}
                            isOpen={showSign}
                            onSuccess={async (signerData) => {
                                // Update native plan status
                                await supabase.from('strategic_plans').update({
                                    status: 'approved',
                                    approved_at: new Date().toISOString(),
                                    next_steps_data: { 
                                        ...(plan.next_steps_data || {}), 
                                        approved_by_name: signerData.name, 
                                        approved_by_email: signerData.email, 
                                        approved_by_cpf: signerData.cpf,
                                        approved_at_iso: new Date().toISOString(),
                                        certificate_hash: signerData.hash
                                    },
                                }).eq('id', plan.id);
                                
                                setPlan({ ...plan, status: 'approved', next_steps_data: { ...(plan.next_steps_data || {}), approved_by_name: signerData.name, certificate_hash: signerData.hash } });
                                setApprovedName(signerData.name);
                                setShowSign(false);
                                setShowApproved(true);

                                // Dispara criação de sprints no ClickUp com feedback.
                                // Pre-requisito: workspace_status='ready' (folder criado após assinatura do kickoff).
                                const projectIdForClickup = plan.rei_projects?.id || plan.project_id;
                                if (projectIdForClickup) {
                                    try {
                                        const { error: sprintError } = await supabase.functions
                                            .invoke('clickup-sprint-orchestrator', {
                                                body: { project_id: projectIdForClickup, triggered_by: 'plan_approval' },
                                            });
                                        if (sprintError) {
                                            console.error('[clickup-sprint] erro no disparo:', sprintError);
                                        }
                                    } catch (err) {
                                        console.error('[clickup-sprint] falha crítica no disparo:', err);
                                    }
                                }
                            }}
                        />
                        <button onClick={() => setShowSign(false)} className="w-full mt-4 py-3 text-zinc-400 text-xs font-semibold hover:text-white transition-colors">Encerrar Criptografia e Voltar</button>
                    </div>
                </div>
            )}

            {/* Reject modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white max-w-xl w-full border border-zinc-200 p-8 shadow-sm relative" onClick={e => e.stopPropagation()}>
                        {rejectSent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-[#00CC6A]" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 mb-2">Solicitação enviada</h3>
                                <p className="text-sm text-zinc-500">Nossa Inteligência Artificial está processando seu pedido.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">Solicitar Refatoração da IA</h3>
                                        <p className="text-sm text-zinc-500">Aponte o que precisa mudar no plano {typeLabel}.</p>
                                    </div>
                                </div>
                                
                                <textarea 
                                    value={rejectText} 
                                    onChange={e => setRejectText(e.target.value)} 
                                    placeholder="Descreva o que sentiu falta, o que precisa ser ajustado ou alguma regra de negócio que deve ser adicionada..." 
                                    className="w-full min-h-[160px] resize-none border border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 p-4 text-body font-medium text-zinc-700 outline-none leading-relaxed placeholder:text-zinc-400"
                                />
                                
                                <div className="flex items-center justify-end gap-3 mt-8">
                                    <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 hover:bg-zinc-50 text-sm font-bold text-zinc-600 transition-colors border border-transparent hover:border-zinc-200">
                                        Cancelar
                                    </button>
                                    <button onClick={handleReject} disabled={!rejectText.trim() || rejecting} className="px-8 py-3 bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center gap-2">
                                        {rejecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : 'Enviar para Inteligência'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Toolbar (only visible in edit mode) */}
            <EditToolbar />

            <div className="h-screen bg-white flex flex-col overflow-hidden">
                {/* Top Progress Bar - hidden in fullscreen */}
                {!isFullscreen && (
                    <div className="w-full h-1 bg-zinc-100 shrink-0 print:hidden">
                        <div
                            className="h-full bg-zinc-900 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation - hidden in fullscreen */}
                    <aside className={`shrink-0 bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 print:hidden ${isFullscreen ? 'w-0 overflow-hidden border-r-0' : sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'}`}>
                        {sidebarOpen && (
                            <>
                                {/* Sidebar Header */}
                                <div className="px-4 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                                    <div>
                                        <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 block">{typeLabel}</span>
                                        <span className="text-xs font-bold text-zinc-700 truncate block mt-0.5">{activeCompanyName}</span>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                        title="Fechar menu"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Section List grouped by chapter */}
                                <nav className="flex-1 overflow-y-auto py-2">
                                    {(() => {
                                        const chapters: { name: string; items: typeof sections }[] = [];
                                        let lastChapter = '';
                                        for (const sec of sections) {
                                            if (sec.chapter !== lastChapter) {
                                                chapters.push({ name: sec.chapter, items: [] });
                                                lastChapter = sec.chapter;
                                            }
                                            chapters[chapters.length - 1].items.push(sec);
                                        }
                                        const readSections = plan?.next_steps_data?.read_sections || [];
                                        return chapters.map((chapter, ci) => (
                                            <div key={ci} className="mb-1">
                                                <div className="px-4 pt-3 pb-1">
                                                    <span className="text-2xs font-black uppercase tracking-[0.25em] text-zinc-300">
                                                        {chapter.name}
                                                    </span>
                                                </div>
                                                {chapter.items.map((sec) => {
                                                    const idx = sections.indexOf(sec);
                                                    const isActive = idx === currentIndex;
                                                    const isRead = readSections.includes(sec.id);
                                                    return (
                                                        <button
                                                            key={sec.id}
                                                            onClick={() => { setCurrentIndex(idx); scrollToTop(); }}
                                                            className={`w-full text-left px-4 py-2 flex items-center gap-2.5 transition-all text-tiny font-medium ${
                                                                isActive
                                                                    ? 'bg-zinc-950 text-white'
                                                                    : isRead
                                                                    ? 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                                                    : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
                                                            }`}
                                                        >
                                                            <span className={`shrink-0 ${isActive ? 'text-white' : isRead ? 'text-zinc-400' : 'text-zinc-300'}`}>
                                                                {sec.icon}
                                                            </span>
                                                            <span className="truncate">{sec.name}</span>
                                                            {isRead && !isActive && (
                                                                <Check className="w-3 h-3 text-[#00CC6A] shrink-0 ml-auto" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ));
                                    })()}
                                </nav>

                                {/* Sidebar Footer - Status */}
                                <div className="px-4 py-3 border-t border-zinc-100 shrink-0">
                                    <span className={`text-xxs font-black uppercase tracking-widest px-2.5 py-1 inline-block ${badge.cls}`}>
                                        {badge.label}
                                    </span>
                                </div>
                            </>
                        )}
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        {/* Fullscreen hover zone - invisible trigger area at bottom of screen */}
                        {isFullscreen && (
                            <div className="fixed bottom-0 left-0 right-0 h-20 z-30 print:hidden group/fs">
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-zinc-200/80 p-1.5 shadow-sm opacity-0 group-hover/fs:opacity-100 translate-y-4 group-hover/fs:translate-y-0 transition-all duration-300">
                                    <button
                                        onClick={goPrev}
                                        disabled={currentIndex === 0}
                                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div className="px-3 flex items-center gap-3">
                                        <span className="text-tiny font-mono text-zinc-900 font-bold tracking-widest whitespace-nowrap">
                                            {currentIndex + 1} <span className="text-zinc-300 mx-1">/</span> {sections.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={goNext}
                                        disabled={currentIndex === sections.length - 1}
                                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-200 mx-1" />
                                    <button
                                        onClick={toggleFullscreen}
                                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                        title="Sair da Tela Cheia"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Floating Navigation Controls (Bottom Center) - hidden in fullscreen */}
                        {!isFullscreen && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-zinc-200/80 p-1.5 shadow-sm print:hidden transition-all duration-300 hover:bg-white">
                            {/* Sidebar toggle */}
                            {!sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                    title="Abrir menu"
                                >
                                    <PanelLeftOpen className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Voltar"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div className="px-3 flex items-center gap-3">
                                {currentChapter && (
                                    <span className="hidden sm:inline-flex text-xxs font-bold text-zinc-500 bg-zinc-100/80 px-2 py-1 uppercase tracking-[0.2em]">{currentChapter}</span>
                                )}
                                <span className="text-tiny font-mono text-zinc-900 font-bold tracking-widest whitespace-nowrap">
                                    {currentIndex + 1} <span className="text-zinc-300 mx-1">/</span> {sections.length}
                                </span>
                            </div>

                            <button
                                onClick={goNext}
                                disabled={currentIndex === sections.length - 1 || (sections[currentIndex]?.id === 'contract_overview' && !contractAccepted)}
                                className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Avançar"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="w-px h-5 bg-zinc-200 mx-1" />

                            <button
                                onClick={() => setIsEditing(prev => !prev)}
                                className={`p-2.5 transition-all ${isEditing ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                                title={isEditing ? 'Desativar Edição' : 'Ativar Edição'}
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => handlePrint()}
                                className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                title="Baixar PDF"
                            >
                                <Printer className="w-4 h-4" />
                            </button>

                            <button
                                onClick={toggleFullscreen}
                                className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                title="Tela Cheia"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                        )}

                        {/* Main content - Full Screen Format */}
                        <div ref={scrollRef} className="w-full flex-1 overflow-y-auto bg-white flex flex-col relative scroll-smooth print:hidden">
                            {/* Slide container - Full bleed no margins */}
                            <div className="w-full h-full flex flex-col print:hidden">
                                {renderSectionById(currentSectionId)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Printable Container for PDF Export */}
                <div className="hidden print:block w-full bg-white">
                    <div ref={printRef} className="plan-presentation-content w-full bg-white flex flex-col">
                        <style type="text/css" media="print">
                            {`
                                @page { size: landscape; margin: 0; }
                                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                .print-page { width: 100vw; min-height: 100vh; page-break-after: always; overflow: visible; position: relative; display: flex; flex-direction: column; }
                                .print-hidden { display: none !important; }
                            `}
                        </style>
                        {sections.map(s => (
                            <div key={s.id} className="print-page bg-white">
                                {renderSectionById(s.id)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PlanEditProvider>
    );
}
