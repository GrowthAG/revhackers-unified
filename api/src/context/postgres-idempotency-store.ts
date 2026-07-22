import type { QueryResultRow } from 'pg';
import type { IdempotencyRecord, IdempotencyStore } from './idempotency';
import { withTenantTransaction, type QueryablePool } from '../db/postgres';

interface RecordRow extends QueryResultRow {
  tenant_id: string;
  operation: string;
  request_key: string;
  request_hash: string;
  status: 'processing' | 'completed';
  response: unknown;
  created_at: Date;
}

function tenantFromScopedKey(scopedKey: string): string {
  const tenantId = scopedKey.slice(0, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId) || scopedKey[36] !== ':') {
    throw new Error('Invalid scoped idempotency key.');
  }
  return tenantId;
}

export class PostgresIdempotencyStore implements IdempotencyStore {
  constructor(private readonly pool: QueryablePool) {}

  async get<T>(scopedKey: string): Promise<IdempotencyRecord<T> | null> {
    const tenantId = tenantFromScopedKey(scopedKey);
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<RecordRow>(`
        SELECT tenant_id::text, operation, request_key, request_hash, status,
               response, created_at
        FROM app.idempotency_records
        WHERE tenant_id = $1::uuid AND scoped_key = $2
      `, [tenantId, scopedKey]);
      const row = result.rows[0];
      return row ? {
        tenantId: row.tenant_id,
        operation: row.operation,
        key: row.request_key,
        requestHash: row.request_hash,
        status: row.status,
        ...(row.response !== null ? { response: row.response as T } : {}),
        createdAtMs: row.created_at.getTime(),
      } : null;
    });
  }

  async putIfAbsent<T>(scopedKey: string, record: IdempotencyRecord<T>): Promise<boolean> {
    const tenantId = tenantFromScopedKey(scopedKey);
    if (tenantId !== record.tenantId) throw new Error('Idempotency tenant mismatch.');
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(`
        INSERT INTO app.idempotency_records
          (tenant_id, scoped_key, operation, request_key, request_hash, status, created_at)
        VALUES ($1::uuid, $2, $3, $4, $5, 'processing', to_timestamp($6 / 1000.0))
        ON CONFLICT (tenant_id, scoped_key) DO NOTHING
      `, [tenantId, scopedKey, record.operation, record.key, record.requestHash, record.createdAtMs]);
      return result.rowCount === 1;
    });
  }

  async complete<T>(scopedKey: string, response: T): Promise<void> {
    const tenantId = tenantFromScopedKey(scopedKey);
    await withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(`
        UPDATE app.idempotency_records
        SET status = 'completed', response = $3::jsonb, completed_at = now()
        WHERE tenant_id = $1::uuid AND scoped_key = $2 AND status = 'processing'
      `, [tenantId, scopedKey, JSON.stringify(response)]);
      if (result.rowCount !== 1) throw new Error('Idempotency record not found or already completed.');
    });
  }
}
