import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
    Video,
    Loader2,
    ChevronDown,
    ChevronUp,
    Clock,
    BarChart3,
    TrendingUp,
    FileText,
    BrainCircuit,
    Target,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    Lightbulb,
    MessageSquare,
    Users,
    Tag,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiInsights {
    resumo_executivo?: string;
    acoes_identificadas?: string[];
    objecoes_cliente?: string[];
    topicos_principais?: string[];
    sentimento?: 'positivo' | 'neutro' | 'negativo';
    score_engajamento?: number;
    oportunidades_detectadas?: string[];
    riscos_identificados?: string[];
}

interface Participant {
    name: string;
    email?: string;
    role?: string;
    company?: string;
}

type MeetingPhase = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'kickoff' | 'onboarding' | 'review' | 'ongoing' | 'escalation';

interface MeetingRecording {
    id: string;
    title: string | null;
    happened_at: string | null;
    transcript: string | null;
    ai_summary: string | null;
    ai_insights: AiInsights | null;
    video_url: string | null;
    transcript_status: string | null;
    meeting_phase: MeetingPhase | null;
    meeting_type: string | null;
    duration_seconds: number | null;
    participants: Participant[] | null;
    tags: string[] | null;
    client_acknowledged: boolean | null;
    video_hash: string | null;
}

// ---------------------------------------------------------------------------
// Phase Configuration
// ---------------------------------------------------------------------------

const PHASE_ORDER: MeetingPhase[] = [
    'discovery', 'qualification', 'proposal', 'negotiation',
    'kickoff', 'onboarding', 'review', 'ongoing', 'escalation',
];

const PHASE_LABELS: Record<MeetingPhase, string> = {
    discovery: 'Discovery',
    qualification: 'Qualificacao',
    proposal: 'Proposta',
    negotiation: 'Negociacao',
    kickoff: 'Kickoff',
    onboarding: 'Onboarding',
    review: 'Review',
    ongoing: 'Ongoing',
    escalation: 'Escalacao',
};

const PHASE_DESCRIPTIONS: Record<MeetingPhase, string> = {
    discovery: 'Primeiro contato, entendimento do cenario',
    qualification: 'Aprofundamento, validacao de fit',
    proposal: 'Apresentacao de proposta comercial',
    negotiation: 'Alinhamento de escopo e valores',
    kickoff: 'Inicio oficial do projeto',
    onboarding: 'Configuracoes, treinamentos, setup',
    review: 'Revisoes de resultado e sprint',
    ongoing: 'Acompanhamento continuo',
    escalation: 'Tratamento de riscos e crises',
};

// ---------------------------------------------------------------------------
// Meeting Type Config
// ---------------------------------------------------------------------------

const MEETING_TYPE_LABELS: Record<string, string> = {
    call: 'Call',
    screen_share: 'Screen Share',
    presentation: 'Apresentacao',
    kickoff: 'Kickoff',
    review: 'Review',
    internal: 'Interna',
    async_loom: 'Loom',
};

const MEETING_TYPE_STYLES: Record<string, string> = {
    call: 'text-zinc-600 bg-zinc-50 border border-zinc-200',
    screen_share: 'text-zinc-600 bg-zinc-50 border border-zinc-200',
    presentation: 'text-zinc-900 bg-zinc-100 border border-zinc-300',
    kickoff: 'text-[#00CC6A] bg-[#00CC6A]/10 border border-[#00CC6A]/20',
    review: 'text-zinc-700 bg-zinc-100 border border-zinc-200',
    internal: 'text-zinc-500 bg-zinc-50 border border-zinc-200',
    async_loom: 'text-zinc-500 bg-zinc-50 border border-zinc-200',
};

const SENTIMENT_LABELS: Record<string, { label: string; style: string }> = {
    positivo: { label: 'Positivo', style: 'text-[#00CC6A]' },
    neutro: { label: 'Neutro', style: 'text-zinc-500' },
    negativo: { label: 'Negativo', style: 'text-zinc-900' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTimeBR(dateStr: string | null): { date: string; time: string } {
    if (!dateStr) return { date: '-', time: '-' };
    try {
        const d = new Date(dateStr);
        const date = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(d);
        const time = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
        return { date, time };
    } catch {
        return { date: '-', time: '-' };
    }
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h${m > 0 ? `${m}min` : ''}`;
    return `${m}min`;
}

function groupByPhase(meetings: MeetingRecording[]): Map<MeetingPhase | 'sem_fase', MeetingRecording[]> {
    const groups = new Map<MeetingPhase | 'sem_fase', MeetingRecording[]>();
    for (const m of meetings) {
        const phase = m.meeting_phase || 'sem_fase';
        if (!groups.has(phase)) groups.set(phase, []);
        groups.get(phase)!.push(m);
    }
    return groups;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PhaseProgressBar({ phases }: { phases: MeetingPhase[] }) {
    const uniquePhases = [...new Set(phases)];
    const maxIdx = Math.max(...uniquePhases.map(p => PHASE_ORDER.indexOf(p)));

    return (
        <div className="flex items-center gap-1 mb-8">
            {PHASE_ORDER.slice(0, Math.max(maxIdx + 2, 5)).map((phase, idx) => {
                const isActive = uniquePhases.includes(phase);
                const isCurrent = idx === maxIdx;
                return (
                    <React.Fragment key={phase}>
                        <div className="flex flex-col items-center gap-1.5 min-w-0">
                            <div
                                className={`w-full h-1.5 min-w-[40px] md:min-w-[60px] ${
                                    isCurrent
                                        ? 'bg-[#00CC6A]'
                                        : isActive
                                            ? 'bg-zinc-900'
                                            : 'bg-zinc-200'
                                }`}
                            />
                            <span className={`text-2xs font-black uppercase tracking-[0.2em] truncate ${
                                isCurrent
                                    ? 'text-[#00CC6A]'
                                    : isActive
                                        ? 'text-zinc-900'
                                        : 'text-zinc-300'
                            }`}>
                                {PHASE_LABELS[phase]}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function AggregateHeader({ meetings }: { meetings: MeetingRecording[] }) {
    const totalMeetings = meetings.length;

    const totalHours = useMemo(() => {
        const totalSec = meetings.reduce((acc, m) => acc + (m.duration_seconds || 0), 0);
        return Math.round((totalSec / 3600) * 10) / 10;
    }, [meetings]);

    const avgSentiment = useMemo(() => {
        const sentiments = meetings
            .map(m => (m.ai_insights as AiInsights)?.sentimento)
            .filter(Boolean) as string[];
        if (sentiments.length === 0) return 'N/A';
        const scores: Record<string, number> = { positivo: 1, neutro: 0, negativo: -1 };
        const avg = sentiments.reduce((acc, s) => acc + (scores[s] ?? 0), 0) / sentiments.length;
        if (avg > 0.3) return 'positivo';
        if (avg < -0.3) return 'negativo';
        return 'neutro';
    }, [meetings]);

    const totalParticipants = useMemo(() => {
        const names = new Set<string>();
        for (const m of meetings) {
            const parts = (m.participants || []) as Participant[];
            parts.forEach(p => { if (p.name) names.add(p.name); });
        }
        return names.size;
    }, [meetings]);

    const metrics = [
        { label: 'Reunioes', value: String(totalMeetings), icon: Video },
        { label: 'Horas Gravadas', value: totalHours > 0 ? `${totalHours}h` : '-', icon: Clock },
        { label: 'Participantes', value: String(totalParticipants), icon: Users },
        {
            label: 'Sentimento',
            value: avgSentiment === 'N/A' ? 'N/A' : SENTIMENT_LABELS[avgSentiment]?.label || avgSentiment,
            icon: BarChart3,
            className: avgSentiment !== 'N/A' ? SENTIMENT_LABELS[avgSentiment]?.style : undefined,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
                <div key={m.label} className="border border-zinc-200 shadow-sm bg-white px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                            <m.icon className="w-4 h-4 text-zinc-900" />
                        </div>
                        <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">{m.label}</span>
                    </div>
                    <p className={`text-xl font-black tracking-tight ${m.className || 'text-zinc-900'}`}>{m.value}</p>
                </div>
            ))}
        </div>
    );
}

function ParticipantsList({ participants }: { participants: Participant[] }) {
    if (!participants || participants.length === 0) return null;
    return (
        <div className="flex items-center gap-2 flex-wrap mt-2">
            <Users className="w-3 h-3 text-zinc-400 shrink-0" />
            {participants.map((p, i) => (
                <span key={i} className="text-tiny font-medium text-zinc-500">
                    {p.name}{p.role === 'revhackers' ? ' (RH)' : p.role === 'client' ? '' : ''}
                    {i < participants.length - 1 ? ',' : ''}
                </span>
            ))}
        </div>
    );
}

function TagsList({ tags }: { tags: string[] }) {
    if (!tags || tags.length === 0) return null;
    return (
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <Tag className="w-3 h-3 text-zinc-300 shrink-0" />
            {tags.map((tag, i) => (
                <span key={i} className="text-xxs font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5">
                    {tag}
                </span>
            ))}
        </div>
    );
}

function InsightsSection({ insights }: { insights: AiInsights }) {
    const sections: { label: string; items: string[]; icon: React.ElementType }[] = [];

    if ((insights.topicos_principais || []).length > 0) {
        sections.push({ label: 'Topicos Principais', items: insights.topicos_principais || [], icon: Target });
    }
    if ((insights.objecoes_cliente || []).length > 0) {
        sections.push({ label: 'Objecoes / Preocupacoes', items: insights.objecoes_cliente || [], icon: ShieldAlert });
    }
    if ((insights.oportunidades_detectadas || []).length > 0) {
        sections.push({ label: 'Oportunidades', items: insights.oportunidades_detectadas || [], icon: Lightbulb });
    }
    if ((insights.riscos_identificados || []).length > 0) {
        sections.push({ label: 'Riscos', items: insights.riscos_identificados || [], icon: AlertTriangle });
    }
    if ((insights.acoes_identificadas || []).length > 0) {
        sections.push({ label: 'Proximas Acoes', items: insights.acoes_identificadas || [], icon: CheckCircle2 });
    }

    if (sections.length === 0) return null;

    return (
        <div className="space-y-4 mt-4">
            {typeof insights.score_engajamento === 'number' && (
                <div className="flex items-center gap-3">
                    <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">Engajamento</span>
                    <div className="flex-1 h-2 bg-zinc-100 overflow-hidden max-w-[200px]">
                        <div
                            className="h-full bg-[#00CC6A]"
                            style={{ width: `${Math.min(insights.score_engajamento, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-zinc-900">{insights.score_engajamento}/100</span>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                    <div key={section.label} className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <section.icon className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">{section.label}</span>
                        </div>
                        <ul className="space-y-1">
                            {section.items.map((item, idx) => (
                                <li key={idx} className="text-mini font-medium text-zinc-600 leading-relaxed flex items-start gap-2">
                                    <span className="w-1 h-1 bg-zinc-300 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TranscriptViewer({ transcript }: { transcript: string }) {
    const [expanded, setExpanded] = useState(false);
    const TRUNCATE_LIMIT = 600;
    const isTruncated = transcript.length > TRUNCATE_LIMIT;
    const displayText = expanded ? transcript : transcript.substring(0, TRUNCATE_LIMIT);

    return (
        <div className="mt-3 space-y-2">
            <div className="bg-zinc-50 p-4 border border-zinc-200 overflow-y-auto max-h-[240px] text-xs text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap">
                {displayText}
                {!expanded && isTruncated && '...'}
            </div>
            {isTruncated && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-tiny font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                    {expanded ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Mostrar mais</>}
                </button>
            )}
        </div>
    );
}

function MeetingCard({ meeting }: { meeting: MeetingRecording }) {
    const navigate = useNavigate();
    const [showInsights, setShowInsights] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const insights = (meeting.ai_insights || {}) as AiInsights;
    const hasInsights = insights.acoes_identificadas?.length ||
        insights.objecoes_cliente?.length ||
        insights.oportunidades_detectadas?.length ||
        insights.riscos_identificados?.length ||
        insights.topicos_principais?.length;

    const sentimentInfo = insights.sentimento ? SENTIMENT_LABELS[insights.sentimento] : null;
    const mType = meeting.meeting_type || 'call';
    const typeLabel = MEETING_TYPE_LABELS[mType] || mType;
    const typeStyle = MEETING_TYPE_STYLES[mType] || MEETING_TYPE_STYLES.call;

    return (
        <div className="border border-zinc-200 shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-body font-bold text-zinc-900 tracking-tight leading-tight truncate">
                                {meeting.title || 'Reuniao'}
                            </h3>
                            <span className={`text-xxs font-black uppercase tracking-widest px-2.5 py-1 inline-block ${typeStyle}`}>
                                {typeLabel}
                            </span>
                            {meeting.duration_seconds && (
                                <span className="text-xxs font-bold text-zinc-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {formatDuration(meeting.duration_seconds)}
                                </span>
                            )}
                            {sentimentInfo && (
                                <span className={`text-xxs font-black uppercase tracking-widest ${sentimentInfo.style}`}>
                                    {sentimentInfo.label}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {meeting.video_hash && (
                            <div className="flex items-center gap-1 text-xxs font-bold text-zinc-300" title="Integridade verificada (SHA-256)">
                                <Shield className="w-3 h-3" />
                            </div>
                        )}
                        {meeting.video_url && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(meeting.video_url!, '_blank')}
                                className="rounded-none text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-xxs font-black uppercase tracking-widest h-8 px-3 transition-colors"
                                title="Abrir Video"
                            >
                                <Video size={14} />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/recording/${meeting.id}`)}
                            className="rounded-none text-zinc-900 border-zinc-200 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-xxs font-black uppercase tracking-widest h-8 px-4 gap-2 transition-all"
                        >
                            <FileText size={13} strokeWidth={2.5} /> DOCUMENTO
                        </Button>
                    </div>
                </div>

                {/* Participants */}
                <ParticipantsList participants={meeting.participants || []} />

                {/* AI Summary */}
                {meeting.ai_summary && meeting.ai_summary !== 'Sincronizado do tl;dv' && (
                    <p className="text-body font-medium leading-relaxed text-zinc-500 mt-3">
                        {meeting.ai_summary}
                    </p>
                )}
                {!meeting.ai_summary && meeting.transcript_status === 'processing' && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mt-3">
                        <Loader2 className="w-3 h-3 animate-spin" /> Analise em processamento...
                    </div>
                )}

                {/* Tags */}
                <TagsList tags={meeting.tags || []} />

                {/* Client acknowledged badge */}
                {meeting.client_acknowledged && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-[#00CC6A]" />
                        <span className="text-xxs font-black uppercase tracking-widest text-[#00CC6A]">Cliente Confirmou</span>
                    </div>
                )}

                {/* Expandable intelligence */}
                {hasInsights ? (
                    <div className="mt-3">
                        <button
                            onClick={() => setShowInsights(!showInsights)}
                            className="flex items-center gap-2 text-xxs font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors py-1"
                        >
                            <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2.5} />
                            INTELIGÊNCIA EXTRAÍDA
                            {showInsights ? <ChevronUp className="w-3 h-3" strokeWidth={2.5} /> : <ChevronDown className="w-3 h-3" strokeWidth={2.5} />}
                        </button>
                        {showInsights && <InsightsSection insights={insights} />}
                    </div>
                ) : null}

                {/* Expandable transcript */}
                {meeting.transcript && (
                    <div className="mt-2">
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="flex items-center gap-2 text-xxs font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors py-1"
                        >
                            <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                            VER TRANSCRIÇÃO ({Math.round(meeting.transcript.length / 1000)}K CHARS)
                            {showTranscript ? <ChevronUp className="w-3 h-3" strokeWidth={2.5} /> : <ChevronDown className="w-3 h-3" strokeWidth={2.5} />}
                        </button>
                        {showTranscript && <TranscriptViewer transcript={meeting.transcript} />}
                    </div>
                )}
            </div>
        </div>
    );
}

function PhaseGroup({ phase, meetings }: { phase: MeetingPhase | 'sem_fase'; meetings: MeetingRecording[] }) {
    const label = phase === 'sem_fase' ? 'Sem Fase Definida' : PHASE_LABELS[phase];
    const description = phase !== 'sem_fase' ? PHASE_DESCRIPTIONS[phase] : '';
    const phaseIdx = phase !== 'sem_fase' ? PHASE_ORDER.indexOf(phase) : -1;

    return (
        <div className="mb-10 last:mb-0">
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-5">
                <div className={`w-8 h-8 flex items-center justify-center text-xs font-black ${
                    phase === 'sem_fase'
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                        : 'bg-zinc-950 text-white'
                }`}>
                    {phaseIdx >= 0 ? phaseIdx + 1 : '?'}
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">{label}</h3>
                    {description && (
                        <p className="text-tiny font-medium text-zinc-400 mt-0.5">{description}</p>
                    )}
                </div>
                <div className="flex-1 h-[2px] bg-zinc-200" />
                <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                    {meetings.length} {meetings.length === 1 ? 'reuniao' : 'reunioes'}
                </span>
            </div>

            {/* Meetings in this phase */}
            <div className="relative">
                {meetings.map((meeting, idx) => {
                    const { date, time } = formatDateTimeBR(meeting.happened_at);
                    const isLast = idx === meetings.length - 1;

                    return (
                        <div key={meeting.id} className="flex gap-4 md:gap-6 pb-6 last:pb-0">
                            {/* Left: date + time */}
                            <div className="w-20 md:w-28 shrink-0 text-right pt-1">
                                <p className="text-xs font-bold text-zinc-900 leading-tight">{date}</p>
                                <p className="text-xxs font-medium text-zinc-400 mt-0.5">{time}</p>
                            </div>

                            {/* Center: line + dot */}
                            <div className="flex flex-col items-center shrink-0">
                                <div className="w-3 h-3 shrink-0 mt-1.5 bg-zinc-900" />
                                {!isLast && (
                                    <div className="w-[2px] flex-1 bg-zinc-200 mt-1" />
                                )}
                            </div>

                            {/* Right: card */}
                            <div className="flex-1 min-w-0 pb-2">
                                <MeetingCard meeting={meeting} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface MeetingIntelligenceTimelineProps {
    projectId: string;
}

export const MeetingIntelligenceTimeline: React.FC<MeetingIntelligenceTimelineProps> = ({ projectId }) => {
    const [meetings, setMeetings] = useState<MeetingRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingFathom, setSyncingFathom] = useState(false);
    // tl;dv integration removed (plan expired 2026-03-29). Recordings from tl;dv are kept in DB.

    const fetchMeetings = async () => {
        try {
            const { data, error } = await supabase
                .from('meeting_recordings')
                .select('id, title, happened_at, transcript, ai_summary, ai_insights, video_url, transcript_status, meeting_phase, meeting_type, duration_seconds, participants, tags, client_acknowledged, video_hash')
                .eq('rei_project_id', projectId)
                .order('happened_at', { ascending: true });

            if (error) throw error;
            setMeetings((data as unknown as MeetingRecording[]) || []);
        } catch (error) {
            console.error('Error fetching meetings for timeline:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncFathom = async () => {
        try {
            setSyncingFathom(true);
            const { data, error } = await supabase.functions.invoke('fathom-sync', {
                body: { projectId: projectId }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast.success('Sucesso', { description: data.message || 'Sincronizado com Fathom' });
            fetchMeetings(); // recarregar lista
        } catch (e: any) {
            toast.error('Erro na sincronizacao do Fathom', { description: e.message });
        } finally {
            setSyncingFathom(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchMeetings();
    }, [projectId]);

    // Group meetings by phase
    const phaseGroups = useMemo(() => {
        const groups = groupByPhase(meetings);
        // Sort by phase order
        const sorted: { phase: MeetingPhase | 'sem_fase'; items: MeetingRecording[] }[] = [];
        for (const phase of PHASE_ORDER) {
            if (groups.has(phase)) {
                sorted.push({ phase, items: groups.get(phase)! });
            }
        }
        if (groups.has('sem_fase')) {
            sorted.push({ phase: 'sem_fase', items: groups.get('sem_fase')! });
        }
        return sorted;
    }, [meetings]);

    const activePhasesArr = useMemo(
        () => meetings.map(m => m.meeting_phase).filter((p): p is MeetingPhase => !!p),
        [meetings],
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            </div>
        );
    }

    // Empty state
    if (meetings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-zinc-200 bg-white">
                <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-5">
                    <MessageSquare className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Cofre Documental Vazio</h3>
                <p className="text-mini text-zinc-500 font-medium max-w-md leading-relaxed px-6 mb-6">
                    Aperte no botão "Buscar Chamadas" para importar as gravações deste cliente.
                </p>
                <Button 
                    onClick={handleSyncFathom} 
                    disabled={syncingFathom}
                    variant="outline"
                    className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 text-xxs font-black uppercase tracking-widest rounded-none h-10 px-6 gap-2 shadow-sm transition-colors"
                >
                    {syncingFathom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-[#00CC6A]" />}
                    BUSCAR CHAMADAS
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">Cofre Documental</span>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight mt-1">
                        Histórico Completo de Reuniões
                    </h2>
                    <p className="text-mini font-medium text-zinc-400 mt-1">
                        Documentação jurídica e inteligência extraída de todas as interações
                    </p>
                </div>
                
                <Button 
                    variant="outline"
                    onClick={handleSyncFathom} 
                    disabled={syncingFathom}
                    className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 text-xxs font-black uppercase tracking-widest rounded-none h-10 px-4 gap-2 shadow-sm transition-colors"
                >
                    {syncingFathom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-[#00CC6A]" />}
                    BUSCAR CHAMADAS
                </Button>
            </div>

            {/* Phase progress bar */}
            {activePhasesArr.length > 0 && <PhaseProgressBar phases={activePhasesArr} />}

            {/* Aggregate metrics */}
            <AggregateHeader meetings={meetings} />

            {/* Phase-grouped timeline */}
            {phaseGroups.map(({ phase, items }) => (
                <PhaseGroup key={phase} phase={phase} meetings={items} />
            ))}
        </div>
    );
};

export default MeetingIntelligenceTimeline;
