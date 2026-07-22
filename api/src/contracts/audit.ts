/**
 * Evento de auditoria (migração GCP — E4/Fase C).
 *
 * Toda decisão de autorização sensível emite um evento auditável, separado do
 * log operacional, imutável no período aprovado. Nunca carrega token/PII bruta:
 * usa hash de tenant e ids correlacionáveis.
 */

import type { Action } from '../authz/actions';
import type { ResourceRef } from './resource';

export type AuditOutcome = 'allowed' | 'denied';

export interface AuditEvent {
  requestId: string;
  occurredAt: string; // ISO 8601
  action: Action;
  resource: ResourceRef;
  /** Hash do tenant (não o id em claro) para correlação sem vazar identidade. */
  tenantHash: string | null;
  principalKind: 'user' | 'link' | 'none';
  principalId: string | null;
  outcome: AuditOutcome;
  /** Motivo curto e seguro (sem detalhe interno). */
  reason: string;
}
