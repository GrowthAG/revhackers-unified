import { describe, expect, test } from 'vitest';
import { ApiError } from '../../api/src/contracts/errors';
import type { LinkCapability } from '../../api/src/contracts/identity';
import type { InternalUser, TenantRole } from '../../api/src/contracts/tenant';
import type { GrowthMapRecord, SaveGrowthMapInput } from '../../api/src/domains/growthmap/contracts';
import { FakeGrowthMapRepository } from '../../api/src/domains/growthmap/fake-repository';
import { GrowthMapService, type GrowthMapActorContext } from '../../api/src/domains/growthmap/service';

const TENANT_A = 'tenant-a-synthetic';
const TENANT_B = 'tenant-b-synthetic';
const PROJECT = 'shared-project-id';

function user(role: TenantRole = 'operator', tenantId = TENANT_A, status: 'active' | 'suspended' = 'active'): InternalUser {
  return {
    id: 'user-a',
    globalRole: null,
    status: 'active',
    memberships: [{ userId: 'user-a', tenantId, role, status }],
  };
}

function context(tenantId = TENANT_A, internalUser = user('operator', tenantId)): GrowthMapActorContext {
  return {
    requestId: 'req-growthmap-0001',
    tenantId,
    principal: { kind: 'user', userId: internalUser.id },
    user: internalUser,
  };
}

function record(tenantId: string, companyName: string): GrowthMapRecord {
  return {
    tenantId,
    projectId: PROJECT,
    companyName,
    companyDescription: '',
    reiScore: 50,
    growthmapScore: 60,
    reiConnectionsCount: 2,
    frameworks: { swot: { status: 'done' } },
    generatedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const saveInput: SaveGrowthMapInput = {
  companyName: 'Empresa A',
  frameworks: { swot: { status: 'done', data: { forcas: ['time'] } } },
  reiScore: 70,
  growthmapScore: 75,
  reiConnectionsCount: 3,
};

describe('GrowthMap pilot — Cloud SQL port contract', () => {
  test('mesmo projectId em dois tenants devolve somente o registro do tenant resolvido', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.seed(record(TENANT_A, 'Empresa A'));
    repository.seed(record(TENANT_B, 'Empresa B'));
    const service = new GrowthMapService(repository);

    const viewA = await service.get(context(TENANT_A), PROJECT);
    const viewB = await service.get(context(TENANT_B, user('operator', TENANT_B)), PROJECT);

    expect(viewA?.companyName).toBe('Empresa A');
    expect(viewB?.companyName).toBe('Empresa B');
    expect(viewA).not.toHaveProperty('tenantId');
    expect(viewB).not.toHaveProperty('tenantId');
  });

  test('usuário A não lê projeto que só existe no tenant B (anti-IDOR 404)', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.seed(record(TENANT_B, 'Empresa B'));
    const service = new GrowthMapService(repository);

    await expect(service.get(context(TENANT_A), PROJECT)).rejects.toMatchObject({
      code: 'not_found',
      status: 404,
    });
  });

  test('operator salva no próprio tenant; tenant/project vêm do contexto/path', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.addProject(TENANT_A, PROJECT);
    const service = new GrowthMapService(repository);

    const saved = await service.save(context(TENANT_A), PROJECT, saveInput);
    expect(saved.companyName).toBe('Empresa A');
    expect(saved.reiScore).toBe(70);
    expect(saved.projectId).toBe(PROJECT);
    expect(saved).not.toHaveProperty('tenantId');

    const persisted = await repository.findByProject(TENANT_A, PROJECT);
    expect(persisted?.tenantId).toBe(TENANT_A);
  });

  test('membership suspensa não lê nem salva mesmo com projeto no tenant', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.addProject(TENANT_A, PROJECT);
    const service = new GrowthMapService(repository);
    const suspended = context(TENANT_A, user('operator', TENANT_A, 'suspended'));

    await expect(service.get(suspended, PROJECT)).rejects.toMatchObject({ code: 'forbidden', status: 403 });
    await expect(service.save(suspended, PROJECT, saveInput)).rejects.toMatchObject({ code: 'forbidden', status: 403 });
  });

  test('link-capability read-only lê o recurso exato, mas nunca salva', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.seed(record(TENANT_A, 'Empresa A'));
    const service = new GrowthMapService(repository);
    const capability: LinkCapability = {
      tenantId: TENANT_A,
      resource: { type: 'growthmap', id: PROJECT },
      allowedActions: ['read'],
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      revoked: false,
    };
    const linkContext: GrowthMapActorContext = {
      requestId: 'req-growthmap-link-0001',
      tenantId: TENANT_A,
      principal: { kind: 'link', capability },
    };

    await expect(service.get(linkContext, PROJECT)).resolves.toMatchObject({ companyName: 'Empresa A' });
    await expect(service.save(linkContext, PROJECT, saveInput)).rejects.toMatchObject({ code: 'forbidden' });
  });

  test('validação rejeita score fora de faixa e projectId malformado antes do repository', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.addProject(TENANT_A, PROJECT);
    const service = new GrowthMapService(repository);

    await expect(service.save(context(), PROJECT, { ...saveInput, reiScore: 101 })).rejects.toBeInstanceOf(ApiError);
    await expect(service.get(context(), '../tenant-b/project')).rejects.toMatchObject({ code: 'validation' });
  });

  test('admin global opera tenant B somente com tenant resolvido server-side', async () => {
    const repository = new FakeGrowthMapRepository();
    repository.seed(record(TENANT_B, 'Empresa B'));
    const service = new GrowthMapService(repository);
    const admin: InternalUser = { id: 'admin-global', globalRole: 'admin', status: 'active', memberships: [] };
    const adminContext: GrowthMapActorContext = {
      requestId: 'req-admin-0001',
      tenantId: TENANT_B,
      principal: { kind: 'user', userId: admin.id },
      user: admin,
    };

    await expect(service.get(adminContext, PROJECT)).resolves.toMatchObject({ companyName: 'Empresa B' });
  });
});
