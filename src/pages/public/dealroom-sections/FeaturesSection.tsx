import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Layers, Bot, MessageSquareText, ShieldAlert, Sparkles, Zap } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
    'Layers': <Layers className="w-6 h-6 text-white" />,
    'Bot': <Bot className="w-6 h-6 text-white" />,
    'MessageSquareText': <MessageSquareText className="w-6 h-6 text-white" />,
    'Sparkles': <Sparkles className="w-6 h-6 text-white" />,
    'Zap': <Zap className="w-6 h-6 text-white" />
};

export default function FeaturesSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    // Fallback exactly like VoaHealth structure if not injected
    const defaultFeatures = [
        { title: 'VENDAS E RELACIONAMENTO', description: 'Funis de funificação de vendas, rastreamento contínuo das ações dos leads, gestão de chamadas e histórico completo por cliente. Muito superior nativamente que Pipedrive ou RD CRM.', icon: 'Layers' },
        { title: 'AUTOMAÇÃO COM AGENTES', description: 'Atendimento e qualificação nativa através de fluxos (workflows) e chatbots nativos nos principais canais. O Robô que vende enquanto o vendedor dorme.', icon: 'Bot' },
        { title: 'COMUNICAÇÃO OMNICHANNEL', description: 'WhatsApp API oficial (Infobip), Instagram DM, Facebook Messenger e SMS. Caixa de entrada coletiva que concentra as conversões num único painel e evita a fragmentação celular.', icon: 'MessageSquareText' }
    ];

    const features = liveData.features || defaultFeatures;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-black p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] pointer-events-none" />
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#00CC6A]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="text-xs uppercase tracking-widest text-[#00CC6A] font-black mb-4 block">A SOLUÇÃO</span>
                    <h2 className="text-4xl md:text-[3.25rem] font-black tracking-tight leading-[1.05] text-white mb-6 relative z-10">
                        <EditableField path="crm_data.live_proposal.features_headline" placeholder="Tudo que a operação precisa. Em um único lugar." />
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium mt-6 relative z-10">
                        <EditableField path="crm_data.live_proposal.features_subheadline" multiline placeholder="Apoiada por um ecossistema nativo de hiper-automação, blindando o pipeline de conversões e reduzindo o tempo operacional." />
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {features.map((feature: any, i: number) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 p-10 lg:p-12 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 border border-zinc-700/50 group-hover:border-[#00CC6A]/50 transition-colors">
                                {ICON_MAP[feature.icon] || <Zap className="w-6 h-6 text-white" />}
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                                <EditableField path={`crm_data.live_proposal.features.${i}.title`} placeholder="NOME DO MÓDULO" />
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                <EditableField path={`crm_data.live_proposal.features.${i}.description`} multiline placeholder="Explicação resumida abordando por que isso destrói a ineficiência do processo atual." />
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
