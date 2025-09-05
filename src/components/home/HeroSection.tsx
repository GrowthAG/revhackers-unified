import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StatsCounter from '@/components/shared/StatsCounter';
const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  return <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden mesh-background">
      {/* Apple-inspired Background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-revgreen/20 rounded-full blur-3xl animate-float glow-effect"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Floating badge with urgency */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-medium mb-8 animate-bounce-gentle shimmer-effect">
            <Sparkles className="w-4 h-4 mr-2 text-revgreen animate-pulse-soft" />
            <StatsCounter end={150} suffix=" empresas B2B" prefix="Confiado por +" />
          </div>
          
          {/* Main headline with Apple-style typography */}
          <h1 className="hero-text mb-8">
            <span className="inline-block animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>Transforme sua Operação</span>
            <br />
            <span className="inline-block animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>em uma Máquina de</span>
            <br />
            <span className="text-transparent bg-gradient-to-r from-revgreen to-green-400 bg-clip-text animate-glow inline-block animate-scale-in" style={{
            animationDelay: '0.6s'
          }}>Vendas Automática</span>
          </h1>
          
          {/* Subtitle with refined spacing */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed animate-scale-in-delayed">
            Conectamos marketing, vendas e CS em um único sistema<br />para acelerar seu crescimento com inteligência,<br />automações e foco total em resultados.
          </p>
          
          {/* Apple-style CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto animate-slideInRight">
            <Button asChild className="btn-primary text-lg h-16 px-12 group" size="lg">
              <Link to="/diagnostico" onClick={scrollToTop} className="flex items-center">
                Solicitar diagnóstico estratégico
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="btn-glass text-lg h-16 px-12 group" size="lg">
              <Link to="/cases" onClick={scrollToTop} className="flex items-center">
                Ver casos de sucesso
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {/* Social proof with elegant spacing */}
          <div className="mt-20 text-center animate-fade-in-delayed">
            <p className="text-base text-gray-400 mb-6">
              Empresas que já transformaram seu crescimento conosco
            </p>
            
            {/* Logos carousel - placeholder for now */}
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="w-24 h-12 bg-white/10 rounded-lg flex items-center justify-center text-xs font-medium">
                FMU Virtual
              </div>
              <div className="w-24 h-12 bg-white/10 rounded-lg flex items-center justify-center text-xs font-medium">
                Heineken
              </div>
              <div className="w-24 h-12 bg-white/10 rounded-lg flex items-center justify-center text-xs font-medium">
                TOEFL
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;