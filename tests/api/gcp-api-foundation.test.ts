import { describe, expect, test } from 'vitest';
import { authorize } from '../../api/src/authz/policy';
import { ApiError } from '../../api/src/contracts/errors';
import type { LinkCapability, Principal } from '../../api/src/contracts/identity';
import type { Resource } from '../../api/src/contracts/resource';
import type { InternalUser, Membership, TenantRole } from '../../api/src/contracts/tenant';
import {
  InMemoryIdempotencyStore,
  beginIdempotentOperation,
  makeScopedIdempotencyKey,
} from '../../api/src/context/idempotency';
import { createRequestContext, resolveRequestId } from '../../api/src/context/request-context';
import { redactForLog, tenantHash } from '../../api/src/context/redaction';
import { makeSyntheticToken, SyntheticTokenVerifier } from '../../api/src/identity/synthetic-verifier';

const NOW = 1_800_000_000;
const TENANT_A = 'client-a-synthetic';
const TENANT_B = 'client-b-synthetic';

const resourceA: Resource = { type: 'rei_project', id: 'project-a', tenantId: TENANT_A };
const resourceB: Resource = { type: 'rei_project', id: 'project-b', tenantId: TENANT_B };

function membership(tenantId: string, role: TenantRole, status: 'active' | 'suspended' = 'active'): Membership {
  return { userId: 'user-a', tenantId, role, status };
}

function user(memberships: Membership[], globalRole: InternalUser['globalRole'] = null): InternalUser {
  return { id: 'user-a', status: 'active', globalRole, memberships };
}

const principal: Principal = { kind: 'user', userId: 'user-a' };

function decide(input: Partial<Parameters<typeof authorize>[0]> = {}) {
  return authorize({
    principal,
    action: 'read',
    resource: resourceA,
    user: user([membership(TENANT_A, 'operator')]),
    requestId: 'req-synthetic-0001',
    nowSec: NOW,
    ...input,
  });
}

describe('E4 — matriz negativa cross-tenant', () => {
  test.each(['owner', 'admin', 'operator', 'client-link'] as TenantRole[])(
    '%s no tenant A não lê recurso do tenant B',
    (role) => {
      const result = decide({ resource: resourceB, user: user([membership(TENANT_A, role)]) });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('no_membership_in_tenant');
      expect(result.audit.outcome).toBe('denied');
      expect(result.audit.tenantHash).toBe(tenantHash(TENANT_B));
      expect(JSON.stringify(result.audit)).not.toContain(TENANT_B);
    },
  );

  test.each(['update', 'delete', 'approve', 'administer'] as const)(
    'operator do tenant A não executa %s em recurso do tenant B',
    (action) => {
      expect(decide({ action, resource: resourceB }).allowed).toBe(false);
    },
  );

  test('tenant_id forjado no payload não influencia a decisão: vale o tenant do recurso', () => {
    // Claims/body podem dizer tenant B; usuário interno só pertence a A.
    const result = decide({ resource: resourceB, user: user([membership(TENANT_A, 'owner')]) });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_membership_in_tenant');
  });

  test('membership suspensa bloqueia imediatamente mesmo com token válido', () => {
    const result = decide({ user: user([membership(TENANT_A, 'owner', 'suspended')]) });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('membership_suspended');
  });

  test('papel global user não concede acesso; membership ainda é obrigatória', () => {
    const result = decide({ resource: resourceB, user: user([], 'user') });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_membership_in_tenant');
  });

  test('admin global RevHackers opera cross-tenant (proposta documentada)', () => {
    const result = decide({ resource: resourceB, action: 'administer', user: user([], 'admin') });
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('global_admin');
  });

  test('usuário desabilitado é rejeitado antes da membership', () => {
    const disabled: InternalUser = { ...user([membership(TENANT_A, 'owner')]), status: 'disabled' };
    expect(decide({ user: disabled }).reason).toBe('user_disabled');
  });

  test('recurso null não revela existência e gera auditoria de negação', () => {
    const result = decide({ resource: null });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('resource_not_found');
    expect(result.audit.outcome).toBe('denied');
  });
});

describe('E4 — capacidades de link (cliente sem login)', () => {
  function capability(overrides: Partial<LinkCapability> = {}): LinkCapability {
    return {
      tenantId: TENANT_A,
      resource: { type: resourceA.type, id: resourceA.id },
      allowedActions: ['read', 'approve'],
      expiresAt: NOW + 3600,
      revoked: false,
      ...overrides,
    };
  }

  function linkDecision(cap: LinkCapability, action: 'read' | 'approve' | 'delete' = 'read', resource = resourceA) {
    return decide({ principal: { kind: 'link', capability: cap }, action, resource });
  }

  test('link válido acessa somente o recurso e ações do seu escopo', () => {
    expect(linkDecision(capability()).allowed).toBe(true);
    expect(linkDecision(capability(), 'approve').allowed).toBe(true);
    expect(linkDecision(capability(), 'delete').allowed).toBe(false);
  });

  test('link do tenant A nunca acessa recurso do tenant B', () => {
    expect(linkDecision(capability(), 'read', resourceB).allowed).toBe(false);
  });

  test('link expirado é rejeitado', () => {
    expect(linkDecision(capability({ expiresAt: NOW })).allowed).toBe(false);
  });

  test('link revogado é rejeitado', () => {
    expect(linkDecision(capability({ revoked: true })).allowed).toBe(false);
  });
});

describe('E4 — identidade agnóstica de provedor', () => {
  const verifier = new SyntheticTokenVerifier({
    expectedIssuer: 'https://issuer.staging.synthetic',
    expectedAudience: 'revhackers-staging',
    clockToleranceSec: 0,
  });

  test('token sintético válido é verificado', async () => {
    const token = makeSyntheticToken({
      issuer: 'https://issuer.staging.synthetic', subject: 'subject-a',
      audience: 'revhackers-staging', expiresAt: NOW + 3600,
      claims: { role: 'super_admin', tenant_id: TENANT_B }, // não é autoridade
    });
    const verified = await verifier.verify(token, NOW);
    expect(verified.subject).toBe('subject-a');
    // Claims chegam como dado auxiliar, mas authorize usa InternalUser da fonte interna.
    expect(verified.claims?.role).toBe('super_admin');
  });

  test('token de outro ambiente é rejeitado com 401', async () => {
    const token = makeSyntheticToken({
      issuer: 'https://issuer.production.synthetic', subject: 'subject-a',
      audience: 'revhackers-production', expiresAt: NOW + 3600,
    });
    await expect(verifier.verify(token, NOW)).rejects.toMatchObject({ code: 'unauthenticated', status: 401 });
  });

  test('token expirado é rejeitado com 401', async () => {
    const token = makeSyntheticToken({
      issuer: 'https://issuer.staging.synthetic', subject: 'subject-a',
      audience: 'revhackers-staging', expiresAt: NOW,
    });
    await expect(verifier.verify(token, NOW)).rejects.toBeInstanceOf(ApiError);
  });

  test('token malformado é rejeitado sem vazar conteúdo', async () => {
    await expect(verifier.verify('not-base64!', NOW)).rejects.toMatchObject({ code: 'unauthenticated' });
  });
});

describe('E4 — contexto, redação e idempotência', () => {
  test('correlation id seguro é preservado; valor malicioso é descartado', () => {
    expect(resolveRequestId('req-safe-12345678')).toBe('req-safe-12345678');
    const generated = resolveRequestId('bad\nINJECT=1');
    expect(generated).not.toContain('\n');
    expect(generated).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('request context é imutável e tenant vem do servidor', () => {
    const ctx = createRequestContext({ environment: 'staging', tenantId: TENANT_A, nowMs: 1 });
    expect(ctx.tenantId).toBe(TENANT_A);
    expect(Object.isFrozen(ctx)).toBe(true);
  });

  test('logs redigem segredo/PII recursivamente e preservam metadata segura', () => {
    const raw = {
      request_id: 'req-safe-12345678',
      authorization: 'Bearer secret-token',
      nested: { email: 'person@example.test', api_key: 'secret', operation: 'read' },
    };
    const redacted = redactForLog(raw) as Record<string, any>;
    expect(redacted.authorization).toBe('[REDACTED]');
    expect(redacted.nested.email).toBe('[REDACTED]');
    expect(redacted.nested.api_key).toBe('[REDACTED]');
    expect(redacted.nested.operation).toBe('read');
    expect(raw.authorization).toBe('Bearer secret-token'); // não muta input
  });

  test('mesma chave + mesmo payload faz replay; payload diferente gera 409', async () => {
    const store = new InMemoryIdempotencyStore();
    const input = { store, tenantId: TENANT_A, operation: 'create-project', key: 'idem-key-0001', payload: { name: 'A' }, nowMs: 1 };
    expect(await beginIdempotentOperation(input)).toEqual({ status: 'new' });
    const scopedKey = makeScopedIdempotencyKey(TENANT_A, input.operation, input.key);
    await store.complete(scopedKey, { id: 'new-id' });
    await expect(beginIdempotentOperation<{ id: string }>(input)).resolves.toEqual({ status: 'replay', response: { id: 'new-id' } });
    await expect(beginIdempotentOperation({ ...input, payload: { name: 'B' } })).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  test('idempotency key é escopada por tenant — A nunca replaya operação de B', async () => {
    const store = new InMemoryIdempotencyStore();
    const common = { store, operation: 'create-project', key: 'idem-key-0002', payload: { name: 'same' }, nowMs: 1 };
    expect(await beginIdempotentOperation({ ...common, tenantId: TENANT_A })).toEqual({ status: 'new' });
    expect(await beginIdempotentOperation({ ...common, tenantId: TENANT_B })).toEqual({ status: 'new' });
  });
});
