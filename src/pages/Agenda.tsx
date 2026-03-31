import { CheckCircle2 } from 'lucide-react';
import BookingPageTemplate from '@/components/booking/BookingPageTemplate';

const Agenda = () => {
    return (
        <BookingPageTemplate
            title="Agende seu Diagnóstico"
            iframeSrc="https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh"
        >
            <div className="space-y-8 bg-zinc-50 p-6 md:p-8 border border-zinc-100">
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 uppercase tracking-tight">
                    O que você vai descobrir nesta sessão estratégica:
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                        <span className="text-zinc-600 text-sm md:text-base">
                            <strong className="text-zinc-900">Diagnóstico Profundo:</strong> Análise completa dos gargalos que impedem sua receita de escalar hoje.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                        <span className="text-zinc-600 text-sm md:text-base">
                            <strong className="text-zinc-900">Roadmap de Crescimento:</strong> Um plano passo a passo personalizado para dobrar seu faturamento nos próximos 12 meses.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                        <span className="text-zinc-600 text-sm md:text-base">
                            <strong className="text-zinc-900">Benchmark de Mercado:</strong> Compare seus números com as empresas de crescimento mais rápido do seu setor (SaaS & B2B).
                        </span>
                    </li>
                </ul>
                <p className="text-xs md:text-sm text-zinc-400 italic pt-4 border-t border-zinc-200 leading-relaxed">
                    *Esta sessão é 100% gratuita para empresas qualificadas. Sem pitches de venda agressivos ou perda de tempo. Apenas estratégia pura aplicada ao seu negócio.
                </p>
            </div>
        </BookingPageTemplate>
    );
};

export default Agenda;
