
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ContactForm from '../shared/ContactForm';

const ContactFormSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative py-32 border-t border-white/6"
      style={{ background: '#0a0a0a' }}
    >
      {/* Top border line */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-white/6"
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">

          {/* Left - copy de autoridade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:sticky lg:top-32 pt-2"
          >
            <p
              className="text-revgreen text-tiny uppercase font-medium mb-6"
              style={{ letterSpacing: '0.06em' }}
            >
              Inicie o Protocolo
            </p>
            <h2
              className="text-white mb-6"
              style={{
                fontSize: 'clamp(2rem, 3vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
              }}
            >
              Montamos sua operação de vendas{' '}
              <span style={{ color: '#00C060' }}>do zero à escala.</span>
            </h2>
            <p className="text-zinc-500 leading-relaxed font-light mb-12" style={{ maxWidth: '36ch' }}>
              Nossa infraestrutura não é para todos. Desenhamos arquiteturas comerciais pesadas para
              empresas que buscam dominar o mercado com precisão.
            </p>

            {/* Steps */}
            <div className="space-y-8">
              {[
                { n: '01', title: 'Diagnóstico', desc: 'Auditoria completa de tracking, CRM e atribuição.' },
                { n: '02', title: 'Roadmap',     desc: 'Plano de 90 dias focado em eficiência e escala.' },
                { n: '03', title: 'Execução',    desc: 'Time especializado implementando cada protocolo.' },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-5">
                  <span
                    className="text-zinc-700 font-mono text-xs pt-0.5 shrink-0"
                    style={{ letterSpacing: '0.04em' }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">{step.title}</p>
                    <p className="text-zinc-600 text-sm font-light leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/6">
              <p className="text-zinc-700 text-tiny" style={{ letterSpacing: '0.04em' }}>
                Agenda Q2 2026 · <span className="text-zinc-400">Vagas limitadas</span>
              </p>
            </div>
          </motion.div>

          {/* Right - formulario */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <div
              className="border border-white/8 p-8 md:p-10 rounded-sm"
              style={{ background: '#111111' }}
            >
              <div className="mb-8">
                <h3
                  className="text-white font-semibold mb-2"
                  style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}
                >
                  Solicitar Análise
                </h3>
                <p className="text-zinc-500 text-sm font-light">
                  Preencha para análise técnica de perfil. Resposta em 24h.
                </p>
              </div>

              <ContactForm formType="contact" variant="dark" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
