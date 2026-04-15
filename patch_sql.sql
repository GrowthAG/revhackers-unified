-- We'll replace the existing function to use a CASE statement based on the project type.
CREATE OR REPLACE FUNCTION generate_strategic_plan(p_rei_project_id UUID)
RETURNS UUID AS $$
DECLARE
  v_plan_id UUID;
  v_client_id UUID;
  v_project_type TEXT;
  v_roadmap_data JSONB;
BEGIN
  -- Get client_id and type from REI project
  SELECT client_id, type INTO v_client_id, v_project_type
  FROM rei_projects
  WHERE id = p_rei_project_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'REI project not found';
  END IF;

  -- Default Roadmap based on type
  IF v_project_type = 'consulting' THEN
     v_roadmap_data := '{
       "phases": [
         {"name": "Sprint 1: Descoberta e Diagnóstico Profundo", "items": ["Realizar entrevista com os Founders", "Mapeamento da operação de vendas atual", "Análise de concorrentes e benchmarks"]},
         {"name": "Sprint 2: Desenho da Nova Operação (SwaS)", "items": ["Documentar novo processo de vendas (Playbook)", "Definição do modelo de precificação e MRR", "Aprovação do Roadmap executivo c/ Fundadores"]},
         {"name": "Sprint 3: Implementação Tecnológica", "items": ["Setup do CRM (Funnels) com campos customizados", "Criação dos Dashboards de TCV e Net MRR", "Testar automações E2E de Onboarding"]}
       ]
     }'::jsonb;
  ELSIF v_project_type = 'dev' THEN
     v_roadmap_data := '{
       "phases": [
         {"name": "Sprint 1: UI/UX & Wireframing", "items": ["Aprovação da Copy e Estrutura", "Desenho das telas principais no Figma", "Reunião de aprovação de Layout"]},
         {"name": "Sprint 2: Front-End & Integrações", "items": ["Desenvolvimento do Código no Framer/React", "Integração do formulário de diagnóstico ao CRM Funnels", "Instalação do Pixel e Google Tag Manager"]},
         {"name": "Sprint 3: QA e Go-Live", "items": ["Auditoria de velocidade e testes Mobile", "Publicação no domínio oficial do cliente", "Hand-off técnico para a equipe do cliente"]}
       ]
     }'::jsonb;
  ELSIF v_project_type = 'crm_ops' THEN
     v_roadmap_data := '{
       "phases": [
         {"name": "Sprint 1: Setup do Hub de Operações", "items": ["Criação da Arquitetura do CRM (Pipelines)", "Conexão dos Webhooks e Integrações de Marketing", "Treinamento da equipe de SDRs"]},
         {"name": "Sprint 2: Automações e Nutrição", "items": ["Configurar fluxos automáticos de No-Show", "Criar sequências de email e WhatsApp", "Validar roteamento de leads para os Closers"]},
         {"name": "Sprint 3: Dashboards & Métricas", "items": ["Criação do Painel C-Level de Receita", "Implementar tracking de LTV e CAC", "Relato Mensal de Otimização (RAPT)"]}
       ]
     }'::jsonb;
  ELSE
     -- Growth/Default
     v_roadmap_data := '{
       "phases": [
         {"name": "Sprint 1: Setup da Operação e Diagnóstico Base", "items": ["Implementar Tracking Principal (GTM, Meta Pixel)", "Configuração Inicial do CRM (Funnels)", "Reunião de Kick-Off Executivo"]},
         {"name": "Sprint 2: Campanhas Go-Live", "items": ["Lançamento das campanhas no Meta Ads", "Desenvolvimento de Linha Editorial e Criativos", "Acompanhamento diário das métricas (CAC, CPL)"]},
         {"name": "Sprint 3: Otimização Financeira", "items": ["Dashboards Executivos de Performance", "Otimização focada em LTV e expansão de MRR", "R.A.P.T Mensal de acompanhamento de resultados"]}
       ]
     }'::jsonb;
  END IF;

  -- Create strategic plan
  INSERT INTO strategic_plans (
    rei_project_id,
    client_id,
    roadmap_data,
    status,
    created_by
  ) VALUES (
    p_rei_project_id,
    v_client_id,
    v_roadmap_data,
    'draft',
    auth.uid()
  ) RETURNING id INTO v_plan_id;
  
  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
