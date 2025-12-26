import { motion } from 'framer-motion';
import { Target, Share2, ArrowRight, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RadarData {
    label: string;
    value: number;
}

interface DashboardProps {
    type: 'FOUNDER' | 'DEV' | 'CONSULTING';
    score: number;
    radarData: RadarData[];
    insights: string[];
    onAction: () => void;
}

const RadarChart = ({ data }: { data: RadarData[] }) => {
    const center = 100;
    const scale = 0.8;
    const points = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        const r = (d.value / 100) * 100 * scale;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");

    return (
        <div className="relative w-full h-[250px] flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-[200px] h-[200px] overflow-visible">
                {/* Grid */}
                {[20, 40, 60, 80, 100].map(r => (
                    <circle key={r} cx={100} cy={100} r={r * scale} fill="none" stroke="#e4e4e7" strokeDasharray="2 2" />
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
                            stroke="#e4e4e7"
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
                {data.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
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

const ReiDashboard = ({ type, score, radarData, insights, onAction }: DashboardProps) => {
    const content = {
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
            cta: "Agendar Análise de ROI"
        }
    }[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-none p-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-zinc-200 pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-zinc-100 border border-zinc-200 text-black text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">
                        {content.icon} {content.label}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-2 uppercase">
                        {content.title}
                    </h1>
                    <p className="text-zinc-500 text-sm">Análise baseada no seu perfil e objetivos.</p>
                </div>
                <div className="text-right mt-6 md:mt-0">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1 tracking-[0.3em] font-bold">{content.scoreLabel}</div>
                    <div className="text-6xl font-black text-black">{score}<span className="text-2xl text-zinc-400">/100</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left: Radar */}
                <div className="bg-zinc-50 rounded-none p-8 border border-zinc-200 flex flex-col items-center justify-center relative min-h-[300px]">
                    <h3 className="absolute top-6 left-6 text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Matriz de Performance</h3>
                    <RadarChart data={radarData} />
                </div>

                {/* Right: Insights */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-wide">
                        <Target className="w-5 h-5 text-black" /> Insights Estratégicos
                    </h3>

                    <div className="space-y-4">
                        {insights.map((insight: string, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-50 border-l-2 border-black rounded-none text-zinc-700 text-sm leading-relaxed">
                                {insight}
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 mt-8 border-t border-zinc-200">
                        <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wide">Próximos Passos</h3>
                        <p className="text-zinc-600 mb-6 text-sm">
                            Com base na sua pontuação <strong>{score}</strong>, preparamos um plano de ação imediato.
                        </p>
                        <div className="flex gap-4">
                            <Button onClick={onAction} className="bg-black hover:bg-zinc-800 text-white flex-1 rounded-none h-12 text-xs uppercase tracking-wider font-bold">
                                {content.cta} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button variant="outline" className="border-zinc-200 text-black hover:bg-zinc-50 rounded-none h-12 w-12 p-0">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReiDashboard;
