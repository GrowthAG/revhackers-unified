
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { buildBookingUrl } from '@/utils/utm';

import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 47, suffix: '+',    label: 'empresas B2B' },
  { value: 48, prefix: 'R$', suffix: 'M+', label: 'em vendas geradas' },
  { prefix: 'NPS ', value: 94, label: 'satisfação de clientes' },
];

const HeroSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden border-b border-black/5 pt-32 pb-20 bg-white"
    >
      {/* Absolute background image ou grid limpo se necessário (removido para pureza 'ultra clean') */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-auto mb-auto">

        {/* Badge superior (Micro Label) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex justify-center mb-8 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-zinc-900" />
            <span className="text-label text-zinc-900">REVENUE OPERATIONS // B2B</span>
          </div>
        </motion.div>

        {/* Headline com posicionamento RevOps */}
        {/* Headline Consultiva */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#111111] mb-6 leading-[1.05] tracking-tight w-full max-w-5xl mx-auto text-center text-balance relative z-10"
        >
          Escale as suas vendas. Simplifique a sua operação.
        </motion.h1>

        {/* Subheadline — Clean & Focused */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-zinc-600 mb-10 text-lg md:text-[1.125rem] font-medium leading-[1.6] text-reading mx-auto text-center relative z-10"
        >
          A única assessoria estratégica capaz de unificar <strong>Processos, Automações, IA e CRM</strong>.<br className="hidden md:block"/>Faça sua operação B2B abandonar a força bruta e lucrar através da Engenharia de Receita pura.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto px-6 sm:px-0"
        >
          <Button asChild size="lg" variant="default" className="bg-revgreen text-black hover:bg-[#00A050] font-bold uppercase tracking-widest text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to={buildBookingUrl('homepage', 'hero_primary')} onClick={scrollToTop}>
              Auditar Minha Operação
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-black/10 text-zinc-900 hover:bg-black/5 font-bold uppercase tracking-widest text-xs h-14 px-8 w-full sm:w-auto rounded-none">
            <Link to="/cases" onClick={scrollToTop}>
              Ver Resultados Reais
            </Link>
          </Button>
        </motion.div>



        {/* Social proof - metricas reais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.40, ease: 'easeOut' }}
          className="flex justify-center items-center border-t border-black/5 pt-8 w-full max-w-lg"
        >
          {stats.map((stat, i) => (
            <div key={stat.value} className="flex items-center">
              <div className="flex flex-col items-center px-8 py-2">
                {typeof stat.value === 'number' ? (
                  <NumberTicker 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    prefix={stat.prefix} 
                    className="text-zinc-900 font-bold text-xl leading-none text-metric" 
                  />
                ) : (
                  <span
                    className="text-zinc-900 font-bold text-xl leading-none text-metric"
                  >
                    {stat.value}
                  </span>
                )}
                <span className="text-label text-zinc-400 mt-2 text-center block">
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