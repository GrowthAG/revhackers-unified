import { ApiError } from '../contracts/errors';
import type { TokenVerifier } from '../identity/verifier';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import { beginIdempotentOperation, makeScopedIdempotencyKey, type IdempotencyStore } from '../context/idempotency';
import type { GrowthMapView, SaveGrowthMapInput } from '../domains/growthmap/contracts';
import { GrowthMapService } from '../domains/growthmap/service';

export interface GrowthMapRouteDependencies {
  verifier: TokenVerifier;
  identities: IdentityRepository;
  service: GrowthMapService;
  idempotency: IdempotencyStore;
}

function bearer(request: Request): string {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) throw ApiError.unauthenticated('Token ausente ou inválido.');
  return match[1]!;
}

async function body(request: Request): Promise<SaveGrowthMapInput> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw ApiError.validation('Content-Type deve ser application/json.');
  }
  try {
    return await request.json() as SaveGrowthMapInput;
  } catch {
    throw ApiError.validation('JSON inválido.');
  }
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

export function createGrowthMapRoutes(deps: GrowthMapRouteDependencies) {
  return async (request: Request, requestId: string): Promise<Response | null> => {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/v1\/growthmaps\/([0-9a-f-]{36})$/i);
    if (!match) return null;
    if (request.method !== 'GET' && request.method !== 'PUT') {
      return new Response(null, { status: 405, headers: { allow: 'GET, PUT, OPTIONS' } });
    }

    const projectId = match[1]!;
    const token = await deps.verifier.verify(bearer(request));
    const user = await deps.identities.findUser(token);
    if (!user || user.status !== 'active') throw ApiError.forbidden();
    const tenantId = await deps.identities.resolveProjectTenant(user, projectId);
    if (!tenantId) throw ApiError.notFound();
    const context = { requestId, principal: { kind: 'user' as const, userId: user.id }, user, tenantId };

    if (request.method === 'GET') {
      return json(200, await deps.service.get(context, projectId));
    }

    const input = await body(request);
    const key = request.headers.get('idempotency-key') ?? '';
    const operation = `growthmap.put:${projectId}`;
    const started = await beginIdempotentOperation<GrowthMapView>({
      store: deps.idempotency,
      tenantId,
      operation,
      key,
      payload: input,
    });
    if (started.status === 'replay') return json(200, started.response);

    const saved = await deps.service.save(context, projectId, input);
    await deps.idempotency.complete(makeScopedIdempotencyKey(tenantId, operation, key), saved);
    return json(200, saved);
  };
}
