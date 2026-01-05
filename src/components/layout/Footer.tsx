import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram, Youtube } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com/company/revhackers', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/revhackers', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/@revhackers', label: 'YouTube' },
    { icon: Mail, href: 'mailto:contato@revhackers.com.br', label: 'Email' }
  ];

  return (
    <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Link to="/" className="inline-block group focus:outline-none">
              <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                alt="RevHackers Logo"
                className="w-auto h-12 transition-all duration-300 group-hover:opacity-90"
              />
            </Link>

            <p className="text-[13px] font-medium text-zinc-400 leading-relaxed max-w-xs">
              Ajudamos empresas a escalarem através de automação, estratégia, crescimento e inovação.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:border-revgreen hover:text-revgreen transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Navegação</h3>
            <ul className="space-y-4 text-[13px] font-medium text-zinc-500">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="/cases" className="hover:text-white transition-colors">Cases</Link></li>
              <li><Link to="/community" className="hover:text-white transition-colors">Comunidade</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Conteúdo</h3>
            <ul className="space-y-4 text-[13px] font-medium text-zinc-500">
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Serviços</Link></li>
              <li><Link to="/materials" className="hover:text-white transition-colors">Materiais</Link></li>
              <li><Link to="/protocol" className="hover:text-white transition-colors">Protocolo REI</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Newsletter</h3>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em]">
            © {currentYear} RevHackers. Engineering Revenue for Scale.
          </p>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-600">
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-white transition-colors">Termos</Link>
            <a href="https://usefunnels.io" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Powered by Funnels</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;