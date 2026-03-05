import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PlanEditProvider } from '@/components/plan/PlanEditContext';
import { Check, Loader2, ArrowLeft, ArrowRight, FileText, Target, BarChart3, Calendar, Users, Briefcase, TrendingUp, DollarSign, Settings } from 'lucide-react';

// Section imports
import CoverSection from './sections/CoverSection';
import DiagnosticSection from './sections/DiagnosticSection';
import PremisesSection from './sections/PremisesSection';
import PersonaSection from './sections/PersonaSection';
import BenchmarkSection from './sections/BenchmarkSection';
import MethodologySection from './sections/MethodologySection';
import GoalsSection from './sections/GoalsSection';
import RoadmapSection from './sections/RoadmapSection';
import OnboardingSection from './sections/OnboardingSection';
import ProjectionsSection from './sections/ProjectionsSection';
import InvestmentSection from './sections/InvestmentSection';
import ApprovalSection from './sections/ApprovalSection';

// ── Navigation ────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    { id: 'cover', name: 'Capa', icon: <FileText className="w-4 h-4" /> },
    { id: 'premises', name: 'Premissas', icon: <Target className="w-4 h-4" /> },
    { id: 'diagnostic', name: 'Diagnóstico', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'persona', name: 'Persona', icon: <Users className="w-4 h-4" /> },
    { id: 'benchmark', name: 'Análise de Mercado', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'methodology', name: 'Metodologia', icon: <Settings className="w-4 h-4" /> },
    { id: 'goals', name: 'Metas e Indicadores', icon: <Target className="w-4 h-4" /> },
    { id: 'roadmap', name: 'Plano de Ação', icon: <Calendar className="w-4 h-4" /> },
    { id: 'onboarding', name: 'Primeiros 90 Dias', icon: <Calendar className="w-4 h-4" /> },
    { id: 'projections', name: 'Projeções', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'investment', name: 'Investimento', icon: <DollarSign className="w-4 h-4" />, optional: true },
    { id: 'approval', name: 'Aprovação', icon: <Check className="w-4 h-4" /> },
];

function getStatusBadge(status: string) {
    if (status === 'approved') return { label: 'Aprovado', cls: 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/30' };
    if (status === 'revision_requested') return { label: 'Revisão Solicitada', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    if (status === 'viewed') return { label: 'Visualizado', cls: 'bg-zinc-100 text-zinc-600 border border-zinc-200' };
    return { label: 'Enviado', cls: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
}

export default function StrategicPlanPresentation() {
    const { token } = useParams<{ token: string }>();
    const location = useLocation();
    const [plan, setPlan] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [showApproved, setShowApproved] = useState(false);
    const [approvedName, setApprovedName] = useState('');
    const [showSign, setShowSign] = useState(false);
    const [signName, setSignName] = useState('');
    const [signEmail, setSignEmail] = useState('');
    const [signAccepted, setSignAccepted] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectText, setRejectText] = useState('');
    const [rejecting, setRejecting] = useState(false);
    const [rejectSent, setRejectSent] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const params = new URLSearchParams(location.search);
    const [isEditing, setIsEditing] = useState(params.get('edit') === '1');
    const isPresentation = params.get('present') === '1';

    const onPlanUpdate = (updated: any) => setPlan(updated);

    // Filter sections based on project type
    const sections = NAV_SECTIONS.filter(s => {
        if (s.id === 'investment') {
            const pt = plan?.project_type || 'full';
            return pt === 'full' || pt === 'content_seo' || !pt;
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
            } catch { }
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
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [sections.length, showSign, showRejectModal]);

    async function loadPlan() {
        if (!token) { setLoading(false); return; }
        try {
            const { data, error } = await supabase.from('strategic_plans').select('*').eq('access_token', token).single();
            if (error) throw error;
            setPlan(data);
            if (data.client_id) {
                const { data: cl } = await supabase.from('clients').select('*').eq('id', data.client_id).single();
                if (cl) setClient(cl);
            }
        } catch (err) { console.error('Erro ao carregar plano:', err); }
        finally { setLoading(false); }
    }

    async function markViewed() {
        if (!plan) return;
        await supabase.from('strategic_plans').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', plan.id);
    }

    async function handleApprove() {
        if (!plan || !signName.trim() || !signEmail.trim() || !signAccepted) return;
        setApproving(true);
        try {
            const existing = plan.next_steps_data || {};
            const now = new Date().toISOString();
            await supabase.from('strategic_plans').update({
                status: 'approved', approved_at: now,
                next_steps_data: { ...existing, approved_by_name: signName.trim(), approved_by_email: signEmail.trim().toLowerCase(), approved_at_iso: now },
            }).eq('id', plan.id);
            setApprovedName(signName.trim());
            setPlan({ ...plan, status: 'approved', next_steps_data: { ...(plan.next_steps_data || {}), approved_by_name: signName.trim(), approved_by_email: signEmail.trim().toLowerCase() } });
            setShowSign(false);
            setShowApproved(true);
        } catch (err) { console.error('Erro ao aprovar:', err); }
        finally { setApproving(false); }
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

    function goNext() { if (currentIndex < sections.length - 1) { setCurrentIndex(i => i + 1); scrollToTop(); } }
    function goPrev() { if (currentIndex > 0) { setCurrentIndex(i => i - 1); scrollToTop(); } }

    // ── Loading ─────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-zinc-700 border-t-[#00FF85] rounded-full animate-spin mx-auto mb-6" />
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
    const progress = ((currentIndex + 1) / sections.length) * 100;
    const isApproved = plan.status === 'approved';
    const isRejected = plan.status === 'revision_requested';
    const badge = getStatusBadge(plan.status || 'sent');

    // ── Section renderer ───────────────────────────────────────────────────
    const renderSection = () => {
        switch (currentSectionId) {
            case 'cover': return <CoverSection plan={plan} client={client} />;
            case 'diagnostic': return <DiagnosticSection plan={plan} />;
            case 'premises': return <PremisesSection plan={plan} />;
            case 'persona': return <PersonaSection plan={plan} />;
            case 'benchmark': return <BenchmarkSection plan={plan} />;
            case 'methodology': return <MethodologySection plan={plan} />;
            case 'onboarding': return <OnboardingSection plan={plan} />;
            case 'roadmap': return <RoadmapSection plan={plan} />;
            case 'goals': return <GoalsSection plan={plan} />;
            case 'projections': return <ProjectionsSection plan={plan} />;
            case 'investment': return <InvestmentSection plan={plan} />;
            case 'approval': return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers" className="h-8 w-auto mb-10 opacity-40" />
                    {isApproved ? (
                        <div className="max-w-md">
                            <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-6 rounded-full"><Check className="w-8 h-8 text-[#00CC6A]" /></div>
                            <h2 className="text-3xl font-bold text-black mb-3">Planejamento Aprovado</h2>
                            <p className="text-zinc-500 text-sm mb-2">Assinado por <strong>{plan.next_steps_data?.approved_by_name || 'cliente'}</strong></p>
                            <p className="text-zinc-400 text-xs">Nossa equipe já está em ação. Você receberá as próximas etapas em até 24h.</p>
                            <div className="mt-10 pt-6 border-t border-zinc-200"><span className="text-xs text-zinc-300 uppercase tracking-widest">▲ RevHackers Growth Hub</span></div>
                        </div>
                    ) : isRejected ? (
                        <div className="max-w-md">
                            <h2 className="text-2xl font-bold text-black mb-3">Revisão Solicitada</h2>
                            <p className="text-zinc-500 text-sm">Nossa equipe está revisando suas observações e entrará em contato em breve.</p>
                        </div>
                    ) : (
                        <div className="max-w-md">
                            <h2 className="text-3xl font-bold text-black mb-3">Próximos Passos</h2>
                            <p className="text-zinc-500 text-sm mb-8">Revise todas as seções e quando estiver pronto, assine digitalmente para autorizar o início.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={() => setShowRejectModal(true)} className="px-8 py-3 border border-zinc-300 text-zinc-500 text-sm font-medium hover:border-zinc-500 hover:text-black transition-colors">Solicitar Ajustes</button>
                                <button onClick={() => setShowSign(true)} className="px-10 py-3 bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2"><Check className="w-4 h-4" /> Assinar e Aprovar</button>
                            </div>
                            <div className="mt-10 pt-6 border-t border-zinc-200"><span className="text-xs text-zinc-300 uppercase tracking-widest">▲ RevHackers Growth Hub</span></div>
                        </div>
                    )}
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
                        <div className="w-20 h-20 border-2 border-[#00CC6A] rounded-full flex items-center justify-center mx-auto mb-8"><Check className="w-10 h-10 text-[#00CC6A]" /></div>
                        <h2 className="text-3xl font-bold text-white mb-3">Planejamento Aprovado</h2>
                        <p className="text-white/50 text-sm mb-2">Assinado por <strong className="text-white">{plan.next_steps_data?.approved_by_name || approvedName}</strong></p>
                        <p className="text-white/30 text-xs">Nossa equipe já está em ação. Você receberá as próximas etapas em até 24h.</p>
                        <button onClick={() => setShowApproved(false)} className="mt-10 px-8 py-3 border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white transition-colors">Continuar lendo</button>
                    </div>
                </div>
            )}

            {/* Sign modal */}
            {showSign && !isApproved && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-950 max-w-md w-full border border-zinc-800 p-8" onClick={e => e.stopPropagation()}>
                        <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers" className="h-6 w-auto mb-8" />
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Assinatura Digital</p>
                        <h3 className="text-xl font-bold text-white mb-6">Aprovar Planejamento</h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Nome Completo</label>
                                <input type="text" value={signName} onChange={e => setSignName(e.target.value)} placeholder="Seu nome completo" autoFocus className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00CC6A]" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                                <input type="email" value={signEmail} onChange={e => setSignEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00CC6A]" />
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" checked={signAccepted} onChange={e => setSignAccepted(e.target.checked)} className="mt-0.5 accent-[#00CC6A] w-5 h-5 shrink-0" />
                                <span className="text-xs text-zinc-400 leading-relaxed">Declaro que li, compreendi e aprovo formalmente este planejamento.</span>
                            </label>
                        </div>
                        <div className="space-y-3">
                            <button onClick={handleApprove} disabled={!signName.trim() || !signEmail.trim() || !signAccepted || approving} className="w-full py-4 bg-[#00CC6A] text-black text-sm font-black hover:bg-[#00FF85] transition-colors disabled:opacity-25 flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" /> {approving ? 'Registrando...' : 'Assinar e Aprovar'}
                            </button>
                            <button onClick={() => setShowSign(false)} className="w-full py-3 border border-zinc-700 text-zinc-400 text-xs font-semibold hover:border-zinc-500 hover:text-white transition-colors">Voltar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white max-w-lg w-full border border-zinc-200 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-1">Solicitar Ajustes</h3>
                        <p className="text-zinc-500 text-sm mb-4">Descreva o que precisa ser revisado no planejamento.</p>
                        {rejectSent ? (
                            <div className="text-center py-6"><Check className="w-8 h-8 text-[#00CC6A] mx-auto mb-2" /><p className="text-black font-semibold">Solicitação enviada</p></div>
                        ) : (
                            <>
                                <textarea value={rejectText} onChange={e => setRejectText(e.target.value)} placeholder="Ex: Gostaria de ajustar o prazo do Mês 1, o nosso time ainda não tem SDR..." className="w-full min-h-[120px] resize-none border border-zinc-200 focus:border-zinc-900 p-3 text-sm focus:outline-none" />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button onClick={() => setShowRejectModal(false)} className="px-5 py-2.5 border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancelar</button>
                                    <button onClick={handleReject} disabled={!rejectText.trim() || rejecting} className="px-6 py-2.5 bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40">{rejecting ? 'Enviando...' : 'Enviar'}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-white flex">
                {/* Sidebar nav */}
                <div className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto print:hidden">
                    {/* Logo */}
                    <div className="p-5 border-b border-zinc-200">
                        <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers" className="h-5 w-auto mb-3" />
                        <p className="text-xs text-zinc-400 leading-snug truncate">{companyName}</p>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium mt-2 ${badge.cls}`}>
                            {badge.label}
                        </div>
                    </div>

                    {/* Nav items */}
                    <div className="flex-1 py-3">
                        {sections.map((s, i) => {
                            const isActive = i === currentIndex;
                            const isPast = i < currentIndex;
                            return (
                                <button key={s.id} onClick={() => { setCurrentIndex(i); scrollToTop(); }} className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${isActive ? 'bg-zinc-200/70 text-black font-semibold' : isPast ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                                    <span className={`shrink-0 ${isActive ? 'text-black' : isPast ? 'text-zinc-400' : 'text-zinc-300'}`}>{s.icon}</span>
                                    <span className="truncate">{s.name}</span>
                                    {isPast && <Check className="w-3 h-3 text-[#00CC6A] shrink-0 ml-auto" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Progress */}
                    <div className="p-5 border-t border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 font-mono">{currentIndex + 1}/{sections.length}</span>
                            <span className="text-xs text-zinc-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-200 overflow-hidden">
                            <div className="h-full bg-zinc-900 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto h-screen">
                    <div className="max-w-5xl mx-auto px-8 md:px-16 py-12 md:py-20">
                        {renderSection()}
                    </div>

                    {/* Bottom nav */}
                    {currentSectionId !== 'approval' && (
                        <div className="border-t border-zinc-200 px-8 md:px-16 py-6 flex items-center justify-between print:hidden">
                            <button onClick={goPrev} disabled={currentIndex === 0} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </button>
                            <span className="text-xs text-zinc-300 font-mono">{currentIndex + 1} / {sections.length}</span>
                            <button onClick={goNext} disabled={currentIndex === sections.length - 1} className="flex items-center gap-2 text-sm text-black font-semibold hover:text-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                Próxima <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PlanEditProvider>
    );
}
