import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HoverScale, Magnetic } from '@/components/shared/PremiumMicroInteractions';

const PremiumHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Cases', path: '/cases' },
    { name: 'Materiais', path: '/materiais' },
    { name: 'Comunidade', path: '/comunidade' },
    { name: 'Quem Somos', path: '/quem-somos' },
    { name: 'Blog', path: '/blog' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-sm' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Magnetic>
            <HoverScale scale={1.05}>
              <Link to="/" onClick={scrollToTop} className="flex items-center">
                <span className="text-2xl font-bold text-foreground">
                  REVHACKERS
                </span>
              </Link>
            </HoverScale>
          </Magnetic>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Magnetic key={item.path} strength={15}>
                <Link
                  to={item.path}
                  onClick={scrollToTop}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
                    ${location.pathname === item.path
                      ? 'text-[#03FC3B] bg-black/5'
                      : 'text-foreground/70 hover:text-[#03FC3B] hover:bg-black/5'
                    }
                  `}
                >
                  {item.name}
                </Link>
              </Magnetic>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <HoverScale scale={1.02}>
              <Button asChild className="btn-primary">
                <Link to="/diagnostico" onClick={scrollToTop}>
                  Solicitar diagnóstico
                </Link>
              </Button>
            </HoverScale>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-black/5"
          >
            <div className="container-custom py-6">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => {
                        scrollToTop();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200
                        ${location.pathname === item.path
                          ? 'text-[#03FC3B] bg-black/5'
                          : 'text-foreground/70 hover:text-[#03FC3B] hover:bg-black/5'
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.1 }}
                  className="pt-4"
                >
                  <Button 
                    asChild 
                    className="btn-primary w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/diagnostico" onClick={scrollToTop}>
                      Solicitar diagnóstico
                    </Link>
                  </Button>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PremiumHeader;