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
        <div className="relative flex flex-col h-full bg-white">
            <div className="relative z-10 flex flex-col h-full p-8 md:p-12 lg:p-16">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center rounded-xl shadow-sm">
                        <Video className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-black tracking-tight">{label.title}</h2>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{label.subtitle}</p>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 flex flex-col justify-center">
                    {loading ? (
                        <div className="w-full aspect-video bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-center">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                <span className="text-xs font-bold uppercase tracking-widest">Carregando gravação...</span>
                            </div>
                        </div>
                    ) : embedUrl ? (
                        <div className="space-y-5">
                            <div className="w-full aspect-video bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-sm transition-all duration-500">
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
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                                    <Play className="w-3.5 h-3.5 text-black" />
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700">
                                        {meetingTitle || `${label.title} - ${company}`}
                                    </span>
                                </div>
                                {formattedDate && (
                                    <span className="text-xs uppercase tracking-widest font-black text-zinc-400">{formattedDate}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-5">
                            <div className="w-16 h-16 bg-white shadow-sm border border-zinc-200 flex items-center justify-center rounded-full">
                                <Video className="w-7 h-7 text-zinc-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-black font-black uppercase tracking-widest mb-1.5">Gravação não disponível</p>
                                <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto">
                                    A gravação será processada e vinculada a este painel automaticamente após a finalização da reunião no Google Meet
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-8 pt-6 border-t border-zinc-200">
                    <div className="w-2 h-2 rounded-full bg-[#00CC6A]" />
                    <span className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                        Gravação Oficial / {company}
                    </span>
                </div>
            </div>
        </div>
    );
}
