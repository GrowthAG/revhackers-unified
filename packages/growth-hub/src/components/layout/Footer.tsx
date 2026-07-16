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
            <div className="lg:col-span-1 space-y-4">
              <Link to="/" onClick={scrollToTop} className="block w-fit">
                <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" alt="RevHackers Logo" className="h-4 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
                Engenharia de receita e estratégias de crescimento para empresas B2B.
              </p>
              <div className="flex gap-2 pt-2">
                <SocialLink href="https://www.linkedin.com/company/34579614/" icon={<Linkedin size={14} />} />
                <SocialLink href="https://www.instagram.com/revhackers.com.br/" icon={<Instagram size={14} />} />
                <SocialLink href="https://www.youtube.com/@RevHackersTV" icon={<Youtube size={14} />} />
                <SocialLink href="mailto:contato@revhackers.com.br" icon={<Mail size={14} />} />
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Empresa</h3>
              <ul className="space-y-2">
                <FooterLink to="/" onClick={scrollToTop}>Home</FooterLink>
                <FooterLink to="/quem-somos" onClick={scrollToTop}>Sobre</FooterLink>
                <FooterLink to="/cases" onClick={scrollToTop}>Cases</FooterLink>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Recursos</h3>
              <ul className="space-y-2">
                <FooterLink to="/servicos" onClick={scrollToTop}>Serviços</FooterLink>
                <FooterLink to="/blog" onClick={scrollToTop}>Blog</FooterLink>
                <FooterLink to="/materiais" onClick={scrollToTop}>Materiais</FooterLink>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-1">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Newsletter</h3>
              <p className="text-zinc-600 text-[10px] mb-4">Growth Hacks semanais direto na sua inbox.</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-[10px] uppercase tracking-wider text-center md:text-left">
              © {currentYear} RevHackers. Todos os direitos reservados.
            </p>
            <div className="flex gap-8 flex-wrap justify-center">
              <Link to="/privacidade" onClick={scrollToTop} className="text-zinc-600 text-[10px] uppercase tracking-wider hover:text-white transition-colors">Privacidade</Link>
              <Link to="/termos-de-uso" onClick={scrollToTop} className="text-zinc-600 text-[10px] uppercase tracking-wider hover:text-white transition-colors">Termos</Link>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-mono opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest">
              <span>System by RevHackers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick: () => void }) => (
  <li>
    <Link to={to} onClick={onClick} className="text-zinc-500 hover:text-white transition-colors text-xs font-medium block">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-white transition-colors duration-300 border border-transparent hover:border-zinc-800"
  >
    {icon}
  </a>
);

export default Footer;