import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
    ChevronLeft, Loader2, Video, FileText, 
    Calendar, Clock, Sparkles, BrainCircuit, 
    Target, Users, FileArchive, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MeetingRecording {
    id: string;
    title: string;
    transcript: string;
    ai_summary: string;
    ai_insights: any;
    video_url: string;
    happened_at: string;
    transcript_status: string;
    rei_project_id: string;
    rei_projects?: {
        trade_name: string;
        client_company: string;
        client_name: string;
    };
}

const MeetingRecordingDoc = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recording, setRecording] = useState<MeetingRecording | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadRecording();
    }, [id]);

    const loadRecording = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('meeting_recordings')
                .select('*, rei_projects(trade_name, client_company, client_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setRecording(data as MeetingRecording);
        } catch (err: any) {
            console.error(err);
            toast.error('Erro ao carregar gravacao', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <Loader2 className="animate-spin w-8 h-8 text-zinc-300" />
                </div>
            </AdminLayout>
        );
    }

    if (!recording) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                    <FileArchive className="w-16 h-16 text-zinc-200 mb-4" />
                    <h2 className="text-xl font-bold tracking-tight text-zinc-800">Gravação não encontrada</h2>
                    <p className="text-zinc-500 mb-6">Este documento pode ter sido removido ou o link e invalido.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">Voltar</Button>
                </div>
            </AdminLayout>
        );
    }

    const insights = recording.ai_insights || {};
    const hasProposta = insights?.tipo_reuniao === 'proposta' && insights?.proposta;
    const hasKickoff = insights?.kickoff_data;

    // Build the dynamic company name based on relations
    const proj = recording.rei_projects;
    const clientName = proj?.trade_name || proj?.client_company || proj?.client_name || "Cliente";

    // Build the Document Title
    const meetingTypeStr = insights?.tipo_reuniao 
        ? insights.tipo_reuniao.charAt(0).toUpperCase() + insights.tipo_reuniao.slice(1)
        : 'Reunião';
    const documentTitle = `${meetingTypeStr} · RevHackers & ${clientName}`;

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white text-zinc-900 pb-24 font-sans selection:bg-zinc-200">
                {/* Header (Top Bar - Fixed) */}
                <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between border-b border-zinc-100">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => recording.rei_project_id ? navigate(`/admin/projects/${recording.rei_project_id}?tab=reunioes`) : navigate(-1)} 
                        className="text-zinc-500 hover:text-black -ml-2"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar ao Projeto
                    </Button>
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                        Editando em modo Leitura
                    </div>
                </div>

                {/* Main Content Area - Notion Style (Centered Max-Width Container) */}
                <div className="max-w-4xl mx-auto pt-16 px-6 lg:px-0">
                    
                    {/* Page Icon & Title Layer */}
                    <div className="mb-4">
                        <div className="text-5xl mb-6">🎥</div> {/* Emoji Ícone estilo Notion */}
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 leading-[1.15] outline-none">
                            {documentTitle}
                        </h1>
                    </div>

                    {/* Metadata Properties Row (Notion Property Style) */}
                    <div className="w-full max-w-lg mb-8 space-y-2">
                        <div className="flex items-center gap-4 text-mini border-b border-zinc-50 pb-2">
                            <span className="text-zinc-400 w-32 flex items-center gap-2"><Calendar className="w-4 h-4"/> Data</span>
                            <span className="font-medium text-zinc-800">
                                {new Date(recording.happened_at).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-mini border-b border-zinc-50 pb-2">
                            <span className="text-zinc-400 w-32 flex items-center gap-2"><Clock className="w-4 h-4"/> Horário</span>
                            <span className="font-medium text-zinc-800">
                                {new Date(recording.happened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-mini border-b border-zinc-50 pb-2">
                            <span className="text-zinc-400 w-32 flex items-center gap-2"><Video className="w-4 h-4"/> Tópico Capturado</span>
                            <span className="font-medium text-zinc-800">{recording.title || "Gravação Automática RevNotes"}</span>
                        </div>
                    </div>

                    {/* Subheadline Context (Quote / Summary block) */}
                    {recording.ai_summary && (
                        <div className="mb-10 p-5 border-l-4 border-zinc-900 bg-zinc-50/50">
                            <p className="text-lg leading-relaxed text-zinc-600 font-serif">
                                <strong className="text-sm uppercase tracking-widest font-sans font-black text-zinc-900 block mb-2 opacity-60">Contexto Geral</strong>
                                "{recording.ai_summary}"
                            </p>
                        </div>
                    )}

                    {/* Video Player (Full Width, Edge-to-Edge of container) */}
                    <div className="mb-12">
                        <div className="w-full bg-[#1A1A1A] overflow-hidden shadow-sm aspect-video relative group ring-1 ring-zinc-200/50">
                            {recording.video_url ? (
                                <video 
                                    src={recording.video_url} 
                                    controls 
                                    className="w-full h-full object-cover"
                                    controlsList="nodownload"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                                    <Video className="w-12 h-12 mb-4 opacity-30" />
                                    <span className="text-sm font-medium tracking-wide">Vídeo ausente. Apenas áudio validado.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-zinc-200 mb-12" />

                    {/* ──── Document Body (Notes & Transcript) ──── */}
                    <article className="prose prose-zinc max-w-none">
                        
                        {/* Extracted Intelligence / AI Notes */}
                        <h2 className="flex items-center gap-2 font-black text-2xl tracking-tight mb-6">
                            <Sparkles className="w-6 h-6 text-[#00E5FF] -mt-1" fill="currentColor" /> 
                            Notas Extraídas (AI)
                        </h2>
                        
                        <p className="text-zinc-500 text-lg mb-8 leading-relaxed">
                            A inteligência artificial transcreveu integralmente a reunião e agrupou os principais vetores de decisão que vocês discutiram abaixo.
                        </p>

                        {(hasProposta || hasKickoff || insights?.inteligencia_estrategica || insights?.acoes_proximas) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                                
                                {/* Buy Signals */}
                                {insights?.proposta?.sinais_compra && insights.proposta.sinais_compra.length > 0 && (
                                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-6 ">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Target className="w-5 h-5 text-emerald-600" />
                                            <h4 className="text-tiny font-black uppercase tracking-widest text-emerald-800 m-0">Sinais de Compra</h4>
                                        </div>
                                        <ul className="space-y-3 m-0 p-0 list-none">
                                            {insights.proposta.sinais_compra.map((s: string, i: number) => (
                                                <li key={i} className="text-body font-medium text-emerald-950 flex items-start gap-3 leading-snug">
                                                    <span className="text-emerald-500 mt-1 shrink-0">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Objections */}
                                {insights?.proposta?.objecoes_detectadas && insights.proposta.objecoes_detectadas.length > 0 && (
                                    <div className="bg-[#fef2f2] border border-[#fecaca] p-6 ">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BrainCircuit className="w-5 h-5 text-red-600" />
                                            <h4 className="text-tiny font-black uppercase tracking-widest text-red-800 m-0">Preocupações/Objeções</h4>
                                        </div>
                                        <ul className="space-y-3 m-0 p-0 list-none">
                                            {insights.proposta.objecoes_detectadas.map((o: string, i: number) => (
                                                <li key={i} className="text-body font-medium text-red-950 flex items-start gap-3 leading-snug">
                                                    <span className="text-red-500 mt-1 shrink-0">•</span> {o}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Next Actions */}
                                {insights?.acoes_proximas && insights.acoes_proximas.length > 0 && (
                                    <div className="bg-zinc-50 border border-zinc-200 p-6 md:col-span-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Users className="w-5 h-5 text-zinc-600" />
                                            <h4 className="text-tiny font-black uppercase tracking-widest text-zinc-800 m-0">Combinados / Próximos Passos</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {insights.acoes_proximas.map((a: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 bg-white border border-zinc-200 p-3 shadow-sm">
                                                    <div className="w-6 h-6 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0" />
                                                    <span className="text-sm text-zinc-800 font-semibold leading-tight">{a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="h-px bg-zinc-200 w-16 mb-12" />

                        {/* Raw Transcript */}
                        <h2 className="flex items-center gap-2 font-black text-2xl tracking-tight mb-6">
                            <FileText className="w-6 h-6 text-zinc-400 -mt-1" /> 
                            Transcrição Bruta
                        </h2>
                        
                        <div className="text-lg leading-relaxed text-zinc-700 font-serif">
                            {recording.transcript ? (
                                // Notion text style parsing
                                recording.transcript.split(/(?<=[.!?])\s+(?=[A-Z])/).map((paragraph, idx) => (
                                    <p key={idx} className="mb-6 hover:bg-zinc-50 transition-colors px-2 -mx-2">
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <p className="text-zinc-400 italic">Nenhuma transcrição foi processada ainda.</p>
                            )}
                        </div>
                    </article>

                </div>
            </div>
        </AdminLayout>
    );
};

export default MeetingRecordingDoc;
