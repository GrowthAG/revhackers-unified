/**
 * Motor de autorização (migração GCP — E4/Fase C).
 *
 * Decisão server-side única para todo endpoint privado. Princípios (docs 02/03):
 *  - Autenticação identifica; autorização decide operação, tenant e recurso.
 *  - O backend nunca confia em tenant/papel/ownership vindos do cliente.
 *  - Carrega o recurso por (tenantId, resourceId); compara tenant resolvido.
 *  - Token válido sem membership ativa no tenant do recurso => forbidden.
 *  - Papel em claim adulterado é ignorado (autoridade é a fonte interna).
 *
 * Retorna sempre uma decisão + evento de auditoria (allowed/denied), nunca
 * lança — o caller traduz `denied` para ApiError e registra o evento.
 */

import type { AuditEvent } from '../contracts/audit';
import type { LinkCapability, Principal } from '../contracts/identity';
import type { Resource } from '../contracts/resource';
import type { GlobalRole, InternalUser, TenantRole } from '../contracts/tenant';
import { tenantHash } from '../context/redaction';
import type { Action } from './actions';

export interface AuthorizeInput {
  principal: Principal;
  action: Action;
  /** Recurso já carregado do banco por (tenantId, id). `null` => não encontrado. */
  resource: Resource | null;
  /** Usuário interno resolvido (issuer+subject), quando principal.kind === 'user'. */
  user?: InternalUser;
  requestId: string;
  nowSec?: number;
}

export interface AuthorizeDecision {
  allowed: boolean;
  /** Motivo curto e seguro. */
  reason: string;
  audit: AuditEvent;
}

// ── Matriz de capacidade por papel de tenant ──────────────────────────────────
const TENANT_ROLE_ACTIONS: Record<TenantRole, ReadonlySet<Action>> = {
  owner:         new Set<Action>(['read', 'create', 'update', 'delete', 'approve', 'administer']),
  admin:         new Set<Action>(['read', 'create', 'update', 'delete', 'approve']),
  operator:      new Set<Action>(['read', 'create', 'update']),
  'client-link': new Set<Action>(['read']),
};

// Papel global da equipe RevHackers. super_admin/admin são globais (proposta doc 03).
const GLOBAL_ROLE_ACTIONS: Record<GlobalRole, ReadonlySet<Action> | 'all'> = {
  super_admin: 'all',
  admin: 'all',
  user: new Set<Action>([]), // 'user' interno não tem acesso cross-tenant por si só
};

function makeAudit(
  input: AuthorizeInput,
  outcome: 'allowed' | 'denied',
  reason: string,
): AuditEvent {
  const principalKind = input.principal.kind === 'user' ? 'user' : 'link';
  const principalId =
    input.principal.kind === 'user' ? input.principal.userId : `link:${input.resource?.id ?? 'unknown'}`;
  return {
    requestId: input.requestId,
    occurredAt: new Date().toISOString(),
    action: input.action,
    resource: input.resource
      ? { type: input.resource.type, id: input.resource.id }
      : { type: 'audit_log', id: 'unknown' },
    tenantHash: input.resource ? tenantHash(input.resource.tenantId) : null,
    principalKind,
    principalId,
    outcome,
    reason,
  };
}

function deny(input: AuthorizeInput, reason: string): AuthorizeDecision {
  return { allowed: false, reason, audit: makeAudit(input, 'denied', reason) };
}
function allow(input: AuthorizeInput, reason: string): AuthorizeDecision {
  return { allowed: true, reason, audit: makeAudit(input, 'allowed', reason) };
}

function linkAllows(cap: LinkCapability, resource: Resource, action: Action, nowSec: number): boolean {
  if (cap.revoked) return false;
  if (nowSec >= cap.expiresAt) return false;
  if (cap.tenantId !== resource.tenantId) return false;
  if (cap.resource.type !== resource.type || cap.resource.id !== resource.id) return false;
  return cap.allowedActions.includes(action);
}

/**
 * Decisão de autorização. Não lança; devolve decisão + auditoria.
 */
export function authorize(input: AuthorizeInput): AuthorizeDecision {
  const nowSec = input.nowSec ?? Math.floor(Date.now() / 1000);

  // Recurso inexistente OU cross-tenant já filtrado no carregamento => not found.
  // (O caller carrega por (tenantId, id); se veio null, não revela existência.)
  if (!input.resource) {
    return deny(input, 'resource_not_found');
  }

  // ── Caminho de capacidade de link (cliente sem login) ──────────────────────
  if (input.principal.kind === 'link') {
    return linkAllows(input.principal.capability, input.resource, input.action, nowSec)
      ? allow(input, 'link_capability')
      : deny(input, 'link_capability_denied');
  }

  // ── Caminho de usuário autenticado ──────────────────────────────────────────
  const user = input.user;
  if (!user || user.id !== input.principal.userId) {
    return deny(input, 'user_unresolved');
  }
  if (user.status !== 'active') {
    return deny(input, 'user_disabled');
  }

  // Papel global da equipe (autoridade interna, nunca claim do cliente).
  if (user.globalRole) {
    const globalCaps = GLOBAL_ROLE_ACTIONS[user.globalRole];
    if (globalCaps === 'all') {
      return allow(input, `global_${user.globalRole}`);
    }
    if (globalCaps.has(input.action)) {
      return allow(input, `global_${user.globalRole}`);
    }
    // 'user' global cai para checagem de membership abaixo.
  }

  // Membership ativa no tenant DO RECURSO (resolvido no servidor).
  const membership = user.memberships.find(
    (m) => m.tenantId === input.resource!.tenantId,
  );
  if (!membership) {
    // Sem vínculo com o tenant do recurso => forbidden (token válido, sem membership).
    return deny(input, 'no_membership_in_tenant');
  }
  if (membership.status !== 'active') {
    return deny(input, 'membership_suspended');
  }

  const roleCaps = TENANT_ROLE_ACTIONS[membership.role];
  if (!roleCaps.has(input.action)) {
    return deny(input, `role_${membership.role}_lacks_${input.action}`);
  }

  return allow(input, `tenant_role_${membership.role}`);
}
