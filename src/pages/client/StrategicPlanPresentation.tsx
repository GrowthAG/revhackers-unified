import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PlanEditProvider } from '@/components/plan/PlanEditContext';
import { Check, Loader2, ArrowLeft, ArrowRight, FileText, Target, BarChart3, Calendar, Users, Briefcase, TrendingUp, DollarSign, Settings, PanelLeftClose, PanelLeftOpen, Pencil, Maximize2, Minimize2, Smartphone, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { EditToolbar } from '@/components/plan/PlanEditContext';
import { QRCodeSVG } from 'qrcode.react';

// Section imports
import CoverSection from './sections/CoverSection';
import DiagnosticSymptomsSection from './sections/DiagnosticSymptomsSection';
import DiagnosticCausesSection from './sections/DiagnosticCausesSection';
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
import ProjectionsSection from './sections/ProjectionsSection';
import InvestmentSection from './sections/InvestmentSection';

// ── Navigation ────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    { id: 'cover', name: 'Capa', icon: <FileText className="w-4 h-4" /> },
    { id: 'premises', name: 'Premissas', icon: <Target className="w-4 h-4" /> },
    { id: 'diagnostic_symptoms', name: 'Sintomas e Cenário', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'diagnostic_causes', name: 'Causa Raiz', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'thesis', name: 'Tese de Crescimento', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'persona', name: 'Persona', icon: <Users className="w-4 h-4" /> },
    { id: 'benchmark', name: 'Análise de Mercado', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'methodology', name: 'Metodologia', icon: <Settings className="w-4 h-4" /> },
    { id: 'goals', name: 'Metas e Indicadores', icon: <Target className="w-4 h-4" /> },
    { id: 'roadmap_macro', name: 'Marcos do Projeto', icon: <Calendar className="w-4 h-4" /> },
    { id: 'onboarding_kickoff', name: 'Alinhamento & Kickoff', icon: <Calendar className="w-4 h-4" /> },
    { id: 'onboarding_setup', name: 'Setup & Arquitetura', icon: <Settings className="w-4 h-4" /> },
    { id: 'onboarding_training', name: 'Treinamento & Go-Live', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'onboarding_adoption', name: 'Adoção & Mapeamento', icon: <Target className="w-4 h-4" /> },
    { id: 'onboarding_handover', name: 'Handover & Escala', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'sla', name: 'Regras do Jogo', icon: <ShieldCheck className="w-4 h-4" /> },
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
        const pt = plan?.rei_projects?.type || 'full';

        if (s.id === 'investment' || s.id === 'projections') {
            return pt === 'full' || pt === 'funnels_impl' || pt === 'content_seo' || !pt;
        }

        if (s.id === 'persona' || s.id === 'benchmark') {
            return pt !== 'crm_ops';
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
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
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
            const { data, error } = await supabase.from('strategic_plans').select('*, rei_projects(type)').eq('access_token', token).single();
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
    const typeLabel = getProjectLabel(plan?.rei_projects?.type || plan?.project_type);
    
    // Gerar URL do QR Code (garante que puxe a url base certa e adicione ?sign=1 para disparar o modal no celular)
    const signUrl = `${window.location.origin}/plan/${token}?sign=1`;

    // ── Section renderer ───────────────────────────────────────────────────
    const renderSection = () => {
        switch (currentSectionId) {
            case 'cover': return <CoverSection plan={plan} client={client} />;
            case 'diagnostic_symptoms': return <DiagnosticSymptomsSection plan={plan} />;
            case 'diagnostic_causes': return <DiagnosticCausesSection plan={plan} />;
            case 'thesis': return <ThesisSection plan={plan} />;
            case 'premises': return <PremisesSection plan={plan} />;
            case 'persona': return <PersonaSection plan={plan} />;
            case 'benchmark': return <BenchmarkSection plan={plan} />;
            case 'methodology': return <MethodologySection plan={plan} />;
            case 'roadmap_macro': return <RoadmapMacroSection plan={plan} />;
            case 'onboarding_kickoff': return <OnboardingKickoffSection plan={plan} />;
            case 'onboarding_setup': return <OnboardingSetupSection plan={plan} />;
            case 'onboarding_training': return <OnboardingTrainingSection plan={plan} />;
            case 'onboarding_adoption': return <OnboardingAdoptionSection plan={plan} />;
            case 'onboarding_handover': return <OnboardingHandoverSection plan={plan} />;
            case 'sla': return <SlaSection plan={plan} client={client} />;
            case 'goals': return <GoalsSection plan={plan} />;
            case 'projections': return <ProjectionsSection plan={plan} />;
            case 'investment': return <InvestmentSection plan={plan} />;
            case 'approval': return (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                    <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers" className="h-8 w-auto mb-12 opacity-40" />
                    {isApproved ? (
                        <div className="max-w-md">
                            <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center mx-auto mb-6 rounded-full"><Check className="w-8 h-8 text-[#00CC6A]" /></div>
                            <h2 className="text-3xl font-bold text-black mb-3">Planejamento Aprovado</h2>
                            <p className="text-zinc-500 text-sm mb-2">Assinado por <strong>{plan.next_steps_data?.approved_by_name || 'cliente'}</strong></p>
                            <p className="text-zinc-500 text-sm">Nossa equipe já está em ação. Você receberá as próximas etapas em até 24h.</p>
                            <div className="mt-12 pt-6 border-t border-zinc-200"><span className="text-xs text-zinc-400 uppercase tracking-widest">▲ RevHackers Growth Hub</span></div>
                        </div>
                    ) : isRejected ? (
                        <div className="max-w-md">
                            <h2 className="text-2xl font-bold text-black mb-3">Ajuste Solicitado</h2>
                            <p className="text-zinc-500 text-sm">Nossa equipe está revisando suas observações e entrará em contato em breve para refinar o plano.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
                            {/* Left Side: Copy */}
                            <div>
                                <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Autorização e Assinatura</h2>
                                <p className="text-lg text-zinc-500 mb-10 leading-relaxed font-medium">Revisamos juntos o cenário, as metas e o plano de ação prático. Se estiver tudo alinhado, assine digitalmente para dar o OK e nossa equipe iniciar a execução.</p>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button onClick={() => setShowSign(true)} className="w-full sm:w-auto px-10 py-4 bg-zinc-900 text-white text-[15px] font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20">
                                        <Check className="w-5 h-5" /> Assinar Agora
                                    </button>
                                    <button onClick={() => setShowRejectModal(true)} className="w-full sm:w-auto px-8 py-4 border border-zinc-200 text-zinc-600 text-[15px] font-bold rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                                        Solicitar Ajuste
                                    </button>
                                </div>
                            </div>
                            
                            {/* Right Side: QR Code Area */}
                            <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mb-6 border border-zinc-100">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">Assinatura Rápida no Celular</h3>
                                <p className="text-sm text-zinc-500 mb-8 font-medium">Aponte a câmera para assinar na própria tela do celular e envie a autorização direto para nossa equipe, sem burocracia.</p>
                                
                                <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                                    <QRCodeSVG value={signUrl} size={180} level="M" fgColor="#09090b" />
                                </div>
                                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00CC6A] mt-6 bg-[#00CC6A]/10 px-3 py-1.5 rounded-md">Válido Assinatura Digital</span>
                            </div>
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
                        <h3 className="text-xl font-bold text-white mb-6">Aprovar Planejamento {typeLabel}</h3>
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
                        <p className="text-zinc-500 text-sm mb-4">Descreva o que precisa ser revisado no planejamento {typeLabel}.</p>
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

            {/* Edit Toolbar (only visible in edit mode) */}
            <EditToolbar />

            <div className="h-screen bg-white flex flex-col items-center overflow-hidden">
                {/* Floating Navigation Controls (Bottom Center) - Minimalist Fullscreen approach */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-zinc-200/80 p-1.5 rounded-2xl shadow-lg shadow-zinc-200/50 print:hidden transition-all duration-300 hover:bg-white">
                    <button
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="px-3 text-[11px] font-mono text-zinc-900 font-bold tracking-widest">
                        {currentIndex + 1} <span className="text-zinc-300 mx-1">/</span> {sections.length}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={currentIndex === sections.length - 1}
                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Avançar"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-zinc-200 mx-1" />

                    <button
                        onClick={() => setIsEditing(prev => !prev)}
                        className={`p-2.5 rounded-xl transition-all ${isEditing ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                        title={isEditing ? 'Desativar Edição' : 'Ativar Edição'}
                    >
                        <Pencil className="w-4 h-4" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                        title="Tela Cheia"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Main content — Full Screen Format */}
                <div ref={scrollRef} className="w-full flex-1 overflow-y-auto bg-white flex flex-col relative scroll-smooth">
                    {/* Slide container - Full bleed no margins */}
                    <div className="w-full h-full flex flex-col">
                        {renderSection()}
                    </div>
                </div>
            </div>
        </PlanEditProvider>
    );
}
