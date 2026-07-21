// ============================================================================
// diagnostic/index.ts
// P-01: Ponto de entrada do módulo diagnóstico refatorado.
// DiagnosticService mantém a mesma API pública que antes — os consumidores
// não precisam mudar seus imports (DiagnosticService ainda é exportado aqui).
// O arquivo original DiagnosticService.ts agora pode ser substituído por
// um re-export simples deste módulo.
// ============================================================================

import { ReiResponse } from '@/api/reiResponses';
import {
    DiagnosticResult, DiagnosticSignal, DiagnosticRisk,
    StrategicDecision, StrategicPlanData,
} from './types';
import { mapLabel, mapLabels, checkHasCRM, checkIsB2B } from './mapper';
import {
    generateBenchmarkFromREI,
    generatePersonasFromREI,
    generateDefaultTrends,
    generateSearchKeywordsFromREI,
    generateImplementationSteps,
    generatePremises,
    generateMethodology,
    generateRoadmap,
    generateGoals,
    generateProjections,
    generateBudget,
    generateNextSteps,
} from './generators';

// Re-export types so existing consumers keep working with a single import
export * from './types';
export * from './mapper';

/**
 * DiagnosticService — wrapper de compatibilidade sobre os módulos refatorados.
 * Mantém exatamente a mesma API estática que existia antes.
 * P-01: o arquivo original tinha 67KB / 1293 linhas em uma única classe.
 * Agora o domínio está em 4 arquivos focados:
 *   - types.ts       (interfaces)
 *   - mapper.ts      (label maps + helpers)
 *   - generators.ts  (funções puras de geração de plano)
 *   - index.ts       (classe wrapper para compat + generateDiagnosis + generatePlanFromResponse)
 */
export class DiagnosticService {
    // ── Fallback generators (usados externamente) ───────────────────────────
    static generateBenchmarkFromREI(answers: any) { return generateBenchmarkFromREI(answers); }
    static generatePersonasFromREI(answers: any) { return generatePersonasFromREI(answers); }
    static generateDefaultTrends(answers: any) { return generateDefaultTrends(answers); }
    static generateSearchKeywordsFromREI(answers: any) { return generateSearchKeywordsFromREI(answers); }

    // ── Helpers expostos (alguns componentes chamavam esses) ────────────────
    static checkHasCRM(answers: any) { return checkHasCRM(answers); }
    static checkIsB2B(answers: any) { return checkIsB2B(answers); }

    // ── generatePlanFromResponse ────────────────────────────────────────────
    static generatePlanFromResponse(response: ReiResponse, marketData?: any, projectType?: string, aiPlanData?: any): StrategicPlanData {
        const rawResponses = response.responses as Record<string, any>;
        const answers = rawResponses?.form_data || rawResponses || {};
        const segment = answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.metaCrescimento || answers.objetivoPrincipal || 'Crescimento';
        const hasCRM = checkHasCRM(answers);
        const isB2B = checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';
        const challenges = answers.desafios || [];
        const bottlenecksRaw = answers.gargaloFunil || answers.gargalo || '';
        const bottlenecks = bottlenecksRaw === 'outro' ? (answers.gargaloFunil_outro || answers.gargalo_outro || 'Outro') : mapLabel('gargaloFunil', bottlenecksRaw) || 'Não identificado';
        const channels = answers.canaisAquisicao || [];
        const growthGoal = mapLabel('metaCrescimento', answers.metaCrescimento || '') || 'Não definida';

        return {
            premises_data: aiPlanData?.pillars ? { pillars: aiPlanData.pillars } : generatePremises(segment, objective, bottlenecks, answers, projectType),
            methodology_data: aiPlanData?.methodology_steps ? { steps: aiPlanData.methodology_steps } : generateMethodology(isB2B, channels, answers, projectType),
            roadmap_data: aiPlanData?.roadmap_phases
                ? { phases: aiPlanData.roadmap_phases, project_duration: aiPlanData.project_duration || undefined }
                : generateRoadmap(hasCRM, isB2B, challenges, answers, marketData, projectType),
            goals_data: aiPlanData?.okrs ? {
                okrs: aiPlanData.okrs.map((o: any) => ({
                    ...o,
                    krs: Array.isArray(o.sub_results) && o.sub_results.length > 0
                        ? o.sub_results.map((text: string, j: number) => ({ label: `RK ${j + 1}`, text, target: o.timeline || 'Trimestre' }))
                        : (o.krs || [])
                }))
            } : generateGoals(objective, growthGoal, answers, projectType),
            financial_projections: generateProjections(budget, answers),
            budget_data: generateBudget(budget, isB2B, answers, projectType),
            next_steps_data: generateNextSteps(hasCRM, answers, projectType),
            market_intelligence: marketData || null,
        };
    }

    // ── generateDiagnosis ───────────────────────────────────────────────────
    static generateDiagnosis(response: ReiResponse, marketData?: any, projectType?: string, aiPlanData?: any): DiagnosticResult {
        const rawResponses = response.responses as Record<string, any>;
        const answers = rawResponses?.form_data || rawResponses || {};
        const plan_data = this.generatePlanFromResponse(response, marketData, projectType, aiPlanData);

        const segment = answers.revops_segmento || answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.revops_objetivo_principal || answers.metaCrescimento || answers.objetivoPrincipal || (projectType === 'crm_ops' ? 'Eficiência Operacional & Escala' : 'Crescimento');
        const hasCRM = checkHasCRM(answers);
        const isB2B = checkIsB2B(answers);
        const budget = answers.orcamento || 'Não informado';
        const ticketMedio = answers.revops_ticket_medio || answers.ticketMedio || '';
        const tamanho = answers.revops_tamanho_time || answers.tamanho || '';

        let crmName = answers.crm === 'outro' ? (answers.crm_outro || 'Outro') : mapLabel('crm', answers.crm || '') || '';
        if (projectType === 'crm_ops') {
            const rawCRM = answers.revops_hub_central;
            if (rawCRM && rawCRM.toLowerCase() !== 'nenhum' && rawCRM !== 'Não tenho' && rawCRM !== '') crmName = rawCRM;
        }

        const restrictionsText = projectType === 'crm_ops'
            ? `${tamanho ? `Equipe: ${tamanho}` : 'Tamanho: Não informado'}${ticketMedio ? ` | Ticket: ${ticketMedio}` : ''}`
            : `Budget: ${budget}${ticketMedio ? ` | Ticket: ${ticketMedio}` : ''}${tamanho ? ` | Equipe: ${tamanho}` : ''}`;

        const websiteUrl = answers.website_url || null;
        const context_mirror = aiPlanData?.context_mirror ? {
            ...aiPlanData.context_mirror,
            segment: aiPlanData.context_mirror.segment || segment,
            objective: aiPlanData.context_mirror.objective || objective,
            ...(websiteUrl && { website_url: websiteUrl }),
        } : {
            segment, objective,
            maturity: hasCRM ? `Intermediária/Avançada (CRM: ${crmName})` : 'Inicial (Sem CRM Central)',
            restrictions: restrictionsText,
            ...(websiteUrl && { website_url: websiteUrl }),
        };

        const signals: DiagnosticSignal[] = aiPlanData?.signals || [];
        if (!signals.length) {
            if (projectType === 'crm_ops') {
                const hasPipelines = Array.isArray(answers.revops_custom_pipelines) && answers.revops_custom_pipelines.length > 0;
                const pipelineCount = hasPipelines ? answers.revops_custom_pipelines.length : 0;
                if (hasCRM) signals.push({ id: 's1', type: 'positive', headline: 'Arquitetura Presente', text: `Arquitetura inicial presente no ${crmName}`, impact: 'Base tecnológica pré-existente diminui atrito de infraestrutura.' });
                else signals.push({ id: 's2', type: 'negative', headline: 'Vendas Desestruturada', text: 'Operação de Vendas Desestruturada', impact: 'Falta de Controle Central resulta em vazamentos no funil comercial.' });
                if (hasPipelines) signals.push({ id: 'spipe', type: 'neutral', headline: 'Múltiplos Funis', text: `${pipelineCount} Fun${pipelineCount > 1 ? 'is' : 'il'} de Negócios Mapeado${pipelineCount > 1 ? 's' : ''}`, impact: `Mapeamento As-Is indicou a existência de ${answers.revops_custom_pipelines.map((p: any) => p.name).join(', ')}.` });
                if (answers.revops_sla_marketing_vendas) signals.push({ id: 's3', type: 'neutral', headline: 'SLA Declarado', text: 'Critério de MQL/SQL Declarado', impact: 'Exige validação das réguas de hand-off para garantir alinhamento entre áreas.' });
                else if (isB2B) signals.push({ id: 's3', type: 'neutral', headline: 'Ciclo B2B Complexo', text: 'Ciclo B2B Complexo', impact: 'O ticket e o fechamento B2B exigem rastreabilidade avançada e automação de SLAs.' });
            } else {
                if (hasCRM) signals.push({ id: 's1', type: 'positive', headline: 'Infraestrutura Presente', text: 'Infraestrutura de Dados Presente', impact: 'Permite Escala e Otimização Rápida' });
                else signals.push({ id: 's2', type: 'negative', headline: 'Cegueira Operacional', text: 'Ausência de CRM', impact: 'Cegueira Operacional' });
                if (isB2B) signals.push({ id: 's3', type: 'neutral', headline: 'Jornada B2B', text: 'Jornada B2B', impact: 'Necessidade Múltipla de Nutrição' });
            }
        }

        const risks: DiagnosticRisk[] = aiPlanData?.risks || [];
        if (!risks.length) {
            if (projectType === 'crm_ops') {
                const hasLostReasons = Array.isArray(answers.revops_lost_reasons) && answers.revops_lost_reasons.length > 0;
                const lostCount = hasLostReasons ? answers.revops_lost_reasons.length : 0;
                if (!hasCRM) risks.push({ id: 'r1', severity: 'high', headline: 'Cegueira Analítica', text: 'Maturidade de Dados Crítica (Cegueira Analítica)', mitigation: 'Setup obrigatório da fundação do CRM na semana 1 como marco principal do projeto.' });
                if (answers.revops_pipeline_stagnation) risks.push({ id: 'r2', severity: 'medium', headline: 'Gargalos no Funil', text: 'Gargalo: Regras de Estagnação Ausentes ou Fracas', mitigation: `Desenhar alertas e automações no CRM para evitar o apodrecimento de deals baseado no cenário descrito: "${answers.revops_pipeline_stagnation.substring(0, 50)}..."` });
                else risks.push({ id: 'r2', severity: 'medium', headline: 'Sem Governança', text: 'Pipelines Visuais mas sem Governança', mitigation: 'Mapeamento As-Is dos estágios e imposição de propriedades obrigatórias por fase.' });
                if (hasLostReasons) risks.push({ id: 'rlost', severity: 'medium', headline: 'Perdas Estruturais', text: `${lostCount} Motivos de Perda Estruturais sem Matriz de Win/Loss`, mitigation: `Criar relatórios de conversão invertida agrupando as objeções (${answers.revops_lost_reasons.slice(0, 3).map((l: any) => l.reason).join(', ')}...) para loop de feedback com produto/marketing.` });
                else if (answers.revops_win_loss_analysis) risks.push({ id: 'rwinloss', severity: 'medium', headline: 'Sem Feedback de Perdas', text: 'Cultura de Win/Loss não está retroalimentando o Pipeline', mitigation: 'Institucionalizar o processo de Loss Reason auditável para entender onde o Lead escapa.' });
            } else {
                if (!hasCRM && objective === 'Escala Agressiva') risks.push({ id: 'r1', severity: 'high', headline: 'Escala sem rastro', text: 'Escala sem rastreabilidade', mitigation: 'Implantar CRM antes de aumentar o Spend em Ads' });
                if (budget === 'Baixo' && isB2B) risks.push({ id: 'r2', severity: 'medium', headline: 'Budget Insuficiente', text: 'Budget insuficiente para Paid Media', mitigation: 'Focar em Social Selling e Outbound' });
            }
        }

        const decisions: StrategicDecision[] = aiPlanData?.decisions || [];
        if (!decisions.length) {
            if (projectType === 'crm_ops') {
                decisions.push({ title: 'Design de Governança', recommendation: hasCRM ? `Otimização do ${crmName}` : 'Implementação de CRM', basedOn: ['Maturidade'], ruleApplied: 'Diretriz Arquitetura', implication: 'Período obrigatório de adequação' });
            } else {
                decisions.push({ title: 'Estratégia de Aquisição', recommendation: isB2B ? 'Foco em Prospecção' : 'Foco em Anúncios', basedOn: ['Modelo', 'Ticket'], ruleApplied: 'Abordagem Direta', implication: 'Requer estrutura' });
            }
        }

        const implementation_steps = generateImplementationSteps(hasCRM, isB2B, objective, projectType);

        return {
            summary: aiPlanData?.summary || `Diagnóstico realizado para estratégia ${projectType === 'crm_ops' ? 'CRM & RevOps' : isB2B ? 'B2B' : 'B2C'}. Foco em: ${objective}.`,
            context_mirror,
            signals,
            risks,
            opportunities: [],
            decisions,
            implementation_steps,
            plan_data,
        };
    }
}
