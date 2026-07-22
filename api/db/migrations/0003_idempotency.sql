-- Idempotência persistente das mutações HTTP.
BEGIN;

CREATE TABLE IF NOT EXISTS app.idempotency_records (
    tenant_id     UUID NOT NULL,
    scoped_key    TEXT NOT NULL,
    operation     TEXT NOT NULL,
    request_key   TEXT NOT NULL,
    request_hash  TEXT NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
    status        TEXT NOT NULL CHECK (status IN ('processing', 'completed')),
    response      JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at  TIMESTAMPTZ,
    PRIMARY KEY (tenant_id, scoped_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created
    ON app.idempotency_records (tenant_id, created_at DESC);

ALTER TABLE app.idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.idempotency_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS idempotency_tenant_isolation ON app.idempotency_records;
CREATE POLICY idempotency_tenant_isolation ON app.idempotency_records
FOR ALL
USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

REVOKE ALL ON app.idempotency_records FROM PUBLIC;
COMMENT ON TABLE app.idempotency_records IS
'Persistent tenant-scoped HTTP mutation idempotency; no browser access.';

COMMIT;
