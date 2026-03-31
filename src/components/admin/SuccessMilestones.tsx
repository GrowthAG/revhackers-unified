import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Flag, Zap, Target, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Milestone {
    name: string;
    phase: string;
    target_day: number;
    metric: string;
    threshold: number;
    unit: string;
    owner: string;
    description: string;
    completed?: boolean;
    completed_at?: string;
}

interface SuccessMilestonesProps {
    milestones: Milestone[];
    kickoffDate?: string;
    onCompleteMilestone?: (index: number) => void;
}

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    embark: { label: 'Embark', color: '#a1a1aa', bg: 'bg-zinc-100' },
    kickoff: { label: 'Kickoff', color: '#00CC6A', bg: 'bg-[#00CC6A]/10' },
    adopt: { label: 'Adopt', color: '#00CC6A', bg: 'bg-[#00CC6A]/10' },
    review: { label: 'Review', color: '#a1a1aa', bg: 'bg-zinc-100' },
    expand: { label: 'Expand', color: '#00CC6A', bg: 'bg-[#00CC6A]/10' },
};

const OWNER_CONFIG: Record<string, { label: string; icon: typeof Users }> = {
    revhackers: { label: 'RevHackers', icon: Zap },
    cliente: { label: 'Cliente', icon: Target },
    ambos: { label: 'Ambos', icon: Users },
};

export default function SuccessMilestones({
    milestones,
    kickoffDate,
    onCompleteMilestone,
}: SuccessMilestonesProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const completed = milestones.filter(m => m.completed).length;
    const total = milestones.length;

    const getTargetDate = (targetDay: number) => {
        if (!kickoffDate) return `Dia ${targetDay}`;
        const date = new Date(kickoffDate);
        date.setDate(date.getDate() + targetDay);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const isOverdue = (targetDay: number, isCompleted: boolean) => {
        if (isCompleted || !kickoffDate) return false;
        const target = new Date(kickoffDate);
        target.setDate(target.getDate() + targetDay);
        return new Date() > target;
    };

    // Group by phase
    const phases = ['embark', 'kickoff', 'adopt', 'review', 'expand'];
    const grouped = phases.map(phase => ({
        phase,
        config: PHASE_CONFIG[phase] || PHASE_CONFIG.embark,
        items: milestones
            .map((m, idx) => ({ ...m, originalIndex: idx }))
            .filter(m => m.phase === phase),
    })).filter(g => g.items.length > 0);

    return (
        <Card className="bg-zinc-950 border border-zinc-800 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-[0.25em]">
                        Success Milestones
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-black text-white">
                            {completed}/{total} concluidos
                        </span>
                        <div className="w-32 h-1.5 bg-zinc-800 overflow-hidden">
                            <div
                                className="h-full bg-[#00CC6A] transition-all duration-500"
                                style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
                {kickoffDate && (
                    <div className="text-right">
                        <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">Kickoff</span>
                        <div className="text-xs font-bold text-zinc-300 mt-0.5">
                            {new Date(kickoffDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                )}
            </div>

            {/* Phases */}
            <div className="space-y-4">
                {grouped.map(({ phase, config, items }) => (
                    <div key={phase}>
                        {/* Phase label */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`px-2 py-0.5 rounded ${config.bg}`}>
                                <span className="text-2xs font-black uppercase tracking-widest" style={{ color: config.color }}>
                                    {config.label}
                                </span>
                            </div>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>

                        {/* Milestones */}
                        <div className="space-y-1 pl-2">
                            {items.map((milestone) => {
                                const overdue = isOverdue(milestone.target_day, !!milestone.completed);
                                const ownerConfig = OWNER_CONFIG[milestone.owner] || OWNER_CONFIG.ambos;
                                const OwnerIcon = ownerConfig.icon;
                                const isExpanded = expandedIndex === milestone.originalIndex;

                                return (
                                    <div
                                        key={milestone.originalIndex}
                                        className={`group border transition-all cursor-pointer ${
                                            milestone.completed
                                                ? 'border-zinc-800 bg-zinc-900/30'
                                                : overdue
                                                ? 'border-zinc-700 bg-zinc-900/50'
                                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                        }`}
                                        onClick={() => setExpandedIndex(isExpanded ? null : milestone.originalIndex)}
                                    >
                                        <div className="flex items-center gap-3 p-3">
                                            {/* Status icon */}
                                            {milestone.completed ? (
                                                <CheckCircle2 className="w-4 h-4 text-[#00CC6A] flex-shrink-0" />
                                            ) : overdue ? (
                                                <Clock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-bold ${milestone.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                                    {milestone.name}
                                                </span>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xxs font-mono text-zinc-500">
                                                    {getTargetDate(milestone.target_day)}
                                                </span>
                                                <div className="flex items-center gap-1 text-zinc-500" title={ownerConfig.label}>
                                                    <OwnerIcon className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-3 pb-3 pt-0 border-t border-zinc-800 mt-0">
                                                <div className="pt-3 space-y-2">
                                                    <p className="text-xs text-zinc-400 leading-relaxed">{milestone.description}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <Flag className="w-3 h-3 text-zinc-500" />
                                                            <span className="text-xxs font-bold text-zinc-400">
                                                                Meta: {milestone.threshold} {milestone.unit}
                                                            </span>
                                                        </div>
                                                        <span className="text-xxs text-zinc-500">
                                                            Metrica: {milestone.metric}
                                                        </span>
                                                    </div>
                                                    {!milestone.completed && onCompleteMilestone && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="mt-2 h-7 text-xxs font-bold uppercase tracking-widest border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onCompleteMilestone(milestone.originalIndex);
                                                            }}
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Marcar Concluido
                                                        </Button>
                                                    )}
                                                    {milestone.completed && milestone.completed_at && (
                                                        <span className="text-xxs text-zinc-600">
                                                            Concluido em {new Date(milestone.completed_at).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
