
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Section from '@/components/ui/Section';
import { ArrowUpRight, Cpu, Database, LayoutTemplate, LineChart, MessageSquareCode, Search, Zap } from 'lucide-react';

const capabilities = [
  {
    id: "01",
    title: "Tração & Mídia Paga",
    description: "Gestão de tráfego de alta precisão. Focada não em cliques, mas em pipeline real e LTV/CAC saudável.",
    tech: ["Google Ads", "Meta Ads", "LinkedIn B2B"],
    icon: LineChart,
    slug: "tracao-midia-paga"
  },
  {
    id: "02",
    title: "Ecossistema & CRM",
    description: "Engenharia de dados centralizada. Implementação de Hubspot/Salesforce integrada a toda a stack de Revenue.",
    tech: ["CRM Architecture", "Data Warehousing", "API Integration"],
    icon: Database,
    slug: "ecossistema-crm"
  },
  {
    id: "03",
    title: "Automação Inteligente",
    description: "Workflows de nutrição e vendas que rodam 24/7. Elimine o trabalho manual e acelere o ciclo de vendas.",
    tech: ["n8n / Make", "ActiveCampaign", "Custom Webhooks"],
    icon: Zap,
    slug: "automacao-inteligente"
  },
  {
    id: "04",
    title: "Founder-Led Growth",
    description: "Transforme a autoridade técnica dos fundadores no principal canal de aquisição orgânica e confiança.",
    tech: ["Personal Branding", "LinkedIn Algo", "Ghostwriting"],
    icon: MessageSquareCode,
    slug: "founder-led-growth"
  },
  {
    id: "05",
    title: "Web & Conversion",
    description: "Interfaces de alta performance projetadas para conversão. Velocidade, SEO técnico e UX unificados.",
    tech: ["Next.js / React", "Vercel", "Headless CMS"],
    icon: LayoutTemplate,
    slug: "web-conversion"
  },
  {
    id: "06",
    title: "AI Operations",
    description: "Implementação de agentes de IA para pré-vendas e suporte. Reduza o CAC operacional drasticamente.",
    tech: ["OpenAI API", "Vector Databases", "LangChain"],
    icon: Cpu,
    slug: "ai-operations"
  }
];

const Servicos = () => {
  return (
    <PageLayout>
      {/* Hero Section - Absolute Black "Capa" Style */}
      <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-black border-b border-zinc-900">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter">
              Serviços<span className="text-revgreen">.</span>
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500 font-bold tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
              ECOSSISTEMA DE RECEITA INTEGRADO PARA ESCALAR OPERAÇÕES B2B COMPLEXAS.
            </p>
          </div>
        </div>
      </Section>

      {/* Capabilities Matrix - The "Machine" View */}
      <Section variant="light" className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom">
          {/* Section Context */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-zinc-100 pb-8">
            <div className="max-w-xl">
              <span className="font-mono text-xs text-revgreen uppercase tracking-wider mb-2 block">
                // The Capabilities Matrix
              </span>
              <h2 className="text-3xl font-bold text-black tracking-tight text-balance">
                Engenharia de Crescimento. <br />
                <span className="text-zinc-400 font-light">Peça por peça.</span>
              </h2>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed text-right md:text-left">
              Não vendemos "serviços avulsos". Entregamos infraestrutura de receita compobível.
            </p>
          </div>

          {/* Brutalist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
            {capabilities.map((item) => (
              <div key={item.id} className="group relative bg-white p-8 md:p-12 hover:bg-zinc-50 transition-colors duration-300">

                {/* Header Card */}
                <div className="flex justify-between items-start mb-8">
                  <span className="font-mono text-4xl md:text-5xl font-light text-zinc-200 group-hover:text-revgreen transition-colors duration-300">
                    {item.id}
                  </span>
                  <div className="p-3 bg-zinc-50 rounded-none border border-zinc-100 group-hover:border-revgreen/20 group-hover:bg-revgreen/5 transition-all">
                    <item.icon className="w-5 h-5 text-black group-hover:text-revgreen transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-black mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-8 h-20">
                  {item.description}
                </p>

                {/* Tech Stack Footer */}
                <div className="pt-6 border-t border-zinc-100">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tech.map((tech) => (
                      <span key={tech} className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-50 px-2 py-1">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/servicos/${item.slug}`}
                    className="inline-flex items-center text-xs font-bold text-black uppercase tracking-widest group-hover:text-revgreen transition-colors gap-2"
                  >
                    Explorar <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Active Line Indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-revgreen group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section - Minimalist Footer */}
      <Section variant="light" className="py-32 bg-zinc-50 border-t border-zinc-200">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-8 tracking-tighter">
              Ready to Upgrade?
            </h2>
            <p className="text-zinc-500 mb-12 text-lg font-light max-w-xl mx-auto">
              Seu stack de receita precisa de uma auditoria completa. Vamos encontrar os gargalos.
            </p>
            <Button asChild className="bg-black text-white hover:bg-revgreen hover:text-black border-none rounded-none px-8 py-6 text-xs uppercase tracking-[0.2em] font-bold transition-all transform hover:-translate-y-1">
              <Link to="/diagnostico">
                Iniciar Diagnóstico Gratuito
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Servicos;
