import React from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

export default function OnboardingSection({ plan }: { plan: any }) {
    const onboarding = plan?.onboarding_plan || plan?.content?.onboarding || {};
    const phases = onboarding?.phases || onboarding?.weeks || [];

    return (
        <div className="space-y-12 py-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-[#00CC6A]" />
                    EMBARQUE ESTRUTURADO
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter leading-[0.95]">
                    Primeiros<br />
                    <span className="text-[#00CC6A]">90 Dias</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    O roadmap detalhado das primeiras semanas de implementação, com marcos e entregáveis para cada fase.
                </p>
            </div>

            {/* Timeline */}
            {phases.length > 0 ? (
                <div className="space-y-6">
                    {phases.map((phase: any, i: number) => (
                        <div key={i} className="relative pl-8 pb-8 border-l-2 border-zinc-200 last:border-l-0 last:pb-0">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#00CC6A] border-2 border-white shadow-sm" />
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black text-[#00CC6A] uppercase tracking-widest bg-[#00CC6A]/10 px-3 py-1 rounded-full">
                                        {phase.period || phase.week || `Fase ${i + 1}`}
                                    </span>
                                    <h3 className="font-bold text-zinc-900">{phase.title || phase.name}</h3>
                                </div>
                                {phase.description && (
                                    <p className="text-sm text-zinc-500 mb-4">{phase.description}</p>
                                )}
                                {phase.deliverables && (
                                    <div className="space-y-2">
                                        {(Array.isArray(phase.deliverables) ? phase.deliverables : [phase.deliverables]).map((d: string, j: number) => (
                                            <div key={j} className="flex items-start gap-2 text-sm text-zinc-700">
                                                <CheckCircle2 className="w-4 h-4 text-[#00CC6A] mt-0.5 flex-shrink-0" />
                                                <span>{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {phase.tasks && (
                                    <div className="space-y-2 mt-3">
                                        {phase.tasks.map((t: string, j: number) => (
                                            <div key={j} className="flex items-start gap-2 text-sm text-zinc-700">
                                                <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                <span>{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-zinc-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Plano de onboarding será disponibilizado em breve.</p>
                </div>
            )}
        </div>
    );
}
