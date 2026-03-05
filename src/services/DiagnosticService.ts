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
    text: string;
    impact: string;
}

export interface DiagnosticRisk {
    id: string;
    severity: 'high' | 'medium' | 'low';
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

export class DiagnosticService {

    static generateDiagnosis(response: ReiResponse, marketData?: any): DiagnosticResult {
        const rawResponses = response.responses as Record<string, any>;
        // FIX: REI wizard wraps form data inside responses.form_data
        const answers = rawResponses?.form_data || rawResponses || {};
        const plan_data = this.generatePlanFromResponse(response, marketData);

        // --- INTELLIGENCE LAYER (The Voice) ---
        const segment = answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.metaCrescimento || answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';
        const ticketMedio = answers.ticketMedio || '';
        const tamanho = answers.tamanho || '';
        const crmName = answers.crm || answers.crm_outro || '';

        // 1. Context Mirror (using REAL REI data)
        const context_mirror = {
            segment,
            objective,
            maturity: hasCRM ? `Intermediária (CRM: ${crmName})` : 'Inicial (Sem CRM)',
            restrictions: `Budget: ${budget}${ticketMedio ? ` | Ticket Médio: ${ticketMedio}` : ''}${tamanho ? ` | Porte: ${tamanho}` : ''}`
        };

        // 2. Signals
        const signals: DiagnosticSignal[] = [];
        if (hasCRM) {
            signals.push({ id: 's1', type: 'positive', text: 'Infraestrutura de dados existente', impact: 'Permite otimização rápida' });
        } else {
            signals.push({ id: 's2', type: 'negative', text: 'Ausência de CRM', impact: 'Cegueira de dados no funil' });
        }
        if (isB2B) {
            signals.push({ id: 's3', type: 'neutral', text: 'Ciclo de Vendas B2B', impact: 'Necessidade de nutrição mais longa' });
        }

        // 3. Risks
        const risks: DiagnosticRisk[] = [];
        if (!hasCRM && objective === 'Escala Agressiva') {
            risks.push({ id: 'r1', severity: 'high', text: 'Escala sem rastreabilidade', mitigation: 'Implantar CRM antes de aumentar media spend' });
        }
        if (budget === 'Baixo' && isB2B) {
            risks.push({ id: 'r2', severity: 'medium', text: 'Budget insuficiente para Outbound', mitigation: 'Focar em Social Selling orgânico' });
        }

        // 4. Decisions (Explicability)
        const decisions: StrategicDecision[] = [];
        decisions.push({
            title: 'Escolha de Canal',
            recommendation: isB2B ? 'Foco em LinkedIn & Outbound' : 'Foco em Meta Ads & Google',
            basedOn: ['Segmento', 'Ticket Médio'],
            ruleApplied: isB2B ? 'IF B2B THEN Outbound' : 'IF B2C THEN Inbound',
            implication: isB2B ? 'Necessidade de SDRs' : 'Necessidade de Copywriting forte'
        });

        if (!hasCRM) {
            decisions.push({
                title: 'Prioridade de Implementação',
                recommendation: 'Setup de CRM na Semana 0',
                basedOn: ['Tech Stack'],
                ruleApplied: 'NO CRM = BLOCKER',
                implication: 'Atraso de 1 semana no Go-Live de campanhas'
            });
        }

        // 5. Implementation Steps (Go Live)
        const implementation_steps = this.generateImplementationSteps(hasCRM, isB2B, objective);

        return {
            summary: `Diagnóstico realizado para estratégia ${isB2B ? 'B2B' : 'B2C'}. Foco em: ${objective}.`,
            context_mirror,
            signals,
            risks,
            opportunities: [],
            decisions,
            implementation_steps,
            plan_data
        };
    }

    private static generateImplementationSteps(hasCRM: boolean, isB2B: boolean, objective: string): ImplementationStep[] {
        const steps: ImplementationStep[] = [];

        // 1. INFRAESTRUTURA
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


    static generatePlanFromResponse(response: ReiResponse, marketData?: any): StrategicPlanData {
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
        const bottlenecks = answers.gargaloFunil || answers.gargaloFunil_outro || answers.gargalo || answers.gargalo_outro || 'Não identificado';
        const channels = answers.canaisAquisicao || [];
        const growthGoal = answers.metaCrescimento || 'Não definida';

        // 2. GENERATE MODULES (ALL receive full answers for real data)
        return {
            premises_data: this.generatePremises(segment, objective, bottlenecks, answers),
            methodology_data: this.generateMethodology(isB2B, channels, answers),
            roadmap_data: this.generateRoadmap(hasCRM, isB2B, challenges, answers, marketData),
            goals_data: this.generateGoals(objective, growthGoal, answers),
            financial_projections: this.generateProjections(budget, answers),
            budget_data: this.generateBudget(budget, isB2B, answers),
            next_steps_data: this.generateNextSteps(hasCRM, answers),
            market_intelligence: marketData || null
        };
    }

    // --- HELPER LOGIC ---

    private static checkHasCRM(answers: any): boolean {
        const crmValue = (answers.crm || answers.crm_outro || '').toLowerCase().trim();
        if (!crmValue || crmValue === 'nao' || crmValue === 'não' || crmValue === 'nenhum' || crmValue === 'nao_tenho' || crmValue === 'nao tenho' || crmValue === 'não tenho') return false;
        return true;
    }

    private static checkIsB2B(answers: any): boolean {
        const segment = (answers.segmento || answers.segmento_outro || '').toLowerCase();
        const tamanho = (answers.tamanho || '').toLowerCase();
        const ticketMedio = (answers.ticketMedio || '').toLowerCase();
        return segment.includes('b2b') || segment.includes('tech') || segment.includes('saas') || segment.includes('tecnologia') || segment.includes('consultoria') || segment.includes('software') || tamanho.includes('enterprise') || ticketMedio.includes('alto');
    }

    // --- GENERATORS (ALL use real REI answers) ---

    private static generatePremises(segment: string, objective: string, bottleneck: string, answers: any) {
        const crmName = answers.crm || answers.crm_outro || '';
        const hasCRM = this.checkHasCRM(answers);
        const ticketMedio = answers.ticketMedio || '';
        const mrr = answers.mrr || '';
        const churn = answers.taxaChurn || '';
        const canais = (answers.canaisAquisicao || []).join(', ') || 'Não informados';
        const tamanho = answers.tamanho || '';

        return {
            pillars: [
                {
                    name: 'Contexto do Negócio',
                    icon: 'building',
                    items: [
                        `Segmento: ${segment}`,
                        tamanho ? `Porte da Empresa: ${tamanho}` : null,
                        ticketMedio ? `Ticket Médio: ${ticketMedio}` : null,
                        mrr ? `MRR Atual: ${mrr}` : null,
                    ].filter(Boolean)
                },
                {
                    name: 'Stack & Infraestrutura',
                    icon: 'settings',
                    items: [
                        hasCRM ? `CRM Atual: ${crmName}` : 'Sem CRM implementado',
                        `Canais de Aquisição: ${canais}`,
                        churn ? `Taxa de Churn: ${churn}` : null,
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
            ]
        };
    }

    private static generateMethodology(isB2B: boolean, currentChannels: string[], answers: any) {
        const steps = [];
        const desafios = answers.desafios || [];
        const gargalo = answers.gargaloFunil || answers.gargaloFunil_outro || answers.gargalo || '';
        const hasCRM = this.checkHasCRM(answers);
        const crmName = answers.crm || answers.crm_outro || '';
        const expectativas = answers.expectativas || [];
        const areas = answers.areasPrioridade || [];

        // Step 1: Based on CRM status
        if (!hasCRM) {
            steps.push({ name: 'Implementação de CRM', description: 'Seleção e configuração de CRM adequado ao porte e segmento da empresa. Sem CRM, toda estratégia de growth fica limitada.' });
        } else {
            steps.push({ name: `Otimização do ${crmName}`, description: `Auditoria e otimização do ${crmName} atual para garantir dados limpos, pipeline estruturado e automações funcionais.` });
        }

        // Step 2: Based on challenges identified
        if (desafios.includes('Geração de Leads') || desafios.includes('geracao_leads')) {
            steps.push({ name: 'Motor de Geração de Leads', description: 'Construção de funil de aquisição com landing pages, formulários inteligentes e lead scoring baseado no perfil ideal.' });
        }
        if (desafios.includes('Conversão') || desafios.includes('conversao') || gargalo.toLowerCase().includes('conversão') || gargalo.toLowerCase().includes('conversao')) {
            steps.push({ name: 'Otimização de Conversão (CRO)', description: `Resolução do gargalo identificado: "${gargalo}". Testes A/B, melhoria de proposta de valor e redução de fricção no funil.` });
        }
        if (desafios.includes('Retenção') || desafios.includes('retencao') || desafios.includes('Churn')) {
            steps.push({ name: 'Programa de Retenção', description: `Redução de churn${answers.taxaChurn ? ` (atual: ${answers.taxaChurn})` : ''} com onboarding estruturado, health score e playbooks de sucesso do cliente.` });
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

    private static generateRoadmap(hasCRM: boolean, isB2B: boolean, challenges: string[], answers: any, marketData?: any) {
        const phases = [];
        const market = marketData || {};
        const crmName = answers.crm || answers.crm_outro || '';
        const prazo = answers.prazo || answers.quandoComecar || '';
        const areas = answers.areasPrioridade || [];
        const canais = answers.canaisAquisicao || [];
        const growthGoal = answers.metaCrescimento || '';

        // Ciclo 01: Embarque & Setup (Semana 1-2)
        const cycle1Items = ['Alinhamento de expectativas e Handoff comercial'];
        if (!hasCRM) {
            cycle1Items.push('Seleção e implementação prioritária de CRM');
        } else {
            cycle1Items.push(`Auditoria técnica do ${crmName} e limpeza da base de dados`);
        }
        cycle1Items.push('Configuração de DNS e Deliverability (SPF/DKIM/DMARC)');
        if (answers.metricas && answers.metricas.length > 0) {
            cycle1Items.push(`Definição de baseline das métricas: ${answers.metricas.slice(0, 3).join(', ')}`);
        }

        phases.push({
            name: 'Ciclo 01',
            title: 'Embarque & Setup (15 dias)',
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
            title: 'Estratégia & Kickoff',
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
            title: 'Execução & Adoção',
            items: cycle3Items
        });

        // Ciclo 04: Valor & Expansão (Semana 11+)
        const cycle4Items = [
            'Revisão de ROI e QBR (Quarterly Business Review)',
            'Ajuste de investimento para nova fase de escala'
        ];
        if (answers.taxaChurn) {
            cycle4Items.push(`Meta de redução de churn de ${answers.taxaChurn} para patamar aceitável`);
        }
        if (answers.ltvAtual && answers.cacAtual) {
            cycle4Items.push(`Otimizar relação LTV:CAC (atual: LTV ${answers.ltvAtual} / CAC ${answers.cacAtual})`);
        }
        cycle4Items.push('Expansão para novos canais ou verticais');

        phases.push({
            name: 'Ciclo 04',
            title: 'Valor & Expansão',
            items: cycle4Items
        });

        return { phases };
    }

    private static generateGoals(objective: string, growthGoal: string, answers: any) {
        const expectativas = answers.expectativas || [];
        const areas = answers.areasPrioridade || [];
        const metricas = answers.metricas || [];
        const cacAtual = answers.cacAtual || '';
        const ltvAtual = answers.ltvAtual || '';

        const okrs = [
            { kr: 'Objetivo Estratégico', description: objective || 'Crescimento sustentável' },
            { kr: 'Meta de Crescimento', description: growthGoal || 'A ser definida no kickoff' }
        ];

        // Add OKRs from expectations
        if (expectativas.length > 0) {
            expectativas.slice(0, 3).forEach((exp: string, i: number) => {
                okrs.push({ kr: `Expectativa ${i + 1}`, description: exp });
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
            month1_targets.push({ name: `Validar LTV atual (declarado: ${ltvAtual})`, status: 'pending' });
        }

        return { okrs, month1_targets };
    }

    private static generateProjections(budget: string, answers: any) {
        const ticketMedio = answers.ticketMedio || '';
        const mrr = answers.mrr || '';
        const growthGoal = answers.metaCrescimento || '';
        const cicloVendas = answers.cicloVendas || '';

        return {
            note: `Projeções baseadas no budget declarado de ${budget}${ticketMedio ? `, ticket médio de ${ticketMedio}` : ''}${mrr ? ` e MRR atual de ${mrr}` : ''}.`,
            context: {
                budget,
                ticket_medio: ticketMedio,
                mrr_atual: mrr,
                meta_crescimento: growthGoal,
                ciclo_vendas: cicloVendas
            },
            monthly_projections: [
                { period: 'Mês 1', nmrr_total: 'Setup & Infraestrutura' },
                { period: 'Mês 3', nmrr_total: 'Tração Inicial — Primeiros resultados mensuráveis' },
                { period: 'Mês 6', nmrr_total: growthGoal ? `Meta: ${growthGoal}` : 'Escala — Otimização contínua' }
            ]
        };
    }

    private static generateBudget(budget: string, isB2B: boolean, answers: any) {
        const canais = answers.canaisAquisicao || [];
        const hasCRM = this.checkHasCRM(answers);

        // Build channel allocation based on ACTUAL declared channels
        const channels = [];

        if (!hasCRM) {
            channels.push({ name: 'CRM & Infraestrutura (Prioridade)', percentage: '25%' });
        }

        if (canais.includes('Google Ads') || canais.includes('google_ads')) {
            channels.push({ name: 'Google Ads', percentage: isB2B ? '25%' : '30%' });
        }
        if (canais.includes('Meta Ads') || canais.includes('meta_ads') || canais.includes('Facebook') || canais.includes('Instagram')) {
            channels.push({ name: 'Meta Ads (Facebook/Instagram)', percentage: isB2B ? '20%' : '35%' });
        }
        if (canais.includes('LinkedIn') || canais.includes('linkedin')) {
            channels.push({ name: 'LinkedIn Ads & Outreach', percentage: '25%' });
        }
        if (canais.includes('Email') || canais.includes('email') || canais.includes('E-mail')) {
            channels.push({ name: 'E-mail Marketing & Automação', percentage: '15%' });
        }

        // Fallback if no channels were specified
        if (channels.length === 0) {
            if (isB2B) {
                channels.push({ name: 'Ferramentas & Dados (Outbound)', percentage: '30%' });
                channels.push({ name: 'Mídia Paga (LinkedIn/Google)', percentage: '40%' });
                channels.push({ name: 'Conteúdo & Enablement', percentage: '30%' });
            } else {
                channels.push({ name: 'Meta Ads', percentage: '50%' });
                channels.push({ name: 'Google Ads', percentage: '30%' });
                channels.push({ name: 'Conteúdo & Orgânico', percentage: '20%' });
            }
        }

        return {
            annual_budget: budget,
            channels
        };
    }

    private static generateNextSteps(hasCRM: boolean, answers: any) {
        const actions = [];
        const crmName = answers.crm || answers.crm_outro || '';
        const prazo = answers.quandoComecar || answers.prazo || '';
        const areas = answers.areasPrioridade || [];

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
    // Used by StrategicPlanGenerator when Perplexity AI is unavailable.
    // Builds structured persona/benchmark data from raw REI answers
    // so the plan never saves undefined to the database.
    // IMPORTANT: These must work with BOTH optional text fields (icpDescription,
    // concorrentes) AND the guaranteed checkbox/select fields (desafios,
    // canaisAquisicao, segmento, tamanho, crm, metaCrescimento, etc.)

    /**
     * Builds 3 PersonaSection-compatible personas from REI form answers.
     * These represent the CLIENT's ideal customers — who THEY sell to.
     * Always returns exactly 3 personas, contextual to the business segment.
     */
    static generatePersonasFromREI(answers: any): any[] {
        const icpDescription = (answers.icpDescription || '').trim();
        const segment = answers.segmento === 'outro'
            ? (answers.segmento_outro || 'B2B')
            : (answers.segmento || answers.segmento_outro || 'B2B');
        const tamanho = answers.tamanho || '';
        const canais = answers.canaisAquisicao || [];
        const desafios = answers.desafios || [];
        const metaCrescimento = answers.metaCrescimento || answers.objetivoPrincipal || 'crescimento';
        const ticketMedio = answers.ticketMedio || '';
        const processGap = (answers.processGap || '').trim();

        // Map channels
        const channelMap: Record<string, string> = {
            'google-ads': 'Google', 'google_ads': 'Google', 'seo': 'Google',
            'meta-ads': 'Instagram', 'meta_ads': 'Instagram', 'facebook': 'Facebook',
            'linkedin-ads': 'LinkedIn', 'linkedin_ads': 'LinkedIn', 'linkedin': 'LinkedIn',
            'email': 'E-mail', 'email-marketing': 'E-mail', 'email_marketing': 'E-mail',
            'whatsapp': 'WhatsApp', 'youtube': 'YouTube',
            'indicacoes': 'Indicações', 'eventos': 'Eventos', 'parcerias': 'Parcerias',
            'outbound': 'Outbound', 'inbound': 'Inbound',
        };
        const mappedChannels: string[] = canais.length > 0
            ? [...new Set<string>(canais.slice(0, 5).map((c: string) => channelMap[c.toLowerCase()] || c))]
            : ['LinkedIn', 'E-mail', 'WhatsApp'];

        const segLower = segment.toLowerCase();
        const tamanhoMap: Record<string, string> = {
            'pre-seed': 'Pré-Seed', 'seed': 'Seed', 'serie-a': 'Série A',
            'serie-b': 'Série B+', 'pme': 'PME', 'enterprise': 'Enterprise',
        };
        const tamanhoLabel = tamanhoMap[tamanho] || tamanho || '';

        // ── BUILD 3 PERSONAS BASED ON SEGMENT ──────────────────────────
        type PersonaTemplate = {
            name: string; role: string; age: number;
            bio: string; pain: string; trigger: string;
            message: string; wiifm: string; channels: string[];
            personality: { analytical_creative: number; passive_active: number; reserved_extroverted: number; reactive_preventive: number };
        };

        let personas: PersonaTemplate[] = [];

        if (segLower.includes('consultoria financeira') || segLower.includes('financ') || segLower.includes('investimento') || segLower.includes('contábil')) {
            personas = [
                {
                    name: 'Profissional Liberal',
                    role: 'Médico / Advogado / Autônomo',
                    age: 42,
                    bio: `Profissional com renda mensal elevada mas sem tempo para gestão financeira. Acumula patrimônio de forma desorganizada, sem estratégia tributária ou de proteção patrimonial. Busca um consultor de confiança para delegar.${ticketMedio ? ` Investimento potencial: ${ticketMedio}/mês.` : ''}`,
                    pain: 'Patrimônio crescendo sem estratégia. Paga impostos além do necessário. Não tem planejamento sucessório nem proteção patrimonial adequada.',
                    trigger: 'Momento de vida relevante: aumento de renda, compra de imóvel, nascimento de filho ou proximidade de aposentadoria.',
                    message: 'Consultoria financeira que protege e multiplica seu patrimônio enquanto você foca na sua profissão.',
                    wiifm: 'Economia tributária, patrimônio protegido e tranquilidade financeira para focar na carreira.',
                    channels: ['Indicações', 'Instagram', 'WhatsApp'],
                    personality: { analytical_creative: 35, passive_active: 40, reserved_extroverted: 45, reactive_preventive: 30 },
                },
                {
                    name: 'Empresário PME',
                    role: 'Sócio-Diretor / CEO',
                    age: 38,
                    bio: `Empresário com faturamento entre R$ 500K e R$ 5M anuais. Mistura finanças pessoais e empresariais, sem processo decisório baseado em dados financeiros. Precisa de estruturação para escalar sem perder o controle.${tamanhoLabel ? ` Empresa porte: ${tamanhoLabel}.` : ''}`,
                    pain: 'Fluxo de caixa instável, margem de lucro corroída por custos ocultos. Decisões financeiras baseadas no "feeling" ao invés de dados e projeções.',
                    trigger: processGap || 'Necessidade de captar investimento, estruturar sócios ou resolver crise de caixa.',
                    message: 'Método para transformar seu financeiro de "apagador de incêndio" em motor de crescimento previsível.',
                    wiifm: 'Clareza financeira, margem otimizada e confiança para tomar decisões de expansão.',
                    channels: mappedChannels,
                    personality: { analytical_creative: 55, passive_active: 70, reserved_extroverted: 60, reactive_preventive: 50 },
                },
                {
                    name: 'Executivo em Transição',
                    role: 'Gerente / Diretor CLT',
                    age: 45,
                    bio: `Executivo com salário alto e benefícios corporativos que está planejando transição de carreira (empreender ou se aposentar cedo). Precisa de assessoria para organizar a transição financeira com segurança.${ticketMedio ? ` Patrimônio acumulado relevante.` : ''}`,
                    pain: 'Insegurança sobre a viabilidade financeira de deixar o emprego. Não sabe se tem patrimônio suficiente para o próximo passo.',
                    trigger: 'Desgaste corporativo, oportunidade de negócio ou meta de independência financeira atingida.',
                    message: 'Planejamento financeiro personalizado para você fazer a transição de carreira no momento certo, com segurança.',
                    wiifm: 'Clareza sobre o "número mágico" para a transição e roadmap financeiro para chegar lá.',
                    channels: ['LinkedIn', 'E-mail', 'WhatsApp'],
                    personality: { analytical_creative: 30, passive_active: 45, reserved_extroverted: 35, reactive_preventive: 25 },
                },
            ];
        } else if (segLower.includes('saas') || segLower.includes('software') || segLower.includes('tech')) {
            personas = [
                {
                    name: 'Head de Operações',
                    role: 'COO / VP Operations',
                    age: 36,
                    bio: `Executivo responsável por eficiência operacional em empresa de tecnologia. Busca ferramentas e parceiros que otimizem processos e reduzam custos.${ticketMedio ? ` Budget trimestral: ${ticketMedio}.` : ''}`,
                    pain: 'Processos manuais, falta de integração entre áreas e dificuldade em escalar sem contratar proporcionalmente.',
                    trigger: 'Meta agressiva de crescimento definida pelo board ou perda de eficiência operacional.',
                    message: `Solução comprovada para ${metaCrescimento || 'escalar operação'} com eficiência e previsibilidade.`,
                    wiifm: 'Escala sem aumento proporcional de headcount, processos automatizados e KPIs claros.',
                    channels: mappedChannels,
                    personality: { analytical_creative: 60, passive_active: 70, reserved_extroverted: 50, reactive_preventive: 55 },
                },
                {
                    name: 'Head de Marketing',
                    role: 'CMO / Head de Growth',
                    age: 33,
                    bio: `Líder de marketing digital focado em performance e geração de demanda. Avalia parceiros pelo impacto mensurável em pipeline e CAC.`,
                    pain: 'CAC crescente, dificuldade em atribuir resultados e pipeline insuficiente para as metas de vendas.',
                    trigger: 'Trimestre abaixo da meta de MQL/SQL ou mudança de estratégia Go-to-Market.',
                    message: 'Framework de growth que conecta marketing a receita com métricas claras.',
                    wiifm: 'Pipeline previsível, CAC otimizado e alignment claro entre marketing e vendas.',
                    channels: ['LinkedIn', 'Google', 'E-mail'],
                    personality: { analytical_creative: 65, passive_active: 75, reserved_extroverted: 65, reactive_preventive: 45 },
                },
                {
                    name: 'Founder / CEO',
                    role: 'CEO / Co-Founder',
                    age: 40,
                    bio: `Fundador técnico que precisa profissionalizar a operação comercial. Grande visão de produto mas precisa de ajuda com go-to-market.${tamanhoLabel ? ` Empresa ${tamanhoLabel}.` : ''}`,
                    pain: 'Produto excelente mas crescimento de receita abaixo do potencial. Vendas dependem do founder.',
                    trigger: 'Preparação para rodada de investimento ou pressão do board por resultado comercial.',
                    message: 'Método para tirar a venda da mão do founder e criar máquina de receita escalável.',
                    wiifm: 'Receita recorrente escalável, independente do founder, com processos e equipe estruturados.',
                    channels: ['LinkedIn', 'Eventos', 'Indicações'],
                    personality: { analytical_creative: 70, passive_active: 80, reserved_extroverted: 55, reactive_preventive: 60 },
                },
            ];
        } else if (segLower.includes('saúde') || segLower.includes('health') || segLower.includes('clínica') || segLower.includes('médic') || segLower.includes('odonto')) {
            personas = [
                {
                    name: 'Profissional de Saúde',
                    role: 'Médico / Dentista / Especialista',
                    age: 38,
                    bio: `Profissional da saúde com consultório ou clínica própria buscando atrair pacientes de maior ticket sem depender de convênios.`,
                    pain: 'Agenda instável, dependência de convênios que pagam pouco, falta de diferenciação no mercado.',
                    trigger: 'Queda na agenda particular ou abertura de nova clínica/consultório.',
                    message: 'Estratégia digital para lotar sua agenda com pacientes particulares de alto ticket.',
                    wiifm: 'Agenda cheia de pacientes particulares, ticket médio elevado e autoridade no segmento.',
                    channels: ['Instagram', 'Google', 'Indicações'],
                    personality: { analytical_creative: 35, passive_active: 45, reserved_extroverted: 40, reactive_preventive: 30 },
                },
                {
                    name: 'Gestor de Clínica',
                    role: 'Diretor Administrativo',
                    age: 42,
                    bio: `Gestor responsável pela operação e resultados financeiros de uma clínica de médio porte. Foco em eficiência e crescimento sustentável.`,
                    pain: 'Custos operacionais altos, baixa taxa de retorno de pacientes e dificuldade em medir ROI de marketing.',
                    trigger: 'Margem operacional em queda ou planejamento de expansão para novas unidades.',
                    message: 'Framework de gestão que transforma sua clínica em negócio previsível e lucrativo.',
                    wiifm: 'Operação otimizada, pacientes fidelizados e métricas claras de performance financeira.',
                    channels: mappedChannels,
                    personality: { analytical_creative: 50, passive_active: 60, reserved_extroverted: 45, reactive_preventive: 55 },
                },
                {
                    name: 'Paciente Premium',
                    role: 'Empresário / Executivo',
                    age: 48,
                    bio: `Pessoa de alto poder aquisitivo que prioriza conveniência, qualidade e resultados. Escolhe profissionais de saúde por reputação e indicação.`,
                    pain: 'Dificuldade em encontrar profissionais de saúde confiáveis, demora no atendimento e falta de acompanhamento personalizado.',
                    trigger: 'Problema de saúde, check-up de rotina ou indicação de alguém de confiança.',
                    message: 'Atendimento personalizado com excelência clínica e conveniência total.',
                    wiifm: 'Confiança no tratamento, conveniência no agendamento e acompanhamento contínuo.',
                    channels: ['Indicações', 'Google', 'Instagram'],
                    personality: { analytical_creative: 25, passive_active: 35, reserved_extroverted: 50, reactive_preventive: 20 },
                },
            ];
        } else {
            // Generic B2B / Services — 3 diverse buyer personas
            personas = [
                {
                    name: `Decisor Estratégico`,
                    role: 'CEO / Diretor',
                    age: 42,
                    bio: `Executivo C-Level no segmento ${segment} que busca parceiros estratégicos para ${metaCrescimento || 'acelerar resultados'}. Valoriza confiança, histórico comprovado e ROI claro.${ticketMedio ? ` Budget disponível: ${ticketMedio}.` : ''}`,
                    pain: 'Crescimento estagnado, equipe sobrecarregada e falta de estratégia estruturada para o próximo patamar.',
                    trigger: processGap || 'Pressão por resultados no trimestre ou mudança de cenário competitivo.',
                    message: `Parceria estratégica para ${metaCrescimento || 'crescimento sustentável'} com método e previsibilidade.`,
                    wiifm: 'Resultados mensuráveis, equipe alinhada e confiança no próximo passo de crescimento.',
                    channels: mappedChannels,
                    personality: { analytical_creative: 45, passive_active: 65, reserved_extroverted: 55, reactive_preventive: 50 },
                },
                {
                    name: 'Gerente Operacional',
                    role: 'Gerente / Coordenador',
                    age: 34,
                    bio: `Profissional de gestão intermediária no segmento ${segment}. Influenciador na decisão de compra, responsável pela implementação e resultados do dia-a-dia.`,
                    pain: 'Sobrecarga operacional, falta de ferramentas adequadas e dificuldade em provar valor para a diretoria.',
                    trigger: 'Projeto prioritário, deadline apertado ou necessidade de expertise que a equipe não tem.',
                    message: 'Solução que simplifica sua operação e gera resultados visíveis para a diretoria.',
                    wiifm: 'Processos mais eficientes, equipe capacitada e métricas para apresentar ao board.',
                    channels: ['LinkedIn', 'E-mail', 'Google'],
                    personality: { analytical_creative: 55, passive_active: 60, reserved_extroverted: 45, reactive_preventive: 40 },
                },
                {
                    name: 'Empreendedor Emergente',
                    role: 'Founder / Sócio',
                    age: 30,
                    bio: `Empreendedor no segmento ${segment} na fase de estruturação comercial.${tamanhoLabel ? ` Empresa ${tamanhoLabel}.` : ''} Busca acelerar crescimento sem reinventar a roda.`,
                    pain: 'Faz tudo sozinho, vendas dependem do founder e não tem processo comercial estruturado.',
                    trigger: 'Primeiro grande cliente, necessidade de escalar ou preparação para captar investimento.',
                    message: 'Framework pronto para estruturar vendas, marketing e processos desde o início.',
                    wiifm: 'Aceleração do crescimento, processo comercial replicável e preparação para scale.',
                    channels: ['Instagram', 'WhatsApp', 'Eventos'],
                    personality: { analytical_creative: 70, passive_active: 80, reserved_extroverted: 65, reactive_preventive: 55 },
                },
            ];
        }

        // Final formatting — add company_context + location
        return personas.map(p => ({
            ...p,
            location: 'Brasil',
            company_context: `${segment}${tamanhoLabel ? ` — ${tamanhoLabel}` : ''}`,
        }));
    }

    /**
     * Builds 3 BenchmarkSection-compatible competitor/market study entries.
     * Uses concorrentes textarea if available, otherwise generates contextual studies.
     */
    static generateBenchmarkFromREI(answers: any): any[] {
        const concorrentesText = (answers.concorrentes || '').trim();
        const segment = answers.segmento === 'outro'
            ? (answers.segmento_outro || 'B2B')
            : (answers.segmento || answers.segmento_outro || 'B2B');
        const desafios = answers.desafios || [];
        const cacAtual = answers.cacAtual || '';
        const ticketMedio = answers.ticketMedio || '';
        const segLower = segment.toLowerCase();

        const keywords: string[] = (answers.keywords || '')
            .split(/[,\n;]+/).map((k: string) => k.trim()).filter((k: string) => k.length > 1).slice(0, 4);

        // If concorrentes were listed, parse them + fill to 3
        if (concorrentesText) {
            const lines = concorrentesText.split(/[,\n;]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 2);
            const parsed = lines.slice(0, 3).map((line: string) => {
                const match = line.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
                return {
                    company_name: (match?.[1] || line).trim(),
                    domain: '', monthly_traffic: '—', domain_authority: 0, avg_cpc: '—',
                    top_keywords: keywords,
                    strengths: (match?.[2] || '').trim() || 'A ser aprofundado via Deep Research.',
                    weaknesses: 'Análise detalhada disponível com "Gerar Inteligência de Mercado".',
                };
            });
            // Fill to 3 if needed
            while (parsed.length < 3) {
                parsed.push({
                    company_name: `Concorrente ${parsed.length + 1} (a identificar)`,
                    domain: '', monthly_traffic: '—', domain_authority: 0, avg_cpc: '—',
                    top_keywords: keywords.length > 0 ? keywords : [segment],
                    strengths: `Player do segmento ${segment} — análise será aprofundada via Deep Research.`,
                    weaknesses: 'Será detalhado ao clicar em "Gerar Inteligência de Mercado" acima.',
                });
            }
            return parsed;
        }

        // No concorrentes — generate 3 contextual market studies
        const desafioContext = desafios.length > 0
            ? desafios.slice(0, 2).map((d: string) => {
                const labels: Record<string, string> = {
                    'leads': 'geração de leads', 'conversao': 'conversão', 'cac': 'redução de CAC',
                    'escalar': 'escala comercial', 'churn': 'retenção', 'previsibilidade': 'previsibilidade',
                };
                return labels[d] || d;
            }).join(' e ')
            : 'crescimento';

        return [
            {
                company_name: `Referência #1 — ${segment}`,
                domain: '', monthly_traffic: '—', domain_authority: 0,
                avg_cpc: cacAtual || '—',
                top_keywords: keywords.length > 0 ? keywords : [segment, 'consultoria'],
                strengths: `Líder de mercado no segmento ${segment}. Investimento forte em ${desafioContext}. Posicionamento premium.${ticketMedio ? ` Ticket referência: ${ticketMedio}.` : ''}`,
                weaknesses: 'Clique em "Deep Benchmark" para análise detalhada via Inteligência de Mercado.',
            },
            {
                company_name: `Referência #2 — Competidor Digital`,
                domain: '', monthly_traffic: '—', domain_authority: 0, avg_cpc: '—',
                top_keywords: keywords.length > 0 ? keywords : [segment, 'online'],
                strengths: `Player com forte presença digital no segmento ${segment}. SEO e conteúdo como canal principal de aquisição.`,
                weaknesses: 'Detalhamento disponível via "Gerar Inteligência de Mercado" com dados reais de tráfego e keywords.',
            },
            {
                company_name: `Referência #3 — Novo Entrante`,
                domain: '', monthly_traffic: '—', domain_authority: 0, avg_cpc: '—',
                top_keywords: keywords.length > 0 ? keywords : [segment, 'startup'],
                strengths: `Startup ou novo player com modelo de negócio inovador no segmento ${segment}. Foco em ${desafioContext} com abordagem diferenciada.`,
                weaknesses: 'Análise comparativa completa disponível ao ativar Deep Benchmark acima.',
            },
        ];
    }


    /**
     * Returns segment-aware default industry trends when Perplexity AI is unavailable.
     * Uses: segmento.
     */
    static generateDefaultTrends(answers: any): string[] {
    const raw = answers.segmento === 'outro'
        ? (answers.segmento_outro || '')
        : (answers.segmento || answers.segmento_outro || '');
    const segment = raw.toLowerCase();

    if (segment.includes('saas') || segment.includes('software')) {
        return [
            'Product-Led Growth (PLG) como motor de aquisição: empresas SaaS que adotam PLG crescem 2x mais rápido',
            'AI-native features viram commodity — diferencial migra para onboarding e time-to-value',
            'Revenue Operations integrado (RevOps) reduz CAC em até 25% ao alinhar marketing, vendas e CS',
        ];
    }
    if (segment.includes('fintech') || segment.includes('financ')) {
        return [
            'Open Finance amplia superfície de dados para personalização de ofertas e redução de inadimplência',
            'Compliance-first como diferencial competitivo: empresas que investem em governança crescem mais confiantes',
            'Embedded Finance: serviços financeiros dentro de plataformas não-financeiras ganham tração acelerada',
        ];
    }
    if (segment.includes('cyber') || segment.includes('segurança')) {
        return [
            'Zero Trust Architecture vira padrão mínimo de segurança para empresas médias e grandes',
            'Aumento de 300% em ataques de ransomware gera urgência e budget de segurança',
            'Conformidade com LGPD e frameworks internacionais (ISO 27001) como gatilho de compra',
        ];
    }
    // Generic B2B default
    return [
        'Automação de processos com IA generativa reduz custo operacional em 20–35% para empresas B2B',
        'Revenue Operations integrado (RevOps) como vantagem competitiva — elimina silos entre marketing, vendas e CS',
        'Personalização baseada em dados aumenta taxas de conversão em até 35% no pipeline',
    ];
}
}

