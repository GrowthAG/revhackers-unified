import { Link } from 'react-router-dom';
import { Youtube, Instagram, Linkedin, Mail } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-black border-t border-white/10 text-white">
      <div className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-6">
              <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers Logo" className="h-12 w-auto opacity-90" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Transformando empresas B2B através de engenharia de receita, automação inteligente e estratégias de crescimento validadas.
              </p>
              <div className="flex gap-4">
                <SocialLink href="https://www.linkedin.com/company/34579614/" icon={<Linkedin size={18} />} />
                <SocialLink href="https://www.instagram.com/revhackers.com.br/" icon={<Instagram size={18} />} />
                <SocialLink href="https://www.youtube.com/@RevHackersTV" icon={<Youtube size={18} />} />
                <SocialLink href="mailto:contato@revhackers.com.br" icon={<Mail size={18} />} />
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h3 className="font-semibold text-white mb-6">Empresa</h3>
              <ul className="space-y-4">
                <FooterLink to="/" onClick={scrollToTop}>Home</FooterLink>
                <FooterLink to="/quem-somos" onClick={scrollToTop}>Sobre Nós</FooterLink>
                <FooterLink to="/cases" onClick={scrollToTop}>Cases de Sucesso</FooterLink>
                <FooterLink to="/carreiras" onClick={scrollToTop}>Carreiras</FooterLink>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-white mb-6">Recursos</h3>
              <ul className="space-y-4">
                <FooterLink to="/servicos" onClick={scrollToTop}>Serviços</FooterLink>
                <FooterLink to="/blog" onClick={scrollToTop}>Blog & Artigos</FooterLink>
                <FooterLink to="/materiais" onClick={scrollToTop}>Materiais Gratuitos</FooterLink>
                <FooterLink to="/comunidade" onClick={scrollToTop}>Comunidade</FooterLink>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-6">Fique Atualizado</h3>
              <p className="text-gray-400 text-sm mb-4">Receba hacks de crescimento semanalmente.</p>
              <div className="bg-white/5 p-1 rounded-lg border border-white/10">
                <NewsletterForm />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} RevHackers. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link to="/privacidade" onClick={scrollToTop} className="text-gray-500 text-sm hover:text-revgreen transition-colors">Privacidade</Link>
              <Link to="/termos-de-uso" onClick={scrollToTop} className="text-gray-500 text-sm hover:text-revgreen transition-colors">Termos</Link>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono-tech opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase tracking-wider">Powered by</span>
              <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                alt="REVHACKERS"
                className="h-4 w-auto grayscale brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick: () => void }) => (
  <li>
    <Link to={to} onClick={onClick} className="text-gray-400 hover:text-revgreen transition-colors text-sm font-medium block">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-revgreen hover:border-revgreen transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;