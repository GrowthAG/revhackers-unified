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
                <Icon size={14} className="text-[#00CC6A]" /> {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </section>
    );

    const PlanCard = ({ label, value, desc }: { label: string, value: string, desc?: string }) => (
        <div className="bg-white border border-zinc-100 p-8 hover:border-black transition-all group">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
            <p className="text-lg font-black text-black uppercase tracking-tight mb-2 group-hover:text-[#00CC6A] transition-colors">{value}</p>
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

                    {/* Investimento em Mídia - Platform Selection */}
                    <section className="space-y-8 bg-black p-12 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-8 gap-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">INVESTIMENTO EM MÍDIA</h3>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-[#00CC6A]">ALOCAÇÃO DE BUDGET</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOTAL ESTIMADO</p>
                                <p className="text-5xl font-black tracking-tighter">R$ {(getBudgetAmount() * 3).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Platform Selection Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    id: 'google',
                                    name: 'Google Ads',
                                    logo: 'https://www.gstatic.com/images/branding/product/1x/ads_48dp.png',
                                    color: 'bg-zinc-900',
                                    defaultValue: 40
                                },
                                {
                                    id: 'meta',
                                    name: 'Meta Ads',
                                    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/50px-Facebook_Logo_%282019%29.png',
                                    color: 'bg-zinc-800',
                                    defaultValue: 35
                                },
                                {
                                    id: 'linkedin',
                                    name: 'LinkedIn Ads',
                                    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/50px-LinkedIn_logo_initials.png',
                                    color: 'bg-sky-600',
                                    defaultValue: 25
                                }
                            ].map((platform) => (
                                <div
                                    key={platform.id}
                                    className="group border border-zinc-800 hover:border-zinc-600 p-6 transition-all cursor-pointer hover:bg-zinc-900/50"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                                            <img
                                                src={platform.logo}
                                                alt={platform.name}
                                                className="w-8 h-8 object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{platform.name}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Performance</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className={`w-5 h-5 rounded border-2 border-zinc-600 flex items-center justify-center ${platform.defaultValue > 0 ? 'bg-[#00CC6A] border-[#00CC6A]' : ''}`}>
                                                {platform.defaultValue > 0 && (
                                                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Investimento Mensal</span>
                                            <span className="text-lg font-black text-white">
                                                R$ {Math.round(getBudgetAmount() * (platform.defaultValue / 100)).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${platform.color} transition-all duration-500`}
                                                style={{ width: `${platform.defaultValue}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 text-right">{platform.defaultValue}% do budget</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                Plataformas selecionadas: <span className="text-[#00CC6A] font-bold">3</span>
                            </p>
                            <p className="text-sm text-zinc-400">
                                Distribuição recomendada baseada no diagnóstico REI
                            </p>
                        </div>
                    </section>

                    {/* Próximos Passos */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 border border-zinc-200 gap-8 group">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">PRÓXIMA ETAPA</p>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Cronograma de Execução 90 Dias</h3>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Transformação do plano em tarefas operacionais de growth.</p>
                        </div>
                        <Button asChild className="bg-black text-white hover:bg-[#00CC6A] hover:text-black rounded-none h-14 px-8 font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-none shrink-0">
                            <Link to={`/admin/cronograma/${id}`}>Visualizar Roadmap →</Link>
                        </Button>
                    </div>

                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default StrategyPlanning;
