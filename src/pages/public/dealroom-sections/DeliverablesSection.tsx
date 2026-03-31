import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Check, Settings, Code, Zap } from 'lucide-react';

export default function DeliverablesSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    const defaultDeliverables = [
        {
            category: 'Setup & Infraestrutura',
            items: [
                'Homologação de Domínio (SPF, DKIM, DMARC)',
                'Aprovação da API Oficial do WhatsApp',
                'Migração Inbound (Histórico Pipedrive/RD)',
                'Configuração de Permissões (Roles) da Equipe'
            ]
        },
        {
            category: 'Máquina B2B (Funnels & IA)',
            items: [
                'Scraping Dinâmico de Autoridade no LinkedIn',
                'Playbooks de Inteligência de Mercado',
                'Chatbots Reativos de Qualificação de Lead',
                'Landing Pages (Materiais Ricos e Captação)'
            ]
        },
        {
            category: 'Pipeline & Relatórios (Zorro CRM)',
            items: [
                'Desenho dos Estágios do Funil Principal',
                'Automações de Follow-up Não Atendido',
                'Dashboards de Métricas Executivas',
                'Monitoramento de Taxas de Conversão'
            ]
        }
    ];

    const deliverables = liveData.deliverables || defaultDeliverables;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-50 p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px] relative overflow-hidden">
            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs uppercase tracking-widest text-[#00CC6A] font-black mb-4 block">SLA & DELIVERABLES</span>
                    <h2 className="text-4xl md:text-[3.25rem] font-black tracking-tight leading-[1.05] text-black mb-6 relative">
                        <EditableField path="crm_data.live_proposal.deliverables_headline" placeholder="O Escopo Técnico da Parceria." />
                    </h2>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        <EditableField path="crm_data.live_proposal.deliverables_subheadline" multiline placeholder="Garantia de previsibilidade. O que a nossa engenharia entrega configurado e finalizado para o seu time decolar." />
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    
                    {/* COL 1 */}
                    <div className="bg-[#F9FAFB] border border-zinc-200 p-12 lg:p-14 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Settings className="w-32 h-32 text-black" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-8 border-b border-zinc-200 pb-4 relative z-10">
                            <EditableField path="crm_data.live_proposal.deliverables.0.category" placeholder="Conteúdo & Geração (LinkedIn)" />
                        </h3>
                        <ul className="space-y-5 relative z-10">
                            {deliverables[0]?.items?.slice(0, 4).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5"><Check className="w-4 h-4 text-[#00CC6A]" /></div>
                                    <span className="text-sm text-zinc-600 font-medium leading-relaxed">
                                        <EditableField path={`crm_data.live_proposal.deliverables.0.items.${i}`} placeholder="Item de Entrega" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COL 2 */}
                    <div className="bg-black border border-zinc-800 p-12 lg:p-14 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] relative overflow-hidden group transform lg:-translate-y-4">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00CC6A]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Code className="w-32 h-32 text-[#00CC6A]" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4 relative z-10">
                            <EditableField path="crm_data.live_proposal.deliverables.1.category" placeholder="Máquina Funnels (Automação)" />
                        </h3>
                        <ul className="space-y-5 relative z-10">
                            {deliverables[1]?.items?.slice(0, 4).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5"><Check className="w-4 h-4 text-[#00CC6A]" /></div>
                                    <span className="text-sm text-zinc-300 font-medium leading-relaxed">
                                        <EditableField path={`crm_data.live_proposal.deliverables.1.items.${i}`} placeholder="Item de Entrega" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COL 3 */}
                    <div className="bg-[#F9FAFB] border border-zinc-200 p-12 lg:p-14 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-black" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-8 border-b border-zinc-200 pb-4 relative z-10">
                            <EditableField path="crm_data.live_proposal.deliverables.2.category" placeholder="Hand-off & Integração Zoho" />
                        </h3>
                        <ul className="space-y-5 relative z-10">
                            {deliverables[2]?.items?.slice(0, 4).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5"><Check className="w-4 h-4 text-[#00CC6A]" /></div>
                                    <span className="text-sm text-zinc-600 font-medium leading-relaxed">
                                        <EditableField path={`crm_data.live_proposal.deliverables.2.items.${i}`} placeholder="Item de Entrega" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
