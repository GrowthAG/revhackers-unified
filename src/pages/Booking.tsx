
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import SEO from '@/components/shared/SEO';

const BOOKING_BASE_URL = "https://pages.revhackers.com.br/widget/booking/frZ10gIRdS8iNvtlGq3q";

const BookingPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

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

    const storedData = getFormData();
    if (storedData) {
      const userName = storedData.name || `${storedData.firstName || ''} ${storedData.lastName || ''}`.trim();
      setUserData({
        name: userName,
        email: storedData.email || '',
        phone: storedData.phone || '',
        company: storedData.company || '',
      });
    }

    // Fallback timer - if iframe doesn't load in 8s, show direct link
    const timer = setTimeout(() => {
      if (!iframeLoaded) setIframeFailed(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const bookingUrl = BOOKING_BASE_URL;

  return (
    <PageLayout>
      <SEO title="Agendar Auditoria de Receita" description="Agende uma auditoria técnica com a RevHackers para mapear vazamentos na sua operação B2B." canonical="https://revhackers.com.br/booking" />
      <section className="pt-32 pb-24 bg-white min-h-screen">
        <div className="w-full max-w-4xl mx-auto px-6">

          {/* Header */}
          {/* Header Brutalist */}
          <div className="text-center mb-12">
            <span className="inline-block border border-zinc-800 text-zinc-900 px-3 py-1 font-mono font-bold uppercase tracking-[0.3em] mb-6 text-xs bg-transparent">
              [ Vagas Restritas: 3 / mês ]
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6 uppercase">
              Auditoria de Receita
            </h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Não fazemos "calls para nos conhecer". Esta é uma agenda técnica focada em achar vazamentos no seu LTV e CAC. Se nossa Engenharia não puder dobrar a eficiência da sua máquina comercial em 90 dias, não faremos proposta.
            </p>

            {/* Checklist Scarcity */}
            <div className="max-w-lg mx-auto mt-8 flex flex-col gap-3 text-left bg-zinc-50 border border-zinc-200 p-6 rounded-sm shadow-sm">
              <span className="font-bold text-xxs tracking-widest uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-2">Pré-Requisitos da Operação:</span>
              <div className="flex items-start gap-3 text-sm text-zinc-700 font-bold">
                <CheckCircle className="w-5 h-5 text-black shrink-0" /> Operação B2B (High Ticket) validada e tracionando.
              </div>
              <div className="flex items-start gap-3 text-sm text-zinc-700 font-bold">
                <CheckCircle className="w-5 h-5 text-black shrink-0" /> Participação do Fundador/C-Level na reunião técnica.
              </div>
            </div>
          </div>

          {/* Calendar embed */}
          <div className="bg-white overflow-hidden max-w-3xl mx-auto min-h-[700px] border border-zinc-100 shadow-sm shadow-zinc-100/50">
            <iframe
              src={bookingUrl}
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px', background: '#ffffff' }}
              scrolling="no"
              id="frZ10gIRdS8iNvtlGq3q_1775165036136"
              title="Auditoria de Receita"
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
