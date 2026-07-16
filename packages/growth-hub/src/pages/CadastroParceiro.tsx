
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';

const CadastroParceiro = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

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
      <section className="py-16 bg-black text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Cadastro de <span className="text-revgreen">Parceiro</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Junte-se à nossa rede de parceiros e cresça conosco. 
              Preencha o formulário abaixo para iniciar nossa parceria.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border border-white/10 rounded-xl shadow-xl p-6 md:p-8">
              <div className="partner-form-wrapper relative bg-black rounded-lg overflow-hidden p-1">
                <div className="absolute inset-0 bg-revgreen/5 opacity-30"></div>
                <iframe 
                  src="https://team.growthagency.com.br/widget/survey/GAukcFSWrgtqstfl3h65"
                  style={{ 
                    border: 'none', 
                    width: '100%' 
                  }} 
                  scrolling="no" 
                  id="GAukcFSWrgtqstfl3h65"
                  title="Cadastro de Parceiro"
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

export default CadastroParceiro;
