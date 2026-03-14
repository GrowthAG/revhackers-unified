
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { ExternalLink, Calendar } from 'lucide-react';

const BOOKING_BASE_URL = "https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh";

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

    // Fallback timer — if iframe doesn't load in 6s, show direct link
    const timer = setTimeout(() => {
      if (!iframeLoaded) setIframeFailed(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (userData.email) params.append('email', userData.email);
    if (userData.name) params.append('name', userData.name);
    if (userData.phone) params.append('phone', userData.phone);
    if (userData.company) params.append('company', userData.company);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const bookingUrl = `${BOOKING_BASE_URL}${buildQueryParams()}`;

  return (
    <PageLayout>
      <section className="py-24 bg-white min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center">

          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-400 mb-3 block">
              Agendamento
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              Agende seu Diagnostico
            </h1>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Sessao estrategica de 30 minutos para identificar gargalos de receita e oportunidades de crescimento.
            </p>
          </div>

          {/* Calendar embed with fallback */}
          <div className="w-full border border-zinc-200 rounded-xl overflow-hidden bg-white">
            <div className="relative w-full" style={{ minHeight: '750px' }}>
              {/* Loading state */}
              {!iframeLoaded && !iframeFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
                  <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-zinc-400">Carregando calendario...</p>
                </div>
              )}

              {/* Fallback when iframe fails */}
              {iframeFailed && !iframeLoaded && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white p-8">
                  <Calendar className="w-10 h-10 text-zinc-300 mb-4" />
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Calendario indisponivel</h3>
                  <p className="text-sm text-zinc-500 text-center mb-6 max-w-sm">
                    O widget de agendamento nao carregou. Clique abaixo para agendar diretamente.
                  </p>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Agendar Diretamente
                  </a>
                </div>
              )}

              <iframe
                src={bookingUrl}
                style={{ width: '100%', height: '750px', border: 'none', background: '#ffffff' }}
                scrolling="yes"
                title="Agendar diagnostico"
                className="relative z-10 w-full"
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
