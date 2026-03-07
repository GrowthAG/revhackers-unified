import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Pencil } from 'lucide-react';
import {
    ChevronLeft, ChevronRight, Check, LayoutDashboard, BarChart2,
    Target, Users, Microscope, Calendar, TrendingUp, DollarSign,
    Wallet, X, PartyPopper, Play
} from 'lucide-react';

// ── CONFETTI OVERLAY (puro CSS — sem dependências) ────────────────────────────
const CONFETTI_COLORS = ['#00CC6A', '#00FF85', '#ffffff', '#a3e635', '#34d399', '#6ee7b7'];
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.round(-180 + (i / 17) * 360),
    y: Math.round(-320 - Math.random() * 200),
    r: Math.round(Math.random() * 360),
    size: 6 + (i % 3) * 3,
    delay: (i * 0.06).toFixed(2),
}));

function SuccessOverlay({ name, email, onClose }: { name: string; email: string; onClose: () => void }) {
    React.useEffect(() => {
        const t = setTimeout(onClose, 5000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95"
            style={{ animation: 'fadeInOverlay 0.4s ease' }}
        >
            <style>{`
                @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
                @keyframes confettiBurst {
                    0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translate(var(--cx), var(--cy)) rotate(var(--cr)) scale(0.3); opacity: 0; }
                }
                @keyframes scaleIn { from { transform: scale(0.7); opacity: 0 } to { transform: scale(1); opacity: 1 } }
            `}</style>

            {/* Confetti particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {PARTICLES.map(p => (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size * (p.id % 2 === 0 ? 1 : 2.5),
                            backgroundColor: p.color,
                            borderRadius: p.id % 3 === 0 ? '50%' : '1px',
                            animation: `confettiBurst 1.4s cubic-bezier(.2,.8,.4,1) ${p.delay}s both`,
                            '--cx': `${p.x}px`,
                            '--cy': `${p.y}px`,
                            '--cr': `${p.r}deg`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Card central */}
            <div
                className="relative bg-zinc-900 border border-zinc-700 px-12 py-10 text-center max-w-sm w-full"
                style={{ animation: 'scaleIn 0.5s cubic-bezier(.2,1.3,.4,1) 0.2s both' }}
            >
                <div className="w-14 h-14 bg-[#00CC6A]/10 border border-[#00CC6A]/30 flex items-center justify-center mx-auto mb-5">
                    <Check className="w-7 h-7 text-[#00CC6A]" />
                </div>
                <h2 className="text-white font-bold text-xl mb-1">Planejamento Aprovado</h2>
                <p className="text-zinc-400 text-sm mb-6">Obrigado pela confiança. Vamos crescer juntos.</p>
                <div className="border-t border-zinc-800 pt-5 space-y-1 text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Assinado por</p>
                    <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Georgia, serif' }}>{name}</p>
                    <p className="text-zinc-400 text-xs">{email}</p>
                    <p className="text-zinc-600 text-xs font-mono mt-1">{new Date().toLocaleString('pt-BR')}</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full py-2.5 bg-[#00CC6A] text-black text-xs font-black hover:bg-[#00FF85] transition-colors"
                >
                    Ver Planejamento
                </button>
            </div>
        </div>
    );
}

import CoverSection from './sections/CoverSection';
import DiagnosticSection from './sections/DiagnosticSection';
import PremisesSection from './sections/PremisesSection';
import PersonaSection from './sections/PersonaSection';
import MethodologySection from './sections/MethodologySection';
import OnboardingSection from './sections/OnboardingSection';
import GoalsSection from './sections/GoalsSection';
import ProjectionsSection from './sections/ProjectionsSection';
import InvestmentSection from './sections/InvestmentSection';
import NextStepsSection from './sections/NextStepsSection';
import BenchmarkSection from './sections/BenchmarkSection';
import VideoSection from './sections/VideoSection';
import { PlanEditProvider, PlanEditBar } from '@/components/plan/PlanEditContext';

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
    next_steps_data: any;
    status: string;
    created_at: string;
    access_token?: string;
    project_type?: string;
}

interface Client {
    id: string;
    company: string;
    name?: string;
    logo_url?: string;
    email?: string;
    contact_email?: string;
}

const ALL_SECTIONS = [
    { id: 'cover', name: 'Capa', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'video', name: 'Reunião', icon: <Play className="w-4 h-4" /> },
    { id: 'premises', name: 'Premissas', icon: <Target className="w-4 h-4" /> },
    { id: 'diagnostic', name: 'Diagnóstico', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'persona', name: 'Persona', icon: <Users className="w-4 h-4" /> },
    { id: 'benchmark', name: 'Análise de Mercado', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'methodology', name: 'Metodologia', icon: <Microscope className="w-4 h-4" /> },
    { id: 'goals', name: 'Metas e Indicadores', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cronograma', name: 'Cronograma 90 Dias', icon: <Calendar className="w-4 h-4" /> },
    { id: 'projections', name: 'Projeções', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'investment', name: 'Investimento', icon: <Wallet className="w-4 h-4" />, optional: true },
    { id: 'approval', name: 'Aprovação', icon: <Check className="w-4 h-4" /> },
];

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
function statusBadge(status: string) {
    if (status === 'approved') return { label: 'Aprovado', cls: 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/30' };
    if (status === 'revision_requested') return { label: 'Revisão Solicitada', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    if (status === 'viewed') return { label: 'Visualizado', cls: 'bg-zinc-100 text-zinc-600 border border-zinc-200' };
    return { label: 'Enviado', cls: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
}

export default function StrategicPlanPresentation() {
    const { token } = useParams<{ token: string }>();
    const location = useLocation();
    const [plan, setPlan] = useState<StrategicPlan | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [signedName, setSignedName] = useState('');

    // Modal de aprovação (assinatura digital)
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [signerName, setSignerName] = useState('');
    const [signerEmail, setSignerEmail] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    // Modal de ajustes
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustmentNotes, setAdjustmentNotes] = useState('');
    const [submittingAdjust, setSubmittingAdjust] = useState(false);
    const [adjustSent, setAdjustSent] = useState(false);

    const mainRef = React.useRef<HTMLElement>(null);
    const scrollToTop = () => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    // ── EDIT MODE (toggleable) ─────────────────────────────────────
    const searchParams = new URLSearchParams(location.search);
    const [isPlanEditMode, setIsPlanEditMode] = useState(searchParams.get('edit') === '1');
    const isPresentMode = searchParams.get('present') === '1';

    const handlePlanUpdate = (updatedPlan: any) => {
        setPlan(updatedPlan);
    };

    const sections = ALL_SECTIONS.filter(s => {
        if (s.id === 'investment') {
            const projType = plan?.project_type || 'full';
            return projType === 'full' || projType === 'content_seo' || !projType;
        }
        return true;
    });

    useEffect(() => { loadPlan(); }, [token]);
    useEffect(() => { if (plan && plan.status === 'sent') markAsViewed(); }, [plan?.id]);

    // Auto-open signing modal when ?sign=1 is in the URL
    useEffect(() => {
        if (!loading && plan && plan.status !== 'approved') {
            const params = new URLSearchParams(location.search);
            if (params.get('sign') === '1') {
                setShowApproveModal(true);
            }
        }
    }, [loading, plan?.id, location.search]);

    // ── SECTION READ TRACKING (must be before early returns) ──────────────────
    const sectionRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!plan?.id) return;
        const id = ALL_SECTIONS[currentSection]?.id;
        if (!id) return;
        const t = setTimeout(async () => {
            try {
                const existing = plan.next_steps_data || {};
                const prevRead: string[] = existing.read_sections || [];
                if (!prevRead.includes(id)) {
                    await supabase.from('strategic_plans').update({
                        next_steps_data: { ...existing, read_sections: [...prevRead, id] }
                    } as any).eq('id', plan.id);
                }
            } catch (_) { /* non-critical */ }
        }, 3000);
        return () => clearTimeout(t);
    }, [currentSection, plan?.id]);

    async function loadPlan() {
        if (!token) { setLoading(false); return; }
        try {
            const { data: planData, error } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('access_token', token)
                .single();
            if (error) throw error;
            setPlan(planData);
            if (planData.client_id) {
                const { data: clientData } = await supabase
                    .from('clients').select('*').eq('id', planData.client_id).single();
                if (clientData) setClient(clientData);
            }
        } catch (err) {
            console.error('Erro ao carregar plano:', err);
        } finally {
            setLoading(false);
        }
    }

    async function markAsViewed() {
        if (!plan) return;
        await supabase.from('strategic_plans')
            .update({ status: 'viewed', viewed_at: new Date().toISOString() })
            .eq('id', plan.id);
    }

    async function handleApprove() {
        if (!plan || !signerName.trim() || !signerEmail.trim() || !confirmed) return;
        setApproving(true);
        try {
            const existing = plan.next_steps_data || {};
            const now = new Date().toISOString();
            const { error } = await supabase.from('strategic_plans').update({
                status: 'approved',
                approved_at: now,
                next_steps_data: {
                    ...existing,
                    approved_by_name: signerName.trim(),
                    approved_by_email: signerEmail.trim().toLowerCase(),
                    approved_at_iso: now,
                },
            } as any).eq('id', plan.id);
            if (error) throw error;
            setSignedName(signerName.trim());
            setPlan({
                ...plan,
                status: 'approved',
                next_steps_data: {
                    ...(plan.next_steps_data || {}),
                    approved_by_name: signerName.trim(),
                    approved_by_email: signerEmail.trim().toLowerCase(),
                },
            });
            setShowApproveModal(false);
            setShowSuccessOverlay(true);
        } catch (err) {
            console.error('Erro ao aprovar:', err);
        } finally {
            setApproving(false);
        }
    }

    async function handleRequestAdjustment() {
        if (!plan || !adjustmentNotes.trim()) return;
        setSubmittingAdjust(true);
        try {
            const existing = plan.next_steps_data || {};
            const { error } = await supabase.from('strategic_plans').update({
                status: 'revision_requested',
                rejected_at: new Date().toISOString(),
                next_steps_data: {
                    ...existing,
                    adjustment_notes: adjustmentNotes.trim(),
                    adjustment_requested_at: new Date().toISOString(),
                },
            } as any).eq('id', plan.id);
            if (error) throw error;
            setPlan({ ...plan, status: 'revision_requested' });
            setAdjustSent(true);
            setTimeout(() => { setShowAdjustModal(false); setAdjustSent(false); setAdjustmentNotes(''); }, 2500);
        } catch (err) {
            console.error('Erro ao solicitar ajuste:', err);
        } finally {
            setSubmittingAdjust(false);
        }
    }

    function handleNext() { if (currentSection < sections.length - 1) { setCurrentSection(c => c + 1); scrollToTop(); } }
    function handlePrev() { if (currentSection > 0) { setCurrentSection(c => c - 1); scrollToTop(); } }

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (showApproveModal || showAdjustModal) return;
            const tag = (e.target as HTMLElement)?.tagName.toLowerCase();
            if (tag === 'textarea' || tag === 'input') return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCurrentSection(p => Math.min(p + 1, sections.length - 1)); scrollToTop(); }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCurrentSection(p => Math.max(p - 1, 0)); scrollToTop(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [sections.length, showApproveModal, showAdjustModal]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-zinc-700 border-t-[#00FF85] rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">Carregando planejamento</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-semibold text-black mb-4">Planejamento não encontrado</h1>
                    <p className="text-zinc-500 text-sm">Verifique se o link está correto ou entre em contato conosco.</p>
                </div>
            </div>
        );
    }

    const company = client?.company || 'Cliente';
    const currentSectionId = sections[currentSection]?.id;
    const progress = ((currentSection + 1) / sections.length) * 100;
    const isApproved = plan.status === 'approved';
    const isRevision = plan.status === 'revision_requested';
    const badge = statusBadge(plan.status || 'sent');

    // ── MOBILE SIGN: Simplified approval view for QR scan on phone ──
    const isSignMode = new URLSearchParams(location.search).get('sign') === '1';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isSignMode && isMobile) {
        return (
            <PlanEditProvider plan={plan} planId={plan.id} isEditing={false} onPlanUpdate={handlePlanUpdate}>
                <div className="min-h-screen bg-zinc-950 flex flex-col">
                    {/* Tela de sucesso */}
                    {showSuccessOverlay && (
                        <SuccessOverlay
                            name={plan.next_steps_data?.approved_by_name || signedName}
                            email={plan.next_steps_data?.approved_by_email || ''}
                            onClose={() => setShowSuccessOverlay(false)}
                        />
                    )}

                    {/* Header */}
                    <div className="px-6 pt-8 pb-6 text-center">
                        <img
                            src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                            alt="RevHackers"
                            className="h-6 w-auto mx-auto mb-6"
                        />
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Assinatura Digital</p>
                        <h1 className="text-xl font-bold text-white">Planejamento Estratégico</h1>
                        <p className="text-sm text-zinc-400 mt-1">{company}</p>
                    </div>

                    {/* Status badges */}
                    {isApproved && (
                        <div className="mx-6 mb-4 p-4 bg-[#00CC6A]/10 border border-[#00CC6A]/20">
                            <div className="flex items-center gap-2 justify-center">
                                <Check className="w-5 h-5 text-[#00CC6A]" />
                                <p className="text-sm text-[#00CC6A] font-semibold">
                                    Aprovado por {plan.next_steps_data?.approved_by_name || 'cliente'}
                                </p>
                            </div>
                        </div>
                    )}

                    {isRevision && (
                        <div className="mx-6 mb-4 p-4 bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-400 font-semibold text-center">Revisão solicitada</p>
                        </div>
                    )}

                    {/* Formulário de assinatura */}
                    {!isApproved && !isRevision && (
                        <div className="flex-1 px-6 pb-8">
                            {/* Documento referência */}
                            <div className="p-4 bg-zinc-900 border border-zinc-800 mb-6">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Documento</p>
                                <p className="font-semibold text-sm text-white">Planejamento Estratégico — {company}</p>
                                <p className="text-xs text-zinc-500 font-mono mt-1">
                                    {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            {/* Campos */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={signerName}
                                        onChange={e => setSignerName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        autoFocus
                                        className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00CC6A]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                                    <input
                                        type="email"
                                        value={signerEmail}
                                        onChange={e => setSignerEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00CC6A]"
                                    />
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={e => setConfirmed(e.target.checked)}
                                        className="mt-0.5 accent-[#00CC6A] w-5 h-5 shrink-0"
                                    />
                                    <span className="text-xs text-zinc-400 leading-relaxed">
                                        Declaro que li, compreendi e aprovo formalmente este planejamento.
                                    </span>
                                </label>
                            </div>

                            {/* Botões */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={!signerName.trim() || !signerEmail.trim() || !confirmed || approving}
                                    className="w-full py-4 bg-[#00CC6A] text-black text-sm font-black hover:bg-[#00FF85] transition-colors disabled:opacity-25 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    {approving ? 'Registrando...' : 'Assinar e Aprovar'}
                                </button>
                                <button
                                    onClick={() => setShowAdjustModal(true)}
                                    className="w-full py-3 border border-zinc-700 text-zinc-400 text-xs font-semibold hover:border-zinc-500 hover:text-white transition-colors"
                                >
                                    Solicitar Ajustes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Link para ver apresentação completa */}
                    <div className="px-6 pb-8 text-center">
                        <a
                            href={`/plan/${plan.access_token}`}
                            className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
                        >
                            Ver apresentação completa
                        </a>
                    </div>

                    {/* Modal de ajustes (mobile) */}
                    {showAdjustModal && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
                            <div className="bg-zinc-950 w-full border-t border-zinc-800 p-6 animate-in slide-in-from-bottom duration-300">
                                <h3 className="text-white font-bold text-base mb-4">Solicitar Ajustes</h3>
                                {adjustSent ? (
                                    <div className="text-center py-6">
                                        <Check className="w-8 h-8 text-[#00CC6A] mx-auto mb-2" />
                                        <p className="text-white font-semibold">Solicitação enviada</p>
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            value={adjustmentNotes}
                                            onChange={e => setAdjustmentNotes(e.target.value)}
                                            placeholder="Descreva o que precisa ser ajustado..."
                                            rows={4}
                                            className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00CC6A] resize-none mb-4"
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => setShowAdjustModal(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-400 text-sm">Cancelar</button>
                                            <button
                                                onClick={handleRequestAdjustment}
                                                disabled={!adjustmentNotes.trim() || submittingAdjust}
                                                className="flex-1 py-3 bg-white text-black text-sm font-bold disabled:opacity-30"
                                            >
                                                {submittingAdjust ? 'Enviando...' : 'Enviar'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </PlanEditProvider>
        );
    }


    const renderSection = () => {
        switch (currentSectionId) {
            case 'cover': return <CoverSection plan={plan} client={client} />;
            case 'video': return <VideoSection plan={plan} client={client} meetingType={plan.project_type === 'funnels_impl' ? 'kickoff' : 'planejamento'} />;
            case 'diagnostic': return <DiagnosticSection plan={plan} />;
            case 'premises': return <PremisesSection plan={plan} />;
            case 'persona': return <PersonaSection plan={plan} />;
            case 'benchmark': return <BenchmarkSection plan={plan} />;
            case 'methodology': return <MethodologySection plan={plan} />;
            case 'cronograma': return <OnboardingSection plan={plan} />;
            case 'goals': return <GoalsSection plan={plan} />;
            case 'projections': return <ProjectionsSection plan={plan} />;
            case 'investment': return <InvestmentSection plan={plan} />;
            case 'nextsteps': return <NextStepsSection plan={plan} onApprove={() => setShowApproveModal(true)} onReject={() => setShowAdjustModal(true)} approving={approving} status={plan.status} />;
            case 'approval': return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    {/* Logo */}
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className="h-8 w-auto mb-10 opacity-40"
                    />

                    {isApproved ? (
                        <div className="max-w-md">
                            <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-6 rounded-full">
                                <Check className="w-8 h-8 text-[#00CC6A]" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Planejamento Aprovado</h2>
                            <p className="text-sm text-zinc-500">
                                Assinado por <strong className="text-zinc-800">{plan.next_steps_data?.approved_by_name || 'cliente'}</strong>
                                {plan.next_steps_data?.approved_by_email && (
                                    <span className="text-zinc-400 ml-1">({plan.next_steps_data.approved_by_email})</span>
                                )}
                            </p>
                        </div>
                    ) : isRevision ? (
                        <div className="max-w-md">
                            <div className="w-16 h-16 bg-amber-50 flex items-center justify-center mx-auto mb-6 rounded-full">
                                <Target className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Revisão Solicitada</h2>
                            <p className="text-sm text-zinc-500 mb-6">Nossa equipe receberá sua solicitação e entrará em contato para alinhar os ajustes.</p>
                            <button
                                onClick={() => { setAdjustmentNotes(plan.next_steps_data?.adjustment_notes || ''); setShowAdjustModal(true); }}
                                className="text-sm text-amber-600 underline underline-offset-2 hover:text-amber-800"
                            >
                                Ver solicitação
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-lg w-full">
                            <h2 className="text-3xl font-black text-zinc-900 mb-2">Aprovação do Planejamento</h2>
                            <p className="text-sm text-zinc-500 mb-10">
                                Planejamento Estratégico — <strong className="text-zinc-700">{company}</strong>
                                <span className="text-zinc-300 mx-2">•</span>
                                {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                            </p>

                            {/* QR para assinar no celular */}
                            <div className="hidden md:flex items-center justify-center gap-4 mb-10 p-5 bg-zinc-50 border border-zinc-100 mx-auto max-w-xs">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/plan/${plan.access_token}?sign=1`)}&bgcolor=f4f4f5&color=09090b&margin=1`}
                                    alt="QR Assinatura"
                                    width={64}
                                    height={64}
                                    className="rounded"
                                />
                                <div className="text-left">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Escanear para assinar</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">Abra no celular para aprovar</p>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowAdjustModal(true)}
                                    className="px-6 py-3 border border-zinc-200 text-zinc-600 text-sm font-semibold hover:border-zinc-400 hover:text-zinc-900 transition-colors w-full sm:w-auto"
                                >
                                    Solicitar Ajustes
                                </button>
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="px-8 py-3 bg-[#00CC6A] text-black text-sm font-black hover:bg-[#00FF85] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                                >
                                    <Check className="w-4 h-4" />
                                    Aprovar Planejamento
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <PlanEditProvider
            plan={plan}
            planId={plan.id}
            isEditing={isPlanEditMode}
            onPlanUpdate={handlePlanUpdate}
        >
            {/* ── MODO APRESENTAÇÃO FULLSCREEN ─────────────────────────── */}
            {isPresentMode ? (
                <div className="fixed inset-0 bg-white flex flex-col overflow-hidden" style={{ fontFamily: 'inherit' }}>
                    {/* Conteúdo da seção */}
                    {currentSectionId === 'cover' ? (
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <CoverSection plan={plan} client={client} />
                        </div>
                    ) : (
                        <div ref={sectionRef} className="flex-1 overflow-y-auto">
                            <div className="max-w-7xl mx-auto px-8 py-10">
                                <div key={currentSectionId} className="animate-in fade-in duration-300">
                                    {renderSection()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Barra inferior minimalista */}
                    <div className="shrink-0 bg-zinc-950 flex items-center justify-between px-8 py-3">
                        <button
                            onClick={handlePrev}
                            disabled={currentSection === 0}
                            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-zinc-500 text-xs font-mono">
                                {String(currentSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                            </span>
                            <span className="text-zinc-400 text-xs uppercase tracking-widest">
                                {sections[currentSection]?.name}
                            </span>
                            {/* Dots */}
                            <div className="hidden md:flex gap-1">
                                {sections.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentSection(i)}
                                        className={`rounded-full transition-all duration-300 ${i === currentSection ? 'w-6 h-1.5 bg-[#00CC6A]' : i < currentSection ? 'w-1.5 h-1.5 bg-zinc-600' : 'w-1.5 h-1.5 bg-zinc-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentSection === sections.length - 1}
                            className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#00CC6A] disabled:opacity-20 transition-colors"
                        >
                            Próxima <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`plan-presentation min-h-screen bg-white font-sans flex flex-col ${isPlanEditMode ? 'pt-11' : ''}`}>
                    <PlanEditBar />

                    {/* Tela de sucesso pós-assinatura */}
                    {showSuccessOverlay && (
                        <SuccessOverlay
                            name={plan.next_steps_data?.approved_by_name || signedName}
                            email={plan.next_steps_data?.approved_by_email || ''}
                            onClose={() => setShowSuccessOverlay(false)}
                        />
                    )}

                    {/* ── MODAL DE APROVAÇÃO / ASSINATURA ──────────────────────────── */}
                    {showApproveModal && (
                        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white w-full max-w-md shadow-2xl">
                                {/* Header */}
                                <div className="bg-zinc-950 px-7 py-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Assinatura Digital</p>
                                        <h3 className="text-white font-bold text-base">Aprovação Formal do Planejamento</h3>
                                    </div>
                                    <button onClick={() => { setShowApproveModal(false); setSignerName(''); setSignerEmail(''); setConfirmed(false); }} className="text-zinc-600 hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Documento referência */}
                                <div className="px-7 pt-5 pb-0">
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
                                        <div>
                                            <p className="text-xs text-zinc-400 uppercase tracking-widest">Documento</p>
                                            <p className="font-semibold text-sm text-black mt-0.5">Planejamento Estratégico — {company}</p>
                                        </div>
                                        <p className="text-xs text-zinc-400 font-mono">
                                            {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Campos de assinatura */}
                                <div className="px-7 py-5 space-y-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={signerName}
                                            onChange={e => setSignerName(e.target.value)}
                                            placeholder="Seu nome completo"
                                            autoFocus
                                            className="w-full border border-zinc-200 px-4 py-2.5 text-sm text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">E-mail Corporativo</label>
                                        <input
                                            type="email"
                                            value={signerEmail}
                                            onChange={e => setSignerEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="w-full border border-zinc-200 px-4 py-2.5 text-sm text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900"
                                        />
                                    </div>

                                    {/* Preview de assinatura — aparece quando nome + email preenchidos */}
                                    {signerName.trim() && signerEmail.trim() && (
                                        <div className="border border-zinc-200 p-4 bg-zinc-50">
                                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Prévia da Assinatura</p>
                                            <p className="text-xl font-bold text-zinc-900" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}>
                                                {signerName.trim()}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{signerEmail.trim().toLowerCase()}</p>
                                            <p className="text-xs text-zinc-400 mt-1 font-mono">
                                                {new Date().toLocaleDateString('pt-BR')} — {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={e => setConfirmed(e.target.checked)}
                                            className="mt-0.5 accent-zinc-900 w-4 h-4 shrink-0"
                                        />
                                        <span className="text-xs text-zinc-500 leading-relaxed">
                                            Declaro que li, compreendi e aprovo formalmente este planejamento, estando ciente das premissas e compromissos descritos.
                                        </span>
                                    </label>
                                </div>

                                {/* Botões */}
                                <div className="px-7 pb-7 flex gap-3">
                                    <button
                                        onClick={() => { setShowApproveModal(false); setSignerName(''); setSignerEmail(''); setConfirmed(false); }}
                                        className="flex-1 py-2.5 border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={!signerName.trim() || !signerEmail.trim() || !confirmed || approving}
                                        className="flex-1 py-2.5 bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-25 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        {approving ? 'Registrando...' : 'Assinar e Aprovar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL DE AJUSTES ─────────────────────────────────────────── */}
                    {showAdjustModal && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white w-full max-w-lg shadow-2xl">
                                <div className="bg-zinc-950 px-8 py-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Solicitação</p>
                                        <h3 className="text-white font-bold text-lg">Solicitar Ajustes</h3>
                                    </div>
                                    <button onClick={() => setShowAdjustModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {adjustSent ? (
                                    <div className="px-8 py-12 text-center">
                                        <div className="w-12 h-12 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-6 h-6 text-[#00CC6A]" />
                                        </div>
                                        <p className="text-black font-semibold mb-1">Solicitação enviada</p>
                                        <p className="text-zinc-500 text-sm">Nossa equipe receberá sua solicitação e entrará em contato para alinhar os ajustes.</p>
                                    </div>
                                ) : (
                                    <div className="px-8 py-6 space-y-4">
                                        <p className="text-sm text-zinc-500">
                                            Descreva com clareza o que precisa ser ajustado. Nossa equipe revisará e entrará em contato para alinhar.
                                        </p>
                                        <div>
                                            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">O que precisa mudar</label>
                                            <textarea
                                                value={adjustmentNotes}
                                                onChange={e => setAdjustmentNotes(e.target.value)}
                                                placeholder="Exemplo: O cronograma de 90 dias está muito acelerado para nossa estrutura atual. Precisamos expandir a fase inicial para 30 dias e revisar a meta de leads do segundo mês..."
                                                rows={6}
                                                className="w-full border border-zinc-200 px-4 py-3 text-sm text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 resize-none"
                                            />
                                            <p className="text-xs text-zinc-300 mt-1">Seja específico: quanto mais detalhe, mais rápido conseguimos ajustar.</p>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setShowAdjustModal(false)}
                                                className="flex-1 py-3 border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleRequestAdjustment}
                                                disabled={!adjustmentNotes.trim() || submittingAdjust}
                                                className="flex-1 py-3 bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-30"
                                            >
                                                {submittingAdjust ? 'Enviando...' : 'Enviar Solicitação'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── HEADER FIXO ──────────────────────────────────────────────── */}
                    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-center h-14 gap-6">
                                <img
                                    src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                                    alt="RevHackers"
                                    className="h-6 w-auto shrink-0"
                                />
                                <div className="flex-1 flex items-center gap-0.5 overflow-x-auto hide-scrollbar">
                                    {sections.map((section, index) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setCurrentSection(index)}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs whitespace-nowrap transition-all duration-200 shrink-0 ${currentSection === index
                                                ? 'bg-zinc-950 text-white font-semibold'
                                                : currentSection > index
                                                    ? 'text-zinc-400 hover:text-zinc-700'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                                                }`}
                                        >
                                            <span className="opacity-70">{section.icon}</span>
                                            <span>{section.name}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Toggle Edit Mode */}
                                <button
                                    onClick={() => setIsPlanEditMode(prev => !prev)}
                                    title={isPlanEditMode ? 'Desativar edição' : 'Ativar edição'}
                                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${isPlanEditMode
                                        ? 'bg-[#00CC6A] text-white shadow-md'
                                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {/* Badge de status */}
                                <span className={`text-xs px-2.5 py-1 font-semibold uppercase tracking-widest shrink-0 ${badge.cls}`}>
                                    {badge.label}
                                </span>
                            </div>
                            <div className="h-0.5 bg-zinc-100">
                                <div className="h-full bg-zinc-950 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </header>

                    {/* ── CONTEÚDO PRINCIPAL ───────────────────────────────────────── */}
                    {currentSectionId === 'cover' ? (
                        /* CAPA: full-screen sem container — preenche todo o espaço */
                        <main ref={mainRef} className="flex-1 flex flex-col">
                            <div key="cover" className="flex-1 animate-in fade-in duration-300">
                                <CoverSection plan={plan} client={client} />
                            </div>
                        </main>
                    ) : (
                        /* OUTRAS SEÇÕES: container padded com breadcrumb */
                        <main ref={mainRef} className="flex-1">
                            <div className="max-w-7xl mx-auto px-8 lg:px-12 py-8 md:py-12">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        {currentSection > 0 && (
                                            <span className="text-xs text-zinc-300">
                                                {sections[currentSection - 1]?.name}
                                                <span className="mx-2">›</span>
                                            </span>
                                        )}
                                        <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
                                            {sections[currentSection]?.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-300 font-mono">
                                        {String(currentSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                                    </span>
                                </div>

                                <div key={currentSectionId} className="animate-in fade-in duration-300">
                                    {renderSection()}
                                </div>
                            </div>
                        </main>
                    )}




                    {/* ── RODAPÉ DE NAVEGAÇÃO ───────────────────────────────────────── */}
                    <footer className="sticky bottom-0 border-t border-zinc-100 bg-white/90 backdrop-blur-md z-40">
                        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
                            <button
                                onClick={handlePrev}
                                disabled={currentSection === 0}
                                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <div className="flex gap-1.5">
                                {sections.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSection(i)}
                                        className={`rounded-full transition-all duration-300 ${i === currentSection
                                            ? 'w-6 h-1.5 bg-zinc-950'
                                            : i < currentSection
                                                ? 'w-1.5 h-1.5 bg-zinc-400'
                                                : 'w-1.5 h-1.5 bg-zinc-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentSection === sections.length - 1}
                                className="flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Próxima
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </PlanEditProvider>
    );
}
