
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Linkedin, Mail, Shield, FileText, ExternalLink } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';

const Footer = () => {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  // Scroll to top function for internal links
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <footer className="bg-black text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Logo and company info */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6" onClick={scrollToTop}>
              <img 
                src="/lovable-uploads/9ca1f8d0-c9e9-4d69-b887-0617fbde8ec6.png" 
                alt="RevHackers Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-gray-300 max-w-sm mb-8">
              Ajudamos empresas a escalarem com inteligência através de automação, estratégia,
              crescimento e inovação.
            </p>
            <div className="flex space-x-5 mb-8">
              <a href="https://www.linkedin.com/company/34579614/" target="_blank" rel="noopener noreferrer" 
                className="text-gray-300 hover:text-revgreen transition-colors duration-300 p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/revhackers.com.br/" target="_blank" rel="noopener noreferrer" 
                className="text-gray-300 hover:text-revgreen transition-colors duration-300 p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@RevHackersTV" target="_blank" rel="noopener noreferrer" 
                className="text-gray-300 hover:text-revgreen transition-colors duration-300 p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <Youtube size={20} />
              </a>
              <a href="mailto:contato@revhackers.com.br" target="_blank" rel="noopener noreferrer" 
                className="text-gray-300 hover:text-revgreen transition-colors duration-300 p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Navegação</h3>
            <ul className="space-y-4">
              <li><Link to="/" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Home</Link></li>
              <li><Link to="/downloads" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Downloads</Link></li>
              <li><Link to="/cases" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Cases</Link></li>
              <li><Link to="/quem-somos" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Quem Somos</Link></li>
            </ul>
          </div>
          
          {/* Content */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Conteúdo</h3>
            <ul className="space-y-4">
              <li><Link to="/blog" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Blog</Link></li>
              <li><Link to="/servicos" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Serviços</Link></li>
              <li><Link to="/comunidade" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">Comunidade</Link></li>
            </ul>
          </div>
          
          {/* Legal & Technology */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/termos-de-uso" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">
                  <FileText size={16} className="mr-2" /> 
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" onClick={scrollToTop} className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center">
                  <Shield size={16} className="mr-2" /> 
                  Privacidade
                </Link>
              </li>
              <li>
                <a 
                  href="https://growthfunnels.com.br/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-revgreen transition-colors duration-200 flex items-center"
                >
                  <ExternalLink size={16} className="mr-2" /> 
                  Growth Funnels
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Newsletter</h3>
            <NewsletterForm />
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-6 md:mb-0 text-center md:text-left">
            © {currentYear} RevHackers. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
            <Link to="/privacidade" onClick={scrollToTop} className="text-gray-400 text-sm hover:text-revgreen transition-colors duration-200">Política de Privacidade</Link>
            <Link to="/termos-de-uso" onClick={scrollToTop} className="text-gray-400 text-sm hover:text-revgreen transition-colors duration-200">Termos de Uso</Link>
            <a 
              href="https://growthfunnels.com.br/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 text-sm hover:text-revgreen transition-colors duration-200 flex items-center"
            >
              Growth Funnels <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
