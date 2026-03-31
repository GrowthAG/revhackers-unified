import { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, Target, Heart, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { calculateHealthScore, getSuccessVector } from '@/api/successPlan';

interface HealthDimension {
    weight: number;
    indicators: string[];
    initial_score: number;
    current_score?: number;
}

interface HealthScoreCardProps {
    dimensions: {
        adoption: HealthDimension;
        engagement: HealthDimension;
        growth: HealthDimension;
        sentiment: HealthDimension;
    };
    previousHealth?: number;
    milestonesCompleted?: number;
    totalMilestones?: number;
    compact?: boolean;
}

const DIMENSION_CONFIG = {
    adoption: { label: 'Adocao', icon: Target, color: '#00CC6A' },
    engagement: { label: 'Engajamento', icon: Activity, color: '#00CC6A' },
    growth: { label: 'Crescimento', icon: BarChart3, color: '#00CC6A' },
    sentiment: { label: 'Sentimento', icon: Heart, color: '#00CC6A' },
} as const;

const VECTOR_CONFIG = {
    accelerating: { label: 'Acelerando', icon: Zap, color: '#00CC6A', bg: 'bg-[#00CC6A]/10' },
    on_track: { label: 'No Ritmo', icon: TrendingUp, color: '#00CC6A', bg: 'bg-[#00CC6A]/10' },
    stalling: { label: 'Estagnando', icon: Minus, color: '#a1a1aa', bg: 'bg-zinc-100' },
    at_risk: { label: 'Em Risco', icon: TrendingDown, color: '#ef4444', bg: 'bg-zinc-100' },
    critical: { label: 'Critico', icon: AlertTriangle, color: '#ef4444', bg: 'bg-zinc-100' },
} as const;

export default function HealthScoreCard({
    dimensions,
    previousHealth = 0,
    milestonesCompleted = 0,
    totalMilestones = 0,
    compact = false,
}: HealthScoreCardProps) {
    const currentScores = useMemo(() => ({
        adoption: dimensions.adoption.current_score ?? dimensions.adoption.initial_score,
        engagement: dimensions.engagement.current_score ?? dimensions.engagement.initial_score,
        growth: dimensions.growth.current_score ?? dimensions.growth.initial_score,
        sentiment: dimensions.sentiment.current_score ?? dimensions.sentiment.initial_score,
    }), [dimensions]);

    const healthScore = useMemo(
        () => calculateHealthScore(currentScores),
        [currentScores]
    );

    const vector = useMemo(
        () => getSuccessVector(healthScore, previousHealth, milestonesCompleted, totalMilestones),
        [healthScore, previousHealth, milestonesCompleted, totalMilestones]
    );

    const vectorConfig = VECTOR_CONFIG[vector];
    const VectorIcon = vectorConfig.icon;

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ backgroundColor: healthScore >= 60 ? 'rgba(0,204,106,0.1)' : 'rgba(239,68,68,0.1)' }}
                    >
                        <span className="text-sm font-black" style={{ color: healthScore >= 60 ? '#00CC6A' : '#ef4444' }}>
                            {healthScore}
                        </span>
                    </div>
                    <div className={`px-2 py-0.5 text-2xs font-black uppercase tracking-widest ${vectorConfig.bg}`}>
                        <span style={{ color: vectorConfig.color }}>{vectorConfig.label}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: healthScore >= 60 ? '#00CC6A' : '#ef4444' }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-[0.25em]">
                        Health Score
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-4xl font-black text-white">{healthScore}</span>
                        <div className={`px-2.5 py-1 ${vectorConfig.bg} flex items-center gap-1`}>
                            <VectorIcon className="w-3 h-3" style={{ color: vectorConfig.color }} />
                            <span className="text-xxs font-black uppercase tracking-widest" style={{ color: vectorConfig.color }}>
                                {vectorConfig.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Milestones mini */}
                {totalMilestones > 0 && (
                    <div className="text-right">
                        <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">Milestones</span>
                        <div className="text-lg font-black text-white mt-0.5">
                            {milestonesCompleted}<span className="text-zinc-600">/{totalMilestones}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
                {(Object.entries(DIMENSION_CONFIG) as [keyof typeof DIMENSION_CONFIG, typeof DIMENSION_CONFIG[keyof typeof DIMENSION_CONFIG]][]).map(([key, config]) => {
                    const score = currentScores[key];
                    const Icon = config.icon;
                    const percentage = Math.min(score, 100);

                    return (
                        <div key={key} className="bg-zinc-900/50 p-3 border border-zinc-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-3 h-3 text-zinc-400" />
                                <span className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">
                                    {config.label}
                                </span>
                                <span className="ml-auto text-xs font-black text-white">{score}</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: score >= 70 ? '#00CC6A' : score >= 40 ? '#a1a1aa' : '#ef4444',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Weight distribution footer */}
            <div className="mt-4 flex items-center gap-1 justify-center">
                {(Object.entries(DIMENSION_CONFIG) as [keyof typeof DIMENSION_CONFIG, typeof DIMENSION_CONFIG[keyof typeof DIMENSION_CONFIG]][]).map(([key, config]) => (
                    <span key={key} className="text-2xs text-zinc-600 font-mono">
                        {config.label} {Math.round(dimensions[key].weight * 100)}%
                        {key !== 'sentiment' && <span className="mx-1 text-zinc-700">|</span>}
                    </span>
                ))}
            </div>
        </Card>
    );
}
