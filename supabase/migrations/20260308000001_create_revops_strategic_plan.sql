-- Migration: function generate_revops_strategic_plan
-- Retorna o Plano Estratégico (JSON) customizado "Anti-Frankenstein" para diagnósticos 'crm_ops'

CREATE OR REPLACE FUNCTION generate_revops_strategic_plan(p_rei_project_id UUID)
RETURNS UUID AS $$
DECLARE
  v_plan_id UUID;
  v_client_id UUID;
  v_rei_data JSONB;
BEGIN
  -- Get client_id from REI project
  SELECT client_id, data INTO v_client_id, v_rei_data
  FROM rei_projects
  WHERE id = p_rei_project_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'REI project not found';
  END IF;
  
  -- Create strategic plan with Masterclass B2B Hardcoded Boilerplate
  INSERT INTO strategic_plans (
    rei_project_id,
    client_id,
    premises_data,
    methodology_data,
    roadmap_data,
    goals_data,
    financial_projections,
    budget_data,
    next_steps_data,
    created_by
  ) VALUES (
    p_rei_project_id,
    v_client_id,
    
    -- PREMISES (Pillars B2B RevOps)
    jsonb_build_object(
      'pillars', jsonb_build_array(
        jsonb_build_object('name', 'Auditoria Tech', 'icon', '🔍', 'items', jsonb_build_array('Desintegração de Ferramentas Avulsas', 'Migração de Dados (Hygiene)', 'Redução de Custos de TCO')),
        jsonb_build_object('name', 'Aquisição Limpa', 'icon', '⚡', 'items', jsonb_build_array('Speed-to-lead < 5 minutos', 'Roteamento Round-Robin', 'Lead Scoring (BANT/MEDDIC)')),
        jsonb_build_object('name', 'Execução de Vendas', 'icon', '⚔️', 'items', jsonb_build_array('Playbooks Nativos de Follow-up', 'Poder Forense de Win/Loss', 'Dashboard de Pipeline Visibility')),
        jsonb_build_object('name', 'Fosso de Retenção', 'icon', '🛡️', 'items', jsonb_build_array('Handoff Automatizado', 'Playbook de Expansão (NRR)', 'Alertas de Engajamento e Churn'))
      )
    ),
    
    -- METHODOLOGY B2B
    jsonb_build_object(
      'steps', jsonb_build_array(
        jsonb_build_object('name', 'Mortalidade do Frankenstein.', 'description', 'Mapearemos cada vazamento de dados causado pelas suas integrações atuais de RD, Pipedrive e Zapier, faturando o custo real da sua dívida técnica.'),
        jsonb_build_object('name', 'Instalação do Motor Funnels.', 'description', 'Vamos erguer um ecossistema Whitelabel blindado: Seu CRM, sua automação de e-mail e seu discador estarão na mesma tela. Isso destrói o tempo de onboarding do seu SDR e unifica sua fonte de verdade.'),
        jsonb_build_object('name', 'Cultura de Expansão (NRR).', 'description', 'Implementaremos regras estritas de pós-venda. O vendedor atual não será perdoado se vender mal. A máquina garantirá LTV e Up-Sells ativos sem depender da memória humana.')
      )
    ),
    
    -- ROADMAP B2B (Morte ao Frankenstein)
    jsonb_build_object(
      'phases', jsonb_build_array(
        jsonb_build_object('name', 'Etapa 1: Hub Central (Semana 1-2)', 'title', 'Destruição do Antigo e Configuração Estrutural', 'items', jsonb_build_array('Migração Raw de Dados', 'Design da Taxonomia de Etapas e Lost Reasons', 'Fechamento de furos técnicos de DNS e Domínio')),
        jsonb_build_object('name', 'Etapa 2: Aquisição (Semana 3-4)', 'title', 'Roteamento e Lead Scoring', 'items', jsonb_build_array('Regras de Speed-to-lead (< 5min)', 'Integração Inbound Completa (Webhooks e Meta)', 'Ativação do SLA Marketing/Vendas')),
        jsonb_build_object('name', 'Etapa 3: Execução (Semana 5-6)', 'title', 'Armamento Tático da Equipe', 'items', jsonb_build_array('Set-up de CPQ (Orçamentos B2B)', 'Playbooks engatilhados por inatividade (Pipeline Stagnation)', 'Mapeamento do Deal (MEDDPICC Tracker)')),
        jsonb_build_object('name', 'Etapa 4: Retenção (Semana 7-8)', 'title', 'Fosso de LTV', 'items', jsonb_build_array('Automação do Onboarding Handoff', 'Setup de Pesquisa NPS', 'Alertas Nativos de Risco de Churn (Health Score)')),
        jsonb_build_object('name', 'Etapa 5: Go-Live (Mês 3)', 'title', 'Operação Enterprise B2B em voo de cruzeiro', 'items', jsonb_build_array('Refinamento de Forecasting', 'Comitê Operacional de Win/Loss'))
      )
    ),
    
    -- GOALS B2B Enterprise
    jsonb_build_object(
      'okrs', jsonb_build_array(
        jsonb_build_object('kr', 'KR 1: Cost Reduction', 'description', 'Extinguir 100% dos custos ocultos de licenciamentos fúteis (Frankenstein Debt)'),
        jsonb_build_object('kr', 'KR 2: SLA Master', 'description', 'Alcançar e Manter tempo de primeiro contato (Speed-to-lead) sub-10 minutos'),
        jsonb_build_object('kr', 'KR 3: Visibilidade Total', 'description', 'Acuracidade de Forecast da diretoria acima de 85% neste trimestre'),
        jsonb_build_object('kr', 'KR 4: Motor de NRR', 'description', 'Redução do Churn bruto e orquestração ativa de tickets de Up-Sell via CS Hub')
      ),
      'month1_targets', jsonb_build_array(
        jsonb_build_object('name', 'Setup Hub Estrutural concluído', 'status', 'pending'),
        jsonb_build_object('name', 'Toda a base suja higienizada', 'status', 'pending'),
        jsonb_build_object('name', 'Roteamento ativo (Zero Lead Caído)', 'status', 'pending'),
        jsonb_build_object('name', 'SDR 100% treinado na UI Funnels', 'status', 'pending'),
        jsonb_build_object('name', 'Cancelamento do software legado', 'status', 'pending')
      )
    ),
    
    -- FINANCIAL (Projeções Masterclass B2B ROI)
    jsonb_build_object(
      'meta_month_12', jsonb_build_object(
        'nmrr_total', 'Multiplicador LTV Crítico',
        'nmrr_brazil', 'Aumentar Eficiência Operacional (+40% ROI)',
        'nmrr_latam', 'Reduzir CAC em 25%',
        'clients_total', 'Escala Limpa',
        'clients_brazil', 'Domínio B2B Local',
        'clients_latam', '-'
      ),
      'monthly_projections', jsonb_build_array(
        jsonb_build_object('period', 'Mês 1 (Detox)', 'nmrr_brazil', 'Corte de Custos Imediato (Licenças Legacy)', 'nmrr_latam', '-', 'nmrr_total', 'Fluxos sendo construídos', 'clients_brazil', 'Retenção Defensiva', 'clients_latam', '-', 'total_clients', '-'),
        jsonb_build_object('period', 'Mês 3 (Ramp-up)', 'nmrr_brazil', 'Maturidade de Conversão Inicial', 'nmrr_latam', '-', 'nmrr_total', '+15% Close Rate Estimado (SLA Ágil)', 'clients_brazil', 'Aquisição Mapeada', 'clients_latam', '-', 'total_clients', '-'),
        jsonb_build_object('period', 'Mês 6 a 12 (Scale)', 'nmrr_brazil', 'NRR Expansion', 'nmrr_latam', '-', 'nmrr_total', 'Crescimento Previsível via Cross-sell Automático', 'clients_brazil', 'Pós-Venda Fiel', 'clients_latam', '-', 'total_clients', '-')
      )
    ),
    
    -- BUDGET
    jsonb_build_object(
      'annual_budget', 'Consolidado RevOps',
      'channels', jsonb_build_array(
        jsonb_build_object('name', 'Funnels All-in-One Engine', 'percentage', '75%'),
        jsonb_build_object('name', 'Onboarding & Treinamento HR', 'percentage', '15%'),
        jsonb_build_object('name', 'Mídia Auxiliar B2B (Ads)', 'percentage', '10%')
      )
    ),
    
    -- NEXT STEPS (Fechamento do Contrato)
    jsonb_build_object(
      'week1_actions', jsonb_build_array(
        jsonb_build_object('day', 'Passo 1', 'action', 'Assinatura Eletrônica e Aprovação da Etapa de Handoff.', 'done', false),
        jsonb_build_object('day', 'Passo 2', 'action', 'Entrega de acessos do ambiente legado (RD, Pipe, etc) para a RevHackers.', 'done', false),
        jsonb_build_object('day', 'Passo 3', 'action', 'Pagamento da Parcela do Setup B2B.', 'done', false),
        jsonb_build_object('day', 'Passo 4', 'action', 'Reunião de Kick-Off Técnico com as lideranças operacionais do seu negócio.', 'done', false)
      )
    ),
    
    auth.uid()
  ) RETURNING id INTO v_plan_id;
  
  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_revops_strategic_plan(UUID) TO authenticated;
