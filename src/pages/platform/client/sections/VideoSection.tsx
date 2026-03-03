import React, { useEffect, useState } from 'react';
import { fetchMeetingRecording } from '@/api/clientMeetings';
import { Play, Video } from 'lucide-react';

interface VideoSectionProps {
    plan: any;
    client: any;
    meetingType: 'proposta' | 'kickoff' | 'planejamento' | 'review';
}

export default function VideoSection({ plan, client, meetingType }: VideoSectionProps) {
    const [embedUrl, setEmbedUrl] = useState('');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [loading, setLoading] = useState(true);

    const clientEmail = client?.email || client?.contact_email || '';

    useEffect(() => {
        async function loadRecording() {
            if (!clientEmail) { setLoading(false); return; }
            const recording = await fetchMeetingRecording(clientEmail, meetingType);
            if (recording?.video_embed_url) {
                setEmbedUrl(recording.video_embed_url);
                setMeetingTitle(recording.title);
                setMeetingDate(recording.meeting_date);
            }
            setLoading(false);
        }
        loadRecording();
    }, [clientEmail, meetingType]);

    const typeLabels: Record<string, { title: string; subtitle: string }> = {
        proposta: { title: 'Reunião de Proposta', subtitle: 'Diagnóstico e apresentação da estratégia' },
        kickoff: { title: 'Reunião de Kickoff', subtitle: 'Alinhamento inicial e primeiros passos do projeto' },
        planejamento: { title: 'Planejamento Estratégico', subtitle: 'Definição de metas, canais e plano de ação' },
        review: { title: 'Review de Performance', subtitle: 'Análise de resultados e ajustes de rota' },
    };

    const label = typeLabels[meetingType] || typeLabels.planejamento;
    const company = client?.company || 'Cliente';

    const formattedDate = meetingDate
        ? new Date(meetingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        : '';

    return (
        <div className="relative flex flex-col h-full bg-zinc-950">
            {/* Grid de fundo */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Brilho decorativo */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#00FF85] rounded-full opacity-[0.04] blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full p-8 md:p-12 lg:p-16">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-[#00FF85]/10 flex items-center justify-center rounded-lg">
                        <Video className="w-5 h-5 text-[#00FF85]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{label.title}</h2>
                        <p className="text-xs text-zinc-500">{label.subtitle}</p>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 flex flex-col justify-center">
                    {loading ? (
                        <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <div className="w-5 h-5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">Carregando gravação...</span>
                            </div>
                        </div>
                    ) : embedUrl ? (
                        <div className="space-y-4">
                            <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl shadow-black/40 group hover:border-zinc-700 transition-all duration-500">
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full"
                                    style={{ border: 'none' }}
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title={meetingTitle || label.title}
                                />
                            </div>

                            {/* Meeting info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Play className="w-3.5 h-3.5 text-[#00FF85]" />
                                    <span className="text-xs text-zinc-400">
                                        {meetingTitle || `${label.title} — ${company}`}
                                    </span>
                                </div>
                                {formattedDate && (
                                    <span className="text-xs text-zinc-600">{formattedDate}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-zinc-800/50 flex items-center justify-center rounded-full">
                                <Video className="w-8 h-8 text-zinc-700" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-zinc-500 font-medium">Gravação não disponível</p>
                                <p className="text-xs text-zinc-600 mt-1">
                                    A gravação será vinculada automaticamente após a reunião
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/50">
                    <div className="w-2 h-2 rounded-full bg-[#00FF85]/40" />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                        Gravação Google Meet — {company}
                    </span>
                </div>
            </div>
        </div>
    );
}
