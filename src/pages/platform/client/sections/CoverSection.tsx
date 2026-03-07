import React from 'react';

interface CoverSectionProps {
    plan: any;
    client: any;
}

export default function CoverSection({ plan, client }: CoverSectionProps) {
    const createdDate = new Date(plan.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 bg-black overflow-hidden">
            {/* Background Gradient Glow (Subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-revgreen/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Top Badge Pin */}
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 flex flex-col items-center gap-6">
                <img
                    src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                    className="h-16 w-auto invert"
                    alt="RevHackers"
                />
                <div className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-revgreen animate-pulse"></span>
                        Estratégia High-End • Growth Intelligence 2026
                    </span>
                </div>
            </div>

            {/* Main Headline - Homepage Style */}
            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.05] tracking-tight">
                    Planejamento de <br />
                    <span className="text-revgreen shadow-[0_0_40px_rgba(3,252,59,0.15)]">Crescimento Exponencial</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed tracking-wide">
                    Uma análise cirúrgica de funil, canais e tecnologia desenhada para <br className="hidden md:block" />
                    escalar a operação comercial da <span className="text-white font-bold">{client.company}</span>.
                </p>

                {/* Buttons Implementation */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                    <button className="px-10 py-5 bg-revgreen text-black text-xs font-black uppercase tracking-[0.2em] rounded-md hover:scale-105 transition-all shadow-[0_0_30px_rgba(3,252,59,0.3)]">
                        Iniciar Apresentação
                    </button>
                    <button className="px-10 py-5 bg-transparent border border-zinc-800 text-white text-xs font-black uppercase tracking-[0.2em] rounded-md hover:bg-white/5 transition-all">
                        Falar com estrategista
                    </button>
                </div>
            </div>

            {/* Technical Footer - Homepage Style */}
            <div className="absolute bottom-12 left-0 right-0">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 py-8 border-t border-zinc-900">
                        {['Geração de Demanda', 'Automação & CRM', 'CRO & Analytics', 'RevOps'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{item}</span>
                                {i < 3 && <div className="w-1 h-1 rounded-full bg-revgreen/30"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
