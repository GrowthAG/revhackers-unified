import React from 'react';
import { TrendingUp } from 'lucide-react';

interface MethodologySectionProps {
    plan: any;
}

export default function MethodologySection({ plan }: MethodologySectionProps) {
    const methodology = plan.methodology_data || {};
    const steps = methodology.steps || [
        { name: "Canais Certos", description: "Foco em Meta Ads (Instagram/Facebook), combinando segmentação local e criativos adaptados à linguagem emocional da persona." },
        { name: "Comunicação Realista", description: "Narrativas simples e diretas, com foco em histórias reais de superação — sem promessas vagas e com clareza sobre o que é e o que não é bolsa." },
        { name: "Acompanhamento Ativo", description: "Nutrição contínua via CRM e SDR, reforçando acolhimento, esclarecendo dúvidas e construindo confiança até a matrícula." }
    ];

    return (
        <div className="py-20 space-y-24">
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-12 text-left">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase mb-4">
                    Nossa Metodologia
                </h2>
                <p className="text-xl text-zinc-500 font-light max-w-3xl">
                    Um framework testado e validado para escala previsível de operações de vendas.
                </p>
            </div>

            {/* Steps Timeline Style */}
            <div className="max-w-5xl space-y-0">
                {steps.map((step: any, index: number) => (
                    <div key={index} className="group relative flex gap-12 pb-20 last:pb-0">
                        {/* Timeline Logic */}
                        <div className="flex flex-col items-center flex-shrink-0 relative">
                            <div className="w-12 h-12 rounded-full border border-zinc-200 bg-white text-black flex items-center justify-center text-lg font-black z-10 shadow-sm group-hover:bg-revgreen group-hover:border-revgreen transition-all duration-500 group-hover:text-black">
                                {index + 1}
                            </div>
                            {index < steps.length - 1 && (
                                <div className="absolute top-12 bottom-0 w-[1px] bg-zinc-100 group-hover:bg-revgreen/20 transition-colors"></div>
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-4 pt-1">
                            <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none group-hover:text-revgreen transition-colors duration-500">
                                {step.name}
                            </h3>
                            <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Engine Stats Grid */}
            <div className="pt-20">
                <div className="bg-white border border-zinc-100 rounded-[3rem] p-12 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-12">
                        <div className="text-center md:text-left">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] block mb-2">Alocação de Esforço</span>
                            <h4 className="text-3xl font-black text-black uppercase tracking-tighter">Engenharia de Budget & Canais</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                            {[
                                { pct: "40%", label: "Demand Capture" },
                                { pct: "25%", label: "Creative Ops" },
                                { pct: "15%", label: "Funnel Tech" },
                                { pct: "15%", label: "Paid Media" },
                                { pct: "5%", label: "PR/Social" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4 p-8 bg-zinc-50 border border-zinc-100 rounded-3xl group hover:border-revgreen/50 transition-all">
                                    <div className="text-3xl font-black text-zinc-900 group-hover:text-revgreen transition-colors">{stat.pct}</div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                                    <div className="h-1 bg-zinc-200 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-revgreen" style={{ width: stat.pct }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
