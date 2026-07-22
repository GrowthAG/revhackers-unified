-- Identidade e autorização persistentes para Google Identity Platform.
-- Não aplicar no Supabase. Nenhum papel ou tenant vem de claims do navegador.

BEGIN;

CREATE TABLE IF NOT EXISTS app.internal_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_role TEXT CHECK (global_role IS NULL OR global_role IN ('super_admin', 'admin', 'user')),
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.user_identities (
    issuer      TEXT NOT NULL,
    subject     TEXT NOT NULL,
    user_id     UUID NOT NULL REFERENCES app.internal_users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (issuer, subject),
    UNIQUE (user_id, issuer)
);

CREATE TABLE IF NOT EXISTS app.tenant_memberships (
    user_id     UUID NOT NULL REFERENCES app.internal_users(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'operator', 'client-link')),
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_tenant_user
    ON app.tenant_memberships (tenant_id, user_id);

DROP TRIGGER IF EXISTS trg_internal_users_updated_at ON app.internal_users;
CREATE TRIGGER trg_internal_users_updated_at
BEFORE UPDATE ON app.internal_users
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_memberships_updated_at ON app.tenant_memberships;
CREATE TRIGGER trg_memberships_updated_at
BEFORE UPDATE ON app.tenant_memberships
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Estas tabelas não têm acesso de browser e não usam tenant informado pelo caller.
-- A service account recebe somente SELECT; provisioning/migração pertence ao migrator.
REVOKE ALL ON app.internal_users, app.user_identities, app.tenant_memberships FROM PUBLIC;

COMMENT ON TABLE app.user_identities IS
'Maps verified Google issuer+subject to an internal user. Email is not authority.';
COMMENT ON TABLE app.tenant_memberships IS
'Server-side source of truth for tenant roles and membership status.';

COMMIT;
