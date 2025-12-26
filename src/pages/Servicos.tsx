
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Database, Zap, Users } from 'lucide-react';
import Section from '@/components/ui/Section';

const services = [
  {
    title: "Tração & Mídia Paga",
    description: "Gestão estratégica de tráfego focada em LTV/CAC e pipelines B2B qualificados.",
    icon: TrendingUp,
    features: [
      "Gestão Google Ads",
      "Meta Ads Estratégico",
      "LinkedIn Ads B2B",
      "Criação de Criativos"
    ],
    slug: "tracao-midia-paga"
  },
  {
    title: "Ecossistema & CRM",
    description: "Integração total de ferramentas. Marketing, Vendas e CS falando a mesma língua.",
    icon: Database,
    features: [
      "Implementação GoHighLevel",
      "Integração de Ferramentas",
      "Pipeline de Vendas",
      "Dashboards Executivos"
    ],
    slug: "ecossistema-crm"
  },
  {
    title: "Automação Inteligente",
    description: "Workflows que nutrem leads e fecham vendas enquanto você dorme.",
    icon: Zap,
    features: [
      "Email Marketing Automático",
      "WhatsApp Business API",
      "Workflows Inteligentes",
      "Follow-up Automático"
    ],
    slug: "automacao-inteligente"
  },
  {
    title: "Founder-Led Growth",
    description: "Estratégias de marca pessoal para fundadores se tornarem o principal canal de aquisição.",
    icon: Users,
    features: [
      "Personal Branding Strategy",
      "Content Marketing",
      "LinkedIn Growth",
      "Speaking & Networking"
    ],
    slug: "founder-led-growth"
  }
];

const Servicos = () => {
  return (
    <PageLayout>
      {/* Hero Section - Industrial Dark */}
      <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/10">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
              Capabilities
            </span>
            <h1 className="text-5xl md:text-7xl font-normal text-white mb-8 tracking-tighter text-balance">
              Nossos Serviços
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
              Soluções completas para acelerar o crescimento do seu negócio B2B
              com estratégias baseadas em dados e tecnologia.
            </p>
          </div>
        </div>
      </Section>

      {/* Methodology Section - The Ecosystem View */}
      <Section variant="light" className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-normal text-black mb-6 tracking-tight">
              O Ecossistema de Receita
            </h2>
            <p className="text-xl text-gray-500 font-light leading-relaxed">
              Não entregamos peças soltas. Construímos uma máquina onde cada pilar
              alimenta e potencializa o próximo.
            </p>
          </div>

          {/* Timeline / Process Flow */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line (Desktop) */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -z-10 md:-translate-x-1/2"></div>

            <div className="space-y-24">
              {/* Step 1: Tração */}
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="md:w-1/2 text-left md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-black mb-2">1. Atração & Demanda</h3>
                  <p className="text-gray-500 font-light mb-4">
                    Trazemos o tráfego qualificado certo para dentro de casa.
                    Sem cliques vazios, apenas decisores com intenção de compra.
                  </p>
                  <Link to="/servicos/tracao-midia-paga" className="text-sm font-bold text-revgreen hover:underline uppercase tracking-wider">
                    Tração & Mídia Paga &rarr;
                  </Link>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-full bg-black border-4 border-white flex items-center justify-center shadow-lg order-1 md:order-2 flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-revgreen" />
                </div>
                <div className="md:w-1/2 order-3 border-l-2 border-gray-100 pl-8 md:border-l-0 md:pl-0">
                  <span className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-sm">Top of Funnel</span>
                </div>
              </div>

              {/* Step 2: Autoridade */}
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="md:w-1/2 order-3 md:order-1 border-l-2 border-gray-100 pl-8 md:border-l-0 md:pl-0 md:text-right">
                  <span className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-sm">Trust Layer</span>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shadow-sm order-1 md:order-2 flex-shrink-0">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <div className="md:w-1/2 order-2 md:order-3">
                  <h3 className="text-2xl font-bold text-black mb-2">2. Autoridade & Confiança</h3>
                  <p className="text-gray-500 font-light mb-4">
                    Transformamos o CPF do fundador em um imã de oportunidades.
                    Acelera o ciclo de vendas pois "quem confia, compra rápido".
                  </p>
                  <Link to="/servicos/founder-led-growth" className="text-sm font-bold text-revgreen hover:underline uppercase tracking-wider">
                    Founder-Led Growth &rarr;
                  </Link>
                </div>
              </div>

              {/* Step 3: Organização */}
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="md:w-1/2 text-left md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-black mb-2">3. Inteligência de Dados</h3>
                  <p className="text-gray-500 font-light mb-4">
                    Organizamos a casa. Centralizamos todos os dados para que Marketing e Vendas
                    falem a mesma língua e nada se perca.
                  </p>
                  <Link to="/servicos/ecossistema-crm" className="text-sm font-bold text-revgreen hover:underline uppercase tracking-wider">
                    Ecossistema & CRM &rarr;
                  </Link>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shadow-sm order-1 md:order-2 flex-shrink-0">
                  <Database className="w-8 h-8 text-black" />
                </div>
                <div className="md:w-1/2 order-3 border-l-2 border-gray-100 pl-8 md:border-l-0 md:pl-0">
                  <span className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-sm">The Brain</span>
                </div>
              </div>

              {/* Step 4: Conversão */}
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="md:w-1/2 order-3 md:order-1 border-l-2 border-gray-100 pl-8 md:border-l-0 md:pl-0 md:text-right">
                  <span className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-sm">Conversion Loop</span>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-full bg-black border-4 border-white flex items-center justify-center shadow-lg order-1 md:order-2 flex-shrink-0">
                  <Zap className="w-8 h-8 text-revgreen" />
                </div>
                <div className="md:w-1/2 order-2 md:order-3">
                  <h3 className="text-2xl font-bold text-black mb-2">4. Conversão Automática</h3>
                  <p className="text-gray-500 font-light mb-4">
                    A máquina que roda 24/7. Nutrição, follow-up e agendamento
                    acontecendo enquanto sua equipe foca em fechar contratos.
                  </p>
                  <Link to="/servicos/automacao-inteligente" className="text-sm font-bold text-revgreen hover:underline uppercase tracking-wider">
                    Automação Inteligente &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section - Simple & Clean */}
      <Section variant="light" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-normal mb-6 text-black tracking-tight">
              Não sabe por onde começar?
            </h2>
            <p className="text-lg text-gray-500 mb-8 font-light max-w-2xl mx-auto">
              Solicite um diagnóstico gratuito e descubra quais serviços são mais adequados
              para o momento atual do seu negócio.
            </p>

            <div className="flex justify-center">
              <Button asChild className="btn-green-flat h-14">
                <Link to="/diagnostico">
                  Solicitar diagnóstico gratuito
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Servicos;
