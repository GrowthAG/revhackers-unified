import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Calendar, Clock, Users, ExternalLink,
    Play, Filter, RefreshCw, AlertCircle, ChevronDown
} from 'lucide-react';
import { fetchGoogleMeetings, MEETING_TYPE_CONFIG, formatDuration, type Meeting } from '@/api/clientMeetings';

// ── Props ────────────────────────────────────────────────────────────────────
interface MeetingTimelineProps {
    clientEmail?: string;
    className?: string;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function MeetingTimeline({ clientEmail, className = '' }: MeetingTimelineProps) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    const loadMeetings = async () => {
        try {
            setError(null);
            const data = await fetchGoogleMeetings(clientEmail);
            setMeetings(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar reuniões');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setLoading(true);
        await loadMeetings();
        setSyncing(false);
    };

    useEffect(() => {
        loadMeetings();
    }, [clientEmail]);

    const filteredMeetings = useMemo(() => {
        if (filterType === 'all') return meetings;
        return meetings.filter(m => m.meeting_type === filterType);
    }, [meetings, filterType]);

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading && meetings.length === 0) {
        return (
            <div className={`${className}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                        <Video className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Reuniões</h3>
                        <p className="text-xs text-zinc-400">Carregando do Google Meet...</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-zinc-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className={`${className}`}>
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Erro ao carregar reuniões</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                    <button onClick={handleSync} className="ml-auto text-xs text-red-600 underline hover:text-red-800">
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
                        <Video className="w-4 h-4 text-[#00CC6A]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Reuniões</h3>
                        <p className="text-xs text-zinc-400">
                            {meetings.length} reuniões encontradas via Google Meet
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-md disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    Sincronizar
                </button>
            </div>

            {/* Filters */}
            {meetings.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${filterType === 'all'
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                    >
                        Todas ({meetings.length})
                    </button>
                    {Object.entries(MEETING_TYPE_CONFIG).map(([key, config]) => {
                        const count = meetings.filter(m => m.meeting_type === key).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterType(key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${filterType === key
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                    }`}
                            >
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {filteredMeetings.length === 0 && (
                <div className="text-center py-12 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <Video className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500 font-medium">Nenhuma reunião encontrada</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        {clientEmail
                            ? `Nenhuma call com ${clientEmail} nos últimos 30 dias`
                            : 'Sincronize para buscar reuniões do Google Meet'
                        }
                    </p>
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
                <AnimatePresence>
                    {filteredMeetings.map((meeting, idx) => {
                        const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type] || MEETING_TYPE_CONFIG.outro;
                        const isExpanded = expandedId === meeting.google_event_id;
                        const meetingDate = new Date(meeting.meeting_date);

                        return (
                            <motion.div
                                key={meeting.google_event_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 transition-colors overflow-hidden"
                            >
                                {/* Card header - always visible */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : meeting.google_event_id)}
                                    className="w-full flex items-center gap-3 p-3 text-left"
                                >
                                    {/* Date badge */}
                                    <div className="shrink-0 w-12 text-center">
                                        <p className="text-xs font-black text-zinc-400 uppercase">
                                            {meetingDate.toLocaleDateString('pt-BR', { month: 'short' })}
                                        </p>
                                        <p className="text-lg font-black text-zinc-900 leading-tight">
                                            {meetingDate.getDate()}
                                        </p>
                                    </div>

                                    <div className="h-10 w-px bg-zinc-200 shrink-0" />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${typeConfig.bg} ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                            {meeting.video_url && (
                                                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                                                    <Play className="w-2.5 h-2.5" /> Gravação
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-900 truncate">
                                            {meeting.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {meetingDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                {meeting.duration_minutes > 0 && ` • ${formatDuration(meeting.duration_minutes)}`}
                                            </span>
                                            {meeting.attendees?.length > 0 && (
                                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {meeting.attendees.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Expanded content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-1 border-t border-zinc-100 space-y-3">
                                                {/* Video embed */}
                                                {meeting.video_url && (
                                                    <div className="bg-zinc-950 rounded-lg overflow-hidden">
                                                        <iframe
                                                            src={`https://drive.google.com/file/d/${meeting.drive_file_id}/preview`}
                                                            className="w-full aspect-video"
                                                            allow="autoplay"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                )}

                                                {/* Attendees */}
                                                {meeting.attendees?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Participantes</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {meeting.attendees.map((a, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full"
                                                                >
                                                                    {a.name || a.email}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    {meeting.video_url && (
                                                        <a
                                                            href={meeting.video_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Abrir no Drive
                                                        </a>
                                                    )}
                                                    {meeting.meet_link && (
                                                        <a
                                                            href={meeting.meet_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                                                        >
                                                            <Video className="w-3 h-3" />
                                                            Link do Meet
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
