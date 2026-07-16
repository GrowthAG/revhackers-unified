
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';
import ModernTechnicalBackground from '@/components/shared/ModernTechnicalBackground';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Section variant="dark" className="relative pt-24 pb-20 md:pt-32 md:pb-32 min-h-[90vh] flex flex-col justify-center items-center border-b border-white/10 overflow-hidden">

      {/* Modern Hacker Aesthetic Background */}
      <ModernTechnicalBackground />

      <div className="container-custom flex flex-col items-center text-center max-w-5xl relative z-10">

        {/* Badge - Intelligent Positioning - UPDATED TEXT */}
        {/* Badge - Premium Corporate Style (No Vibe Code) */}
        <div className="mb-8 flex items-center justify-center animate-fade-in">
          <span className="text-xs md:text-sm font-medium text-white tracking-wide">
            Consultoria Especializada em Revenue B2B
          </span>
        </div>

        {/* Headline - Reduced Size from 8xl/7xl to 6xl/7xl for better balance */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
          <span className="block md:inline">Sua Estratégia B2B</span>{" "}
          <br className="hidden md:block" />
          <span className="text-zinc-500 block md:inline">Precisa de Inteligência.</span>
        </h1>

        {/* Subheadline - Keeping same logic */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl leading-relaxed font-light text-balance">
          Gerar demanda não é sorte. É <span className="text-white">Engenharia de Receita</span>.
          Unificamos <span className="text-white">CRO, Automação e Mídia Paga</span> para transformar operações caóticas em sistemas previsíveis.
        </p>

        {/* Buttons - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Link
            to="/diagnostico"
            onClick={scrollToTop}
            className="btn-green-flat inline-flex items-center justify-center min-w-[200px]"
          >
            Diagnóstico Estratégico
          </Link>

          <Link
            to="/metodologia"
            onClick={scrollToTop}
            className="btn-outline-flat inline-flex items-center justify-center min-w-[200px]"
          >
            Ver Nossa Metodologia
          </Link>
        </div>

        {/* Expertise Pillars - Minimalist */}
        <div className="w-full mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-zinc-500 tracking-wide">
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
    </Section>
  );
};

export default HeroSection;