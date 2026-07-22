/**
 * Identidade: verificação de token e capacidade de link (migração GCP — E4/Fase C).
 *
 * A API isola o provedor de identidade atrás de uma camada de verificação e
 * mapeia (issuer + subject) -> usuário interno. Trocar de emissor (Supabase Auth
 * hoje -> Identity Platform/OIDC depois) não altera o modelo de autorização.
 *
 * Cliente final não tem login: acessa por LinkCapability (token opaco, com hash
 * armazenado, escopo mínimo, expiração e revogação).
 */

import type { ResourceRef } from './resource';
import type { TenantId } from './tenant';

/** Claims mínimas que a API confia após validar assinatura/emissor/audiência. */
export interface VerifiedToken {
  issuer: string;
  subject: string;
  /** Epoch (s) de expiração já validado pelo verifier. */
  expiresAt: number;
  /** Claims de papel/tenant podem acelerar decisão, mas NÃO são autoridade final. */
  claims?: Record<string, unknown>;
}

/** Capacidade concedida por um link público opaco (cliente sem login). */
export interface LinkCapability {
  /** Tenant derivado do registro interno do link, não de campo externo. */
  tenantId: TenantId;
  /** Recurso exato ao qual o link dá acesso. */
  resource: ResourceRef;
  /** Ações permitidas pelo link (escopo mínimo). Ex.: ['read'] ou ['read','approve']. */
  allowedActions: string[];
  expiresAt: number;
  revoked: boolean;
}

/** Principal resolvido de uma requisição: usuário autenticado OU capacidade de link. */
export type Principal =
  | { kind: 'user'; userId: string }
  | { kind: 'link'; capability: LinkCapability };
