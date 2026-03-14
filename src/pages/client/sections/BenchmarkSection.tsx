import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, ChevronRight, ChevronDown, ExternalLink, Lightbulb, PieChart } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Mock data for segments ────────────────────────────────────────────────
const mockDataMap: Record<string, any> = {
    default: {
        competitor_benchmarks: [
            { company_name: 'Concorrente A', domain: 'concorrente-a.com.br', monthly_traffic: '45K', domain_authority: 38, avg_cpc: 'R$ 2,50', top_keywords: ['growth marketing', 'consultoria digital'], strengths: 'SEO forte e presença orgânica consolidada', weaknesses: 'Sem automação de vendas e CRM fragmentado' },
            { company_name: 'Concorrente B', domain: 'concorrente-b.com.br', monthly_traffic: '28K', domain_authority: 32, avg_cpc: 'R$ 3,20', top_keywords: ['marketing b2b', 'geração de leads'], strengths: 'Mídia paga agressiva e branding forte', weaknesses: 'Alto CAC e baixa retenção de clientes' },
            { company_name: 'Concorrente C', domain: 'concorrente-c.com.br', monthly_traffic: '18K', domain_authority: 25, avg_cpc: 'R$ 1,80', top_keywords: ['automação marketing', 'inbound marketing'], strengths: 'Conteúdo educativo e comunidade ativa', weaknesses: 'Processo comercial manual e lento' },
        ],
        industry_trends: [
            'Empresas B2B que investem em Revenue Operations crescem 19% mais rápido que a média do setor',
            'A personalização baseada em IA aumenta taxas de conversão em até 35% no pipeline de vendas',
            'Estratégias de Account-Based Marketing (ABM) dominam empresas com ticket médio acima de R$ 10K',
        ],
        market_sizing: { tam: 'R$ 4,2 bilhões em serviços de growth e performance marketing no Brasil', sam: 'R$ 1,8 bilhão em empresas B2B com faturamento entre R$ 5M–50M/ano', som: 'R$ 120 milhões alcançáveis nos próximos 18 meses via estratégia digital integrada' },
        strategic_advice: 'O segmento apresenta alta fragmentação com poucos players oferecendo stack completo de Revenue Operations. A oportunidade está em integrar geração de demanda, automação e CRM em uma experiência unificada.',
        avg_cac_benchmark: 'R$ 800–2.500 por cliente no segmento',
        conversion_benchmarks: 'Lead→SQL: 12–18% | SQL→Fechamento: 18–25% | Ciclo médio: 21–45 dias',
        key_differentiators: [
            'Integrar CRM, automação e mídia em um único stack gerenciado',
            'Focar em payback rápido (< 90 dias) como argumento de venda',
            'Oferecer transparência total com dashboards em tempo real para o cliente',
        ],
    },
};

function getSegmentKey(plan: any) {
    const segment = plan?.diagnostic_data?.context_mirror?.segmento || plan?.diagnostic_data?.context_mirror?.segment || plan?.premises_data?.segmento || '';
    return segment.toLowerCase() || 'default';
}

function CompetitorRow({ bench, index }: { bench: any; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-t border-zinc-100">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors text-left">
                <span className="text-xs text-zinc-300 font-mono w-9 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{bench.company_name}</p>
                    {bench.domain && <p className="text-xs text-zinc-400 truncate">{bench.domain}</p>}
                </div>
                <div className="hidden md:flex items-center gap-5 shrink-0 text-xs">
                    <span className="w-20 text-center font-mono text-zinc-600">{bench.monthly_traffic || '—'}</span>
                    <span className="w-8 text-center font-bold text-zinc-700">{bench.domain_authority || '—'}</span>
                    <span className="w-14 text-center font-mono text-zinc-600">{bench.avg_cpc || '—'}</span>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-5 pt-0 bg-zinc-50 border-t border-zinc-100">
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                        {bench.strengths && (
                            <div><p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Pontos Fortes</p><p className="text-xs text-zinc-600 leading-relaxed">{bench.strengths}</p></div>
                        )}
                        {bench.weaknesses && (
                            <div><p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Pontos Fracos</p><p className="text-xs text-zinc-600 leading-relaxed">{bench.weaknesses}</p></div>
                        )}
                    </div>
                    {bench.top_keywords && bench.top_keywords.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Keywords Principais</p>
                            <div className="flex flex-wrap gap-1.5">
                                {bench.top_keywords.map((kw: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-zinc-200 text-zinc-600 font-mono">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function BenchmarkSection({ plan }: { plan: any }) {
    const data = plan.persona_data || plan.market_intelligence || {};
    const segKey = getSegmentKey(plan);
    const mock = mockDataMap[segKey] || mockDataMap.default;

    const competitors = (Array.isArray(data.competitor_benchmarks) && data.competitor_benchmarks.length > 0) ? data.competitor_benchmarks : (mock?.competitor_benchmarks || []);
    const trends = (Array.isArray(data.industry_trends) && data.industry_trends.length > 0) ? data.industry_trends : (mock?.industry_trends || []);
    const marketSizing = data.market_sizing?.tam ? data.market_sizing : (mock?.market_sizing || null);
    const advice = data.strategic_advice || mock?.strategic_advice || '';
    const cacBenchmark = data.avg_cac_benchmark || mock?.avg_cac_benchmark || '';
    const conversionBenchmarks = data.conversion_benchmarks || mock?.conversion_benchmarks || '';
    const differentiators = (Array.isArray(data.key_differentiators) && data.key_differentiators.length > 0) ? data.key_differentiators : (mock?.key_differentiators || []);
    const hasRealData = Array.isArray(data.competitor_benchmarks) && data.competitor_benchmarks.length > 0;
    const isREIFallback = data._data_source === 'rei_fallback';

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Inteligência de Mercado"
                    titleLine1="Benchmark"
                    titleLine2="Competitivo"
                    description="Tráfego, palavras-chave, canais de mídia e pontos fracos dos concorrentes, com links diretos para ver os anúncios ativos em Meta, Google e LinkedIn."
                />
            </div>

            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full bg-white space-y-14">
                <div className="space-y-2 -mt-6">
                    {!hasRealData && (
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-300 shrink-0 text-sm">/</span>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Dados de referência para o segmento — atualizados com IA ao clicar em "Gerar Inteligência de Mercado"</p>
                        </div>
                    )}
                    {hasRealData && isREIFallback && (
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-300 shrink-0 text-sm">/</span>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Concorrentes informados pelo cliente — enriquecimento de mercado disponível via "Deep Benchmark"</p>
                        </div>
                    )}
                </div>

                {/* Trends */}
                {trends.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4 text-zinc-700" />
                            <h3 className="text-lg font-bold text-black">Tendências do Segmento</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {trends.map((trend: string, i: number) => (
                                <div key={i} className="border border-zinc-200 p-5 rounded-xl">
                                    <div className="text-xs text-zinc-400 font-mono mb-3">{String(i + 1).padStart(2, '0')}</div>
                                    <p className="text-sm text-zinc-800 leading-relaxed font-medium">{trend}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CAC & Conversion */}
                <div className="grid md:grid-cols-2 gap-4">
                    {cacBenchmark && (
                        <div className="bg-zinc-950 p-7 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-3.5 h-3.5 text-[#00CC6A]" />
                                <p className="text-xs text-[#00CC6A]/70 uppercase tracking-[0.2em] font-semibold">Benchmark CAC do Segmento</p>
                            </div>
                            <p className="text-2xl font-bold text-white leading-tight">{cacBenchmark}</p>
                        </div>
                    )}
                    {conversionBenchmarks && (
                        <div className="border border-zinc-200 p-7 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <PieChart className="w-3.5 h-3.5 text-zinc-400" />
                                <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">Benchmarks de Conversão</p>
                            </div>
                            <p className="text-sm font-semibold text-zinc-800 leading-relaxed">{conversionBenchmarks}</p>
                        </div>
                    )}
                </div>

                {/* Competitors Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-black" />
                            <h3 className="text-xl font-bold text-black">Concorrentes Analisados</h3>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">{competitors.length} empresas</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-5">Clique em cada empresa para expandir métricas completas + links para ver anúncios ativos.</p>
                    <div className="border border-zinc-200 overflow-hidden rounded-xl">
                        <div className="flex items-center gap-4 bg-zinc-950 px-5 py-3">
                            <div className="w-9 shrink-0" />
                            <div className="flex-1 text-xs text-zinc-500 uppercase tracking-widest font-semibold">Empresa / Concorrente</div>
                            <div className="hidden md:flex items-center gap-5 shrink-0 text-xs text-zinc-600 uppercase tracking-widest font-semibold">
                                <span className="w-20 text-center">Visitas/mês</span>
                                <span className="w-8 text-center">DA</span>
                                <span className="w-14 text-center">CPC Médio</span>
                            </div>
                            <div className="w-4 shrink-0" />
                        </div>
                        {competitors.map((bench: any, i: number) => (
                            <CompetitorRow key={i} bench={bench} index={i} />
                        ))}
                    </div>
                    <p className="text-xs text-zinc-300 mt-2">* Dados estimados via IA e benchmarks de mercado. Valores aproximados para referência estratégica.</p>
                </div>

                {/* Market Sizing */}
                {marketSizing && (
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <PieChart className="w-4 h-4 text-zinc-700" />
                            <h3 className="text-lg font-bold text-black">Tamanho de Mercado</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { label: 'TAM', subtitle: 'Mercado Total Disponível', value: marketSizing.tam, hint: 'Tamanho total do mercado endereçável' },
                                { label: 'SAM', subtitle: 'Mercado Endereçável Servível', value: marketSizing.sam, hint: 'Parcela que você pode alcançar hoje' },
                                { label: 'SOM', subtitle: 'Mercado Obtível Realista', value: marketSizing.som, hint: 'Fatia alcançável nos próximos 12 a 18 meses' },
                            ].map(({ label, subtitle, value, hint }) => (
                                <div key={label} className="border border-zinc-200 p-6 rounded-xl">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className="text-2xl font-bold text-black font-mono">{label}</span>
                                            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
                                        </div>
                                        <span className="text-xs text-zinc-300 text-right">{hint}</span>
                                    </div>
                                    <p className="text-sm text-zinc-700 font-medium leading-relaxed">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Strategic Advice */}
                {advice && (
                    <div className="border-l-2 border-zinc-950 pl-6 py-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-zinc-600" />
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Conselho Estratégico</p>
                        </div>
                        <p className="text-base text-zinc-800 leading-relaxed font-medium">{advice}</p>
                    </div>
                )}

                {/* Differentiators */}
                {differentiators.length > 0 && (
                    <div className="bg-zinc-950 p-8 md:p-10 rounded-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <ChevronRight className="w-4 h-4 text-[#00CC6A]" />
                            <h3 className="text-lg font-bold text-white">Suas Oportunidades de Diferenciação</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {differentiators.map((diff: string, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-[#00CC6A] font-mono text-xs mt-1 shrink-0 font-bold">{String(i + 1).padStart(2, '0')}</span>
                                    <p className="text-sm text-white/70 leading-relaxed">{diff}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
