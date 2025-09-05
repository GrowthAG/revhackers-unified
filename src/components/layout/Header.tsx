
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/50 fixed top-0 left-0 right-0 z-[60] transition-all duration-300">
      <div className="container-custom flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="mr-12 group" onClick={scrollToTop}>
            <img 
              src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" 
              alt="RevHackers Logo" 
              className={`${isMobile ? 'h-12' : 'h-16'} w-auto transition-all duration-300 group-hover:scale-105`} 
            />
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            <Link to="/" className="nav-link" onClick={scrollToTop}>Home</Link>
            <Link to="/servicos" className="nav-link" onClick={scrollToTop}>Serviços</Link>
            <Link to="/cases" className="nav-link" onClick={scrollToTop}>Cases</Link>
            <Link to="/materiais" className="nav-link" onClick={scrollToTop}>Materiais</Link>
            <Link to="/comunidade" className="nav-link" onClick={scrollToTop}>Comunidade</Link>
            <Link to="/quem-somos" className="nav-link whitespace-nowrap" onClick={scrollToTop}>Quem Somos</Link>
            <Link to="/blog" className="nav-link" onClick={scrollToTop}>Blog</Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild variant="default" size="lg" className="rounded-full px-8">
            <Link to="/diagnostico" onClick={scrollToTop}>
              Solicitar diagnóstico
            </Link>
          </Button>
        </div>
        
        <button 
          onClick={toggleMenu} 
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu with Apple-style blur */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl w-full shadow-xl border-t border-gray-100/50 animate-fadeIn">
          <div className="container-custom py-6 flex flex-col space-y-6">
            <Link 
              to="/" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Home
            </Link>
            <Link 
              to="/servicos" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Serviços
            </Link>
            <Link 
              to="/cases" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Cases
            </Link>
            <Link 
              to="/materiais" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Materiais
            </Link>
            <Link 
              to="/comunidade" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Comunidade
            </Link>
            <Link 
              to="/quem-somos" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Quem Somos
            </Link>
            <Link 
              to="/blog" 
              className="text-lg font-medium text-gray-800 hover:text-revgreen transition-colors py-2" 
              onClick={() => { toggleMenu(); scrollToTop(); }}
            >
              Blog
            </Link>
            <Button asChild variant="default" size="lg" className="w-full mt-6 rounded-full">
              <Link to="/diagnostico" onClick={() => { toggleMenu(); scrollToTop(); }}>
                Solicitar diagnóstico
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
