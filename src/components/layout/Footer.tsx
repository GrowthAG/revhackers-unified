import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram, Youtube } from 'lucide-react';
import NewsletterForm from '../shared/NewsletterForm';
import { APP_CONFIG } from '@/config/constants';
import { APP_ROUTES } from '@/config/routes';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: APP_CONFIG.URLS.INSTAGRAM, label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/revhackers', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/@revhackers', label: 'YouTube' },
    { icon: Mail, href: `mailto:${APP_CONFIG.EMAILS.CONTACT}`, label: 'Email' }
  ];

  return (
    <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Link to={APP_ROUTES.PUBLIC.HOME} className="inline-block group focus:outline-none">
              <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                alt="RevHackers Logo"
                className="w-auto h-12 transition-all duration-300 group-hover:opacity-90"
              />
            </Link>

            <p className="text-mini font-medium text-zinc-400 leading-relaxed max-w-xs">
              Mapeamos falhas no seu funil comercial e integramos IA, automações e CRM para não deixar nenhum Lead B2B esfriar.
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
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300 mb-2">Navegação Core</h3>
            <ul className="space-y-4 text-mini font-medium text-zinc-500">
              <li><Link to={APP_ROUTES.PUBLIC.HOME} className="hover:text-white transition-colors">Home (O Funil)</Link></li>
              <li><Link to={APP_ROUTES.PUBLIC.SERVICOS} className="hover:text-white transition-colors">Ecossistema IA + CRM</Link></li>
              <li><Link to={APP_ROUTES.PUBLIC.CASES} className="hover:text-white transition-colors">Clientes & Fechamentos</Link></li>
              <li><Link to="/quem-somos" className="hover:text-white transition-colors">Quem Somos</Link></li>
              <li><Link to={APP_ROUTES.PUBLIC.COMUNIDADE} className="hover:text-white transition-colors">Operações Fechadas</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300 mb-2">Auditorias Rápidas</h3>
            <ul className="space-y-4 text-mini font-medium text-zinc-500">
              <li><Link to="/score" className="hover:text-white transition-colors">Vazamento 360 do Crescimento</Link></li>
              <li><Link to="/score-revenue" className="hover:text-white transition-colors">Diagnóstico do CRM</Link></li>
              <li><Link to="/score-founder" className="hover:text-white transition-colors">Dependência do Founder</Link></li>
              <li><Link to={APP_ROUTES.PUBLIC.BOOKING} className="hover:text-white transition-colors text-revgreen font-bold">Solicitar Auditoria</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300 mb-2">Newsletter</h3>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-zinc-500 text-xxs uppercase font-bold tracking-[0.3em]">
              © {currentYear} RevHackers. Engineering Revenue for Scale.
            </p>
            <address className="not-italic text-zinc-700 text-xxs uppercase tracking-[0.2em]">
              São Paulo, SP · Brasil
            </address>
          </div>
          <div className="flex gap-8 text-xxs uppercase font-bold tracking-[0.3em] text-zinc-500">
            <Link to={APP_ROUTES.LEGAL_AND_FEEDBACK.PRIVACIDADE} className="hover:text-white transition-colors">Privacidade</Link>
            <Link to={APP_ROUTES.LEGAL_AND_FEEDBACK.TERMOS_DE_USO} className="hover:text-white transition-colors">Termos</Link>
            <a href="https://usefunnels.io" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Powered by Funnels</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;