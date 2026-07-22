import type { TenantId } from '../../contracts/tenant';
import type { GrowthMapRecord, SaveGrowthMapInput } from './contracts';

/**
 * Porta de persistência do domínio GrowthMap.
 *
 * Toda operação recebe tenantId server-side e projectId. Implementações devem
 * consultar pelo par (tenant_id, project_id), nunca por project_id isolado.
 * O adapter Cloud SQL satisfará esta interface; fake é usado nos testes.
 */
export interface GrowthMapRepository {
  projectExists(tenantId: TenantId, projectId: string): Promise<boolean>;
  findByProject(tenantId: TenantId, projectId: string): Promise<GrowthMapRecord | null>;
  upsert(tenantId: TenantId, projectId: string, input: SaveGrowthMapInput): Promise<GrowthMapRecord>;
}
