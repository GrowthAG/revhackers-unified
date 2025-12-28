
import { useParams, Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, BarChart3, Settings, Users, Zap, TrendingUp, Target, Database, MessageSquare, LayoutTemplate, Cpu } from 'lucide-react';
import Section from '@/components/ui/Section';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- DATA SOURCE ---
const servicosData = {
  // === NEW SERVICES (High-Level Copywriting) ===
  "tracao-midia-paga": {
    number: "01",
    title: "Tração & Mídia Paga",
    subtitle: "Chega de métricas de vaidade. Transformamos budget de mídia em pipeline de vendas previsível e qualificado.",
    icon: TrendingUp,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10", // Neutral but premium
    accent: "text-revgreen",
    whatWeDo: [
      { title: "Engenharia de Tráfego B2B", description: "Não compramos cliques, compramos intenção. Campanhas desenhadas para atingir decisores no momento de compra." },
      { title: "Account-Based Ads", description: "Mire nos logotipos que você quer fechar. Campanhas hiper-segmentadas para listas de contas alvo." },
      { title: "Criativos de Alta Conversão", description: "Ads que não parecem ads. Formatos nativos e copywriting direto que geram curiosidade e clique." },
      { title: "Tracking & Atribuição", description: "Saiba exatamente qual campanha, anúncio e palavra-chave gerou o contrato fechado." }
    ],
    howItWorks: [
      { step: "01", title: "Auditoria de Contas", description: "Identificamos onde você está queimando dinheiro hoje." },
      { step: "02", title: "Setup de Rastreamento", description: "Configuramos o tracking server-side para dados 100% confiáveis." },
      { step: "03", title: "Lançamento de Campanhas", description: "Estruturamos campanhas segregadas por nível de consciência do lead." },
      { step: "04", title: "Otimização Diária", description: "Ajustes de lances, negativação e testes A/B constantes." }
    ],
    results: [
      { value: "-60%", label: "Custo por Lead Qualificado" },
      { value: "4x", label: "ROI em 90 dias" },
      { value: "100%", label: "Rastreabilidade de Dados" }
    ]
  },
  "ecossistema-crm": {
    number: "02",
    title: "Ecossistema & CRM",
    subtitle: "A verdade sobre sua receita está nos dados. Centralize sua operação e elimine os 'pontos cegos' do funil.",
    icon: Database,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10",
    accent: "text-revgreen",
    whatWeDo: [
      { title: "Implementação de CRM", description: "Configuração profissional (HubSpot, Salesforce, Pipedrive) alinhada ao seu processo de vendas real." },
      { title: "Integração Total", description: "Conectamos Marketing, Vendas e CS. Chega de planilhas soltas e dados desencontrados." },
      { title: "Dashboards de Revenue", description: "Tenha visão em tempo real de CAC, LTV, Churn e Pipeline Velocity." },
      { title: "Gestão de Pipeline", description: "Processos claros de passagem de bastão (Handoff) para garantir que nenhum lead se perca." }
    ],
    howItWorks: [
      { step: "01", title: "Mapeamento de Processos", description: "Desenhamos o fluxo ideal da sua operação comercial." },
      { step: "02", title: "Limpeza de Dados", description: "Higienização da base e padronização de campos." },
      { step: "03", title: "Implementação Técnica", description: "Setup de ferramentas e integrações via API/Webhook." },
      { step: "04", title: "Playbook de Vendas", description: "Treinamento do time para garantir a adoção do CRM." }
    ],
    results: [
      { value: "360°", label: "Visão do Cliente" },
      { value: "+40%", label: "Produtividade do Time" },
      { value: "Zero", label: "Perda de Dados" }
    ]
  },
  "automacao-inteligente": {
    number: "03",
    title: "Automação Inteligente + IA",
    subtitle: "Implementamos Agentes de IA treinados como SDRs de elite. Eles qualificam e conduzem o lead por todo o funil até o momento de compra, eliminando curiosos e permitindo que seu time foque apenas em quem quer comprar.",
    icon: Zap,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10",
    accent: "text-revgreen",
    whatWeDo: [
      { title: "Agentes SDR via IA", description: "Desenvolvemos 'funcionários digitais' treinados com metodologias de vendas (Spin Selling, BANT) para atender e qualificar 24/7." },
      { title: "Filtro de Curiosos", description: "O agente identifica quem é apenas 'curioso' e quem é comprador. Seu time humano só fala com quem tem real intenção de compra." },
      { title: "Jornada Automatizada", description: "Conduzimos o lead do primeiro clique até o agendamento da reunião ou checkout, resolvendo dúvidas e quebrando objeções no caminho." },
      { title: "Eficiência Energética", description: "Pare de gastar energia com leads frios. Automatize o topo de funil e foque seus closers no fechamento." }
    ],
    howItWorks: [
      { step: "01", title: "Treinamento do Agente", description: "Alimentamos a IA com seus melhores scripts, objeções e dados do produto." },
      { step: "02", title: "Setup de Fluxos", description: "Desenhamos o caminho que o lead vai percorrer (WhatsApp/Email)." },
      { step: "03", title: "Ativação", description: "O agente assume o atendimento inicial instantaneamente." },
      { step: "04", title: "Handoff ou Venda", description: "Leads quentes são agendados; curiosos são nutridos automaticamente." }
    ],
    results: [
      { value: "Zero", label: "Tempo com Curiosos" },
      { value: "24/7", label: "SDR Ativo e Treinado" },
      { value: "+40%", label: "Taxa de Conversão" }
    ]
  },
  "founder-led-growth": {
    number: "04",
    title: "Founder-Led Growth",
    subtitle: "CPF compra de CPF. Transforme a marca pessoal do Fundador no maior canal de aquisição da empresa.",
    icon: Users,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10",
    accent: "text-revgreen",
    whatWeDo: [
      { title: "Posicionamento de Autoridade", description: "Definimos sua narrativa única para se destacar no ruído do LinkedIn." },
      { title: "Content Engine", description: "Produção de conteúdo estratégico que gera demanda, não apenas likes." },
      { title: "Social Selling", description: "Estratégias para transformar conexões e engajamento em reuniões de vendas." },
      { title: "Escala de Rede", description: "Crescimento acelerado de conexões com o ICP (Perfil de Cliente Ideal) exato." }
    ],
    howItWorks: [
      { step: "01", title: "Diagnóstico de Perfil", description: "Análise da sua presença digital atual e benchmarks." },
      { step: "02", title: "Linha Editorial", description: "Definição de temas proprietários e tom de voz." },
      { step: "03", title: "Produção e Distribuição", description: "Rotina de publicação consistente e otimizada." },
      { step: "04", title: "Conversão", description: "Scripts e abordagens para levar o engajamento para o CRM." }
    ],
    results: [
      { value: "Top 1%", label: "Autoridade no Nicho" },
      { value: "+5k", label: "Novos Decisores Conectados" },
      { value: "High", label: "Ticket de Contratos" }
    ]
  },
  "web-conversion": {
    number: "05",
    title: "Web & Conversion",
    subtitle: "Transforme seu site em uma máquina de vendas. Design premium, velocidade extrema e arquitetura focada em conversão B2B.",
    icon: LayoutTemplate,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10",
    accent: "text-revgreen",
    whatWeDo: [
      { title: "High-Performance Dev", description: "Sites ultra-rápidos (Score 90+) que ranqueiam melhor no Google." },
      { title: "Conversion Design", description: "Layouts que guiam o olhar do decisor para o botão de 'Agendar Demo'." },
      { title: "SEO Técnico", description: "Estrutura semântica perfeita para dominar as keywords do seu nicho." },
      { title: "CMS Headless", description: "Gestão de conteúdo flexível para seu time de marketing voar sem depender de TI." }
    ],
    howItWorks: [
      { step: "01", title: "UX/UI Audit", description: "Análise de fricção e oportunidades de melhoria no fluxo atual." },
      { step: "02", title: "Wireframe & Copy", description: "Estrutura de persuasão antes de qualquer linha de código." },
      { step: "03", title: "Desenvolvimento", description: "Stack moderna (Next.js/React) para performance de elite." },
      { step: "04", title: "Analytics Setup", description: "Tagueamento avançado para medir cada clique e scroll." }
    ],
    results: [
      { value: "+3x", label: "Conversão (Lead)" },
      { value: "<1s", label: "Carregamento" },
      { value: "100%", label: "Mobile Optimized" }
    ]
  },
  "ai-operations": {
    number: "06",
    title: "AI Operations",
    subtitle: "Escale sua operação sem escalar o headcount. Agentes de IA que assumem tarefas cognitivas complexas.",
    icon: Cpu,
    heroCta: "/diagnostico",
    color: "from-white/5 to-white/10",
    accent: "text-revgreen",
    whatWeDo: [
      { title: "Support Agents", description: "Atendimento N1 que resolve 80% dos chamados sem humano." },
      { title: "Pre-Sales AI", description: "Qualificação de leads inbound e agendamento automático de reuniões." },
      { title: "Content AI", description: "Geração de briefings, posts e artigos baseados na voz da sua marca." },
      { title: "Internal Ops", description: "Automação de onboarding, contratos e relatórios financeiros." }
    ],
    howItWorks: [
      { step: "01", title: "Mapeamento", description: "Onde seu time gasta mais tempo com tarefas repetitivas?" },
      { step: "02", title: "Custom Training", description: "Treinamos o modelo com seus dados proprietários (RAG)." },
      { step: "03", title: "Integração", description: "Conectamos o agente ao seu Slack, CRM e Email." },
      { step: "04", title: "Supervisão", description: "Human-in-the-loop para garantir qualidade e evolução contínua." }
    ],
    results: [
      { value: "-70%", label: "CAC Operacional" },
      { value: "24/7", label: "Disponibilidade" },
      { value: "Zero", label: "Erro Humano" }
    ]
  },

  // === LEGACY SERVICES (Mapped to keep compatibility if accessed) ===
  "automacao": {
    number: "03",
    title: "Automação de Revenue",
    subtitle: "Automatizamos processos comerciais para gerar mais resultados com menos esforço.",
    icon: Zap,
    color: "from-gray-500/20 to-gray-900/40",
    accent: "text-white",
    heroCta: "/diagnostico",
    whatWeDo: [
      { title: "Automação de Processos", description: "Eliminar tarefas manuais e repetitivas." }
    ],
    howItWorks: [
      { step: "01", title: "Diagnóstico", description: "Entendemos o cenário atual." }
    ],
    results: [
      { value: "+173%", label: "Leads Qualificados" }
    ]
  },
};

const ServicosDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? servicosData[slug as keyof typeof servicosData] : null;

  if (!service) {
    return (
      <PageLayout>
        <Section variant="dark" className="py-32 min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-4xl text-white font-bold mb-4">Serviço não encontrado</h1>
          <Button asChild className="btn-green-flat">
            <Link to="/servicos">Voltar para Serviços</Link>
          </Button>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 1. HERO SECTION - Now with Dynamic Background for "Surprise" */}
      <Section variant="dark" className="relative pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/10 overflow-hidden">

        {/* Dynamic Glow Background */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-40 pointer-events-none bg-gradient-radial ${service.color} blur-[100px] rounded-full`}></div>

        <div className="container-custom text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <span className={`font-mono-tech ${service.accent} text-xl md:text-2xl font-bold mb-6 block`}>
              {service.number}
            </span>
            <h1 className="text-5xl md:text-7xl font-normal text-white mb-8 tracking-tighter text-balance">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-12">
              {service.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-green-flat h-14 px-8 text-sm shadow-lg shadow-revgreen/10">
                <Link to={service.heroCta}>Agendar Consultoria</Link>
              </Button>
              <Button asChild className="btn-outline-flat h-14 px-8 text-sm bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10">
                <Link to="/cases">Ver Cases</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 2. O QUE FAZEMOS (What We Do) */}
      <Section variant="light" className="py-24 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-normal mb-16 text-black tracking-tight text-center">
            O que fazemos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.whatWeDo.map((item, i) => (
              <Card key={i} className="bg-gray-50 border border-gray-100 shadow-sm hover:border-revgreen transition-all duration-300 h-full group hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-black mb-3 group-hover:text-revgreen transition-colors">{item.title}</CardTitle>
                  <CardDescription className="text-gray-600 font-light leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. COMO FUNCIONA (How It Works) */}
      <Section variant="light" className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-normal mb-16 text-black tracking-tight text-center">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop only) */}
            <div className="hidden md:block absolute top-[24px] left-0 w-full h-[2px] bg-gray-200 -z-10" />

            {service.howItWorks.map((step, i) => (
              <div key={i} className="relative group">
                {/* Number Bubble */}
                <div className={`w-12 h-12 bg-white border-2 border-revgreen rounded-full flex items-center justify-center font-mono-tech text-black font-bold mb-6 mx-auto z-10 group-hover:bg-revgreen group-hover:text-white transition-colors shadow-sm`}>
                  {step.step}
                </div>
                <div className="text-center px-4">
                  <h3 className="text-lg font-bold text-black mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 font-light">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. RESULTADOS (Results) */}
      <Section variant="dark" className="py-24 bg-black border-t border-white/5">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-normal mb-16 text-white tracking-tight text-center">
            Resultados Típicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {service.results.map((result, i) => (
              <div key={i} className="p-8 border border-white/10 rounded-sm bg-white/5 text-center hover:bg-white/10 transition-colors group">
                <div className={`text-4xl md:text-5xl font-bold ${service.accent} mb-4 font-mono-tech group-hover:scale-110 transition-transform duration-300`}>
                  {result.value}
                </div>
                <p className="text-gray-400 font-light uppercase tracking-wider text-sm">
                  {result.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. CTA FINAL */}
      <Section variant="light" className="py-24 bg-white">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-black">Pronto para começar?</h2>
            <p className="text-xl text-gray-500 mb-10 font-light">
              Agende uma consultoria gratuita e descubra como podemos ajudar sua empresa a escalar.
            </p>
            <Button asChild className="btn-aggressive h-16 px-12 text-base bg-black text-white hover:bg-revgreen hover:text-black shadow-xl">
              <Link to="/diagnostico">Agendar Consultoria Gratuita</Link>
            </Button>
          </div>
        </div>
      </Section>

    </PageLayout>
  );
};

export default ServicosDetalhe;
