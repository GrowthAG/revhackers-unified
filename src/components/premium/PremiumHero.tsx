import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HoverScale, Reveal, Magnetic } from '@/components/shared/PremiumMicroInteractions';
import StatsCounter from '@/components/shared/StatsCounter';

const PremiumHero = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2303FC3B' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#03FC3B]/10 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#03FC3B]/8 rounded-full blur-3xl"
        />

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white">
        
        {/* Social Proof Badge */}
        <Reveal direction="up" delay={0.2}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#03FC3B]" />
            <span>Confiado por +149 empresas B2B</span>
          </motion.div>
        </Reveal>

        {/* Main Headline */}
        <div className="max-w-5xl mx-auto">
          <Reveal direction="up" delay={0.4}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              <span className="block">Transforme sua Operação</span>
              <span className="block">em uma Máquina de</span>
              <span className="block">
                <span className="text-transparent bg-gradient-to-r from-[#03FC3B] to-[#02E635] bg-clip-text">
                  Vendas Automática
                </span>
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={0.6}>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Conectamos marketing, vendas e CS em um único sistema para acelerar 
              seu crescimento com inteligência, automações e foco total em resultados.
            </p>
          </Reveal>
        </div>

        {/* CTA Buttons */}
        <Reveal direction="up" delay={0.8}>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
            <HoverScale scale={1.02}>
              <Magnetic strength={8}>
                <Button asChild className="btn-primary text-lg h-16 px-12 group shadow-lg hover:shadow-xl">
                  <Link to="/diagnostico" onClick={scrollToTop} className="flex items-center">
                    Solicitar diagnóstico estratégico
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
            </HoverScale>
            
            <HoverScale scale={1.02}>
              <Magnetic strength={8}>
                <Button variant="outline" asChild className="btn-secondary text-lg h-16 px-12 group">
                  <Link to="/cases" onClick={scrollToTop} className="flex items-center">
                    Ver casos de sucesso
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
            </HoverScale>
          </div>
        </Reveal>

        {/* Interactive Scroll Indicator */}
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-12 rounded-full border-2 border-white/30 flex justify-center cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumHero;