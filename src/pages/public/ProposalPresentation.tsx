import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PlanEditProvider, EditToolbar } from '@/components/plan/PlanEditContext';
import { Check, Loader2, ArrowLeft, ArrowRight, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Pencil, Target, ShieldCheck, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import CoverSection from './dealroom-sections/CoverSection';
import DiagnosisSection from './dealroom-sections/DiagnosisSection';
import FeaturesSection from './dealroom-sections/FeaturesSection';
import ArchitectureSection from './dealroom-sections/ArchitectureSection';
import DeliverablesSection from './dealroom-sections/DeliverablesSection';
import ComparisonSection from './dealroom-sections/ComparisonSection';
import CasesSection from './dealroom-sections/CasesSection';
import PremisesSection from './dealroom-sections/PremisesSection';
import RoadmapSection from './dealroom-sections/RoadmapSection';
import InvestmentSection from './dealroom-sections/InvestmentSection';

// We will create the Deal Room specific sections in `src/pages/public/dealroom-sections/` soon.
// For now, placing placeholders.

const NAV_SECTIONS = [
    { id: 'cover', name: 'Capa da Proposta', chapter: 'Introdução', icon: <Target className="w-4 h-4" /> },
    { id: 'diagnosis', name: 'O Problema', chapter: 'Fase 1 • Diagnóstico', icon: <Target className="w-4 h-4" /> },
    { id: 'features', name: 'A Solução', chapter: 'Fase 2 • A Máquina All-in-One', icon: <Target className="w-4 h-4" /> },
    { id: 'architecture', name: 'A Arquitetura', chapter: 'Fase 3 • O Fluxo Técnico', icon: <Target className="w-4 h-4" /> },
    { id: 'deliverables', name: 'Entregáveis (SLA)', chapter: 'Fase 4 • O Escopo Fixo', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'comparison', name: 'A Análise de Custos', chapter: 'Fase 5 • O Custo da Ineficiência', icon: <Target className="w-4 h-4" /> },
    { id: 'cases', name: 'Casos de Sucesso', chapter: 'Fase 6 • Avaliação de Resultados', icon: <Target className="w-4 h-4" /> },
    { id: 'premises', name: 'Premissas de Parceria', chapter: 'Fase 7 • Regras do Jogo', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'roadmap', name: 'Plano de Ação', chapter: 'Fase 8 • Cronograma 12 Meses', icon: <Calendar className="w-4 h-4" /> },
    { id: 'investment', name: 'Investimento e Acordo', chapter: 'Fase 9 • Fechamento', icon: <ShieldCheck className="w-4 h-4" /> }
];

export default function ProposalPresentation() {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    const [isEditing, setIsEditing] = useState(params.get('edit') === '1');
    const isPresentation = params.get('present') === '1';
    
    // UI states
    const [sidebarOpen, setSidebarOpen] = useState(!isPresentation);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [proposal, setProposal] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeCompanyName = proposal?.client_name || 'Cliente';

    // Check Fullscreen
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

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Load proposal
    useEffect(() => {
         loadProposal();
    }, [slug]);

    async function loadProposal() {
        if (!slug) { setLoading(false); return; }
        try {
            const { data, error } = await supabase.rpc('get_proposal_by_slug', { slug_input: slug }).single();
            if (error) throw error;
            setProposal(data);
        } catch (err) { 
            console.error('Erro ao carregar proposta:', err); 
        } finally { 
            setLoading(false); 
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Proposta_${activeCompanyName.replace(/\s+/g, '_')}`,
    });

    // Keyboard nav
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === 'textarea' || tag === 'input') return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCurrentIndex(i => Math.min(i + 1, NAV_SECTIONS.length - 1)); scrollRef.current?.scrollTo({top:0}); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCurrentIndex(i => Math.max(i - 1, 0)); scrollRef.current?.scrollTo({top:0}); }
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
            if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSidebarOpen(prev => !prev); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [toggleFullscreen]);

    const goPrev = () => { if (currentIndex > 0) { setCurrentIndex(i => i - 1); scrollRef.current?.scrollTo({top:0}); } };
    const goNext = () => { if (currentIndex < NAV_SECTIONS.length - 1) { setCurrentIndex(i => i + 1); scrollRef.current?.scrollTo({top:0}); } };
    const onProposalUpdate = (updated: any) => setProposal(updated);

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-zinc-700 border-t-[#00CC6A] rounded-full animate-spin mx-auto mb-6" />
                <p className="text-zinc-500 text-sm tracking-widest uppercase">Carregando Proposta</p>
            </div>
        </div>
    );

    if (!proposal) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold text-black mb-4">Proposta não encontrada</h1>
                <p className="text-zinc-500 text-sm">Verifique se o link está correto.</p>
            </div>
        </div>
    );

    const currentSectionId = NAV_SECTIONS[currentIndex]?.id;
    const currentChapter = NAV_SECTIONS[currentIndex]?.chapter;
    const progress = ((currentIndex + 1) / NAV_SECTIONS.length) * 100;
    
    // Status badges (draft, sent, approved)
    const badgeLabel = proposal.status === 'approved' ? 'Aprovado' : (proposal.status === 'paid' ? 'Pago' : 'Em Análise');
    const badgeCls = proposal.status === 'approved' || proposal.status === 'paid' ? 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/30' : 'bg-zinc-100 text-zinc-500 border border-zinc-200';

    const renderSectionById = (id: string) => {
        switch (id) {
            case 'cover': return <CoverSection proposal={proposal} />;
            case 'diagnosis': return <DiagnosisSection proposal={proposal} />;
            case 'features': return <FeaturesSection proposal={proposal} />;
            case 'architecture': return <ArchitectureSection proposal={proposal} />;
            case 'deliverables': return <DeliverablesSection proposal={proposal} />;
            case 'comparison': return <ComparisonSection proposal={proposal} />;
            case 'cases': return <CasesSection proposal={proposal} />;
            case 'premises': return <PremisesSection proposal={proposal} />;
            case 'roadmap': return <RoadmapSection proposal={proposal} />;
            case 'investment': return <InvestmentSection proposal={proposal} />;
            default:
                return (
                    <div className="w-full min-h-[100dvh] flex flex-col justify-center items-center bg-zinc-50 border-t border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center mb-6">
                            <Target className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h1 className="text-xl text-zinc-500 font-bold uppercase tracking-widest text-center">
                            EM DESENVOLVIMENTO: {id}
                        </h1>
                    </div>
                );
        }
    };

    return (
        <PlanEditProvider plan={proposal} planId={proposal.id} isEditing={isEditing} onPlanUpdate={onProposalUpdate} tableName="proposals">
            <EditToolbar />

            <div className="h-screen bg-white flex flex-col overflow-hidden">
                {!isFullscreen && (
                    <div className="w-full h-1 bg-zinc-100 shrink-0 print:hidden">
                        <div
                            className="h-full bg-zinc-900 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation */}
                    <aside className={`shrink-0 bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 print:hidden ${isFullscreen ? 'w-0 overflow-hidden border-r-0' : sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'}`}>
                        {sidebarOpen && (
                            <>
                                <div className="px-4 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                                    <div>
                                        <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 block">Deal Room</span>
                                        <span className="text-xs font-bold text-zinc-700 truncate block mt-0.5">{activeCompanyName}</span>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <nav className="flex-1 overflow-y-auto py-2">
                                    {NAV_SECTIONS.map((sec, idx) => {
                                        const isActive = idx === currentIndex;
                                        return (
                                            <button
                                                key={sec.id}
                                                onClick={() => { setCurrentIndex(idx); scrollRef.current?.scrollTo({top:0}); }}
                                                className={`w-full text-left px-4 py-3 flex items-center gap-2.5 transition-all text-tiny font-medium ${
                                                    isActive
                                                        ? 'bg-zinc-950 text-white'
                                                        : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
                                                }`}
                                            >
                                                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                                                    {sec.icon}
                                                </span>
                                                <span className="truncate">{sec.name}</span>
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="px-4 py-3 border-t border-zinc-100 shrink-0">
                                    <span className={`text-xxs font-black uppercase tracking-widest px-2.5 py-1 inline-block ${badgeCls}`}>
                                        {badgeLabel}
                                    </span>
                                </div>
                            </>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        {/* Hidden bottom trigger for full screen nav arrows */}
                        {isFullscreen && (
                            <div className="fixed bottom-0 left-0 right-0 h-20 z-30 print:hidden group/fs">
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-zinc-200/80 p-1.5 shadow-sm opacity-0 group-hover/fs:opacity-100 translate-y-4 group-hover/fs:translate-y-0 transition-all duration-300">
                                    <button onClick={goPrev} disabled={currentIndex === 0} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all disabled:opacity-30">
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div className="px-3">
                                        <span className="text-tiny font-mono text-zinc-900 font-bold tracking-widest">
                                            {currentIndex + 1} / {NAV_SECTIONS.length}
                                        </span>
                                    </div>
                                    <button onClick={goNext} disabled={currentIndex === NAV_SECTIONS.length - 1} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all disabled:opacity-30">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-200 mx-1" />
                                    <button onClick={toggleFullscreen} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all">
                                        <Minimize2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Standard floating nav */}
                        {!isFullscreen && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-white border border-zinc-200 p-1.5 shadow-xl print:hidden transition-all rounded-sm">
                                {!sidebarOpen && (
                                    <button onClick={() => setSidebarOpen(true)} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all">
                                        <PanelLeftOpen className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={goPrev} disabled={currentIndex === 0} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
                                <div className="px-3 flex gap-3 items-center">
                                    {currentChapter && <span className="hidden sm:inline-flex text-xxs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 uppercase">{currentChapter}</span>}
                                    <span className="text-tiny font-mono text-zinc-900 font-bold">{currentIndex + 1} / {NAV_SECTIONS.length}</span>
                                </div>
                                <button onClick={goNext} disabled={currentIndex === NAV_SECTIONS.length - 1} className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-all disabled:opacity-30"><ArrowRight className="w-4 h-4" /></button>
                                <div className="w-px h-5 bg-zinc-200 mx-1" />
                                <button onClick={() => setIsEditing(p=>!p)} className={`p-2.5 transition-all ${isEditing ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handlePrint()} className="p-2.5 text-zinc-400 hover:text-zinc-900"><Printer className="w-4 h-4" /></button>
                                <button onClick={toggleFullscreen} className="p-2.5 text-zinc-400 hover:text-zinc-900"><Maximize2 className="w-4 h-4" /></button>
                            </div>
                        )}

                        {/* Current Slide */}
                        <div ref={scrollRef} className="w-full flex-1 overflow-y-auto bg-white flex flex-col relative scroll-smooth print:hidden">
                            <div className="w-full min-h-full flex flex-col print:hidden">
                                {renderSectionById(currentSectionId)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print area */}
                <div className="hidden print:block w-full bg-white">
                    <div ref={printRef} className="w-full bg-white flex flex-col">
                        <style type="text/css" media="print">
                            {`
                                @page { size: landscape; margin: 0; }
                                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                .print-page { width: 100vw; min-height: 100vh; page-break-after: always; display: flex; flex-direction: column; }
                            `}
                        </style>
                        {NAV_SECTIONS.map(s => (
                            <div key={s.id} className="print-page">
                                {renderSectionById(s.id)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PlanEditProvider>
    );
}
