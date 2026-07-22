import { describe, expect, test } from 'vitest';
import { GoogleIdentityTokenVerifier, type GoogleJwtVerifier } from '../../api/src/identity/google-identity-verifier';

const PROJECT = 'revhackers-staging';
const ISSUER = `https://securetoken.google.com/${PROJECT}`;
const NOW = 1_800_000_000;

function fake(payload: Record<string, unknown>): GoogleJwtVerifier {
  return async () => payload;
}

describe('Google Identity Platform verifier', () => {
  test('aceita token Google do projeto/ambiente exato', async () => {
    const verifier = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT, clockToleranceSec: 0 },
      fake({ iss: ISSUER, aud: PROJECT, sub: 'google-subject-123', exp: NOW + 3600, email_verified: true }),
    );
    await expect(verifier.verify('signed-token-placeholder', NOW)).resolves.toMatchObject({
      issuer: ISSUER,
      subject: 'google-subject-123',
      expiresAt: NOW + 3600,
    });
  });

  test('rejeita token de outro projeto (audience)', async () => {
    const verifier = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT, clockToleranceSec: 0 },
      fake({ iss: ISSUER, aud: 'another-project', sub: 'subject', exp: NOW + 3600 }),
    );
    await expect(verifier.verify('token', NOW)).rejects.toMatchObject({ code: 'unauthenticated', status: 401 });
  });

  test('rejeita issuer de outro ambiente', async () => {
    const verifier = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT, clockToleranceSec: 0 },
      fake({ iss: 'https://securetoken.google.com/revhackers-prod', aud: PROJECT, sub: 'subject', exp: NOW + 3600 }),
    );
    await expect(verifier.verify('token', NOW)).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  test('rejeita token expirado e token sem subject', async () => {
    const expired = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT, clockToleranceSec: 0 },
      fake({ iss: ISSUER, aud: PROJECT, sub: 'subject', exp: NOW }),
    );
    await expect(expired.verify('token', NOW)).rejects.toMatchObject({ code: 'unauthenticated' });

    const missingSubject = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT },
      fake({ iss: ISSUER, aud: PROJECT, exp: NOW + 3600 }),
    );
    await expect(missingSubject.verify('token', NOW)).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  test('erro de assinatura/JWKS vira 401 genérico sem vazar erro interno', async () => {
    const verifier = new GoogleIdentityTokenVerifier(
      { projectId: PROJECT },
      async () => { throw new Error('private JWKS detail'); },
    );
    try {
      await verifier.verify('token', NOW);
      throw new Error('expected rejection');
    } catch (error: any) {
      expect(error.code).toBe('unauthenticated');
      expect(error.message).toBe('Token inválido.');
      expect(error.message).not.toContain('JWKS');
    }
  });

  test('rejeita token excessivo e project id inválido antes de rede', async () => {
    const verifier = new GoogleIdentityTokenVerifier({ projectId: PROJECT }, fake({}));
    await expect(verifier.verify('x'.repeat(16_385), NOW)).rejects.toMatchObject({ code: 'unauthenticated' });
    expect(() => new GoogleIdentityTokenVerifier({ projectId: 'INVALID!' }, fake({}))).toThrow(/GOOGLE_CLOUD_PROJECT/);
  });
});
