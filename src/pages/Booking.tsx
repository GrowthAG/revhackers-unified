import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Calendar } from 'lucide-react';

const BookingPage = () => {
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
      
      console.log('Retrieved form data for booking:', storedData);
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
      <section className="py-12 bg-black text-white">
        <div className="container-custom">
          {/* Success Message */}
          <div className="max-w-4xl mx-auto mb-8">
            <Alert className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-900 shadow-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="space-y-2">
                <div className="font-semibold text-lg">
                  ✅ Seu material foi enviado com sucesso para o e-mail informado!
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  <span>📅 Aproveite enquanto o conteúdo está fresco: agende agora uma conversa rápida para entender como aplicar isso no seu negócio.</span>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl font-bold leading-tight mb-4">
              {userData.name ? (
                <>
                  <span className="text-revgreen">{userData.name}</span>, agende sua conversa
                </>
              ) : (
                <>
                  <span className="text-revgreen">Agende</span> uma conversa com um especialista
                </>
              )}
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto mt-4">
              Escolha o melhor horário para conversarmos sobre suas necessidades 
              e discutir soluções sob medida para seu negócio.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border border-white/10 rounded-xl shadow-xl p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-6">
                <span className="bg-gradient-to-r from-revgreen to-revgreen bg-clip-text text-transparent">Selecione</span> a data e horário
              </h3>
              
              <div className="booking-calendar-wrapper relative bg-black rounded-lg overflow-hidden p-1">
                <div className="absolute inset-0 bg-revgreen/5 opacity-30"></div>
                <style>{`
                  .booking-calendar-wrapper iframe {
                    filter: invert(0) hue-rotate(0deg) brightness(1.2) contrast(1.1);
                  }
                  .booking-calendar-wrapper iframe * {
                    color: white !important;
                  }
                  .booking-calendar-wrapper iframe input,
                  .booking-calendar-wrapper iframe select,
                  .booking-calendar-wrapper iframe button {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                  }
                  .booking-calendar-wrapper iframe .calendar-day,
                  .booking-calendar-wrapper iframe .time-slot {
                    color: white !important;
                    background: transparent !important;
                  }
                `}</style>
                <iframe 
                  src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
                  style={{ 
                    width: '100%', 
                    border: 'none', 
                    overflow: 'hidden', 
                    backgroundColor: 'transparent'
                  }} 
                  scrolling="no" 
                  id="sKnL4ucDKohNmqj1hn6H_1744205651626"
                  title="Agendar consulta"
                  className="min-h-[700px] relative z-10"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-black text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">O que discutiremos na nossa sessão</h2>
            <p className="text-white mb-10 text-lg">
              Durante nossa reunião, vamos analisar seus sistemas e
              discutir soluções técnicas personalizadas para seu negócio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="relative bg-black p-6 rounded-xl border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-revgreen rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">01</div>
                  <h3 className="font-bold text-xl mb-3 text-white">Diagnóstico Técnico</h3>
                  <p className="text-white/80">
                    Análise de suas ferramentas, sistemas e desafios específicos de operação
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-black p-6 rounded-xl border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-revgreen rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">02</div>
                  <h3 className="font-bold text-xl mb-3 text-white">Soluções Técnicas</h3>
                  <p className="text-white/80">
                    Apresentação das melhores ferramentas e metodologias para seu cenário
                  </p>
                </div>
              </Card>
              
              <Card className="relative bg-black p-6 rounded-xl border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-revgreen/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-revgreen rounded-xl flex items-center justify-center text-xl font-bold text-black mb-4 shadow-md">03</div>
                  <h3 className="font-bold text-xl mb-3 text-white">Implementação</h3>
                  <p className="text-white/80">
                    Plano detalhado de execução com cronograma e métricas de sucesso
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

export default BookingPage;
