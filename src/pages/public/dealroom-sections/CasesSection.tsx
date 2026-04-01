import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function CasesSection({ proposal }: { proposal: any }) {
    const liveData = proposal?.crm_data?.live_proposal || {};

    const defaultCases = [
        {
            company: 'ENICS (Tecnologia & Eventos)',
            metric: 'Venda Rápida (30 Dias)',
            before: 'Estagnada',
            after: '3 Mil Vendas',
            trend: 'up',
            insight: 'Motor de remarketing dinâmico multicanal cruzando Meta, Google e Whatsapp.'
        },
        {
            company: 'Universidade Cruzeiro do Sul',
            metric: 'Volume Multidisciplinar',
            before: 'Fricção Alta',
            after: '47K Inscrições',
            trend: 'up',
            insight: 'Integração de canais e arquitetura de funis unificando o ataque em nível nacional.'
        },
        {
            company: 'Wysion (Tecnologia & SaaS)',
            metric: 'Fechamento de Negócios (Sales)',
            before: '14 Dias',
            after: '4 Dias',
            trend: 'down',
            insight: 'SDR Agents capturando intenção digital e transferindo com contexto para o CRM.'
        }
    ];

    const cases = liveData.cases || defaultCases;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-950 p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px] relative overflow-hidden border-t-8 border-[#00CC6A]">

            <div className="absolute top-20 left-10 opacity-[0.03]">
                <TrendingUp className="w-[800px] h-[800px] text-white" />
            </div>

            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">HISTÓRICO DE RESULTADOS</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-6 relative">
                        <EditableField path="crm_data.live_proposal.cases_headline" placeholder="A Prova na Prática." />
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                        <EditableField path="crm_data.live_proposal.cases_subheadline" multiline placeholder="A matemática da nossa máquina na operação de empresas parceiras que escalaram com segurança." />
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {cases.map((c: any, i: number) => (
                        <div key={i} className="bg-black border border-zinc-800 p-8 rounded-xl shadow-2xl relative overflow-hidden group hover:border-zinc-600 transition-colors">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00CC6A]/5 rounded-full blur-[40px] group-hover:bg-[#00CC6A]/10 transition-colors" />

                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-8 border-b border-zinc-900 pb-2">
                                <EditableField path={`crm_data.live_proposal.cases.${i}.company`} placeholder="Nome do Cliente" />
                            </h3>

                            <div className="mb-2">
                                <span className="text-sm font-bold text-white mb-2 block">
                                    <EditableField path={`crm_data.live_proposal.cases.${i}.metric`} placeholder="Nome da Métrica" />
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 flex flex-col">
                                    <span className="text-xxs font-medium uppercase tracking-widest text-zinc-500 mb-1">Antes</span>
                                    <span className="text-xl font-mono text-zinc-300 line-through decoration-red-500/50">
                                        <EditableField path={`crm_data.live_proposal.cases.${i}.before`} placeholder="Ex: R$ 1.500" />
                                    </span>
                                </div>
                                <div className="shrink-0 flex items-center justify-center pt-5">
                                    {c.trend === 'down' ? (
                                        <ArrowDownRight className="w-5 h-5 text-[#00CC6A]" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-[#00CC6A]" />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col items-end">
                                    <span className="text-xxs font-medium uppercase tracking-widest text-zinc-500 mb-1">Depois</span>
                                    <span className="text-2xl font-black font-mono text-[#00CC6A]">
                                        <EditableField path={`crm_data.live_proposal.cases.${i}.after`} placeholder="Ex: R$ 400" />
                                    </span>
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 p-4 rounded text-xs text-zinc-400 leading-relaxed italic border-l-2 border-zinc-700 group-hover:border-[#00CC6A]/50 transition-colors">
                                <EditableField path={`crm_data.live_proposal.cases.${i}.insight`} multiline placeholder="Explicação rápida do porquê o resultado aconteceu (ex: robô cortou tempo ocioso)." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
