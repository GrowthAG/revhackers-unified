import React from 'react';
import { CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';

interface CronogramaPhase {
    period?: string;
    week?: string;
    name?: string;
    title?: string;
    description?: string;
    deliverables?: string[];
    tasks?: string[];
    items?: string[];
    responsible?: string;
    delivery?: string;
}

export default function OnboardingSection({ plan }: { plan: any }) {
    // Unifica dados de onboarding_plan E roadmap_data
    const onboarding = plan?.onboarding_plan || plan?.content?.onboarding || {};
    const roadmap = plan?.roadmap_data || {};

    // Pega phases de ambas as fontes
    const onboardingPhases: CronogramaPhase[] = onboarding?.phases || onboarding?.weeks || [];
    const roadmapPhases: CronogramaPhase[] = roadmap?.phases || [];

    // Usa onboarding como fonte primária, roadmap como fallback
    const phases = onboardingPhases.length > 0 ? onboardingPhases : roadmapPhases;

    return (
        <div className="space-y-16 py-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-8 h-[2px] bg-black" />
                    EXECUÇÃO
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter leading-[0.95]">
                    Cronograma<br />
                    <span className="text-zinc-300">90 Dias</span>
                </h2>
                <p className="text-zinc-500 text-base max-w-2xl">
                    Tabela semanal com ações, responsáveis e entrega por fase — tudo que será executado nos primeiros 90 dias.
                </p>
            </div>

            {/* Tabela de Cronograma */}
            {phases.length > 0 ? (
                <div className="border border-zinc-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="col-span-2 px-6 py-4 border-r border-zinc-800">Período</div>
                        <div className="col-span-6 px-6 py-4 border-r border-zinc-800">Ações</div>
                        <div className="col-span-2 px-6 py-4 border-r border-zinc-800">Responsável</div>
                        <div className="col-span-2 px-6 py-4">Entrega</div>
                    </div>

                    {/* Rows */}
                    {phases.map((phase: CronogramaPhase, i: number) => {
                        const items = phase.deliverables || phase.tasks || phase.items || [];
                        const period = phase.period || phase.week || phase.name || `Fase ${i + 1}`;
                        const title = phase.title || phase.name || '';

                        return (
                            <div
                                key={i}
                                className={`grid grid-cols-12 border-t border-zinc-100 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'} hover:bg-zinc-50 transition-colors`}
                            >
                                {/* Período */}
                                <div className="col-span-2 px-6 py-5 border-r border-zinc-100">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                                        {period}
                                    </p>
                                    {title && title !== period && (
                                        <p className="text-sm font-bold text-zinc-900">
                                            {title}
                                        </p>
                                    )}
                                </div>

                                {/* Ações */}
                                <div className="col-span-6 px-6 py-5 border-r border-zinc-100">
                                    {phase.description && (
                                        <p className="text-sm text-zinc-500 mb-3 italic">{phase.description}</p>
                                    )}
                                    <ul className="space-y-2">
                                        {items.map((item: string, j: number) => (
                                            <li key={j} className="flex items-start gap-2 text-sm text-zinc-700">
                                                <CheckCircle2 className="w-4 h-4 text-zinc-300 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Responsável */}
                                <div className="col-span-2 px-6 py-5 border-r border-zinc-100 flex items-start">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-zinc-300" />
                                        <span className="text-xs text-zinc-600 font-medium">
                                            {phase.responsible || 'RevHackers'}
                                        </span>
                                    </div>
                                </div>

                                {/* Entrega */}
                                <div className="col-span-2 px-6 py-5 flex items-start">
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        {phase.delivery || (items.length > 0 ? items[items.length - 1] : '—')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 text-zinc-400 border border-zinc-100">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Cronograma será disponibilizado em breve.</p>
                </div>
            )}

            {/* Milestone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { cycle: '01', title: 'Setup & Integração', desc: 'Protocolo de transição, acessos liberados e setup técnico concluído.', weeks: 'Semanas 1-4' },
                    { cycle: '02', title: 'Ativação & Tração', desc: 'Campanhas ativas, CRM implementado e primeiros leads qualificados.', weeks: 'Semanas 5-8' },
                    { cycle: '03', title: 'Escala & Otimização', desc: 'Revisão de ROI, escala de budget e otimização de conversão.', weeks: 'Semanas 9-12' },
                ].map((milestone, i) => (
                    <div key={i} className="p-8 bg-white border border-zinc-100 group hover:border-zinc-300 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl font-black text-zinc-100 group-hover:text-zinc-200 transition-colors">{milestone.cycle}</span>
                            <ArrowRight className="w-4 h-4 text-zinc-200" />
                        </div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">{milestone.weeks}</p>
                        <h4 className="text-base font-bold text-black tracking-tight mb-2">{milestone.title}</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed">{milestone.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
