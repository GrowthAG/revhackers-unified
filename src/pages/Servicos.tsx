
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Section from '@/components/ui/Section';
import { ArrowUpRight, Cpu, Database, LayoutTemplate, LineChart, MessageSquareCode, Search, Zap } from 'lucide-react';
import SEO from '@/components/shared/SEO';

const capabilities = [
  {
    id: "01",
    title: "SDR de Inteligência Artificial",
    description: "Criamos agentes baseados em LLMs avançados para qualificar todos os seus leads. Zero curiosos no caledário dos seus Closers.",
    tech: ["OpenAI API", "Agentic Workflows", "Vector DBs"],
    icon: Cpu,
    slug: "ai-operations"
  },
  {
    id: "02",
    title: "Engenharia de CRM (O Cofre)",
    description: "Configuração blindada de Hubspot/Salesforce. Onde seus vendedores não terão desculpa para perder reuniões ou follow-ups.",
    tech: ["CRM Architecture", "Pipeline Logic", "Data Sync"],
    icon: Database,
    slug: "ecossistema-crm"
  },
  {
    id: "03",
    title: "Follow-Up Implacável (Automations)",
    description: "Robôs lógicos que perseguem via Whatsapp/Email leads que esfriaram no funil, 24 horas por dia.",
    tech: ["n8n / Make", "ActiveCampaign", "Webhooks"],
    icon: Zap,
    slug: "automacao-inteligente"
  },
  {
    id: "04",
    title: "Tracionamento B2B (Aquisição)",
    description: "Gestão técnica de tráfego injetando MQLs (Marketing Qualified Leads) qualificados direto na boca do funil.",
    tech: ["Meta Ads", "LinkedIn B2B", "Google Engine"],
    icon: LineChart,
    slug: "tracao-midia-paga"
  },
  {
    id: "05",
    title: "Filtros de Conversão (Site)",
    description: "Tear-down de infraestrutura e interfaces web otimizados 100% para fazer o fundador B2B preencher o formulário.",
    tech: ["CRO Testing", "Next.js", "Analytics"],
    icon: LayoutTemplate,
    slug: "web-conversion"
  },
  {
    id: "06",
    title: "Processos de Founder (Desmame)",
    description: "Aulas e playbooks para tirar o Fundador da rua e criar uma equipe comercial que fecha contrato sem depender dele.",
    tech: ["Playbooks", "Sales SLA", "Handoff"],
    icon: MessageSquareCode,
    slug: "founder-led-growth"
  }
];

const Servicos = () => {
  return (
    <PageLayout>
      <SEO
        title="Consultoria de Revenue Operations & Automação B2B"
        description="Serviços de consultoria em Revenue Operations, IA, CRM e Automação de Vendas B2B em São Paulo e Brasil. Transforme sua operação comercial com a RevHackers."
        canonical="https://revhackers.com.br/servicos"
        breadcrumbs={[
          { name: "Home", url: "https://revhackers.com.br/" },
          { name: "Ecossistema", url: "https://revhackers.com.br/servicos" }
        ]}
        faq={[
          { question: "O que é Revenue Operations (RevOps)?", answer: "Revenue Operations é a metodologia que integra Marketing, Vendas e Customer Success sob uma infraestrutura unificada de dados, automações e processos, eliminando silos e maximizando receita recorrente." },
          { question: "Como funciona a consultoria da RevHackers?", answer: "Realizamos uma auditoria técnica da sua operação B2B, identificamos vazamentos de receita e implementamos automações de IA, CRM e processos para escalar sua operação comercial." },
          { question: "Quais empresas a RevHackers atende?", answer: "Atendemos empresas B2B com operações comerciais complexas que buscam escalar receita através de tecnologia, automação e processos de Revenue Operations." }
        ]}
      />
      {/* Hero Section - Absolute Black "Capa" Style */}
      <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-black border-b border-zinc-900">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 text-white tracking-tight leading-[1.1] uppercase">
              O Mecanismo<span className="text-revgreen">.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-bold tracking-widest leading-relaxed max-w-2xl mx-auto uppercase">
              Nós não prestamos "Serviços". Nós alugamos nossa infraestrutura de IA e CRM para o seu B2B.
            </p>
          </div>
        </div>
      </Section>

      {/* Capabilities Matrix - The "Machine" View */}
      <Section variant="light" className="py-24 md:py-40 bg-zinc-50 relative overflow-hidden">
        <div className="container-custom">
          {/* Section Context */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-b border-zinc-200 pb-12">
            <div className="max-w-2xl">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] mb-4 block">
                // The Capabilities Matrix
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter text-balance leading-tight">
                Sistemas de Crescimento. <br />
                <span className="text-zinc-300 font-light italic">Peça por peça.</span>
              </h2>
            </div>
            <p className="text-lg text-zinc-500 max-w-xs leading-relaxed font-light text-right md:text-left">
              Não vendemos "serviços avulsos". Entregamos infraestrutura de receita compobível.
            </p>
          </div>

          {/* Apple-Style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {capabilities.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white p-10 md:p-12 hover:shadow-sm hover:shadow-zinc-200/50 transition-all duration-700 rounded-[2.5rem] border border-zinc-100 flex flex-col h-full overflow-hidden"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-5xl md:text-6xl font-black text-zinc-50 group-hover:text-zinc-100 transition-colors duration-500 tracking-tighter">
                    {item.id}
                  </span>
                  <div className="p-5 bg-zinc-900 rounded-[1.25rem] shadow-sm shadow-zinc-200 group-hover:bg-black transition-all duration-500 group-hover:scale-110">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                    {item.title}
                  </h3>
                  <p className="text-body text-zinc-500 leading-relaxed mb-10 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Tech Stack Footer */}
                <div className="pt-8 border-t border-zinc-50">
                  <div className="flex flex-wrap gap-2 mb-10">
                    {item.tech.map((tech) => (
                      <span key={tech} className="text-2xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/servicos/${item.slug}`}
                    className="inline-flex items-center text-xxs font-black text-zinc-900 uppercase tracking-[0.2em] group-hover:text-black transition-all gap-3 group-hover:gap-5"
                  >
                    EXPLORAR <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Subtle Hover Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl -z-10" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section - Minimalist Footer */}
      <Section variant="light" className="py-32 bg-zinc-50 border-t border-zinc-200">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-8 tracking-tighter uppercase">
              Está pronto para a Máquina?
            </h2>
            <p className="text-zinc-500 mb-12 text-lg font-bold max-w-xl mx-auto">
              Vagas de implementação restritas. Vamos auditar suas finanças e plugar a Automação se houver fit com a RevHackers.
            </p>
            <Button asChild className="bg-black text-white hover:bg-revgreen hover:text-black border-none rounded-sm px-10 py-8 text-sm uppercase tracking-[0.2em] font-black transition-all transform hover:-translate-y-1">
              <Link to="/booking">
                Aplicar para Auditoria
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Servicos;
