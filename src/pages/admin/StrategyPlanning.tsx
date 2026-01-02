import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Users, TrendingUp, DollarSign, Calendar, ArrowLeft, Loader2, Zap, FileText, BarChart3, PieChart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { getReiProjectById } from '@/api/reiProjects';
import { getLatestReiResponse } from '@/api/reiResponses';
import type { ReiProject } from '@/api/reiProjects';
import type { ReiResponse } from '@/api/reiResponses';
import { Card, CardContent } from '@/components/ui/card';

const StrategyPlanning = () => {
    const { id } = useParams();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [latestResponse, setLatestResponse] = useState<ReiResponse | null>(null);
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const proj = await getReiProjectById(id!);
            if (proj) {
                setProject(proj);
                const resp = await getLatestReiResponse(proj.id);
                setLatestResponse(resp);
            }
        } catch (error) {
            console.error("Error loading strategy data:", error);
        } finally {
            setLoading(false);
        }
    };

    const responses = (latestResponse?.responses as any) || {};

    const getBudgetAmount = () => {
        const b = responses.orcamento || "";
        if (b.includes("1.500 - 5.000")) return 5000;
        if (b.includes("5.000 - 15.000")) return 15000;
        if (b.includes("15.000")) return 30000;
        return 3000;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    const PlanSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
        <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-black border-b border-zinc-100 pb-2 flex items-center gap-2">
                <Icon size={14} className="text-revgreen" /> {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </section>
    );

    const PlanCard = ({ label, value, desc }: { label: string, value: string, desc?: string }) => (
        <div className="bg-white border border-zinc-100 p-8 hover:border-black transition-all group">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
            <p className="text-lg font-black text-black uppercase tracking-tight mb-2 group-hover:text-revgreen transition-colors">{value}</p>
            {desc && <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">{desc}</p>}
        </div>
    );

    return (
        <PageLayout>
            <AdminPageLayout
                title="Planejamento Estratégico"
                description={`Projeto: ${project?.client_name || 'Revenue Engine'}`}
                backTo={id ? `/admin/jornada/${id}` : "/admin"}
            >
                <div className="max-w-6xl space-y-24 py-12">

                    {/* Objetivos & OKRs */}
                    <PlanSection title="OBJETIVOS & RESULTADOS CHAVE (OKRs)" icon={Target}>
                        <PlanCard
                            label="Objetivo Principal"
                            value={responses.objetivoPrincipal || "Tração Inicial"}
                            desc={`Foco em Q${project?.quarter} ${project?.year} para atingir metas de ${responses.metaCrescimento}.`}
                        />
                        <PlanCard
                            label="Métrica Norte"
                            value={responses.metricaPrincipal || "Novos Clientes"}
                            desc="Indicador primário de sucesso para validação do modelo de crescimento."
                        />
                        <PlanCard
                            label="Gargalo Operacional"
                            value={responses.desafios?.[0] || "Escalabilidade"}
                            desc="Principal ponto de fricção identificado no diagnóstico REI."
                        />
                    </PlanSection>

                    {/* Framework GTM */}
                    <PlanSection title="FRAMEWORK GO-TO-MARKET" icon={BarChart3}>
                        <PlanCard
                            label="Persona Alvo"
                            value={responses.segmento || "Enterprise SaaS"}
                            desc="Perfil de cliente ideal com maior propensão de fechamento e LTV."
                        />
                        <PlanCard
                            label="Canal Prioritário"
                            value={responses.canaisAquisicao?.[0] || "LinkedIn Ads"}
                            desc="Primeira alavanca de aquisição para geração de demanda qualificada."
                        />
                        <PlanCard
                            label="Stack Tecnológica"
                            value={responses.crm || "HubSpot / Pipedrive"}
                            desc="Infraestrutura base para medição de conversão e gestão de pipeline."
                        />
                    </PlanSection>

                    {/* Planejamento Financeiro */}
                    <section className="space-y-8 bg-black p-12 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-8 gap-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">PLANEJAMENTO DE MÍDIA</h3>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-revgreen">INVESTIMENTO TRIMESTRAL</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOTAL ESTIMADO</p>
                                <p className="text-5xl font-black tracking-tighter">R$ {(getBudgetAmount() * 3).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: "Performance (Ads)", val: 0.6, color: "bg-revgreen" },
                                { label: "Outbound & CRM", val: 0.2, color: "bg-white" },
                                { label: "Conteúdo & SEO", val: 0.2, color: "bg-zinc-700" }
                            ].map((item, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                                        <span className="text-lg font-black">R$ {(getBudgetAmount() * item.val).toLocaleString()}/mês</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 w-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.val * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Próximos Passos */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 border border-zinc-200 gap-8 group">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">PRÓXIMA ETAPA</p>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Cronograma de Execução 90 Dias</h3>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Transformação do plano em tarefas operacionais de growth.</p>
                        </div>
                        <Button asChild className="bg-black text-white hover:bg-revgreen hover:text-black rounded-none h-14 px-8 font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-none shrink-0">
                            <Link to={`/admin/cronograma/${id}`}>Visualizar Roadmap →</Link>
                        </Button>
                    </div>

                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default StrategyPlanning;
