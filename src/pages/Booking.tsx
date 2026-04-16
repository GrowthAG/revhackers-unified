
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { CheckCircle, Clock, FileText, Zap } from 'lucide-react';
import SEO from '@/components/shared/SEO';

const BOOKING_BASE_URL = "https://pages.revhackers.com.br/widget/booking/frZ10gIRdS8iNvtlGq3q";

const nextSteps = [
  {
    icon: Clock,
    title: 'Confirmação em < 2h',
    desc: 'Você recebe um email de confirmação com as instruções de preparação.',
  },
  {
    icon: FileText,
    title: 'Diagnóstico Prévio',
    desc: 'Nossa equipe analisa sua operação antes da reunião para chegar com perguntas cirúrgicas.',
  },
  {
    icon: Zap,
    title: 'Plano de Ação no mesmo dia',
    desc: 'Na reunião, você sai com o mapa dos principais vazamentos da sua operação e os próximos passos.',
  },
];

const BookingPage = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load GHL form embed script
    const scriptId = "revhackers-booking-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://pages.revhackers.com.br/js/form_embed.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <PageLayout>
      <SEO
        title="Agendar Auditoria de Receita"
        description="Agende uma auditoria técnica com a RevHackers para mapear vazamentos na sua operação B2B."
        canonical="https://revhackers.com.br/booking"
      />
      <section className="pt-32 pb-24 bg-white min-h-screen">
        <div className="w-full max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block border border-zinc-800 text-zinc-900 px-3 py-1 font-mono font-bold uppercase tracking-[0.3em] mb-6 text-xs bg-transparent">
              [ Vagas Restritas: 3 / mês ]
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6 uppercase">
              Auditoria de Receita
            </h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Não fazemos "calls para nos conhecer". Esta é uma agenda técnica focada em achar vazamentos no seu LTV e CAC. Se nossa Engenharia não puder dobrar a eficiência da sua máquina comercial em 90 dias, não faremos proposta.
            </p>
          </div>

          {/* Layout 2 colunas: info + calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Coluna esquerda: contexto de conversão */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* Pré-Requisitos */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm">
                <span className="font-bold text-xxs tracking-widest uppercase text-zinc-500 mb-4 border-b border-zinc-200 pb-3 block">
                  Pré-Requisitos da Operação:
                </span>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 text-sm text-zinc-700 font-bold">
                    <CheckCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    Operação B2B (High Ticket) validada e tracionando.
                  </div>
                  <div className="flex items-start gap-3 text-sm text-zinc-700 font-bold">
                    <CheckCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    Participação do Fundador/C-Level na reunião técnica.
                  </div>
                </div>
              </div>

              {/* O que acontece depois de agendar */}
              <div>
                <span className="font-bold text-xxs tracking-widest uppercase text-zinc-400 mb-5 block">
                  O que acontece depois:
                </span>
                <div className="flex flex-col gap-5">
                  {nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-sm bg-zinc-900 flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 mb-1">{step.title}</p>
                        <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini social proof */}
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Resultado típico em 90 dias</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter">+R$480K</p>
                <p className="text-sm text-zinc-500 mt-1">em receita identificada ou recuperada nas últimas 4 auditorias.</p>
              </div>
            </div>

            {/* Coluna direita: calendário */}
            <div className="lg:col-span-3 bg-white overflow-hidden min-h-[700px] border border-zinc-100 shadow-sm shadow-zinc-100/50">
              <iframe
                src={BOOKING_BASE_URL}
                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px', background: '#ffffff' }}
                scrolling="no"
                id="frZ10gIRdS8iNvtlGq3q_1775165036136"
                title="Auditoria de Receita"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </div>

        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
