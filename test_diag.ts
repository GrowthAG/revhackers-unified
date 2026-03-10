import { DiagnosticService } from './src/services/DiagnosticService';

async function run() {
    const mockCrmOpsResponse = {
        responses: {
            form_data: {
                // Etapa 1 Contexto B2B
                revops_segmento: "B2B SaaS (Enterprise & SMB)",
                revops_tamanho_time: "Team estruturado de Vendas e CS (10+)",
                revops_ticket_medio: "R$ 4.500",
                revops_mrr_atual: "R$ 200k - R$ 500k/mês",
                revops_cac_atual: "R$ 2.000 - R$ 5.000",
                revops_sales_cycle_days: "60-90 dias",
                revops_win_rate: "15% - 25% (Oportunidades em Clientes)",

                // Etapa 2 Tech Stack
                revops_hub_central: "HubSpot",
                revops_integracoes: "Sim, integramos ERP, Faturamento e Marketing",
                revops_tech_debt_cost: "Muito alto. Dados duplicados e processos quebrados",
                revops_data_hygiene_owner: "Ninguém. Cada um cuida do seu lado.",
                revops_shadow_it_index: "Muitas planilhas no Excel e Notion por fora do CRM",
                revops_automacoes_core: "Automação de Lead Routing e Alertas de SLA no Slack",

                // Etapa 3 Aquisição SLA
                revops_icp_framework: "Documentado vagamente, mas vendas discorda do marketing",
                revops_lead_scoring: "Baseado em intuição e fit demográfico",
                revops_sla_marketing_vendas: "Não temos uma regra de passagem clara",
                revops_routing_vip: "Distribuição manual pelo gestor",
                revops_speed_to_lead_sla: "Menos de 24 horas",

                // Etapa 4 Execução Vendas
                revops_flow_cadencia: "Tentamos, mas é manual e inconstante",
                revops_pipeline_stagnation: "Na negociação de propostas (CPQ)",
                revops_economic_buyer_mapped: "Os SDRs não mapeiam, os Closes sofrem no fim",
                revops_cpq_friction: "Geração de contrato manual",
                revops_win_loss_analysis: "Apenas Lost Reason Genéricas (Não teve interesse, Preço)",
                revops_forecasting_accuracy: "Baixa, sempre há sustos no fim do trimestre",

                // Etapa 5 Retenção
                revops_onboarding_handoff: "Vendedor preenche uma planilha para o CS",
                revops_health_score_tracking: "Feito manualmente em reuniões de comitê",
                revops_nrr_percentage: "Aproximadamente 95% (temos churn alto compensando o upsell)",
                revops_expansion_playbook: "Upsell totalmente reativo",
                revops_toxic_compensation: "Vendedores ganham comissão na assinatura, não seguram churn"
            }
        }
    };

    try {
        console.log("Gerando Diagnostico CRM Ops Mock...");
        const fullDiagnostic = DiagnosticService.generateDiagnosis(mockCrmOpsResponse as any, {}, 'crm_ops');

        console.log("SUCESSO! Saida do plano:");
        console.log(JSON.stringify(fullDiagnostic.plan_data, null, 2));

    } catch (e) {
        console.error("FATAL ERROR IN generateDiagnosis:", e);
    }
}
run();
