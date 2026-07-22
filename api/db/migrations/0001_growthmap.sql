-- RevHackers Cloud SQL staging — primeiro domínio piloto
-- E4/E5: GrowthMap diretamente no PostgreSQL Google Cloud.
--
-- Esta migration NÃO deve ser aplicada no Supabase. Ela é o schema alvo do
-- Cloud SQL. `tenant_id` é obrigatório e todas as queries da aplicação devem
-- usar (tenant_id, project_id). A proposta atual mapeia tenant_id = clients.id.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app;

-- Registry mínimo do piloto. É alimentado pela carga/reconciliação de projetos
-- antes do GrowthMap. Quando o domínio rei_projects for migrado, esta relação
-- passa a referenciar a tabela canônica sem alterar o contrato da API.
CREATE TABLE IF NOT EXISTS app.project_tenant_registry (
    tenant_id  UUID NOT NULL,
    project_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, project_id)
);

CREATE TABLE IF NOT EXISTS app.growthmap_results (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL,
    project_id            UUID NOT NULL,
    company_name          TEXT NOT NULL DEFAULT '',
    company_description   TEXT NOT NULL DEFAULT '',
    rei_score             NUMERIC,
    growthmap_score       NUMERIC,
    rei_connections_count INTEGER NOT NULL DEFAULT 0,
    frameworks            JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at          TIMESTAMPTZ,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT growthmap_tenant_project_unique UNIQUE (tenant_id, project_id),
    CONSTRAINT growthmap_project_registry_fk FOREIGN KEY (tenant_id, project_id)
        REFERENCES app.project_tenant_registry (tenant_id, project_id),
    CONSTRAINT growthmap_rei_score_range CHECK (rei_score IS NULL OR rei_score BETWEEN 0 AND 100),
    CONSTRAINT growthmap_score_range CHECK (growthmap_score IS NULL OR growthmap_score BETWEEN 0 AND 100),
    CONSTRAINT growthmap_connections_nonnegative CHECK (rei_connections_count >= 0)
);

-- O UNIQUE acima cobre lookup por (tenant_id, project_id). Índice separado por
-- project_id isolado é deliberadamente evitado para desincentivar query sem tenant.
CREATE INDEX IF NOT EXISTS idx_growthmap_tenant_updated
    ON app.growthmap_results (tenant_id, updated_at DESC);

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growthmap_updated_at ON app.growthmap_results;
CREATE TRIGGER trg_growthmap_updated_at
BEFORE UPDATE ON app.growthmap_results
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Defesa em profundidade. A API deve executar SET LOCAL app.tenant_id dentro de
-- cada transação, usando valor resolvido server-side. Contexto ausente => policy
-- false (zero linha). O papel de aplicação não pode ter BYPASSRLS/owner/superuser.
ALTER TABLE app.project_tenant_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.project_tenant_registry FORCE ROW LEVEL SECURITY;
ALTER TABLE app.growthmap_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.growthmap_results FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_registry_tenant_isolation ON app.project_tenant_registry;
CREATE POLICY project_registry_tenant_isolation
ON app.project_tenant_registry
FOR ALL
USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
)
WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

DROP POLICY IF EXISTS growthmap_tenant_isolation ON app.growthmap_results;
CREATE POLICY growthmap_tenant_isolation
ON app.growthmap_results
FOR ALL
USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
)
WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
);

COMMENT ON TABLE app.growthmap_results IS
'Cloud SQL target for GrowthMap. Tenant-scoped; no direct browser access.';
COMMENT ON COLUMN app.growthmap_results.tenant_id IS
'Canonical tenant (working decision: clients.id), resolved server-side.';

COMMIT;
