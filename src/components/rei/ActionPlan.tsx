import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ActionPlanProps {
    score: number;
}

export default function ActionPlan({ score }: ActionPlanProps) {
    const navigate = useNavigate();

    const phases = [
        {
            phase: 'FASE 1',
            title: 'Quick Wins',
            duration: '30 dias',
            items: [
                'Otimizar funil de conversão',
                'Implementar email nurturing',
                'Ajustar proposta de valor'
            ],
            roi: '+R$ 85K MRR'
        },
        {
            phase: 'FASE 2',
            title: 'Estruturação',
            duration: '60 dias',
            items: [
                'RevOps Stack completo',
                'Sales Playbook',
                'Automação de processos'
            ],
            roi: '+R$ 175K MRR'
        },
        {
            phase: 'FASE 3',
            title: 'Escala',
            duration: '90 dias',
            items: [
                'PLG Motion',
                'Automação avançada',
                'Expansão de canais'
            ],
            roi: '+R$ 300K MRR'
        }
    ];

    return (
        <div className="bg-zinc-950 border border-zinc-800 p-12">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-revgreen/10 border border-revgreen/30 text-revgreen mb-6">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">
                        SEU PLANO DE AÇÃO PERSONALIZADO
                    </span>
                </div>
                <h2 className="text-3xl font-black text-white mb-4">
                    Roadmap de Implementação
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                    Plano estruturado em 3 fases para maximizar seu ROI e acelerar crescimento de receita
                </p>
            </div>

            {/* Phases */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {phases.map((phase, index) => (
                    <div
                        key={index}
                        className="bg-zinc-900 border border-zinc-800 p-6 hover:border-revgreen/50 transition-all duration-300"
                    >
                        {/* Phase Header */}
                        <div className="mb-6">
                            <div className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">
                                {phase.phase}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">
                                {phase.title}
                            </h3>
                            <div className="text-xs text-zinc-500">
                                {phase.duration}
                            </div>
                        </div>

                        {/* Items */}
                        <ul className="space-y-3 mb-6">
                            {phase.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                                    <span className="text-revgreen mt-1">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        {/* ROI */}
                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-revgreen" />
                                <span className="text-sm font-black text-revgreen">
                                    {phase.roi}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center">
                <Button
                    onClick={() => navigate('/agenda?meeting=planejamento&source=rei-result')}
                    className="bg-revgreen hover:bg-revgreen/90 text-black font-black uppercase tracking-wider px-8 py-6 text-sm"
                >
                    Agendar Reunião de Planejamento Estratégico →
                </Button>
                <p className="text-xs text-zinc-500 mt-4">
                    Vamos alinhar os próximos passos e definir seu roadmap personalizado
                </p>
            </div>
        </div>
    );
}
