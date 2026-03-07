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
        <div className="space-y-12 py-8">
            {/* Section Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    PÚBLICO-ALVO
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">
                    Persona <span className="text-zinc-300">Estratégica</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Perfil detalhado do decisor ideal, baseado no diagnóstico e inteligência de mercado.
                </p>
            </div>

            {/* Personas Slide Style */}
            {personas.map((persona: any, index: number) => (
                <div key={index} className="border border-zinc-200 rounded-2xl p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Photo */}
                        <div className="w-32 h-40 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                            <img
                                src={persona.foto_url || `https://ui-avatars.com/api/?name=${persona.nome}&background=09090b&color=fff&size=256`}
                                alt={persona.nome}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900">{persona.nome}</h3>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {persona.cargo && <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">{persona.cargo}</span>}
                                    {persona.localizacao && <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">{persona.localizacao}</span>}
                                    {persona.idade && <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg">{persona.idade} anos</span>}
                                </div>
                            </div>

                            {(persona.bio_curta || persona.historia_curta) && (
                                <p className="text-sm text-zinc-500 leading-relaxed border-l-2 border-zinc-200 pl-4 italic">
                                    "{persona.bio_curta || persona.historia_curta}"
                                </p>
                            )}

                            {/* Dores & Gatilhos */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {persona.dores && persona.dores.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Principais Dores</h4>
                                        <ul className="space-y-2">
                                            {persona.dores.map((dor: string, j: number) => (
                                                <li key={j} className="text-sm text-zinc-600 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full mt-1.5 shrink-0" />
                                                    {dor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {persona.gatilhos && persona.gatilhos.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Gatilhos de Decisão</h4>
                                        <ul className="space-y-2">
                                            {persona.gatilhos.map((g: string, j: number) => (
                                                <li key={j} className="text-sm text-zinc-600 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-[#00CC6A] rounded-full mt-1.5 shrink-0" />
                                                    {g}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Canais Preferíveis */}
                            {persona.canais && persona.canais.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Canais de Relacionamento</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {persona.canais.map((canal: string, j: number) => (
                                            <span key={j} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600 rounded-lg">{canal}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Benchmarks */}
            {benchmarks.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-zinc-100">
                    <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-1">Inteligência Competitiva</span>
                        <h3 className="text-xl font-bold text-zinc-900">Benchmark de Mercado</h3>
                    </div>

                    {/* Stats */}
                    {(stats.cac_medio || stats.taxa_conversao || stats.ciclo_vendas) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'CAC Médio', value: stats.cac_medio },
                                { label: 'Taxa de Conversão', value: stats.taxa_conversao },
                                { label: 'Ciclo de Vendas', value: stats.ciclo_vendas },
                                { label: 'LTV:CAC', value: stats.ltv_cac_ratio },
                            ].filter(s => s.value).map((s, i) => (
                                <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-xl p-5">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">{s.label}</span>
                                    <p className="text-xl font-bold text-zinc-900">{s.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Concorrentes */}
                    <div className="grid lg:grid-cols-3 gap-4">
                        {benchmarks.slice(0, 3).map((bench: any, idx: number) => (
                            <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-sm transition-all">
                                <h4 className="text-base font-bold text-zinc-900 mb-2">{bench.nome || bench.company_name}</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {bench.diferencial || bench.strategy_insight || '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

