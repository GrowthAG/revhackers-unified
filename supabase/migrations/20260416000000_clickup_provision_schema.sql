-- ============================================================
-- Migration: clickup_provision_schema
-- Adiciona estrutura necessaria para o clickup-provision
-- state machine e logica de sprints por duracao e tipo de projeto
-- ============================================================

-- ─── 1. Colunas em rei_projects ──────────────────────────────────────────

ALTER TABLE rei_projects
  ADD COLUMN IF NOT EXISTS duration_days        int CHECK (duration_days IN (30, 60, 90, 180, 360)),
  ADD COLUMN IF NOT EXISTS tier                 text CHECK (tier IN ('free', 'paid')),
  ADD COLUMN IF NOT EXISTS clickup_space_id     text,
  ADD COLUMN IF NOT EXISTS clickup_folder_id    text,
  ADD COLUMN IF NOT EXISTS clickup_sprint_folder_id text,
  ADD COLUMN IF NOT EXISTS clickup_doc_id       text,
  ADD COLUMN IF NOT EXISTS provisioning_state   text NOT NULL DEFAULT 'idle'
    CHECK (provisioning_state IN (
      'idle', 'pending', 'folder_created', 'metadata_set',
      'sprint_folder_created', 'sprints_created', 'tasks_created',
      'doc_created', 'done', 'failed'
    )),
  ADD COLUMN IF NOT EXISTS clickup_provisioned_at timestamptz,
  ADD COLUMN IF NOT EXISTS provisioning_error   text;

-- Tier calculado automaticamente quando duration_days e type forem definidos
-- (o codigo faz isso ao criar o projeto, mas deixamos a constraint como documentacao)
COMMENT ON COLUMN rei_projects.tier IS
  'free = consulting 30/60d como add-on do plano anual. paid = todos os demais.';

COMMENT ON COLUMN rei_projects.provisioning_state IS
  'State machine do provisionamento no ClickUp. idle = nao iniciado.';

-- ─── 2. Tabela de sprints por projeto ────────────────────────────────────

CREATE TABLE IF NOT EXISTS clickup_sprints (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rei_project_id  uuid NOT NULL REFERENCES rei_projects(id) ON DELETE CASCADE,
  sprint_index    int  NOT NULL,
  sprint_name     text NOT NULL,
  sprint_theme    text,
  clickup_list_id text NOT NULL,
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  task_count      int  DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (rei_project_id, sprint_index)
);

CREATE INDEX IF NOT EXISTS idx_clickup_sprints_project
  ON clickup_sprints (rei_project_id);

-- ─── 3. Log da state machine (auditoria e debug) ─────────────────────────

CREATE TABLE IF NOT EXISTS clickup_provisioning_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rei_project_id  uuid REFERENCES rei_projects(id) ON DELETE CASCADE,
  from_state      text,
  to_state        text NOT NULL,
  payload         jsonb,
  error           text,
  duration_ms     int,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clickup_prov_log_project
  ON clickup_provisioning_log (rei_project_id, created_at DESC);

-- ─── 4. Mapeamento de template IDs por tipo de projeto ───────────────────

CREATE TABLE IF NOT EXISTS clickup_template_map (
  rei_type            text    PRIMARY KEY,
  space_id            text    NOT NULL,
  folder_template_id  text,
  sprint_template_id  text,
  folder_id_created   text,   -- preenchido apos criacao manual dos folders base
  notes               text,
  updated_at          timestamptz DEFAULT now()
);

-- Valores iniciais: Space IDs e folder IDs dos templates que criamos via script
-- folder_template_id e sprint_template_id serao preenchidos apos o usuario
-- salvar as pastas como template na UI do ClickUp
INSERT INTO clickup_template_map (rei_type, space_id, folder_id_created, notes)
VALUES
  ('consulting', '90175101115', '90178165445', 'Template: [TEMPLATE] Consulting - 360 Graus'),
  ('crm_ops',    '90175101115', '90178165450', 'Template: [TEMPLATE] RevOps e CRM'),
  ('dev',        '90175101115', '90178165455', 'Template: [TEMPLATE] Dev - Sites e Landing Pages'),
  ('founder',    '90175101115', '90178165468', 'Template: [TEMPLATE] Founder - LinkedIn e Personal Brand')
ON CONFLICT (rei_type) DO UPDATE SET
  space_id = EXCLUDED.space_id,
  folder_id_created = EXCLUDED.folder_id_created,
  notes = EXCLUDED.notes,
  updated_at = now();

-- ─── 5. Configuracoes globais do ClickUp ─────────────────────────────────

CREATE TABLE IF NOT EXISTS clickup_config (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO clickup_config (key, value) VALUES
  ('workspace_id',              ''),   -- preencher: Settings > My Workspace
  ('space_id_revhackers',       '90175101115'),
  ('space_id_funnels_cs',       ''),   -- preencher apos criar Space Funnels
  ('sprint_folder_template_id', ''),   -- preencher apos salvar Sprint Folder como template
  ('webhook_secret',            '')    -- preencher: mesmo valor do Supabase Secret
ON CONFLICT (key) DO NOTHING;

-- ─── 6. View util para monitoring ────────────────────────────────────────

CREATE OR REPLACE VIEW v_clickup_provisioning_status AS
SELECT
  rp.id                     AS project_id,
  rp.client_name,
  rp.client_company,
  rp.type                   AS rei_type,
  rp.duration_days,
  rp.tier,
  rp.provisioning_state,
  rp.clickup_folder_id,
  rp.clickup_provisioned_at,
  rp.provisioning_error,
  COUNT(cs.id)              AS sprints_created,
  sp.status                 AS plan_status,
  sp.approved_at            AS plan_approved_at
FROM rei_projects rp
LEFT JOIN clickup_sprints cs    ON cs.rei_project_id = rp.id
LEFT JOIN strategic_plans sp    ON sp.rei_project_id = rp.id
  AND sp.plan_type = 'strategic'
WHERE rp.provisioning_state != 'idle'
GROUP BY rp.id, sp.id;

COMMENT ON VIEW v_clickup_provisioning_status IS
  'Status em tempo real do provisionamento ClickUp por projeto.';
