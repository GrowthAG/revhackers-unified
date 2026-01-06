
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: true, theme: 'neutral' });

const MermaidDiagram = ({ code }: { code: string }) => {
    useEffect(() => {
        mermaid.contentLoaded();
    }, [code]);

    return <div className="mermaid bg-white p-4 rounded-lg shadow-sm overflow-x-auto flex justify-center">{code}</div>;
};

export default function PublicDealRoom() {
    const { slug } = useParams();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            }
            setLoading(false);
        };

        fetchProposal();
    }, [slug]);

    useEffect(() => {
        if (proposal?.mindmap_code) {
            setTimeout(() => {
                mermaid.init(undefined, ".mermaid");
            }, 500);
        }
    }, [proposal]);

    // Inject GHL/RevHackers Script when booking URL is present (to handle resize etc)
    useEffect(() => {
        if (proposal?.booking_url && proposal.booking_url.includes('revhackers.com.br')) {
            const script = document.createElement('script');
            script.src = "https://pages.revhackers.com.br/js/form_embed.js";
            script.async = true;
            script.type = "text/javascript";
            document.body.appendChild(script);
            return () => {
                document.body.removeChild(script);
            }
        }
    }, [proposal]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 flex-col gap-4">
                <h1 className="text-2xl font-bold text-zinc-900">Página não encontrada</h1>
                <p className="text-zinc-500">O link pode ter expirado ou estar incorreto.</p>
            </div>
        )
    }

    // Parse summary markdown roughly (or just display as text if no markdown renderer available)
    // For V2 standard, we should use a proper markdown renderer, but for now let's keep it simple with whitespace.

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-green-100">

            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50 flex items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-3">
                    {proposal.client_logo ? (
                        <img src={proposal.client_logo} alt={proposal.client_name} className="h-8 w-auto mix-blend-multiply" />
                    ) : (
                        <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-xs">
                            {proposal.client_name?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm text-zinc-400">/</span>
                    <span className="font-semibold text-sm tracking-tight text-zinc-900">DEAL ROOM</span>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`uppercase text-[10px] tracking-wider px-3 py-1 ${proposal.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {proposal.status || 'Active'}
                    </Badge>
                    <Button className="bg-[#03FC3B] hover:bg-[#02d632] text-black font-semibold rounded-full px-6 shadow-lg shadow-green-400/20">
                        Aprovar Proposta
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-12">

                {/* Hero Section: Headline & Subheadline */}
                <section className="text-center space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                        {proposal.headline || proposal.title}
                    </h1>
                    {proposal.subheadline && (
                        <p className="text-xl lg:text-2xl text-zinc-500 font-medium leading-relaxed">
                            {proposal.subheadline}
                        </p>
                    )}
                    <p className="text-lg text-zinc-400">
                        Preparado exclusivamente para <strong className="text-zinc-900">{proposal.client_name}</strong>
                    </p>
                </section>

                {/* Video Section */}
                <section className="space-y-8">
                    <div className="aspect-video w-full bg-black rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 relative group">
                        {proposal.recording_url ? (
                            <iframe
                                src={proposal.recording_url}
                                className="absolute top-0 left-[-80%] w-[180%] h-[130%] -mt-[6%] border-none"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-900">
                                <p>Sem vídeo disponível</p>
                            </div>
                        )}
                    </div>

                    {proposal.brief_explanation && (
                        <div className="max-w-3xl mx-auto text-center">
                            <p className="text-lg text-zinc-600 leading-relaxed italic">
                                "{proposal.brief_explanation}"
                            </p>
                        </div>
                    )}
                </section>

                {/* Mindmap / Strategy Visual */}
                {(proposal.mindmap_code || proposal.mindmap_embed) && (
                    <section className="space-y-8 pt-8 border-t border-zinc-100">
                        <div className="text-center">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Visual Strategy Map</h2>
                        </div>

                        {proposal.mindmap_embed ? (
                            <div className="w-full aspect-[16/10] bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: proposal.mindmap_embed }}
                            />
                        ) : (
                            <div className="p-1 bg-gradient-to-tr from-zinc-50 via-white to-zinc-50 rounded-2xl border border-zinc-200">
                                <div className="bg-white rounded-xl p-8 overflow-hidden min-h-[400px] flex justify-center items-center">
                                    <div className="mermaid scale-110">
                                        {proposal.mindmap_code}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Detailed Scope Section */}
                {proposal.detailed_scope && (
                    <section className="space-y-8 pt-16 border-t border-zinc-100">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-zinc-900">Projeto & Escopo Detalhado</h2>
                            <div className="h-[1px] flex-1 bg-zinc-100" />
                        </div>

                        <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-zinc-100 prose prose-zinc max-w-none">
                            <div className="whitespace-pre-line text-zinc-600 leading-relaxed">
                                {proposal.detailed_scope}
                            </div>
                        </div>
                    </section>
                )}

                {/* Investment & Payments */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16 border-t border-zinc-100">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Prazos & Condições</h2>
                        <div className="bg-zinc-900 text-zinc-100 p-8 rounded-3xl space-y-4">
                            <div className="prose prose-invert max-w-none text-zinc-400 text-sm whitespace-pre-line">
                                {proposal.payment_terms || "Condições padrão da RevHackers: Net 15 para setup, parcelas mensais antecipadas."}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Investimento</h2>
                        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl shadow-green-500/5 flex flex-col justify-center h-full min-h-[200px]">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Estimado</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold">R$</span>
                                <span className="text-5xl font-black tracking-tighter">
                                    {proposal.investment_total || "0,00"}
                                </span>
                            </div>
                            <Button
                                onClick={() => {
                                    const el = document.getElementById('closing');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full mt-8 bg-[#03FC3B] hover:bg-[#02d632] text-black font-bold h-12 rounded-xl text-md"
                            >
                                Agendar Call de Aceite da Proposta
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Booking / Closing Section */}
                {proposal.booking_url && (
                    <section className="pt-24 pb-12" id="closing">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Próximos Passos</h2>
                            <p className="text-zinc-500 mt-2">Agende a call de assinatura para formalizarmos a parceria.</p>
                        </div>
                        <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100">
                            {/* Adjusted Iframe for GHL Widget */}
                            <iframe
                                src={proposal.booking_url}
                                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                                scrolling="no"
                                id="booking_iframe"
                                title="Agendamento"
                            />
                        </div>
                    </section>
                )}

            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 py-12 text-center">
                <p className="text-sm text-zinc-400">
                    © 2026 RevHackers. Power by Growth Intelligence.
                </p>
            </footer>
        </div>
    );
}
