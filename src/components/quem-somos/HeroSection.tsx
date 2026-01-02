import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-black">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-none mb-8 tracking-tighter uppercase text-white animate-fade-in">
            Somos a <span className="text-revgreen inline-block align-baseline">RevHackers</span>.
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-10 font-normal tracking-tight leading-relaxed text-balance">
            Transformamos estratégias de marketing B2B através de funis de vendas otimizados, automações inteligentes e integração entre times de receita.
          </p>

          <Button asChild className="bg-white text-black px-8 py-6 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-revgreen hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Conheça nossa metodologia
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;