import { motion } from 'framer-motion';
import { Calendar, Clock, Rocket, BarChart3, RefreshCw, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';

const GrowthCronograma = () => {
    const { id } = useParams();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    const timelineSteps = [
        {
            days: "DIA 01 A DIA 10",
            title: "Diagnóstico & Planejamento",
            desc: "Imersão técnica, validação de hipóteses e estruturação do plano GTM.",
            tasks: ["REI Diagnostics", "Kickoff Meeting", "Strategic Planning"],
            icon: Clock,
            isHighlight: false
        },
        {
            days: "DIA 01 A DIA 15",
            title: "Setup de Infraestrutura",
            desc: "Configuração do ecossistema de dados, CRM e stack tecnológica.",
            tasks: ["CRM Setup", "Analytics Integration", "Tracking Implementation"],
            icon: Calendar,
            isHighlight: false
        },
        {
            days: "DIA 01 A DIA 35",
            title: "Go Live: Ads Engine",
            desc: "Lançamento das primeiras campanhas e validação de ofertas.",
            tasks: ["Initial Testing", "Creative Rollout", "Offer Optimization"],
            icon: Rocket,
            isHighlight: true
        },
        {
            days: "DIA 35 A DIA 45",
            title: "Análise de 30 Dias (RAR 1)",
            desc: "Primeiro ciclo de revisão de performance e ajustes táticos.",
            tasks: ["Performance Review", "Data Analysis", "KPI Check"],
            icon: BarChart3,
            isHighlight: false
        },
        {
            days: "DIA 45 A DIA 75",
            title: "Otimização & Escala",
            desc: "Testes A/B, expansão de audiências e refinamento de canais.",
            tasks: ["Scaling Successful Ads", "Audience Expansion"],
            icon: RefreshCw,
            isHighlight: false
        },
        {
            days: "DIA 75 A DIA 90",
            title: "Revisão Trimestral (RAR 2)",
            desc: "Loop de performance do trimestre e replanejamento do próximo ciclo.",
            tasks: ["Quarterly Performance Loop", "Next Quarter Strategy"],
            icon: BarChart3,
            isHighlight: false
        }
    ];

    return (
        <PageLayout>
            <AdminPageLayout
                title="Protocolo de Execução"
                description="ROADMAP DE IMPLEMENTAÇÃO & GROWTH LOOPS (90 DIAS)"
                backTo={id ? `/admin/jornada/${id}` : "/admin"}
                backLabel="Voltar"
            >
                <div className="max-w-4xl space-y-24 py-12">

                    {/* Timeline Minimalist */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {timelineSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={itemAnim}
                                className={`flex flex-col md:flex-row gap-8 p-8 border ${step.isHighlight ? 'border-black bg-black text-white' : 'border-zinc-100 bg-white'} transition-all group`}
                            >
                                <div className="md:w-48 shrink-0">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${step.isHighlight ? 'bg-revgreen text-black' : 'bg-zinc-100 text-zinc-400'}`}>
                                        {step.days}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <h3 className={`text-xl font-black uppercase tracking-tight ${step.isHighlight ? 'text-revgreen' : 'text-black'}`}>
                                                {step.title}
                                            </h3>
                                            <p className={`text-xs font-medium uppercase tracking-widest leading-relaxed ${step.isHighlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                        <step.icon size={20} className={step.isHighlight ? 'text-revgreen' : 'text-zinc-200'} />
                                    </div>

                                    <div className={`flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t ${step.isHighlight ? 'border-zinc-800' : 'border-zinc-50'}`}>
                                        {step.tasks.map((task, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`w-1 h-1 ${step.isHighlight ? 'bg-revgreen' : 'bg-black'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${step.isHighlight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                    {task}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Agendas Section */}
                    <section className="bg-zinc-50 border border-zinc-200 p-12 space-y-12">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Rituais de Performance</h2>
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Reuniões de Apresentação de Resultados (R.A.R).</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: "R.A.R 01", subtitle: "Performance 30 Dias", desc: "Validação inicial do motor de aquisição." },
                                { title: "R.A.R 02", subtitle: "Quarterly Loop", desc: "Análise de fechamento do trimestre e escala." }
                            ].map((rit, i) => (
                                <div key={i} className="bg-white border border-zinc-200 p-10 space-y-6 hover:border-black transition-all group">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase group-hover:text-revgreen transition-colors">{rit.title}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{rit.subtitle}</p>
                                    </div>
                                    <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 leading-relaxed">{rit.desc}</p>
                                    <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-black hover:bg-transparent hover:text-revgreen group/btn">
                                        Agendar Ritual <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default GrowthCronograma;
