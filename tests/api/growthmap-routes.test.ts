import { describe, expect, test } from 'vitest';
import { InMemoryIdempotencyStore } from '../../api/src/context/idempotency';
import type { InternalUser } from '../../api/src/contracts/tenant';
import { FakeGrowthMapRepository } from '../../api/src/domains/growthmap/fake-repository';
import { GrowthMapService } from '../../api/src/domains/growthmap/service';
import { createGrowthMapRoutes } from '../../api/src/http/growthmap-routes';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { TokenVerifier } from '../../api/src/identity/verifier';

const tenant = '11111111-1111-4111-8111-111111111111';
const project = '22222222-2222-4222-8222-222222222222';
const user: InternalUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', globalRole: null, status: 'active', memberships: [{ userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tenantId: tenant, role: 'owner', status: 'active' }] };

function setup(resolveTenant: string | null = tenant) {
  const repository = new FakeGrowthMapRepository(); repository.addProject(tenant, project);
  const verifier: TokenVerifier = { verify: async () => ({ issuer: 'issuer', subject: 'subject', expiresAt: 2_000_000_000 }) };
  const identities: IdentityRepository = {
    findUser: async () => user,
    resolveProjectTenant: async () => resolveTenant,
  };
  return createGrowthMapRoutes({ verifier, identities, service: new GrowthMapService(repository), idempotency: new InMemoryIdempotencyStore() });
}

describe('GrowthMap HTTP routes', () => {
  test('exige bearer token', async () => {
    await expect(setup()(new Request(`https://api.test/v1/growthmaps/${project}`), 'req-1')).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  test('projeto fora das memberships retorna not found anti-IDOR', async () => {
    const request = new Request(`https://api.test/v1/growthmaps/${project}`, { headers: { authorization: 'Bearer token' } });
    await expect(setup(null)(request, 'req-2')).rejects.toMatchObject({ code: 'not_found' });
  });

  test('PUT persiste e repetição da mesma chave devolve replay', async () => {
    const route = setup();
    const payload = { companyName: 'Synthetic', frameworks: {} };
    const makeRequest = () => new Request(`https://api.test/v1/growthmaps/${project}`, {
      method: 'PUT', headers: { authorization: 'Bearer token', 'content-type': 'application/json', 'idempotency-key': 'same-key-123' }, body: JSON.stringify(payload),
    });
    const first = await route(makeRequest(), 'req-3');
    const replay = await route(makeRequest(), 'req-4');
    expect(first?.status).toBe(200);
    expect(await replay?.json()).toMatchObject({ projectId: project, companyName: 'Synthetic' });
  });

  test('mesma chave com payload diferente retorna conflict', async () => {
    const route = setup();
    const request = (name: string) => new Request(`https://api.test/v1/growthmaps/${project}`, {
      method: 'PUT', headers: { authorization: 'Bearer token', 'content-type': 'application/json', 'idempotency-key': 'same-key-456' }, body: JSON.stringify({ companyName: name, frameworks: {} }),
    });
    await route(request('A'), 'req-5');
    await expect(route(request('B'), 'req-6')).rejects.toMatchObject({ code: 'conflict' });
  });
});
