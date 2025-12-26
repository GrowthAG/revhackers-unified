
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
      <section className="py-20 bg-white min-h-screen relative overflow-hidden flex items-center">
        {/* Pure White Background - removed grid for ultra minimalism */}

        <div className="container-custom relative z-10 w-full max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl font-black leading-none mb-6 text-black uppercase tracking-[0.2em]">
              Agende seu <span className="text-black border-b-4 border-revgreen pb-2">Diagnóstico</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed uppercase tracking-widest">
              Converse com um especialista e entenda como escalar sua operação.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Sidebar - Clean Text Only (No Box) */}
            <div className="lg:col-span-4 space-y-12 pt-4">
              <div className="sticky top-24">
                <h3 className="text-lg font-black text-black mb-12 uppercase tracking-[0.1em] pl-4 border-l-4 border-black">
                  O que vamos discutir?
                </h3>

                <div className="space-y-12">
                  <div className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-black font-bold mb-3 uppercase tracking-wider text-xs group-hover:text-revgreen transition-colors">Sessão Estratégica</h4>
                      <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-widest">Análise profunda do cenário atual.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 mt-1">
                      <Calendar className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-black font-bold mb-3 uppercase tracking-wider text-xs group-hover:text-revgreen transition-colors">Diagnóstico Técnico</h4>
                      <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-widest">Gargalos em Marketing, Vendas e Dados.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-black font-bold mb-3 uppercase tracking-wider text-xs group-hover:text-revgreen transition-colors">Plano de Ação</h4>
                      <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-widest">Frameworks para crescimento.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Embed - Floating White Card */}
            <div className="lg:col-span-8">
              <Card className="bg-white border-0 shadow-none p-0 overflow-hidden relative min-h-[800px]">
                {/* Minimal Header Line */}
                <div className="w-full h-px bg-zinc-200 mb-8"></div>

                <div className="relative w-full h-[850px] md:h-[800px] overflow-hidden bg-white">
                  <iframe
                    src={`https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh${buildQueryParams()}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      overflow: 'hidden',
                      background: '#ffffff'
                    }}
                    scrolling="no"
                    id="E6Mw5guvWZc7ADFgxnJh_1766631709081"
                    title="Agendar diagnóstico"
                    className="relative z-10 w-full h-full"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
