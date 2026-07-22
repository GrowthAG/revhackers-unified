import { describe, expect, test } from 'vitest';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { TokenVerifier } from '../../api/src/identity/verifier';
import { createIdentityRoutes } from '../../api/src/http/identity-routes';

const verifier: TokenVerifier = { verify: async () => ({ issuer: 'issuer', subject: 'subject', expiresAt: 2_000_000_000 }) };

const MOCK_USER = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', globalRole: 'admin' as const, status: 'active' as const,
  memberships: [{ userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tenantId: '11111111-1111-4111-8111-111111111111', role: 'owner' as const, status: 'active' as const }],
};

const NEW_USER = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', globalRole: null, status: 'active' as const,
  memberships: [],
};

function identities(opts: { existing?: boolean; disabled?: boolean } = {}): IdentityRepository {
  const { existing = true, disabled = false } = opts;
  const user = disabled ? { ...MOCK_USER, status: 'disabled' as const } : MOCK_USER;
  return {
    findUser: async () => existing ? user : null,
    findOrCreateUser: async () => existing ? user : NEW_USER,
    resolveProjectTenant: async () => null,
  };
}

describe('/v1/me', () => {
  test('retorna somente identidade e autorizacao internas', async () => {
    const response = await createIdentityRoutes({ verifier, identities: identities() })(
      new Request('https://api.test/v1/me', { headers: { authorization: 'Bearer token' } })
    );
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', globalRole: 'admin', status: 'active',
      memberships: [{ tenantId: '11111111-1111-4111-8111-111111111111', role: 'owner', status: 'active' }],
    });
  });

  test('token valido sem usuario provisionado cria usuario automaticamente (auto-registro)', async () => {
    const route = createIdentityRoutes({ verifier, identities: identities({ existing: false }) });
    const response = await route(
      new Request('https://api.test/v1/me', { headers: { authorization: 'Bearer token' } })
    );
    expect(response?.status).toBe(200);
    const body = await response?.json() as { id: string; globalRole: null; status: string; memberships: unknown[] };
    expect(body.id).toBe('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    expect(body.globalRole).toBeNull();
    expect(body.memberships).toHaveLength(0);
  });

  test('usuario desabilitado recebe forbidden mesmo com token valido', async () => {
    const route = createIdentityRoutes({ verifier, identities: identities({ disabled: true }) });
    await expect(
      route(new Request('https://api.test/v1/me', { headers: { authorization: 'Bearer token' } }))
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  test('nao aceita metodo de mutacao', async () => {
    const response = await createIdentityRoutes({ verifier, identities: identities() })(
      new Request('https://api.test/v1/me', { method: 'POST' })
    );
    expect(response?.status).toBe(405);
  });
});
