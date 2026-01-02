import React from 'react';

interface CoverSectionProps {
    plan: any;
    client: any;
}

export default function CoverSection({ plan, client }: CoverSectionProps) {
    const createdDate = new Date(plan.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-[600px] flex flex-col items-center justify-center text-center">
            {/* Client Logo */}
            {client.logo_url && (
                <div className="mb-12">
                    <img
                        src={client.logo_url}
                        alt={client.company_name}
                        className="h-24 object-contain mx-auto"
                    />
                </div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Planejamento<br />Estratégico de<br />Crescimento
            </h1>

            {/* Subtitle */}
            <div className="w-20 h-1 bg-black mx-auto mb-6"></div>

            <p className="text-xl text-zinc-600 mb-12 max-w-2xl">
                Roadmap completo de 90 dias para escalar seu crescimento com metodologia comprovada
            </p>

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-zinc-500">
                <p>Apresentado para <span className="font-semibold text-black">{client.company_name}</span></p>
                <p>{createdDate}</p>
                <p className="mt-4 text-xs">Preparado por <span className="font-semibold text-black">RevHackers Growth Hub</span></p>
            </div>

            {/* Decorative Element */}
            <div className="mt-16 grid grid-cols-4 gap-4 max-w-md mx-auto">
                <div className="h-2 bg-zinc-100 rounded-full"></div>
                <div className="h-2 bg-zinc-200 rounded-full"></div>
                <div className="h-2 bg-zinc-300 rounded-full"></div>
                <div className="h-2 bg-black rounded-full"></div>
            </div>
        </div>
    );
}
