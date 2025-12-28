export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  image: string;
  author: Author;
  date: string;
  readTime: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 999,
    title: "<span>IA Generativa no Marketing</span> Além do Hype",
    slug: "ia-generativa-marketing-alem-do-hype",
    excerpt: "Como utilizar agentes autônomos e LLMs para escalar sua produção de conteúdo sem perder a autenticidade da marca.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Automação",
    image: "/images/blog-v2/blog_ai_marketing_cover.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-12-25",
    readTime: "8 min",
    featured: true
  }, {
    id: 1001,
    title: "<span>Estratégia Go-To-Market (GTM)</span> O Guia Definitivo para Escalar",
    slug: "estrategia-gtm-go-to-market-para-novos-produtos",
    excerpt: "Introdução: por que GTM virou questão de sobrevivência Em mercados B2B competitivos.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Strategy",
    image: "/images/blog-v2/blog_gtm_strategy_cover.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-09-05",
    readTime: "7 min",
    featured: true
  }, {
    id: 1002,
    title: "<span>Diagnóstico 360°</span> Como descobrir onde seu funil vaza",
    slug: "diagnostico-360-descobrir-gargalos-funil",
    excerpt: "O que impede sua empresa de escalar não é falta de lead, nem falta de time. É a eficiência do funil.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Growth",
    image: "/images/blog-v2/blog_diagnostico_360.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-07-27",
    readTime: "5 min"
  }, {
    id: 1003,
    title: "<span>ABM na Prática</span> Como escolher as contas-alvo certas",
    slug: "abm-na-pratica-escolher-contas-alvo",
    excerpt: "No universo B2B, especialmente em segmentos como tecnologia, educação corporativa e serviços complexos.",
    content: "Conteúdo renderizado via componente customizado",
    category: "ABM",
    image: "/images/blog-v2/blog_abm_strategy_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-06-18",
    readTime: "5 min"
  }, {
    id: 1004,
    title: "<span>Diagnóstico de Funil Comercial</span> Como Identificar Gargalos",
    slug: "diagnostico-funil-comercial-identificar-gargalos",
    excerpt: "Se sua operação B2B está estagnada, mesmo com investimento em marketing, o problema pode estar na passagem de bastão.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "/images/blog-v2/blog_funil_comercial.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-11-11",
    readTime: "4 min"
  }, {
    id: 501,
    title: "<span>SaaS Trial Pipeline</span> Converta usuários em clientes pagantes",
    slug: "saas-trial-pipeline-optimization",
    excerpt: "Sua taxa de conversão de trial está baixa? Aprenda como mapear e otimizar cada etapa da jornada para transformar signups em receita previsível.",
    content: "Conteúdo renderizado via componente customizado",
    category: "SaaS",
    image: "/images/blog-v2/blog_saas_pipeline_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-11-20",
    readTime: "12 min",
    featured: true
  },
  {
    id: 301,
    title: "<span>A Anatomia da Demo Perfeita</span> Como converter features em contratos",
    slug: "anatomia-da-demo-perfeita-vendas-b2b",
    excerpt: "Por que seus features não vendem? Pare de fazer tour de produto e comece a vender soluções com este roteiro de 4 atos.",
    category: "Vendas",
    image: "/images/blog-v2/blog_demo_perfeita_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-08-15",
    readTime: "8 min",
    featured: true
  },
  {
    id: 302,
    title: "<span>RevOps</span> O Framework Definitivo de Revenue Operations",
    slug: "revops-framework-definitivo-revenue-operations",
    excerpt: "Marketing culpa Vendas. Vendas culpa Marketing. RevOps é o fim da guerra civil através da unificação de Dados, Processos e Tecnologia.",
    category: "RevOps",
    image: "/images/blog-v2/blog_revops_frame_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-08-12",
    readTime: "10 min",
    featured: true
  },
  {
    id: 303,
    title: "<span>Psicologia de Pricing B2B</span> Como aumentar o ticket médio",
    slug: "psicologia-pricing-b2b-estrategia-precos",
    excerpt: "Seu preço diz quem você é. Como sair da briga por 'barato' e cobrar pelo valor real gerado, usando âncoras e psicologia.",
    category: "Strategy",
    image: "/images/blog-v2/blog_pricing_psychology_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-08-10",
    readTime: "7 min",
    featured: true
  },
  {
    id: 304,
    title: "<span>Comissionamento de Vendas</span> Modelos que incentivam o comportamento certo",
    slug: "comissionamento-vendas-sdr-closer-modelos",
    excerpt: "Seu plano de comissão pode estar sabotando seu crescimento. O guia definitivo de incentivos alinhados para SDRs e Closers.",
    category: "Management",
    image: "/images/blog-v2/blog_sales_commission.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-08-08",
    readTime: "9 min",
    featured: true
  },
  {
    id: 305,
    title: "<span>O Manual Anti-Churn</span> Playbooks táticos para salvar contas",
    slug: "manual-anti-churn-retencao-clientes-cs",
    excerpt: "Churn não se resolve no cancelamento. Se resolve no onboarding. Descubra onde você está errando e como salvar contas em risco.",
    category: "CS",
    image: "/images/blog-v2/blog_antichurn_manual.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-08-05",
    readTime: "6 min",
    featured: true
  },

  {
    id: 102,
    title: "<span>Integração Mkt, Vendas e CS</span> O Maior Ativo Estratégico",
    slug: "integracao-marketing-vendas-sucesso-cliente",
    excerpt: "O problema não é o tráfego. O problema não é o produto. O verdadeiro gargalo está na falta de conexão entre os seus times.",
    category: "Strategy",
    image: "/images/blog-v2/blog_dept_integration.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-05-25",
    readTime: "10 min",
    featured: true
  },
  {
    id: 100,
    title: "<span>O Funil B2B Real</span> Pare de gastar e otimize a receita",
    slug: "o-funil-que-realmente-funciona-para-empresas-b2b",
    excerpt: "Se sua operação B2B está estagnada, o problema quase sempre está dentro do funil. Pare de gastar com tráfego e faça uma cirurgia de precisão na sua receita.",
    category: "Growth",
    image: "/images/blog-v2/blog_efficient_funnel.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2025-05-20",
    readTime: "12 min",
    featured: true
  },
  {
    id: 17,
    title: "<span>ChatGPT para Growth</span> 15 prompts que dobram sua produtividade",
    slug: "chatgpt-para-growth-15-prompts-produtividade-marketing",
    excerpt: "Descubra os prompts específicos que transformam o ChatGPT em seu assistente de marketing mais poderoso, com templates prontos para usar.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Automação",
    image: "/images/blog-v2/blog_growth_chatgpt.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-15",
    readTime: "12 min",
    featured: true
  },
  {
    id: 18,
    title: "<span>Cold Email em 2025</span> As 7 estratégias que ainda funcionam",
    slug: "cold-email-2025-7-estrategias-que-funcionam",
    excerpt: "As táticas de cold email que sobreviveram às mudanças de algoritmo e regulamentações, com templates testados em +10k envios.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "/images/blog-v2/blog_cold_email_2025.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-12",
    readTime: "10 min",
    featured: true
  },
  {
    id: 19,
    title: "<span>LTV vs CAC</span> Como calcular e otimizar para crescer",
    slug: "ltv-vs-cac-calcular-otimizar-crescimento-sustentavel",
    excerpt: "O guia definitivo para entender, calcular e otimizar as métricas mais importantes do seu negócio B2B.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Dados",
    image: "/images/blog-v2/blog_ltv_cac_balance.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-10",
    readTime: "15 min",
    featured: true
  },
  {
    id: 20,
    title: "<span>Product-Market Fit</span> 5 sinais de que você encontrou",
    slug: "product-market-fit-5-sinais-encontrou-3-que-nao",
    excerpt: "Como identificar se seu produto realmente resolve um problema real do mercado, com frameworks práticos de validação.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_pmf_fit.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-08",
    readTime: "11 min"
  },
  {
    id: 21,
    title: "<span>LinkedIn Sales Navigator</span> Guia completo para prospecção B2B",
    slug: "linkedin-sales-navigator-guia-completo-prospeccao-b2b",
    excerpt: "Estratégias avançadas para usar o Sales Navigator como máquina de prospecção, com scripts e templates.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "/images/blog-v2/blog_sales_nav.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-05",
    readTime: "13 min"
  },
  {
    id: 16,
    title: "<span>Polemic Led Growth</span> LinkedIn como máquina de oportunidades",
    slug: "polemic-led-growth-metodo-linkedin-maquina-oportunidades",
    excerpt: "Descubra como construir autoridade silenciosa e atrair oportunidades de alto valor no LinkedIn sem depender de autopromoção excessiva.",
    category: "PLG",
    image: "/images/blog-v2/blog_polemic_growth_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-04-10",
    readTime: "10 min",
    featured: true
  },
  {
    id: 1,
    title: "<span>O que é PLG</span> e como aplicar em startups",
    slug: "o-que-e-plg-e-como-aplicar-em-startups-brasileiras",
    excerpt: "Estratégias para usar o produto como motor de crescimento adaptadas à realidade do mercado brasileiro.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_plg_startups.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 2,
    title: "<span>CRO na Prática</span> Como dobrar sua taxa de conversão",
    slug: "cro-na-pratica-como-dobrar-sua-taxa-de-conversao",
    excerpt: "Técnicas avançadas de otimização que podem transformar seus resultados sem aumentar seu orçamento.",
    content: "Conteúdo renderizado via componente customizado",
    category: "CRO",
    image: "/images/blog-v2/blog_cro_practical.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2024-03-15",
    readTime: "6 min"
  },
  {
    id: 4,
    title: "<span>7 Automações de Marketing</span> que escalam sua operação",
    slug: "7-automacoes-de-marketing-que-escalam-sua-operacao",
    excerpt: "Ferramentas e processos para aumentar a produtividade do seu time de marketing sem novas contratações.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Automação",
    image: "/images/blog-v2/blog_marketing_automation.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2024-03-05",
    readTime: "9 min"
  },
  {
    id: 5,
    title: "<span>Funil de Aquisição</span> usando o produto",
    slug: "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto",
    excerpt: "Estratégias para transformar seu produto em uma máquina de aquisição de novos usuários.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_product_led_funnel.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-28",
    readTime: "7 min"
  },
  {
    id: 6,
    title: "<span>Estratégias de AI</span> aplicadas a pré-vendas",
    slug: "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas",
    excerpt: "Como usar IA para qualificar leads e aumentar a eficiência do seu time comercial.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "/images/blog-v2/blog_ai_presales.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2024-02-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 7,
    title: "<span>Diagnóstico de Marketing</span> Orientado por dados",
    slug: "diagnostico-de-marketing-orientado-por-dados",
    excerpt: "Um guia completo para extrair insights acionáveis dos dados da sua operação de marketing.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Dados",
    image: "/images/blog-v2/blog_data_marketing_diag.png",
    author: {
      name: "Luna",
      role: "Analista de Marketing e Redatora",
      avatar: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/693716430f6c8c68e5492413.jpeg"
    },
    date: "2024-02-15",
    readTime: "10 min"
  },
  {
    id: 8,
    title: "<span>Playbooks de Vendas</span> e marketing que escalam resultados",
    slug: "playbooks-de-vendas-e-marketing-que-escalam-resultados",
    excerpt: "Processos e estratégias prontos para implementar e colher resultados rápidos.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "/images/blog-v2/blog_strategy_playbooks.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-10",
    readTime: "12 min"
  },
  {
    id: 9,
    title: "<span>Inbound, Outbound e PLG</span> na mesma estratégia",
    slug: "como-combinar-inbound-outbound-e-plg",
    excerpt: "Criando uma abordagem integrada de aquisição para maximizar seus resultados.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_marketing_fusion.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-05",
    readTime: "9 min"
  },
  {
    id: 10,
    title: "<span>Canais de Aquisição</span> com ROI imediato",
    slug: "canais-de-aquisicao-com-roi-imediato-para-startups",
    excerpt: "Estratégias de marketing com baixo investimento e alto retorno para empresas em fase inicial.",
    content: "Conteúdo renderizado via componente customizado",
    category: "MarTech",
    image: "/images/blog-v2/blog_roi_acquisition.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-28",
    readTime: "7 min"
  },
  {
    id: 11,
    title: "<span>Time de Growth</span> Como estruturar com poucos recursos",
    slug: "como-estruturar-um-time-de-growth-com-poucos-recursos",
    excerpt: "Formando um time multidisciplinar e eficiente mesmo com orçamento limitado.",
    content: "Conteúdo renderizado via componente customizado",
    category: "MarTech",
    image: "/images/blog-v2/blog_growth_team_structure.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-20",
    readTime: "8 min"
  },
  {
    id: 12,
    title: "<span>Análise de Dados</span> Quais métricas importam de verdade",
    slug: "analise-de-dados-para-fundadores-quais-metricas-importam",
    excerpt: "Um guia objetivo sobre os KPIs que realmente fazem diferença no crescimento do seu negócio.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Dados",
    image: "/images/blog-v2/blog_founder_data.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-15",
    readTime: "11 min",
    featured: true
  },
  {
    id: 13,
    title: "<span>Os Melhores CRMs</span> e automações para crescimento B2B",
    slug: "os-melhores-crms-e-automacoes-para-crescimento-b2b",
    excerpt: "Uma análise comparativa das principais ferramentas para gestão de relacionamento com clientes B2B.",
    content: "Conteúdo renderizado via componente customizado",
    category: "MarTech",
    image: "/images/blog-v2/blog_crm_stack_2024.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-10",
    readTime: "10 min"
  },
  {
    id: 14,
    title: "<span>SaaS + PLG</span> Use seu trial para gerar pipeline",
    slug: "saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline",
    excerpt: "Estratégias para converter usuários de trial em clientes pagantes com ativação eficiente.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_saas_trial_growth.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-05",
    readTime: "7 min"
  },
  {
    id: 15,
    title: "<span>Jornada do Usuário</span> Como desenhar para ativar e converter",
    slug: "como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte",
    excerpt: "Técnicas para mapear e otimizar a experiência do usuário visando maior retenção e conversão.",
    content: "Conteúdo renderizado via componente customizado",
    category: "PLG",
    image: "/images/blog-v2/blog_user_journey_cover.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO and Founder",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-20",
    readTime: "8 min",
    featured: true
  },
];
