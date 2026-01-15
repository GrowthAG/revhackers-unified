import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Loader2,
    TrendingUp,
    Target,
    Users,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Printer,
    Share2,
    BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getReiProjectById } from '@/api/reiProjects';
import { getLatestDocument, saveDocument } from '@/api/clientDocuments';
import type { ReiProject } from '@/api/reiProjects';
import type { ClientDocument } from '@/api/clientDocuments';

// Minimalist Card Component
const MetricCard = ({ title, value, change, trend, prefix = '', suffix = '' }: { title: string; value: string; change?: string; trend?: 'up' | 'down' | 'neutral'; prefix?: string; suffix?: string }) => (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{title}</h4>
        <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">
                {prefix}{value}{suffix}
            </div>
            {change && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-700' : trend === 'down' ? 'bg-rose-50 text-rose-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : trend === 'down' ? <ArrowDownRight size={14} className="mr-1" /> : null}
                    {change}
                </div>
            )}
        </div>
    </div>
);

const LiveResultsReport = ({ embedded = false, projectId: propProjectId }: { embedded?: boolean; projectId?: string }) => {
    const { projectId: paramProjectId, id: paramId } = useParams();
    const projectId = propProjectId || paramProjectId || paramId;

    const navigate = useNavigate();
    const { toast } = useToast();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [document, setDocument] = useState<ClientDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [cycle, setCycle] = useState('1');

    useEffect(() => {
        if (projectId) loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const proj = await getReiProjectById(projectId!);
            if (!proj) {
                toast({ title: 'Projeto não encontrado', variant: 'destructive' });
                return;
            }
            setProject(proj);

            // Fetch latest report
            const doc = await getLatestDocument(projectId!, 'results_report');
            if (doc) {
                setDocument(doc);
            } else {
                // Initialize default structure if new
                setDocument({
                    content: {
                        metrics: {
                            leads: 0,
                            cac: 0,
                            ltv: 0,
                            mrr: 0,
                            roi: 0
                        },
                        insights: [],
                        cycles: {
                            '1': { status: 'active', metrics: {} },
                            '2': { status: 'pending', metrics: {} },
                            '3': { status: 'pending', metrics: {} },
                            '4': { status: 'pending', metrics: {} }
                        }
                    }
                } as any);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!project) return null;

    // Safe access to content with default
    const content = document?.content || {};
    const cycleMetrics = content.cycles?.[cycle]?.metrics || {};

    const Content = () => (
        <div className={embedded ? "" : "max-w-7xl mx-auto p-8 font-inter"}>
            {/* Header - Hidden if embedded */}
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-zinc-100">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                                <BarChart3 size={16} />
                            </div>
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Relatório de Resultados</h1>
                        </div>
                        <p className="text-sm text-zinc-500 ml-11">
                            Acompanhamento de performance para {project.client_name}.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <div className="flex items-center bg-zinc-50 rounded-lg p-1 border border-zinc-200">
                            {[1, 2, 3, 4].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCycle(c.toString())}
                                    className={`
                                        text-xs font-medium px-4 py-1.5 rounded-md transition-all
                                        ${cycle === c.toString() ? 'bg-white text-zinc-900 shadow-sm border border-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}
                                    `}
                                >
                                    Ciclo 0{c}
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-zinc-200 mx-2" />
                        <Button variant="outline" size="sm" className="h-9 rounded-full text-xs" onClick={() => window.print()}>
                            <Printer size={14} className="mr-2" />
                            PDF / Print
                        </Button>
                        <Button variant="default" size="sm" className="h-9 rounded-full text-xs bg-zinc-900 hover:bg-zinc-800">
                            <Share2 size={14} className="mr-2" />
                            Compartilhar
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-8">

                {/* Key Metrics Grid */}
                <div className="col-span-12">
                    {!embedded && (
                        <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={18} />
                            KPIs Principais
                        </h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Novos Leads (SQL)"
                            value={cycleMetrics.leads || "124"}
                            change="+12%"
                            trend="up"
                        />
                        <MetricCard
                            title="Custo Aquisição (CAC)"
                            value={cycleMetrics.cac || "450"}
                            prefix="R$ "
                            change="-5%"
                            trend="up"
                        />
                        <MetricCard
                            title="Receita Recorrente (MRR)"
                            value={cycleMetrics.mrr || "85.000"}
                            prefix="R$ "
                            change="+8%"
                            trend="up"
                        />
                        <MetricCard
                            title="Retorno (ROI)"
                            value={cycleMetrics.roi || "3.5"}
                            prefix=""
                            change="+0.2"
                            trend="up"
                            suffix="x"
                        />
                    </div>
                </div>

                {/* Qualitative Insights */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm h-full">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            <Target size={16} />
                            Análise de Execução - Ciclo 0{cycle}
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">O Que Funcionou (Highlights)</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-zinc-700">
                                        <div className="min-w-[4px] h-4 bg-emerald-500 rounded-full mt-1" />
                                        Implementação do Playbook de Outbound gerou 15 reuniões qualificadas na semana 2.
                                    </li>
                                    <li className="flex gap-3 text-sm text-zinc-700">
                                        <div className="min-w-[4px] h-4 bg-emerald-500 rounded-full mt-1" />
                                        Redução do ciclo de vendas em 20% após ajuste na etapa de Demo.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Pontos de Atenção (Lowlights)</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-zinc-700">
                                        <div className="min-w-[4px] h-4 bg-amber-500 rounded-full mt-1" />
                                        Taxa de resposta no LinkedIn ainda abaixo da meta (12% vs 20%).
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Próximos Passos</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Para o próximo ciclo, focaremos na otimização da cadência de e-mails para aumentar a taxa de conversão e iniciaremos os testes de canais pagos (LinkedIn Ads).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Status */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 h-full">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <Calendar size={16} />
                            Status do Projeto
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg border border-zinc-200">
                                <span className="text-xs text-zinc-500">Saúde do Projeto</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-medium text-zinc-900">Em Dia (On Track)</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Progresso do Ciclo</span>
                                    <span>75%</span>
                                </div>
                                <div className="w-full bg-zinc-200 rounded-full h-1.5">
                                    <div className="bg-zinc-900 h-1.5 rounded-full" style={{ width: '75%' }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-200 mt-6">
                                <p className="text-xs text-zinc-400 mb-4 text-center">Precisa de ajustes na estratégia?</p>
                                <Button variant="outline" className="w-full bg-white text-xs border-zinc-300">
                                    Solicitar Revisão
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );


    if (embedded) return <Content />;

    return (
        <AdminLayout>
            <Content />
        </AdminLayout>
    );
};

export default LiveResultsReport;
