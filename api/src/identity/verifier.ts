/**
 * Verificação de token agnóstica de provedor (migração GCP — E4/Fase C).
 *
 * A API valida, em cada requisição protegida (ver doc 03, "Verificação de
 * token proposta"): formato/algoritmo, assinatura contra JWKS confiável,
 * emissor + audiência exatos do ambiente, expiração/not-before, e mapeia
 * (issuer + subject) -> usuário interno ativo. Token válido sem membership
 * resulta em 403 (decidido na camada de autz, não aqui).
 *
 * Esta interface NÃO conhece Supabase nem nenhum provedor específico. A
 * implementação concreta (Supabase Auth hoje, OIDC depois) satisfaz o contrato.
 */

import { ApiError } from '../contracts/errors';
import type { VerifiedToken } from '../contracts/identity';

export interface TokenVerifierConfig {
  /** Emissor esperado NESTE ambiente. Token de outro ambiente -> 401. */
  expectedIssuer: string;
  /** Audiência esperada NESTE ambiente. */
  expectedAudience: string;
  /** Tolerância de relógio em segundos. */
  clockToleranceSec?: number;
}

export interface TokenVerifier {
  /** Retorna claims verificadas ou lança ApiError('unauthenticated'). */
  verify(rawToken: string, nowSec?: number): Promise<VerifiedToken>;
}

/**
 * Valida as invariantes de ambiente sobre um token já decodificado.
 * Reutilizável por qualquer implementação concreta (Supabase/OIDC).
 * Lança ApiError('unauthenticated') sem revelar detalhe explorável.
 */
export function assertEnvironmentClaims(
  token: Pick<VerifiedToken, 'issuer' | 'expiresAt'> & { issuer: string; audience?: string; notBefore?: number },
  config: TokenVerifierConfig,
  nowSec: number,
): void {
  const tol = config.clockToleranceSec ?? 30;

  if (token.issuer !== config.expectedIssuer) {
    throw ApiError.unauthenticated('Token inválido.', { reason: 'issuer_mismatch' });
  }
  if (token.audience !== undefined && token.audience !== config.expectedAudience) {
    throw ApiError.unauthenticated('Token inválido.', { reason: 'audience_mismatch' });
  }
  if (typeof token.notBefore === 'number' && nowSec + tol < token.notBefore) {
    throw ApiError.unauthenticated('Token ainda não válido.', { reason: 'not_yet_valid' });
  }
  if (nowSec - tol >= token.expiresAt) {
    throw ApiError.unauthenticated('Token expirado.', { reason: 'expired' });
  }
}
