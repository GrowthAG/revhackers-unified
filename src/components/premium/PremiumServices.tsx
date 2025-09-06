import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Users, 
  BarChart3, 
  Rocket, 
  Shield, 
  ArrowRight 
} from 'lucide-react';
import { Reveal, HoverScale } from '@/components/shared/PremiumMicroInteractions';
import PremiumCard from './PremiumCard';

const PremiumServices = () => {
  const services = [
    {
      icon: Zap,
      title: 'Revenue Operations',
      description: 'Conectamos marketing, vendas e CS em um único sistema otimizado para máxima eficiência e crescimento acelerado.',
      features: ['Automação de processos', 'Dashboards inteligentes', 'Alinhamento de times'],
      gradient: 'from-[#03FC3B] to-[#02E635]'
    },
    {
      icon: Target,
      title: 'Growth Hacking',
      description: 'Estratégias baseadas em dados para escalar rapidamente, testando e otimizando cada ponto do funil.',
      features: ['Experimentos A/B', 'Growth loops', 'Métricas de crescimento'],
      gradient: 'from-[#02E635] to-[#01D42A]'
    },
    {
      icon: Users,
      title: 'Customer Success',
      description: 'Reduzimos churn e aumentamos LTV com estratégias de retenção e expansão de contas.',
      features: ['Redução de churn', 'Expansão de contas', 'Health scores'],
      gradient: 'from-[#01D42A] to-[#01C325]'
    },
    {
      icon: BarChart3,
      title: 'Data & Analytics',
      description: 'Transformamos dados em insights acionáveis para decisões mais inteligentes e resultados previsíveis.',
      features: ['Business Intelligence', 'Relatórios customizados', 'Previsões de vendas'],
      gradient: 'from-[#01C325] to-[#00B220]'
    },
    {
      icon: Rocket,
      title: 'Automação de Marketing',
      description: 'Campanhas inteligentes que nutrem leads, qualificam prospects e aceleram o ciclo de vendas.',
      features: ['Lead scoring', 'Email marketing', 'Campanhas multicanal'],
      gradient: 'from-[#00B220] to-[#00A11C]'
    },
    {
      icon: Shield,
      title: 'Consultoria Estratégica',
      description: 'Diagnóstico completo e estratégia personalizada para alavancar seus resultados a curto e longo prazo.',
      features: ['Diagnóstico 360°', 'Roadmap estratégico', 'Acompanhamento mensal'],
      gradient: 'from-[#00A11C] to-[#03FC3B]'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <Reveal direction="up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#03FC3B]/10 border border-[#03FC3B]/20 text-sm font-medium text-[#03FC3B] mb-6">
              Nossos Serviços
            </div>
          </Reveal>
          
          <Reveal direction="up" delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Como aceleramos seu crescimento
            </h2>
          </Reveal>
          
          <Reveal direction="up" delay={0.4}>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Soluções integradas que conectam pessoas, processos e tecnologia 
              para transformar sua operação em uma máquina de crescimento.
            </p>
          </Reveal>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <PremiumCard 
              key={index} 
              variant="float" 
              delay={index * 0.1}
              className="group relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`} />
              
              {/* Icon */}
              <div className="relative mb-6">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${service.gradient}`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative space-y-4">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-[#03FC3B] transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 text-sm">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} mr-3 flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="pt-4"
                >
                  <div className="flex items-center text-[#03FC3B] font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                    <span className="text-sm">Saiba mais</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              </div>

              {/* Hover Effect Line */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${service.gradient} rounded-b-3xl`}
              />
            </PremiumCard>
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal direction="up" delay={0.8}>
          <div className="text-center mt-20">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center space-x-4 p-8 rounded-3xl bg-gradient-to-r from-[#03FC3B]/5 to-[#02E635]/5 border border-[#03FC3B]/10"
            >
              <div className="text-3xl">💡</div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  Não sabe por onde começar?
                </h4>
                <p className="text-muted-foreground">
                  Solicite um diagnóstico gratuito e descubra as melhores oportunidades para sua empresa
                </p>
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                className="text-[#03FC3B]"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PremiumServices;