import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { ApiError } from '../contracts/errors';
import type { VerifiedToken } from '../contracts/identity';
import { assertEnvironmentClaims, type TokenVerifier } from './verifier';

const GOOGLE_SECURE_TOKEN_JWKS = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
);

export interface GoogleIdentityVerifierConfig {
  projectId: string;
  clockToleranceSec?: number;
}

export type GoogleJwtVerifier = (rawToken: string, nowSec: number) => Promise<JWTPayload>;

function validateProjectId(projectId: string): void {
  if (!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(projectId)) {
    throw ApiError.validation('GOOGLE_CLOUD_PROJECT inválido.');
  }
}

/**
 * Verifier de Identity Platform/Firebase Auth usando JWKS oficial Google.
 * Aceita somente RS256, issuer securetoken do projeto e audience exata.
 * Não usa service-account key; JWKS é público e workload identity cuida das
 * operações administrativas separadas quando necessárias.
 */
export class GoogleIdentityTokenVerifier implements TokenVerifier {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly verifyJwt: GoogleJwtVerifier;
  private readonly clockToleranceSec: number;

  constructor(config: GoogleIdentityVerifierConfig, verifier?: GoogleJwtVerifier) {
    validateProjectId(config.projectId);
    this.issuer = `https://securetoken.google.com/${config.projectId}`;
    this.audience = config.projectId;
    this.clockToleranceSec = config.clockToleranceSec ?? 30;

    if (verifier) {
      this.verifyJwt = verifier;
    } else {
      const jwks = createRemoteJWKSet(GOOGLE_SECURE_TOKEN_JWKS, {
        cooldownDuration: 30_000,
        cacheMaxAge: 6 * 60 * 60 * 1000,
        timeoutDuration: 5_000,
      });
      this.verifyJwt = async (rawToken, nowSec) => {
        const result = await jwtVerify(rawToken, jwks, {
          algorithms: ['RS256'],
          issuer: this.issuer,
          audience: this.audience,
          clockTolerance: this.clockToleranceSec,
          currentDate: new Date(nowSec * 1000),
        });
        return result.payload;
      };
    }
  }

  async verify(rawToken: string, nowSec: number = Math.floor(Date.now() / 1000)): Promise<VerifiedToken> {
    if (!rawToken || rawToken.length > 16_384) {
      throw ApiError.unauthenticated('Token inválido.', { reason: 'token_size' });
    }

    let payload: JWTPayload;
    try {
      payload = await this.verifyJwt(rawToken, nowSec);
    } catch {
      throw ApiError.unauthenticated('Token inválido.', { reason: 'signature_or_claims' });
    }

    const audience = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
    if (!payload.sub || typeof payload.exp !== 'number' || !payload.iss || !audience) {
      throw ApiError.unauthenticated('Token inválido.', { reason: 'missing_claims' });
    }

    // Defesa duplicada: mesmo verifier injetado/teste precisa respeitar ambiente.
    assertEnvironmentClaims(
      {
        issuer: payload.iss,
        audience,
        expiresAt: payload.exp,
        ...(typeof payload.nbf === 'number' ? { notBefore: payload.nbf } : {}),
      },
      {
        expectedIssuer: this.issuer,
        expectedAudience: this.audience,
        clockToleranceSec: this.clockToleranceSec,
      },
      nowSec,
    );

    return {
      issuer: payload.iss,
      subject: payload.sub,
      expiresAt: payload.exp,
      claims: { ...payload },
    };
  }
}
