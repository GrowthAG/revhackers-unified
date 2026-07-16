
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="section-padding bg-zinc-50 border-t border-zinc-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-black uppercase leading-none">
              Vamos crescer <span className="text-revgreen">juntos?</span>
            </h2>

            <p className="text-xl text-zinc-500 font-medium tracking-tight">
              Agende uma conversa com nossos especialistas e descubra como podemos
              ajudar sua empresa a escalar resultados de forma sustentável.
            </p>

            <Button
              asChild
              className="bg-black text-white font-bold text-xs uppercase tracking-widest px-10 py-6 rounded-sm hover:bg-revgreen hover:text-black transition-all shadow-xl"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Falar com um especialista
              </Link>
            </Button>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
              alt="Estratégias de crescimento"
              className="w-full h-auto rounded-sm shadow-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
