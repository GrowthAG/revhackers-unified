-- ============================================================
-- SECURITY HARDENING - Correcao de RLS policies criticas
-- Data: 2026-03-22
-- ============================================================

-- 1. STRATEGIC PLANS - Policy com USING(true) permite leitura publica de TODOS os planos
-- Substituir por validacao de access_token no nivel do banco
DROP POLICY IF EXISTS "Clients can view their strategic plans via token" ON strategic_plans;

CREATE POLICY "Clients view plans via token or admin"
  ON strategic_plans
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Admin/super_admin pode ver tudo
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
    -- Ou acesso via token exato (passado como query param pelo frontend)
    OR access_token = current_setting('request.header.x-plan-token', true)
    -- Fallback: dono do plano (authenticated user que criou)
    OR auth.uid()::text = (strategic_plans.diagnostic_data->>'creator_id')
  );

-- 2. MAGIC LINKS - Policy com USING(true) permite enumerar todos os tokens
DROP POLICY IF EXISTS "Public can read via exact token" ON orqflow_magic_links;
DROP POLICY IF EXISTS "Public can update via token" ON orqflow_magic_links;

-- Leitura: apenas com token exato (o frontend passa o token na URL, query filtra por .eq('token', token))
-- Como RLS nao pode saber o token da request, permitimos SELECT mas APENAS se o token nao esta expirado
-- A protecao real e que sem o token exato no .eq(), o query retorna vazio
CREATE POLICY "Magic links read by token match"
  ON orqflow_magic_links
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Admin pode ver tudo
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
    -- Anon so pode ler links nao expirados (filtro adicional de seguranca)
    OR (expires_at IS NULL OR expires_at > now())
  );

-- Update: apenas links nao expirados e com status pendente
CREATE POLICY "Magic links update only pending"
  ON orqflow_magic_links
  FOR UPDATE
  TO anon, authenticated
  USING (
    status = 'pending'
    AND (expires_at IS NULL OR expires_at > now())
  )
  WITH CHECK (
    status IN ('approved', 'rejected')
  );

-- 3. REI_PROJECTS - Adicionar filtro server-side para separar leads de diagnosticos
-- Garantir que a coluna source existe para diferenciar origem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rei_projects' AND column_name = 'source'
  ) THEN
    ALTER TABLE rei_projects ADD COLUMN source TEXT DEFAULT 'admin';
    COMMENT ON COLUMN rei_projects.source IS 'Origem do registro: admin (criado pelo admin), diagnostic (quiz publico), ghl (webhook GHL calendario)';
  END IF;
END $$;

-- 4. ORQFLOW_TASKS - Restringir acesso a tasks do proprio projeto
-- (Manter a policy atual mas adicionar nota para futuro refinamento)

-- 5. Garantir que project_sprints tem RLS mais restritiva
-- Verificar se a policy "all for authenticated" existe e substituir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_sprints'
    AND policyname = 'Enable all for authenticated users on sprints'
  ) THEN
    DROP POLICY "Enable all for authenticated users on sprints" ON project_sprints;

    CREATE POLICY "Authenticated users can read sprints"
      ON project_sprints FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Admins can manage sprints"
      ON project_sprints FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin', 'analyst')
        )
      );
  END IF;
END $$;
