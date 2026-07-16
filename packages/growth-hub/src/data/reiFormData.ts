// REI - Revenue Excellence Initiative
// Complete onboarding questions for client diagnostics

export interface REIFormData {
    // Basic Info
    company: string;
    segment: string;
    responsible: string;
    email: string;

    // Section 1: Produto e Expectativas
    expectedResults: string;
    productSolution: string;
    hasPlans: 'yes' | 'no' | 'personalized';
    targetAudience: string;

    // Section 2: Problema e Cliente
    idealCustomerProfiles: string;
    demographicProfile: string;
    recurringProblems: string;
    customerPains: string;
    lossIfNotBuy: string;
    emotionalResponse: string;
    savesTimeOrMoney: string;

    // Section 3: Comportamento do Cliente
    whereCustomersSearch: string;
    problemCauses: string;
    customerLocations: string;
    keywords: string;

    // Section 4: Mercado e Concorrência
    challenges: string;
    differentiation: string;
    competitors: string;
    marketTrends: string;

    // Section 5: Vendas e Marketing
    salesChannels: string;
    marketingTools: string;
    monthlyAdBudget: string;
    adScheduleRestrictions: string;
    adRegions: string;
    marketingStrategy: string;
    sdrCount: string;
    closerCount: string;
    currentCrm: string;
    marketingPlatform: string;

    // Section 6: Recursos e Processos
    salesCycle: string;
    leadNurturing: string;
    decisionFactor: string;
    growthStrategies: string;
    hasMarketingMaterials: 'complete' | 'basic' | 'none' | 'some';
    legalRestrictions: string;
    approvalProcess: string;
}

export interface REISection {
    id: string;
    title: string;
    description: string;
    icon: string;
    fields: REIField[];
}

export interface REIField {
    id: keyof REIFormData;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    placeholder?: string;
    required: boolean;
    options?: { value: string; label: string }[];
    helpText?: string;
}

export const reiSections: REISection[] = [
    {
        id: 'product',
        title: 'Produto e Expectativas',
        description: 'Entenda o que você oferece e onde quer chegar',
        icon: '🎯',
        fields: [
            {
                id: 'expectedResults',
                label: 'Quais resultados você espera alcançar nos próximos 12 meses?',
                type: 'textarea',
                placeholder: 'Descreva seus objetivos e metas...',
                required: true,
            },
            {
                id: 'productSolution',
                label: 'Qual é a solução (produto/serviço) que sua empresa oferece?',
                type: 'textarea',
                placeholder: 'Descreva sua solução...',
                required: true,
            },
            {
                id: 'hasPlans',
                label: 'Seu produto/serviço tem planos ou pacotes?',
                type: 'select',
                required: true,
                options: [
                    { value: 'yes', label: 'Sim, temos diferentes planos/pacotes' },
                    { value: 'no', label: 'Não, oferecemos apenas uma opção' },
                    { value: 'personalized', label: 'Oferecemos soluções personalizadas' },
                ],
            },
            {
                id: 'targetAudience',
                label: 'Para quem é o seu produto ou serviço (público-alvo)?',
                type: 'textarea',
                placeholder: 'Descreva seu público-alvo...',
                required: true,
            },
        ],
    },
    {
        id: 'customer',
        title: 'Problema e Cliente',
        description: 'Mapeie quem é seu cliente e qual problema você resolve',
        icon: '👥',
        fields: [
            {
                id: 'idealCustomerProfiles',
                label: 'Liste e descreva os perfis ideais dos seus clientes',
                type: 'textarea',
                placeholder: 'Ex: CEO de empresas B2B SaaS com 10-50 funcionários...',
                required: true,
            },
            {
                id: 'demographicProfile',
                label: 'Qual é o perfil demográfico do seu cliente ideal?',
                type: 'textarea',
                placeholder: 'Idade, cargo, setor, localização...',
                required: true,
            },
            {
                id: 'recurringProblems',
                label: 'Quais problemas mais recorrentes sua empresa resolve?',
                type: 'textarea',
                placeholder: 'Liste os principais problemas...',
                required: true,
            },
            {
                id: 'customerPains',
                label: 'Quando alguém procura sua empresa, quais dores ele(a) mais tem?',
                type: 'textarea',
                placeholder: 'Descreva as dores principais...',
                required: true,
            },
            {
                id: 'lossIfNotBuy',
                label: 'O que seu cliente em potencial perde caso não compre seu produto/serviço?',
                type: 'textarea',
                placeholder: 'Consequências de não resolver o problema...',
                required: true,
            },
            {
                id: 'emotionalResponse',
                label: 'Seu produto/serviço gera respostas emocionais positivas no cliente? Se sim, como?',
                type: 'textarea',
                placeholder: 'Alívio, confiança, empoderamento...',
                required: false,
            },
            {
                id: 'savesTimeOrMoney',
                label: 'Seu produto/serviço economiza tempo ou dinheiro para o cliente? Explique',
                type: 'textarea',
                placeholder: 'Como sua solução economiza tempo ou dinheiro...',
                required: true,
            },
        ],
    },
    {
        id: 'behavior',
        title: 'Comportamento do Cliente',
        description: 'Onde e como seu cliente busca soluções',
        icon: '🔍',
        fields: [
            {
                id: 'whereCustomersSearch',
                label: 'Onde seu potencial cliente procura respostas para o problema que sua empresa resolve?',
                type: 'textarea',
                placeholder: 'Google, LinkedIn, comunidades, eventos...',
                required: true,
            },
            {
                id: 'problemCauses',
                label: 'O que causa os problemas dos seus clientes?',
                type: 'textarea',
                placeholder: 'Causas raiz dos problemas...',
                required: true,
            },
            {
                id: 'customerLocations',
                label: 'Quais são os locais que seu cliente frequenta e onde ele está propenso a te escutar?',
                type: 'textarea',
                placeholder: 'Eventos, grupos, redes sociais específicas...',
                required: true,
            },
            {
                id: 'keywords',
                label: 'Quais são as principais palavras chave que seus clientes procuram ao buscarem sua solução?',
                type: 'textarea',
                placeholder: 'palavra-chave 1, palavra-chave 2, palavra-chave 3...',
                required: true,
            },
        ],
    },
    {
        id: 'market',
        title: 'Mercado e Concorrência',
        description: 'Entenda seu posicionamento no mercado',
        icon: '📊',
        fields: [
            {
                id: 'challenges',
                label: 'Quais são os principais desafios que sua empresa enfrenta ao atender às necessidades do seu cliente?',
                type: 'textarea',
                placeholder: 'Desafios operacionais, técnicos, comerciais...',
                required: true,
            },
            {
                id: 'differentiation',
                label: 'Como seu produto/serviço se diferencia dos seus concorrentes?',
                type: 'textarea',
                placeholder: 'Seu diferencial competitivo...',
                required: true,
            },
            {
                id: 'competitors',
                label: 'Quais são os concorrentes diretos da sua empresa?',
                type: 'textarea',
                placeholder: 'Liste os principais concorrentes...',
                required: true,
            },
            {
                id: 'marketTrends',
                label: 'Quais são as tendências ou mudanças no mercado que podem afetar a decisão de compra do seu cliente?',
                type: 'textarea',
                placeholder: 'Tendências de mercado relevantes...',
                required: true,
            },
        ],
    },
    {
        id: 'sales',
        title: 'Vendas e Marketing',
        description: 'Como você atrai e converte clientes hoje',
        icon: '💼',
        fields: [
            {
                id: 'salesChannels',
                label: 'Quais são os principais canais de vendas que você utiliza atualmente e que têm melhor desempenho?',
                type: 'textarea',
                placeholder: 'Inbound, Outbound, Parcerias, Indicações...',
                required: true,
            },
            {
                id: 'marketingTools',
                label: 'Quais ferramentas de marketing sua empresa utiliza atualmente?',
                type: 'textarea',
                placeholder: 'RD Station, HubSpot, Google Ads...',
                required: true,
            },
            {
                id: 'monthlyAdBudget',
                label: 'Qual valor você pretende investir em mídia paga por mês?',
                type: 'text',
                placeholder: 'Ex: R$ 5.000',
                required: false,
            },
            {
                id: 'adScheduleRestrictions',
                label: 'Existe alguma restrição de horário para seus anúncios serem veiculados? Se sim, qual? (Caso não tenha, apenas responda "Não")',
                type: 'textarea',
                placeholder: 'Horários específicos ou "Não"',
                required: false,
            },
            {
                id: 'adRegions',
                label: 'Em quais regiões seus anúncios devem veicular?',
                type: 'textarea',
                placeholder: 'Cidades, estados, países...',
                required: false,
            },
            {
                id: 'marketingStrategy',
                label: 'Já testou alguma estratégia de marketing e vendas? Se sim qual foi mais eficaz?',
                type: 'textarea',
                placeholder: 'Estratégias testadas e resultados...',
                required: false,
            },
            {
                id: 'sdrCount',
                label: 'Quantos SDRs no time?',
                type: 'text',
                placeholder: 'Número de SDRs',
                required: true,
            },
            {
                id: 'closerCount',
                label: 'Quantos closers no time?',
                type: 'text',
                placeholder: 'Número de closers',
                required: true,
            },
            {
                id: 'currentCrm',
                label: 'Qual seu CRM atual?',
                type: 'text',
                placeholder: 'Ex: HubSpot, Pipedrive, Salesforce...',
                required: true,
            },
            {
                id: 'marketingPlatform',
                label: 'Qual sua ferramenta de marketing?',
                type: 'text',
                placeholder: 'Ex: RD Station, HubSpot, ActiveCampaign...',
                required: true,
            },
        ],
    },
    {
        id: 'resources',
        title: 'Recursos e Processos',
        description: 'Como sua operação funciona internamente',
        icon: '⚙️',
        fields: [
            {
                id: 'salesCycle',
                label: 'Qual é o ciclo de vendas típico do seu produto/serviço, desde o primeiro contato até a finalização?',
                type: 'textarea',
                placeholder: 'Descreva o processo de vendas...',
                required: true,
            },
            {
                id: 'leadNurturing',
                label: 'Você realiza nutrição de leads e acompanhamento pós vendas? Se sim como é feito?',
                type: 'textarea',
                placeholder: 'Processo de nutrição e pós-venda...',
                required: false,
            },
            {
                id: 'decisionFactor',
                label: 'Qual o principal fator de decisão que faz seus clientes fecharem com você?',
                type: 'textarea',
                placeholder: 'Preço, qualidade, atendimento, expertise...',
                required: true,
            },
            {
                id: 'growthStrategies',
                label: 'Quais são as principais estratégias que você gostaria de explorar para crescer nos próximos meses?',
                type: 'textarea',
                placeholder: 'Estratégias de crescimento desejadas...',
                required: true,
            },
            {
                id: 'hasMarketingMaterials',
                label: 'Sua empresa possui materiais de marketing existentes (PDFs, vídeos, apresentações)?',
                type: 'select',
                required: false,
                options: [
                    { value: 'complete', label: 'Sim, temos materiais completos' },
                    { value: 'basic', label: 'Sim, mas são básicos' },
                    { value: 'none', label: 'Não temos materiais' },
                    { value: 'some', label: 'Temos alguns materiais' },
                ],
            },
            {
                id: 'legalRestrictions',
                label: 'Existe alguma limitação legal ou técnica que a agência precisa estar ciente?',
                type: 'textarea',
                placeholder: 'Restrições legais, técnicas ou regulatórias...',
                required: false,
            },
            {
                id: 'approvalProcess',
                label: 'Como é o processo de aprovação interno para campanhas e ações?',
                type: 'textarea',
                placeholder: 'Descreva o processo de aprovação...',
                required: true,
            },
        ],
    },
];

export const getInitialFormData = (): REIFormData => ({
    company: '',
    segment: '',
    responsible: '',
    email: '',
    expectedResults: '',
    productSolution: '',
    hasPlans: 'no',
    targetAudience: '',
    idealCustomerProfiles: '',
    demographicProfile: '',
    recurringProblems: '',
    customerPains: '',
    lossIfNotBuy: '',
    emotionalResponse: '',
    savesTimeOrMoney: '',
    whereCustomersSearch: '',
    problemCauses: '',
    customerLocations: '',
    keywords: '',
    challenges: '',
    differentiation: '',
    competitors: '',
    marketTrends: '',
    salesChannels: '',
    marketingTools: '',
    monthlyAdBudget: '',
    adScheduleRestrictions: '',
    adRegions: '',
    marketingStrategy: '',
    sdrCount: '',
    closerCount: '',
    currentCrm: '',
    marketingPlatform: '',
    salesCycle: '',
    leadNurturing: '',
    decisionFactor: '',
    growthStrategies: '',
    hasMarketingMaterials: 'none',
    legalRestrictions: '',
    approvalProcess: '',
});
