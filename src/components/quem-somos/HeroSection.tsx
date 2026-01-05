import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ModernTechnicalBackground from '@/components/shared/ModernTechnicalBackground';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 min-h-[90vh] flex flex-col justify-center items-center border-b border-white/10 overflow-hidden bg-black text-center">
      {/* Modern Hacker Aesthetic Background */}
      <ModernTechnicalBackground />

      <div className="w-full px-4 flex flex-col items-center text-center relative z-10">
        {/* Headline - Parity with Home (3 lines, sentence case) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight w-full max-w-[90rem] mx-auto">
          Construímos a <span className="text-revgreen">Arquitetura de Receita</span> <br className="hidden md:block" />
          que sustenta o seu próximo <br className="hidden md:block" />
          nível de escala.
        </h1>

        {/* Subheadline - Parity with Home */}
        <p className="text-lg md:text-xl text-zinc-200 mb-12 max-w-5xl leading-relaxed font-light text-balance mx-auto">
          Unificamos Marketing, Vendas e Customer Success através de processos <br className="hidden md:block" />
          cirúrgicos, automações inteligentes e ciência de dados.
        </p>

        {/* Buttons - Single as requested */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Button asChild className="bg-white text-black h-16 px-12 rounded-none text-xs font-black uppercase tracking-[0.3em] hover:bg-revgreen hover:text-black transition-all duration-300">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Conhecer a Metodologia //
            </Link>
          </Button>
        </div>

        {/* Expertise Pillars - Minimalist */}
        <div className="w-full mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-zinc-500 tracking-wide uppercase">
            <span>Geração de Demanda</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>Automação & CRM</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>CRO & Analytics</span>
            <span className="hidden md:inline text-zinc-800">•</span>
            <span>RevOps</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;