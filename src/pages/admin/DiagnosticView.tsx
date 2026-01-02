import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, AlertTriangle, CheckCircle2, Search, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DiagnosticResult, StrategicDecision } from '@/services/DiagnosticService';

export default function DiagnosticView() {
    const { id } = useParams(); // Plan ID or Project ID? Let's assume Project ID for consistency with routing /admin/diagnostico/:id
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<any>(null);
    const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);

    useEffect(() => {
        loadDiagnostic();
    }, [id]);

    async function loadDiagnostic() {
        try {
            // Find the plan associated with this project
            const { data, error } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('rei_project_id', id)
                .single();

            if (error) throw error;
            setPlan(data);

            if (data.diagnostic_data) {
                setDiagnostic(data.diagnostic_data);
            }
        } catch (error) {
            console.error('Error loading diagnostic:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><span className="text-zinc-400 font-mono text-xs animate-pulse">CARREGANDO DIAGNÓSTICO...</span></div>;

    if (!diagnostic) return (
        <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
            <span className="text-zinc-400 font-mono text-xs">DIAGNÓSTICO NÃO DISPONÍVEL</span>
            <Button onClick={() => navigate(`/admin/planejamento/${id}`)} variant="outline">Ir para Gerador</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            {/* HEADER */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/jornada/${id}`)}>
                            <ArrowLeft className="w-4 h-4 text-zinc-400" />
                        </Button>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-black" />
                                Diagnóstico Estratégico
                            </h1>
                            <p className="text-[10px] text-zinc-400 font-medium">Gerado automaticamente via REI Engine v2.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-none border-zinc-200 text-zinc-500 font-mono text-[10px]">
                            MATURIDADE: {diagnostic.context_mirror.maturity.toUpperCase()}
                        </Badge>
                        <Button onClick={() => navigate(`/admin/planejamento/${id}`)} className="bg-black text-white hover:bg-zinc-800 h-8 text-[10px] font-bold uppercase tracking-widest rounded-none">
                            Ver Planejamento Final
                            <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 1. CONTEXT MIRROR */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
                        <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center text-zinc-400">01</div>
                        <h2 className="text-lg font-bold">O que entendemos (Espelho)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <ContextCard label="Segmento" value={diagnostic.context_mirror.segment} />
                        <ContextCard label="Objetivo Principal" value={diagnostic.context_mirror.objective} />
                        <ContextCard label="Restrições" value={diagnostic.context_mirror.restrictions} />
                        <ContextCard label="Nível Maturidade" value={diagnostic.context_mirror.maturity} />
                    </div>
                </section>

                {/* 2. SIGNALS & RISKS */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
                        <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center text-zinc-400">02</div>
                        <h2 className="text-lg font-bold">Sinais & Riscos Detectados</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Search className="w-3 h-3" /> Sinais Operacionais
                            </h3>
                            {diagnostic.signals.map((s, i) => (
                                <div key={i} className="bg-white border border-zinc-200 p-4 border-l-4 border-l-zinc-300">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-zinc-900">{s.text}</span>
                                        <Badge variant="secondary" className="text-[9px] uppercase">{s.type}</Badge>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{s.implication}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-500" /> Riscos Críticos
                            </h3>
                            {diagnostic.risks.map((r, i) => (
                                <div key={i} className="bg-white border border-red-100 p-4 border-l-4 border-l-red-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-red-900">{r.text}</span>
                                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 text-[9px] uppercase border-0">{r.level} Risk</Badge>
                                    </div>
                                    <p className="text-xs text-red-800/70 leading-relaxed">Mitigação: {r.mitigation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. DECISION ENGINE (THE CORE) */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
                        <div className="h-8 w-8 bg-black text-white flex items-center justify-center font-bold">03</div>
                        <div>
                            <h2 className="text-xl font-bold">Decisões Estratégicas</h2>
                            <p className="text-sm text-zinc-500">Por que definimos este caminho para o projeto.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {diagnostic.decisions.map((d, i) => (
                            <DecisionBlock key={i} decision={d} />
                        ))}
                    </div>
                </section>

                {/* 4. NEXT STEPS */}
                <section className="bg-zinc-900 text-white p-12 text-center rounded-sm">
                    <h2 className="text-2xl font-bold mb-4">O Diagnóstico está claro?</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
                        Este documento serve como base lógica para o Planejamento Estratégico.
                        Se houver divergência nos sinais, ajuste as premissas antes de avançar.
                    </p>
                    <Button onClick={() => navigate(`/admin/planejamento/${id}`)} className="bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest h-12 px-8 rounded-none">
                        Aprovar e Ver Roadmap
                    </Button>
                </section>

            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---

const ContextCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white border border-zinc-200 p-4">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-zinc-900">{value}</p>
    </div>
);

const DecisionBlock = ({ decision }: { decision: StrategicDecision }) => (
    <div className="bg-white border border-zinc-200 p-6 flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-md transition-all">
        <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <h3 className="font-bold text-lg text-black leading-tight">{decision.title}</h3>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">Recomendação: {decision.recommendation}</p>
        </div>

        <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-zinc-100 md:pl-8 pt-4 md:pt-0">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Baseado em (Fatos)</p>
            <ul className="space-y-1">
                {decision.basedOn.map((fact, i) => (
                    <li key={i} className="text-xs text-zinc-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                        {fact}
                    </li>
                ))}
            </ul>
        </div>

        <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-zinc-100 md:pl-8 pt-4 md:pt-0 bg-zinc-50/50 -mr-6 -my-6 p-6 flex flex-col justify-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Implicação Real</p>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                "{decision.implication}"
            </p>
        </div>
    </div>
);
