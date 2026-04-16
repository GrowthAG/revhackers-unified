
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

        {/* Badge de contexto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.0, ease: 'easeOut' }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-zinc-400 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-revgreen animate-pulse" />
            Revenue Operations · B2B High-Ticket
          </span>
        </motion.div>

        {/* Headline com posicionamento RevOps */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 leading-[1.05] tracking-tighter w-full max-w-[90rem] mx-auto text-center flex flex-col items-center"
        >
          <span className="md:whitespace-nowrap">A Infraestrutura de Receita</span>
          <span className="md:whitespace-nowrap mt-2">que B2Bs de Alto Ticket <span className="text-revgreen">Precisam.</span></span>
        </motion.h1>

        {/* Subheadline — foco no resultado, não no feature */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-zinc-400 mb-12 text-lg md:text-xl font-light text-balance leading-relaxed"
          style={{ maxWidth: '54ch' }}
        >
          Integramos <strong className="text-white font-medium">CRM, IA e Automações</strong> para eliminar os vazamentos silenciosos que travam o crescimento da sua operação comercial — sem precisar contratar mais vendedores.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto px-6 sm:px-0"
        >
          <Button asChild size="lg" variant="default" className="bg-revgreen text-black hover:bg-[#00A050] font-bold uppercase tracking-[0.1em] text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to="/booking" onClick={scrollToTop}>
              Auditar Minha Operação
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5 font-bold uppercase tracking-[0.1em] text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to="/cases" onClick={scrollToTop}>
              Ver Resultados Reais
            </Link>
          </Button>
        </motion.div>

        {/* Social proof: logos compactos acima dos stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.30, ease: 'easeOut' }}
          className="w-full max-w-2xl mb-8"
        >
          <p className="text-zinc-600 text-xs uppercase tracking-[0.25em] font-bold mb-5 text-center">
            Líderes de mercado que confiam
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-40">
            {[
              { name: 'Heineken', logo: '/uploads/aada4820-3f12-4185-9af6-811f30795a93.png', scale: 1.0 },
              { name: 'FMU', logo: '/uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png', scale: 1.0 },
              { name: 'Emagrecentro', logo: '/uploads/emagrecentro-logo-new.png', scale: 1.2 },
              { name: 'Tegra', logo: '/uploads/tegra-logo-new.png', scale: 1.2 },
              { name: 'Cruzeiro do Sul', logo: '/uploads/cruzeiro-sul-logo-v3.png', scale: 1.5 },
            ].map((p) => (
              <img
                key={p.name}
                src={p.logo}
                alt={p.name}
                className="h-6 w-auto object-contain grayscale invert"
                style={{ transform: `scale(${p.scale})` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Social proof - metricas reais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.40, ease: 'easeOut' }}
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