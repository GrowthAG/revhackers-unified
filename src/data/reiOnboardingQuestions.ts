
export interface QuizOption {
    id: string;
    label: string;
    score: number;
}

export interface QuizQuestion {
    id: string;
    text: string;
    description?: string;
    options: QuizOption[];
    category: 'Strategy' | 'Technology' | 'Processes' | 'Data' | 'Team' | 'Goals';
}

// REI - Revenue Engine Intelligence
// Diagnóstico completo para onboarding de clientes pós-venda
export const reiOnboardingQuestions: QuizQuestion[] = [
    // BLOCO 1: ESTRUTURA ATUAL
    {
        id: 'team_structure',
        text: "Como está estruturado seu time comercial hoje?",
        category: 'Team',
        options: [
            { id: 'founding_sales', label: "Eu (Fundador/Sócio) vendo sozinho", score: 10 },
            { id: 'basic_team', label: "Tenho 1-2 vendedores generalistas", score: 30 },
            { id: 'specialized', label: "Tenho SDRs e Closers separados", score: 70 },
            { id: 'advanced', label: "Estrutura completa (SDR, AE, CS, Ops)", score: 100 }
        ]
    },
    {
        id: 'revenue_model',
        text: "Qual o modelo de receita da empresa?",
        category: 'Strategy',
        options: [
            { id: 'transactional', label: "Transacional (venda única)", score: 40 },
            { id: 'recurring', label: "Recorrente (assinatura/SaaS)", score: 100 },
            { id: 'hybrid', label: "Híbrido (setup + recorrência)", score: 80 },
            { id: 'project', label: "Projetos sob demanda", score: 50 }
        ]
    },
    {
        id: 'ticket_size',
        text: "Qual o ticket médio mensal (MRR) ou valor médio de venda?",
        category: 'Strategy',
        options: [
            { id: 'low', label: "Até R$ 1.000", score: 30 },
            { id: 'medium', label: "R$ 1.000 - R$ 5.000", score: 60 },
            { id: 'high', label: "R$ 5.000 - R$ 20.000", score: 80 },
            { id: 'enterprise', label: "Acima de R$ 20.000", score: 100 }
        ]
    },

    // BLOCO 2: TECNOLOGIA & FERRAMENTAS
    {
        id: 'crm_usage',
        text: "Qual o nível de utilização do CRM na sua empresa?",
        category: 'Technology',
        options: [
            { id: 'none', label: "Não usamos CRM (Excel/Caderno)", score: 0 },
            { id: 'basic', label: "Usamos apenas como agenda de contatos", score: 30 },
            { id: 'intermediate', label: "Registramos atividades e funil básico", score: 60 },
            { id: 'advanced', label: "Tudo é automatizado e integrado ao Marketing", score: 100 }
        ]
    },
    {
        id: 'marketing_automation',
        text: "Vocês usam automação de marketing?",
        category: 'Technology',
        options: [
            { id: 'none', label: "Não usamos nenhuma ferramenta", score: 0 },
            { id: 'email_basic', label: "Apenas email marketing básico", score: 40 },
            { id: 'automation', label: "Automações de lead nurturing", score: 80 },
            { id: 'advanced', label: "Jornadas completas + scoring + integração CRM", score: 100 }
        ]
    },
    {
        id: 'data_integration',
        text: "Suas ferramentas (CRM, Marketing, Analytics) estão integradas?",
        category: 'Technology',
        options: [
            { id: 'none', label: "Não, cada ferramenta é isolada", score: 0 },
            { id: 'partial', label: "Algumas integrações manuais", score: 40 },
            { id: 'automated', label: "Maioria integrada automaticamente", score: 80 },
            { id: 'unified', label: "Tudo integrado em tempo real (single source of truth)", score: 100 }
        ]
    },

    // BLOCO 3: PROCESSOS & GERAÇÃO DE LEADS
    {
        id: 'lead_generation',
        text: "Como é o fluxo de geração de leads?",
        category: 'Processes',
        options: [
            { id: 'referral', label: "Dependemos 100% de indicações", score: 20 },
            { id: 'outbound_manual', label: "Prospecção ativa manual", score: 40 },
            { id: 'mixed', label: "Mix de Inbound e Outbound estruturado", score: 80 },
            { id: 'predictable', label: "Máquina de vendas previsível e escalável", score: 100 }
        ]
    },
    {
        id: 'sales_process',
        text: "Existe um processo de vendas documentado e seguido pelo time?",
        category: 'Processes',
        options: [
            { id: 'none', label: "Não, cada um vende do seu jeito", score: 0 },
            { id: 'informal', label: "Existe, mas não está documentado", score: 30 },
            { id: 'documented', label: "Sim, temos playbooks documentados", score: 80 },
            { id: 'optimized', label: "Sim, e otimizamos constantemente com dados", score: 100 }
        ]
    },
    {
        id: 'lead_qualification',
        text: "Como vocês qualificam leads antes de passar para vendas?",
        category: 'Processes',
        options: [
            { id: 'none', label: "Não qualificamos, todo lead vai direto", score: 10 },
            { id: 'basic', label: "Qualificação básica (tamanho, setor)", score: 40 },
            { id: 'structured', label: "Usamos framework (BANT, MEDDIC, etc)", score: 80 },
            { id: 'automated', label: "Lead scoring automatizado + qualificação humana", score: 100 }
        ]
    },

    // BLOCO 4: DADOS & MÉTRICAS
    {
        id: 'data_analysis',
        text: "Com que frequência você analisa métricas de conversão (CAC, LTV, Churn)?",
        category: 'Data',
        options: [
            { id: 'never', label: "Não acompanho essas métricas", score: 0 },
            { id: 'rarely', label: "Quando sobra tempo / Reativamente", score: 30 },
            { id: 'monthly', label: "Mensalmente em planilhas", score: 60 },
            { id: 'realtime', label: "Tenho dashboards em tempo real", score: 100 }
        ]
    },
    {
        id: 'conversion_tracking',
        text: "Você sabe exatamente a taxa de conversão de cada etapa do funil?",
        category: 'Data',
        options: [
            { id: 'no_idea', label: "Não sei / Não acompanho", score: 0 },
            { id: 'rough', label: "Tenho uma ideia aproximada", score: 30 },
            { id: 'tracked', label: "Sim, acompanho as principais etapas", score: 70 },
            { id: 'granular', label: "Sim, tenho visibilidade granular de todo o funil", score: 100 }
        ]
    },
    {
        id: 'attribution',
        text: "Vocês conseguem rastrear de onde vêm os clientes que fecham?",
        category: 'Data',
        options: [
            { id: 'no', label: "Não, não sabemos a origem", score: 0 },
            { id: 'manual', label: "Perguntamos manualmente", score: 30 },
            { id: 'basic_tracking', label: "Usamos UTMs e tracking básico", score: 70 },
            { id: 'advanced', label: "Atribuição multi-touch completa", score: 100 }
        ]
    },

    // BLOCO 5: OBJETIVOS & GARGALOS
    {
        id: 'growth_goal',
        text: "Qual seu principal gargalo para crescer hoje?",
        category: 'Goals',
        options: [
            { id: 'leads', label: "Falta de Leads qualificados", score: 50 },
            { id: 'process', label: "Processo caótico / Falta de braço", score: 40 },
            { id: 'conversion', label: "Leads chegam mas não fecham", score: 60 },
            { id: 'retention', label: "Churn alto / LTV baixo", score: 70 }
        ]
    },
    {
        id: 'growth_target',
        text: "Qual a meta de crescimento para os próximos 12 meses?",
        category: 'Goals',
        options: [
            { id: 'maintain', label: "Manter estável / Crescimento orgânico", score: 30 },
            { id: 'moderate', label: "Crescer 30-50%", score: 60 },
            { id: 'aggressive', label: "Dobrar de tamanho (100%+)", score: 80 },
            { id: 'hypergrowth', label: "Crescimento exponencial (3x ou mais)", score: 100 }
        ]
    },
    {
        id: 'investment_readiness',
        text: "Qual o nível de investimento que a empresa pode fazer em Growth?",
        category: 'Goals',
        options: [
            { id: 'bootstrap', label: "Muito limitado / Bootstrap", score: 40 },
            { id: 'moderate', label: "Moderado (até 20% da receita)", score: 70 },
            { id: 'aggressive', label: "Agressivo (20-40% da receita)", score: 90 },
            { id: 'funded', label: "Temos funding/capital para investir pesado", score: 100 }
        ]
    }
];

export const calculateREIMaturityLevel = (totalScore: number) => {
    const maxScore = reiOnboardingQuestions.length * 100;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage < 25) return {
        level: "Fundação",
        color: "text-red-500",
        description: "Sua operação está no estágio inicial. Foco total em criar processos básicos, adotar ferramentas essenciais e estruturar o time.",
        action: "Setup Básico: CRM + Processos + Playbooks",
        priority: "Alta",
        timeline: "3-6 meses"
    };

    if (percentage < 50) return {
        level: "Estruturação",
        color: "text-orange-500",
        description: "Você já tem o básico, mas falta integração, automação e dados para escalar de forma previsível.",
        action: "Automação + Integração + Lead Scoring",
        priority: "Alta",
        timeline: "4-8 meses"
    };

    if (percentage < 70) return {
        level: "Escala",
        color: "text-yellow-500",
        description: "Boa estrutura! O desafio agora é otimizar conversão, reduzir CAC e aumentar LTV através de dados.",
        action: "Revenue Operations + Otimização de Funil",
        priority: "Média",
        timeline: "6-12 meses"
    };

    if (percentage < 85) return {
        level: "Otimização",
        color: "text-revgreen",
        description: "Operação madura! Foco em eficiência fina, expansão de canais e aumento de margens.",
        action: "Advanced Analytics + Expansão Multicanal",
        priority: "Média",
        timeline: "Contínuo"
    };

    return {
        level: "World Class",
        color: "text-blue-500",
        description: "Nível de excelência operacional. Foco em inovação, novos mercados e melhoria contínua.",
        action: "Consultoria Estratégica de Expansão",
        priority: "Baixa",
        timeline: "Contínuo"
    };
};
