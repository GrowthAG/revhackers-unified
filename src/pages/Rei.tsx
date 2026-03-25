
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ReiForm from '@/components/shared/rei-form';

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
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
              Transforme sua estratégia de receita com metodologias avançadas 
              e acelere o crescimento do seu negócio.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <ReiForm />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Rei;
