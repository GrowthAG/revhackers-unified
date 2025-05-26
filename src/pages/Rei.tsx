
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';

const Rei = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <section className="py-16 bg-black text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              REI - <span className="text-revgreen">Revenue Excellence Initiative</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Transforme sua estratégia de receita com metodologias avançadas 
              e acelere o crescimento do seu negócio.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border border-white/10 rounded-xl shadow-xl p-8 md:p-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-revgreen/10 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-revgreen/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-revgreen rounded-full"></div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Formulário em Breve
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Estamos preparando uma experiência exclusiva para você. 
                  O formulário de inscrição estará disponível em breve.
                </p>
                
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Embed</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Área reservada para o formulário de inscrição
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Rei;
