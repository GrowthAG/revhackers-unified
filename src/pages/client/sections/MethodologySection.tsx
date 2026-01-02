import React from 'react';

interface MethodologySectionProps {
    plan: any;
}

export default function MethodologySection({ plan }: MethodologySectionProps) {
    const methodology = plan.methodology_data || {};
    const steps = methodology.steps || [];

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    🔬 Metodologia
                </h2>
                <p className="text-zinc-600">
                    Nossa abordagem comprovada de Geração de Demanda em 3 passos
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-6 mb-12">
                {steps.map((step: any, index: number) => (
                    <div key={index} className="flex gap-6">
                        {/* Step Number */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                                {index + 1}
                            </div>
                            {index < steps.length - 1 && (
                                <div className="w-0.5 h-full bg-zinc-200 mt-2"></div>
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 pb-6">
                            <h3 className="text-xl font-semibold text-black mb-2">{step.name}</h3>
                            <p className="text-zinc-700">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {steps.length === 0 && (
                <div className="space-y-6 mb-12">
                    <div className="flex gap-6">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                                1
                            </div>
                            <div className="w-0.5 h-full bg-zinc-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                            <h3 className="text-xl font-semibold text-black mb-2">Canais certos</h3>
                            <p className="text-zinc-700">
                                Foco em Meta Ads (Instagram/Facebook), combinando segmentação local e criativos adaptados à linguagem emocional da persona.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                                2
                            </div>
                            <div className="w-0.5 h-full bg-zinc-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                            <h3 className="text-xl font-semibold text-black mb-2">Comunicação realista</h3>
                            <p className="text-zinc-700">
                                Narrativas simples e diretas, com foco em histórias reais de superação — sem promessas vagas e com clareza sobre o que é e o que não é bolsa.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                                3
                            </div>
                        </div>
                        <div className="flex-1 pb-6">
                            <h3 className="text-xl font-semibold text-black mb-2">Acompanhamento ativo</h3>
                            <p className="text-zinc-700">
                                Nutrição contínua via CRM e SDR, reforçando acolhimento, esclarecendo dúvidas e construindo confiança até a matrícula.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Channel Strategy */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4">📢 Estratégia de Canais</h4>
                <div className="grid md:grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-1">40%</div>
                        <p className="text-xs text-zinc-600">LinkedIn Outreach</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-1">25%</div>
                        <p className="text-xs text-zinc-600">Content Brasil</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-1">15%</div>
                        <p className="text-xs text-zinc-600">Email Outreach</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-1">15%</div>
                        <p className="text-xs text-zinc-600">Paid Ads</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-black mb-1">5%</div>
                        <p className="text-xs text-zinc-600">Parcerias</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
