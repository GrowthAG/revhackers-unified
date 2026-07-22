import type { TenantId } from '../../contracts/tenant';
import type { GrowthMapRecord, SaveGrowthMapInput } from './contracts';
import type { GrowthMapRepository } from './repository';

/** Apenas testes/dev. Não usar em Cloud Run real. */
export class FakeGrowthMapRepository implements GrowthMapRepository {
  private readonly projects = new Set<string>();
  private readonly records = new Map<string, GrowthMapRecord>();
  private clock = 0;

  addProject(tenantId: TenantId, projectId: string): void {
    this.projects.add(this.key(tenantId, projectId));
  }

  seed(record: GrowthMapRecord): void {
    this.addProject(record.tenantId, record.projectId);
    this.records.set(this.key(record.tenantId, record.projectId), structuredClone(record));
  }

  async projectExists(tenantId: TenantId, projectId: string): Promise<boolean> {
    return this.projects.has(this.key(tenantId, projectId));
  }

  async findByProject(tenantId: TenantId, projectId: string): Promise<GrowthMapRecord | null> {
    const record = this.records.get(this.key(tenantId, projectId));
    return record ? structuredClone(record) : null;
  }

  async upsert(tenantId: TenantId, projectId: string, input: SaveGrowthMapInput): Promise<GrowthMapRecord> {
    const key = this.key(tenantId, projectId);
    if (!this.projects.has(key)) throw new Error('Project does not belong to tenant.');
    const previous = this.records.get(key);
    const now = new Date(Date.UTC(2026, 0, 1, 0, 0, this.clock++)).toISOString();
    const record: GrowthMapRecord = {
      tenantId,
      projectId,
      companyName: input.companyName.trim(),
      companyDescription: input.companyDescription ?? '',
      reiScore: input.reiScore ?? null,
      growthmapScore: input.growthmapScore ?? null,
      reiConnectionsCount: input.reiConnectionsCount ?? 0,
      frameworks: structuredClone(input.frameworks),
      generatedAt: input.generatedAt ?? null,
      updatedAt: now,
      createdAt: previous?.createdAt ?? now,
    };
    this.records.set(key, record);
    return structuredClone(record);
  }

  private key(tenantId: TenantId, projectId: string): string {
    return `${tenantId}:${projectId}`;
  }
}
