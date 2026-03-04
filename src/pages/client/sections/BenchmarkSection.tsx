import React from 'react';
import { TrendingUp, ExternalLink, BarChart2, Target } from 'lucide-react';

export default function BenchmarkSection({ plan }: { plan: any }) {
    const benchmark = plan?.benchmark_data || plan?.content?.benchmark || {};
    const competitors = benchmark?.competitors || [];
    const trends = benchmark?.segment_trends || benchmark?.trends || [];
    const cacBenchmark = benchmark?.cac_benchmark || '';
    const conversionBenchmarks = benchmark?.conversion_benchmarks || '';

    return (
        <div className="space-y-12 py-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-[#00CC6A]" />
                    INTELIGÊNCIA DE MERCADO
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter leading-[0.95]">
                    Benchmark<br />
                    <span className="text-zinc-300">Competitivo</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Tráfego, palavras-chave, canais de mídia e pontos fracos dos concorrentes, com links diretos para ver os anúncios ativos em Meta, Google e LinkedIn.
                </p>
            </div>

            {/* Trends */}
            {trends.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#00CC6A]" />
                        Tendências do Segmento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trends.map((trend: string, i: number) => (
                            <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">0{i + 1}</span>
                                <p className="text-sm text-zinc-700 mt-3 leading-relaxed">{trend}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CAC & Conversion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cacBenchmark && (
                    <div className="bg-[#00CC6A]/5 border border-[#00CC6A]/20 rounded-2xl p-6">
                        <span className="text-[10px] font-black text-[#00CC6A] uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" />
                            Benchmark CAC do Segmento
                        </span>
                        <p className="text-xl font-bold text-zinc-900 mt-3">{cacBenchmark}</p>
                    </div>
                )}
                {conversionBenchmarks && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 className="w-3.5 h-3.5" />
                            Benchmarks de Conversão
                        </span>
                        <p className="text-sm text-zinc-700 mt-3 leading-relaxed">{conversionBenchmarks}</p>
                    </div>
                )}
            </div>

            {/* Competitors */}
            {competitors.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900">Concorrentes Mapeados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {competitors.map((comp: any, i: number) => (
                            <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-zinc-900">{comp.name || comp}</h4>
                                    {comp.url && (
                                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#00CC6A] transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                {comp.strengths && <p className="text-xs text-zinc-500">{comp.strengths}</p>}
                                {comp.weaknesses && <p className="text-xs text-red-400 mt-2">Fraquezas: {comp.weaknesses}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
