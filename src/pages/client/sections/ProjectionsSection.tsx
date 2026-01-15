import React from 'react';
import { Target, Activity, Settings2, BarChart3, CheckCircle2 } from 'lucide-react';

interface ProjectionsSectionProps {
    plan: any;
}

export default function ProjectionsSection({ plan }: ProjectionsSectionProps) {
    const projections = plan.financial_projections || plan.kpi_projections || {};

    // Projeções focadas em processo e maturidade operacional
    const timeline = projections.timeline || [
        {
            mes: 'Mês 1-3',
            fase: 'Fundação Digital',
            descricao: 'Implementação de stack tecnológica, tracking e primeiras campanhas de validação.',
            metricas: {
                leads: '50-100',
                conversao: '1.5-3%',
                maturidade: 'Setup & Tração'
            }
        },
        {
            mes: 'Mês 4-6',
            fase: 'Otimização Ativa',
            descricao: 'Refinamento de canais, melhoria de copy e expansão da base de dados qualificada.',
            metricas: {
                leads: '100-200',
                conversao: '3-5%',
                maturidade: 'Eficiência Operacional'
            }
        },
        {
            mes: 'Mês 7-9',
            fase: 'Escala Gerenciada',
            descricao: 'Aumento de investimento vertical e diversificação horizontal de canais.',
            metricas: {
                leads: '200-400',
                conversao: '4-6%',
                maturidade: 'Escalabilidade'
            }
        },
        {
            mes: 'Mês 10-12',
            fase: 'Máquina de Vendas',
            descricao: 'Processos maduros, previsibilidade total e foco em LTV e retenção.',
            metricas: {
                leads: '400+',
                conversao: '5-8%',
                maturidade: 'Liderança de Mercado'
            }
        },
    ];

    return (
        <div className="py-20 space-y-32">
            {/* Section Header */}
            <div className="text-center space-y-6">
                <h2 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-[-0.05em] select-none uppercase">
                    Projeções
                </h2>
                <div className="w-40 h-[1px] bg-revgreen mx-auto shadow-[0_0_20px_rgba(3,252,59,0.5)]"></div>
                <p className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.4em]">
                    Operational Growth Forecast
                </p>
            </div>

            {/* Timeline Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {timeline.map((item: any, index: number) => (
                    <div
                        key={index}
                        className={`group relative border rounded-[2.5rem] p-10 transition-all duration-700 hover:scale-[1.02] ${index === timeline.length - 1
                            ? 'bg-zinc-950 border-revgreen/50 shadow-[0_0_50px_rgba(3,252,59,0.1)]'
                            : 'bg-black border-zinc-900 shadow-sm'
                            }`}
                    >
                        {/* Phase Header */}
                        <div className="mb-12 space-y-6">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border ${index === timeline.length - 1 ? 'border-revgreen text-revgreen bg-revgreen/5' : 'border-zinc-800 text-zinc-600'}`}>
                                {item.mes}
                            </span>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                                {item.fase}
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                {item.descricao}
                            </p>
                        </div>

                        {/* KPI Grid */}
                        <div className={`space-y-8 pt-10 border-t ${index === timeline.length - 1 ? 'border-revgreen/20' : 'border-zinc-900'}`}>
                            {/* Leads KPI */}
                            <div className="flex items-center gap-5 group/stat">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${index === timeline.length - 1 ? 'bg-revgreen/10 border-revgreen/30 text-revgreen' : 'bg-zinc-900 border-zinc-800 text-zinc-600 group-hover/stat:text-white'}`}>
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-white leading-none">{item.metricas.leads}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Qualified Leads</p>
                                </div>
                            </div>

                            {/* Conversion KPI */}
                            <div className="flex items-center gap-5 group/stat">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${index === timeline.length - 1 ? 'bg-revgreen/10 border-revgreen/30 text-revgreen' : 'bg-zinc-900 border-zinc-800 text-zinc-600 group-hover/stat:text-white'}`}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-white leading-none">{item.metricas.conversao}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Conv. Target</p>
                                </div>
                            </div>

                            {/* Maturity Level */}
                            <div className="flex items-center gap-5 group/stat">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${index === timeline.length - 1 ? 'bg-revgreen/10 border-revgreen/30 text-revgreen' : 'bg-zinc-900 border-zinc-800 text-zinc-600 group-hover/stat:text-white'}`}>
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">{item.metricas.maturidade}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Operational Level</p>
                                </div>
                            </div>
                        </div>

                        {index === timeline.length - 1 && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <div className="p-1 px-4 rounded-full bg-revgreen text-[9px] font-black text-black tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(3,252,59,0.4)]">
                                    Scale Goal
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Disclaimer & Note */}
            <div className="max-w-7xl mx-auto pt-20 border-t border-zinc-900">
                <div className="bg-zinc-950 border border-zinc-900 p-12 rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-revgreen opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"></div>
                    <div className="flex flex-col md:flex-row items-center gap-12 justify-between relative z-10">
                        <div className="flex items-center gap-10 max-w-2xl">
                            <div className="w-20 h-20 rounded-full bg-black border border-zinc-900 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-10 h-10 text-revgreen" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter">Compromisso de Performance</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                    O faturamento é uma consequência direta da execução rigorosa deste planejamento em conjunto com a operação do cliente. Nossa engenharia garante os processos; o mercado responde à excelência da execução.
                                </p>
                            </div>
                        </div>
                        <div className="bg-black p-8 rounded-3xl border border-zinc-900 flex items-center gap-8 group-hover:border-revgreen/30 transition-all">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Methodology Core</p>
                                <p className="text-sm font-black text-white uppercase tracking-tight">RevHackers Historical Data</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-revgreen" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

