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
        const answers = response.responses as Record<string, any>;
        const plan_data = this.generatePlanFromResponse(response, marketData);

        // --- INTELLIGENCE LAYER (The Voice) ---
        const segment = answers.segmento || 'Generalista';
        const objective = answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';

        // 1. Context Mirror
        const context_mirror = {
            segment,
            objective,
            maturity: hasCRM ? 'Intermediária (Possui CRM)' : 'Inicial (Sem CRM)',
            restrictions: `Budget: ${budget}`
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
        const answers = response.responses as Record<string, any>; // The raw answers

        // 1. ANALYZE CONTEXT (The "Brain")
        const segment = answers.segmento || 'Generalista';
        const objective = answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';

        // Extract specific GTM data 
        // DATA LINKING: We explicitly capture these to show "Based on X" later
        const challenges = answers.desafios || [];
        const bottlenecks = answers.gargalo || answers.gargaloFunil || 'Não identificado';
        const channels = answers.canaisAquisicao || [];
        const growthGoal = answers.metaCrescimento || 'Não definida';

        // 2. GENERATE MODULES
        return {
            premises_data: this.generatePremises(segment, objective, bottlenecks, answers), // Pass full answers for linking
            methodology_data: this.generateMethodology(isB2B, channels),
            roadmap_data: this.generateRoadmap(hasCRM, isB2B, challenges),
            goals_data: this.generateGoals(objective, growthGoal),
            financial_projections: this.generateProjections(budget),
            budget_data: this.generateBudget(budget, isB2B),
            next_steps_data: this.generateNextSteps(hasCRM),
            market_intelligence: marketData || null
        };
    }

    // --- HELPER LOGIC ---

    private static checkHasCRM(answers: any): boolean {
        // Simple heuristic: check if they mentioned a CRM name or "Sim" to tool questions
        const tools = (answers.ferramentasAtuais || answers.crm || '').toLowerCase();
        return tools.includes('active') || tools.includes('rd station') || tools.includes('pipedrive') || tools.includes('hubspot') || tools.includes('salesforce') || tools.length > 3;
    }

    private static checkIsB2B(answers: any): boolean {
        const segment = (answers.segmento || '').toLowerCase();
        const idealCustomer = (answers.clienteIdeal || '').toLowerCase();
        return segment.includes('b2b') || segment.includes('tech') || segment.includes('saas') || idealCustomer.includes('empresas') || idealCustomer.includes('corporativo');
    }

    // --- GENERATORS ---

    private static generatePremises(segment: string, objective: string, bottleneck: string, answers: any) {
        return {
            pillars: [
                {
                    name: 'Contexto',
                    icon: 'building',
                    items: [
                        `Segmento: ${segment} (Baseado na resposta: "Qual seu segmento?")`,
                        `Foco: ${objective} (Baseado na resposta: "Objetivo Principal")`
                    ]
                },
                {
                    name: 'Diagnóstico',
                    icon: 'search',
                    items: [
                        `Maturidade Digital: ${this.checkHasCRM(answers) ? 'Intermediária' : 'Inicial'} (Análise de Ferramentas)`,
                        `Gargalo Principal: ${bottleneck}`
                    ]
                }
            ]
        };
    }

    private static generateMethodology(isB2B: boolean, currentChannels: string[]) {
        const steps = [];

        if (isB2B) {
            steps.push({ name: 'ABM & Outreach', description: 'Foco em listas segmentadas e abordagem direta via LinkedIn/Cold Email.' });
            steps.push({ name: 'Conteúdo de Autoridade', description: 'Whitepapers e Cases para nutrir decisores técnicos.' });
            steps.push({ name: 'Sales Enablement', description: 'Materiais de apoio para o time comercial fechar contas complexas.' });
        } else {
            steps.push({ name: 'Tráfego de Alta Intenção', description: 'Google Ads e Meta Ads focados em conversão direta.' });
            steps.push({ name: 'Otimização de Conversão (CRO)', description: 'Melhoria contínua da página de vendas.' });
            steps.push({ name: 'Nutrição Automática', description: 'Sequências de email para recuperação de vendas.' });
        }

        // Add channel specific nuance
        if (currentChannels.includes('Google Ads')) {
            steps.push({ name: 'Otimização Search', description: 'Refinamento de palavras-chave negativas e Quality Score.' });
        }

        return { steps };
    }

    private static generateRoadmap(hasCRM: boolean, isB2B: boolean, challenges: string[]) {
        const phases = [];

        // Phase 1: Foundation (Condicional)
        const foundationItems = ['Configuração de DNS/Deliverability', 'Integração de Formulários'];
        if (!hasCRM) {
            foundationItems.unshift('Implementação de CRM (Prioridade Zero)');
        } else {
            foundationItems.unshift('Auditoria de CRM e Limpeza de Dados');
        }

        // Add items based on challenges
        if (challenges.some(c => c.includes('Processo') || c.includes('Desorganização'))) {
            foundationItems.push('Definição de Playbook de Vendas');
        }

        phases.push({
            name: 'Semana 1-2',
            title: 'Fundação & Tech Setup',
            items: foundationItems
        });

        // Phase 2: Growth Engine
        const growthItems = [];
        if (isB2B) {
            growthItems.push('Definição de ICP e Matriz de Objeções');
            growthItems.push('Construção de Listas de Prospecção');
            growthItems.push('Setup de Cold Mail & LinkedIn Automation');
        } else {
            growthItems.push('Criação de Criativos de Alta Conversão');
            growthItems.push('Setup de Campanhas (Meta/Google)');
            growthItems.push('Testes A/B de Landing Pages');
        }

        phases.push({
            name: 'Semana 3-6',
            title: isB2B ? 'Motor de Vendas B2B' : 'Escala de Mídia Paga',
            items: growthItems
        });

        // Phase 3: Optimziation
        phases.push({
            name: 'Semana 7-12',
            title: 'Otimização & Escala',
            items: ['Review de Métricas de Funil', 'Ajuste de Investimento por Canal', 'Implementação de Novos Testes de Canal']
        });

        return { phases };
    }

    private static generateGoals(objective: string, growthGoal: string) {
        return {
            okrs: [
                { kr: 'Objetivo Estratégico', description: objective },
                { kr: 'Meta de Crescimento', description: growthGoal }
            ],
            month1_targets: [
                { name: 'Setup de Infraestrutura', status: 'pending' },
                { name: 'Validação de Canais de Aquisição', status: 'pending' }
            ]
        };
    }

    private static generateProjections(budget: string) {
        return {
            note: `Projeções baseadas no budget declarado de ${budget}`,
            monthly_projections: [
                { period: 'Mês 1', nmrr_total: 'Setup' },
                { period: 'Mês 3', nmrr_total: 'Tração Inicial' },
                { period: 'Mês 6', nmrr_total: 'Escala' }
            ]
        };
    }

    private static generateBudget(budget: string, isB2B: boolean) {
        return {
            annual_budget: budget,
            channels: isB2B ? [
                { name: 'Ferramentas & Dados (Outbound)', percentage: '30%' },
                { name: 'Mídia Paga (LinkedIn/Google)', percentage: '40%' },
                { name: 'Conteúdo & Enablement', percentage: '30%' }
            ] : [
                { name: 'Meta Ads', percentage: '50%' },
                { name: 'Google Ads', percentage: '30%' },
                { name: 'Creators/Influencers', percentage: '20%' }
            ]
        };
    }

    private static generateNextSteps(hasCRM: boolean) {
        const actions = [];
        actions.push({ day: 'Imediato', action: 'Aprovação do Planejamento', done: false });
        if (!hasCRM) actions.push({ day: 'Imediato', action: 'Seleção de CRM', done: false });
        actions.push({ day: 'Dia 1', action: 'Onboarding do Time', done: false });

        return { week1_actions: actions };
    }
}
