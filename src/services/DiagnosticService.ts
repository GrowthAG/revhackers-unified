import { ReiResponse } from "@/api/reiResponses";

export interface StrategicPlanData {
    premises_data: any;
    methodology_data: any;
    roadmap_data: any;
    goals_data: any;
    financial_projections: any;
    budget_data: any;
    next_steps_data: any;
    market_intelligence?: any;
}

export interface DiagnosticResult {
    summary: string;
    context_mirror: {
        segment: string;
        objective: string;
        maturity: string;
        restrictions: string;
    };
    signals: DiagnosticSignal[];
    risks: DiagnosticRisk[];
    opportunities: DiagnosticOpportunity[];
    decisions: StrategicDecision[];
    implementation_steps: ImplementationStep[]; // New field for Go Live tasks
    plan_data: StrategicPlanData;
}

export interface ImplementationStep {
    category: 'Infraestrutura' | 'Anúncios' | 'Automação' | 'Conteúdo';
    title: string;
    description: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    estimated_time: string;
}

export interface DiagnosticSignal {
    id: string;
    type: 'positive' | 'negative' | 'neutral';
    headline?: string;
    text: string;
    impact: string;
}

export interface DiagnosticRisk {
    id: string;
    severity: 'high' | 'medium' | 'low';
    headline?: string;
    text: string;
    mitigation: string;
}

export interface DiagnosticOpportunity {
    id: string;
    impact: 'high' | 'medium' | 'low';
    text: string;
    action: string;
}

export interface StrategicDecision {
    title: string;
    recommendation: string;
    basedOn: string[];
    ruleApplied: string;
    implication: string;
}

// ── Central Label Maps for REI Select Fields ────────────────────────────────
const LABEL_MAPS: Record<string, Record<string, string>> = {
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
function mapLabel(field: string, id: string): string {
    return LABEL_MAPS[field]?.[id] || id;
}

/** Maps an array of IDs to labels. */
function mapLabels(field: string, ids: string[]): string[] {
    return ids.map(id => mapLabel(field, id));
}

export class DiagnosticService {
    /**
     * Fallback for AI Benchmarks based on raw REI data
     */
    static generateBenchmarkFromREI(answers: any): any[] {
        const competitors = [];
        
        // Tentamos preencher com os concorrentes informados no formulário CRM Ops
        for (let i = 1; i <= 3; i++) {
            const name = answers[`revops_concorrente${i}_nome`] || answers[`concorrente${i}_nome`];
            const url = answers[`revops_concorrente${i}_site`] || answers[`concorrente${i}_site`];
            
            if (name) {
                competitors.push({
                    company_name: name,
                    domain: url || '',
                    monthly_traffic: '-',
                    domain_authority: 0,
                    avg_cpc: '-',
                    top_keywords: [],
                    strengths: 'Concorrente direto reportado',
                    weaknesses: 'A validar em pesquisa profunda',
                });
            }
        }

        // Se o cliente não preencheu nada, enviamos um placeholder
        if (competitors.length === 0) {
            competitors.push({
                company_name: 'Não informado',
                domain: '',
                monthly_traffic: '-',
                domain_authority: 0,
                avg_cpc: '-',
                top_keywords: [],
                strengths: '',
                weaknesses: '',
            });
        }

        return competitors;
    }

    /**
     * Fallback for AI Personas based on raw REI data
     */
    static generatePersonasFromREI(answers: any): any[] {
        return [{
            name: 'Persona Principal',
            role: 'Tomador de Decisão',
            age: 35,
            location: 'Brasil',
            company_context: answers.segmento || answers.revops_segmento || 'Mercado Geral',
            bio: 'Perfil baseado nas respostas iniciais do formulário estrategico.',
            channels: answers.canaisAquisicao || ['LinkedIn', 'Google'],
            personality: {
                analytical_creative: 50,
                passive_active: 50,
                reserved_extroverted: 50,
                reactive_preventive: 50
            },
            pain: (answers.desafios || []).join('. ') || 'Necessidade de melhorar resultados operacionais.',
            trigger: 'Busca por eficiência e conversões.',
            message: 'Acelere seus resultados com nossa solução focada no seu segmento.',
            wiifm: 'Aumento de receita mapeada e controle de dados.'
        }];
    }

    /**
     * Fallback for AI Trends based on raw REI data
     */
    static generateDefaultTrends(answers: any): string[] {
        const isB2B = this.checkIsB2B(answers);
        if (isB2B) {
            return ['Account-Based Marketing Integrado', 'RevOps como Estrutura Base', 'Vendas B2B Data-Driven', 'Automação de Follow-up Humanizada'];
        }
        return ['Marketing Omnichannel', 'Hiper-personalização', 'Jornada do Cliente Integrada', 'Conversational Commerce'];
    }

    /**
     * Helper to safely convert incoming form elements that might be strings into Arrays.
     * Prevents "x.forEach is not a function" crashes.
     */
    private static ensureArray(value: any): string[] {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        return [];
    }

    static generateDiagnosis(response: ReiResponse, marketData?: any, projectType?: string, aiPlanData?: any): DiagnosticResult {
        const rawResponses = response.responses as Record<string, any>;
        // FIX: REI wizard wraps form data inside responses.form_data
        const answers = rawResponses?.form_data || rawResponses || {};
        const plan_data = this.generatePlanFromResponse(response, marketData, projectType, aiPlanData);

        // --- INTELLIGENCE LAYER (The Voice) ---
        const segment = answers.revops_segmento || answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.revops_objetivo_principal || answers.metaCrescimento || answers.objetivoPrincipal || (projectType === 'crm_ops' ? 'Eficiência Operacional & Escala' : 'Crescimento');
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';
        const ticketMedio = answers.revops_ticket_medio || answers.ticketMedio || '';
        const tamanho = answers.revops_tamanho_time || answers.tamanho || '';

        let crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        if (projectType === 'crm_ops') {
            const rawCRM = answers.revops_hub_central;
            if (rawCRM && rawCRM.toLowerCase() !== 'nenhum' && rawCRM !== 'Não tenho' && rawCRM !== '') {
                crmName = rawCRM;
            }
        }

        // 1. Context Mirror (using REAL REI data or AI)
        const restrictionsText = projectType === 'crm_ops'
            ? `${tamanho ? `Equipe: ${tamanho}` : 'Tamanho: Não informado'}${ticketMedio ? ` | Ticket: ${ticketMedio}` : ''}`
            : `Budget: ${budget}${ticketMedio ? ` | Ticket: ${ticketMedio}` : ''}${tamanho ? ` | Equipe: ${tamanho}` : ''}`;

        // Fallback strategy: ensure segment and objective are ALWAYS present
        const websiteUrl = answers.website_url || null;
        const context_mirror = aiPlanData?.context_mirror ? {
            ...aiPlanData.context_mirror,
            segment: aiPlanData.context_mirror.segment || segment,
            objective: aiPlanData.context_mirror.objective || objective,
            ...(websiteUrl && { website_url: websiteUrl }),
        } : {
            segment,
            objective,
            maturity: hasCRM ? `Intermediária/Avançada (CRM: ${crmName})` : 'Inicial (Sem CRM Central)',
            restrictions: restrictionsText,
            ...(websiteUrl && { website_url: websiteUrl }),
        };

        // 2. Signals
        let signals: DiagnosticSignal[] = aiPlanData?.signals || [];
        if (!signals.length) {
            if (projectType === 'crm_ops') {
                const hasPipelines = Array.isArray(answers.revops_custom_pipelines) && answers.revops_custom_pipelines.length > 0;
                const pipelineCount = hasPipelines ? answers.revops_custom_pipelines.length : 0;
                
                if (hasCRM) signals.push({ id: 's1', type: 'positive', headline: 'Arquitetura Presente', text: `Arquitetura inicial presente no ${crmName}`, impact: 'Base tecnológica pré-existente diminui atrito de infraestrutura.' });
                else signals.push({ id: 's2', type: 'negative', headline: 'Vendas Desestruturada', text: 'Operação de Vendas Desestruturada', impact: 'Falta de Controle Central resulta em vazamentos no funil comercial.' });
                
                if (hasPipelines) {
                    signals.push({ id: 'spipe', type: 'neutral', headline: 'Múltiplos Funis', text: `${pipelineCount} Fun${pipelineCount > 1 ? 'is' : 'il'} de Negócios Mapeado${pipelineCount > 1 ? 's' : ''}`, impact: `Mapeamento As-Is indicou a existência de ${answers.revops_custom_pipelines.map((p: any) => p.name).join(', ')}.`});
                }

                if (answers.revops_sla_marketing_vendas) signals.push({ id: 's3', type: 'neutral', headline: 'SLA Declarado', text: 'Critério de MQL/SQL Declarado', impact: 'Exige validação das réguas de hand-off para garantir alinhamento entre áreas.' });
                else if (isB2B) signals.push({ id: 's3', type: 'neutral', headline: 'Ciclo B2B Complexo', text: 'Ciclo B2B Complexo', impact: 'O ticket e o fechamento B2B exigem rastreabilidade avançada e automação de SLAs.' });
            } else {
                if (hasCRM) signals.push({ id: 's1', type: 'positive', headline: 'Infraestrutura Presente', text: 'Infraestrutura de Dados Presente', impact: 'Permite Escala e Otimização Rápida' });
                else signals.push({ id: 's2', type: 'negative', headline: 'Cegueira Operacional', text: 'Ausência de CRM', impact: 'Cegueira Operacional' });
                if (isB2B) signals.push({ id: 's3', type: 'neutral', headline: 'Jornada B2B', text: 'Jornada B2B', impact: 'Necessidade Múltipla de Nutrição' });
            }
        }

        // 3. Risks
        let risks: DiagnosticRisk[] = aiPlanData?.risks || [];
        if (!risks.length) {
            if (projectType === 'crm_ops') {
                const hasLostReasons = Array.isArray(answers.revops_lost_reasons) && answers.revops_lost_reasons.length > 0;
                const lostCount = hasLostReasons ? answers.revops_lost_reasons.length : 0;

                if (!hasCRM) risks.push({ id: 'r1', severity: 'high', headline: 'Cegueira Analítica', text: 'Maturidade de Dados Crítica (Cegueira Analítica)', mitigation: 'Setup obrigatório da fundação do CRM na semana 1 como marco principal do projeto.' });
                
                if (answers.revops_pipeline_stagnation) {
                    risks.push({ id: 'r2', severity: 'medium', headline: 'Gargalos no Funil', text: `Gargalo: Regras de Estagnação Ausentes ou Fracas`, mitigation: `Desenhar alertas e automações no CRM para evitar o apodrecimento de deals baseado no cenário descrito: "${answers.revops_pipeline_stagnation.substring(0, 50)}..."` });
                } else {
                    risks.push({ id: 'r2', severity: 'medium', headline: 'Sem Governança', text: 'Pipelines Visuais mas sem Governança', mitigation: 'Mapeamento As-Is dos estágios e imposição de propriedades obrigatórias por fase.' });
                }

                if (hasLostReasons) {
                    risks.push({ id: 'rlost', severity: 'medium', headline: 'Perdas Estruturais', text: `${lostCount} Motivos de Perda Estruturais sem Matriz de Win/Loss`, mitigation: `Criar relatórios de conversão invertida agrupando as objeções (${answers.revops_lost_reasons.slice(0, 3).map((l: any) => l.reason).join(', ')}...) para loop de feedback com produto/marketing.` });
                } else if (answers.revops_win_loss_analysis) {
                     risks.push({ id: 'rwinloss', severity: 'medium', headline: 'Sem Feedback de Perdas', text: 'Cultura de Win/Loss não está retroalimentando o Pipeline', mitigation: 'Institucionalizar o processo de Loss Reason auditável para entender onde o Lead escapa.' });
                }
            } else {
                if (!hasCRM && objective === 'Escala Agressiva') risks.push({ id: 'r1', severity: 'high', headline: 'Escala sem rastro', text: 'Escala sem rastreabilidade', mitigation: 'Implantar CRM antes de aumentar o Spend em Ads' });
                if (budget === 'Baixo' && isB2B) risks.push({ id: 'r2', severity: 'medium', headline: 'Budget Insuficiente', text: 'Budget insuficiente para Paid Media', mitigation: 'Focar em Social Selling e Outbound' });
            }
        }

        // 4. Decisions (Explicability)
        let decisions: StrategicDecision[] = aiPlanData?.decisions || [];
        if (!decisions.length) {
            if (projectType === 'crm_ops') {
                decisions.push({
                    title: 'Design de Governança',
                    recommendation: hasCRM ? `Otimização do ${crmName}` : 'Implementação de CRM',
                    basedOn: ['Maturidade'], ruleApplied: 'Diretriz Arquitetura', implication: 'Período obrigatório de adequação'
                });
            } else {
                decisions.push({
                    title: 'Estratégia de Aquisição',
                    recommendation: isB2B ? 'Foco em Prospecção ' : 'Foco em Anúncios',
                    basedOn: ['Modelo', 'Ticket'], ruleApplied: 'Abordagem Direta', implication: 'Requer estrutura'
                });
            }
        }


        // 5. Implementation Steps (Go Live)
        const implementation_steps = this.generateImplementationSteps(hasCRM, isB2B, objective, projectType);

        return {
            summary: aiPlanData?.summary || `Diagnóstico realizado para estratégia ${projectType === 'crm_ops' ? 'CRM & RevOps' : isB2B ? 'B2B' : 'B2C'}. Foco em: ${objective}.`,
            context_mirror,
            signals,
            risks,
            opportunities: [],
            decisions,
            implementation_steps,
            plan_data
        };
    }

    private static generateImplementationSteps(hasCRM: boolean, isB2B: boolean, objective: string, projectType?: string): ImplementationStep[] {
        const steps: ImplementationStep[] = [];

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            steps.push({
                category: 'Infraestrutura',
                title: 'Mapeamento As-Is e Deal Pipelines',
                description: 'Desenho visual das etapas de vendas, motivos de perda e gargalos atuais do funil de aquisição.',
                priority: 'Alta',
                estimated_time: '3 dias'
            });
            steps.push({
                category: 'Infraestrutura',
                title: 'Design de Propriedades Customizadas',
                description: 'Criação de campos nativos no CRM para mapear Dados de Qualificação, UTMs, e SLA de Hand-off.',
                priority: 'Alta',
                estimated_time: '2 dias'
            });
            steps.push({
                category: 'Automação',
                title: 'Automação de Roteamento e Hand-off',
                description: 'Criação de workflows para distribuir leads automaticamente e alertar o time em quebras de SLA.',
                priority: 'Alta',
                estimated_time: '4 dias'
            });
            steps.push({
                category: 'Automação',
                title: 'Treinamento Comercial e Playbooks',
                description: 'Encontro executivo para Onboarding do time de vendas visando maximizar a adoção sistêmica.',
                priority: 'Alta',
                estimated_time: '2 dias'
            });
            return steps;
        }

        // 1. INFRAESTRUTURA (FLUXO PADRÃO)
        if (!hasCRM) {
            steps.push({
                category: 'Infraestrutura',
                title: 'Implementação de CRM',
                description: 'Configurar PipeDrive ou HubSpot, criar funil de vendas e definir etapas padrão.',
                priority: 'Alta',
                estimated_time: '3 dias'
            });
        }
        steps.push({
            category: 'Infraestrutura',
            title: 'Configuração de DNS e Email',
            description: 'Configurar SPF, DKIM e DMARC para garantir entregabilidade dos emails.',
            priority: 'Alta',
            estimated_time: '1 dia'
        });

        // 2. ANÚNCIOS (Mídia Paga)
        steps.push({
            category: 'Anúncios',
            title: 'Configuração de Pixel e API',
            description: 'Instalar Pixel do Meta e Tag de Conversão do Google com GTM.',
            priority: 'Alta',
            estimated_time: '1 dia'
        });
        if (isB2B) {
            steps.push({
                category: 'Anúncios',
                title: 'Criação de Audiência LinkedIn',
                description: 'Subir listas de empresas alvo e criar públicos de remarketing.',
                priority: 'Média',
                estimated_time: '2 dias'
            });
        }

        // 3. AUTOMAÇÃO
        steps.push({
            category: 'Automação',
            title: 'Fluxo de Cadência de Email',
            description: 'Criar sequência de 5 emails para leads novos (follow-up automático).',
            priority: 'Média',
            estimated_time: '2 dias'
        });

        // 4. CONTEÚDO
        steps.push({
            category: 'Conteúdo',
            title: 'Produção de Criativos Fase 1',
            description: isB2B
                ? 'Criar Whitepaper/Case para download (Isca Digital).'
                : 'Criar 3 variações de vídeo para ADS (UGC/Depoimento).',
            priority: 'Alta',
            estimated_time: '5 dias'
        });

        return steps;
    }


    static generatePlanFromResponse(response: ReiResponse, marketData?: any, projectType?: string, aiPlanData?: any): StrategicPlanData {
        const rawResponses = response.responses as Record<string, any>;
        // FIX: REI wizard wraps form data inside responses.form_data
        const answers = rawResponses?.form_data || rawResponses || {};

        // 1. ANALYZE CONTEXT (using actual REI field names)
        const segment = answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.metaCrescimento || answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';

        // Extract specific GTM data from REAL REI fields
        const challenges = answers.desafios || [];
        const bottlenecksRaw = answers.gargaloFunil || answers.gargalo || '';
        const bottlenecks = bottlenecksRaw === 'outro' ? (answers.gargaloFunil_outro || answers.gargalo_outro || 'Outro') : mapLabel('gargaloFunil', bottlenecksRaw) || 'Não identificado';
        const channels = answers.canaisAquisicao || [];
        const growthGoal = mapLabel('metaCrescimento', answers.metaCrescimento || '') || 'Não definida';

        // 2. GENERATE MODULES (ALL receive full answers for real data)
        return {
            premises_data: aiPlanData?.pillars ? { pillars: aiPlanData.pillars } : this.generatePremises(segment, objective, bottlenecks, answers, projectType),
            methodology_data: aiPlanData?.methodology_steps ? { steps: aiPlanData.methodology_steps } : this.generateMethodology(isB2B, channels, answers, projectType),
            roadmap_data: aiPlanData?.roadmap_phases
                ? { phases: aiPlanData.roadmap_phases, project_duration: aiPlanData.project_duration || undefined }
                : this.generateRoadmap(hasCRM, isB2B, challenges, answers, marketData, projectType),
            goals_data: aiPlanData?.okrs ? {
                okrs: aiPlanData.okrs.map((o: any) => ({
                    ...o,
                    // AI returns sub_results: string[] - map to krs format GoalsSection expects
                    krs: Array.isArray(o.sub_results) && o.sub_results.length > 0
                        ? o.sub_results.map((text: string, j: number) => ({
                            label: `RK ${j + 1}`,
                            text,
                            target: o.timeline || 'Trimestre'
                        }))
                        : (o.krs || [])
                }))
            } : this.generateGoals(objective, growthGoal, answers, projectType),
            financial_projections: this.generateProjections(budget, answers),
            budget_data: this.generateBudget(budget, isB2B, answers, projectType),
            next_steps_data: this.generateNextSteps(hasCRM, answers, projectType),
            market_intelligence: marketData || null
        };
    }

    // --- HELPER LOGIC ---

    private static checkHasCRM(answers: any): boolean {
        const crmValue = (answers.crm || answers.crm_outro || answers.revops_hub_central || '').toLowerCase().trim();
        if (!crmValue || crmValue === 'nao' || crmValue === 'não' || crmValue === 'nenhum' || crmValue === 'nao_tenho' || crmValue === 'nao tenho' || crmValue === 'não tenho') return false;
        return true;
    }

    private static checkIsB2B(answers: any): boolean {
        const segment = (answers.segmento || answers.segmento_outro || answers.revops_segmento || '').toLowerCase();
        const tamanho = (answers.tamanho || answers.revops_tamanho_time || '').toLowerCase();
        const ticketMedio = (answers.ticketMedio || answers.revops_ticket_medio || '').toLowerCase();
        return segment.includes('b2b') || segment.includes('tech') || segment.includes('saas') || segment.includes('tecnologia') || segment.includes('consultoria') || segment.includes('software') || tamanho.includes('ep') || tamanho.includes('enterprise') || ticketMedio.includes('alto');
    }

    // --- GENERATORS (ALL use real REI answers) ---

    private static generatePremises(segment: string, objective: string, bottleneck: string, answers: any, projectType?: string) {
        let crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        if (projectType === 'crm_ops') {
            const rawCRM = answers.revops_hub_central;
            if (rawCRM && rawCRM.toLowerCase() !== 'nenhum' && rawCRM.toLowerCase() !== 'nao tenho' && rawCRM.toLowerCase() !== 'não tenho') {
                crmName = rawCRM;
            } else {
                crmName = 'Não informado';
            }
        }
        const hasCRM = this.checkHasCRM(answers);
        let ticketMedio = answers.revops_ticket_medio || answers.ticketMedio || '';
        if (ticketMedio && !ticketMedio.toLowerCase().includes('r$')) {
            ticketMedio = `R$ ${ticketMedio}`;
        }
        const mrr = answers.mrr || '';
        const churn = answers.taxaChurn || '';
        const canais = mapLabels('canaisAquisicao', answers.canaisAquisicao || []).join(', ') || 'Não informados';
        const tamanho = answers.tamanho || '';
        const observacoes = (answers.observacoes || '').trim();
        const attempts = (answers.implementationAttempts || '').trim();

        // Map select values to readable labels
        const mrrLabels: Record<string, string> = {
            'ate-50k': 'Até R$ 50k/mês', '50k-200k': 'R$ 50k–200k/mês',
            '200k-500k': 'R$ 200k–500k/mês', '500k-1m': 'R$ 500k–1M/mês', 'acima-1m': 'Acima de R$ 1M/mês',
        };
        const tamanhoLabels: Record<string, string> = {
            'pre-seed': 'Pré-Seed / Early Stage', 'seed': 'Seed', 'serie-a': 'Série A',
            'serie-b': 'Série B+', 'pme': 'PME', 'enterprise': 'Enterprise',
        };
        const churnLabels: Record<string, string> = {
            '0-2': '0–2% (excelente)', '2-5': '2–5% (moderado)', '5-10': '5–10% (alto)', 'acima-10': 'Acima de 10% (crítico)',
        };

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            const hasPipelines = Array.isArray(answers.revops_custom_pipelines) && answers.revops_custom_pipelines.length > 0;
            const pipelinesList = hasPipelines
                ? answers.revops_custom_pipelines.map((p: any) => p.name).join(', ')
                : 'Pipelines estruturados (SDR / Closer / CS)';

            const hasLostReasons = Array.isArray(answers.revops_lost_reasons) && answers.revops_lost_reasons.length > 0;
            const lostReasonsCount = hasLostReasons ? answers.revops_lost_reasons.length : 0;

            const contextoItems = [
                hasPipelines ? `Processos As-Is Mapeados (${answers.revops_custom_pipelines.length} Funis identificados)` : 'Processo de Vendas As-Is Mapeado',
            ];
            contextoItems.push(`CRM Atual: ${crmName}`);

            if (answers.revops_segmento) contextoItems.push(`Segmento B2B: ${answers.revops_segmento}`);
            if (ticketMedio) contextoItems.push(`Ticket Médio Estimado: ${ticketMedio}`);
            if (answers.revops_tamanho_time) contextoItems.push(`Time Comercial: ${answers.revops_tamanho_time}`);
            contextoItems.push(`Objetivo: ${objective}`);
            const competidoresCrm = [1, 2, 3].map(n => answers[`revops_concorrente${n}_nome`]).filter(Boolean);
            if (competidoresCrm.length) contextoItems.push(`Concorrentes: ${competidoresCrm.join(', ')}`);

            const operacionalItems = [
                'Lacunas de rastreamento e atribuição identificadas',
            ];
            if (hasLostReasons) {
                operacionalItems.push(`Catálogo Mapeado: ${lostReasonsCount} motivos de perda (Lost Reasons) customizados`);
            } else {
                operacionalItems.push('Catálogo de motivos de perda padronizado');
            }
            if (answers.revops_win_loss_analysis) {
                // Shorten win loss text if too long
                const winLoss = answers.revops_win_loss_analysis.substring(0, 60).split(':')[0] || 'Governança W/L';
                operacionalItems.push(`Governança de Win/Loss mapeada: ${winLoss}`);
            } else {
                operacionalItems.push('Análise de ciclo e quebra de conversão');
            }
            operacionalItems.push('Críterios de Hand-off entre áreas mapeados');

            const arquiteturaItems = [
                `Arquitetura de Pipelines: ${pipelinesList}`,
                'Propriedades obrigatórias por estágio e validações',
            ];
            if (answers.revops_pipeline_stagnation) {
                arquiteturaItems.push(`SLA e Estagnação de Pipeline: Definição de ${answers.revops_pipeline_stagnation}`);
            } else {
                arquiteturaItems.push('Automações e Gatilhos de Mudança de Fase');
            }
            arquiteturaItems.push('Painel de Liderança (Visão executiva) desenhado');

            const crmPillars = [
                {
                    name: 'Contexto do Cliente',
                    icon: 'building',
                    items: contextoItems
                },
                {
                    name: 'Diagnóstico Operacional',
                    icon: 'search',
                    items: operacionalItems
                },
                {
                    name: 'Arquitetura & Governança',
                    icon: 'settings',
                    items: arquiteturaItems
                },
                {
                    name: 'Compromissos Mútuos',
                    icon: 'handshake',
                    items: [
                        'Disponibilidade do time para treinamentos operacionais',
                        'Acessos administrativos às ferramentas fornecidos em 48h',
                        'Aprovação da arquitetura de pipelines em até 3 dias úteis',
                        'Comprometimento da liderança com a adoção do sistema'
                    ]
                }
            ];

            // Add context pillar if observacoes or attempts exist
            if (observacoes || attempts) {
                const contextItems: string[] = [];
                if (observacoes) contextItems.push(`Contexto: ${observacoes}`);
                if (attempts) contextItems.push(`Tentativas Anteriores: ${attempts}`);
                crmPillars.push({
                    name: 'Observações do Cliente',
                    icon: 'message-circle',
                    items: contextItems,
                });
            }

            return { pillars: crmPillars };
        }

        const pillars: any[] = [
            {
                name: 'Contexto do Negócio',
                icon: 'building',
                items: [
                    `Segmento: ${segment}`,
                    tamanho ? `Porte: ${tamanhoLabels[tamanho] || tamanho}` : null,
                    ticketMedio ? `Ticket Médio: ${ticketMedio}` : null,
                    mrr ? `MRR Atual: ${mrrLabels[mrr] || mrr}` : null,
                ].filter(Boolean)
            },
            {
                name: 'Stack & Infraestrutura',
                icon: 'settings',
                items: [
                    hasCRM ? `CRM Atual: ${crmName}` : 'Sem CRM implementado',
                    `Canais de Aquisição: ${canais}`,
                    churn ? `Taxa de Churn: ${churnLabels[churn] || churn}` : null,
                ].filter(Boolean)
            },
            {
                name: 'Diagnóstico Estratégico',
                icon: 'search',
                items: [
                    `Objetivo Principal: ${objective}`,
                    `Gargalo Identificado: ${bottleneck}`,
                    `Maturidade Digital: ${hasCRM ? 'Intermediária (possui ferramentas)' : 'Inicial (sem ferramentas estruturadas)'}`,
                ]
            }
        ];

        // Add context pillar if observações or attempts exist
        if (observacoes || attempts) {
            const contextItems: string[] = [];
            if (observacoes) contextItems.push(`Contexto: ${observacoes}`);
            if (attempts) contextItems.push(`Tentativas Anteriores: ${attempts}`);
            pillars.push({
                name: 'Observações do Cliente',
                icon: 'message-circle',
                items: contextItems,
            });
        }

        return { pillars };
    }

    private static generateMethodology(isB2B: boolean, currentChannels: string[], answers: any, projectType?: string) {
        const steps = [];

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            steps.push({
                phase: '01', tagline: 'Semana 1–2',
                name: 'Auditoria & Arquitetura As-Is',
                description: 'Levantamento minucioso do processo de vendas atual, vazamentos de pipeline e lacunas de dados que prejudicam a previsibilidade.',
                principles: ['Mapeamento do processo de vendas As-Is', 'Auditoria de vazamentos de pipeline', 'Definição de propriedades obrigatórias']
            });
            steps.push({
                phase: '02', tagline: 'Semana 3–4',
                name: 'Setup de Propriedades e Pipelines',
                description: 'Configuração dos funis de negócio no CRM, mapeando propriedades essenciais (UTMs, Ticket Médio, Razões de Perda) para governança.',
                principles: ['Criação do Funil Visual de Vendas', 'Padronização de UTMs e Atribuição', 'Catálogo de motivos de perda']
            });
            steps.push({
                phase: '03', tagline: 'Semana 5–6',
                name: 'Integrações de Geração de Demanda',
                description: 'Conexão nativa do CRM com canais de aquisição (Google, Meta Ads, Landing Pages, Whatsapp) eliminando entrada manual.',
                principles: ['Integração com Landing Pages via API/Webhook', 'Conexão Nativa com Meta/Google Ads Leit', 'Enriquecimento de dados ativado']
            });
            steps.push({
                phase: '04', tagline: 'Semana 7–8',
                name: 'Automação de Hand-off e SLA',
                description: 'Workflows para roteamento de leads, alertas de estagnação e tarefas automatizadas reduzindo atrito entre Marketing e Vendas.',
                principles: ['Passagem de bastão automática SDR para Closer', 'Alertas de estagnação de negócios para gestor', 'Roteamento Round-Robin de novos leads']
            });
            steps.push({
                phase: '05', tagline: 'Semana 9–12',
                name: 'Adoção Organizacional',
                description: 'Treinamento direcionado para os executivos focando em redução de cliques diários, painéis de visão e aculturamento data-driven.',
                principles: ['Treinamento prático com a equipe de vendas', 'Criação de Dashboards individuais de performance', 'Dashboard macro para Diretoria']
            });
            return { steps };
        }

        const desafios = this.ensureArray(answers.desafios);
        const gargaloRaw = answers.gargaloFunil || answers.gargalo || '';
        const gargalo = gargaloRaw === 'outro' ? (answers.gargaloFunil_outro || answers.gargalo_outro || '') : mapLabel('gargaloFunil', gargaloRaw);
        const hasCRM = this.checkHasCRM(answers);
        const crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        const expectativas = this.ensureArray(answers.expectativas);
        const areas = this.ensureArray(answers.areasPrioridade);

        // Step 1: Based on CRM status
        if (!hasCRM) {
            steps.push({ name: 'Implementação de CRM', description: 'Seleção e configuração de CRM adequado ao porte e segmento da empresa. Sem CRM, toda estratégia de growth fica limitada.' });
        } else {
            steps.push({ name: `Otimização do ${crmName}`, description: `Auditoria e otimização do ${crmName} atual para garantir dados limpos, pipeline estruturado e automações funcionais.` });
        }

        // Step 2: Based on challenges identified
        if (desafios.includes('leads')) {
            steps.push({ name: 'Motor de Geração de Leads', description: 'Construção de funil de aquisição com landing pages, formulários inteligentes e lead scoring baseado no perfil ideal.' });
        }
        if (desafios.includes('conversao') || gargalo.toLowerCase().includes('conversão') || gargalo.toLowerCase().includes('fechamento')) {
            steps.push({ name: 'Otimização de Conversão (CRO)', description: `Resolução do gargalo identificado: "${gargalo}". Testes A/B, melhoria de proposta de valor e redução de fricção no funil.` });
        }
        if (desafios.includes('churn') || desafios.includes('ltv')) {
            steps.push({ name: 'Programa de Retenção', description: `Redução de churn${answers.taxaChurn ? ` (atual: ${mapLabel('taxaChurn', answers.taxaChurn)})` : ''} com onboarding estruturado, health score e playbooks de sucesso do cliente.` });
        }
        if (desafios.includes('cac')) {
            steps.push({ name: 'Otimização de CAC', description: `Redução do Custo de Aquisição${answers.cacAtual ? ` (atual: ${mapLabel('cacAtual', answers.cacAtual)})` : ''} com melhoria de targeting, quality score e automação de nutrição.` });
        }
        if (desafios.includes('escalar')) {
            steps.push({ name: 'Escala da Operação', description: 'Processos e automações para escalar a máquina comercial sem aumentar proporcionalmente custo e equipe.' });
        }
        if (desafios.includes('previsibilidade')) {
            steps.push({ name: 'Previsibilidade de Receita', description: 'Dashboard de pipeline, forecasting e modelo de projeção baseado em taxas históricas de conversão por etapa.' });
        }

        // Step 3: Based on declared channels
        if (currentChannels.length > 0) {
            const channelList = currentChannels.slice(0, 3).join(', ');
            steps.push({ name: 'Escala dos Canais Existentes', description: `Otimização e escala dos canais já utilizados: ${channelList}. Foco em melhorar ROI antes de adicionar novos canais.` });
        }

        // Step 4: Based on priority areas
        if (areas.includes('Automação') || areas.includes('automacao')) {
            steps.push({ name: 'Automação de Processos', description: 'Implementação de workflows automatizados para nutrição, follow-up e tarefas repetitivas que consomem tempo da equipe.' });
        }
        if (areas.includes('Dados') || areas.includes('dados') || areas.includes('Analytics')) {
            steps.push({ name: 'Dashboard & Analytics', description: 'Configuração de dashboards em tempo real com KPIs críticos: CAC, LTV, Pipeline, Conversão e ROI por canal.' });
        }

        // Fallback if no steps were generated
        if (steps.length < 2) {
            if (isB2B) {
                steps.push({ name: 'ABM & Outreach', description: 'Account-Based Marketing com listas segmentadas e abordagem direta via LinkedIn e Cold Email.' });
            } else {
                steps.push({ name: 'Tráfego de Alta Intenção', description: 'Google Ads e Meta Ads focados em conversão direta.' });
            }
            steps.push({ name: 'Revenue Operations', description: 'Integração completa entre marketing, vendas e CS para visibilidade total do funil.' });
        }

        return { steps };
    }

    private static generateRoadmap(hasCRM: boolean, isB2B: boolean, challenges: string[], answers: any, marketData?: any, projectType?: string) {
        const phases = [];
        const market = marketData || {};
        const crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        const prazo = answers.prazo || answers.quandoComecar || '';
        const areas = answers.areasPrioridade || [];
        const canais = answers.canaisAquisicao || [];
        const growthGoal = mapLabel('metaCrescimento', answers.metaCrescimento || '') || '';

        // Calculate real start date based on prazo
        const now = new Date();
        const prazoMap: Record<string, number> = {
            'imediato': 7, 'proximo-mes': 30, '1-mes': 30,
            '2-meses': 60, '3-meses': 90, 'sem-pressa': 45,
        };
        const daysOffset = prazoMap[prazo] || 14;
        const startDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        const formatDate = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            phases.push({
                name: 'Ciclo 01',
                title: `Arquitetura & Setup - ${formatDate(startDate)} a ${formatDate(addDays(startDate, 14))}`,
                items: [
                    'Mapeamento As-Is dos processos de Vendas e Marketing',
                    'Ajuste ou Criação de Instância CRM Segura',
                    'Modelagem de Propriedades Customizadas e Razão de Perda',
                    'Setup do Pipeline de Oportunidades'
                ]
            });
            phases.push({
                name: 'Ciclo 02',
                title: `Integrações & Automação - ${formatDate(addDays(startDate, 15))} a ${formatDate(addDays(startDate, 28))}`,
                items: [
                    'Integração com Landing Pages, ERPs ou Forms Nativos',
                    'Roteamento automático Round-Robin ou por Lead Scoring',
                    'Views Personalizadas de Daily Report para Vendedores',
                    'Ajustes em Automações de Nurturing Early-Stage'
                ]
            });
            phases.push({
                name: 'Ciclo 03',
                title: `Cultural Drive & Onboarding - ${formatDate(addDays(startDate, 29))} a ${formatDate(addDays(startDate, 42))}`,
                items: [
                    'Workshops operacionais com a liderança e base comercial',
                    'Testes de carga com Mocks Reais de Vendas',
                    'Lançamento Oficial e SLA Hand-Off Definitivo',
                    'Playbooks operacionais para consulta'
                ]
            });
            phases.push({
                name: 'Ciclo 04',
                title: `Dados e Evolução Contínua - a partir de ${formatDate(addDays(startDate, 43))}`,
                items: [
                    'Construção de Dashboards de LTV vs CAC Preditivo',
                    'Monitoramento de Taxa de Conversão por Etapa do Funil',
                    'Revisão de Qualidade do Dado Inserido pela equipe',
                    'Refino das Lógicas Avançadas de RevOps'
                ]
            });
            return { phases };
        }

        // Ciclo 01: Embarque & Setup (Semana 1-2)
        const cycle1Items = ['Alinhamento de expectativas e Handoff comercial'];
        if (!hasCRM) {
            cycle1Items.push('Seleção e implementação prioritária de CRM');
        } else {
            cycle1Items.push(`Auditoria técnica do ${crmName} e limpeza da base de dados`);
        }
        cycle1Items.push('Configuração de DNS e Deliverability (SPF/DKIM/DMARC)');
        if (answers.metricas && answers.metricas.length > 0) {
            cycle1Items.push(`Definição de baseline das métricas: ${mapLabels('metricas', answers.metricas.slice(0, 3)).join(', ')}`);
        }

        phases.push({
            name: 'Ciclo 01',
            title: `Embarque & Setup - ${formatDate(startDate)} a ${formatDate(addDays(startDate, 14))}`,
            items: cycle1Items
        });

        // Ciclo 02: Estratégia & Kickoff (Semana 3)
        const cycle2Items = [
            'Criação do Success Plan personalizado',
            'Reunião de Kickoff Estratégico com stakeholders'
        ];
        if (market.competitor_benchmarks?.length > 0) {
            cycle2Items.push(`Análise competitiva: ${market.competitor_benchmarks.slice(0, 3).map((c: any) => c.company_name || c.nome).join(', ')}`);
        }
        if (isB2B) {
            cycle2Items.push('Definição de ICP e Matriz de Objeções');
        }
        if (growthGoal) {
            cycle2Items.push(`Planejamento para atingir: ${growthGoal}`);
        }

        phases.push({
            name: 'Ciclo 02',
            title: `Estratégia & Kickoff - ${formatDate(addDays(startDate, 15))} a ${formatDate(addDays(startDate, 21))}`,
            items: cycle2Items
        });

        // Ciclo 03: Execução & Adoção (Semana 4-10)
        const cycle3Items = [];
        if (canais.length > 0) {
            cycle3Items.push(`Setup de campanhas nos canais: ${canais.slice(0, 3).join(', ')}`);
        } else {
            cycle3Items.push('Setup de campanhas de tração cirúrgica');
        }
        if (challenges.length > 0) {
            const topChallenges = challenges.slice(0, 2).join(' e ');
            cycle3Items.push(`Resolução prioritária: ${topChallenges}`);
        }
        if (areas.includes('Automação') || areas.includes('automacao')) {
            cycle3Items.push('Implementação de automações de nurturing e follow-up');
        }
        cycle3Items.push('Otimização contínua baseada em dados e testes A/B');

        phases.push({
            name: 'Ciclo 03',
            title: `Execução & Adoção - ${formatDate(addDays(startDate, 22))} a ${formatDate(addDays(startDate, 70))}`,
            items: cycle3Items
        });

        // Ciclo 04: Valor & Expansão (Semana 11+)
        const cycle4Items = [
            'Revisão de ROI e QBR (Quarterly Business Review)',
            'Ajuste de investimento para nova fase de escala'
        ];
        if (answers.taxaChurn) {
            cycle4Items.push(`Meta de redução de churn de ${mapLabel('taxaChurn', answers.taxaChurn)} para patamar aceitável`);
        }
        if (answers.ltvAtual && answers.cacAtual) {
            cycle4Items.push(`Otimizar relação LTV:CAC (atual: LTV ${mapLabel('ltvAtual', answers.ltvAtual)} / CAC ${mapLabel('cacAtual', answers.cacAtual)})`);
        }
        cycle4Items.push('Expansão para novos canais ou verticais');

        phases.push({
            name: 'Ciclo 04',
            title: `Valor & Expansão - a partir de ${formatDate(addDays(startDate, 71))}`,
            items: cycle4Items
        });

        return { phases };
    }

    private static generateGoals(objective: string, growthGoal: string, answers: any, projectType?: string) {
        const expectativas = this.ensureArray(answers.expectativas);
        const areas = this.ensureArray(answers.areasPrioridade);
        const metricas = this.ensureArray(answers.metricas);
        const cacAtual = answers.cacAtual || '';
        const ltvAtual = answers.ltvAtual || '';

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            const okrs = [
                {
                    objective: 'Objetivo Estratégico do Período', label: 'O',
                    description: 'Fundação de Operações Comerciais: Visibilidade, Atribuição e SLA',
                    krs: [
                        { label: 'RK 1', text: 'Pipeline de Vendas 100% mapeado e espelhado no CRM', target: 'Sem. 2' },
                        { label: 'RK 2', text: 'Speed-to-lead (tempo de primeiro contato) reduzido a < 10 minutos', target: 'Mês 2' },
                        { label: 'RK 3', text: 'Taxa de conversão de Lead para Oportunidade aumentada em 20%', target: 'Mês 3' }
                    ]
                },
                {
                    objective: 'RK 1 - Higienização e Arquitetura', label: '01',
                    krs: [
                        { label: 'RK 1.1', text: 'Auditoria de propriedades e unificação de cadastros concluída', target: 'Sem. 2' },
                        { label: 'RK 1.2', text: 'Criação de propriedades padronizadas (UTMs, Ticket, Segmento)', target: 'Sem. 3' },
                        { label: 'RK 1.3', text: 'Migração de histórico (se aplicável) e limpeza de duplicados', target: 'Sem. 4' }
                    ]
                },
                {
                    objective: 'RK 2 - Captação e Integração', label: '02',
                    krs: [
                        { label: 'RK 2.1', text: 'Formulários do site e Landing Pages 100% integrados via API/Webhook', target: 'Mês 1' },
                        { label: 'RK 2.2', text: 'Entrada de leads automatizada (sem depender de planilhas manuais)', target: 'Mês 1' },
                        { label: 'RK 2.3', text: 'Enriquecimento de dados de empresas ativado no CRM', target: 'Mês 2' }
                    ]
                },
                {
                    objective: 'RK 3 - Roteamento e SLA Comercial', label: '03',
                    krs: [
                        { label: 'RK 3.1', text: 'Regras de roteamento (Round-robin ou território) ativas', target: 'Mês 2' },
                        { label: 'RK 3.2', text: 'Alertas automáticos de estagnação de negócios para gestores', target: 'Mês 2' },
                        { label: 'RK 3.3', text: 'SLA de passagem de bastão (Handoff SDR -> Closer) validado', target: 'Mês 3' }
                    ]
                },
                {
                    objective: 'RK 4 - Adoção e Relatórios', label: '04',
                    krs: [
                        { label: 'RK 4.1', text: '100% dos vendedores utilizando o CRM diariamente', target: 'Mês 2' },
                        { label: 'RK 4.2', text: 'Dashboard executivo de Vendas operante (Pipeline Velocity, LTV, CAC)', target: 'Mês 3' },
                        { label: 'RK 4.3', text: 'Painéis individuais de produtividade para cada executivo ativos', target: 'Mês 3' }
                    ]
                }
            ];

            const month1_targets = [
                { name: 'Setup Base do CRM e Pipelines Visuais', status: 'pending' },
                { name: 'Integração Nativa de Leads (Eliminar entrada manual)', status: 'pending' },
                { name: 'Onboarding com equipe comercial para adoção', status: 'pending' },
                { name: 'Construção da Visão Qualificada em Dashboard Inicial', status: 'pending' }
            ];

            return { okrs, month1_targets };
        }

        // Map growth goal IDs to readable labels
        const growthLabels: Record<string, string> = {
            'agressivo': 'Crescimento acelerado (>20% ao mês)',
            'crescer': 'Crescimento consistente (10-20% ao mês)',
            'moderado': 'Crescimento moderado e sustentável',
            'manter': 'Manter e estabilizar a operação atual',
            'escalar': 'Escalar operação com previsibilidade',
            'dobrar': 'Dobrar a receita no período',
        };

        // Map expectation IDs to readable labels
        const expectativaLabels: Record<string, string> = {
            'oportunidades': 'Gerar mais oportunidades qualificadas',
            'previsibilidade': 'Ter previsibilidade de receita mensal',
            'escalar': 'Escalar a operação comercial',
            'leads': 'Aumentar volume de leads qualificados',
            'conversao': 'Melhorar taxa de conversão do pipeline',
            'processos': 'Estruturar processos comerciais replicáveis',
            'retenção': 'Melhorar retenção e reduzir churn',
            'marca': 'Fortalecer posicionamento e autoridade da marca',
            'dados': 'Tomar decisões baseadas em dados concretos',
            'time': 'Montar e capacitar equipe comercial',
        };

        const okrs = [
            { kr: 'Objetivo Estratégico', description: objective || 'Crescimento sustentável' },
            { kr: 'Meta de Crescimento', description: growthLabels[growthGoal?.toLowerCase()] || growthGoal || 'A ser definida no kickoff' }
        ];

        // Add OKRs from expectations with readable labels
        if (expectativas.length > 0) {
            expectativas.slice(0, 3).forEach((exp: string, i: number) => {
                okrs.push({ kr: `Expectativa ${i + 1}`, description: expectativaLabels[exp] || exp });
            });
        }

        const month1_targets = [];

        // Based on priority areas
        if (areas.length > 0) {
            areas.forEach((area: string) => {
                month1_targets.push({ name: `Setup: ${area}`, status: 'pending' });
            });
        } else {
            month1_targets.push({ name: 'Setup de Infraestrutura', status: 'pending' });
            month1_targets.push({ name: 'Validação de Canais de Aquisição', status: 'pending' });
        }

        // Based on metrics they track
        if (metricas.length > 0) {
            month1_targets.push({ name: `Definir baseline: ${metricas.slice(0, 2).join(', ')}`, status: 'pending' });
        }

        // CAC/LTV targets
        if (cacAtual) {
            month1_targets.push({ name: `Mapear CAC atual (declarado: ${cacAtual})`, status: 'pending' });
        }
        if (ltvAtual) {
            month1_targets.push({ name: `Validar LTV atual (declarado: ${mapLabel('ltvAtual', ltvAtual)})`, status: 'pending' });
        }

        return { okrs, month1_targets };
    }

    private static generateProjections(budget: string, answers: any) {
        const ticketMedioRaw = answers.ticketMedio || '';
        const mrrSelect = answers.mrr || '';
        const growthGoalRaw = answers.metaCrescimento || '';
        const growthGoal = mapLabel('metaCrescimento', growthGoalRaw) || '';
        const cicloVendas = answers.cicloVendas || '';
        const cacAtual = answers.cacAtual || '';
        const churnRate = answers.taxaChurn || '';
        const ltvAtual = answers.ltvAtual || '';
        const orcamento = answers.orcamento || budget || '';

        // ── Parse REI select values into real numbers ──────────────────
        const mrrMap: Record<string, number> = {
            'ate-50k': 35000, '50k-200k': 100000, '200k-500k': 300000,
            '500k-1m': 700000, 'acima-1m': 1500000,
        };
        const budgetMap: Record<string, number> = {
            'ate-10k': 7000, '10k-30k': 18000, '30k-100k': 55000,
            '100k-300k': 180000, 'acima-300k': 400000,
        };
        const churnMap: Record<string, number> = {
            'menor-2': 1, '2-5': 3.5, '5-10': 7.5, 'maior-10': 15, 'nao-sei': 3,
        };
        const ltvMap: Record<string, number> = {
            'menor-5k': 3500, '5k-20k': 12000, '20k-50k': 35000, 'maior-50k': 80000,
        };

        const currentMRR = mrrMap[mrrSelect] || parseFloat(String(mrrSelect).replace(/[^0-9]/g, '')) || 8000;
        const monthlyBudget = budgetMap[orcamento] || parseFloat(String(orcamento).replace(/[^0-9]/g, '')) || 5000;
        const churn = (churnMap[churnRate] || 3) / 100;
        const ltv = ltvMap[ltvAtual] || 0;

        // Parse ticket médio (e.g. "R$ 3.500,00" → 3500)
        const ticketNum = parseFloat(String(ticketMedioRaw).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const ticketMedio = ticketNum > 0 ? ticketNum : (currentMRR > 0 ? Math.round(currentMRR / 10) : 1500);

        // Parse CAC from select value to number
        const cacMap: Record<string, number> = {
            'menor-500': 350, '500-2k': 1000, '2k-5k': 3000, 'maior-5k': 7000, 'acima-5k': 7000,
        };
        const estimatedCAC = cacMap[cacAtual] || Math.round(ticketMedio * 0.25);

        // ── Growth rate based on metaCrescimento ────────────────────────
        const growthRates: Record<string, number> = {
            '2x': 0.15, '3x': 0.20, '5x': 0.25, 'manter': 0.05, 'nao-planejado': 0.10,
        };
        const monthlyGrowth = growthRates[growthGoalRaw] || 0.12;

        // ── Calculate 6 months of projections ──────────────────────────
        const months = 6;
        const monthly_projections = [];
        let runningMRR = currentMRR;

        for (let i = 0; i < months; i++) {
            // Month 1 = setup, lower growth
            const effectiveGrowth = i === 0 ? monthlyGrowth * 0.3 : monthlyGrowth;
            const churnLoss = Math.round(runningMRR * churn);
            const newRevenue = Math.round(runningMRR * effectiveGrowth);
            runningMRR = runningMRR - churnLoss + newRevenue;

            const newClients = ticketMedio > 0 ? Math.max(1, Math.round(newRevenue / ticketMedio)) : 0;
            const leadsNeeded = Math.round(newClients * 5); // 20% conversion assumption

            monthly_projections.push({
                month: `Mês ${i + 1}`,
                label: `M${i + 1}`,
                mrr: Math.round(runningMRR),
                mrr_formatted: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(runningMRR),
                leads: leadsNeeded,
                new_clients: newClients,
                churn_loss: churnLoss,
                cac: estimatedCAC,
            });
        }

        return {
            current_mrr: currentMRR,
            ticket_medio: ticketMedio,
            cac_estimado: estimatedCAC,
            churn_mensal: churn,
            meta_crescimento: growthGoal,
            total_months: months,
            note: `Projeções calculadas com base no MRR atual (~${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(currentMRR)}), ticket médio de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(ticketMedio)}, CAC estimado de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedCAC)} e churn de ${(churn * 100).toFixed(1)}%.`,
            context: {
                budget: orcamento,
                ticket_medio: ticketMedioRaw,
                mrr_atual: mrrSelect,
                meta_crescimento: growthGoal,
                ciclo_vendas: cicloVendas,
            },
            monthly_projections,
        };
    }

    private static generateBudget(budget: string, isB2B: boolean, answers: any, projectType?: string) {
        const canais = answers.canaisAquisicao || [];
        const hasCRM = this.checkHasCRM(answers);
        const orcamento = answers.orcamento || budget || '';

        // Parse budget select value to number
        const budgetMap: Record<string, number> = {
            'ate-5k': 3000, 'ate-10k': 7000, '10k-25k': 15000,
            '25k-50k': 35000, 'acima-50k': 75000,
        };
        const budgetLabels: Record<string, string> = {
            'ate-5k': 'Até R$ 5.000/mês', 'ate-10k': 'Até R$ 10.000/mês',
            '10k-25k': 'R$ 10.000–25.000/mês', '25k-50k': 'R$ 25.000–50.000/mês',
            'acima-50k': 'Acima de R$ 50.000/mês',
        };
        const totalBudget = budgetMap[orcamento] || parseFloat(String(orcamento).replace(/[^0-9]/g, '')) || 5000;
        const budgetLabel = budgetLabels[orcamento] || orcamento || 'Não informado';
        const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

        // Build channel allocation based on ACTUAL declared channels
        const channels: { name: string; percentage: string; value: string }[] = [];

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            channels.push({ name: 'Licenças de Software (CRM, Enriquecimento, Assinaturas)', percentage: '20%', value: fmt(totalBudget * 0.20) });
            channels.push({ name: 'Implementação e Setup (Horas de Engenharia de Dados)', percentage: '40%', value: fmt(totalBudget * 0.40) });
            channels.push({ name: 'Consultoria RevOps (Modelagem de Processo As-Is / To-Be)', percentage: '25%', value: fmt(totalBudget * 0.25) });
            channels.push({ name: 'Treinamento e Capacitação (Playbooks e Enablement Comercial)', percentage: '15%', value: fmt(totalBudget * 0.15) });

            return {
                annual_budget: budgetLabel,
                monthly_budget: totalBudget,
                monthly_budget_formatted: fmt(totalBudget),
                channels
            };
        }

        if (!hasCRM) {
            channels.push({ name: 'CRM & Infraestrutura (Prioridade)', percentage: '25%', value: fmt(totalBudget * 0.25) });
        }

        if (canais.includes('Google Ads') || canais.includes('google_ads')) {
            const pct = isB2B ? 0.25 : 0.30;
            channels.push({ name: 'Google Ads', percentage: `${Math.round(pct * 100)}%`, value: fmt(totalBudget * pct) });
        }
        if (canais.includes('Meta Ads') || canais.includes('meta_ads') || canais.includes('Facebook') || canais.includes('Instagram')) {
            const pct = isB2B ? 0.20 : 0.35;
            channels.push({ name: 'Meta Ads (Facebook/Instagram)', percentage: `${Math.round(pct * 100)}%`, value: fmt(totalBudget * pct) });
        }
        if (canais.includes('LinkedIn') || canais.includes('linkedin')) {
            channels.push({ name: 'LinkedIn Ads & Outreach', percentage: '25%', value: fmt(totalBudget * 0.25) });
        }
        if (canais.includes('Email') || canais.includes('email') || canais.includes('E-mail')) {
            channels.push({ name: 'E-mail Marketing & Automação', percentage: '15%', value: fmt(totalBudget * 0.15) });
        }

        // Fallback if no channels were specified
        if (channels.length === 0) {
            if (isB2B) {
                channels.push({ name: 'Ferramentas & Dados (Outbound)', percentage: '30%', value: fmt(totalBudget * 0.30) });
                channels.push({ name: 'Mídia Paga (LinkedIn/Google)', percentage: '40%', value: fmt(totalBudget * 0.40) });
                channels.push({ name: 'Conteúdo & Enablement', percentage: '30%', value: fmt(totalBudget * 0.30) });
            } else {
                channels.push({ name: 'Meta Ads', percentage: '50%', value: fmt(totalBudget * 0.50) });
                channels.push({ name: 'Google Ads', percentage: '30%', value: fmt(totalBudget * 0.30) });
                channels.push({ name: 'Conteúdo & Orgânico', percentage: '20%', value: fmt(totalBudget * 0.20) });
            }
        }

        return {
            annual_budget: budgetLabel,
            monthly_budget: totalBudget,
            monthly_budget_formatted: fmt(totalBudget),
            channels
        };
    }

    private static generateNextSteps(hasCRM: boolean, answers: any, projectType?: string) {
        const actions = [];
        const crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        const prazo = answers.quandoComecar || answers.prazo || '';
        const areas = answers.areasPrioridade || [];

        // ── FLUXO ESPECÍFICO CRM OPS ──
        if (projectType === 'crm_ops') {
            actions.push({ day: 'Imediato', action: 'Aprovação do Escopo do Projeto RevOps e SLA Mútuo', done: false });
            actions.push({ day: 'Imediato', action: 'Assinatura das Licenças da Ferramenta CRM/Automação', done: false });
            actions.push({ day: 'Dia 1', action: 'Concessão de Acessos Admin (Google Workspace, ERP, CRM Atual)', done: false });
            actions.push({ day: 'Dia 2', action: 'Kick-off Call: Mapeamento do Processo Comercial AS-IS', done: false });
            actions.push({ day: 'Dia 3', action: 'Aprovação do Desenho da Arquitetura do Funil / Motivos de Perda', done: false });

            return { week1_actions: actions };
        }

        // --- FLUXO PADRÃO (GROWTH 360) ---
        actions.push({ day: 'Imediato', action: 'Aprovação do Planejamento Estratégico', done: false });

        if (!hasCRM) {
            actions.push({ day: 'Imediato', action: 'Seleção e contratação de CRM', done: false });
        } else {
            actions.push({ day: 'Imediato', action: `Auditoria do ${crmName} e limpeza de dados`, done: false });
        }

        actions.push({ day: 'Dia 1', action: 'Onboarding do Time e acesso às ferramentas', done: false });

        if (areas.length > 0) {
            actions.push({ day: 'Semana 1', action: `Iniciar: ${areas[0]}`, done: false });
        }

        if (prazo) {
            actions.push({ day: 'Referência', action: `Prazo desejado pelo cliente: ${prazo}`, done: false });
        }

        return { week1_actions: actions };
    }

    // ── PUBLIC FALLBACK GENERATORS ──────────────────────────────────────────
    // Used by StrategicPlanGenerator when AI enrichment is unavailable.
    // Builds structured persona/benchmark data from raw REI answers
    // so the plan never saves undefined to the database.
    // IMPORTANT: These must work with BOTH optional text fields (icpDescription,
    // concorrentes) AND the guaranteed checkbox/select fields (desafios,
    // canaisAquisicao, segmento, tamanho, crm, metaCrescimento, etc.)

    /**
     * Returns segment-aware keyword suggestions for SEO/research.
     * Still useful for search queries, not for display.
     */
    static generateSearchKeywordsFromREI(answers: any): string[] {
        const segment = answers.segmento === 'outro'
            ? (answers.segmento_outro || 'B2B')
            : (answers.segmento || answers.segmento_outro || 'B2B');
        return [segment.toLowerCase(), 'growth marketing', 'geração de leads B2B'];
    }
}
