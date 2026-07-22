import { describe, expect, test } from 'vitest';
import type { QueryResult, QueryResultRow } from 'pg';
import { loadDatabaseConfig } from '../../api/src/db/config';
import {
  checkPostgresReady,
  withTenantTransaction,
  type QueryableClient,
  type QueryablePool,
} from '../../api/src/db/postgres';
import { PostgresGrowthMapRepository } from '../../api/src/domains/growthmap/postgres-repository';

interface Call { text: string; values?: readonly unknown[] }

function result<R extends QueryResultRow>(rows: R[]): QueryResult<R> {
  return { command: 'SELECT', rowCount: rows.length, oid: 0, fields: [], rows };
}

class ScriptedClient implements QueryableClient {
  readonly calls: Call[] = [];
  released = false;
  constructor(private readonly responses: QueryResult[] = []) {}

  async query<R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<R>> {
    this.calls.push({ text, ...(values ? { values } : {}) });
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(text) || text.startsWith('SELECT set_config')) {
      return result([]) as QueryResult<R>;
    }
    const next = this.responses.shift();
    if (!next) throw new Error(`No scripted response for query: ${text}`);
    return next as QueryResult<R>;
  }

  release(): void { this.released = true; }
}

class FakePool implements QueryablePool {
  constructor(readonly client: ScriptedClient, private readonly directRows: QueryResult[] = []) {}
  async connect(): Promise<QueryableClient> { return this.client; }
  async query<R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<R>> {
    this.client.calls.push({ text, ...(values ? { values } : {}) });
    const next = this.directRows.shift();
    if (!next) throw new Error('No direct response');
    return next as QueryResult<R>;
  }
  async end(): Promise<void> {}
}

const TENANT = '11111111-1111-4111-8111-111111111111';
const PROJECT = '22222222-2222-4222-8222-222222222222';

const dbRow = {
  tenant_id: TENANT,
  project_id: PROJECT,
  company_name: 'Empresa Cloud',
  company_description: 'Descrição',
  rei_score: '70.5',
  growthmap_score: 80,
  rei_connections_count: 4,
  frameworks: { swot: { status: 'done' } },
  generated_at: null,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: '2026-01-02T00:00:00.000Z',
};

describe('Cloud SQL config — IAM obrigatório fora de dev', () => {
  test('carrega Cloud SQL IAM sem senha e com pool limitado', () => {
    const config = loadDatabaseConfig({
      APP_ENV: 'staging',
      CLOUD_SQL_INSTANCE: 'project:region:instance',
      CLOUD_SQL_DATABASE: 'revhackers',
      CLOUD_SQL_IAM_USER: 'service-account@project.iam',
      CLOUD_SQL_IP_TYPE: 'PRIVATE',
      DB_POOL_MAX: '7',
    });
    expect(config).toEqual(expect.objectContaining({
      kind: 'cloud-sql-iam',
      instanceConnectionName: 'project:region:instance',
      database: 'revhackers',
      ipType: 'PRIVATE',
      maxConnections: 7,
    }));
    expect(config).not.toHaveProperty('password');
  });

  test('DATABASE_URL direta é aceita em test e proibida em staging/production', () => {
    expect(loadDatabaseConfig({ APP_ENV: 'test', DATABASE_URL: 'postgres://localhost/test' }).kind).toBe('direct-dev');
    expect(() => loadDatabaseConfig({ APP_ENV: 'staging', DATABASE_URL: 'postgres://example/staging' })).toThrow(/proibida/);
    expect(() => loadDatabaseConfig({ APP_ENV: 'production' })).toThrow(/CLOUD_SQL_INSTANCE/);
  });
});

describe('Cloud SQL transaction — contexto tenant não vaza no pool', () => {
  test('BEGIN -> set_config parametrizado -> operação -> COMMIT -> release', async () => {
    const client = new ScriptedClient([result([{ value: 42 }])]);
    const pool = new FakePool(client);
    const output = await withTenantTransaction(pool, TENANT, async (tx) => {
      const query = await tx.query<{ value: number }>('SELECT 42 AS value');
      return query.rows[0]?.value;
    });

    expect(output).toBe(42);
    expect(client.calls.map((call) => call.text)).toEqual([
      'BEGIN',
      "SELECT set_config('app.tenant_id', $1, true)",
      'SELECT 42 AS value',
      'COMMIT',
    ]);
    expect(client.calls[1]?.values).toEqual([TENANT]);
    expect(client.calls[1]?.text).not.toContain(TENANT);
    expect(client.released).toBe(true);
  });

  test('erro executa ROLLBACK e sempre libera conexão', async () => {
    const client = new ScriptedClient();
    const pool = new FakePool(client);
    await expect(withTenantTransaction(pool, TENANT, async () => {
      throw new Error('synthetic failure');
    })).rejects.toThrow('synthetic failure');
    expect(client.calls.map((call) => call.text)).toContain('ROLLBACK');
    expect(client.calls.map((call) => call.text)).not.toContain('COMMIT');
    expect(client.released).toBe(true);
  });

  test('readiness usa SELECT 1 sem dado de domínio', async () => {
    const client = new ScriptedClient();
    const pool = new FakePool(client, [result([{ ok: 1 }])]);
    await expect(checkPostgresReady(pool)).resolves.toBe(true);
    expect(client.calls[0]?.text).toBe('SELECT 1 AS ok');
  });
});

describe('GrowthMap PostgreSQL repository — queries tenant-scoped', () => {
  test('projectExists consulta registry pelo par tenant/project', async () => {
    const client = new ScriptedClient([result([{ exists: true }])]);
    const repository = new PostgresGrowthMapRepository(new FakePool(client));
    await expect(repository.projectExists(TENANT, PROJECT)).resolves.toBe(true);
    const domainQuery = client.calls[2];
    expect(domainQuery?.text).toContain('tenant_id = $1::uuid AND project_id = $2::uuid');
    expect(domainQuery?.values).toEqual([TENANT, PROJECT]);
  });

  test('find mapeia numeric/timestamps sem expor detalhe SQL', async () => {
    const client = new ScriptedClient([result([dbRow])]);
    const repository = new PostgresGrowthMapRepository(new FakePool(client));
    const found = await repository.findByProject(TENANT, PROJECT);
    expect(found).toMatchObject({
      tenantId: TENANT,
      projectId: PROJECT,
      companyName: 'Empresa Cloud',
      reiScore: 70.5,
      growthmapScore: 80,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('upsert é parametrizado, escopado e serializa JSONB', async () => {
    const client = new ScriptedClient([result([dbRow])]);
    const repository = new PostgresGrowthMapRepository(new FakePool(client));
    await repository.upsert(TENANT, PROJECT, {
      companyName: 'Empresa Cloud',
      frameworks: { swot: { status: 'done' } },
      reiScore: 70.5,
    });
    const domainQuery = client.calls[2];
    expect(domainQuery?.text).toContain('ON CONFLICT (tenant_id, project_id)');
    expect(domainQuery?.values?.[0]).toBe(TENANT);
    expect(domainQuery?.values?.[1]).toBe(PROJECT);
    expect(domainQuery?.values?.[7]).toBe(JSON.stringify({ swot: { status: 'done' } }));
    expect(domainQuery?.text).not.toContain('Empresa Cloud');
  });
});
