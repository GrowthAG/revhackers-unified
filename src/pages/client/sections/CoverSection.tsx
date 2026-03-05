import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';

interface CoverSectionProps {
    plan: any;
    client: any;
}

export default function CoverSection({ plan, client }: CoverSectionProps) {
    const formattedDate = new Date(plan.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const companyName = client?.company || 'Cliente';
    const isFunnels = plan.project_type === 'funnels_impl';

    const eyebrow = isFunnels ? 'Implementação de Plataforma' : 'Estratégia de Crescimento';
    const fullTitle = isFunnels ? 'Plano de Implementação Funnels' : 'Planejamento Estratégico de Crescimento';
    const titleLine1 = isFunnels ? 'Plano de' : 'Planejamento';
    const titleLine2 = isFunnels ? 'Implementação' : 'Estratégico';
    const titleLine3 = isFunnels ? 'da Plataforma' : 'de Crescimento';
    const methodology = isFunnels ? 'Onboarding Orquestrado™' : 'Revenue Engine Intelligence™';

    return (
        <div className="relative flex flex-col h-full bg-zinc-950">
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            {/* Glow effects */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#00FF85] rounded-full opacity-[0.055] blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00CC6A] rounded-full opacity-[0.035] blur-[140px] pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full p-10 md:p-16 lg:p-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className="h-9 md:h-11 w-auto brightness-0 invert"
                    />
                    <span className="text-xs text-zinc-500 uppercase tracking-[0.25em] font-medium">
                        {fullTitle}
                    </span>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col justify-center py-10">
                    {client?.logo_url && (
                        <div className="mb-10">
                            <img
                                src={client.logo_url}
                                alt={companyName}
                                className="h-12 object-contain brightness-0 invert opacity-50"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-px bg-[#00FF85]" />
                        <EditableField
                            path="cover_data.eyebrow"
                            className="text-xs text-[#00FF85] uppercase tracking-[0.25em] font-semibold"
                            placeholder={eyebrow}
                        />
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.0] tracking-tight mb-10 max-w-4xl">
                        {titleLine1}<br />
                        <span className="text-[#00FF85]">{titleLine2}</span><br />
                        {titleLine3}
                    </h1>

                    <div className="w-px h-14 bg-zinc-700 mb-10 ml-1" />

                    <div className="space-y-2">
                        <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] font-medium">
                            Preparado exclusivamente para
                        </p>
                        <EditableField
                            path="cover_data.company_override"
                            className="text-white text-3xl md:text-4xl font-bold tracking-tight"
                            placeholder={companyName}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between pt-8 border-t border-zinc-800">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-600 uppercase tracking-[0.2em]">Data</p>
                        <p className="text-sm text-zinc-400 font-medium">{formattedDate}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-zinc-600 uppercase tracking-[0.2em]">Metodologia</p>
                        <p className="text-sm text-zinc-400 font-medium">{methodology}</p>
                    </div>
                </div>

                <div className="flex gap-1 mt-5">
                    <div className="h-[2px] flex-1 bg-zinc-800 rounded-full" />
                    <div className="h-[2px] flex-1 bg-zinc-700 rounded-full" />
                    <div className="h-[2px] w-20 bg-[#00FF85] rounded-full" />
                </div>
            </div>
        </div>
    );
}
