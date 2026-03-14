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
        <div className="space-y-16">
            {/* Header */}
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Execução Imediata</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-[1.05] mb-4">
                    Próximos<br /><span className="text-zinc-400">Passos</span>
                </h2>
                <p className="text-zinc-500">O que acontece nas primeiras 48h após a aprovação do plano</p>
            </div>

            {/* Timeline */}
            <div className="space-y-0 border-t border-zinc-200">
                {steps.map((step: any, i: number) => {
                    const day = step.day || `Passo ${i + 1}`;
                    const title = step.title || step.category || step.action || step.name;
                    const desc = step.description || (step.estimated_time ? `Prazo: ${step.estimated_time}` : '');
                    return (
                        <div key={i} className="flex items-start gap-6 py-6 border-b border-zinc-100 group hover:bg-zinc-50 px-2 transition-colors -mx-2">
                            <div className="w-14 shrink-0">
                                <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">{day}</span>
                            </div>
                            <div className="w-px bg-zinc-200 self-stretch shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-base font-semibold text-black mb-1">{title}</h4>
                                {desc && <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>}
                            </div>
                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-4 h-4 text-zinc-300" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* QR Code – Mobile access */}
            <div className="border border-zinc-200 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-0">
                    {/* QR Panel */}
                    <div className="bg-zinc-50 flex flex-col items-center justify-center p-8 md:p-10 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200">
                        <img
                            src={qrUrl}
                            alt="QR Code para acesso mobile"
                            className="w-[140px] h-[140px]"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                    {/* Info */}
                    <div className="p-8 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="w-4 h-4 text-zinc-400" />
                            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">Acesse pelo celular</p>
                        </div>
                        <h4 className="text-lg font-bold text-black mb-2">Compartilhe com seu time</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                            Escaneie o QR code para abrir este planejamento direto no smartphone ou envie o link para quem precisa revisar.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="text-xs text-zinc-400 font-mono bg-zinc-100 px-3 py-2 flex-1 truncate block">
                                {planUrl}
                            </code>
                            <button
                                onClick={() => navigator.clipboard?.writeText(planUrl).then(() => alert('Link copiado!')).catch(() => { })}
                                className="text-xs px-3 py-2 border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-black transition-colors shrink-0"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval CTA */}
            <div className="mt-8">
                {isApproved ? (
                    <div className="bg-white border border-green-200 p-10 md:p-14 text-center rounded-xl">
                        <div className="w-16 h-16 bg-green-50 border border-[#00CC6A] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-[#00CC6A]" />
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-3">Planejamento Aprovado</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">Nossa equipe entrou em contato. A execução começa nas próximas 24h.</p>
                        <div className="mt-8 pt-6 border-t border-zinc-100">
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">▲ RevHackers Growth Hub</span>
                        </div>
                    </div>
                ) : isRejected ? (
                    <div className="border border-zinc-200 p-10 text-center">
                        <h3 className="text-xl font-semibold text-black mb-2">Ajustes em Revisão</h3>
                        <p className="text-sm text-zinc-500">Nossa equipe está revisando suas observações e entrará em contato em breve.</p>
                    </div>
                ) : (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                        <div className="p-10 md:p-14 text-center">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Próximo Passo</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-black mb-3">Pronto para começar?</h3>
                            <p className="text-zinc-500 mb-10 max-w-md mx-auto text-sm leading-relaxed">
                                Ao aprovar, você autoriza o início das ações descritas neste planejamento. Nossa equipe entra em ação em até 24h.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={() => setShowReject(true)} disabled={approving} className="px-8 py-4 bg-white border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors disabled:opacity-30 rounded-lg">
                                    Solicitar Ajustes
                                </button>
                                <button onClick={onApprove} disabled={approving} className="px-10 py-4 bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center gap-2 rounded-lg shadow-md">
                                    {approving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Processando</>) : (<> Aprovar Execução <ArrowRight className="w-4 h-4" /></>)}
                                </button>
                            </div>
                        </div>
                        <div className="px-10 py-5 bg-white border-t border-zinc-200 flex items-center justify-between">
                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">▲ RevHackers</span>
                            <span className="text-xs text-zinc-400 font-bold">Revenue Engine Intelligence™</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            {showReject && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReject(false)}>
                    <div className="bg-white max-w-lg w-full border border-zinc-200 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-1">Solicitar Ajustes</h3>
                        <p className="text-zinc-500 text-sm mb-4">Descreva o que precisa ser revisado no planejamento.</p>
                        <textarea
                            value={rejectText} onChange={e => setRejectText(e.target.value)}
                            placeholder="Ex: Gostaria de ajustar o prazo do Mês 1, o nosso time ainda não tem SDR..."
                            className="w-full min-h-[120px] resize-none border border-zinc-200 focus:border-zinc-900 p-3 text-sm focus:outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowReject(false)} className="px-5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors rounded-lg">Cancelar</button>
                            <button onClick={handleReject} disabled={!rejectText.trim() || sending} className="px-6 py-2.5 bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-40 rounded-lg shadow-sm">
                                {sending ? 'Enviando...' : 'Enviar Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
