import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { ShieldAlert, Crosshair } from 'lucide-react';

export default function DiagnosisSection({ proposal }: { proposal: any }) {
    // If we have AI structured data in crm_data.live_proposal, we use it. 
    // Otherwise fallback to basic summary.
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    // For now we will support a raw text fallback and a structured challenges array
    const challenges = liveData.challenges || [
        { title: 'Custos de Aquisição (CAC) Elevados', description: 'Dependência de mídia paga inflacionada sem conversão qualificada.' },
        { title: 'Taxa de Fechamento Irregular', description: 'Vendedores perdendo eficiência pela falta de processos automatizados.' }
    ];

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-white p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px]">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                
                <div className="text-center mb-16 max-w-3xl">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">1. O Desafio Atual</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-zinc-900 tracking-tighter mb-6">
                        <EditableField path="crm_data.live_proposal.diagnosis_headline" placeholder="Por que estamos aqui?" />
                    </h2>
                    <p className="text-lg text-zinc-500 leading-relaxed font-light">
                        <EditableField path="crm_data.live_proposal.diagnosis_subheadline" multiline placeholder="Resumo estratégico extraído do nosso diagnóstico inicial, mapeando os principais ofensores da sua operação." />
                    </p>
                </div>

                {/* Challenges Grid 2x2 symmetry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 w-full rounded-sm overflow-hidden shadow-sm">
                    {challenges.map((ch: any, i: number) => (
                        <div key={i} className="bg-white p-10 hover:bg-zinc-50 transition-colors group">
                            <div className="w-10 h-10 rounded border border-zinc-200 flex items-center justify-center mb-6 bg-zinc-50 group-hover:bg-white transition-colors">
                                <ShieldAlert className="w-4 h-4 text-red-500/80" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">
                                <EditableField path={`crm_data.live_proposal.challenges.${i}.title`} placeholder="Título do Desafio" />
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                <EditableField path={`crm_data.live_proposal.challenges.${i}.description`} multiline placeholder="Descrição do impacto deste desafio na operação atual do cliente." />
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 w-full max-w-3xl bg-zinc-50 border border-zinc-200 p-8 flex gap-6 items-start rounded-sm shadow-sm">
                    <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
                        <Crosshair className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-2">Objetivo Primário do Projeto</h4>
                        <p className="text-zinc-600 text-sm leading-relaxed">
                            <EditableField path="crm_data.live_proposal.primary_objective" multiline placeholder="Ex: Reduzir o ciclo de vendas e dobrar a taxa de conversão através de processos sistematizados de previsibilidade." />
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
