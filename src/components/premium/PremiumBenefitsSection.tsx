import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, BarChart3, Award, Clock } from 'lucide-react';
import { Reveal, HoverScale } from '@/components/shared/PremiumMicroInteractions';
import PremiumCard from './PremiumCard';

const PremiumBenefitsSection = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Crescimento Acelerado',
      description: 'Aumente sua receita recorrente em média 32% nos primeiros 6 meses com nossas estratégias de Revenue Operations.',
      gradient: 'from-[#03FC3B] to-[#02E635]'
    },
    {
      icon: Users,
      title: 'Alinhamento de Times',
      description: 'Elimine silos entre marketing, vendas e CS, criando uma experiência fluida para seu cliente e reduzindo atrito interno.',
      gradient: 'from-[#02E635] to-[#01D42A]'
    },
    {
      icon: Target,
      title: 'Previsibilidade de Resultados',
      description: 'Obtenha visibilidade clara sobre seu funil de vendas com dashboards inteligentes e métricas consistentes entre departamentos.',
      gradient: 'from-[#01D42A] to-[#01C325]'
    },
    {
      icon: BarChart3,
      title: 'Redução de Churn',
      description: 'Nossos clientes reduzem em média 24% a taxa de cancelamento ao implementar nossas estratégias de RevOps.',
      gradient: 'from-[#01C325] to-[#00B220]'
    },
    {
      icon: Award,
      title: 'Resultados Concretos',
      description: 'Retorno médio de 5x sobre o investimento em nossas soluções, com casos de sucesso em diversos segmentos B2B.',
      gradient: 'from-[#00B220] to-[#00A11C]'
    },
    {
      icon: Clock,
      title: 'Implementação Rápida',
      description: 'Primeiros resultados visíveis em 30-45 dias, com metodologia estruturada e equipe técnica especializada.',
      gradient: 'from-[#00A11C] to-[#03FC3B]'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <Reveal direction="up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#03FC3B]/10 border border-[#03FC3B]/20 text-sm font-medium text-[#03FC3B] mb-6">
              Por que escolher a RevHackers?
            </div>
          </Reveal>
          
          <Reveal direction="up" delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Por que escolher a RevHackers?
            </h2>
          </Reveal>
          
          <Reveal direction="up" delay={0.4}>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Entendemos suas dúvidas e desafios. Veja como nossa abordagem resolve os principais 
              pontos de dor de empresas B2B que buscam crescimento sustentável.
            </p>
          </Reveal>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <PremiumCard 
              key={index} 
              variant="depth" 
              delay={index * 0.1}
              className="group"
            >
              {/* Icon */}
              <div className="mb-6">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${benefit.gradient}`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-[#03FC3B] transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Hover Effect */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '4rem' }}
                transition={{ duration: 0.3 }}
                className={`h-1 bg-gradient-to-r ${benefit.gradient} rounded-full mt-6`}
              />
            </PremiumCard>
          ))}
        </div>

        {/* Bottom Section */}
        <Reveal direction="up" delay={0.8}>
          <div className="text-center mt-20">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center space-x-4 p-6 rounded-2xl bg-gradient-to-r from-[#03FC3B]/10 to-[#02E635]/10 border border-[#03FC3B]/20"
            >
              <div className="text-2xl">🚀</div>
              <div className="text-left">
                <h4 className="font-semibold text-foreground">Pronto para acelerar?</h4>
                <p className="text-sm text-muted-foreground">
                  Vamos descobrir como podemos potencializar seus resultados
                </p>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PremiumBenefitsSection;