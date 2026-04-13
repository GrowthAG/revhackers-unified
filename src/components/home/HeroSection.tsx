
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '47+',    label: 'empresas B2B' },
  { value: 'R$48M+', label: 'em vendas geradas' },
  { value: 'NPS 94', label: 'satisfação de clientes' },
];

const HeroSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden border-b border-white/6 pt-32 pb-20"
      style={{ background: '#0a0a0a' }}
    >
      {/* Background Sólido Brutalista sem degrades excessivos */}

      {/* Grid puntado com máscara radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-auto mb-auto">

        {/* Headline Original Layout */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 leading-[1.05] tracking-tighter w-full max-w-[90rem] mx-auto text-center flex flex-col items-center"
        >
          <span className="md:whitespace-nowrap">Aumente suas <span className="text-revgreen">Conversões em +10x</span></span>
          <span className="md:whitespace-nowrap mt-2">e Reduza Custos de Marketing e Vendas.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-zinc-400 mb-12 text-lg md:text-xl font-light text-balance leading-relaxed"
          style={{ maxWidth: '54ch' }}
        >
          Atraia 12x mais leads qualificados prontos para comprar. Reduza o tempo de atendimento para menos de 5 minutos e aumente sua conversão em até 10x com <strong className="text-white font-medium">Chatbot IA</strong>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto px-6 sm:px-0"
        >
          <Button asChild size="lg" variant="default" className="bg-revgreen text-black hover:bg-[#00A050] font-bold uppercase tracking-[0.1em] text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to="/booking" onClick={scrollToTop}>
              Aplicar para Implementação
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5 font-bold uppercase tracking-[0.1em] text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to="/score" onClick={scrollToTop}>
              Auditar Meu Vazamento
            </Link>
          </Button>
        </motion.div>

        {/* Social proof - metricas reais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.36, ease: 'easeOut' }}
          className="flex justify-center items-center border-t border-white/6 pt-8 w-full max-w-lg"
        >
          {stats.map((stat, i) => (
            <div key={stat.value} className="flex items-center">
              <div className="flex flex-col items-center px-8 py-2">
                <span
                  className="text-white font-bold text-lg leading-none"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-zinc-600 mt-1"
                  style={{ fontSize: '0.6875rem', letterSpacing: '0.04em' }}
                >
                  {stat.label}
                </span>
              </div>
              {i < stats.length - 1 && <div className="w-px h-8 bg-white/8" />}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;