import { TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface PillarScore {
    name: string;
    score: number;
    status: 'critical' | 'warning' | 'good' | 'excellent';
}

interface PillarScoresProps {
    scores: PillarScore[];
}

export default function PillarScores({ scores }: PillarScoresProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'excellent':
                return { color: 'bg-[#00CC6A]', text: 'text-[#00CC6A]', label: 'EXCELENTE', icon: CheckCircle2 };
            case 'good':
                return { color: 'bg-[#00CC6A]', text: 'text-[#00CC6A]', label: 'BOM', icon: TrendingUp };
            case 'warning':
                return { color: 'bg-zinc-400', text: 'text-zinc-400', label: 'ATENÇÃO', icon: AlertCircle };
            case 'critical':
                return { color: 'bg-zinc-500', text: 'text-zinc-500', label: 'CRITICO', icon: XCircle };
            default:
                return { color: 'bg-zinc-400', text: 'text-zinc-400', label: 'N/A', icon: AlertCircle };
        }
    };

    return (
        <div className="mb-8">
            <div className="mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
                    DIAGNÓSTICO POR PILAR
                </h2>
                <p className="text-sm text-zinc-400">
                    Análise detalhada dos 4 pilares de crescimento de receita
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {scores.map((pillar, index) => {
                    const config = getStatusConfig(pillar.status);
                    const Icon = config.icon;

                    return (
                        <div
                            key={index}
                            className="bg-white border border-zinc-200 p-6 hover:border-black transition-all duration-300 group"
                        >
                            {/* Icon */}
                            <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center mb-4 group-hover:border-black transition-colors">
                                <Icon className={`w-5 h-5 ${config.text}`} />
                            </div>

                            {/* Name */}
                            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-4">
                                {pillar.name}
                            </h3>

                            {/* Score */}
                            <div className="mb-3">
                                <div className="text-3xl font-black font-mono text-black mb-2">
                                    {pillar.score}
                                    <span className="text-lg text-zinc-400">/100</span>
                                </div>
                                <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${config.color} transition-all duration-500`}
                                        style={{ width: `${pillar.score}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className={`inline-flex items-center gap-1 px-2 py-1 bg-${config.color}/10 ${config.text} text-xxs font-black uppercase tracking-wider`}>
                                {config.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
