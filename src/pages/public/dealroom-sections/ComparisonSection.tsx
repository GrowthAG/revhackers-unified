import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ComparisonSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    // Fallback identical to VoaHealth comparison Table
    const defaultComparisons = [
        { tool: 'Hubspot / Pipedrive (CRM)', oldCost: 'R$ 600/mês' },
        { tool: 'RD Station / ActiveCampaign', oldCost: 'R$ 450/mês' },
        { tool: 'Manychat (Instagram DM)', oldCost: 'R$ 150/mês' },
        { tool: 'Calendly / Calendário', oldCost: 'R$ 80/mês' },
        { tool: 'Make / Zapier (Integrações)', oldCost: 'R$ 120/mês' }
    ];

    const comparisons = liveData.comparisons || defaultComparisons;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-50 p-8 lg:p-12 pt-20 pb-[200px] lg:pb-[200px] relative">
            <div className="w-full max-w-5xl mx-auto flex flex-col z-10">
                
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs uppercase tracking-widest text-[#00CC6A] font-black mb-4 block">A CONTA NÃO FECHA</span>
                    <h2 className="text-4xl md:text-[3.25rem] font-black tracking-tight leading-[1.05] text-black mb-6 relative">
                        <EditableField path="crm_data.live_proposal.comparison_headline" placeholder="8 Ferramentas. 1 Plataforma. 1 Preço." />
                    </h2>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        <EditableField path="crm_data.live_proposal.comparison_subheadline" multiline placeholder="Mapeamos o custo oculto de stackar dezenas de ferramentas avulsas que não se conversam, contra a inteligência concentrada do ecossistema RevHackers." />
                    </p>
                </div>

                <div className="w-full bg-white border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col lg:flex-row mt-4">
                    
                    {/* LEFTSIDE: The Old Stack */}
                    <div className="flex-1 p-12 lg:p-16 bg-[#F9FAFB] flex flex-col">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-8 border-b border-zinc-200 pb-4 flex items-center justify-between">
                            O Custo Tradicional
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] px-3 py-1 rounded-full font-bold">INEFICIENTE</span>
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            {comparisons.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-4 h-4 text-red-500/50" />
                                        <span className="text-sm font-bold text-zinc-600">
                                            <EditableField path={`crm_data.live_proposal.comparisons.${i}.tool`} placeholder="Nome da Ferramenta" />
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono font-medium text-zinc-400">
                                        <EditableField path={`crm_data.live_proposal.comparisons.${i}.oldCost`} placeholder="R$ 0/mês" />
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-200">
                            <span className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Impacto Financeiro (Oculto)</span>
                            <div className="text-2xl font-black text-red-600 line-through decoration-red-600/30">
                                <EditableField path="crm_data.live_proposal.comparison_old_total" placeholder="> R$ 18.000 / ano" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHTSIDE: RevHackers */}
                    <div className="flex-1 p-12 lg:p-16 bg-black flex flex-col border-l border-zinc-200 lg:border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00CC6A]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4 flex items-center justify-between relative z-10">
                            Ecossistema RevHackers
                            <span className="bg-[#00CC6A] text-black border border-[#00CC6A] text-[10px] px-3 py-1 rounded-full font-black">TUDO INCLUÍDO</span>
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            {comparisons.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-[#00CC6A]" />
                                    <span className="text-sm font-bold text-zinc-300">
                                        <EditableField path={`crm_data.live_proposal.comparisons.${i}.newTool`} placeholder="Hub Integrado Otimizado" />
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-800">
                            <span className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Acesso à Plataforma All-in-One</span>
                            <div className="text-3xl font-black text-[#00CC6A] drop-shadow-[0_0_15px_rgba(0,204,106,0.3)]">
                                Custo Zero
                            </div>
                            <p className="text-xxs text-zinc-500 mt-2 font-light">As licenças são cobertas 100% pelo Setup e Retainer do nosso serviço premium de inteligência. Sem surpresas.</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
