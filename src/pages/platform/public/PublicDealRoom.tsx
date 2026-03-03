
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Clock, DollarSign, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMeetingRecording } from "@/api/clientMeetings";

export default function PublicDealRoom() {
    const { slug } = useParams();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [autoVideoUrl, setAutoVideoUrl] = useState('');

    useEffect(() => {
        const fetchProposal = async () => {
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error("Error loading proposal:", error);
            } else {
                setProposal(data);

                // Auto-fetch call recording if no manual recording_url
                if (!data?.recording_url && data?.client_email) {
                    const recording = await fetchMeetingRecording(data.client_email, 'proposta');
                    if (recording?.video_embed_url) {
                        setAutoVideoUrl(recording.video_embed_url);
                    }
                }
            }
            setLoading(false);
        };

        fetchProposal();
    }, [slug]);

    // Inject Script for Widget
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://pages.revhackers.com.br/js/form_embed.js";
        script.async = true;
        script.type = "text/javascript";
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                try { document.body.removeChild(script); } catch (e) { }
            }
        }
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white flex-col gap-4">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Página não encontrada</h1>
                <p className="text-sm text-zinc-500">O link pode ter expirado ou estar incorreto.</p>
            </div>
        )
    }

    // Determine final video URL: manual > auto from DB
    const videoSrc = proposal.recording_url || autoVideoUrl;
    const isGoogleDriveEmbed = videoSrc?.includes('drive.google.com/file');

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-[#03FC3B] selection:text-black pb-32 overflow-x-hidden">

            {/* Header: BLACK BAR STANDARD (Tarja Preta) */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#09090B] border-b border-zinc-800 z-50 flex items-center justify-between px-4 lg:px-12 transition-all duration-500">
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* RevHackers Logo (From Main Site) */}
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className="h-6 lg:h-8 w-auto opacity-100"
                    />

                    <div className="h-4 lg:h-6 w-[1px] bg-zinc-800" />

                    {/* Client Identifier */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium hidden md:block">Para</span>
                        {proposal.client_logo ? (
                            <div className="bg-white p-1 rounded-sm h-6 lg:h-8 w-auto min-w-[28px] lg:min-w-[32px] flex items-center justify-center">
                                <img src={proposal.client_logo} alt={proposal.client_name} className="h-5 lg:h-6 w-auto mix-blend-multiply" />
                            </div>
                        ) : (
                            <div className="h-6 lg:h-8 w-6 lg:w-8 bg-zinc-800 text-zinc-300 rounded-[2px] flex items-center justify-center font-bold text-[10px] lg:text-xs ring-1 ring-zinc-700">
                                {proposal.client_name?.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className={`rounded-full px-2 lg:px-3 py-0.5 text-[8px] lg:text-[10px] font-bold tracking-wider uppercase border-0 ${proposal.status === 'approved'
                        ? 'bg-green-500 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                        }`}>
                        {proposal.status === 'active' ? '● Em Aberto' : proposal.status}
                    </Badge>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="pt-28 lg:pt-32 px-6 max-w-[1200px] mx-auto space-y-20 lg:space-y-24">

                {/* Section 1: Hero & Context - REFINED & INTERESTING */}
                <section className="text-center space-y-8 lg:space-y-10">
                    <div className="space-y-4 lg:space-y-6 max-w-5xl mx-auto">
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-[1px] w-8 bg-zinc-300"></span>
                            <p className="text-xs font-serif italic text-zinc-500 tracking-wide">
                                Plano Estratégico Exclusivo
                            </p>
                            <span className="h-[1px] w-8 bg-zinc-300"></span>
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-semibold tracking-tighter text-zinc-900 leading-[0.9] text-balance">
                            {proposal.headline || "Growth Strategy Blueprint"}
                        </h1>

                        <p className="text-lg lg:text-xl text-zinc-400 font-light tracking-tight">
                            Preparado para <span className="font-medium text-zinc-900 border-b border-zinc-200 pb-0.5">{proposal.client_name}</span>
                        </p>
                    </div>
                </section>

                {/* Section 2: Video (The Centerpiece) — auto-fetched from Google Meet */}
                {videoSrc ? (
                    <section className="max-w-5xl mx-auto">
                        <div className="group relative w-full aspect-video bg-zinc-900 rounded-[2px] shadow-2xl shadow-zinc-300/40 overflow-hidden hover:shadow-zinc-400/50 transition-all duration-700">
                            <iframe
                                src={isGoogleDriveEmbed
                                    ? videoSrc
                                    : videoSrc.includes('/embed')
                                        ? videoSrc
                                        : videoSrc.replace('/app/meetings/', '/app/embed/')}
                                style={isGoogleDriveEmbed ? {
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                } : {
                                    width: '110%',
                                    height: '150%',
                                    marginTop: '-72px',
                                    marginLeft: '-5%',
                                    border: 'none',
                                }}
                                className="relative z-10 w-full h-full grayscale-[5%] group-hover:grayscale-0 group-hover:scale-[1.01] transition-all duration-1000 ease-out opacity-90 group-hover:opacity-100"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                title="Gravação da Reunião"
                            />
                        </div>
                    </section>
                ) : (
                    <section className="max-w-5xl mx-auto">
                        <div className="w-full aspect-video bg-zinc-900 rounded-[2px] shadow-2xl shadow-zinc-300/40 overflow-hidden flex items-center justify-center">
                            <p className="text-xs uppercase tracking-widest text-zinc-600">Vídeo não disponível</p>
                        </div>
                    </section>
                )}

                {/* Section 3: Mindmap / Blueprint */}
                {(() => {
                    let mindmapSrc = proposal.mindmap_url || proposal.mindmap_code;

                    // If the input is an iframe HTML, extract the src
                    if (mindmapSrc && mindmapSrc.includes('<iframe')) {
                        const srcMatch = mindmapSrc.match(/src=["']([^"']+)["']/);
                        if (srcMatch) mindmapSrc = srcMatch[1];
                    }

                    // Only convert Whimsical share URLs to embed (NOT already embed URLs)
                    if (mindmapSrc && mindmapSrc.includes('whimsical.com') && !mindmapSrc.includes('/embed/')) {
                        // Convert share URL like whimsical.com/my-board-ABC123 to embed/ABC123
                        const parts = mindmapSrc.split('/');
                        const lastPart = parts[parts.length - 1];
                        // Extract ID (might be after a dash or the whole last segment)
                        const id = lastPart.includes('-') ? lastPart.split('-').pop() : lastPart;
                        if (id) mindmapSrc = `https://whimsical.com/embed/${id}`;
                    }

                    const isValidUrl = mindmapSrc && (
                        mindmapSrc.includes('whimsical.com/embed') ||
                        mindmapSrc.includes('miro.com') ||
                        mindmapSrc.includes('figma.com')
                    );

                    if (!isValidUrl && !proposal.mindmap_embed) return null;

                    return (
                        <section className="space-y-6 pt-12 border-t border-zinc-100">
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <span className="w-2 h-2 rounded-full bg-zinc-200"></span>
                                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-[0.2em] text-center">Arquitetura da Solução</h3>
                            </div>
                            <div className="w-full aspect-[16/9] bg-white rounded-[2px] border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-500">
                                {isValidUrl ? (
                                    <iframe src={mindmapSrc} className="w-full h-full border-none" title="Blueprint" />
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: proposal.mindmap_embed }} className="w-full h-full" />
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* Section 4: Detailed Scope (IMPROVED LAYOUT) */}
                {proposal.detailed_scope && (
                    <section className="max-w-4xl mx-auto pt-16 space-y-12">
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-semibold text-zinc-900 tracking-tighter">Roadmap de Execução</h3>
                            <p className="text-zinc-500 max-w-lg mx-auto text-sm">
                                O detalhamento técnico das fases, entregáveis e objetivos estratégicos do projeto.
                            </p>
                        </div>

                        {/* Styled "Document" Card */}
                        <div className="bg-white p-8 lg:p-16 rounded-[4px] border border-zinc-200 shadow-lg shadow-zinc-200/20 prose prose-zinc prose-lg max-w-none 
                            prose-headings:font-serif prose-headings:font-normal prose-headings:text-zinc-900 
                            prose-p:text-zinc-600 prose-p:font-light prose-p:leading-8
                            prose-li:text-zinc-700 prose-li:marker:text-zinc-300
                            prose-strong:font-semibold prose-strong:text-zinc-900">

                            <div className="whitespace-pre-line">
                                {proposal.detailed_scope}
                            </div>

                            {/* Signature Placeholder */}
                            <div className="mt-16 pt-8 border-t border-zinc-100 flex justify-end">
                                <div className="text-right">
                                    <p className="font-serif italic text-zinc-400 text-sm">RevHackers Team</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 5: The "Decision Engine" Grid (Calendar + Pricing) */}
                <section className="pt-24 border-t border-zinc-100/50">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT: Calendar (Massive, Clean) */}
                        <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
                            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                                <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-zinc-400" />
                                    Próximos Passos
                                </h2>
                            </div>

                            <div className="w-full bg-white rounded-[4px] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500 h-[800px] lg:h-auto">
                                <iframe
                                    src="https://pages.revhackers.com.br/widget/booking/uxqTwPld84iuewhcgOjd"
                                    style={{ width: '100%', border: 'none', minHeight: '900px', overflow: 'hidden' }}
                                    scrolling="no"
                                    id="uxqTwPld84iuewhcgOjd_1767734526804"
                                    title="Booking"
                                />
                            </div>
                        </div>

                        {/* RIGHT: Pricing & Terms (Sticky) */}
                        <div className="lg:col-span-4 h-full relative order-1 lg:order-2">
                            <div className="sticky top-24 space-y-8">

                                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                                    <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-3">
                                        <DollarSign className="w-6 h-6 text-zinc-400" />
                                        Investimento
                                    </h2>
                                </div>

                                {/* Pricing Card - More "Technical" & Tactile */}
                                <div className="bg-zinc-950 text-white p-8 rounded-[4px] shadow-2xl flex flex-col gap-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out">

                                    {/* Setup */}
                                    {proposal.setup_fee && Number(proposal.setup_fee) > 0 && (
                                        <div className="space-y-2 relative z-10">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Setup & Onboarding</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-medium text-zinc-500">R$</span>
                                                <span className="text-3xl font-medium text-white tracking-tighter">
                                                    {Number(proposal.setup_fee).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recurring */}
                                    {proposal.installment_value && Number(proposal.installment_value) > 0 && (
                                        <div className="space-y-2 relative z-10">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recorrência Mensal</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-semibold text-white tracking-tighter">
                                                    {proposal.installment_count && Number(proposal.installment_count) > 1
                                                        ? `${proposal.installment_count}x R$ ${Number(proposal.installment_value).toLocaleString('pt-BR')}`
                                                        : `R$ ${Number(proposal.installment_value).toLocaleString('pt-BR')}`
                                                    }
                                                </span>
                                                {!(proposal.installment_count && Number(proposal.installment_count) > 1) &&
                                                    <span className="text-sm text-zinc-600">/mês</span>
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="pt-6 border-t border-zinc-800 relative z-10">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total do Projeto</span>
                                            <span className="text-xl font-bold text-zinc-200 tracking-tight">
                                                {proposal.investment_total ? `R$ ${Number(proposal.investment_total).toLocaleString('pt-BR')}` : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            if (proposal.checkout_url) {
                                                window.open(proposal.checkout_url, '_blank');
                                            } else {
                                                // Fallback if no link: Scroll to calendar
                                                document.getElementById('uxqTwPld84iuewhcgOjd_1767734526804')?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className="w-full bg-[#03FC3B] hover:bg-[#03FC3B]/90 text-zinc-900 font-bold tracking-wide uppercase text-xs h-12 rounded-sm mt-2 transition-transform active:scale-95 duration-200 shadow-[0_0_20px_rgba(3,252,59,0.2)] hover:shadow-[0_0_30px_rgba(3,252,59,0.4)]"
                                    >
                                        Assinar Proposta
                                    </Button>
                                </div>

                                {/* Terms Card */}
                                <div className="bg-white p-6 rounded-[4px] border border-zinc-200 space-y-3 shadow-sm hover:border-zinc-300 transition-colors">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Termos da Proposta</span>
                                    </div>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        {proposal.payment_terms || "Condições padrão: Pagamento do setup em D+5, mensalidades via boleto ou cartão."}
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="py-12 flex justify-center border-t border-zinc-100 mt-20">
                <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers" className="h-6" />
                </div>
            </footer>
        </div>
    );
}
