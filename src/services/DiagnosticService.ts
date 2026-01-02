import { ReiResponse } from "@/api/reiResponses";

export interface StrategicPlanData {
    premises_data: any;
    methodology_data: any;
    roadmap_data: any;
    goals_data: any;
    financial_projections: any;
    budget_data: any;
    next_steps_data: any;
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

    static generateDiagnosis(response: ReiResponse): DiagnosticResult {
        const answers = response.responses as Record<string, any>;
        const plan_data = this.generatePlanFromResponse(response);

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


    static generatePlanFromResponse(response: ReiResponse): StrategicPlanData {
        const answers = response.responses as Record<string, any>; // The raw answers

        // 1. ANALYZE CONTEXT (The "Brain")
        const segment = answers.segmento || 'Generalista';
        const objective = answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = this.checkHasCRM(answers);
        const isB2B = this.checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';

        // 2. GENERATE MODULES
        return {
            premises_data: this.generatePremises(segment, objective),
            methodology_data: this.generateMethodology(isB2B),
            roadmap_data: this.generateRoadmap(hasCRM, isB2B),
            goals_data: this.generateGoals(objective),
            financial_projections: this.generateProjections(budget),
            budget_data: this.generateBudget(budget, isB2B),
            next_steps_data: this.generateNextSteps(hasCRM)
        };
    }

    // --- HELPER LOGIC ---

    private static checkHasCRM(answers: any): boolean {
        // Simple heuristic: check if they mentioned a CRM name or "Sim" to tool questions
        const tools = (answers.ferramentasAtuais || '').toLowerCase();
        return tools.includes('active') || tools.includes('rd station') || tools.includes('pipedrive') || tools.includes('hubspot');
    }

    private static checkIsB2B(answers: any): boolean {
        const segment = (answers.segmento || '').toLowerCase();
        const idealCustomer = (answers.clienteIdeal || '').toLowerCase();
        return segment.includes('b2b') || segment.includes('tech') || segment.includes('saas') || idealCustomer.includes('empresas');
    }

    // --- GENERATORS ---

    private static generatePremises(segment: string, objective: string) {
        return {
            pillars: [
                {
                    name: 'Contexto',
                    icon: '🏢',
                    items: [`Segmento: ${segment}`, `Foco: ${objective}`]
                },
                {
                    name: 'Diagnóstico',
                    icon: '🔍',
                    items: ['Análise de Maturidade Realizada', 'Gargalos Identificados']
                }
            ]
        };
    }

    private static generateMethodology(isB2B: boolean) {
        if (isB2B) {
            return {
                steps: [
                    { name: 'ABM & Outreach', description: 'Foco em listas segmentadas e abordagem direta via LinkedIn/Cold Email.' },
                    { name: 'Conteúdo de Autoridade', description: 'Whitepapers e Cases para nutrir decisores técnicos.' },
                    { name: 'Sales Enablement', description: 'Materiais de apoio para o time comercial fechar contas complexas.' }
                ]
            };
        } else {
            return {
                steps: [
                    { name: 'Tráfego de Alta Intenção', description: 'Google Ads e Meta Ads focados em conversão direta.' },
                    { name: 'Otimização de Conversão (CRO)', description: 'Melhoria contínua da página de vendas.' },
                    { name: 'Nutrição Automática', description: 'Sequências de email para recuperação de vendas.' }
                ]
            };
        }
    }

    private static generateRoadmap(hasCRM: boolean, isB2B: boolean) {
        const phases = [];

        // Phase 1: Foundation (Condicional)
        if (!hasCRM) {
            phases.push({
                name: 'Semana 1-2',
                title: 'Fundação & Tech Setup',
                items: ['Implementação de CRM', 'Configuração de DNS/Deliverability', 'Integração de Formulários']
            });
        } else {
            phases.push({
                name: 'Semana 1',
                title: 'Auditoria & Otimização',
                items: ['Revisão do CRM atual', 'Limpeza de Base', 'Ajuste de Funil']
            });
        }

        // Phase 2: Growth Engine
        if (isB2B) {
            phases.push({
                name: 'Semana 3-6',
                title: 'Motor de Vendas B2B',
                items: ['Definição de ICP', 'Construção de Listas', 'Cadências de Outbound', 'Treinamento de SDRs']
            });
        } else {
            phases.push({
                name: 'Semana 2-5',
                title: 'Escala de Mídia',
                items: ['Criação de Criativos (UGC)', 'Setup de Campanhas', 'Testes A/B de Landing Pages']
            });
        }

        return { phases };
    }

    private static generateGoals(objective: string) {
        return {
            okrs: [
                { kr: 'Objetivo Principal', description: objective },
                { kr: 'Saúde do Funil', description: 'Garantir rastreabilidade de ponta a ponta.' }
            ],
            month1_targets: [
                { name: 'Setup Concluído', status: 'pending' },
                { name: 'Primeiros Leads Qualificados', status: 'pending' }
            ]
        };
    }

    private static generateProjections(budget: string) {
        return {
            note: `Projeções baseadas no budget declarado de ${budget}`,
            monthly_projections: [
                { period: 'Mês 1', nmrr_total: '-' }, // TBD
                { period: 'Mês 3', nmrr_total: 'Growth' }
            ]
        };
    }

    private static generateBudget(budget: string, isB2B: boolean) {
        return {
            annual_budget: budget,
            channels: isB2B ? [
                { name: 'Outbound Tools', percentage: '40%' },
                { name: 'LinkedIn Ads', percentage: '30%' },
                { name: 'Conteúdo', percentage: '30%' }
            ] : [
                { name: 'Meta Ads', percentage: '50%' },
                { name: 'Google Ads', percentage: '30%' },
                { name: 'Creators', percentage: '20%' }
            ]
        };
    }

    private static generateNextSteps(hasCRM: boolean) {
        const actions = [];
        if (!hasCRM) actions.push({ day: 'Imediato', action: 'Escolher e Contratar CRM', done: false });
        actions.push({ day: 'Dia 1', action: 'Validar Acesso às Contas de Anúncio', done: false });

        return { week1_actions: actions };
    }
}
