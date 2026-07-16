
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
    category: 'Strategy' | 'Technology' | 'Processes' | 'Data';
}

export const diagnosticQuestions: QuizQuestion[] = [
    {
        id: 'team_structure',
        text: "Como está estruturado seu time comercial hoje?",
        category: 'Strategy',
        options: [
            { id: 'founding_sales', label: "Eu (Fundador/Sócio) vendo sozinho", score: 10 },
            { id: 'basic_team', label: "Tenho 1-2 vendedores generalistas", score: 30 },
            { id: 'specialized', label: "Tenho SDRs e Closers separados", score: 70 },
            { id: 'advanced', label: "Estrutura completa (SDR, AE, CS, Ops)", score: 100 }
        ]
    },
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
        id: 'growth_goal',
        text: "Qual seu principal gargalo para crescer hoje?",
        category: 'Strategy',
        options: [
            { id: 'leads', label: "Falta de Leads qualificados", score: 50 },
            { id: 'process', label: "Processo caótico / Falta de braço", score: 40 },
            { id: 'conversion', label: "Leads chegam mas não fecham", score: 60 },
            { id: 'retention', label: "Churn alto / LTV baixo", score: 70 }
        ]
    }
];

export const calculateMaturityLevel = (totalScore: number) => {
    const maxScore = diagnosticQuestions.length * 100;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage < 30) return {
        level: "Inicial",
        color: "text-red-500",
        description: "Sua operação ainda é muito manual. O foco deve ser criar processos básicos e adotar um CRM.",
        action: "Implementação de CRM e Processos Básicos"
    };

    if (percentage < 60) return {
        level: "Em Estruturação",
        color: "text-yellow-500",
        description: "Você já tem o básico, mas falta integração e automação para escalar de verdade.",
        action: "Automação de Vendas e Playbooks"
    };

    if (percentage < 85) return {
        level: "Em Escala",
        color: "text-revgreen",
        description: "Ótima estrutura! O desafio agora é otimizar margens, dados e eficiência fina.",
        action: "Revenue Operations & Data Intelligence"
    };

    return {
        level: "World Use",
        color: "text-blue-500",
        description: "Nível de excelência. Foco total em melhoria contínua e expansão de canais.",
        action: "Consultoria Avançada de Expansão"
    };
};
