import { motion } from 'framer-motion';
import { ArrowRight, Award, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ExecutiveBackground from '@/components/shared/ExecutiveBackground';
import SimpleThree3DElement from '@/components/shared/Three3DElement';
import PremiumFloatingCard from '@/components/shared/PremiumFloatingCard';

const PremiumHeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const stats = [
    { icon: TrendingUp, value: "+340%", label: "ROI Médio", delay: 0.2 },
    { icon: Target, value: "150+", label: "Empresas Transformadas", delay: 0.4 },
    { icon: Award, value: "98%", label: "Taxa de Satisfação", delay: 0.6 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Executive Background */}
      <ExecutiveBackground />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <SimpleThree3DElement />
      </div>
      
      <div className="container-custom relative z-10 w-full pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-medium mb-8">
                <Award className="w-4 h-4 mr-2 text-blue-400" />
                Consultoria Estratégica Premium
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
            >
              Transformamos
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Operações
              </span>
              <br />
              em Resultados
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 mb-12 leading-relaxed max-w-lg"
            >
              Metodologia proprietária que conecta marketing, vendas e customer success 
              para acelerar crescimento sustentável com inteligência de dados.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Button 
                asChild 
                className="btn-executive text-lg h-16 px-10"
                size="lg"
              >
                <Link to="/diagnostico" onClick={scrollToTop}>
                  Diagnóstico Estratégico
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                className="btn-glass text-lg h-16 px-10"
                size="lg"
              >
                <Link to="/cases" onClick={scrollToTop}>
                  Resultados Comprovados
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Stats Cards */}
          <div className="space-y-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <PremiumFloatingCard 
                  key={index} 
                  delay={stat.delay}
                  className="p-8"
                >
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-800 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-slate-600 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </PremiumFloatingCard>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-400 mb-8 text-lg">
            Confiado por empresas que buscam excelência operacional
          </p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {/* Company logos would go here */}
            <div className="w-32 h-8 bg-white/20 rounded-lg backdrop-blur-xl"></div>
            <div className="w-32 h-8 bg-white/20 rounded-lg backdrop-blur-xl"></div>
            <div className="w-32 h-8 bg-white/20 rounded-lg backdrop-blur-xl"></div>
            <div className="w-32 h-8 bg-white/20 rounded-lg backdrop-blur-xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumHeroSection;