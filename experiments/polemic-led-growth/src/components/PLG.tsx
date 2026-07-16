import React, { useRef, useState, useEffect } from 'react';

// --- ICONS ---
export const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
export const LinkedinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
export const YoutubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);
export const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

// --- UI PRIMITIVES ---

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`w-[95%] max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 ${className}`}>{children}</div>
);

export const ReadingContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="max-w-[720px] mx-auto">{children}</div>
);

export const CornerBrackets: React.FC<{ className?: string }> = ({ className = "text-deep-black" }) => (
    <React.Fragment>
        <svg className={`absolute top-0 left-0 w-3 h-3 ${className}`} viewBox="0 0 10 10"><path d="M1 10V1H10" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        <svg className={`absolute top-0 right-0 w-3 h-3 ${className}`} viewBox="0 0 10 10"><path d="M9 10V1H0" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        <svg className={`absolute bottom-0 left-0 w-3 h-3 ${className}`} viewBox="0 0 10 10"><path d="M1 0V9H10" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        <svg className={`absolute bottom-0 right-0 w-3 h-3 ${className}`} viewBox="0 0 10 10"><path d="M9 0V9H0" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
    </React.Fragment>
);

export const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = "bg-pure-white text-deep-black", children }) => (
  <section id={id} className={`min-h-[60vh] flex flex-col justify-center py-[120px] relative border-b border-gray-100 ${className}`}>
    {children}
  </section>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; subtitle?: string; inverse?: boolean }> = ({ children, subtitle, inverse = false }) => (
  <div className="mb-[60px]">
    {subtitle && <div className={`font-mono text-[10px] tracking-[3px] text-neon-green ${inverse ? 'bg-white/10' : 'bg-deep-black'} inline-block px-3 py-1 mb-4 uppercase`}>{subtitle}</div>}
    <h2 className={`text-[28px] md:text-[42px] font-bold tracking-tight leading-[1.1] font-space ${inverse ? 'text-white' : 'text-deep-black'}`}>
        {children}
    </h2>
  </div>
);

export const H3: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-[16px] md:text-[18px] font-bold tracking-tight mt-[32px] mb-[20px] text-deep-black font-space uppercase ${className}`}>
    {children}
  </h3>
);

export const Paragraph: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[14px] md:text-[15px] mb-[24px] leading-[1.7] text-deep-black/80 font-normal ${className}`}>
    {children}
  </p>
);

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setIsVisible(true), delay);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={ref} className={`transform transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {children}
        </div>
    );
};

export const TechCard: React.FC<{ label?: string; title?: string; children: React.ReactNode; highlight?: boolean }> = ({ label, title, children, highlight }) => (
    <div className={`relative p-8 ${highlight ? 'bg-deep-black text-white' : 'bg-white text-black'} border border-transparent h-full flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg`}>
        <CornerBrackets className={highlight ? 'text-neon-green' : 'text-black'} />
        <div>
            {label && (
                <div className={`font-mono text-[9px] tracking-[2px] mb-4 uppercase ${highlight ? 'text-neon-green' : 'text-gray-400'}`}>
                    [{label}]
                </div>
            )}
            {title && <h4 className="text-lg font-bold mb-3 font-space">{title}</h4>}
            <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
        </div>
    </div>
);

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://pages.revhackers.com.br/js/form_embed.js";
        script.type = "text/javascript";
        document.body.appendChild(script);
    }, []);

    return (
        <footer className="bg-deep-black text-white border-t border-white/10 pt-24 pb-12 font-space text-xs">
            <Container>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-24">

                  {/* Col 1: Brand */}
                  <div className="space-y-6">
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/68ea81e059ec0a12e82c943c.png"
                        alt="RevHackers"
                        className="h-6 w-auto mb-2 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <p className="text-gray-400 leading-relaxed text-xs">
                        Ajudamos empresas a escalarem através de automação, estratégia, crescimento e inovação.
                    </p>
                    <div className="flex gap-3 pt-2">
                        {[
                            { icon: <LinkedinIcon />, link: "https://www.linkedin.com/company/34579614/" },
                            { icon: <InstagramIcon />, link: "https://www.instagram.com/revhackers.com.br/" },
                            { icon: <YoutubeIcon />, link: "https://www.youtube.com/@RevHackersTV" },
                            { icon: <MailIcon />, link: "mailto:contato@revhackers.com.br" }
                        ].map((item, i) => (
                            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                               className="w-10 h-10 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-black hover:bg-neon-green hover:border-neon-green transition-all duration-300 rounded-sm">
                               {item.icon}
                            </a>
                        ))}
                    </div>
                  </div>

                  {/* Col 2: Navegação */}
                  <div>
                      <h4 className="font-bold mb-6 text-white text-sm">Navegação</h4>
                      <ul className="space-y-3 text-gray-400 text-xs">
                          <li><a href="/" className="hover:text-neon-green transition-colors">Home</a></li>
                          <li><a href="/cases" className="hover:text-neon-green transition-colors">Cases</a></li>
                          <li><a href="/quem-somos" className="hover:text-neon-green transition-colors">Quem Somos</a></li>
                      </ul>
                  </div>

                  {/* Col 3: Conteúdo */}
                  <div>
                      <h4 className="font-bold mb-6 text-white text-sm">Conteúdo</h4>
                      <ul className="space-y-3 text-gray-400 text-xs">
                          <li><a href="/blog" className="hover:text-neon-green transition-colors">Blog</a></li>
                          <li><a href="/servicos" className="hover:text-neon-green transition-colors">Serviços</a></li>
                          <li><a href="/materiais" className="hover:text-neon-green transition-colors">Materiais</a></li>
                          <li><a href="/comunidade" className="hover:text-neon-green transition-colors">Comunidade</a></li>
                      </ul>
                  </div>

                  {/* Col 4: Newsletter */}
                  <div>
                      <h4 className="font-bold mb-6 text-white text-sm">Newsletter</h4>
                      <form className="space-y-3">
                          <input type="text" placeholder="Seu nome" className="w-full bg-transparent border border-gray-800 rounded p-3 text-white placeholder-gray-600 focus:border-neon-green focus:outline-none transition-colors text-xs" />
                          <input type="email" placeholder="Seu e-mail" className="w-full bg-transparent border border-gray-800 rounded p-3 text-white placeholder-gray-600 focus:border-neon-green focus:outline-none transition-colors text-xs" />
                          <button className="w-full bg-neon-green text-black font-bold rounded uppercase tracking-wider py-3 hover:bg-white transition-colors text-xs mt-2">
                              Inscrever-se
                          </button>
                          <label className="flex items-start gap-3 text-[10px] text-gray-500 cursor-pointer pt-1">
                              <input type="checkbox" className="mt-0.5 accent-neon-green" />
                              <span className="leading-tight">Ao se inscrever, você aceita receber conteúdos da RevHackers.</span>
                          </label>
                      </form>
                  </div>
               </div>

               <div className="border-t border-neon-green pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-500 font-mono">
                  <p>© {currentYear} RevHackers. Todos os direitos reservados.</p>
                  <div className="flex flex-wrap justify-center gap-8">
                      <a href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
                      <a href="/termos-de-uso" className="hover:text-white transition-colors">Termos de Uso</a>
                      <a href="https://growthfunnels.com.br/" target="_blank" className="hover:text-white transition-colors">Growth Funnels</a>
                  </div>
               </div>
            </Container>
        </footer>
    );
};
