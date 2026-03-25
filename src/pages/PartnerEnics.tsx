import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowRightIcon, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import ContactForm from '@/components/shared/ContactForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PartnerEnics = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white text-zinc-900 relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865"
            alt="ENICS background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                ENICS
              </h1>
              <p className="text-xl text-zinc-300 mb-8">
                Empresa organizadora de eventos corporativos e educacionais de grande porte,
                especializada em experiências imersivas e interativas.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-3 py-1 bg-opacity-20 bg-white rounded-full text-sm">Eventos</span>
                <span className="px-3 py-1 bg-opacity-20 bg-white rounded-full text-sm">Marketing</span>
                <span className="px-3 py-1 bg-opacity-20 bg-white rounded-full text-sm">B2C</span>
                <span className="px-3 py-1 bg-opacity-20 bg-white rounded-full text-sm">Educação</span>
              </div>
              <div className="flex gap-4">
                <Button asChild className="bg-revgreen text-black hover:bg-revgreen/90">
                  <Link to="/cases/enics">
                    Ver case completo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="#contato">
                    Falar com especialista
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 bg-white p-8 rounded-lg shadow-sm">
              <img
                src="/uploads/a05718ad-1822-4102-909a-7e86af151e98.png"
                alt="ENICS"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Overview */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Nosso trabalho com a ENICS</h2>

            <div className="space-y-8">
              <div className="bg-zinc-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">O Desafio</h3>
                <p className="text-zinc-700">
                  A ENICS precisava vender 3.000 ingressos em apenas 30 dias para um grande evento educacional,
                  enfrentando o desafio de um prazo curto e alta competição no setor.
                </p>
              </div>

              <div className="bg-zinc-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">A Solução</h3>
                <p className="text-zinc-700 mb-4">
                  Desenvolvemos uma estratégia integrada com três pilares principais:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-revgreen flex-shrink-0 mt-0.5" />
                    <span>Google Ads focado em intenção de compra</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-revgreen flex-shrink-0 mt-0.5" />
                    <span>Campanhas personalizadas no Meta Ads (Facebook e Instagram)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-revgreen flex-shrink-0 mt-0.5" />
                    <span>Sistema de remarketing para recuperar interessados que não completaram a compra</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-revgreen flex-shrink-0 mt-0.5" />
                    <span>Automações via email e WhatsApp para manter o engajamento</span>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Os Resultados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 border-0 shadow-sm">
                    <h4 className="text-revgreen text-2xl font-bold">3.000</h4>
                    <p className="text-zinc-700">Ingressos vendidos antes do prazo estipulado</p>
                  </Card>
                  <Card className="p-6 border-0 shadow-sm">
                    <h4 className="text-revgreen text-2xl font-bold">45%</h4>
                    <p className="text-zinc-700">Redução no custo por aquisição</p>
                  </Card>
                  <Card className="p-6 border-0 shadow-sm">
                    <h4 className="text-revgreen text-2xl font-bold">40%</h4>
                    <p className="text-zinc-700">Taxa de recuperação em carrinhos abandonados</p>
                  </Card>
                  <Card className="p-6 border-0 shadow-sm">
                    <h4 className="text-revgreen text-2xl font-bold">10.000+</h4>
                    <p className="text-zinc-700">Leads qualificados para futuros eventos</p>
                  </Card>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-16 bg-zinc-900 text-white p-8 rounded-lg relative">
              <div className="text-6xl text-zinc-700 absolute top-4 left-6 opacity-30">"</div>
              <blockquote className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/uploads/5336ba0d-ed69-49f9-8041-36171f3f7b99.png" alt="Caroline Siqueira" />
                    <AvatarFallback>CS</AvatarFallback>
                  </Avatar>
                  <p className="text-lg italic">
                    "A estratégia digital implementada não apenas nos permitiu atingir nossa meta ambiciosa de vendas,
                    mas também estabeleceu uma base sólida de dados para nossos próximos eventos, transformando
                    completamente nosso processo de comercialização."
                  </p>
                </div>
                <footer className="text-right">
                  <div className="font-bold">Caroline Siqueira</div>
                  <div className="text-zinc-300">VP do Grupo Innova Steel</div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-zinc-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Serviços Relacionados</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden transition-all">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Estratégia de Marketing Digital</h3>
                <p className="text-zinc-600 mb-4">
                  Desenvolvimento de estratégias personalizadas para alcançar seus objetivos de negócio.
                </p>
                <Link to="/servicos/marketing-digital" className="text-revgreen font-medium flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>

            <Card className="overflow-hidden transition-all">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Automação de Marketing</h3>
                <p className="text-zinc-600 mb-4">
                  Implementação de fluxos automatizados para nurturar leads e aumentar conversões.
                </p>
                <Link to="/servicos/automacao" className="text-revgreen font-medium flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>

            <Card className="overflow-hidden transition-all">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Campanhas de Mídia Paga</h3>
                <p className="text-zinc-600 mb-4">
                  Gestão de campanhas de mídia paga altamente segmentadas para maximizar resultados.
                </p>
                <Link to="/servicos/midia-paga" className="text-revgreen font-medium flex items-center">
                  Saiba mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contato" className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fale com um especialista</h2>
            <p className="text-zinc-600 mb-4">
              Quer resultados como este para sua empresa? Entre em contato agora mesmo.
            </p>
            <Separator className="mx-auto w-24 bg-revgreen h-1 rounded-full mb-6" />
          </div>

          <div className="max-w-2xl mx-auto bg-zinc-50 p-8 rounded-xl shadow-sm border border-zinc-100">
            <ContactForm formType="contact" />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PartnerEnics;
