/**
 * Recurso e referência de recurso (migração GCP — E4/Fase C).
 *
 * Regra central de anti-IDOR: o backend SEMPRE carrega o recurso pelo par
 * (tenantId, resourceId). O `tenantId` do recurso é a autoridade — nunca o
 * tenant declarado pelo cliente no body/query.
 */

import type { TenantId } from './tenant';

export type ResourceType =
  | 'rei_project'
  | 'strategic_plan'
  | 'proposal'
  | 'client_meeting'
  | 'growthmap'
  | 'material'
  | 'audit_log';

export interface ResourceRef {
  type: ResourceType;
  id: string;
}

export interface Resource extends ResourceRef {
  /** Tenant dono do recurso, resolvido no servidor a partir do banco. */
  tenantId: TenantId;
  /** Estado do recurso (ex.: 'draft' | 'pending' | 'signed'); domínio define. */
  state?: string;
}
