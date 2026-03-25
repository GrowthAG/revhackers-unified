-- Create strategic_plans table
CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rei_project_id UUID REFERENCES rei_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Diagnóstico (do SiteScore)
  diagnostic_data JSONB DEFAULT '{}'::jsonb,
  
  -- Persona
  persona_data JSONB DEFAULT '{}'::jsonb,
  
  -- Premissas do Projeto
  premises_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metodologia
  methodology_data JSONB DEFAULT '{}'::jsonb,
  
  -- Roadmap 90 dias
  roadmap_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metas & KPIs
  goals_data JSONB DEFAULT '{}'::jsonb,
  
  -- Projeções Financeiras
  financial_projections JSONB DEFAULT '{}'::jsonb,
  
  -- Investimento
  budget_data JSONB DEFAULT '{}'::jsonb,
  
  -- Próximos Passos
  next_steps_data JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected')),
  
  -- Unique link for client access
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Timestamps
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_strategic_plans_rei_project ON strategic_plans(rei_project_id);
CREATE INDEX idx_strategic_plans_client ON strategic_plans(client_id);
CREATE INDEX idx_strategic_plans_access_token ON strategic_plans(access_token);
CREATE INDEX idx_strategic_plans_status ON strategic_plans(status);

-- Enable RLS
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can do everything
CREATE POLICY "Admins can manage all strategic plans"
  ON strategic_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Clients can view their own plans (via access_token)
CREATE POLICY "Clients can view their strategic plans via token"
  ON strategic_plans
  FOR SELECT
  TO anon, authenticated
  USING (true); -- We'll check access_token in the application layer

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strategic_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_strategic_plans_updated_at
  BEFORE UPDATE ON strategic_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_strategic_plans_updated_at();

-- Function to generate strategic plan from REI project
CREATE OR REPLACE FUNCTION generate_strategic_plan(p_rei_project_id UUID)
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
  
  -- Create strategic plan
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
    -- Default premises (can be customized later)
    jsonb_build_object(
      'pillars', jsonb_build_array(
        jsonb_build_object('name', 'Processos', 'icon', '🔄', 'items', jsonb_build_array('Disponibilidade de Recursos', 'Reuniões mensais', 'Disponibilidade de Recursos')),
        jsonb_build_object('name', 'Estratégia', 'icon', '🎯', 'items', jsonb_build_array('Tráfego Pago e Resultado', 'Aumento do LTV', 'Aumento de Ticket Médio')),
        jsonb_build_object('name', 'Metodologia', 'icon', '📋', 'items', jsonb_build_array('Estudo de concorrência', 'Estudo de mercado', 'Estudo de persona')),
        jsonb_build_object('name', 'Momento', 'icon', '⏰', 'items', jsonb_build_array('Onde mais podemos trabalhar', 'Novos projetos', 'Confiabilidade', 'Segurança'))
      )
    ),
    -- Default methodology
    jsonb_build_object(
      'steps', jsonb_build_array(
        jsonb_build_object('name', 'Canais certos', 'description', 'Foco em Meta Ads (Instagram/Facebook), combinando segmentação local e criativos adaptados à linguagem emocional da persona.'),
        jsonb_build_object('name', 'Comunicação realista', 'description', 'Narrativas simples e diretas, com foco em historias reais de superacao - sem promessas vagas e com clareza sobre o que e e o que nao e bolsa.'),
        jsonb_build_object('name', 'Acompanhamento ativo', 'description', 'Nutrição contínua via CRM e SDR, reforçando acolhimento, esclarecendo dúvidas e construindo confiança até a matrícula.')
      )
    ),
    -- Default roadmap (90 days)
    jsonb_build_object(
      'phases', jsonb_build_array(
        jsonb_build_object('name', 'Dia 1 a Dia 10', 'title', 'Kick Off | Onboarding', 'items', jsonb_build_array('Formulário REI', 'Reunião de Kick-Off', 'Entrega de Planejamento Estratégico', 'Reunião Planejamento Estratégico')),
        jsonb_build_object('name', 'Dia 1 a Dia 10', 'title', 'Coleta de Materiais Disponíveis', 'items', jsonb_build_array('Coleta e Desenvolvimento de Materiais', 'Linha Editorial')),
        jsonb_build_object('name', 'Dia 1 a Dia 15', 'title', 'Configuração e SetUp de CRM', 'items', jsonb_build_array('SetUp do CRM', 'Automações')),
        jsonb_build_object('name', 'Dia 1 a Dia 35', 'title', 'Go Live! Início das campanhas.', 'items', jsonb_build_array('Testes iniciais → Campanhas → Canais → Mensagem → Produto → Oferta')),
        jsonb_build_object('name', 'Dia 35 a Dia 40', 'title', 'Análise de métricas do funil 30 dias.', 'items', jsonb_build_array('R.A.P.T - Reunião de Apresentação de resultados 30 dias.')),
        jsonb_build_object('name', 'Dia 45 a Dia 75', 'title', 'Ongoing | Análise e otimização', 'items', jsonb_build_array('Início de novas estratégias baseado na análise das métricas, testes e resultados obtidos.')),
        jsonb_build_object('name', 'Dia 75 a Dia 90', 'title', 'Análise de métricas do funil 30 dias.', 'items', jsonb_build_array('R.A.P.2 - Reunião de Apresentação de resultados Quarter.'))
      )
    ),
    -- Default goals
    jsonb_build_object(
      'okrs', jsonb_build_array(
        jsonb_build_object('kr', 'KR 1', 'description', 'Estrutura completa implantada e operando (Meta, Google, CRM, SDRs)'),
        jsonb_build_object('kr', 'KR 2', 'description', 'Geração de leads validada com rastreabilidade'),
        jsonb_build_object('kr', 'KR 3', 'description', 'Jornada do lead testada ponta a ponta'),
        jsonb_build_object('kr', 'KR 4', 'description', 'Primeira rodada de otimização aplicada')
      ),
      'month1_targets', jsonb_build_array(
        jsonb_build_object('name', '5 clientes pagos', 'status', 'pending'),
        jsonb_build_object('name', 'R$15-30K MRR', 'status', 'pending'),
        jsonb_build_object('name', 'Playbook documentado', 'status', 'pending'),
        jsonb_build_object('name', '2-3 case studies BR', 'status', 'pending'),
        jsonb_build_object('name', '50+ leads no pipeline', 'status', 'pending')
      )
    ),
    -- Default financial projections
    jsonb_build_object(
      'meta_month_12', jsonb_build_object(
        'nmrr_total', 'R$100K',
        'nmrr_brazil', 'R$80-100K',
        'nmrr_latam', 'R$15-20K',
        'clients_total', '300-350',
        'clients_brazil', '300-350',
        'clients_latam', '30-40'
      ),
      'monthly_projections', jsonb_build_array(
        jsonb_build_object('period', 'Mês 1-2', 'nmrr_brazil', 'R$10-15K', 'nmrr_latam', '-', 'nmrr_total', 'R$10-15K', 'clients_brazil', '10-15', 'clients_latam', '-', 'total_clients', '10-15'),
        jsonb_build_object('period', 'Mês 3-4', 'nmrr_brazil', 'R$25-40K', 'nmrr_latam', '-', 'nmrr_total', 'R$25-40K', 'clients_brazil', '50-80', 'clients_latam', '-', 'total_clients', '50-80'),
        jsonb_build_object('period', 'Mês 5-6', 'nmrr_brazil', 'R$40-50K', 'nmrr_latam', '-', 'nmrr_total', 'R$40-50K', 'clients_brazil', '100-120', 'clients_latam', '-', 'total_clients', '100-120'),
        jsonb_build_object('period', 'Mês 7-8', 'nmrr_brazil', 'R$50-60K', 'nmrr_latam', 'R$3-5K', 'nmrr_total', 'R$55-65K', 'clients_brazil', '130-150', 'clients_latam', '10-15', 'total_clients', '140-165'),
        jsonb_build_object('period', 'Mês 9-10', 'nmrr_brazil', 'R$65-80K', 'nmrr_latam', 'R$10-15K', 'nmrr_total', 'R$75-95K', 'clients_brazil', '250-300', 'clients_latam', '20-30', 'total_clients', '270-330'),
        jsonb_build_object('period', 'Mês 11-12', 'nmrr_brazil', 'R$80-100K', 'nmrr_latam', 'R$15-20K', 'nmrr_total', 'R$95-120K', 'clients_brazil', '300-350', 'clients_latam', '30-40', 'total_clients', '330-390')
      )
    ),
    -- Default budget
    jsonb_build_object(
      'annual_budget', 'R$ 9.000,00',
      'channels', jsonb_build_array(
        jsonb_build_object('name', 'LinkedIn Outreach', 'percentage', '40%'),
        jsonb_build_object('name', 'Content Brasil', 'percentage', '25%'),
        jsonb_build_object('name', 'Email Outreach', 'percentage', '15%'),
        jsonb_build_object('name', 'Paid Ads', 'percentage', '15%'),
        jsonb_build_object('name', 'Parcerias', 'percentage', '5%')
      )
    ),
    -- Default next steps
    jsonb_build_object(
      'week1_actions', jsonb_build_array(
        jsonb_build_object('day', 'Dia 1', 'action', 'Otimizar perfil LinkedIn (headline, banner, sobre) - foco Brasil', 'done', false),
        jsonb_build_object('day', 'Dia 1-2', 'action', 'Criar lista de 200+ empresas target (SP, RJ, BH tech)', 'done', false),
        jsonb_build_object('day', 'Dia 2-3', 'action', 'Escrever 5 templates de outreach em português brasileiro', 'done', false),
        jsonb_build_object('day', 'Dia 3', 'action', 'Criar demo workspace do Funnels com dados brasileiros', 'done', false),
        jsonb_build_object('day', 'Dia 4-6', 'action', 'Publicar 4 posts no LinkedIn sobre dores brasileiras (WhatsApp, consolidação)', 'done', false),
        jsonb_build_object('day', 'Dia 5-6', 'action', 'Criar lead magnet: "Checklist: Migrar de RD+Pipedrive para Funnels em 48h"', 'done', false),
        jsonb_build_object('day', 'Dia 6-7', 'action', 'Configurar Calendly + email sequences (5 sequências)', 'done', false),
        jsonb_build_object('day', 'Dia 7', 'action', 'Iniciar outreach manual (10-15 conexões/dia no LinkedIn)', 'done', false),
        jsonb_build_object('day', 'Semana 1', 'action', 'Agendar 3-5 discovery calls (meta mínima)', 'done', false),
        jsonb_build_object('day', 'Semana 1', 'action', 'Documentar objeções comuns e respostas (playbook)', 'done', false)
      )
    ),
    auth.uid()
  ) RETURNING id INTO v_plan_id;
  
  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_strategic_plan(UUID) TO authenticated;
