import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';

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
      
      console.log('Retrieved form data for diagnosis booking:', storedData);
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
      <section className="py-8 bg-black text-white min-h-screen">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              📊 <span className="text-revgreen">Agende seu Diagnóstico Gratuito</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mt-4">
              Converse com um especialista e entenda como melhorar seus resultados 
              com estratégias personalizadas.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <Card className="bg-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 md:p-6">
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
                  <span className="text-revgreen">Selecione</span> <span className="text-white">a data e horário</span>
                </h3>
                
                <div className="booking-calendar-wrapper relative">
                  <style>{`
                    .booking-calendar-wrapper {
                      background: #000000 !important;
                    }
                    .booking-calendar-wrapper iframe {
                      background: #000000 !important;
                      border: none !important;
                      outline: none !important;
                    }
                    .booking-calendar-wrapper iframe body {
                      background: #000000 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    .booking-calendar-wrapper iframe * {
                      background-color: transparent !important;
                      color: white !important;
                      font-family: inherit !important;
                    }
                    .booking-calendar-wrapper iframe input,
                    .booking-calendar-wrapper iframe select,
                    .booking-calendar-wrapper iframe button {
                      color: white !important;
                      background: rgba(255, 255, 255, 0.05) !important;
                      border: 1px solid rgba(255, 255, 255, 0.2) !important;
                      border-radius: 8px !important;
                    }
                    .booking-calendar-wrapper iframe button:hover {
                      background: rgba(0, 255, 136, 0.1) !important;
                      border-color: #00ff88 !important;
                    }
                    .booking-calendar-wrapper iframe .calendar-day,
                    .booking-calendar-wrapper iframe .time-slot {
                      color: white !important;
                      background: rgba(255, 255, 255, 0.03) !important;
                      border-radius: 6px !important;
                      margin: 2px !important;
                      border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    }
                    .booking-calendar-wrapper iframe .calendar-day:hover,
                    .booking-calendar-wrapper iframe .time-slot:hover {
                      background: rgba(0, 255, 136, 0.1) !important;
                      border-color: #00ff88 !important;
                    }
                    .booking-calendar-wrapper iframe .selected {
                      background: #00ff88 !important;
                      color: black !important;
                    }
                    .booking-calendar-wrapper iframe [style*="background-color: blue"],
                    .booking-calendar-wrapper iframe [style*="background-color: #0000ff"],
                    .booking-calendar-wrapper iframe [style*="background: blue"],
                    .booking-calendar-wrapper iframe [style*="background: #0000ff"] {
                      background: #000000 !important;
                    }
                  `}</style>
                  <iframe 
                    src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
                    style={{ 
                      width: '100%', 
                      border: 'none', 
                      overflow: 'hidden', 
                      backgroundColor: '#000000',
                      minHeight: '900px',
                      display: 'block',
                      margin: '0',
                      padding: '0'
                    }} 
                    scrolling="yes" 
                    id="sKnL4ucDKohNmqj1hn6H_1744205651626"
                    title="Agendar diagnóstico"
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              O que você receberá no <span className="text-revgreen">diagnóstico</span>
            </h2>
            <p className="text-white/80 mb-12 text-lg leading-relaxed">
              Durante nossa reunião, vamos analisar seus sistemas e
              discutir soluções técnicas personalizadas para seu negócio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-revgreen/10 rounded-full group-hover:bg-revgreen/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-revgreen to-green-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-black mb-6 shadow-lg">01</div>
                  <h3 className="font-bold text-xl mb-4 text-white">Diagnóstico Completo</h3>
                  <p className="text-white/70 leading-relaxed">
                    Análise detalhada de suas ferramentas, sistemas e desafios específicos de operação
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-revgreen/10 rounded-full group-hover:bg-revgreen/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-revgreen to-green-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-black mb-6 shadow-lg">02</div>
                  <h3 className="font-bold text-xl mb-4 text-white">Estratégias Personalizadas</h3>
                  <p className="text-white/70 leading-relaxed">
                    Apresentação das melhores ferramentas e metodologias para seu cenário específico
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-revgreen/10 rounded-full group-hover:bg-revgreen/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-revgreen to-green-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-black mb-6 shadow-lg">03</div>
                  <h3 className="font-bold text-xl mb-4 text-white">Plano de Ação</h3>
                  <p className="text-white/70 leading-relaxed">
                    Roadmap detalhado de execução com cronograma e métricas de sucesso
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AgendaDiagnosticoPage;
