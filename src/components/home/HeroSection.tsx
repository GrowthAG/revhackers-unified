
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';
import ModernTechnicalBackground from '@/components/shared/ModernTechnicalBackground';

const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Section variant="dark" className="relative pt-32 pb-20 md:pt-48 md:pb-32 min-h-[90vh] flex flex-col justify-center items-center border-b border-white/10 overflow-hidden">

      {/* Modern Hacker Aesthetic Background */}
      <ModernTechnicalBackground />

      <div className="w-full px-4 flex flex-col items-center text-center relative z-10">

        {/* Badge - Intelligent Positioning - UPDATED TEXT */}
        {/* Badge - Premium Corporate Style (No Vibe Code) */}
        <div className="mb-8 flex items-center justify-center animate-fade-in">
          <span className="text-xs md:text-sm font-medium text-white tracking-wide uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Estratégia Inovadora de Inbound + IA CRM e Automações
          </span>
        </div>

        {/* Headline - Strictly 2 lines V5 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight w-full max-w-[90rem] mx-auto">
          <span className="md:whitespace-nowrap">Aumente suas <span className="text-revgreen">Conversões em +10x</span></span> <br className="hidden md:block" />
          <span className="md:whitespace-nowrap">e Reduza Custos de Marketing e Vendas.</span>
        </h1>

        {/* Subheadline - Stronger synergy, no generic science */}
        <p className="text-lg md:text-xl text-zinc-200 mb-12 max-w-5xl leading-relaxed font-light text-balance">
          Atraia <strong className="text-white font-medium">12x mais leads qualificados</strong> prontos para comprar. Reduza o tempo de atendimento para menos de 5 minutos e aumente sua conversão em até <strong className="text-white font-medium">10x</strong> com Chatbot IA.
        </p>

        {/* Buttons - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Link
            to="/diagnostico"
            onClick={scrollToTop}
            className="btn-green-flat inline-flex items-center justify-center min-w-[200px]"
          >
            Diagnóstico Grátis
          </Link>

          <Link
            to="/quem-somos"
            onClick={scrollToTop}
            className="btn-outline-flat inline-flex items-center justify-center min-w-[200px]"
          >
            Conheça a RevHackers
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