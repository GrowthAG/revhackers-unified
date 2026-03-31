import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Building2, UserCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function PremisesSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    const defaultPremises = {
        we: [
            'Implementação Técnica do CRM Zorro',
            'Construção dos Fluxos de Automação',
            'Scraping e Qualificação de Contatos B2B',
            'Setup do WhatsApp API',
            'Dashboard Executivo e Dashboards de KPIs'
        ],
        you: [
            'Fornecimento Ágil de Acessos e Logins',
            'SDR Focado no Atendimento dos MQLs',
            'Gravação de Vídeos com nossa Pauta (TL;DV)',
            'Pagamento Pontual das Faturas Mensais'
        ]
    };

    const premises = liveData.premises || defaultPremises;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-50 p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px] relative overflow-hidden">
            
            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">PREMISSAS DE SUCESSO</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-black tracking-tighter mb-6 relative">
                        <EditableField path="crm_data.live_proposal.premises_headline" placeholder="O Nosso Acordo Operacional." />
                    </h2>
                    <p className="text-lg text-zinc-500 leading-relaxed font-light">
                        <EditableField path="crm_data.live_proposal.premises_subheadline" multiline placeholder="Nós construímos a máquina do Absoluto Zero. Mas o combustível comercial do dia-a-dia continua sendo seu." />
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 w-full">
                    
                    {/* REVHACKERS SIDE */}
                    <div className="flex-1 bg-zinc-950 p-10 rounded-xl relative shadow-2xl border border-zinc-900 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Building2 className="w-24 h-24 text-white" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6 relative z-10">
                            <div className="w-12 h-12 bg-[#00CC6A]/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-[#00CC6A]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-widest">A RevHackers Entrega</h3>
                                <p className="text-xs text-zinc-500 font-medium">Nossas Responsabilidades</p>
                            </div>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            {premises.we?.map((item: string, i: number) => (
                                <li key={i} className="flex flex-col border-b border-zinc-800/50 pb-2">
                                    <span className="text-sm text-zinc-300 font-medium pb-1.5 flex items-start gap-3">
                                        <div className="mt-1"><ShieldAlert className="w-3 h-3 text-[#00CC6A]" /></div>
                                        <EditableField path={`crm_data.live_proposal.premises.we.${i}`} placeholder="Responsabilidade da RevHackers" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CLIENT SIDE */}
                    <div className="flex-1 bg-white p-10 rounded-xl relative shadow-xl border border-zinc-200 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <UserCircle className="w-24 h-24 text-black" />
                        </div>

                        <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 pb-6 relative z-10">
                            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-black uppercase tracking-widest">Você Entrega</h3>
                                <p className="text-xs text-zinc-500 font-medium">Responsabilidades do Parceiro</p>
                            </div>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            {premises.you?.map((item: string, i: number) => (
                                <li key={i} className="flex flex-col border-b border-zinc-100 pb-2">
                                    <span className="text-sm text-zinc-600 font-medium pb-1.5 flex items-start gap-3">
                                        <div className="mt-1"><CheckCircle className="w-3 h-3 text-zinc-300" /></div>
                                        <EditableField path={`crm_data.live_proposal.premises.you.${i}`} placeholder="Responsabilidade do Cliente" />
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
