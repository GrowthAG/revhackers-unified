import { motion } from 'framer-motion';
import { Reveal, HoverScale } from '@/components/shared/PremiumMicroInteractions';
import StatsCounter from '@/components/shared/StatsCounter';

const PremiumStatsSection = () => {
  const stats = [
    {
      value: 124,
      suffix: '+',
      label: 'Empresas B2B atendidas',
      description: 'Em diversos segmentos e portes',
      gradient: 'from-[#03FC3B] to-[#02E635]'
    },
    {
      value: 26,
      suffix: '%',
      label: 'Aumento médio em vendas',
      description: 'Nos primeiros 6 meses de implementação',
      gradient: 'from-[#02E635] to-[#01D42A]'
    },
    {
      value: 4,
      suffix: 'x',
      label: 'Retorno médio',
      description: 'Multiplicação dos resultados no primeiro ano',
      gradient: 'from-[#01D42A] to-[#01C325]'
    },
    {
      value: 1,
      suffix: 'h',
      label: 'Tempo médio de resposta',
      description: 'Para diagnósticos e propostas comerciais',
      gradient: 'from-[#01C325] to-[#03FC3B]'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Reveal direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Resultados que entregamos
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Números que mostram o impacto real que geramos
            </p>
          </Reveal>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Reveal key={index} direction="up" delay={index * 0.1}>
              <HoverScale>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="card-depth text-center group"
                >
                  {/* Stat Number */}
                  <div className="mb-4">
                    <div className={`text-6xl md:text-7xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      <StatsCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                  </div>

                  {/* Stat Label */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {stat.label}
                  </h3>

                  {/* Stat Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Hover Effect Line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '3rem' }}
                    transition={{ duration: 0.3 }}
                    className={`h-1 bg-gradient-to-r ${stat.gradient} rounded-full mx-auto mt-4`}
                  />
                </motion.div>
              </HoverScale>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal direction="up" delay={0.6}>
          <div className="text-center mt-16">
            <motion.p 
              className="text-lg text-muted-foreground"
              whileHover={{ scale: 1.02 }}
            >
              Quer ser o próximo case de sucesso?{' '}
              <motion.span 
                className="text-[#03FC3B] font-semibold cursor-pointer"
                whileHover={{ color: '#02E635' }}
              >
                Fale conosco
              </motion.span>
            </motion.p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PremiumStatsSection;