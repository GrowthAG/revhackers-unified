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
    id: 17,
    title: "ChatGPT para Growth: 15 prompts que dobram sua produtividade em marketing",
    slug: "chatgpt-para-growth-15-prompts-produtividade-marketing",
    excerpt: "Descubra os prompts específicos que transformam o ChatGPT em seu assistente de marketing mais poderoso, com templates prontos para usar.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Automação",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-15",
    readTime: "12 min",
    featured: true
  },
  {
    id: 18,
    title: "Cold Email em 2025: as 7 estratégias que ainda funcionam",
    slug: "cold-email-2025-7-estrategias-que-funcionam",
    excerpt: "As táticas de cold email que sobreviveram às mudanças de algoritmo e regulamentações, com templates testados em +10k envios.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-12",
    readTime: "10 min",
    featured: true
  },
  {
    id: 19,
    title: "LTV vs CAC: como calcular e otimizar para crescimento sustentável",
    slug: "ltv-vs-cac-calcular-otimizar-crescimento-sustentavel",
    excerpt: "O guia definitivo para entender, calcular e otimizar as métricas mais importantes do seu negócio B2B.",
    content: "Conteúdo renderizado via componente customizado",
    category: "Dados",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-10",
    readTime: "15 min",
    featured: true
  },
  {
    id: 20,
    title: "Product-Market Fit: 5 sinais de que você encontrou (e 3 de que não)",
    slug: "product-market-fit-5-sinais-encontrou-3-que-nao",
    excerpt: "Como identificar se seu produto realmente resolve um problema real do mercado, com frameworks práticos de validação.",
    content: `
      <h2>Por que a Taxa de Conversão Estagna?</h2>
      <p>A maioria das empresas comete os mesmos erros: foca em tráfego em vez de conversão, testa mudanças cosméticas em vez de fundamentais, e ignora a psicologia por trás das decisões de compra.</p>
      
      <h2>7 Técnicas Comprovadas de CRO</h2>
      
      <h3>1. Hierarquia Visual Estratégica</h3>
      <p>Guie o olhar do usuário através de uma sequência lógica: problema → solução → prova → ação. Use contraste, tamanho e posicionamento para criar um fluxo natural.</p>
      
      <h3>2. Redução de Friction Points</h3>
      <p>Identifique e elimine tudo que cria hesitação:</p>
      <ul>
        <li>Formulários longos demais</li>
        <li>Muitas opções de escolha</li>
        <li>Falta de informações de segurança</li>
        <li>Processo de checkout confuso</li>
      </ul>
      
      <h3>3. Social Proof Contextual</h3>
      <p>Use depoimentos específicos para cada etapa do funil. Para visitantes novos: quantidade de usuários. Para usuários considerando: casos de sucesso similares.</p>
      
      <h3>4. Urgência Verdadeira</h3>
      <p>Crie urgência baseada em escassez real, não artificial. Limite de vagas em beta, desconto por tempo limitado com razão genuína.</p>
      
      <h3>5. Mobile-First Optimization</h3>
      <p>67% do tráfego B2B agora é mobile. Otimize primeiro para mobile, depois adapte para desktop.</p>
      
      <h3>6. Microcopy Persuasivo</h3>
      <p>Pequenos textos fazem grande diferença:</p>
      <ul>
        <li>"Começar teste grátis" vs "Começar agora"</li>
        <li>"Sem compromisso" próximo ao botão</li>
        <li>"Cancele quando quiser" reduz ansiedade</li>
      </ul>
      
      <h3>7. Testing Methodology</h3>
      <p>Teste uma hipótese por vez, com significância estatística mínima de 95% e amostra suficiente para detectar mudanças de pelo menos 10%.</p>
      
      <h2>Framework de Implementação</h2>
      <ol>
        <li><strong>Audit atual:</strong> Identifique os maiores pontos de abandono</li>
        <li><strong>Priorise por impacto:</strong> Foque no que pode gerar mais resultado</li>
        <li><strong>Teste sistematicamente:</strong> Uma mudança por vez</li>
        <li><strong>Meça resultados:</strong> Use dados, não opiniões</li>
      </ol>
      
      <blockquote>
        <p>"CRO não é sobre truques, é sobre entender profundamente seu cliente e remover barreiras da decisão de compra." - Giulliano Alves</p>
      </blockquote>
    `,
    category: "PLG",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-08",
    readTime: "11 min"
  },
  {
    id: 21,
    title: "LinkedIn Sales Navigator: guia completo para prospecção B2B",
    slug: "linkedin-sales-navigator-guia-completo-prospeccao-b2b",
    excerpt: "Estratégias avançadas para usar o Sales Navigator como máquina de prospecção, com scripts e templates.",
    content: `
      <h2>O que é Product-Led Growth (PLG)?</h2>
      <p>Product-Led Growth é uma estratégia de crescimento onde o produto é o principal canal de aquisição, conversão e expansão de clientes. No PLG, o produto "se vende sozinho" através de uma experiência excepcional do usuário.</p>
      
      <h2>Por que PLG funciona no Brasil?</h2>
      <p>O mercado brasileiro tem características únicas que favorecem estratégias PLG:</p>
      <ul>
        <li><strong>Alto ceticismo com vendas tradicionais:</strong> Brasileiros preferem "testar antes de comprar"</li>
        <li><strong>Busca por value-for-money:</strong> Necessidade de demonstrar valor real antes da compra</li>
        <li><strong>Crescimento do SaaS nacional:</strong> Mercado mais maduro e receptivo a novas soluções</li>
      </ul>
      
      <h2>Estratégias PLG para Startups Brasileiras</h2>
      <h3>1. Freemium Estratégico</h3>
      <p>Ofereça valor suficiente na versão gratuita para demonstrar o potencial do produto, mas crie limitações que naturalmente levem ao upgrade.</p>
      
      <h3>2. Trial Orientado por Valor</h3>
      <p>Em vez de trials por tempo, crie trials baseados em valor entregue (ex: "Primeiro resultado garantido em 7 dias").</p>
      
      <h3>3. Onboarding Gamificado</h3>
      <p>Transforme o processo de onboarding em uma jornada de descoberta de valor, não apenas tutorial de features.</p>
      
      <h2>Métricas Essenciais para PLG</h2>
      <ul>
        <li><strong>Time to Value (TTV):</strong> Tempo até o primeiro resultado</li>
        <li><strong>Product Qualified Leads (PQLs):</strong> Leads qualificados pelo uso do produto</li>
        <li><strong>Activation Rate:</strong> % de usuários que completam ações-chave</li>
        <li><strong>Expansion Revenue:</strong> Receita de upgrades e expansões</li>
      </ul>
      
      <h2>Cases de Sucesso PLG no Brasil</h2>
      <p>Empresas como RD Station, Hotmart e PagSeguro cresceram usando princípios PLG adaptados ao mercado brasileiro, focando em educação do mercado e demonstração de valor antes da venda.</p>
      
      <blockquote>
        <p>"PLG não é sobre eliminar vendas, é sobre fazer vendas mais inteligentes e escaláveis." - Giulliano Alves, CEO RevHackers</p>
      </blockquote>
    `,
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-01-05",
    readTime: "13 min"
  },
  {
    id: 16,
    title: "Polemic Led Growth: O método que transforma seu LinkedIn em uma máquina de oportunidades silenciosa e magnética",
    slug: "polemic-led-growth-metodo-linkedin-maquina-oportunidades",
    excerpt: "Descubra como construir autoridade silenciosa e atrair oportunidades de alto valor no LinkedIn sem depender de autopromoção excessiva.",
    category: "PLG",
    image: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67fe3e8f11cc71d2ba4dbe53.png",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2025-04-10",
    readTime: "10 min",
    featured: true
  },
  {
    id: 1,
    title: "O que é PLG e como aplicar em startups brasileiras",
    slug: "o-que-e-plg-e-como-aplicar-em-startups-brasileiras",
    excerpt: "Estratégias para usar o produto como motor de crescimento adaptadas à realidade do mercado brasileiro.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 2,
    title: "CRO na prática: como dobrar sua taxa de conversão sem investir mais",
    slug: "cro-na-pratica-como-dobrar-sua-taxa-de-conversao",
    excerpt: "Técnicas avançadas de otimização que podem transformar seus resultados sem aumentar seu orçamento.",
    category: "CRO",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-15",
    readTime: "6 min"
  },
  {
    id: 3,
    title: "ABM para times pequenos: segmentação que converte",
    slug: "abm-para-times-pequenos-segmentacao-que-converte",
    excerpt: "Como implementar Account-Based Marketing mesmo com recursos limitados e equipes enxutas.",
    category: "ABM",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-10",
    readTime: "7 min",
    featured: true
  },
  {
    id: 4,
    title: "7 automações de marketing que escalam sua operação sem equipe extra",
    slug: "7-automacoes-de-marketing-que-escalam-sua-operacao",
    excerpt: "Ferramentas e processos para aumentar a produtividade do seu time de marketing sem novas contratações.",
    category: "Automação",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-03-05",
    readTime: "9 min"
  },
  {
    id: 5,
    title: "Como construir um funil de aquisição usando seu próprio produto",
    slug: "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto",
    excerpt: "Estratégias para transformar seu produto em uma máquina de aquisição de novos usuários.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-28",
    readTime: "7 min"
  },
  {
    id: 6,
    title: "Estratégias de inteligência artificial aplicadas a pré-vendas",
    slug: "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas",
    excerpt: "Como usar IA para qualificar leads e aumentar a eficiência do seu time comercial.",
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-20",
    readTime: "8 min",
    featured: true
  },
  {
    id: 7,
    title: "Diagnóstico de marketing orientado por dados: como interpretar seus números",
    slug: "diagnostico-de-marketing-orientado-por-dados",
    excerpt: "Um guia completo para extrair insights acionáveis dos dados da sua operação de marketing.",
    category: "Dados",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-15",
    readTime: "10 min"
  },
  {
    id: 8,
    title: "Playbooks de vendas e marketing que escalam resultados em 90 dias",
    slug: "playbooks-de-vendas-e-marketing-que-escalam-resultados",
    excerpt: "Processos e estratégias prontos para implementar e colher resultados rápidos.",
    category: "Vendas",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-10",
    readTime: "12 min"
  },
  {
    id: 9,
    title: "Como combinar inbound, outbound e PLG na mesma estratégia",
    slug: "como-combinar-inbound-outbound-e-plg",
    excerpt: "Criando uma abordagem integrada de aquisição para maximizar seus resultados.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-02-05",
    readTime: "9 min"
  },
  {
    id: 10,
    title: "Canais de aquisição com ROI imediato para startups early-stage",
    slug: "canais-de-aquisicao-com-roi-imediato-para-startups",
    excerpt: "Estratégias de marketing com baixo investimento e alto retorno para empresas em fase inicial.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-28",
    readTime: "7 min"
  },
  {
    id: 11,
    title: "Como estruturar um time de growth com poucos recursos",
    slug: "como-estruturar-um-time-de-growth-com-poucos-recursos",
    excerpt: "Formando um time multidisciplinar e eficiente mesmo com orçamento limitado.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-20",
    readTime: "8 min"
  },
  {
    id: 12,
    title: "Análise de dados para fundadores: quais métricas importam de verdade",
    slug: "analise-de-dados-para-fundadores-quais-metricas-importam",
    excerpt: "Um guia objetivo sobre os KPIs que realmente fazem diferença no crescimento do seu negócio.",
    category: "Dados",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-15",
    readTime: "11 min",
    featured: true
  },
  {
    id: 13,
    title: "Os melhores CRMs e automações para crescimento B2B em 2024",
    slug: "os-melhores-crms-e-automacoes-para-crescimento-b2b",
    excerpt: "Uma análise comparativa das principais ferramentas para gestão de relacionamento com clientes B2B.",
    category: "MarTech",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-10",
    readTime: "10 min"
  },
  {
    id: 14,
    title: "SaaS + PLG: como usar seu trial gratuito para gerar pipeline",
    slug: "saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline",
    excerpt: "Estratégias para converter usuários de trial em clientes pagantes com ativação eficiente.",
    category: "PLG",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-05",
    readTime: "7 min"
  },
  {
    id: 15,
    title: "Como desenhar uma jornada do usuário que ativa e converte",
    slug: "como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte",
    excerpt: "Técnicas para mapear e otimizar a experiência do usuário visando maior retenção e conversão.",
    category: "CRO",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    author: {
      name: "Giulliano Alves",
      role: "CEO da RevHackers",
      avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
    },
    date: "2024-01-01",
    readTime: "9 min"
  }
];
