/**
 * Contexto de request (migração GCP — E4/Fase C).
 *
 * correlation/request id segue a requisição do frontend -> API -> jobs/terceiros.
 * Um valor recebido só é aceito se tiver formato seguro; senão a API gera um
 * novo UUID. O contexto é imutável e por request (nunca global/pool-shared).
 */

import { randomUUID } from 'node:crypto';
import type { Principal } from '../contracts/identity';
import type { TenantId } from '../contracts/tenant';

const SAFE_REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export interface RequestContext {
  readonly requestId: string;
  readonly startedAtMs: number;
  readonly environment: 'dev' | 'staging' | 'production';
  readonly service: string;
  readonly principal: Principal | null;
  /** Tenant resolvido pelo servidor; nunca copiado cegamente do cliente. */
  readonly tenantId: TenantId | null;
}

export function resolveRequestId(received?: string | null): string {
  return received && SAFE_REQUEST_ID.test(received) ? received : randomUUID();
}

export function createRequestContext(input: {
  receivedRequestId?: string | null;
  environment: RequestContext['environment'];
  service?: string;
  principal?: Principal | null;
  tenantId?: TenantId | null;
  nowMs?: number;
}): RequestContext {
  return Object.freeze({
    requestId: resolveRequestId(input.receivedRequestId),
    startedAtMs: input.nowMs ?? Date.now(),
    environment: input.environment,
    service: input.service ?? 'revhackers-api',
    principal: input.principal ?? null,
    tenantId: input.tenantId ?? null,
  });
}
