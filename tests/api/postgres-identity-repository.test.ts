import { describe, expect, test } from 'vitest';
import type { QueryResult, QueryResultRow } from 'pg';
import type { InternalUser } from '../../api/src/contracts/tenant';
import type { QueryableClient, QueryablePool } from '../../api/src/db/postgres';
import { PostgresIdentityRepository } from '../../api/src/identity/postgres-identity-repository';

function result<R extends QueryResultRow>(rows: R[]): QueryResult<R> {
  return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
}

class FakePool implements QueryablePool {
  readonly calls: Array<{ sql: string; values: readonly unknown[] }> = [];
  constructor(private readonly handler: (sql: string, values: readonly unknown[]) => QueryResult<any>) {}
  async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []): Promise<QueryResult<R>> {
    this.calls.push({ sql, values });
    return this.handler(sql, values) as QueryResult<R>;
  }
  async connect(): Promise<QueryableClient> {
    return { query: this.query.bind(this), release() {} };
  }
  async end(): Promise<void> {}
}

const user: InternalUser = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  globalRole: null,
  status: 'active',
  memberships: [
    { userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tenantId: '11111111-1111-4111-8111-111111111111', role: 'owner', status: 'active' },
    { userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tenantId: '33333333-3333-4333-8333-333333333333', role: 'operator', status: 'active' },
  ],
};

describe('PostgresIdentityRepository', () => {
  test('resolve issuer+subject e monta memberships da fonte interna', async () => {
    const pool = new FakePool((sql) => sql.includes('FROM app.user_identities') ? result([
      { id: user.id, global_role: null, status: 'active', tenant_id: user.memberships[0]!.tenantId, membership_role: 'owner', membership_status: 'active' },
      { id: user.id, global_role: null, status: 'active', tenant_id: user.memberships[1]!.tenantId, membership_role: 'operator', membership_status: 'active' },
    ]) : result([]));
    const found = await new PostgresIdentityRepository(pool).findUser({ issuer: 'https://securetoken.google.com/revhackers-staging', subject: 'google-sub' });
    expect(found).toEqual(user);
    expect(pool.calls[0]!.values).toEqual(['https://securetoken.google.com/revhackers-staging', 'google-sub']);
  });

  test('token válido sem identidade interna retorna null', async () => {
    const repository = new PostgresIdentityRepository(new FakePool(() => result([])));
    await expect(repository.findUser({ issuer: 'issuer', subject: 'unknown' })).resolves.toBeNull();
  });

  test('resolve projeto somente dentro de membership ativa e SET LOCAL por tenant', async () => {
    const project = '22222222-2222-4222-8222-222222222222';
    const pool = new FakePool((sql, values) => {
      if (sql.includes('FROM app.project_tenant_registry') && values[0] === user.memberships[0]!.tenantId) {
        return result([{ tenant_id: values[0] }]);
      }
      return result([]);
    });
    await expect(new PostgresIdentityRepository(pool).resolveProjectTenant(user, project)).resolves.toBe(user.memberships[0]!.tenantId);
    const contextCalls = pool.calls.filter((call) => call.sql.includes("set_config('app.tenant_id'"));
    expect(contextCalls.map((call) => call.values[0])).toEqual(user.memberships.map((membership) => membership.tenantId));
  });

  test('mesmo projectId em dois tenants é ambíguo e nunca escolhe implicitamente', async () => {
    const pool = new FakePool((sql, values) => sql.includes('FROM app.project_tenant_registry')
      ? result([{ tenant_id: values[0] }])
      : result([]));
    await expect(new PostgresIdentityRepository(pool).resolveProjectTenant(user, '22222222-2222-4222-8222-222222222222')).resolves.toBeNull();
  });

  test('membership suspensa não participa da resolução', async () => {
    const suspended: InternalUser = { ...user, memberships: [{ ...user.memberships[0]!, status: 'suspended' }] };
    const pool = new FakePool(() => result([]));
    await expect(new PostgresIdentityRepository(pool).resolveProjectTenant(suspended, '22222222-2222-4222-8222-222222222222')).resolves.toBeNull();
    expect(pool.calls).toHaveLength(0);
  });
});
