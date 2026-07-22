/**
 * Verifier sintético para dev/testes (migração GCP — E4/Fase C).
 *
 * NÃO usa criptografia real nem provedor externo — serve só para exercitar a
 * matriz de testes negativos com fixtures sintéticas. O token é um JSON base64
 * determinístico. Regras de ambiente (issuer/audience/exp/nbf) são aplicadas
 * pelo mesmo `assertEnvironmentClaims` usado pela implementação real, para que
 * o comportamento de rejeição seja idêntico ao de produção.
 *
 * Proibido em runtime de produção.
 */

import { ApiError } from '../contracts/errors';
import type { VerifiedToken } from '../contracts/identity';
import { assertEnvironmentClaims, type TokenVerifier, type TokenVerifierConfig } from './verifier';

export interface SyntheticClaims {
  issuer: string;
  subject: string;
  audience: string;
  expiresAt: number;
  notBefore?: number;
  claims?: Record<string, unknown>;
}

export function makeSyntheticToken(claims: SyntheticClaims): string {
  return Buffer.from(JSON.stringify(claims), 'utf8').toString('base64');
}

export class SyntheticTokenVerifier implements TokenVerifier {
  constructor(private readonly config: TokenVerifierConfig) {}

  async verify(rawToken: string, nowSec: number = Math.floor(Date.now() / 1000)): Promise<VerifiedToken> {
    let decoded: SyntheticClaims;
    try {
      decoded = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf8'));
    } catch {
      throw ApiError.unauthenticated('Token inválido.', { reason: 'malformed' });
    }

    if (!decoded || typeof decoded.issuer !== 'string' || typeof decoded.subject !== 'string' || typeof decoded.expiresAt !== 'number') {
      throw ApiError.unauthenticated('Token inválido.', { reason: 'missing_claims' });
    }

    assertEnvironmentClaims(
      {
        issuer: decoded.issuer,
        audience: decoded.audience,
        expiresAt: decoded.expiresAt,
        ...(decoded.notBefore !== undefined ? { notBefore: decoded.notBefore } : {}),
      },
      this.config,
      nowSec,
    );

    return {
      issuer: decoded.issuer,
      subject: decoded.subject,
      expiresAt: decoded.expiresAt,
      ...(decoded.claims !== undefined ? { claims: decoded.claims } : {}),
    };
  }
}
