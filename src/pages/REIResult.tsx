import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, Target, Loader2, Share2, Check, Globe } from 'lucide-react';
import { getReiProjectById } from '@/api/reiProjects';
// import PageLayout from '@/components/layout/PageLayout'; // Not used in this layout
// import Section from '@/components/ui/Section'; // Not used
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { supabase } from '@/integrations/supabase/client';

export default function REIResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [project, setProject] = useState<any>(null);
    const [answers, setAnswers] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPlan, setGeneratingPlan] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                // 1. Fetch Project
                const projectData = await getReiProjectById(id);
                setProject(projectData);

                // 2. Fetch Latest Response (Answers)
                const { data: latestResponse } = await supabase
                    .from('rei_responses')
                    .select('*')
                    .eq('project_id', id)
                    .order('completed_at', { ascending: false })
                    .limit(1)
                    .single();

                if (latestResponse) {
                    setAnswers(latestResponse.responses);
                }

                // 3. Fetch Existing Plan
                const { data: planData } = await supabase
                    .from('strategic_plans')
                    .select('*')
                    .eq('rei_project_id', id)
                    .single();

                if (planData) {
                    setPlan(planData);
                }

            } catch (error) {
                console.error("Erro ao carregar dados", error);
                toast({
                    title: "Erro",
                    description: "Erro ao carregar dados do projeto.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleGenerateStrategicPlan = async () => {
        if (!project?.id) return;
        setGeneratingPlan(true);

        try {
            // 1. Check if plan already exists (double check)
            if (plan) {
                handleViewPlan();
                setGeneratingPlan(false);
                return;
            }

            // 1. Call RPC to generate plan (Base Template)
            const { data: planId, error } = await supabase.rpc('generate_strategic_plan', {
                p_rei_project_id: project.id
            });

            if (error) throw error;

            // 2. Intelligence Layer: Inject Data into the Plan
            try {
                // Use the answers we already fetched
                if (answers) {
                    console.log("[REIResult] Generating Intelligence for Plan...");
                    const { DiagnosticService } = await import('@/services/DiagnosticService');
                    const { MarketIntelligenceService } = await import('@/services/MarketIntelligenceService');

                    const segment = answers.segmento || 'B2B';
                    const objective = answers.objetivoPrincipal || 'Crescimento';

                    // 2a. Fetch REAL Market Intelligence (Perplexity/API)
                    // If we have budget for API calls, otherwise use mock
                    const marketData = await MarketIntelligenceService.fetchMarketData(segment, objective);

                    // 2b. Generate Full Diagnosis
                    // We need to reconstruct a response-like object for the service
                    // The service expects response object to have 'responses' key or similar structure
                    // Actually generateDiagnosis takes (response: ReiResponse, marketData)
                    // We need to fetch the actual response object or mock it
                    // Fortunately we fetched 'latestResponse' in useEffect but didn't save the whole object
                    // Let's refetch or just pass a constructed object
                    const mockResponseObj = { responses: answers };
                    const fullDiagnostic = DiagnosticService.generateDiagnosis(mockResponseObj as any, marketData);
                    const { plan_data, ...diagnosticContext } = fullDiagnostic;

                    await supabase
                        .from('strategic_plans')
                        .update({
                            ...plan_data,
                            diagnostic_data: diagnosticContext as any
                        })
                        .eq('rei_project_id', project.id);

                    // Refresh plan state
                    const { data: updatedPlan } = await supabase
                        .from('strategic_plans')
                        .select('*')
                        .eq('rei_project_id', project.id)
                        .single();
                    setPlan(updatedPlan);
                }
            } catch (intelError) {
                console.error("Error weaving intelligence:", intelError);
            }

            toast({
                title: "Planejamento Gerado!",
                description: "Seu planejamento estratégico está pronto.",
                className: "bg-revgreen border-none text-black",
                duration: 5000
            });

        } catch (error) {
            console.error("Error generating plan:", error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar o planejamento.",
                variant: "destructive"
            });
        } finally {
            setGeneratingPlan(false);
        }
    };

    const handleViewPlan = () => {
        if (plan?.access_token) {
            // Open in new tab
            window.open(`/plan/${plan.access_token}`, '_blank');
        } else if (plan?.id) {
            // Fallback if access token missing? navigate to admin view
            navigate(`/admin/planejamento/${project.id}`);
        }
    };

    if (loading) {
        return (
            <DiagnosticLayout
                title="Carregando..."
                subtitle="Analisando dados do negócio..."
                variant="dark"
                hideHeader={false}
            >
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            </DiagnosticLayout>
        );
    }

    if (!project) {
        return (
            <DiagnosticLayout
                title="Projeto Não Encontrado"
                subtitle="Verifique o link e tente novamente."
                variant="dark"
                hideHeader={false}
            >
                <div className="flex justify-center mt-10">
                    <Button onClick={() => navigate('/rei-hub')} variant="outline" className="text-black border-white bg-white hover:bg-zinc-200">
                        Voltar ao Hub
                    </Button>
                </div>
            </DiagnosticLayout>
        );
    }

    // Prepare Data for Visualization
    const result = project?.analysis_result || {
        score: 0,
        radarData: [],
        insights: ["Aguardando análise..."]
    };

    const type = project.type || 'CONSULTING';

    // Labels based on Type
    const typeValid = (type.toUpperCase() === 'FOUNDER' || type.toUpperCase() === 'DEV' || type.toUpperCase() === 'CONSULTING' || type.toUpperCase() === 'FUNNEL' || type.toUpperCase() === 'SITE' || type.toUpperCase() === 'CRM_OPS') ? type.toUpperCase() : 'CONSULTING';

    const contentMap = {
        FOUNDER: { title: "Founder Authority", label: "Score de Autoridade" },
        DEV: { title: "Tech Audit", label: "Maturidade Digital" },
        CONSULTING: { title: "Revenue Scan", label: "Revenue Score" },
        FUNNEL: { title: "Sales Machine", label: "Eficiência de Funil" },
        SITE: { title: "Site Performance", label: "Web Vitals Score" },
        CRM_OPS: { title: "CRM & RevOps", label: "CRM Ops Score" }
    };
    const content = contentMap[typeValid as keyof typeof contentMap];

    return (
        <>
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                        .bg-zinc-950 { background: white !important; color: black !important; }
                        .text-white { color: black !important; }
                        .text-zinc-400 { color: #666 !important; }
                        .border-white\\/5 { border-color: #ddd !important; }
                        .bg-white\\/5 { background-color: #f5f5f5 !important; }
                        /* Ensure full width */
                        .max-w-5xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                        .container-custom { padding: 0 !important; max-width: 100% !important; }
                        .min-h-screen { min-height: auto !important; }
                    }
                    .print-only { display: none; }
                `}
            </style>

            <div className="min-h-screen bg-zinc-950">
                {/* 1. DARK COVER SECTION (Results & High Level) */}
                <DiagnosticLayout
                    title=""
                    subtitle=""
                    variant="dark"
                    hideHeader={true}
                    centered={true}
                    headerVariant="default"
                >
                    <div className="relative pt-10 pb-20">
                        {/* Floating Back Button */}
                        <button
                            onClick={() => navigate('/rei-hub')}
                            className="absolute top-0 left-0 text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 transition-colors no-print"
                        >
                            <ArrowLeft className="w-3 h-3" /> Voltar
                        </button>

                        <div className="absolute top-0 right-0 flex items-center gap-3 no-print">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs px-3 h-8"
                            >
                                <Share2 className="w-3 h-3 mr-2" />
                                Exportar PDF
                            </Button>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center mt-12 mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] uppercase tracking-[0.2em] mb-6">
                                <Zap className="w-3 h-3" /> {content.title}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                                {result.score}
                                <span className="text-2xl md:text-3xl text-zinc-600 font-light ml-1">/100</span>
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">{content.label}</p>
                        </div>

                        {/* Radar Chart Container */}
                        <div className="max-w-xl mx-auto mb-20 relative">
                            <div className="aspect-square w-full max-h-[300px] flex items-center justify-center relative">
                                {/* Simple Radar Visual */}
                                <RadarChart data={result.radarData} />
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {result.radarData.map((item: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-sm text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-xl font-bold text-white">{item.value}/100</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </DiagnosticLayout>

                {/* 2. WHITE DETAIL SECTION (Insights & Action) */}
                <div className="bg-white py-20 min-h-screen relative z-10">
                    <div className="container-custom max-w-5xl mx-auto px-6">

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left: Insights */}
                            <div className="lg:col-span-7 space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-black flex items-center gap-2 tracking-tight mb-8">
                                        <Target className="w-5 h-5" /> DIAGNÓSTICO DETALHADO
                                    </h3>

                                    <div className="space-y-4">
                                        {result.insights.map((insight: string, idx: number) => (
                                            <div key={idx} className="group p-6 bg-zinc-50 border border-zinc-100 hover:border-black transition-colors duration-300 rounded-lg">
                                                <div className="flex gap-4">
                                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                                                    </div>
                                                    <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                                                        {insight}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Context */}
                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg mt-8">
                                    <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Benchmark de Mercado
                                    </h4>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Empresas do seu segmento com este perfil geralmente investem <strong>15-20%</strong> da receita em Growth para manter competitividade. Seu score indica oportunidades claras de otimização imediata.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Action Plan (Sticky) */}
                            <div className="lg:col-span-5 no-print">
                                <div className="sticky top-24 bg-zinc-950 text-white p-8 rounded-xl shadow-2xl">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold mb-2">Próximos Passos</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Baseado no seu score, nossa IA preparou um plano de execução preliminar.
                                        </p>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-revgreen flex items-center justify-center">
                                                <Check className="w-3 h-3 text-black" />
                                            </div>
                                            <span className="text-zinc-300">Diagnóstico Completo</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${project?.scheduling_completed ? 'bg-revgreen' : 'bg-white/10'}`}>
                                                {project?.scheduling_completed ? <Check className="w-3 h-3 text-black" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <span className={project?.scheduling_completed ? "text-zinc-300" : "text-white font-bold"}>Agendamento Técnico</span>
                                        </div>
                                        {plan ? (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-revgreen flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                                <span className="text-zinc-300">Planejamento Gerado</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-sm opacity-50">
                                                <div className="w-5 h-5 rounded-full border border-white/20" />
                                                <span className="text-zinc-500">Planejamento Gerado</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {/* Button 1: Schedule (Priority if not done) */}
                                        {!project?.scheduling_completed && (
                                            <Button
                                                onClick={() => navigate(`/admin/jornada/${project.id}`)}
                                                className="w-full bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider py-6 text-xs"
                                            >
                                                Agendar Apresentação <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}

                                        {/* Button 2: Plan (If schedule done or just alternate action) */}
                                        {plan ? (
                                            <Button
                                                onClick={handleViewPlan}
                                                className="w-full bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider py-6 text-xs"
                                                variant={project?.scheduling_completed ? "default" : "secondary"}
                                            >
                                                Ver Planejamento <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleGenerateStrategicPlan}
                                                disabled={generatingPlan || !project?.scheduling_completed}
                                                className={`w-full font-black uppercase tracking-wider py-6 text-xs ${!project?.scheduling_completed ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500' : 'bg-revgreen hover:bg-emerald-400 text-black'}`}
                                            >
                                                {generatingPlan ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                                                ) : (
                                                    <>Desbloquear Plano Completo <ArrowRight className="w-4 h-4 ml-2" /></>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-zinc-500 text-center mt-4">
                                        Receba seu plano de 90 dias com roadmap e orçamento detalhado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PRINT ONLY: FULL RESPONSES */}
                        <div className="print-only mt-20 pt-10 border-t border-black">
                            <h3 className="text-2xl font-black text-black mb-8">Resumo das Respostas</h3>
                            {answers && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                    {Object.entries(answers).map(([key, value]) => {
                                        if (key === 'wizardStep' || key === 'timestamp' || !value) return null;
                                        // Formatter for key labels if possible, simplified for now
                                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);

                                        return (
                                            <div key={key} className="break-inside-avoid">
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
                                                <p className="text-sm font-medium text-black">{displayValue}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

// Subcomponent: Radar Chart (Visual only)
const RadarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    if (!data || data.length === 0) return null;

    // Scale for visual clarity
    const scale = 0.8;
    const center = 100;

    // Convert data to points
    const points = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        const r = (d.value / 100) * 100 * scale;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");

    return (
        <svg viewBox="0 0 200 200" className="w-[300px] h-[300px] overflow-visible">
            {/* Background Circles */}
            {[20, 40, 60, 80, 100].map((r) => (
                <circle key={r} cx={100} cy={100} r={r * scale} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}

            {/* Axes */}
            {data.map((_, i) => {
                const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                return (
                    <line
                        key={i}
                        x1={100}
                        y1={100}
                        x2={100 + 100 * scale * Math.cos(angle)}
                        y2={100 + 100 * scale * Math.sin(angle)}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                );
            })}

            {/* The Shape */}
            <motion.polygon
                points={points}
                fill="rgba(3, 252, 59, 0.2)"
                stroke="#03FC3B"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Labels */}
            {data.map((d, i) => {
                const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                const r = 100 * scale + 25; // Distance from center
                const x = 100 + r * Math.cos(angle);
                const y = 100 + r * Math.sin(angle);
                return (
                    <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="rgba(255,255,255,0.5)"
                        fontSize="8"
                        fontWeight="bold"
                        className="uppercase tracking-widest"
                    >
                        {d.label}
                    </text>
                );
            })}
        </svg>
    );
};
