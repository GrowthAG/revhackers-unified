-- Migration: 0005_core_product
-- Core Product Tables for GCP Staging (clients, rei_projects, rei_materials, strategic_plans)
--
-- This migration MUST NOT be applied to Supabase. It is targeted at Cloud SQL.
-- Row Level Security (RLS) is strictly enabled on all tables, isolating by tenant_id.

BEGIN;

-- 1. CLIENTS (Tenant Registry)
CREATE TABLE IF NOT EXISTS app.clients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    company       TEXT,
    phone         TEXT,
    logo_url      TEXT,
    website       TEXT,
    linkedin_url  TEXT,
    city          TEXT,
    state         TEXT,
    country       TEXT DEFAULT 'Brasil',
    segment       TEXT,
    company_size  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. REI PROJECTS
CREATE TABLE IF NOT EXISTS app.rei_projects (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    client_id               UUID REFERENCES app.clients(id) ON DELETE SET NULL, -- Backward compatibility alias
    client_name             TEXT NOT NULL,
    client_email            TEXT NOT NULL,
    client_company          TEXT,
    analyst_email           TEXT NOT NULL,
    last_rei_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_rei_date           TIMESTAMPTZ NOT NULL,
    quarter                 TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    year                    INTEGER NOT NULL,
    status                  TEXT NOT NULL CHECK (status IN ('active', 'pending', 'overdue')) DEFAULT 'active',
    type                    TEXT NOT NULL CHECK (type IN ('consulting', 'crm_ops', 'site', 'linkedin', 'founder')) DEFAULT 'consulting',
    tier                    TEXT NOT NULL CHECK (tier IN ('free', 'paid')) DEFAULT 'paid',
    duration_days           INTEGER NOT NULL DEFAULT 90,
    scheduling_completed    BOOLEAN DEFAULT false,
    technical_evidences     JSONB DEFAULT '[]'::jsonb,
    clickup_space_id        TEXT,
    clickup_folder_id       TEXT,
    clickup_doc_id          TEXT,
    clickup_sprint_folder_id TEXT,
    clickup_provisioned_at  TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. REI MATERIALS
CREATE TABLE IF NOT EXISTS app.rei_materials (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    project_id    UUID NOT NULL REFERENCES app.rei_projects(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL DEFAULT 'outro',
    source_type   TEXT NOT NULL DEFAULT 'upload',
    file_url      TEXT,
    original_name TEXT,
    description   TEXT,
    extracted_text TEXT,
    status        TEXT DEFAULT 'ready',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. STRATEGIC PLANS
CREATE TABLE IF NOT EXISTS app.strategic_plans (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    rei_project_id        UUID REFERENCES app.rei_projects(id) ON DELETE CASCADE,
    client_id             UUID REFERENCES app.clients(id) ON DELETE CASCADE, -- Backward compatibility alias
    diagnostic_data       JSONB DEFAULT '{}'::jsonb,
    persona_data          JSONB DEFAULT '{}'::jsonb,
    premises_data         JSONB DEFAULT '{}'::jsonb,
    methodology_data      JSONB DEFAULT '{}'::jsonb,
    roadmap_data          JSONB DEFAULT '{}'::jsonb,
    goals_data            JSONB DEFAULT '{}'::jsonb,
    financial_projections JSONB DEFAULT '{}'::jsonb,
    budget_data           JSONB DEFAULT '{}'::jsonb,
    next_steps_data       JSONB DEFAULT '{}'::jsonb,
    status                TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected')),
    access_token          TEXT UNIQUE,
    sent_at               TIMESTAMPTZ,
    viewed_at             TIMESTAMPTZ,
    approved_at           TIMESTAMPTZ,
    rejected_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by            UUID -- Points to app.internal_users(id) or FirebaseAuth UI
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clients_email ON app.clients(email);
CREATE INDEX IF NOT EXISTS idx_rei_projects_tenant ON app.rei_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rei_projects_status ON app.rei_projects(status);
CREATE INDEX IF NOT EXISTS idx_rei_materials_project ON app.rei_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_project ON app.strategic_plans(rei_project_id);

-- TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS trg_clients_updated_at ON app.clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON app.clients
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_rei_projects_updated_at ON app.rei_projects;
CREATE TRIGGER trg_rei_projects_updated_at
BEFORE UPDATE ON app.rei_projects
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_strategic_plans_updated_at ON app.strategic_plans;
CREATE TRIGGER trg_strategic_plans_updated_at
BEFORE UPDATE ON app.strategic_plans
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE app.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.clients FORCE ROW LEVEL SECURITY;

ALTER TABLE app.rei_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_projects FORCE ROW LEVEL SECURITY;

ALTER TABLE app.rei_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_materials FORCE ROW LEVEL SECURITY;

ALTER TABLE app.strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.strategic_plans FORCE ROW LEVEL SECURITY;

-- POLICIES (TENANT ISOLATION)
-- RLS filters queries strictly by current_setting('app.tenant_id')

DROP POLICY IF EXISTS clients_tenant_isolation ON app.clients;
CREATE POLICY clients_tenant_isolation ON app.clients
FOR ALL USING (
    id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
) WITH CHECK (
    id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

DROP POLICY IF EXISTS rei_projects_tenant_isolation ON app.rei_projects;
CREATE POLICY rei_projects_tenant_isolation ON app.rei_projects
FOR ALL USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
) WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

DROP POLICY IF EXISTS rei_materials_tenant_isolation ON app.rei_materials;
CREATE POLICY rei_materials_tenant_isolation ON app.rei_materials
FOR ALL USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
) WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

DROP POLICY IF EXISTS strategic_plans_tenant_isolation ON app.strategic_plans;
CREATE POLICY strategic_plans_tenant_isolation ON app.strategic_plans
FOR ALL USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
) WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

-- REVOKE PUBLIC ACCESS (No direct browser connections)
REVOKE ALL ON app.clients, app.rei_projects, app.rei_materials, app.strategic_plans FROM PUBLIC;

COMMIT;
