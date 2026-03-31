import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ResultHeroProps {
    score: number;
    type: string;
}

export default function ResultHero({ score, type }: ResultHeroProps) {
    const [displayScore, setDisplayScore] = useState(0);

    // Animação de contagem progressiva
    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayScore(end);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [score]);

    // Determinar classificação e cor
    const getClassification = (score: number) => {
        if (score >= 80) return { label: 'HIGH PERFORMER', color: 'text-[#00CC6A]', bg: 'bg-[#00CC6A]/10', icon: TrendingUp };
        if (score >= 60) return { label: 'EM CRESCIMENTO', color: 'text-zinc-600', bg: 'bg-zinc-600/10', icon: TrendingUp };
        if (score >= 40) return { label: 'ZONA DE ATENÇÃO', color: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: AlertTriangle };
        return { label: 'ZONA DE RISCO CRÍTICO', color: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: TrendingDown };
    };

    // Calcular impacto financeiro (exemplo simplificado)
    const calculateImpact = (score: number) => {
        const gap = 100 - score;
        const impactPerPoint = 15000; // R$ 15k por ponto de gap
        return Math.floor(gap * impactPerPoint);
    };

    const classification = getClassification(score);
    const Icon = classification.icon;
    const impact = calculateImpact(score);

    return (
        <div className="relative overflow-hidden bg-zinc-900 border border-zinc-700 p-12 mb-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 border border-zinc-600 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <div className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-500">
                            REVENUE SCAN
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                            RAIO-X DE RECEITA
                        </h1>
                    </div>
                </div>

                {/* Score Display */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Score */}
                    <div>
                        <div className="mb-6">
                            <div className="text-8xl font-black font-mono text-white mb-2">
                                {displayScore}
                                <span className="text-4xl text-zinc-600">/100</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${score >= 80 ? 'bg-[#00CC6A]' :
                                            score >= 60 ? 'bg-zinc-600' :
                                                score >= 40 ? 'bg-zinc-300' :
                                                    'bg-zinc-500'
                                        }`}
                                    style={{ width: `${displayScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Classification */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${classification.bg} ${classification.color} border border-current/20`}>
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">
                                {classification.label}
                            </span>
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="border-l border-zinc-700 pl-12">
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                            IMPACTO FINANCEIRO ESTIMADO
                        </div>
                        <div className="text-5xl font-black text-zinc-400 mb-2">
                            R$ {(impact / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-zinc-400 leading-relaxed">
                            em oportunidades de receita não capturadas anualmente
                        </div>

                        {/* CTA Preview */}
                        <div className="mt-6 pt-6 border-t border-zinc-700">
                            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                PRÓXIMO PASSO
                            </div>
                            <div className="text-sm text-white">
                                Agendar Reunião de Planejamento Estratégico
                            </div>
                        </div>
                    </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-6 right-6">
                    <div className="px-3 py-1 bg-revgreen/10 border border-revgreen/30 text-revgreen text-xxs font-black uppercase tracking-wider">
                        {type}
                    </div>
                </div>
            </div>
        </div>
    );
}
