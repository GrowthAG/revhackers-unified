import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Badge } from '@/components/ui/badge';

interface CoverSectionProps {
    proposal: any;
}

export default function CoverSection({ proposal }: CoverSectionProps) {
    const activeCompanyName = proposal?.client_name || 'Cliente';

    return (
        <section className="w-full min-h-[100dvh] bg-[#09090b] text-white p-8 lg:p-16 pb-[120px] lg:pb-[120px] relative flex flex-col justify-around overflow-hidden">
            
            {/* Minimalist Grid Lines */}
            <div className="absolute top-0 left-0 lg:left-16 w-[1px] h-full bg-zinc-900 hidden lg:block" />
            <div className="absolute top-0 right-0 lg:right-16 w-[1px] h-full bg-zinc-900 hidden lg:block" />

            <div className="w-full max-w-5xl mx-auto z-10 flex flex-col pt-12">
                
                {/* Header Tag */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="w-8 h-[1px] bg-[#00CC6A]" />
                    <span className="text-xs font-black text-[#00CC6A] uppercase tracking-[0.25em]">
                        Proposta Estratégica
                    </span>
                </div>
                
                {/* Scaled-down Typography for Consulting Standard */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-8 max-w-5xl">
                    Proposta de Implementação <br/>
                    <span className="text-[#00CC6A]">RevHackers</span> <span>X</span> <span className="text-[#00CC6A]">{activeCompanyName}</span>
                </h1>
                
                <p className="text-zinc-400 text-lg lg:text-xl leading-relaxed max-w-2xl font-light mb-16 border-l-2 border-zinc-800 pl-6">
                    Mapeamento e arquitetura de negócios desenvolvida para <strong className="text-white font-bold">{activeCompanyName}</strong>.
                </p>

            </div>

            {/* Footer Meta Grid safely positioned */}
            <div className="w-full max-w-5xl mx-auto z-10 mt-auto pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-zinc-900 pt-10 text-left w-full">
                    <div>
                        <span className="block text-xs font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">Preparado Por</span>
                        <span className="text-sm font-medium text-zinc-300">RevHackers</span>
                    </div>
                    {proposal?.client_contact_name && (
                        <div>
                            <span className="block text-xs font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">Apresentado a</span>
                            <span className="text-sm font-medium text-zinc-300">{proposal.client_contact_name}</span>
                        </div>
                    )}
                    <div>
                        <span className="block text-xs font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">Confidencialidade</span>
                        <span className="text-sm font-medium text-zinc-300">Apenas Diretoria</span>
                    </div>
                    <div>
                        <span className="block text-xs font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">Documento</span>
                        <span className="text-sm font-mono text-zinc-300">V.10 • Oficial</span>
                    </div>
                </div>
            </div>

        </section>
    );
}
