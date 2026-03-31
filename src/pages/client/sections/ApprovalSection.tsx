import React, { useState } from 'react';
import { Check, Loader2, ArrowRight, Smartphone } from 'lucide-react';

const defaultSteps = [
    { day: 'Dia 1', category: 'Reunião Kick-Off', description: 'Alinhamento de expectativas, acesso aos sistemas e coleta de materiais.' },
    { day: 'Dia 2', category: 'Setup Técnico', description: 'Instalação de pixels, tags, integração CRM e configuração de UTMs.' },
    { day: 'Dia 3', category: 'Criação de Conteúdo', description: 'Briefing e produção dos primeiros criativos para campanhas iniciais.' },
    { day: 'Dia 5', category: 'Configuração de Campanhas', description: 'Estrutura de campanhas, audiências e orçamento segmentado por objetivo.' },
    { day: 'Dia 7', category: 'Validação de Tracking', description: 'Teste end-to-end: lead → CRM → conversão → relatório.' },
    { day: 'Dia 10', category: 'Entrada em Produção', description: 'Todas as campanhas ativas. Monitoramento diário de CAC e conversão.' },
];

export default function ApprovalSection({ plan, onApprove, onReject, approving, status }: {
    plan: any; onApprove: () => void; onReject: () => void; approving: boolean; status: string;
}) {
    const [showReject, setShowReject] = useState(false);
    const [rejectText, setRejectText] = useState('');
    const [sending, setSending] = useState(false);

    const implSteps = plan.diagnostic_data?.implementation_steps || [];
    const nextSteps = implSteps.length > 0 ? implSteps : (plan.next_steps_data?.week1_actions || []);
    const steps = nextSteps.length > 0 ? nextSteps : defaultSteps;

    // QR code URL for mobile access
    const planUrl = plan.access_token
        ? `${window.location.origin}/plan/${plan.access_token}`
        : window.location.href.split('?')[0];
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(planUrl)}&choe=UTF-8&chld=M|1`;

    const isApproved = status === 'approved';
    const isRejected = status === 'revision_requested' || status === 'rejected';

    const handleReject = async () => {
        setSending(true);
        setTimeout(() => { onReject(); setShowReject(false); setRejectText(''); setSending(false); }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden items-center justify-center">
            <div className="max-w-5xl w-full px-6 md:px-12 py-12 mx-auto">
                {isApproved ? (
                    <div className="bg-white border border-[#00CC6A]/20 p-10 md:p-14 text-center max-w-2xl mx-auto">
                        <div className="w-12 h-12 bg-[#00CC6A]/10 border border-[#00CC6A]/20 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-6 h-6 text-[#00CC6A]" />
                        </div>
                        <h3 className="text-2xl font-black text-black mb-3">Planejamento Aprovado</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">Nossa equipe entrou em contato. A execução começa nas próximas 24h.</p>
                        <div className="mt-8 pt-6 border-t border-zinc-100">
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">▲ RevHackers Growth Hub</span>
                        </div>
                    </div>
                ) : isRejected ? (
                    <div className="bg-white border border-zinc-200 p-10 md:p-14 text-center max-w-2xl mx-auto">
                        <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-6 h-6 text-zinc-900 animate-spin" />
                        </div>
                        <h3 className="text-2xl font-black text-black mb-3">Reconstrução em Andamento</h3>
                        <p className="text-zinc-500 text-sm max-w-md mx-auto">
                            Nossa IA Especialista (REI) está analisando seus apontamentos e gerando uma nova versão otimizada do planejamento estratégico.
                        </p>
                        <div className="mt-8 pt-6 border-t border-zinc-100">
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">REVENUE ENGINE INTELLIGENCE™</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        
                        {/* Left Side: Text and Actions */}
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 mb-4 leading-tight">
                                Autorização e Assinatura
                            </h2>
                            <p className="text-reading text-zinc-500 font-medium leading-[1.6] mb-8 pr-4">
                                Revisamos juntos o cenário, as metas e o plano de ação prático. Se estiver tudo alinhado, assine digitalmente para dar o OK e nossa equipe iniciar a execução.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={onApprove} 
                                    disabled={approving} 
                                    className="flex-1 bg-zinc-950 text-white font-bold py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Assinar Agora
                                </button>
                                <button 
                                    onClick={() => setShowReject(true)} 
                                    disabled={approving} 
                                    className="flex-1 bg-white border border-zinc-200 text-zinc-600 font-bold py-3.5 px-6 flex items-center justify-center hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                                >
                                    Solicitar Ajuste
                                </button>
                            </div>
                        </div>

                        {/* Right Side: QR Code Card */}
                        <div className="flex justify-center md:justify-end">
                            <div className="border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 w-full max-w-sm flex flex-col items-center text-center bg-white relative">
                                <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center mb-5 shrink-0">
                                    <Smartphone className="w-4 h-4 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">Assinatura Rápida no Celular</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed mb-6 px-2">
                                    Aponte a câmera para assinar na própria tela do celular e envie a autorização direto para nossa equipe, sem burocracia.
                                </p>
                                <div className="border border-zinc-100 p-2 mb-8">
                                    <img
                                        src={qrUrl}
                                        alt="QR Code"
                                        className="w-[180px] h-[180px]"
                                    />
                                </div>
                                <div className="bg-[#00CC6A]/10 px-4 py-1.5 rounded uppercase tracking-[0.2em] font-black text-xxs text-[#00CC6A]">
                                    Válido Assinatura Digital
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject/AI Adjustment Dialog */}
            {showReject && (
                <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowReject(false)}>
                    <div className="bg-white max-w-xl w-full border border-zinc-200 p-8 shadow-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Solicitar Refatoração da IA</h3>
                                <p className="text-sm text-zinc-500">Aponte o que precisa mudar. Nossa IA lerá e reajustará o plano.</p>
                            </div>
                        </div>
                        
                        <textarea
                            value={rejectText} onChange={e => setRejectText(e.target.value)}
                            placeholder="Descreva o que sentiu falta, o que precisa ser ajustado ou alguma regra de negócio que deve ser adicionada..."
                            className="w-full min-h-[160px] resize-none border border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 p-4 text-body font-medium text-zinc-700 outline-none leading-relaxed placeholder:text-zinc-400"
                        />
                        
                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button onClick={() => setShowReject(false)} className="px-5 py-3 hover:bg-zinc-50 text-sm font-bold text-zinc-600 transition-colors border border-transparent hover:border-zinc-200">
                                Cancelar
                            </button>
                            <button onClick={handleReject} disabled={!rejectText.trim() || sending} className="px-8 py-3 bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center gap-2">
                                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : 'Enviar para Inteligência'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
