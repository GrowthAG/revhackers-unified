import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

export const crmOpsSections: REISection[] = [
    {
        id: 1,
        title: "Identificação",
        questions: [
            { id: "email", label: "E-mail", type: "input", validation: z.string().email(), placeholder: "seu@email.com" },
            { id: "website_url", label: "Site", type: "input", validation: z.string().optional() },
        ]
    },
    {
        id: 2,
        title: "Contexto B2B",
        questions: [
            { id: "revops_segmento", label: "Segmento", type: "input", validation: z.string().optional() },
            { id: "revops_empresa", label: "Empresa", type: "input", validation: z.string().optional() },
            { id: "revops_objetivo_principal", label: "Objetivo Principal", type: "input", validation: z.string().optional() },
            { id: "revops_ticket_medio", label: "Ticket Médio", type: "input", validation: z.string().optional() },
            { id: "revops_mrr_atual", label: "MRR Atual", type: "input", validation: z.string().optional() },
            { id: "revops_cac_atual", label: "CAC Atual", type: "input", validation: z.string().optional() },
            { id: "revops_sales_cycle_days", label: "Ciclo de Vendas", type: "input", validation: z.string().optional() },
            { id: "revops_win_rate", label: "Win Rate", type: "input", validation: z.string().optional() },
        ]
    },
    {
        id: 3,
        title: "Arquitetura e Stack",
        questions: [
            { id: "revops_hub_central", label: "Hub Central", type: "input", validation: z.string().optional() },
            { id: "revops_integracoes", label: "Integrações", type: "input", validation: z.string().optional() },
            { id: "revops_tech_debt_cost", label: "Custo Tech Debt", type: "input", validation: z.string().optional() },
            { id: "revops_data_hygiene_owner", label: "Responsável por Dados", type: "input", validation: z.string().optional() },
            { id: "revops_shadow_it_index", label: "Índice de Shadow IT", type: "input", validation: z.string().optional() },
        ]
    },
    {
        id: 4,
        title: "Aquisição",
        questions: [
            { id: "revops_icp_framework", label: "Framework de ICP", type: "input", validation: z.string().optional() },
            { id: "revops_lead_scoring", label: "Lead Scoring", type: "input", validation: z.string().optional() },
            { id: "revops_sla_marketing_vendas", label: "SLA Marketing/Vendas", type: "input", validation: z.string().optional() },
        ]
    },
    {
        id: 5,
        title: "Execução de Vendas",
        questions: [
            { id: "revops_flow_cadencia", label: "Cadência de Fluxo", type: "input", validation: z.string().optional() },
            { id: "revops_routing_vip", label: "Roteamento VIP", type: "input", validation: z.string().optional() },
            { id: "revops_speed_to_lead_sla", label: "SLA Speed to Lead", type: "input", validation: z.string().optional() },
            { id: "revops_economic_buyer_mapped", label: "Decisor Econômico", type: "input", validation: z.string().optional() },
            { id: "revops_cpq_friction", label: "Fricção na Proposta", type: "input", validation: z.string().optional() },
            { id: "revops_pipeline_stagnation", label: "Estagnação no Pipeline", type: "input", validation: z.string().optional() },
            { id: "revops_custom_pipelines", label: "Pipelines Personalizados", type: "input", validation: z.any().optional() },
            { id: "revops_custom_lost_reasons", label: "Motivos de Perda", type: "input", validation: z.any().optional() },
        ]
    },
    {
        id: 6,
        title: "Retenção e Gerência",
        questions: [
            { id: "revops_win_loss_analysis", label: "Análise Win/Loss", type: "input", validation: z.string().optional() },
            { id: "revops_forecasting_accuracy", label: "Precisão do Forecast", type: "input", validation: z.string().optional() },
            { id: "revops_onboarding_handoff", label: "Handoff para Onboarding", type: "input", validation: z.string().optional() },
            { id: "revops_health_score_tracking", label: "Health Score Tracking", type: "input", validation: z.string().optional() },
            { id: "revops_expansion_playbook", label: "Playbook de Expansão", type: "input", validation: z.string().optional() },
            { id: "revops_toxic_compensation", label: "Comissionamento Tóxico", type: "input", validation: z.string().optional() },
        ]
    }
];

export const crmOpsConfig: REIConfig = {
    type: 'crm_ops',
    title: 'REI – Revenue Excellence Initiative',
    subtitle: 'Protocolo de Arquitetura de CRM e RevOps',
    sections: crmOpsSections,
    totalQuestions: 28
};
