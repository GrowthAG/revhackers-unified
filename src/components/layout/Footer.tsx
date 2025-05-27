
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Linkedin, Mail } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';

const Footer = () => {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  // Scroll to top function for internal links
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <footer className="bg-black text-white">
      <div className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo and company info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img 
                  src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" 
                  alt="RevHackers Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                Ajudamos empresas a escalarem com inteligência através de automação, estratégia,
                crescimento e inovação.
              </p>
              <div className="flex space-x-4 mb-8">
                <a href="https://www.linkedin.com/company/34579614/" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-revgreen hover:border-revgreen transition-colors duration-300">
                  <Linkedin size={20} />
                </a>
                <a href="https://www.instagram.com/revhackers.com.br/" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-revgreen hover:border-revgreen transition-colors duration-300">
                  <Instagram size={20} />
                </a>
                <a href="https://www.youtube.com/@RevHackersTV" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-revgreen hover:border-revgreen transition-colors duration-300">
                  <Youtube size={20} />
                </a>
                <a href="mailto:contato@revhackers.com.br" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 border border-gray-600 rounded flex items-center justify-center text-gray-300 hover:text-revgreen hover:border-revgreen transition-colors duration-300">
                  <Mail size={20} />
                </a>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-6">Navegação</h3>
              <ul className="space-y-3">
                <li><Link to="/" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Home</Link></li>
                <li><Link to="/cases" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Cases</Link></li>
                <li><Link to="/quem-somos" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Quem Somos</Link></li>
              </ul>
            </div>
            
            {/* Content */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-6">Conteúdo</h3>
              <ul className="space-y-3">
                <li><Link to="/blog" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Blog</Link></li>
                <li><Link to="/servicos" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Serviços</Link></li>
                <li><Link to="/materiais" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Materiais</Link></li>
                <li><Link to="/comunidade" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Comunidade</Link></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
              <NewsletterForm />
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-6 md:mb-0 text-center md:text-left">
              © {currentYear} RevHackers. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
              <Link to="/privacidade" onClick={scrollToTop} className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Política de Privacidade</Link>
              <Link to="/termos-de-uso" onClick={scrollToTop} className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Termos de Uso</Link>
              <a 
                href="https://growthfunnels.com.br/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
              >
                Growth Funnels
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
