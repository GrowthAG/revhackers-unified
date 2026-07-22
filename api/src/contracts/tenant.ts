/**
 * Modelo de tenant e autorização (migração GCP — E4/Fase C).
 *
 * DECISÃO DE TRABALHO (proposta em docs/.../03-auth-and-tenant-isolation.md,
 * ainda pendente de aprovação formal de Giulliano): o tenant canônico é
 * `clients.id`. Este código isola por `TenantId` de forma agnóstica — se a
 * unidade canônica mudar (organization, client_account, etc.), só muda a
 * origem do `tenantId`; a lógica de isolamento e os testes negativos
 * continuam válidos.
 *
 * Dois eixos de papel, deliberadamente separados:
 *  - GlobalRole: equipe RevHackers (profiles.role). super_admin/admin globais.
 *  - TenantRole: papel de um usuário DENTRO de um tenant (membership).
 * Cliente final hoje não tem login — acessa por capacidade de link
 * (ver contracts/identity.ts: LinkCapability). Modelado à parte de propósito.
 */

export type TenantId = string;
export type UserId = string;

/** Papel global da equipe RevHackers. Nunca vem do cliente; vem da fonte interna. */
export type GlobalRole = 'super_admin' | 'admin' | 'user';

/** Papel dentro de um tenant específico. */
export type TenantRole = 'owner' | 'admin' | 'operator' | 'client-link';

export type MembershipStatus = 'active' | 'suspended';

export interface Membership {
  userId: UserId;
  tenantId: TenantId;
  role: TenantRole;
  status: MembershipStatus;
}

/** Usuário interno resolvido a partir de (issuer, subject). */
export interface InternalUser {
  id: UserId;
  /** Papel global da equipe, se houver. Cliente-portador-de-link não é user global. */
  globalRole: GlobalRole | null;
  status: 'active' | 'disabled';
  memberships: Membership[];
}
