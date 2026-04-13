
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Calendar, Video, BookOpen, GraduationCap, Repeat, Lightbulb, ArrowUpRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import DarkHeroSection from '@/components/shared/DarkHeroSection';
import SEO from '@/components/shared/SEO';

const Comunidade = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <SEO
        title="Comunidade de Revenue Operations do Brasil"
        description="Participe da maior comunidade de Revenue Operations, Marketing B2B e Vendas do Brasil. Networking, bootcamps, meetups e conteúdo exclusivo para profissionais de RevOps."
        canonical="https://revhackers.com.br/comunidade"
        breadcrumbs={[
          { name: "Home", url: "https://revhackers.com.br/" },
          { name: "Comunidade", url: "https://revhackers.com.br/comunidade" }
        ]}
      />
      {/* Hero - Standardized DarkHeroSection */}
      <DarkHeroSection
        title="Comunidade RevHackers"
        subtitle="CONECTE-SE COM A ELITE DE REVENUE OPERATIONS, MARKETING E VENDAS DO BRASIL."
      />

      {/* CTA Bar */}
      <Section variant="dark" className="py-12 bg-zinc-950 border-b border-zinc-900">
        <div className="container-custom text-center">
          <a href="https://academy.revhackers.com.br/" target="_blank" rel="noopener noreferrer">
            <Button className="btn-green-flat h-14 px-8 text-sm">
              Solicitar Acesso à Comunidade
            </Button>
          </a>
        </div>
      </Section>

      {/* Benefits Grid - 3 Cards */}
      <Section variant="dark" className="py-24 bg-black border-b border-zinc-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto mb-16">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-[0.2em] mb-4 block">
              // Por que participar
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
              Uma rede que <span className="text-revgreen">acelera</span> resultados.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: GraduationCap, title: 'Aprendizado contínuo', desc: 'Acesso a conteúdos exclusivos, webinars e discussões com especialistas do mercado.' },
              { icon: Repeat, title: 'Networking estratégico', desc: 'Conecte-se com profissionais do setor e amplie sua rede de contatos qualificados.' },
              { icon: Lightbulb, title: 'Insights valiosos', desc: 'Descubra tendências, ferramentas e estratégias que estão transformando o mercado.' },
            ].map((item, i) => (
              <div key={i} className="group bg-zinc-900/30 border border-zinc-800 p-10 hover:border-revgreen/30 transition-all duration-500">
                <div className="mb-8 text-zinc-600 group-hover:text-revgreen transition-colors duration-500">
                  <item.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{item.title}</h3>
                <p className="text-zinc-500 font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features - Logo + List */}
      <Section variant="dark" className="py-24 bg-zinc-950 border-b border-zinc-900">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              {/* Left Column: Logo */}
              <div className="bg-black p-12 border border-zinc-800 flex items-center justify-center">
                <img
                  src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                  alt="RevHackers"
                  className="w-64 md:w-80 h-auto opacity-80"
                />
              </div>

              {/* Right Column: Content */}
              <div className="space-y-10">
                <div>
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-[0.2em] mb-4 block">
                    // Benefícios Exclusivos
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                    Plataforma completa para sua carreira<span className="text-revgreen">.</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: MessageSquare, title: 'Fóruns de discussão', desc: 'Conversas temáticas sobre os principais desafios de RevOps.' },
                    { icon: Calendar, title: 'Meetups exclusivos', desc: 'Encontros presenciais e online com os melhores do mercado.' },
                    { icon: Video, title: 'Bootcamps especializados', desc: 'Treinamentos intensivos para desenvolver habilidades práticas.' },
                    { icon: BookOpen, title: 'Biblioteca de recursos', desc: 'Templates, playbooks e ferramentas validadas pela comunidade.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-revgreen/50 transition-colors">
                        <item.icon className="text-zinc-500 group-hover:text-revgreen transition-colors" size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold mb-1 text-white">{item.title}</h3>
                        <p className="text-zinc-500 text-sm font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section variant="dark" className="py-24 bg-black border-t border-zinc-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white tracking-tighter">
              Faça parte da elite<span className="text-revgreen">.</span>
            </h2>
            <p className="text-xl text-zinc-500 mb-12 font-light">
              Junte-se ao maior hub de profissionais de RevOps do Brasil.
            </p>

            <a href="https://academy.revhackers.com.br/" target="_blank" rel="noopener noreferrer">
              <Button className="btn-aggressive h-16 px-12 text-base">
                Entrar na Comunidade
              </Button>
            </a>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Comunidade;
