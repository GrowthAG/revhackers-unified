import { describe, expect, test } from 'vitest';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { TokenVerifier } from '../../api/src/identity/verifier';
import { createIdentityRoutes } from '../../api/src/http/identity-routes';

const verifier: TokenVerifier = { verify: async () => ({ issuer: 'issuer', subject: 'subject', expiresAt: 2_000_000_000 }) };

function identities(found = true): IdentityRepository {
  return {
    findUser: async () => found ? ({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', globalRole: 'admin', status: 'active',
      memberships: [{ userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tenantId: '11111111-1111-4111-8111-111111111111', role: 'owner', status: 'active' }],
    }) : null,
    resolveProjectTenant: async () => null,
  };
}

describe('/v1/me', () => {
  test('retorna somente identidade e autorização internas', async () => {
    const response = await createIdentityRoutes({ verifier, identities: identities() })(new Request('https://api.test/v1/me', { headers: { authorization: 'Bearer token' } }));
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', globalRole: 'admin', status: 'active',
      memberships: [{ tenantId: '11111111-1111-4111-8111-111111111111', role: 'owner', status: 'active' }],
    });
  });

  test('token sem usuário provisionado recebe forbidden', async () => {
    const route = createIdentityRoutes({ verifier, identities: identities(false) });
    await expect(route(new Request('https://api.test/v1/me', { headers: { authorization: 'Bearer token' } }))).rejects.toMatchObject({ code: 'forbidden' });
  });

  test('não aceita método de mutação', async () => {
    const response = await createIdentityRoutes({ verifier, identities: identities() })(new Request('https://api.test/v1/me', { method: 'POST' }));
    expect(response?.status).toBe(405);
  });
});
