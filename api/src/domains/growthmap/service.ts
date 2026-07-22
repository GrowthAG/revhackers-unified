import { authorize } from '../../authz/policy';
import { ApiError } from '../../contracts/errors';
import type { Principal } from '../../contracts/identity';
import type { InternalUser, TenantId } from '../../contracts/tenant';
import type { GrowthMapView, SaveGrowthMapInput } from './contracts';
import { toGrowthMapView } from './contracts';
import type { GrowthMapRepository } from './repository';

export interface GrowthMapActorContext {
  requestId: string;
  principal: Principal;
  user?: InternalUser;
  /** Resolvido server-side a partir de membership/recurso; nunca body/query. */
  tenantId: TenantId;
}

function validateProjectId(projectId: string): void {
  if (!projectId || projectId.length > 128 || !/^[A-Za-z0-9_-]+$/.test(projectId)) {
    throw ApiError.validation('projectId inválido.');
  }
}

function validateScore(value: number | null | undefined, field: string): void {
  if (value === null || value === undefined) return;
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw ApiError.validation(`${field} deve estar entre 0 e 100.`);
  }
}

function validateSaveInput(input: SaveGrowthMapInput): void {
  if (!input.companyName?.trim() || input.companyName.length > 200) {
    throw ApiError.validation('companyName é obrigatório e deve ter até 200 caracteres.');
  }
  if ((input.companyDescription?.length ?? 0) > 5_000) {
    throw ApiError.validation('companyDescription deve ter até 5000 caracteres.');
  }
  validateScore(input.reiScore, 'reiScore');
  validateScore(input.growthmapScore, 'growthmapScore');
  if (input.reiConnectionsCount !== undefined && (!Number.isInteger(input.reiConnectionsCount) || input.reiConnectionsCount < 0)) {
    throw ApiError.validation('reiConnectionsCount deve ser inteiro não negativo.');
  }
  if (!input.frameworks || Array.isArray(input.frameworks) || typeof input.frameworks !== 'object') {
    throw ApiError.validation('frameworks deve ser um objeto JSON.');
  }
}

export class GrowthMapService {
  constructor(private readonly repository: GrowthMapRepository) {}

  async get(context: GrowthMapActorContext, projectId: string): Promise<GrowthMapView | null> {
    validateProjectId(projectId);
    const exists = await this.repository.projectExists(context.tenantId, projectId);
    const resource = exists
      ? { type: 'growthmap' as const, id: projectId, tenantId: context.tenantId }
      : null;
    const decision = authorize({
      principal: context.principal,
      action: 'read',
      resource,
      ...(context.user ? { user: context.user } : {}),
      requestId: context.requestId,
    });
    if (!decision.allowed) {
      // Não diferencia projeto inexistente de projeto em outro tenant (anti-IDOR).
      if (decision.reason === 'resource_not_found' || decision.reason === 'no_membership_in_tenant') {
        throw ApiError.notFound();
      }
      throw ApiError.forbidden();
    }

    const record = await this.repository.findByProject(context.tenantId, projectId);
    return record ? toGrowthMapView(record) : null;
  }

  async save(context: GrowthMapActorContext, projectId: string, input: SaveGrowthMapInput): Promise<GrowthMapView> {
    validateProjectId(projectId);
    validateSaveInput(input);
    const exists = await this.repository.projectExists(context.tenantId, projectId);
    const resource = exists
      ? { type: 'growthmap' as const, id: projectId, tenantId: context.tenantId }
      : null;
    const decision = authorize({
      principal: context.principal,
      action: 'update',
      resource,
      ...(context.user ? { user: context.user } : {}),
      requestId: context.requestId,
    });
    if (!decision.allowed) {
      if (decision.reason === 'resource_not_found' || decision.reason === 'no_membership_in_tenant') {
        throw ApiError.notFound();
      }
      throw ApiError.forbidden();
    }

    const record = await this.repository.upsert(context.tenantId, projectId, input);
    return toGrowthMapView(record);
  }
}
