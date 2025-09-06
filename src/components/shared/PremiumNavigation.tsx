import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverScale, Magnetic } from './PremiumMicroInteractions';

const PremiumNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Cases', path: '/cases' },
    { name: 'Materiais', path: '/materiais' },
    { name: 'Comunidade', path: '/comunidade' },
    { name: 'Quem Somos', path: '/quem-somos' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        w-full fixed top-0 left-0 right-0 z-[60] transition-all duration-500
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-premium border-b border-slate-200/50' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="container-custom flex justify-between items-center py-6">
        
        {/* Logo */}
        <Magnetic strength={30}>
          <Link to="/" className="group" onClick={scrollToTop}>
            <HoverScale scale={1.05}>
              <img 
                src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" 
                alt="RevHackers Logo" 
                className={`${isMobile ? 'h-10' : 'h-12'} w-auto transition-all duration-300`} 
              />
            </HoverScale>
          </Link>
        </Magnetic>
          
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Magnetic key={item.name} strength={15}>
              <Link 
                to={item.path} 
                className="relative px-4 py-2 font-medium text-slate-700 hover:text-slate-900 transition-colors group"
                onClick={scrollToTop}
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </Magnetic>
          ))}
        </nav>
        
        {/* CTA Button */}
        <div className="hidden lg:flex items-center">
          <HoverScale>
            <Button 
              asChild 
              className="btn-executive px-8 py-3 font-semibold"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Diagnóstico Estratégico
              </Link>
            </Button>
          </HoverScale>
        </div>
        
        {/* Mobile Menu Button */}
        <Magnetic strength={20}>
          <button 
            onClick={toggleMenu} 
            className="lg:hidden p-3 rounded-xl hover:bg-slate-100/50 transition-colors relative z-50"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} className="text-slate-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} className="text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </Magnetic>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-slate-200/50 shadow-2xl"
          >
            <div className="container-custom py-8">
              <div className="flex flex-col space-y-6">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link 
                      to={item.path} 
                      className="text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors py-3 block border-b border-slate-100/50" 
                      onClick={() => { toggleMenu(); scrollToTop(); }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="pt-4"
                >
                  <Button 
                    asChild 
                    className="btn-executive w-full py-4 text-lg font-semibold"
                  >
                    <Link to="/diagnostico" onClick={() => { toggleMenu(); scrollToTop(); }}>
                      Diagnóstico Estratégico
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PremiumNavigation;