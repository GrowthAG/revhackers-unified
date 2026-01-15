import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Save,
    RefreshCw,
    Users,
    Target,
    Calendar,
    TrendingUp,
    Edit2,
    Check,
    X,
    Clock,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Persona {
    nome: string;
    cargo: string;
    desafios: string[];
    objetivos: string[];
    canais_preferidos: string[];
}

interface OKR {
    objective: string;
    keyResults: { metric: string; target: string; current: string }[];
}

interface TimelineCycle {
    cycle: number;
    name: string;
    weeks: string;
    focus: string;
    deliverables: string[];
    status: 'pending' | 'in_progress' | 'completed';
}

interface StrategicPlanData {
    id?: string;
    project_id: string;
    client_id?: string;
    status: string;
    rei_summary: any;
    benchmark_data: any;
    personas_data: Persona[];
    market_data: any;
    okrs: OKR[];
    timeline: TimelineCycle[];
    version: number;
    generated_at: string;
}

export default function LiveStrategicPlan() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [planData, setPlanData] = useState<StrategicPlanData | null>(null);
    const [projectInfo, setProjectInfo] = useState<any>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (projectId) loadData();
    }, [projectId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch project info
            const { data: project } = await supabase
                .from('rei_projects')
                .select('*, clients(*)')
                .eq('id', projectId)
                .single();

            setProjectInfo(project);

            // Fetch strategic plan
            const { data: plan, error } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (plan) {
                setPlanData(plan as unknown as StrategicPlanData);
            } else {
                // No plan yet - show empty state
                setPlanData(null);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        if (!planData) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('strategic_plans')
                .update({
                    ...planData,
                    version: (planData.version || 0) + 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', planData.id);

            if (error) throw error;

            toast({
                title: "Plano salvo",
                description: `Versão ${planData.version + 1} salva com sucesso.`,
            });
            setHasUnsavedChanges(false);
            setEditingSection(null);
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const regenerateEnrichment = async () => {
        try {
            toast({
                title: "Regenerando...",
                description: "Buscando novos dados de mercado...",
            });

            await supabase.functions.invoke('trigger-post-rei-enrichment', {
                body: { projectId, reiType: '360' }
            });

            toast({
                title: "Enriquecimento iniciado",
                description: "Aguarde alguns segundos e recarregue.",
            });

            setTimeout(loadData, 5000);
        } catch (error) {
            console.error('Regeneration failed:', error);
        }
    };

    const updatePersona = (index: number, field: keyof Persona, value: any) => {
        if (!planData?.personas_data) return;
        const updated = [...planData.personas_data];
        updated[index] = { ...updated[index], [field]: value };
        setPlanData({ ...planData, personas_data: updated });
        setHasUnsavedChanges(true);
    };

    const updateOKR = (okrIndex: number, field: string, value: any) => {
        if (!planData?.okrs) return;
        const updated = [...planData.okrs];
        updated[okrIndex] = { ...updated[okrIndex], [field]: value };
        setPlanData({ ...planData, okrs: updated });
        setHasUnsavedChanges(true);
    };

    const updateCycleStatus = (cycleIndex: number, status: TimelineCycle['status']) => {
        if (!planData?.timeline) return;
        const updated = [...planData.timeline];
        updated[cycleIndex] = { ...updated[cycleIndex], status };
        setPlanData({ ...planData, timeline: updated });
        setHasUnsavedChanges(true);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </AdminLayout>
        );
    }

    if (!planData) {
        return (
            <AdminLayout>
                <div className="p-8 max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <div className="text-center py-20 bg-zinc-50 rounded-sm border border-zinc-200">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                        <h2 className="text-xl font-bold mb-2">Plano Estratégico Pendente</h2>
                        <p className="text-zinc-500 mb-6">Complete o REI 360 para gerar automaticamente.</p>
                        <Button onClick={() => navigate(`/admin/rei/${projectId}`)}>
                            Ir para REI 360
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">
                                Plano Estratégico
                            </h1>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">
                                {projectInfo?.clients?.name || projectInfo?.client_company || 'Cliente'} • v{planData.version}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={regenerateEnrichment}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar Dados
                        </Button>
                        <Button
                            onClick={savePlan}
                            disabled={!hasUnsavedChanges || saving}
                            className="bg-black hover:bg-zinc-800"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                    {/* Left Column: Personas, Market & Benchmark */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Market Analysis Section (Smart Scraper Results) */}
                        {planData.market_data && (
                            <section className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
                                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <h2 className="font-bold uppercase text-sm tracking-wide">Inteligência de Mercado</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-8">

                                    {/* Competitors */}
                                    {planData.market_data.concorrentes_benchmark && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 tracking-wide">Análise Competitiva</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {planData.market_data.concorrentes_benchmark.map((comp: any, idx: number) => (
                                                    <div key={idx} className="p-4 bg-zinc-50 border border-zinc-100 rounded-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-sm">{comp.nome}</h4>
                                                            {comp.url && <a href={comp.url} target="_blank" className="text-[10px] text-blue-600 hover:underline">Ver Site</a>}
                                                        </div>
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex gap-2">
                                                                <span className="text-green-600 font-bold min-w-[12px]">+</span>
                                                                <span className="text-zinc-600">{comp.pontos_fortes}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="text-red-500 font-bold min-w-[12px]">-</span>
                                                                <span className="text-zinc-600">{comp.pontos_fracos}</span>
                                                            </div>
                                                            {comp.diferencial && (
                                                                <div className="mt-2 pt-2 border-t border-zinc-100 italic text-zinc-500">
                                                                    "{comp.diferencial}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SWOT */}
                                    {planData.market_data.analise_swot_rapida && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase text-green-600 mb-3 tracking-wide flex items-center gap-2">
                                                    <Sparkles className="w-3 h-3" /> Oportunidades
                                                </h3>
                                                <ul className="space-y-2">
                                                    {planData.market_data.analise_swot_rapida.oportunidades?.map((item: string, i: number) => (
                                                        <li key={i} className="text-xs text-zinc-600 flex gap-2">
                                                            <span className="text-green-400">•</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold uppercase text-red-500 mb-3 tracking-wide flex items-center gap-2">
                                                    <Target className="w-3 h-3" /> Ameaças
                                                </h3>
                                                <ul className="space-y-2">
                                                    {planData.market_data.analise_swot_rapida.ameacas?.map((item: string, i: number) => (
                                                        <li key={i} className="text-xs text-zinc-600 flex gap-2">
                                                            <span className="text-red-400">•</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Trends */}
                                    {planData.market_data.tendencias_2025 && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 tracking-wide">Tendências 2025</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {planData.market_data.tendencias_2025.map((trend: any, idx: number) => (
                                                    <div key={idx} className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-sm">
                                                        <span className="text-xs font-bold block mb-1">{trend.titulo}</span>
                                                        <span className="text-[10px] text-zinc-500">{trend.descricao}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </section>
                        )}

                        {/* Personas Section */}
                        <section className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
                            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <h2 className="font-bold uppercase text-sm tracking-wide">Personas</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingSection(editingSection === 'personas' ? null : 'personas')}
                                >
                                    {editingSection === 'personas' ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                </Button>
                            </div>
                            <div className="p-6">
                                {planData.personas_data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {planData.personas_data.map((persona, idx) => (
                                            <div key={idx} className="p-4 bg-zinc-50 rounded-sm border border-zinc-100">
                                                {editingSection === 'personas' ? (
                                                    <div className="space-y-3">
                                                        <Input
                                                            value={persona.nome}
                                                            onChange={(e) => updatePersona(idx, 'nome', e.target.value)}
                                                            placeholder="Nome da Persona"
                                                            className="font-bold"
                                                        />
                                                        <Input
                                                            value={persona.cargo}
                                                            onChange={(e) => updatePersona(idx, 'cargo', e.target.value)}
                                                            placeholder="Cargo"
                                                        />
                                                        <Textarea
                                                            value={persona.desafios?.join('\n')}
                                                            onChange={(e) => updatePersona(idx, 'desafios', e.target.value.split('\n'))}
                                                            placeholder="Desafios (um por linha)"
                                                            rows={3}
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="font-bold text-sm mb-1">{persona.nome || 'Persona ' + (idx + 1)}</h3>
                                                        <p className="text-xs text-zinc-500 mb-3">{persona.cargo}</p>
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-zinc-600">Desafios:</p>
                                                            <ul className="text-xs text-zinc-500 space-y-1">
                                                                {persona.desafios?.slice(0, 3).map((d, i) => (
                                                                    <li key={i}>• {d}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400 italic">Nenhuma persona gerada ainda.</p>
                                )}
                            </div>
                        </section>

                        {/* OKRs Section */}
                        <section className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
                            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    <h2 className="font-bold uppercase text-sm tracking-wide">OKRs</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingSection(editingSection === 'okrs' ? null : 'okrs')}
                                >
                                    {editingSection === 'okrs' ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                </Button>
                            </div>
                            <div className="p-6 space-y-6">
                                {planData.okrs?.map((okr, okrIdx) => (
                                    <div key={okrIdx} className="border-b border-zinc-100 pb-4 last:border-0">
                                        {editingSection === 'okrs' ? (
                                            <Input
                                                value={okr.objective}
                                                onChange={(e) => updateOKR(okrIdx, 'objective', e.target.value)}
                                                className="font-bold mb-3"
                                            />
                                        ) : (
                                            <h3 className="font-bold text-sm mb-3">{okr.objective}</h3>
                                        )}
                                        <div className="grid grid-cols-3 gap-3">
                                            {okr.keyResults?.map((kr, krIdx) => (
                                                <div key={krIdx} className="p-3 bg-zinc-50 rounded-sm">
                                                    <p className="text-xs text-zinc-500 mb-1">{kr.metric}</p>
                                                    <p className="font-bold text-lg text-[#03FC3B]">{kr.target}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="space-y-6">

                        {/* Timeline Section */}
                        <section className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
                            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <h2 className="font-bold uppercase text-sm tracking-wide">Roadmap (4 Ciclos)</h2>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {planData.timeline?.map((cycle, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-sm border transition-all cursor-pointer ${cycle.status === 'completed' ? 'bg-green-50 border-green-200' :
                                            cycle.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                                                'bg-zinc-50 border-zinc-200'
                                            }`}
                                        onClick={() => {
                                            const statuses: TimelineCycle['status'][] = ['pending', 'in_progress', 'completed'];
                                            const currentIdx = statuses.indexOf(cycle.status);
                                            const nextStatus = statuses[(currentIdx + 1) % statuses.length];
                                            updateCycleStatus(idx, nextStatus);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                Ciclo {cycle.cycle}: {cycle.name}
                                            </span>
                                            <span className="text-[10px] text-zinc-400">
                                                {cycle.weeks}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-600 mb-2">{cycle.focus}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {cycle.deliverables?.slice(0, 3).map((d, i) => (
                                                <span key={i} className="text-[9px] px-2 py-0.5 bg-white border border-zinc-200 rounded-full">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            {cycle.status === 'completed' && <Check className="w-3 h-3 text-green-600" />}
                                            {cycle.status === 'in_progress' && <Clock className="w-3 h-3 text-blue-600" />}
                                            <span className={`text-[10px] uppercase tracking-wide ${cycle.status === 'completed' ? 'text-green-600' :
                                                cycle.status === 'in_progress' ? 'text-blue-600' :
                                                    'text-zinc-400'
                                                }`}>
                                                {cycle.status === 'completed' ? 'Concluído' :
                                                    cycle.status === 'in_progress' ? 'Em andamento' :
                                                        'Pendente'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benchmark Summary */}
                        {planData.benchmark_data && (
                            <section className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
                                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <h2 className="font-bold uppercase text-sm tracking-wide">Benchmark</h2>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-zinc-600 leading-relaxed">
                                        {typeof planData.benchmark_data === 'string'
                                            ? planData.benchmark_data.substring(0, 300) + '...'
                                            : planData.benchmark_data?.summary || 'Dados de benchmark disponíveis.'
                                        }
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Unsaved Changes Warning */}
                <AnimatePresence>
                    {hasUnsavedChanges && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 right-6 bg-black text-white px-4 py-3 rounded-sm shadow-lg flex items-center gap-3"
                        >
                            <span className="text-sm">Alterações não salvas</span>
                            <Button size="sm" variant="outline" className="bg-white text-black hover:bg-zinc-100" onClick={savePlan}>
                                Salvar
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
