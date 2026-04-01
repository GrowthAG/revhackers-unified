import React from 'react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function InvestmentSection({ proposal }: { proposal: any }) {
    const { isEditing } = usePlanEdit();
    const liveData = proposal?.crm_data?.live_proposal || {};
    
    // Configurações do QR Code e Action
    const acceptanceLink = proposal?.crm_data?.payment_link || 'https://revhackers.com.br/onboarding';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(acceptanceLink)}&color=000000&bgcolor=ffffff`;

    return (
        <section className="w-full min-h-[100dvh] flex flex-col items-center bg-zinc-950 p-8 lg:p-12 pt-16 pb-[200px] lg:pb-[200px] relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00CC6A]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="w-full max-w-6xl mx-auto flex flex-col z-10">
                
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xxs font-black tracking-[0.2em] text-[#00CC6A] uppercase mb-4 block">INVESTIMENTO & ACORDO</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-6 relative">
                        <EditableField path="crm_data.live_proposal.investment_headline" placeholder="O Valor da Transformação." />
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                        <EditableField path="crm_data.live_proposal.investment_subheadline" multiline placeholder="Transparência total no modelo de alocação da nossa engenharia." />
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row shadow-2xl rounded-2xl overflow-hidden border border-zinc-800">
                    
                    {/* LEFTSIDE: Pricing Breakdown */}
                    <div className="flex-[3] bg-[#09090b] p-10 lg:p-16 flex flex-col justify-center">
                        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] mb-12 border-b border-zinc-800 pb-4">
                            Estrutura de Capital
                        </h3>

                        <div className="space-y-8">
                            <div className="flex justify-between items-center group gap-4">
                                <div>
                                    <span className="text-lg font-medium text-white block mb-1">Setup Inicial (1º Mês)</span>
                                    <span className="text-xs text-zinc-500 font-light leading-relaxed block max-w-xs">Taxa única de arquitetura e onboarding técnico.</span>
                                </div>
                                <div className="text-2xl font-bold text-white group-hover:text-[#00CC6A] transition-colors whitespace-nowrap flex items-center shrink-0">
                                    <span className="text-sm text-zinc-500 mr-2">R$</span>
                                    <EditableField path="setup_fee" placeholder="0" className="!w-32 text-right !bg-transparent" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center group gap-4">
                                <div>
                                    <span className="text-lg font-medium text-white block mb-1">Fee Mensal (11x)</span>
                                    <span className="text-xs text-zinc-500 font-light leading-relaxed block max-w-xs">Manutenção, inteligência e servidores. Parcelas sucessivas.</span>
                                </div>
                                <div className="text-2xl font-bold text-white group-hover:text-[#00CC6A] transition-colors whitespace-nowrap flex items-center shrink-0">
                                    <span className="text-sm text-zinc-500 mr-2">R$</span>
                                    <EditableField path="installment_value" placeholder="0" className="!w-32 text-right !bg-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* Total VGV hidden for psychology */}
                    </div>

                    {/* RIGHTSIDE: Fast-Track & QR Code */}
                    <div className="flex-[2] bg-white p-10 lg:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        
                        <div className="border border-[#00CC6A]/40 bg-[#00CC6A]/5 text-[#00CC6A] text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 mb-8 relative z-10">
                            Acordo Imediato
                        </div>

                        <h3 className="text-2xl font-black text-black leading-tight mb-4 relative z-10">
                            Condição de Fechamento na Call
                        </h3>
                        
                        <p className="text-sm text-zinc-600 font-medium mb-8 max-w-[280px] relative z-10">
                            <EditableField path="crm_data.live_proposal.investment_fast_track_bonus" multiline placeholder="Bônus Exclusivo: Desconto de 100% no Setup ou 2 Meses Livres de Fee para aceite durante esta reunião." />
                        </p>

                        <div className="p-4 bg-zinc-50 border border-zinc-200 mb-6 relative z-10 group-hover:shadow-[0_0_20px_rgba(0,204,106,0.1)] transition-shadow">
                            <img 
                                src={qrCodeUrl} 
                                alt="QR Code" 
                                className="w-40 h-40 object-contain mix-blend-multiply"
                            />
                        </div>

                        <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 mt-2 relative z-10 flex flex-col items-center justify-center gap-2">
                            <span>Aponte a Câmera <ArrowRight className="inline-block w-3 h-3 ml-1 text-[#00CC6A]" /></span>
                            {isEditing && (
                                <span className="w-full text-[9px] text-zinc-300 font-mono mt-2 opacity-60 hover:opacity-100 transition-opacity">
                                    <EditableField path="crm_data.payment_link" placeholder="Cole o Link de Pagamento ou Assinatura aqui..." />
                                </span>
                            )}
                        </p>

                        <div className="mt-8 pt-8 border-t border-zinc-100 w-full relative z-10 flex flex-col items-center">
                            <ShieldCheck className="w-6 h-6 text-[#00CC6A] mb-3" />
                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold max-w-[200px]">
                                O QR Code direciona para o formulário seguro de aceite do escopo.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
