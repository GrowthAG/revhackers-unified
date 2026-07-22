import { ApiError } from '../contracts/errors';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';

export interface IdentityRouteDependencies {
  verifier: TokenVerifier;
  identities: IdentityRepository;
}

function bearer(request: Request): string {
  const match = request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/);
  if (!match) throw ApiError.unauthenticated('Token ausente ou inválido.');
  return match[1]!;
}

export function createIdentityRoutes(deps: IdentityRouteDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (url.pathname !== '/v1/me') return null;
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { allow: 'GET, OPTIONS' } });
    }

    const token = await deps.verifier.verify(bearer(request));
    const user = await deps.identities.findUser(token);
    if (!user || user.status !== 'active') throw ApiError.forbidden();

    return new Response(JSON.stringify({
      id: user.id,
      globalRole: user.globalRole,
      status: user.status,
      memberships: user.memberships.map(({ tenantId, role, status }) => ({ tenantId, role, status })),
    }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
  };
}
