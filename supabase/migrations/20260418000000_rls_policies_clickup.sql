-- =============================================================================
-- RLS POLICIES - Tabelas novas da integracao ClickUp + client_accounts
-- Rodar no SQL Editor: https://supabase.com/dashboard/project/eqspbruarsdybpfeijnf/sql/new
-- =============================================================================

-- ── 1. client_accounts ────────────────────────────────────────────────────────
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

-- Apenas usuarios autenticados (admin) podem ver
CREATE POLICY "client_accounts_select_authenticated"
  ON public.client_accounts FOR SELECT
  TO authenticated
  USING (true);

-- Apenas usuarios autenticados podem inserir/atualizar
CREATE POLICY "client_accounts_insert_authenticated"
  ON public.client_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "client_accounts_update_authenticated"
  ON public.client_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role bypass automatico (sem policy necessaria)

-- ── 2. clickup_sprints ────────────────────────────────────────────────────────
ALTER TABLE public.clickup_sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clickup_sprints_select_authenticated"
  ON public.clickup_sprints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clickup_sprints_all_service_role"
  ON public.clickup_sprints FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 3. clickup_provisioning_log ───────────────────────────────────────────────
ALTER TABLE public.clickup_provisioning_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clickup_prov_log_select_authenticated"
  ON public.clickup_provisioning_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clickup_prov_log_all_service_role"
  ON public.clickup_provisioning_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 4. clickup_template_map ───────────────────────────────────────────────────
ALTER TABLE public.clickup_template_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clickup_template_map_select_authenticated"
  ON public.clickup_template_map FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clickup_template_map_all_service_role"
  ON public.clickup_template_map FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 5. clickup_config ─────────────────────────────────────────────────────────
ALTER TABLE public.clickup_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clickup_config_select_authenticated"
  ON public.clickup_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clickup_config_all_service_role"
  ON public.clickup_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Verificação final
-- =============================================================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'client_accounts', 'clickup_sprints',
    'clickup_provisioning_log', 'clickup_template_map', 'clickup_config'
  )
ORDER BY tablename;
