
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';
import Section from '@/components/ui/Section';

const AgendaDiagnosticoPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Load user data from localStorage
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

    // Create a script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;

    // Add the script to the document
    document.body.appendChild(script);

    // Clean up function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Build query parameters for the iframe URL
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
      <div className="min-h-screen bg-black pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="container-custom w-full max-w-5xl">

          {/* Header minimalista */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
              Agendar <span className="text-revgreen">Sessão Estratégica</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
              Selecione o melhor horário abaixo.
            </p>
          </div>

          {/* Calendar Container */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm relative">
            {/* Loader / Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-8 h-8 border-2 border-revgreen border-t-transparent rounded-full animate-spin"></div>
            </div>

            <style>{`
                  .booking-calendar-wrapper iframe {
                    background: transparent !important;
                    min-height: 750px !important;
                  }
                `}</style>

            <iframe
              src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
              style={{
                width: '100%',
                border: 'none',
                minHeight: '750px',
                backgroundColor: 'transparent'
              }}
              id="sKnL4ucDKohNmqj1hn6H_1744205651626"
              title="Agendar diagnóstico"
            />
          </div>

          {/* Footer minimalista */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-zinc-500 hover:text-white transition-colors underline decoration-zinc-800 underline-offset-4">
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgendaDiagnosticoPage;
