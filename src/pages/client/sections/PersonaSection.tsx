import React from 'react';
import { User, Target, Zap, MessageSquare, TrendingUp, ShieldAlert, Heart, Radio, BrainCircuit } from 'lucide-react';

interface PersonaSectionProps {
    plan: any;
}

export default function PersonaSection({ plan }: PersonaSectionProps) {
    // Priority: 1. Deep Enriched Personas, 2. Old Market Intelligence, 3. Base Persona Data
    const enriched = plan.diagnostic_data?.enriched_analysis?.personas?.personas;
    const legacyMarket = plan.market_intelligence?.personas;
    const basePersona = plan.persona_data;

    let personas = [];
    if (enriched && Array.isArray(enriched)) {
        personas = enriched;
    } else if (legacyMarket && Array.isArray(legacyMarket)) {
        personas = legacyMarket;
    } else if (basePersona) {
        personas = [basePersona];
    }

    const benchmarks = plan.diagnostic_data?.enriched_analysis?.benchmark?.concorrentes_benchmark ||
        plan.market_intelligence?.concorrentes_benchmark ||
        plan.market_intelligence?.competitor_benchmarks || [];

    const stats = plan.diagnostic_data?.enriched_analysis?.benchmark || {};

    return (
        <div className="space-y-40 py-20">
            {/* Section Header */}
            <div className="text-center space-y-6">
                <h2 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-[-0.05em] select-none uppercase">
                    Persona
                </h2>
                <div className="w-40 h-[1px] bg-revgreen mx-auto shadow-[0_0_20px_rgba(3,252,59,0.5)]"></div>
                <p className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.4em]">
                    Perfis detalhados dos decisores: personalidade, canais, dores, gatilhos e critérios de compra.</p>
            </div>

            {/* Personas Slide Style */}
            {personas.map((persona: any, index: number) => (
                <div key={index} className="max-w-7xl mx-auto relative group">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Persona Main Card */}
                        <div className="lg:col-span-12 space-y-12">
                            <div className="border border-zinc-900 bg-black rounded-[3rem] p-12 flex flex-col md:flex-row gap-16 items-center md:items-start group/card transition-all duration-700 relative overflow-hidden active:scale-[0.99]">
                                <div className="absolute left-0 top-0 w-2 h-full bg-revgreen/20 group-hover/card:bg-revgreen transition-all duration-700"></div>

                                {/* Photo Container */}
                                <div className="w-64 h-80 rounded-3xl border border-zinc-900 overflow-hidden shrink-0 shadow-2xl relative group/img">
                                    <img
                                        src={persona.foto_url || `https://ui-avatars.com/api/?name=${persona.nome}&background=03FC3B&color=000`}
                                        alt={persona.nome}
                                        className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                                    <div className="absolute bottom-6 left-6">
                                        <div className="px-3 py-1 bg-revgreen text-black text-[8px] font-black uppercase tracking-widest rounded-full">Alvo Principal</div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-10 pt-4">
                                    <div className="space-y-4 text-center md:text-left">
                                        <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                                            {persona.nome}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                                            <span className="px-4 py-2 bg-revgreen/10 border border-revgreen/20 text-revgreen text-[10px] font-black uppercase tracking-widest rounded-full">{persona.cargo}</span>
                                            <div className="h-1 w-1 bg-zinc-800 rounded-full"></div>
                                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">{persona.localizacao || 'BRASIL'}</span>
                                            <div className="h-1 w-1 bg-zinc-800 rounded-full"></div>
                                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">AGE: {persona.idade || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="max-w-3xl">
                                        <p className="text-2xl text-zinc-400 font-medium leading-tight italic border-l-2 border-revgreen/30 pl-8 group-hover/card:border-revgreen transition-colors duration-700">
                                            "{persona.bio_curta || 'Perfil estratégico focado em resultados e eficiência operacional.'}"
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12 pt-4">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-revgreen uppercase tracking-[0.3em] flex items-center gap-3">
                                                <Zap size={14} className="animate-pulse" />
                                                Nuance Estratégica
                                            </h4>
                                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                                {persona.historia_curta || `${persona.nome} é o principal stakeholder. Busca previsibilidade e agressividade controlada na escala.`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Dores Principais</h4>
                                                <ul className="space-y-2">
                                                    {["Falta de escala", "CAC elevado", "Gaps no time"].map(p => (
                                                        <li key={p} className="text-[10px] text-white font-bold uppercase tracking-tighter flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-revgreen rounded-full"></div> {p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Hub de Decisão</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {["ROI", "Data", "Speed"].map(d => (
                                                        <span key={d} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-400 font-black uppercase rounded-sm">{d}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personality Pulse System */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-black border border-zinc-900 rounded-[2rem] p-10 space-y-10 relative overflow-hidden group/behavior">
                                    <div className="absolute inset-0 bg-revgreen/5 opacity-0 group-hover/behavior:opacity-100 transition-opacity blur-3xl"></div>
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center justify-between border-b border-zinc-900 pb-8">
                                        DNA Comportamental
                                        <BrainCircuit className="text-revgreen" size={16} />
                                    </h4>
                                    <div className="space-y-12">
                                        {[
                                            { left: "Conservador", right: "Agressivo", value: 85 },
                                            { left: "Analítico", right: "Criativo", value: 45 },
                                            { left: "Passivo", right: "Ativo", value: 70 },
                                            { left: "Individualista", right: "Colaborativo", value: 60 },
                                        ].map((trait, i) => (
                                            <div key={i} className="space-y-4">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-zinc-700">{trait.left}</span>
                                                    <span className="text-white">{trait.right}</span>
                                                </div>
                                                <div className="h-[2px] bg-zinc-900 relative">
                                                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-revgreen rounded-full shadow-[0_0_20px_rgba(3,252,59,1)] scale-100 group-hover/behavior:scale-125 transition-transform" style={{ left: `${trait.value}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-black border border-zinc-900 rounded-[2rem] p-10 space-y-10 relative overflow-hidden group/channels">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center justify-between border-b border-zinc-900 pb-8">
                                        Penetração de Canal
                                        <Radio className="text-revgreen" size={16} />
                                    </h4>
                                    <div className="space-y-10">
                                        {["LinkedIn Search", "Meta Ads", "Rede Direta", "WhatsApp Vendas"].map((canal, i) => (
                                            <div key={canal} className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{canal}</span>
                                                    <span className="text-[9px] font-black text-revgreen group-hover/channels:animate-pulse">Ativo</span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {[...Array(20)].map((_, idx) => (
                                                        <div key={idx} className={`h-4 flex-1 rounded-sm transition-all duration-500 ${idx < (16 - i * 3) ? 'bg-revgreen/80 group-hover/channels:bg-revgreen' : 'bg-zinc-900'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Benchmarks Section */}
            <div className="max-w-7xl mx-auto space-y-20 pt-20 border-t border-zinc-900">
                <div className="text-center space-y-6">
                    <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-none">
                        Benchmark
                    </h2>
                    <p className="text-xs text-zinc-600 uppercase tracking-[0.4em] font-black">Inteligência de Mercado</p>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-[4rem] p-16 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={400} />
                    </div>

                    <div className="grid md:grid-cols-4 gap-12 mb-20 relative z-10">
                        {[
                            { label: "Meta de CAC", value: stats.cac_medio || "N/A", color: "text-revgreen" },
                            { label: "Taxa de Conversão", value: stats.taxa_conversao || "2.4%", color: "text-white" },
                            { label: "Ciclo de Vendas", value: stats.ciclo_vendas || "21 Dias", color: "text-white" },
                            { label: "Ratio LTV:CAC", value: stats.ltv_cac_ratio || "4.1x", color: "text-revgreen" }
                        ].map((s, i) => (
                            <div key={i} className="space-y-2 border-l border-zinc-900 pl-8">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">{s.label}</span>
                                <p className={`text-4xl font-black ${s.color} uppercase tracking-tighter`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 relative z-10">
                        {benchmarks.slice(0, 3).map((bench: any, idx: number) => (
                            <div key={idx} className="bg-black border border-zinc-900 p-10 rounded-[2.5rem] hover:border-revgreen/50 transition-all duration-700 group/bench">
                                <div className="flex justify-between items-start mb-8">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter group-hover/bench:text-revgreen transition-colors">
                                        {bench.nome || bench.company_name}
                                    </h4>
                                    <ShieldAlert size={20} className="text-zinc-800 group-hover/bench:text-revgreen transition-all" />
                                </div>
                                <div className="space-y-6">
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                        {bench.diferencial || bench.strategy_insight || "Principal competidor na camada de serviços high-ticket."}
                                    </p>
                                    <div className="h-[1px] bg-zinc-900 w-full"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Agressividade</span>
                                        <div className="flex gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-revgreen' : 'bg-zinc-900'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

