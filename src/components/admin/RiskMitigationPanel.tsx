import { AlertTriangle, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface Risk {
    category: string;
    title: string;
    description: string;
    probability: string;
    impact: string;
    mitigation: string;
    contingency: string;
    owner: string;
}

interface RedFlag {
    signal: string;
    trigger_action: string;
    escalation: string;
}

interface ChurnPrevention {
    early_warning_signals: string[];
    intervention_playbook: string;
}

interface RiskMitigationPanelProps {
    risks: Risk[];
    redFlags: RedFlag[];
    churnPrevention?: ChurnPrevention;
}

const IMPACT_COLORS: Record<string, string> = {
    critical: 'text-red-400 bg-red-950/30 border-red-900/30',
    high: 'text-zinc-300 bg-zinc-800 border-zinc-700',
    medium: 'text-zinc-400 bg-zinc-900 border-zinc-800',
    low: 'text-zinc-500 bg-zinc-900/50 border-zinc-800',
};

const PROBABILITY_LABEL: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baixa',
};

const CATEGORY_LABEL: Record<string, string> = {
    adoption: 'Adocao',
    technical: 'Tecnico',
    organizational: 'Organizacional',
    financial: 'Financeiro',
    timeline: 'Prazo',
};

export default function RiskMitigationPanel({
    risks,
    redFlags,
    churnPrevention,
}: RiskMitigationPanelProps) {
    const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
    const [showRedFlags, setShowRedFlags] = useState(false);

    const criticalCount = risks.filter(r => r.impact === 'critical' || r.probability === 'high').length;

    return (
        <Card className="bg-zinc-950 border border-zinc-800 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-[0.25em]">
                        Mitigacao de Riscos
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                        <Shield className="w-5 h-5 text-zinc-400" />
                        <span className="text-lg font-black text-white">
                            {risks.length} riscos mapeados
                        </span>
                        {criticalCount > 0 && (
                            <span className="px-2 py-0.5 text-2xs font-black uppercase tracking-widest text-red-400 bg-red-950/30 border border-red-900/30">
                                {criticalCount} criticos
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Risks */}
            <div className="space-y-2 mb-6">
                {risks.map((risk, idx) => {
                    const isExpanded = expandedRisk === idx;
                    const impactStyle = IMPACT_COLORS[risk.impact] || IMPACT_COLORS.medium;

                    return (
                        <div
                            key={idx}
                            className={`border transition-all cursor-pointer ${impactStyle}`}
                            onClick={() => setExpandedRisk(isExpanded ? null : idx)}
                        >
                            <div className="flex items-center gap-3 p-3">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-bold">{risk.title}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-2xs font-mono uppercase">
                                        {CATEGORY_LABEL[risk.category] || risk.category}
                                    </span>
                                    <span className="text-2xs font-bold uppercase px-1.5 py-0.5 bg-black/20">
                                        P: {PROBABILITY_LABEL[risk.probability] || risk.probability}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-3 pb-3 space-y-3 border-t border-inherit pt-3">
                                    <p className="text-xs leading-relaxed opacity-80">{risk.description}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/20 p-2.5">
                                            <span className="text-2xs font-black uppercase tracking-widest opacity-60">Mitigacao</span>
                                            <p className="text-xs mt-1 opacity-80">{risk.mitigation}</p>
                                        </div>
                                        <div className="bg-black/20 p-2.5">
                                            <span className="text-2xs font-black uppercase tracking-widest opacity-60">Contingencia</span>
                                            <p className="text-xs mt-1 opacity-80">{risk.contingency}</p>
                                        </div>
                                    </div>
                                    <div className="text-xxs opacity-60">
                                        Responsavel: <span className="font-bold">{risk.owner === 'revhackers' ? 'RevHackers' : risk.owner === 'cliente' ? 'Cliente' : 'Ambos'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Red Flags */}
            {redFlags.length > 0 && (
                <div>
                    <button
                        className="flex items-center gap-2 mb-3 w-full text-left"
                        onClick={() => setShowRedFlags(!showRedFlags)}
                    >
                        <Eye className="w-4 h-4 text-red-400" />
                        <span className="text-xxs font-black text-red-400 uppercase tracking-[0.25em]">
                            Red Flags ({redFlags.length})
                        </span>
                        <div className="h-px bg-zinc-800 flex-1" />
                        {showRedFlags ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                    </button>

                    {showRedFlags && (
                        <div className="space-y-2">
                            {redFlags.map((flag, idx) => (
                                <div key={idx} className="bg-zinc-900/50 p-3 border border-zinc-800">
                                    <p className="text-xs font-bold text-zinc-300 mb-1">{flag.signal}</p>
                                    <p className="text-xxs text-zinc-500">
                                        <span className="font-bold text-zinc-400">Acao:</span> {flag.trigger_action}
                                    </p>
                                    <p className="text-xxs text-zinc-500">
                                        <span className="font-bold text-zinc-400">Escalar:</span> {flag.escalation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Churn Prevention */}
            {churnPrevention && churnPrevention.early_warning_signals?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-[0.25em]">
                        Prevencao de Churn
                    </span>
                    <div className="mt-2 space-y-1">
                        {churnPrevention.early_warning_signals.map((signal, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-zinc-500 mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-zinc-400">{signal}</span>
                            </div>
                        ))}
                    </div>
                    {churnPrevention.intervention_playbook && (
                        <div className="mt-3 bg-zinc-900/50 p-3 border border-zinc-800">
                            <span className="text-2xs font-black text-zinc-500 uppercase tracking-widest">Playbook de Intervencao</span>
                            <p className="text-xs text-zinc-400 mt-1">{churnPrevention.intervention_playbook}</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
