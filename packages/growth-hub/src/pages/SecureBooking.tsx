
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';

const SecureBooking = () => {
  useEffect(() => {
    // Create and add the script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    
    document.body.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <PageLayout>
      <section className="py-12 bg-black text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl font-bold leading-tight mb-4">
              <span className="text-revgreen">Agende</span> uma conversa agora
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto mt-4">
              Escolha o melhor horário para conversarmos sobre suas necessidades 
              e discutir soluções sob medida para seu negócio.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border border-white/10 rounded-xl shadow-xl p-6 md:p-8">
              <div className="booking-calendar-wrapper relative bg-black rounded-lg overflow-hidden p-1">
                <div className="absolute inset-0 bg-revgreen/5 opacity-30"></div>
                <iframe 
                  src="https://team.growthagency.com.br/widget/booking/MmyRuRPox3ZComQA3jJ1"
                  style={{ 
                    width: '100%', 
                    border: 'none', 
                    overflow: 'hidden', 
                    backgroundColor: 'transparent'
                  }} 
                  scrolling="no" 
                  id="MmyRuRPox3ZComQA3jJ1_1745274440346"
                  title="Agendar consulta"
                  className="min-h-[700px] relative z-10"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SecureBooking;
