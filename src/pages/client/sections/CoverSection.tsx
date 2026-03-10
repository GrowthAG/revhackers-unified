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
    const pt = plan?.project_type || plan?.diagnostic_data?.submission_type || plan?.diagnostic_data?.enriched_analysis?.submission_type || 'full';
    let typeLabel = 'REI';
    if (pt === 'crm_ops' || pt === 'CRM_CS_OPS') typeLabel = 'CRM & RevOps';
    else if (pt === 'funnels_impl' || pt === 'site') typeLabel = 'Site';
    else if (pt === 'founder') typeLabel = 'Founder';
    else if (pt === 'content_seo') typeLabel = 'SEO';
    else if (pt === 'consulting' || pt === 'full') typeLabel = 'REI';

    const eyebrow = `Protocolo ${typeLabel}`;
    const fullTitle = `Protocolo ${typeLabel}`;
    const methodology = 'Revenue Engine Intelligence™';

    return (
        <div className="relative flex flex-col h-full bg-zinc-950">
            <div className="relative z-10 flex flex-col h-full p-10 md:p-16 lg:p-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className="h-8 md:h-10 w-auto brightness-0 invert opacity-80"
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

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-[2px] bg-white/20" />
                        <EditableField
                            path="cover_data.eyebrow"
                            className="text-xs text-zinc-500 font-black uppercase tracking-widest"
                            placeholder={eyebrow}
                        />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-10 max-w-4xl">
                        <span className="text-white">Planejamento</span><br />
                        <span className="text-[#00CC6A]">Estratégico</span> <span className="text-white">{typeLabel}</span>
                    </h1>

                    <div className="w-[2px] h-10 bg-zinc-800 mb-8 ml-1" />

                    <div className="space-y-1">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                            Preparado exclusivamente para
                        </p>
                        <EditableField
                            path="cover_data.company_override"
                            className="text-white text-3xl md:text-4xl font-black tracking-tight"
                            placeholder={companyName}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between pt-8 border-t border-zinc-800">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Data</p>
                        <p className="text-xs text-zinc-400 font-bold">{formattedDate}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Metodologia</p>
                        <p className="text-xs text-zinc-400 font-bold">{methodology}</p>
                    </div>
                </div>

                <div className="flex gap-1 mt-6">
                    <div className="h-[3px] flex-1 bg-zinc-800 rounded-full" />
                    <div className="h-[3px] flex-1 bg-zinc-900 rounded-full" />
                    <div className="h-[3px] w-24 bg-white/20 rounded-full" />
                </div>
            </div>
        </div>
    );
}
