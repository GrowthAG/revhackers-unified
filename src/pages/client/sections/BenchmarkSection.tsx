import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, ChevronRight, ChevronDown, ExternalLink, Lightbulb, PieChart } from 'lucide-react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── No more mock data for segments (Strict Production Policy) ──────────────────────────
const mockDataMap: Record<string, any> = {};

function getSegmentKey(plan: any) {
    const segment = plan?.diagnostic_data?.context_mirror?.segmento || plan?.diagnostic_data?.context_mirror?.segment || plan?.premises_data?.segmento || '';
    return segment.toLowerCase() || 'default';
}

function CompetitorRow({ bench, index }: { bench: any; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-t border-zinc-100/60">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors text-left">
                <span className="text-xxs text-zinc-300 font-mono font-bold w-6 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-mini font-bold text-zinc-900 truncate">{bench.company_name}</p>
                    {bench.domain && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-tiny text-zinc-400 truncate">{bench.domain}</span>
                            <a 
                                href={bench.domain.startsWith('http') ? bench.domain : `https://${bench.domain}`} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-zinc-300 hover:text-zinc-400 transition-colors p-0.5"
                                title="Abrir site do concorrente"
                            >
                                <ExternalLink size={11} strokeWidth={2.5} />
                            </a>
                        </div>
                    )}
                </div>
                <div className="hidden md:flex items-center gap-5 shrink-0 text-tiny">
                    <span className="w-20 text-center font-mono text-zinc-500">{bench.monthly_traffic || '-'}</span>
                    <span className="w-8 text-center font-bold text-zinc-600">{bench.domain_authority || '-'}</span>
                    <span className="w-16 text-center font-mono text-zinc-500">{bench.avg_cpc || '-'}</span>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-10 pb-4 pt-1 bg-zinc-50/50">
                    <div className="grid md:grid-cols-2 gap-6 mt-2">
                        {bench.strengths && (
                            <div><p className="text-2xs text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Pontos Fortes</p><p className="text-xs text-zinc-600 leading-[1.6]">{bench.strengths}</p></div>
                        )}
                        {bench.weaknesses && (
                            <div><p className="text-2xs text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Pontos Fracos</p><p className="text-xs text-zinc-600 leading-[1.6]">{bench.weaknesses}</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BenchmarkSection({ plan }: { plan: any }) {
    // ── Primary source: enriched_analysis (from Deep Intelligence) ─────────
    const enriched = (plan.diagnostic_data as any)?.enriched_analysis || {};
    const enrichedMarket   = enriched.market   || {};
    const enrichedBenchmark = enriched.benchmark || {};

    // ── Legacy fallback: persona_data (from initial REI generation) ─────────
    const personaData = plan.persona_data || {};

    const segKey = getSegmentKey(plan);
    const mock = mockDataMap[segKey] || mockDataMap.default;

    // Competitors: enriched market > persona_data > mock
    const enrichedCompetitors = (enrichedMarket.concorrentes_benchmark || []).map((c: any) => ({
        company_name: c.nome || c.company_name || 'Concorrente',
        domain: c.url || c.domain || '',
        monthly_traffic: c.monthly_traffic || '-',
        domain_authority: c.domain_authority || 0,
        avg_cpc: c.avg_cpc || '-',
        top_keywords: c.top_keywords || [],
        strengths: c.pontos_fortes || c.strengths || '',
        weaknesses: c.pontos_fracos || c.weaknesses || '',
    }));
    const competitors = enrichedCompetitors.length > 0
        ? enrichedCompetitors
        : (Array.isArray(personaData.competitor_benchmarks) && personaData.competitor_benchmarks.length > 0
            ? personaData.competitor_benchmarks
            : []);

    // Trends: enriched market > persona_data > mock
    const enrichedTrends = (enrichedMarket.tendencias_2025 || []).map((t: any) =>
        typeof t === 'string' ? t : `${t.titulo || ''}: ${t.descricao || t.impacto || ''}`
    );
    const trends = enrichedTrends.length > 0
        ? enrichedTrends
        : (Array.isArray(personaData.industry_trends) && personaData.industry_trends.length > 0
            ? personaData.industry_trends
            : []);

    const marketSizing = enrichedMarket.tam_sam_som?.tam
        ? enrichedMarket.tam_sam_som
        : (personaData.market_sizing?.tam ? personaData.market_sizing : null);

    // Benchmark metrics: enriched benchmark > persona_data > empty string
    const cacBenchmark = enrichedBenchmark.cac_medio || personaData.avg_cac_benchmark || '';
    const conversionBenchmarks = (() => {
        if (enrichedBenchmark.taxa_conversao || enrichedBenchmark.ciclo_vendas) {
            const parts = [];
            if (enrichedBenchmark.taxa_conversao) parts.push(`Conversão: ${enrichedBenchmark.taxa_conversao}`);
            if (enrichedBenchmark.ciclo_vendas) parts.push(`Ciclo Médio: ${enrichedBenchmark.ciclo_vendas}`);
            if (enrichedBenchmark.ltv_cac_ratio) parts.push(`LTV:CAC: ${enrichedBenchmark.ltv_cac_ratio}`);
            return parts.join(' | ');
        }
        return personaData.conversion_benchmarks || '';
    })();

    const swotOpportunities = enrichedMarket.analise_swot_rapida?.oportunidades || [];
    const advice = enrichedBenchmark.comparativo_mercado
        || (swotOpportunities.length > 0 ? `Oportunidades: ${swotOpportunities.join('; ')}.` : '')
        || personaData.strategic_advice || '';

    // Differentiators: SWOT opportunities > persona_data key_differentiators > empty array
    const differentiators = swotOpportunities.length > 0
        ? swotOpportunities
        : (Array.isArray(personaData.key_differentiators) && personaData.key_differentiators.length > 0
            ? personaData.key_differentiators
            : []);

    const hasRealData = enrichedCompetitors.length > 0 || (Array.isArray(personaData.competitor_benchmarks) && personaData.competitor_benchmarks.length > 0);
    const isDeepData = enrichedCompetitors.length > 0;
    const isREIFallback = !isDeepData && personaData._data_source === 'rei_fallback';


    return (
        <div className="flex flex-col h-full bg-white overflow-hidden w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-6 pb-2">
                <SectionHeader
                    eyebrow="Inteligência de Mercado"
                    titleLine1="Benchmark"
                    titleLine2="Competitivo"
                    description="Tráfego, métricas e análises de concorrentes para referência."
                />
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-14 pb-14 w-full bg-white max-w-[1400px] mx-auto">
                <div className="space-y-8 mt-2">
                    
                    {/* Headers Info */}
                    <div className="space-y-1">
                        {!hasRealData && (
                            <p className="text-xxs text-zinc-400 uppercase tracking-widest font-bold">
                                / Dados de referência (Mock) - Atualize via "Gerar Inteligência de Mercado"
                            </p>
                        )}
                        {hasRealData && isREIFallback && (
                            <p className="text-xxs text-zinc-400 uppercase tracking-widest font-bold">
                                / Concorrentes do cliente - Enriquecimento profundo disponível na IA
                            </p>
                        )}
                    </div>

                    {/* Key Metrics - 4-column grid optimized for text */}
                    {(cacBenchmark || conversionBenchmarks) && (() => {
                        const parts = conversionBenchmarks ? conversionBenchmarks.split('|').map((s: string) => s.trim()) : [];
                        const conv = parts.find((p: string) => p.toLowerCase().includes('convers')) || parts[0] || '';
                        const ciclo = parts.find((p: string) => p.toLowerCase().includes('ciclo')) || parts[1] || '';
                        const ltvcac = parts.find((p: string) => p.toLowerCase().includes('ltv')) || parts[2] || '';

                        const parseMetric = (str: string) => {
                            const [label, ...rest] = str.split(':');
                            return { label: label?.trim() || '', value: rest.join(':').trim() };
                        };

                        const convParsed = parseMetric(conv);
                        const cicloParsed = parseMetric(ciclo);
                        const ltvParsed = parseMetric(ltvcac);

                        const metrics = [
                            { label: 'CAC Médio', value: cacBenchmark, accent: '#00CC6A', icon: <Target className="w-3.5 h-3.5" />, dark: true },
                            { label: convParsed.label || 'Conversão', value: convParsed.value || conv, accent: '#71717a', icon: <PieChart className="w-3.5 h-3.5" />, dark: false },
                            { label: cicloParsed.label || 'Ciclo Médio', value: cicloParsed.value || ciclo, accent: '#52525b', icon: <TrendingUp className="w-3.5 h-3.5" />, dark: false },
                            { label: ltvParsed.label || 'LTV:CAC', value: ltvParsed.value || ltvcac, accent: '#3f3f46', icon: <BarChart3 className="w-3.5 h-3.5" />, dark: false },
                        ].filter(m => m.value);

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                {metrics.map((m, i) => (
                                    <div key={i} className={`p-5 border ${m.dark ? 'bg-[#0A0A0A] border-zinc-900 text-white' : 'border-zinc-200/60 bg-white'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div style={{ color: m.accent }}>{m.icon}</div>
                                            <p className={`text-xxs uppercase tracking-[0.2em] font-bold ${m.dark ? 'text-white/60' : 'text-zinc-500'}`}>{m.label}</p>
                                        </div>
                                        <div className={`text-mini leading-[1.6] font-medium ${m.dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                            {m.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Competitors Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Concorrentes Analisados
                            </h3>
                            <span className="text-xxs text-zinc-400 font-mono font-bold">{competitors.length} EMPRESAS</span>
                        </div>
                        
                        <div className="border border-zinc-200/60 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-4 bg-[#0A0A0A] px-4 py-2.5">
                                <div className="w-6 shrink-0" />
                                <div className="flex-1 text-xxs text-zinc-300 uppercase tracking-widest font-bold">Empresa / Concorrente</div>
                                <div className="hidden md:flex items-center gap-5 shrink-0 text-xxs text-zinc-400 uppercase tracking-widest font-bold">
                                    <span className="w-20 text-center">Visitas/mês</span>
                                    <span className="w-8 text-center">DA</span>
                                    <span className="w-16 text-center">CPC</span>
                                </div>
                                <div className="w-4 shrink-0" />
                            </div>
                            {competitors.map((bench: any, i: number) => (
                                <CompetitorRow key={i} bench={bench} index={i} />
                            ))}
                        </div>
                    </div>

                    {/* Trends */}
                    {trends.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-zinc-700" />
                                <h3 className="text-sm font-black text-zinc-900">Tendências do Segmento</h3>
                            </div>
                            <div className={`grid gap-3 ${trends.length % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                                {trends.map((trend: string, i: number) => (
                                    <div key={i} className="border border-zinc-200/60 p-4 bg-zinc-50/50">
                                        <div className="text-xxs text-zinc-400 font-mono font-bold mb-2">{String(i + 1).padStart(2, '0')}</div>
                                        <EditableField
                                            path={`persona_data.industry_trends.${i}`}
                                            className="text-mini text-zinc-700 leading-relaxed font-medium"
                                            placeholder={trend}
                                            multiline
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strategic Advice */}
                    {advice && (
                        <div className="bg-[#00CC6A]/10 border border-[#00CC6A]/20 p-5 ">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-[#00CC6A]" />
                                <p className="text-xxs text-[#00CC6A] uppercase tracking-[0.2em] font-bold">Conselho Estratégico</p>
                            </div>
                            <EditableField
                                path="persona_data.strategic_advice"
                                className="text-sm text-zinc-800 leading-[1.6] font-medium"
                                placeholder={advice}
                                multiline
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
