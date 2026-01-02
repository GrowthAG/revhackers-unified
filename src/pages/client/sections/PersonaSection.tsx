import React from 'react';
import { User, Briefcase, MapPin, GraduationCap, DollarSign } from 'lucide-react';

interface PersonaSectionProps {
    plan: any;
}

export default function PersonaSection({ plan }: PersonaSectionProps) {
    const persona = plan.persona_data || {};

    return (
        <div>
            {/* Section Header */}
            <div className="border-b border-zinc-200 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-black mb-2">
                    👤 Persona & Mercado
                </h2>
                <p className="text-zinc-600">
                    Perfil detalhado do seu cliente ideal e insights de mercado
                </p>
            </div>

            {/* Persona Card */}
            <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-200 rounded-lg p-8 mb-8">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-12 h-12 text-zinc-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-black mb-1">
                            {persona.name || 'Juliana Ferreira'}
                        </h3>
                        <p className="text-zinc-600 mb-4">
                            {persona.age || '32'} anos • {persona.role || 'Auxiliar administrativo'}
                        </p>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-zinc-400" />
                                <div>
                                    <p className="text-xs text-zinc-500">Localização</p>
                                    <p className="text-sm font-medium text-black">
                                        {persona.location || 'São Paulo (Vila Olímpia, Faria Lima)'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-zinc-400" />
                                <div>
                                    <p className="text-xs text-zinc-500">Idade</p>
                                    <p className="text-sm font-medium text-black">
                                        {persona.age_range || '30-42 anos'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-zinc-400" />
                                <div>
                                    <p className="text-xs text-zinc-500">Educação</p>
                                    <p className="text-sm font-medium text-black">
                                        {persona.education || 'Administração, Engenharia, MBA'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-zinc-400" />
                                <div>
                                    <p className="text-xs text-zinc-500">Budget</p>
                                    <p className="text-sm font-medium text-black">
                                        {persona.budget || 'R$1.500-5.000/mês em ferramentas'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pain Points, Triggers, Message, WIIFM */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-red-900 mb-3">😰 Pain (Dor)</h4>
                    <p className="text-sm text-red-800">
                        {persona.pain || 'WhatsApp sem rastreamento. Uso 5 ferramentas. Dados desincronizados. Perco leads porque não sei quem respondeu onde.'}
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-yellow-900 mb-3">⚡ Trigger (Gatilho)</h4>
                    <p className="text-sm text-yellow-800">
                        {persona.trigger || 'Novo hire na equipe de vendas. Churn de cliente grande. Primeira rodada de financiamento. Revisão trimestral de ferramentas.'}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">💬 Mensagem</h4>
                    <p className="text-sm text-blue-800">
                        {persona.message || '"WhatsApp + CRM integrado. Português. Implementação 48h."'}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3">🎁 WIIFM (What\'s In It For Me)</h4>
                    <p className="text-sm text-green-800">
                        {persona.wiifm || 'Economiza 8h/semana. Reduz churn com melhor follow up. Visibilidade total do pipeline. WhatsApp = fonte de verdade.'}
                    </p>
                </div>
            </div>

            {/* Market Insights */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4">📊 Insights de Mercado</h4>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-zinc-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>75.000+ empresas tech no Brasil</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>450+ startups SaaS ativas, crescimento de 45% YoY</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>São Paulo e Rio concentram 60% do mercado tech</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-zinc-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Mercado de CRM + Marketing Automation = R$12B+ TAM</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
