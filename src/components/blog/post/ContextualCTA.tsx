import React from 'react';
import { ArrowRight, UserCircle, Gauge, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ContextualCTAProps {
    title: string;
    category: string;
}

const ContextualCTA = ({ title, category }: ContextualCTAProps) => {
    // Normalize string for checking
    const text = (title + ' ' + category).toLowerCase();

    // Determine Logic
    let type: 'founder' | 'revenue' | 'site' | 'general' = 'general';

    if (text.includes('linkedin') || text.includes('founder') || text.includes('marca pessoal') || text.includes('social selling')) {
        type = 'founder';
    } else if (text.includes('site') || text.includes('landing page') || text.includes('cro') || text.includes('performance') || text.includes('velocidade')) {
        type = 'site';
    } else if (text.includes('vendas') || text.includes('receita') || text.includes('outbound') || text.includes('comercial')) {
        type = 'revenue';
    }

    if (type === 'general') return null; // Or render a generic one if desired, but user asked for specific connection

    const data = {
        founder: {
            title: "Audite sua Autoridade no LinkedIn",
            desc: "Descubra se seu perfil de Founder está gerando leads ou afastando investidores. Diagnóstico gratuito com IA.",
            btn: "Rodar Founder Score",
            link: "/founder-score",
            icon: <UserCircle className="w-8 h-8 text-black" />
        },
        revenue: {
            title: "Diagnóstico de Receita B2B",
            desc: "Identifique onde estão os gargalos que impedem sua operação de escalar para os próximos 7 dígitos.",
            btn: "Análise de Revenue Ops",
            link: "/revenue-score",
            icon: <Gauge className="w-8 h-8 text-black" />
        },
        site: {
            title: "Seu Site Vende ou Só Ocupa Espaço?",
            desc: "Descubra em 2 minutos se sua infraestrutura digital está pronta para converter tráfego em receita.",
            btn: "Verificar Site Score",
            link: "/site-score",
            icon: <Globe className="w-8 h-8 text-black" />
        },
        general: { title: "", desc: "", btn: "", link: "", icon: null }
    }[type];

    return (
        <div className="my-16 w-full">
            <div className="relative bg-[#F5F5F7] border border-zinc-200 rounded-lg p-8 md:p-10 overflow-hidden group hover:border-black/20 transition-all duration-500">
                {/* Background Decoration */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-200/50 rounded-bl-full pointer-events-none -mr-16 -mt-16"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-shrink-0 bg-white p-6 rounded-full shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform duration-500">
                        {data.icon}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="w-2 h-2 bg-revgreen rounded-full animate-pulse"></span>
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">Recomendado para você</span>
                        </div>
                        <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">
                            {data.title}
                        </h3>
                        <p className="text-zinc-600 font-medium leading-relaxed max-w-xl">
                            {data.desc}
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Link to={data.link}>
                            <Button className="h-14 px-8 bg-black hover:bg-revgreen hover:text-black text-white rounded-none uppercase font-bold text-xs tracking-widest transition-all duration-300 shadow-sm">
                                {data.btn}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextualCTA;
