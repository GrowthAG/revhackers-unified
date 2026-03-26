import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
    Video,
    Loader2,
    PlayCircle,
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

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

interface MeetingRecording {
    id: string;
    title: string | null;
    happened_at: string | null;
    transcript: string | null;
    ai_summary: string | null;
    ai_insights: AiInsights | null;
    video_url: string | null;
    transcript_status: string | null;
}

type MeetingType = 'proposta' | 'kickoff' | 'followup' | 'review' | 'outro';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferMeetingType(title: string | null): MeetingType {
    if (!title) return 'outro';
    const lower = title.toLowerCase();
    if (lower.includes('proposta') || lower.includes('comercial') || lower.includes('sales') || lower.includes('pitch')) return 'proposta';
    if (lower.includes('kickoff') || lower.includes('kick-off') || lower.includes('onboarding') || lower.includes('kick off')) return 'kickoff';
    if (lower.includes('review') || lower.includes('revisao') || lower.includes('resultado') || lower.includes('sprint')) return 'review';
    if (lower.includes('follow') || lower.includes('acompanhamento') || lower.includes('check')) return 'followup';
    return 'outro';
}

const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
    proposta: 'Proposta',
    kickoff: 'Kickoff',
    followup: 'Follow-up',
    review: 'Review',
    outro: 'Reuniao',
};

const MEETING_TYPE_STYLES: Record<MeetingType, string> = {
    proposta: 'text-zinc-900 bg-zinc-100 border border-zinc-300',
    kickoff: 'text-[#00CC6A] bg-[#00CC6A]/10 border border-[#00CC6A]/20',
    followup: 'text-zinc-600 bg-zinc-50 border border-zinc-200',
    review: 'text-zinc-700 bg-zinc-100 border border-zinc-200',
    outro: 'text-zinc-500 bg-zinc-50 border border-zinc-200',
};

const SENTIMENT_LABELS: Record<string, { label: string; style: string }> = {
    positivo: { label: 'Positivo', style: 'text-[#00CC6A]' },
    neutro: { label: 'Neutro', style: 'text-zinc-500' },
    negativo: { label: 'Negativo', style: 'text-zinc-900' },
};

function formatDateTimeBR(dateStr: string | null): { date: string; time: string } {
    if (!dateStr) return { date: '-', time: '-' };
    try {
        const d = new Date(dateStr);
        const formatted = new Intl.DateTimeFormat('pt-BR', {
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
        return { date: formatted, time };
    } catch {
        return { date: '-', time: '-' };
    }
}

function estimateHoursFromTranscript(transcript: string | null): number {
    if (!transcript) return 0;
    // Average speaking rate ~150 words/min, average word length ~5 chars
    const words = transcript.length / 5;
    const minutes = words / 150;
    return Math.round((minutes / 60) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AggregateHeader({ meetings }: { meetings: MeetingRecording[] }) {
    const totalMeetings = meetings.length;

    const totalHours = useMemo(() => {
        const sum = meetings.reduce((acc, m) => acc + estimateHoursFromTranscript(m.transcript), 0);
        return Math.round(sum * 10) / 10;
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

    const avgEngagement = useMemo(() => {
        const scores = meetings
            .map(m => (m.ai_insights as AiInsights)?.score_engajamento)
            .filter((s): s is number => typeof s === 'number');
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [meetings]);

    const metrics = [
        { label: 'Reunioes', value: String(totalMeetings), icon: Video },
        { label: 'Horas Gravadas', value: `${totalHours}h`, icon: Clock },
        {
            label: 'Sentimento Medio',
            value: avgSentiment === 'N/A' ? 'N/A' : SENTIMENT_LABELS[avgSentiment]?.label || avgSentiment,
            icon: BarChart3,
            className: avgSentiment !== 'N/A' ? SENTIMENT_LABELS[avgSentiment]?.style : undefined,
        },
        { label: 'Engajamento Medio', value: `${avgEngagement}/100`, icon: TrendingUp },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
                <div key={m.label} className="border border-zinc-200 rounded-2xl shadow-sm bg-white px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center">
                            <m.icon className="w-4 h-4 text-zinc-900" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{m.label}</span>
                    </div>
                    <p className={`text-xl font-black tracking-tight ${m.className || 'text-zinc-900'}`}>{m.value}</p>
                </div>
            ))}
        </div>
    );
}

function InsightsSection({ insights, meetingType }: { insights: AiInsights; meetingType: MeetingType }) {
    const isProposta = meetingType === 'proposta';

    const sections: { label: string; items: string[]; icon: React.ElementType }[] = [];

    if ((insights.topicos_principais || []).length > 0) {
        sections.push({ label: 'Topicos Principais', items: insights.topicos_principais || [], icon: Target });
    }
    if ((insights.objecoes_cliente || []).length > 0) {
        sections.push({ label: isProposta ? 'Objecoes Detectadas' : 'Preocupacoes do Cliente', items: insights.objecoes_cliente || [], icon: ShieldAlert });
    }
    if ((insights.oportunidades_detectadas || []).length > 0) {
        sections.push({ label: isProposta ? 'Sinais de Compra' : 'Oportunidades', items: insights.oportunidades_detectadas || [], icon: Lightbulb });
    }
    if ((insights.riscos_identificados || []).length > 0) {
        sections.push({ label: 'Riscos Identificados', items: insights.riscos_identificados || [], icon: AlertTriangle });
    }
    if ((insights.acoes_identificadas || []).length > 0) {
        sections.push({ label: 'Proximas Acoes', items: insights.acoes_identificadas || [], icon: CheckCircle2 });
    }

    if (sections.length === 0) return null;

    return (
        <div className="space-y-4 mt-4">
            {/* Engagement score gauge for proposta */}
            {isProposta && typeof insights.score_engajamento === 'number' && (
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Score de Fechamento</span>
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden max-w-[200px]">
                        <div
                            className="h-full rounded-full bg-[#00CC6A]"
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
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{section.label}</span>
                        </div>
                        <ul className="space-y-1">
                            {section.items.map((item, idx) => (
                                <li key={idx} className="text-[13px] font-medium text-zinc-600 leading-relaxed flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-zinc-300 mt-2 shrink-0" />
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
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 overflow-y-auto max-h-[240px] text-xs text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap">
                {displayText}
                {!expanded && isTruncated && '...'}
            </div>
            {isTruncated && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                    {expanded ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Mostrar mais</>}
                </button>
            )}
        </div>
    );
}

function MeetingCard({ meeting, isLatest }: { meeting: MeetingRecording; isLatest: boolean }) {
    const navigate = useNavigate();
    const [showInsights, setShowInsights] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const meetingType = inferMeetingType(meeting.title);
    const insights = (meeting.ai_insights || {}) as AiInsights;
    const hasInsights = insights.acoes_identificadas?.length ||
        insights.objecoes_cliente?.length ||
        insights.oportunidades_detectadas?.length ||
        insights.riscos_identificados?.length ||
        insights.topicos_principais?.length;

    const sentimentInfo = insights.sentimento ? SENTIMENT_LABELS[insights.sentimento] : null;

    return (
        <div className="border border-zinc-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight leading-tight truncate">
                                {meeting.title || 'Reuniao'}
                            </h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block ${MEETING_TYPE_STYLES[meetingType]}`}>
                                {MEETING_TYPE_LABELS[meetingType]}
                            </span>
                            {sentimentInfo && (
                                <span className={`text-[10px] font-black uppercase tracking-widest ${sentimentInfo.style}`}>
                                    {sentimentInfo.label}
                                </span>
                            )}
                            {typeof insights.score_engajamento === 'number' && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    Engajamento {insights.score_engajamento}/100
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {meeting.video_url && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(meeting.video_url!, '_blank')}
                                className="text-zinc-600 border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest h-8 px-2"
                                title="Baixar Video (Raw)"
                            >
                                <Video size={14} />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={() => navigate(`/admin/recording/${meeting.id}`)}
                            className="bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest h-8 gap-1.5"
                        >
                            <FileText size={12} /> Abrir Documento
                        </Button>
                    </div>
                </div>

                {/* AI Summary */}
                {meeting.ai_summary && (
                    <p className="text-[15px] font-medium leading-relaxed text-zinc-500 mb-3">
                        {meeting.ai_summary}
                    </p>
                )}
                {!meeting.ai_summary && meeting.transcript_status === 'processing' && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mb-3">
                        <Loader2 className="w-3 h-3 animate-spin" /> Analise em processamento...
                    </div>
                )}

                {/* Expandable intelligence */}
                {hasInsights ? (
                    <div>
                        <button
                            onClick={() => setShowInsights(!showInsights)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors py-1"
                        >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Inteligencia Extraida
                            {showInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showInsights && <InsightsSection insights={insights} meetingType={meetingType} />}
                    </div>
                ) : null}

                {/* Expandable transcript */}
                {meeting.transcript && (
                    <div className="mt-2">
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors py-1"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Ver Transcricao
                            {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showTranscript && <TranscriptViewer transcript={meeting.transcript} />}
                    </div>
                )}
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

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data, error } = await supabase
                    .from('meeting_recordings')
                    .select('id, title, happened_at, transcript, ai_summary, ai_insights, video_url, transcript_status')
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

        if (projectId) fetchMeetings();
    }, [projectId]);

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
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
                <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mb-5">
                    <MessageSquare className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Nenhuma Reuniao Gravada</h3>
                <p className="text-[13px] text-zinc-500 font-medium max-w-md leading-relaxed px-6">
                    Use a extensao RevHackers Clipper para gravar calls automaticamente.
                    As reunioes aparecerao aqui em ordem cronologica com inteligencia de IA.
                </p>
            </div>
        );
    }

    // Find latest meeting index (most recent by happened_at)
    const latestIdx = meetings.length - 1;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Timeline de Inteligencia</span>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight mt-1">
                    Historico Completo de Reunioes
                </h2>
            </div>

            {/* Aggregate metrics */}
            <AggregateHeader meetings={meetings} />

            {/* Timeline */}
            <div className="relative">
                {meetings.map((meeting, idx) => {
                    const isLatest = idx === latestIdx;
                    const { date, time } = formatDateTimeBR(meeting.happened_at);

                    return (
                        <div key={meeting.id} className="flex gap-4 md:gap-6 pb-8 last:pb-0">
                            {/* Left: date + time */}
                            <div className="w-20 md:w-28 shrink-0 text-right pt-1">
                                <p className="text-xs font-bold text-zinc-900 leading-tight">{date}</p>
                                <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{time}</p>
                            </div>

                            {/* Center: line + dot */}
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${isLatest ? 'bg-[#00CC6A] shadow-[0_0_8px_rgba(0,204,106,0.3)]' : 'bg-zinc-300'}`} />
                                {idx < meetings.length - 1 && (
                                    <div className="w-[2px] flex-1 bg-zinc-200 mt-1" />
                                )}
                            </div>

                            {/* Right: card */}
                            <div className="flex-1 min-w-0 pb-2">
                                <MeetingCard meeting={meeting} isLatest={isLatest} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MeetingIntelligenceTimeline;
