// ============================================================================
// diagnostic/mapper.ts
// P-01: Extraído de DiagnosticService.ts (era monolítico, 67KB).
// Contém: label maps + funções de mapeamento de IDs → textos legíveis.
// ============================================================================

/** Maps raw select IDs to human-readable labels for all REI form fields. */
export const LABEL_MAPS: Record<string, Record<string, string>> = {
    desafios: {
        'leads': 'Gerar mais leads qualificados', 'conversao': 'Melhorar taxa de conversão',
        'cac': 'Reduzir CAC', 'ltv': 'Aumentar LTV', 'escalar': 'Escalar operação de vendas',
        'churn': 'Reduzir churn', 'previsibilidade': 'Previsibilidade de receita',
    },
    canaisAquisicao: {
        'google-ads': 'Google Ads', 'meta-ads': 'Meta Ads (Facebook/Instagram)',
        'linkedin-ads': 'LinkedIn Ads', 'seo': 'SEO/Conteúdo', 'outbound': 'Outbound (Cold email/LinkedIn)',
        'indicacoes': 'Indicações/Referral', 'parcerias': 'Parcerias', 'eventos': 'Eventos',
    },
    metricas: {
        'cac': 'CAC (Custo de Aquisição)', 'ltv': 'LTV (Lifetime Value)', 'churn': 'Churn Rate',
        'mrr': 'MRR/ARR', 'conversao': 'Taxa de conversão', 'payback': 'Payback period',
        'nao-acompanho': 'Não acompanha métricas',
    },
    gargaloFunil: {
        'topo-volume': 'Topo: Volume baixo de leads', 'topo-qualidade': 'Topo: Leads desqualificados',
        'meio-followup': 'Meio: Sem resposta do lead', 'meio-processo': 'Meio: Leads estagnados no pipeline',
        'fundo-fechamento': 'Fundo: Taxa de fechamento baixa', 'pos-churn': 'Pós-venda: Churn alto',
        'dados-cegueira': 'Cegueira de Dados', 'outro': 'Outro',
    },
    crm: {
        'hubspot': 'HubSpot', 'funnels': 'Funnels', 'rd-station': 'RD Station',
        'salesforce': 'Salesforce', 'pipedrive': 'Pipedrive', 'activecampaign': 'ActiveCampaign',
        'nao-utilizo': 'Não utiliza CRM', 'outro': 'Outro',
    },
    metaCrescimento: {
        '2x': '2x (dobrar receita)', '3x': '3x (triplicar receita)', '5x': '5x ou mais',
        'manter': 'Manter e otimizar', 'nao-planejado': 'Sem meta definida',
    },
    timeGrowth: {
        'nao-tenho': 'Sem time dedicado', '1-2': '1–2 pessoas', '3-5': '3–5 pessoas',
        '6-10': '6–10 pessoas', '10-plus': '10+ pessoas',
    },
    ltvAtual: {
        'nao-sei': 'Não acompanha', 'menor-5k': '< R$ 5.000', '5k-20k': 'R$ 5.000–R$ 20.000',
        '20k-50k': 'R$ 20.000–R$ 50.000', 'maior-50k': '> R$ 50.000',
    },
    cacAtual: {
        'nao-sei': 'Não acompanha', 'menor-500': '< R$ 500', '500-2k': 'R$ 500–R$ 2.000',
        '2k-5k': 'R$ 2.000–R$ 5.000', 'maior-5k': '> R$ 5.000', 'acima-5k': '> R$ 5.000',
    },
    taxaChurn: {
        'nao-sei': 'Não acompanha', 'menor-2': '< 2% (excelente)', '2-5': '2–5% (bom)',
        '5-10': '5–10% (atenção)', 'maior-10': '> 10% (crítico)',
    },
    areasPrioridade: {
        'geracao-demanda': 'Geração de demanda', 'conversao-leads': 'Conversão de leads',
        'retencao': 'Retenção de clientes', 'expansao': 'Expansão (upsell/cross-sell)',
        'otimizacao-cac': 'Otimização de CAC', 'automacao': 'Automação de processos',
        'analise-dados': 'Análise de dados',
    },
    expectativas: {
        'oportunidades': 'Identificar oportunidades de crescimento', 'validar': 'Validar estratégia atual',
        'novos-canais': 'Descobrir novos canais', 'otimizar-funil': 'Otimizar funil de vendas',
        'reduzir-custos': 'Reduzir custos de aquisição', 'previsibilidade': 'Aumentar previsibilidade',
    },
};

/** Maps a raw ID to its label. Falls back to the raw value if not found. */
export function mapLabel(field: string, id: string): string {
    return LABEL_MAPS[field]?.[id] || id;
}

/** Maps an array of IDs to labels. */
export function mapLabels(field: string, ids: string[]): string[] {
    return ids.map(id => mapLabel(field, id));
}

/** Helper to safely convert incoming form elements that might be strings into Arrays. */
export function ensureArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
}

/** Check if answers indicate CRM usage. */
export function checkHasCRM(answers: any): boolean {
    const crmValue = (answers.crm || answers.crm_outro || answers.revops_hub_central || '').toLowerCase().trim();
    if (!crmValue || crmValue === 'nao' || crmValue === 'não' || crmValue === 'nenhum'
        || crmValue === 'nao_tenho' || crmValue === 'nao tenho' || crmValue === 'não tenho') return false;
    return true;
}

/** Check if answers indicate B2B business model. */
export function checkIsB2B(answers: any): boolean {
    const segment = (answers.segmento || answers.segmento_outro || answers.revops_segmento || '').toLowerCase();
    const tamanho = (answers.tamanho || answers.revops_tamanho_time || '').toLowerCase();
    const ticketMedio = (answers.ticketMedio || answers.revops_ticket_medio || '').toLowerCase();
    return segment.includes('b2b') || segment.includes('tech') || segment.includes('saas')
        || segment.includes('tecnologia') || segment.includes('consultoria') || segment.includes('software')
        || tamanho.includes('ep') || tamanho.includes('enterprise') || ticketMedio.includes('alto');
}

/** Resolve CRM display name from answers (handles 'outro' fallback and crm_ops flow). */
export function resolveCrmName(answers: any, projectType?: string): string {
    let crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
    if (projectType === 'crm_ops') {
        const rawCRM = answers.revops_hub_central;
        if (rawCRM && rawCRM.toLowerCase() !== 'nenhum'
            && rawCRM.toLowerCase() !== 'nao tenho' && rawCRM.toLowerCase() !== 'não tenho') {
            crmName = rawCRM;
        } else {
            crmName = 'Não informado';
        }
    }
    return crmName;
}
