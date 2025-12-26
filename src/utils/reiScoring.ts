// Função para calcular score do REI baseado nas respostas
export interface WizardData {
    // Step 1
    email: string;

    // Step 2
    segmento: string;
    tamanho: string;
    ticketMedio: string;
    cicloVendas: string;
    mrr: string;

    // Step 3
    desafios: string[];
    metaCrescimento: string;
    orcamento: string;
    prazo: string;
    metricaPrincipal: string;

    // Step 4
    canaisAquisicao: string[];
    crm: string;
    timeGrowth: string;
    metricas: string[];
    gargalo: string;

    // Step 5
    expectativas: string[];
    areasPrioridade: string[];
    prontidao: string;
    observacoes?: string;
}

export interface ScoreBreakdown {
    total: number;
    contextoNegocio: number;
    desafiosObjetivos: number;
    estrategiaAtual: number;
    prontidao: number;
    maturidade: number;
}

export const calculateReiScore = (data: WizardData): ScoreBreakdown => {
    let contextoNegocio = 0;
    let desafiosObjetivos = 0;
    let estrategiaAtual = 0;
    let prontidao = 0;
    let maturidade = 0;

    // 1. Contexto do Negócio (20 pontos)
    if (data.mrr === 'acima-1m') contextoNegocio += 10;
    else if (data.mrr === '500k-1m') contextoNegocio += 8;
    else if (data.mrr === '200k-500k') contextoNegocio += 6;
    else if (data.mrr === '50k-200k') contextoNegocio += 4;
    else contextoNegocio += 2;

    if (data.ticketMedio === 'acima-50k') contextoNegocio += 5;
    else if (data.ticketMedio === '10k-50k') contextoNegocio += 4;
    else if (data.ticketMedio === '2k-10k') contextoNegocio += 3;
    else contextoNegocio += 1;

    if (data.cicloVendas === 'ate-7d') contextoNegocio += 5;
    else if (data.cicloVendas === '7-30d') contextoNegocio += 4;
    else if (data.cicloVendas === '1-3m') contextoNegocio += 3;
    else contextoNegocio += 2;

    // 2. Desafios & Objetivos (25 pontos)
    if (data.metaCrescimento === '5x') desafiosObjetivos += 10;
    else if (data.metaCrescimento === '3x') desafiosObjetivos += 8;
    else if (data.metaCrescimento === '2x') desafiosObjetivos += 6;
    else desafiosObjetivos += 3;

    if (data.orcamento === 'acima-300k') desafiosObjetivos += 10;
    else if (data.orcamento === '100k-300k') desafiosObjetivos += 8;
    else if (data.orcamento === '30k-100k') desafiosObjetivos += 6;
    else if (data.orcamento === '10k-30k') desafiosObjetivos += 4;
    else desafiosObjetivos += 2;

    if (data.metricaPrincipal === 'mrr' || data.metricaPrincipal === 'roi') desafiosObjetivos += 5;
    else desafiosObjetivos += 3;

    // 3. Estratégia Atual (30 pontos)
    if (data.crm !== 'nao-utilizo') estrategiaAtual += 10;

    const metricasCount = data.metricas?.length || 0;
    if (metricasCount >= 4) estrategiaAtual += 10;
    else if (metricasCount >= 2) estrategiaAtual += 6;
    else estrategiaAtual += 2;

    if (data.timeGrowth === '10-plus') estrategiaAtual += 5;
    else if (data.timeGrowth === '6-10') estrategiaAtual += 4;
    else if (data.timeGrowth === '3-5') estrategiaAtual += 3;
    else estrategiaAtual += 1;

    const canaisCount = data.canaisAquisicao?.length || 0;
    if (canaisCount >= 3) estrategiaAtual += 5;
    else if (canaisCount >= 2) estrategiaAtual += 3;
    else estrategiaAtual += 1;

    // 4. Prontidão (15 pontos)
    if (data.prontidao === 'imediato') prontidao += 15;
    else if (data.prontidao === 'aprovacao') prontidao += 10;
    else if (data.prontidao === 'explorando') prontidao += 5;
    else prontidao += 0;

    // 5. Maturidade (10 pontos)
    if (data.segmento === 'b2b-saas') maturidade += 5;
    else if (data.segmento === 'b2b-servicos') maturidade += 4;
    else maturidade += 2;

    if (data.tamanho === 'growth') maturidade += 5;
    else if (data.tamanho === 'series-ab') maturidade += 4;
    else if (data.tamanho === 'seed') maturidade += 3;
    else maturidade += 1;

    const total = contextoNegocio + desafiosObjetivos + estrategiaAtual + prontidao + maturidade;

    return {
        total,
        contextoNegocio,
        desafiosObjetivos,
        estrategiaAtual,
        prontidao,
        maturidade
    };
};

export const generateRadarData = (breakdown: ScoreBreakdown) => {
    return [
        { label: 'Contexto', value: (breakdown.contextoNegocio / 20) * 100 },
        { label: 'Desafios', value: (breakdown.desafiosObjetivos / 25) * 100 },
        { label: 'Estratégia', value: (breakdown.estrategiaAtual / 30) * 100 },
        { label: 'Prontidão', value: (breakdown.prontidao / 15) * 100 },
        { label: 'Maturidade', value: (breakdown.maturidade / 10) * 100 },
    ];
};

export const generateInsights = (data: WizardData, breakdown: ScoreBreakdown): string[] => {
    const insights: string[] = [];

    // Pontos Fortes
    if (breakdown.contextoNegocio >= 16) {
        insights.push('✅ Forte contexto de negócio com MRR saudável e ticket médio adequado.');
    }

    if (breakdown.estrategiaAtual >= 24) {
        insights.push('✅ Estratégia bem estruturada com múltiplos canais e tracking de métricas.');
    }

    if (data.orcamento === 'acima-300k' || data.orcamento === '100k-300k') {
        insights.push('✅ Orçamento robusto permite investimento agressivo em crescimento.');
    }

    // Oportunidades
    if (!data.metricas?.includes('cac') || !data.metricas?.includes('ltv')) {
        insights.push('⚠️ Implementar tracking de LTV/CAC para otimizar investimento em aquisição.');
    }

    if (data.crm === 'nao-utilizo') {
        insights.push('⚠️ CRM é fundamental para escalar vendas. Recomendamos HubSpot ou Pipedrive.');
    }

    if (breakdown.estrategiaAtual < 20) {
        insights.push('⚠️ Diversificar canais de aquisição pode reduzir dependência e risco.');
    }

    // Recomendações
    if (data.gargalo === 'falta-leads') {
        insights.push('🚀 Foco em geração de demanda: implementar estratégia de inbound + outbound.');
    }

    if (data.gargalo === 'baixa-conversao') {
        insights.push('🚀 Otimizar funil de conversão: análise de cada etapa e testes A/B.');
    }

    if (data.gargalo === 'churn-alto') {
        insights.push('🚀 Priorizar retenção: onboarding estruturado e customer success ativo.');
    }

    // Limitar a 5 insights
    return insights.slice(0, 5);
};
