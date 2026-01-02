
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 uppercase leading-none">
              Vamos crescer <span className="text-revgreen">juntos?</span>
            </h2>

            <p className="text-xl text-gray-600 font-medium tracking-tight">
              Agende uma conversa com nossos especialistas e descubra como podemos
              ajudar sua empresa a escalar resultados de forma sustentável.
            </p>

            <Button
              asChild
              className="bg-white text-black font-bold text-xs uppercase tracking-widest px-10 py-6 rounded-sm hover:bg-revgreen hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
              className="w-full h-auto rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
