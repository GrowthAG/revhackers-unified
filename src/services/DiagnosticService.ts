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
            title: `Embarque & Setup — ${formatDate(startDate)} a ${formatDate(addDays(startDate, 14))}`,
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
            title: `Estratégia & Kickoff — ${formatDate(addDays(startDate, 15))} a ${formatDate(addDays(startDate, 21))}`,
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
            title: `Execução & Adoção — ${formatDate(addDays(startDate, 22))} a ${formatDate(addDays(startDate, 70))}`,
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
            title: `Valor & Expansão — a partir de ${formatDate(addDays(startDate, 71))}`,
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
            month1_targets.push({ name: `Validar LTV atual (declarado: ${ltvAtual})`, status: 'pending' });
        }

        return { okrs, month1_targets };
    }

    private static generateProjections(budget: string, answers: any) {
        const ticketMedioRaw = answers.ticketMedio || '';
        const mrrSelect = answers.mrr || '';
        const growthGoal = answers.metaCrescimento || '';
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
            'ate-5k': 3000, 'ate-10k': 7000, '10k-25k': 15000,
            '25k-50k': 35000, 'acima-50k': 75000,
        };
        const churnMap: Record<string, number> = {
            '0-2': 1, '2-5': 3.5, '5-10': 7.5, 'acima-10': 15,
        };
        const ltvMap: Record<string, number> = {
            'menor-5k': 3500, '5k-20k': 12000, '20k-100k': 50000, 'acima-100k': 150000,
        };

        const currentMRR = mrrMap[mrrSelect] || parseFloat(String(mrrSelect).replace(/[^0-9]/g, '')) || 8000;
        const monthlyBudget = budgetMap[orcamento] || parseFloat(String(orcamento).replace(/[^0-9]/g, '')) || 5000;
        const churn = (churnMap[churnRate] || 3) / 100;
        const ltv = ltvMap[ltvAtual] || 0;

        // Parse ticket médio (e.g. "R$ 3.500,00" → 3500)
        const ticketNum = parseFloat(String(ticketMedioRaw).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const ticketMedio = ticketNum > 0 ? ticketNum : (currentMRR > 0 ? Math.round(currentMRR / 10) : 1500);

        // Parse CAC (e.g. "R$ 500,00" → 500 or "alto" → estimate)
        const cacNum = parseFloat(String(cacAtual).replace(/[R$\s.]/g, '').replace(',', '.'));
        const estimatedCAC = !isNaN(cacNum) && cacNum > 0 ? cacNum : Math.round(ticketMedio * 0.25);

        // ── Growth rate based on metaCrescimento ────────────────────────
        const growthRates: Record<string, number> = {
            'agressivo': 0.20, 'crescer': 0.15, 'moderado': 0.10, 'manter': 0.05,
            'escalar': 0.18, 'dobrar': 0.25,
        };
        const monthlyGrowth = growthRates[growthGoal.toLowerCase()] || 0.12;

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

    private static generateBudget(budget: string, isB2B: boolean, answers: any) {
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
     * Builds 3 BenchmarkSection-compatible competitor entries.
     * Priority: structured fields > legacy textarea > segment fallback.
     */
    static generateBenchmarkFromREI(answers: any): any[] {
        const segment = answers.segmento === 'outro'
            ? (answers.segmento_outro || 'B2B')
            : (answers.segmento || answers.segmento_outro || 'B2B');
        const segLower = segment.toLowerCase();

        // Parse CAC select value to realistic CPC
        const cacSelect = answers.cacAtual || '';
        const cacLabels: Record<string, string> = {
            'menor-500': 'R$ 2,80', '500-2k': 'R$ 4,50', '2k-5k': 'R$ 6,20',
            'acima-5k': 'R$ 9,40', 'nao-sei': '—',
        };
        const avgCpc = cacLabels[cacSelect] || '—';

        // 1. Check structured fields first (concorrente1_nome, concorrente1_site, etc.)
        const structured: Array<{ name: string; site: string }> = [];
        for (let n = 1; n <= 3; n++) {
            const nome = (answers[`concorrente${n}_nome`] || '').trim();
            const site = (answers[`concorrente${n}_site`] || '').trim();
            if (nome) structured.push({ name: nome, site });
        }

        // 2. Fallback: legacy textarea (comma/newline separated)
        const concorrentesText = (answers.concorrentes || '').trim();
        if (structured.length === 0 && concorrentesText) {
            const lines = concorrentesText.split(/[,\n;]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 2);
            lines.slice(0, 3).forEach((line: string) => {
                const match = line.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
                structured.push({
                    name: (match?.[1] || line).trim(),
                    site: (match?.[2] || '').trim(),
                });
            });
        }

        // 3. If we have any competitor names, build entries from them
        if (structured.length > 0) {
            const parsed = structured.slice(0, 3).map((c, i) => {
                const cleanSite = c.site.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
                return {
                    company_name: c.name,
                    domain: cleanSite || `${c.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com.br`,
                    monthly_traffic: ['—', '—', '—'][i],
                    domain_authority: 0,
                    avg_cpc: avgCpc,
                    top_keywords: this.getSegmentKeywords(segLower).slice(0, 3),
                    strengths: `Player do segmento — análise aprofundada via "Gerar Inteligência de Mercado".`,
                    weaknesses: 'Dados de tráfego e keywords serão preenchidos pelo Deep Research.',
                };
            });
            // Fill to 3 if needed
            while (parsed.length < 3) {
                parsed.push({
                    company_name: `Concorrente ${parsed.length + 1} (a identificar)`,
                    domain: '—', monthly_traffic: '—', domain_authority: 0, avg_cpc: '—',
                    top_keywords: this.getSegmentKeywords(segLower).slice(0, 2),
                    strengths: 'Será identificado na fase de Deep Research.',
                    weaknesses: 'Clique em "Gerar Inteligência de Mercado" para análise.',
                });
            }
            return parsed;
        }

        // 4. No concorrentes at all — generate segment-specific fallback profiles
        const profiles = this.getSegmentCompetitors(segLower, segment);
        const keywords = this.getSegmentKeywords(segLower);

        return profiles.map((p, i) => ({
            company_name: p.name,
            domain: p.domain,
            monthly_traffic: p.traffic,
            domain_authority: p.da,
            avg_cpc: avgCpc,
            top_keywords: keywords.slice(i, i + 3),
            strengths: p.strengths,
            weaknesses: p.weaknesses,
        }));
    }




    /** Returns segment-specific competitor profiles */
    private static getSegmentCompetitors(segLower: string, segment: string): Array<{ name: string; domain: string; traffic: string; da: number; strengths: string; weaknesses: string }> {
        if (segLower.includes('financ') || segLower.includes('consultor')) {
            return [
                { name: 'XP Assessoria de Investimentos', domain: 'xpassessor.com.br', traffic: '120K', da: 52, strengths: 'Marca consolidada, presença nacional, forte captação via indicação e mídia. Plataforma completa de investimentos.', weaknesses: 'Atendimento massificado, pouco personalizado para clientes PF de alto patrimônio.' },
                { name: 'Par Mais Consultoria Financeira', domain: 'parmais.com.br', traffic: '28K', da: 35, strengths: 'Especialista em planejamento financeiro pessoal. Forte em conteúdo educativo e SEO orgânico.', weaknesses: 'Ticket médio limitado, foco em classe média. Processo comercial pouco digital.' },
                { name: 'Warren Digital', domain: 'warren.com.br', traffic: '85K', da: 48, strengths: 'Modelo digital-first, onboarding 100% online. Forte tração em mídia paga e growth marketing.', weaknesses: 'Foco em público jovem/early career. Baixo diferencial em consultoria PJ.' },
            ];
        }
        if (segLower.includes('saas') || segLower.includes('software') || segLower.includes('tech')) {
            return [
                { name: 'RD Station (TOTVS)', domain: 'rdstation.com', traffic: '450K', da: 65, strengths: 'Líder em automação de marketing no Brasil. Ecossistema completo com CRM e e-commerce.', weaknesses: 'Produto engessado para operações B2B complexas. Churn alto em SMBs.' },
                { name: 'Pipedrive Brasil', domain: 'pipedrive.com/pt', traffic: '180K', da: 58, strengths: 'CRM intuitivo e focado em vendas. Forte em onboarding e product-led growth.', weaknesses: 'Limitações em automação avançada e relatórios customizados.' },
                { name: 'Meetime', domain: 'meetime.com.br', traffic: '35K', da: 32, strengths: 'Especialista em inside sales e SDR. Forte em conteúdo B2B e geração de autoridade.', weaknesses: 'Nicho muito específico. Oferta limitada fora do universo de vendas consultivas.' },
            ];
        }
        if (segLower.includes('saúde') || segLower.includes('saude') || segLower.includes('health') || segLower.includes('médic') || segLower.includes('medic')) {
            return [
                { name: 'Doctoralia', domain: 'doctoralia.com.br', traffic: '2.5M', da: 62, strengths: 'Marketplace dominante para agendamento médico. SEO orgânico fortíssimo e base de pacientes.', weaknesses: 'Modelo marketplace dilui a marca do profissional. Dependência de volume.' },
                { name: 'iClinic (Afya)', domain: 'iclinic.com.br', traffic: '95K', da: 42, strengths: 'Software de gestão para clínicas. Ecossistema completo com prontuário eletrônico.', weaknesses: 'Foco em gestão operacional, fraco em marketing e captação de pacientes.' },
                { name: 'Clínica Ideal', domain: 'clinicaideal.com.br', traffic: '15K', da: 25, strengths: 'Conteúdo educativo para profissionais de saúde. Comunidade ativa e engajada.', weaknesses: 'Modelo de negócio não escalável. Pouco investimento em tráfego pago.' },
            ];
        }
        if (segLower.includes('juríd') || segLower.includes('legal') || segLower.includes('advog') || segLower.includes('direito')) {
            return [
                { name: 'Projuris', domain: 'projuris.com.br', traffic: '45K', da: 38, strengths: 'Software jurídico líder. Forte presença em eventos e conteúdo para advogados.', weaknesses: 'Foco em gestão de processos, fraco em captação de clientes para escritórios.' },
                { name: 'Aurum Software', domain: 'aurum.com.br', traffic: '65K', da: 42, strengths: 'Plataforma completa para escritórios de advocacia. Marketing de conteúdo referência no setor.', weaknesses: 'Mercado de software jurídico saturado. Diferenciação cada vez mais difícil.' },
                { name: 'Jusbrasil', domain: 'jusbrasil.com.br', traffic: '15M', da: 72, strengths: 'Maior portal jurídico do Brasil. SEO dominante e base massiva de advogados.', weaknesses: 'Modelo freemium com baixa conversão. Público misto sem segmentação clara.' },
            ];
        }
        // Generic B2B fallback
        const cleanSegment = segment.split(',')[0].trim();
        return [
            { name: `Líder Digital — ${cleanSegment}`, domain: 'liderdigital.com.br', traffic: '45K', da: 38, strengths: `Player consolidado no segmento de ${cleanSegment}. Investimento consistente em mídia paga e presença digital.`, weaknesses: 'Modelo de vendas tradicional. Processo comercial pouco automatizado.' },
            { name: `Referência Nacional — ${cleanSegment}`, domain: 'refnacional.com.br', traffic: '28K', da: 32, strengths: `Forte em conteúdo educativo e SEO no nicho de ${cleanSegment}. Autoridade reconhecida.`, weaknesses: 'Foco em branding sem estrutura de conversão. Pipeline desorganizado.' },
            { name: `Novo Player Digital — ${cleanSegment}`, domain: 'novoplayer.com.br', traffic: '12K', da: 22, strengths: `Abordagem digital-first no mercado de ${cleanSegment}. Onboarding ágil e proposta inovadora.`, weaknesses: 'Base de clientes pequena. Pouca validação de mercado.' },
        ];
    }

    /** Returns segment-specific keywords */
    private static getSegmentKeywords(segLower: string): string[] {
        if (segLower.includes('financ') || segLower.includes('consultor')) {
            return ['consultoria financeira', 'planejamento financeiro', 'assessoria de investimentos', 'gestão patrimonial', 'consultoria empresarial financeira', 'planejamento tributário'];
        }
        if (segLower.includes('saas') || segLower.includes('software') || segLower.includes('tech')) {
            return ['software gestão', 'CRM vendas', 'automação comercial', 'plataforma SaaS', 'ferramenta de vendas', 'sistema gestão comercial'];
        }
        if (segLower.includes('saúde') || segLower.includes('saude') || segLower.includes('health')) {
            return ['agendamento médico', 'gestão clínica', 'marketing para médicos', 'captação pacientes', 'software clínica', 'prontuário eletrônico'];
        }
        if (segLower.includes('juríd') || segLower.includes('legal') || segLower.includes('advog')) {
            return ['software jurídico', 'gestão escritório advocacia', 'captação clientes advogado', 'marketing jurídico', 'CRM para advogados', 'automação jurídica'];
        }
        return ['growth marketing', 'geração de leads B2B', 'consultoria comercial', 'automação de vendas', 'CRM empresarial', 'marketing digital B2B'];
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

