
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

                {/* Intro Section */}
                <section className="text-center space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                        {proposal.title}
                    </h1>
                    <p className="text-lg text-zinc-500">
                        Preparado exclusivamente para <strong className="text-zinc-900">{proposal.client_name}</strong>
                    </p>
                </section>

                {/* Video & AI Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left: Video */}
                    <div className="space-y-6">
                        <div className="aspect-video w-full bg-black rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 relative group">
                            {/* Simplified Embed Logic */}
                            {proposal.recording_url ? (
                                <iframe
                                    src={proposal.recording_url.replace('loom.com/share', 'loom.com/embed').replace('tldv.io', 'tldv.io/embed')} // Very basic replacement, needs robust logic
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-900">
                                    <p>Sem vídeo disponível</p>
                                </div>
                            )}
                        </div>

                        {/* Investment Card (Mobile/Desktop compact) */}
                        {proposal.investment_total && (
                            <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Investimento Total</p>
                                    <p className="text-3xl font-bold text-zinc-900 mt-1">{proposal.investment_total}</p>
                                </div>
                                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: AI Executive Summary */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-[#03FC3B] animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Executive Summary (AI)</span>
                        </div>
                        <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed whitespace-pre-line">
                            {proposal.summary || "Generating strategies..."}
                        </div>
                    </div>
                </div>

                {/* Mindmap Strategy Section */}
                {proposal.mindmap_code && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Visual Strategy Map</span>
                        </div>
                        <div className="p-1 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 rounded-2xl">
                            <div className="bg-white rounded-xl p-8 overflow-hidden min-h-[400px]">
                                <div className="mermaid flex justify-center">
                                    {proposal.mindmap_code}
                                </div>
                                {/* Fallback explanation if mermaid fails to render immediately */}
                                <p className="text-center text-xs text-zinc-300 mt-4 font-mono">Rendered by Mermaid.js</p>
                            </div>
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
