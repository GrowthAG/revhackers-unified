import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StatsCounter from '@/components/shared/StatsCounter';
const HeroSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  return <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden mesh-background py-8 md:py-12">
      {/* Apple-inspired Background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs - smaller on mobile */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-revgreen/20 rounded-full blur-3xl animate-float glow-effect"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Floating badge with urgency - mobile optimized */}
          <div className="inline-flex items-center px-3 py-2 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs md:text-sm font-medium mb-6 md:mb-8 animate-bounce-gentle shimmer-effect">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-revgreen animate-pulse-soft" />
            <StatsCounter end={150} suffix=" empresas B2B" prefix="Confiado por +" />
          </div>
          
          {/* Main headline with Apple-style typography - mobile optimized */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6 md:mb-8">
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
          
          {/* Subtitle with mobile-first design */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed animate-scale-in-delayed px-2">
            <span className="block sm:inline">Conectamos marketing, vendas e CS</span>
            <span className="hidden sm:inline"><br /></span>
            <span className="block sm:inline"> em um único sistema para acelerar</span>
            <span className="hidden sm:inline"><br /></span>
            <span className="block sm:inline"> seu crescimento com inteligência,</span>
            <span className="hidden sm:inline"><br /></span>
            <span className="block sm:inline"> automações e foco total em resultados.</span>
          </p>
          
          {/* Apple-style CTAs - mobile optimized */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 max-w-4xl mx-auto animate-slideInRight px-2">
            <Button asChild className="btn-primary text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-12 group w-full sm:w-auto" size="lg">
              <Link to="/diagnostico" onClick={scrollToTop} className="flex items-center justify-center">
                <span className="hidden sm:inline">Solicitar diagnóstico estratégico</span>
                <span className="sm:hidden">Diagnóstico estratégico</span>
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="btn-glass text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-12 group w-full sm:w-auto" size="lg">
              <Link to="/cases" onClick={scrollToTop} className="flex items-center justify-center">
                Ver casos de sucesso
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {/* Social proof with elegant spacing */}
          
        </div>
      </div>
    </section>;
};
export default HeroSection;