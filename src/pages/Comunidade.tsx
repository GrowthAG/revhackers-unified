
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Zap, Calendar, Video, BookOpen, Trophy, GraduationCap, Repeat, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';

const Comunidade = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      {/* Header - Industrial Dark */}
      <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/10">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
              Network
            </span>
            <h1 className="text-5xl md:text-7xl font-normal text-white mb-8 tracking-tighter text-balance">
              Comunidade RevHackers
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed mb-12">
              Conecte-se com a elite de Revenue Operations, Marketing e Vendas.
              Compartilhe experiências, aprenda e cresça junto.
            </p>
            <a href="https://academy.revhackers.com.br/" target="_blank" rel="noopener noreferrer">
              <Button
                className="btn-green-flat h-14 px-8 text-sm"
              >
                Solicitar Acesso à Comunidade
              </Button>
            </a>
          </div>
        </div>
      </Section>

      {/* Benefits Grid */}
      <Section variant="light" className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-normal mb-6 text-black tracking-tight">Por que participar?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-sm text-center hover:border-revgreen transition-colors group">
              <div className="mb-6 flex justify-center text-gray-400 group-hover:text-revgreen transition-colors">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Aprendizado contínuo</h3>
              <p className="text-gray-500 font-light text-sm">
                Acesso a conteúdos exclusivos, webinars e discussões com especialistas do mercado.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-8 rounded-sm text-center hover:border-revgreen transition-colors group">
              <div className="mb-6 flex justify-center text-gray-400 group-hover:text-revgreen transition-colors">
                <Repeat size={40} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Networking</h3>
              <p className="text-gray-500 font-light text-sm">
                Conecte-se com profissionais do setor e amplie sua rede de contatos.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-8 rounded-sm text-center hover:border-revgreen transition-colors group">
              <div className="mb-6 flex justify-center text-gray-400 group-hover:text-revgreen transition-colors">
                <Lightbulb size={40} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Insights valiosos</h3>
              <p className="text-gray-500 font-light text-sm">
                Descubra tendências, ferramentas e estratégias que estão transformando o mercado.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Features List */}
      <Section variant="light" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

              {/* Left Column: Visual/Decoration Replaced Image with Abstract */}
              <div className="bg-white p-8 rounded-sm border border-gray-200">
                <div className="aspect-square bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                  <Users className="w-24 h-24 text-gray-300" />
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-black">Benefícios Exclusivos</h2>
                  <p className="text-gray-500 font-light">
                    Uma plataforma completa para acelerar o crescimento da sua carreira.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-sm flex items-center justify-center group-hover:border-revgreen transition-colors">
                      <MessageSquare className="text-black group-hover:text-revgreen transition-colors" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-black">Fóruns de discussão</h3>
                      <p className="text-gray-500 text-sm font-light">Conversas temáticas sobre os principais desafios de RevOps.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-sm flex items-center justify-center group-hover:border-revgreen transition-colors">
                      <Calendar className="text-black group-hover:text-revgreen transition-colors" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-black">Meetups exclusivos</h3>
                      <p className="text-gray-500 text-sm font-light">Encontros presenciais e online com os melhores do mercado.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-sm flex items-center justify-center group-hover:border-revgreen transition-colors">
                      <Video className="text-black group-hover:text-revgreen transition-colors" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-black">Bootcamps especializados</h3>
                      <p className="text-gray-500 text-sm font-light">Treinamentos intensivos para desenvolver habilidades práticas.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-sm flex items-center justify-center group-hover:border-revgreen transition-colors">
                      <BookOpen className="text-black group-hover:text-revgreen transition-colors" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-black">Biblioteca de recursos</h3>
                      <p className="text-gray-500 text-sm font-light">Templates, playbooks e ferramentas validadas.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section variant="dark" className="py-24 bg-black border-t border-white/10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-normal mb-8 text-white tracking-tighter">
              Faça parte da elite.
            </h2>
            <p className="text-xl text-gray-400 mb-12 font-light">
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
