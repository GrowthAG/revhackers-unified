import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Share2, ArrowRight, Zap, TrendingUp, BarChart2, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateReiPdf } from '@/utils/pdfGenerator';

interface RadarData {
    label: string;
    value: number;
}

interface DashboardProps {
    type: 'FOUNDER' | 'DEV' | 'CONSULTING' | 'FUNNEL' | 'SITE';
    score: number;
    radarData: RadarData[];
    insights: string[];
    onAction: () => void;
    clientName?: string; // Optional context for filename
    answers?: Record<string, any>; // New prop for full responses
}

const RadarChart = ({ data }: { data: RadarData[] }) => {
    const center = 100;
    const scale = 0.8;
    const safeData = Array.isArray(data) ? data : [];

    const points = safeData.map((d, i) => {
        const angle = (Math.PI * 2 * i) / safeData.length - Math.PI / 2;
        const r = (d.value / 100) * 100 * scale;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");

    return (
        <div className="relative w-full h-[250px] flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-[200px] h-[200px] overflow-visible">
                {/* Grid */}
                {[20, 40, 60, 80, 100].map(r => (
                    <circle key={r} cx={100} cy={100} r={r * scale} fill="none" stroke="#d4d4d8" strokeDasharray="2 2" />
                ))}
                {/* Axes */}
                {safeData.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / safeData.length - Math.PI / 2;
                    return (
                        <line
                            key={i}
                            x1={100}
                            y1={100}
                            x2={100 + 100 * scale * Math.cos(angle)}
                            y2={100 + 100 * scale * Math.sin(angle)}
                            stroke="#d4d4d8"
                        />
                    )
                })}
                {/* Data */}
                <motion.polygon
                    points={points}
                    fill="rgba(0, 0, 0, 0.05)"
                    stroke="#000"
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
                {/* Labels */}
                {safeData.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / safeData.length - Math.PI / 2;
                    const r = 105 * scale + 20;
                    const x = 100 + r * Math.cos(angle);
                    const y = 100 + r * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill="#000"
                            fontSize="9"
                            fontWeight="bold"
                            className="uppercase tracking-wider"
                        >
                            {d.label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}

const ReiDashboard = ({ type, score, radarData, insights, onAction, clientName = "Report", answers }: DashboardProps) => {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            await generateReiPdf('rei-dashboard-content', `REI_Result_${clientName}_${type}`);
            toast({
                title: "PDF Gerado!",
                description: "O download deve começar em instantes.",
                className: "bg-black text-white border-zinc-800"
            });
        } catch (error) {
            toast({
                title: "Erro ao gerar PDF",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    const contentMap = {
        FOUNDER: {
            label: "Founder Ledger",
            title: "Painel de Autoridade",
            scoreLabel: "Score de Autoridade",
            icon: <Zap className="w-3 h-3" />,
            cta: "Receber Plano de Personal Branding"
        },
        DEV: {
            label: "Tech Audit",
            title: "Diagnóstico Digital",
            scoreLabel: "Maturidade Digital",
            icon: <BarChart2 className="w-3 h-3" />,
            cta: "Ver Cronograma de Implementação"
        },
        CONSULTING: {
            label: "Revenue Scan",
            title: "Raio-X de Receita",
            scoreLabel: "Revenue Score",
            icon: <TrendingUp className="w-3 h-3" />,
            cta: "Agendar Planejamento Estratégico"
        },
        FUNNEL: {
            label: "Sales Machine",
            title: "Funnels & Automação",
            scoreLabel: "Eficiência Comercial",
            icon: <Zap className="w-3 h-3" />,
            cta: "Ver Estrutura de Funis"
        },
        SITE: {
            label: "Tech Check",
            title: "Performance Digital",
            scoreLabel: "Site Score",
            icon: <Globe className="w-3 h-3" />,
            cta: "Ver Relatório de Tech"
        }
    };

    const content = contentMap[type as keyof typeof contentMap] || contentMap.CONSULTING;

    return (
        <motion.div
            id="rei-dashboard-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-none p-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-zinc-200 pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-black text-white text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">
                        {content.icon} {content.label}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-2">
                        {content.title}
                    </h1>
                    <p className="text-zinc-500 text-sm">Análise de maturidade e potencial de crescimento.</p>
                </div>
                <div className="text-right mt-6 md:mt-0">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1 tracking-[0.3em] font-bold">{content.scoreLabel}</div>
                    <div className="text-7xl font-black text-black tracking-tighter">{score}<span className="text-2xl text-zinc-300 font-light">/100</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Left: Radar */}
                <div className="bg-white rounded-none p-8 border border-zinc-100 shadow-sm flex flex-col items-center justify-center relative min-h-[350px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-zinc-500 to-zinc-200" />
                    <h3 className="absolute top-6 left-6 text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold">Matriz de Performance</h3>
                    <RadarChart data={radarData} />
                </div>

                {/* Right: Insights */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-black text-black flex items-center gap-2 tracking-wide mb-6 uppercase border-b border-black pb-2 w-max">
                            <Target className="w-4 h-4 text-black" /> Diagnóstico Estratégico
                        </h3>

                        <div className="space-y-4">
                            {(insights && insights.length > 0) ? insights.map((insight: string, idx: number) => (
                                <div key={idx} className="group p-5 bg-zinc-50 hover:bg-white border hover:border-black transition-all duration-300 border-l-4 border-l-black rounded-sm">
                                    <p className="text-zinc-800 text-sm leading-relaxed font-medium">
                                        {insight}
                                    </p>
                                </div>
                            )) : (
                                <div className="p-5 bg-zinc-50 border-l-4 border-l-zinc-200 rounded-sm">
                                    <p className="text-zinc-400 text-sm italic">
                                        Nenhum insight disponível para este diagnóstico.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100">
                        <div className="flex gap-4">
                            <Button
                                onClick={() => window.open('/agenda-luna', '_blank')}
                                className="bg-revgreen hover:bg-emerald-400 text-black flex-1 rounded-sm h-14 text-xs uppercase tracking-widest font-black transition-all hover:scale-[1.02]"
                            >
                                {content.cta} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                onClick={handleExportPdf}
                                disabled={isExporting}
                                variant="outline"
                                className="border-zinc-200 text-zinc-500 hover:text-black hover:border-black rounded-sm h-14 px-6 uppercase text-[10px] tracking-widest font-bold"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                                {isExporting ? "Gerando..." : "Exportar PDF"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 pt-20 border-t border-zinc-100">
                <h3 className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold mb-10">Premissas Alinhadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-zinc-50 border border-zinc-100">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Maturidade & Escala</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-tight">Foco em eficiência operacional e processos que permitem dobrar o volume sem dobrar o custo.</p>
                    </div>
                    <div className="p-6 bg-zinc-50 border border-zinc-100">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Tecnologia & Dados</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-tight">Decisões baseadas em evidências. Stack integrada para visibilidade total do pipeline.</p>
                    </div>
                    <div className="p-6 bg-zinc-50 border border-zinc-100">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Velocidade de Execução</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-tight">Framework ágil de testes e iteração. Sprints de 15 dias para validação de hipóteses.</p>
                    </div>
                </div>
            </div>

            {/* Detailed Answers Section */}
            {
                answers && Object.keys(answers).length > 0 && (
                    <div className="mt-12 pt-12 border-t border-zinc-200 print-only-force">
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Respostas do Protocolo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {Object.entries(answers).map(([key, value], idx) => {
                                // Filter out internal control fields
                                if (['wizardStep', 'timestamp', 'privacyPolicy', 'terms'].includes(key)) return null;
                                if (!value) return null;

                                // Format the key to be more readable (camelCase to Title Case)
                                const label = key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, (str) => str.toUpperCase());

                                // Handle array values (multi-select)
                                const displayValue = Array.isArray(value)
                                    ? value.join(', ')
                                    : String(value);

                                if (displayValue === 'true') return null; // Skip boolean flags usually

                                return (
                                    <div key={idx} className="break-inside-avoid pb-4 border-b border-zinc-50 last:border-0">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                                            {label}
                                        </p>
                                        <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                                            {displayValue}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }
        </motion.div >
    );
};

export default ReiDashboard;
