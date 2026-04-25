
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/* ── Ilustracoes SVG por servico - estilo abstrato Supabase ── */
const illustrations = {
  tracao: (
    <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-30">
      <path d="M20 100 Q60 20 140 40" stroke="#00C060" strokeWidth="1.5" strokeDasharray="4 4"/>
      <circle cx="140" cy="40" r="4" fill="#00C060"/>
      <circle cx="20" cy="100" r="3" fill="#00C060" opacity="0.5"/>
      <circle cx="80" cy="55" r="2" fill="#00C060" opacity="0.4"/>
      <circle cx="110" cy="44" r="2" fill="#00C060" opacity="0.3"/>
      <line x1="0" y1="100" x2="160" y2="100" stroke="#ffffff" strokeWidth="0.5" opacity="0.1"/>
      <line x1="0" y1="70"  x2="160" y2="70"  stroke="#ffffff" strokeWidth="0.5" opacity="0.07"/>
      <line x1="0" y1="40"  x2="160" y2="40"  stroke="#ffffff" strokeWidth="0.5" opacity="0.07"/>
    </svg>
  ),
  crm: (
    <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-30">
      <rect x="20" y="20" width="36" height="26" rx="4" stroke="#00C060" strokeWidth="1.2"/>
      <rect x="66" y="20" width="36" height="26" rx="4" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <rect x="112" y="20" width="36" height="26" rx="4" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <rect x="43" y="72" width="36" height="26" rx="4" stroke="#00C060" strokeWidth="1.2" opacity="0.7"/>
      <rect x="89" y="72" width="36" height="26" rx="4" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <line x1="38" y1="46" x2="61" y2="72" stroke="#00C060" strokeWidth="0.8" opacity="0.5"/>
      <line x1="84" y1="46" x2="61" y2="72" stroke="#ffffff" strokeWidth="0.8" opacity="0.2"/>
      <line x1="84" y1="46" x2="107" y2="72" stroke="#ffffff" strokeWidth="0.8" opacity="0.2"/>
    </svg>
  ),
  automacao: (
    <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-30">
      <circle cx="80" cy="60" r="28" stroke="#00C060" strokeWidth="1.2" strokeDasharray="4 3"/>
      <circle cx="80" cy="60" r="16" stroke="#ffffff" strokeWidth="0.8" opacity="0.2"/>
      <circle cx="80" cy="60" r="5" fill="#00C060" opacity="0.8"/>
      <line x1="80" y1="20" x2="80" y2="32" stroke="#00C060" strokeWidth="1.2"/>
      <line x1="80" y1="88" x2="80" y2="100" stroke="#00C060" strokeWidth="1.2" opacity="0.5"/>
      <line x1="40" y1="60" x2="52" y2="60" stroke="#00C060" strokeWidth="1.2" opacity="0.5"/>
      <line x1="108" y1="60" x2="120" y2="60" stroke="#00C060" strokeWidth="1.2" opacity="0.5"/>
      <circle cx="80" cy="20" r="3" fill="#00C060"/>
      <circle cx="40" cy="60" r="2.5" fill="#00C060" opacity="0.6"/>
    </svg>
  ),
  founder: (
    <svg viewBox="0 0 160 120" fill="none" className="w-full h-full opacity-30">
      <circle cx="80" cy="40" r="18" stroke="#00C060" strokeWidth="1.2"/>
      <path d="M44 100 C44 76 116 76 116 100" stroke="#00C060" strokeWidth="1.2"/>
      <circle cx="35" cy="50" r="12" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <circle cx="125" cy="50" r="12" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <path d="M25 95 C25 79 45 79 45 95" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
      <path d="M115 95 C115 79 135 79 135 95" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  ),
};

const services = [
  {
    id: '01',
    title: 'IA + Vendas',
    subtitle: '& Personalização',
    desc: 'Usamos inteligência artificial para mandar a mensagem certa, para o decisor certo, na hora em que ele quer comprar.',
    link: '/servicos/tracao-midia-paga',
    visual: illustrations.tracao,
  },
  {
    id: '02',
    title: 'CRM Inteligente',
    subtitle: '& Dados',
    desc: 'Organizamos a casa. Fim das planilhas perdidas e achismos. Seu CRM passa a rastrear cada passo do lead sozinho.',
    link: '/servicos/ecossistema-crm',
    visual: illustrations.crm,
  },
  {
    id: '03',
    title: 'Automação B2B',
    subtitle: '& Eficiência',
    desc: 'Tiramos o trabalho braçal do vendedor. O sistema faz o follow-up; seu time só entra na ligação para fechar negócio.',
    link: '/servicos/automacao-inteligente',
    visual: illustrations.automacao,
  },
  {
    id: '04',
    title: 'Treinamento',
    subtitle: '& Prática Conjunta',
    desc: 'Não entregamos um PDF e sumimos. Sentamos junto com a sua equipe e ensinamos a operar a estratégia na vida real.',
    link: '/servicos/founder-led-growth',
    visual: illustrations.founder,
  },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const ServicesSection = () => {
  const scrollToTop = () => window.scrollTo(0, 0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative py-24 border-b border-white/6"
      style={{ background: '#0a0a0a' }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-label text-revgreen mb-4"
            >
              Como a Máquina Funciona
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="text-white text-balance"
              style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', maxWidth: '30ch' }}
            >
              Tecnologia que elimina trabalho chato.{' '}
              <span style={{ color: '#00C060' }}>Nós construímos e fazemos rodar.</span>
            </motion.h2>
          </div>
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <Link
              to="/servicos"
              onClick={scrollToTop}
              className="text-tiny font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
              style={{ letterSpacing: '0.04em' }}
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid Brutalista - Zero gaps, border-only, rounded-none */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/10 mt-12 bg-black">
          {services.map((service, i) => {
            // Assimetria de Bento Grid: 1º e 4º card ocupam 2 colunas, 2º e 3º ocupam 1.
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div
                key={service.id}
                variants={fadeUp}
                custom={3 + i}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className={`border-b border-r border-white/10 ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}`}
              >
                <Link
                  to={service.link}
                  onClick={scrollToTop}
                  className="group flex flex-col h-full p-8 lg:p-12 hover:bg-white/[0.02] transition-all duration-300 rounded-none relative overflow-hidden"
                  style={{ minHeight: isLarge ? '360px' : '320px' }}
                >
                  {/* Número estilo painel */}
                  <span
                    className="absolute top-6 right-6 text-zinc-800 text-metric text-xs group-hover:text-revgreen transition-colors"
                  >
                    [{service.id}]
                  </span>

                  {/* Ilustração SVG geométrica */}
                  <div className="h-24 mb-10 flex items-center justify-start opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-32 h-full"> 
                      {service.visual}
                    </div>
                  </div>

                  {/* Título */}
                  <h3
                    className="text-white font-black mb-2 uppercase tracking-widest group-hover:text-revgreen transition-colors duration-200"
                    style={{ fontSize: '1.25rem' }}
                  >
                    {service.title}
                  </h3>
                  <span className="text-label text-zinc-500 mb-4 block">
                    {service.subtitle}
                  </span>

                  {/* Descrição */}
                  <p className="text-zinc-400 text-[0.875rem] leading-[1.6] text-reading flex-1">
                    {service.desc}
                  </p>

                  {/* CTA do card - Terminal arrow */}
                  <div className="mt-8 flex items-center gap-2 text-zinc-500 group-hover:text-revgreen transition-colors text-label">
                    <span>Acessar</span>
                    <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
