
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';


const BookingPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

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

    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
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

  return (
    <PageLayout>
      <section className="py-24 bg-white min-h-screen relative flex items-center justify-center">
        {/* Background Texture - Subtle Noise for White */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

        <div className="container-custom relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-revgreen animate-pulse"></div>
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-black font-bold">
                System Ready // Booking Protocol
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-none mb-6 text-black tracking-tight">
              Agende seu <span className="text-black border-b-4 border-revgreen pb-1">Diagnóstico</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-lg mx-auto font-mono uppercase tracking-widest leading-relaxed">
              Sessão Estratégica de 30 Minutos para Identificação de Gargalos de Receita.
            </p>
          </div>

          {/* Calendar Embed - Centralized White Card with Shadow */}
          <Card className="w-full max-w-4xl bg-white border border-gray-100 rounded-sm shadow-2xl overflow-hidden relative animate-fade-in-up delay-150">
            {/* Tech Header - Clean White/Gray */}
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Secure Connection</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="w-2 h-2 rounded-full bg-revgreen"></div>
              </div>
            </div>

            <div className="relative w-full h-[850px] overflow-hidden bg-white">
              <iframe
                src={`https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh${buildQueryParams()}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  overflow: 'auto',
                  background: '#ffffff'
                }}
                scrolling="yes"
                id="E6Mw5guvWZc7ADFgxnJh_1766631709081"
                title="Agendar diagnóstico"
                className="relative z-10 w-full h-full"
              />
            </div>
          </Card>

          {/* Footer Text */}
          <div className="mt-12 text-center space-y-2 opacity-60">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              RevHackers Growth Architecture © 2025
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Secure Data Transmission Included
            </p>
          </div>

        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
