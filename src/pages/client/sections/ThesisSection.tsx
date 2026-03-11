import React from 'react';
import { Target, Zap, Rocket } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

interface ThesisSectionProps {
    plan: any;
}

export default function ThesisSection({ plan }: ThesisSectionProps) {
    const typeLabel = plan?.rei_projects?.type === 'crm_ops' ? 'Máquina de Vendas' : 'Growth & Escala';
    
    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full text-foreground">
            {/* Header */}
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Tese Estratégica"
                    titleLine1="A Ponte"
                    titleLine2="De Crescimento"
                    description={`Nossa tese central de como transformar os desafios diagnosticados em alavancas de ${typeLabel}.`}
                />
            </div>

            {/* Content */}
            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-6 w-full flex flex-col items-center justify-center">
                <div className="max-w-5xl w-full">
                    {/* Grande Declaração da Tese */}
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <span className="text-4xl text-zinc-300 font-serif leading-none block mb-4">"</span>
                        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                            Para escalar suas vendas sem perder margem, precisamos parar de apagar incêndios e começar a construir <span className="text-[#00CC6A]">Infraestrutura de Máquina</span>.
                        </h2>
                        <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full" />
                    </div>

                    {/* Os 3 Pilares da Solução */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mt-20">
                        {/* Pilar 1 */}
                        <div className="relative group">
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-5 h-5 text-zinc-900" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-4">Processos Claros</h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                                Organizar o caos. Centralizar dados, definir fases óbvias e acabar com a dependência de planilhas isoladas que atrasam a operação e perdem oportunidades reais.
                            </p>
                        </div>
                        
                        {/* Pilar 2 */}
                        <div className="relative group">
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-5 h-5 text-zinc-900" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-4">Automação de Pico</h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                                Substituir trabalho braçal por automações invisíveis. Notificações, Follow-ups e transições de fase devem ocorrer sem erro humano, liberando o time para fechar negócios.
                            </p>
                        </div>

                        {/* Pilar 3 */}
                        <div className="relative group">
                            <div className="w-12 h-12 bg-zinc-50 border border-[#00CC6A]/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,204,106,0.1)]">
                                <Rocket className="w-5 h-5 text-[#00CC6A]" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-4">Métricas & Governança</h3>
                            <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                                Decidir com base em números confiáveis. Implementar dashboards que mostram não só o quanto faturou, mas ONDE o funil está vazando dinheiro e CUSTO de aquisição por etapa.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
