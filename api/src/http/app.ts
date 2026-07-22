import { ApiError } from '../contracts/errors';
import { createRequestContext } from '../context/request-context';
import { redactForLog } from '../context/redaction';

export type ApiEnvironment = 'dev' | 'staging' | 'production';

export interface ReadinessResult {
  ready: boolean;
  /** Código interno seguro para logs; nunca detalhe/secret. */
  reason?: string;
}

export interface StructuredLogger {
  info(event: Record<string, unknown>): void;
  error(event: Record<string, unknown>): void;
}

export interface AppDependencies {
  environment: ApiEnvironment;
  service?: string;
  version: string;
  /** Origens exatas. Wildcard é rejeitado quando a API usa credenciais. */
  allowedOrigins?: ReadonlySet<string>;
  readiness?: () => Promise<ReadinessResult>;
  logger?: StructuredLogger;
  nowMs?: () => number;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const SECURITY_HEADERS: Record<string, string> = {
  'cache-control': 'no-store',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

const consoleLogger: StructuredLogger = {
  info: (event) => console.log(JSON.stringify(redactForLog(event))),
  error: (event) => console.error(JSON.stringify(redactForLog(event))),
};

function responseHeaders(requestId: string, extra?: HeadersInit): Headers {
  const headers = new Headers({ ...JSON_HEADERS, ...SECURITY_HEADERS, 'x-request-id': requestId });
  if (extra) new Headers(extra).forEach((value, key) => headers.set(key, value));
  return headers;
}

function json(status: number, body: unknown, requestId: string, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(requestId, extra),
  });
}

function corsHeaders(origin: string | null, allowedOrigins: ReadonlySet<string>): HeadersInit {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'authorization, content-type, idempotency-key, x-link-capability, x-request-id',
    'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'access-control-max-age': '600',
    vary: 'Origin',
  };
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError('internal', 'Erro interno. Tente novamente.');
}

/**
 * Handler Fetch API puro. O adapter Node/Cloud Run fica em `server.ts`.
 * Testável sem abrir porta e portátil entre runtimes.
 */
export function createApp(deps: AppDependencies): (request: Request) => Promise<Response> {
  const logger = deps.logger ?? consoleLogger;
  const service = deps.service ?? 'revhackers-api';
  const allowedOrigins = deps.allowedOrigins ?? new Set<string>();
  const readiness = deps.readiness ?? (async () => ({ ready: true }));
  const nowMs = deps.nowMs ?? Date.now;

  if (allowedOrigins.has('*')) {
    throw new Error('CORS wildcard is forbidden for credentialed API.');
  }

  return async (request: Request): Promise<Response> => {
    const startedAtMs = nowMs();
    const requestId = request.headers.get('x-request-id');
    const context = createRequestContext({
      receivedRequestId: requestId,
      environment: deps.environment,
      service,
      nowMs: startedAtMs,
    });
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get('origin'), allowedOrigins);
    let response: Response;

    try {
      if (request.method === 'OPTIONS') {
        response = new Response(null, {
          status: 204,
          headers: responseHeaders(context.requestId, cors),
        });
      } else if (url.pathname === '/healthz') {
        if (request.method !== 'GET') {
          response = json(405, ApiError.validation('Método não permitido.').toBody(context.requestId), context.requestId, {
            ...cors,
            allow: 'GET, OPTIONS',
          });
        } else {
          response = json(200, { status: 'ok', service, version: deps.version }, context.requestId, cors);
        }
      } else if (url.pathname === '/readyz') {
        if (request.method !== 'GET') {
          response = json(405, ApiError.validation('Método não permitido.').toBody(context.requestId), context.requestId, {
            ...cors,
            allow: 'GET, OPTIONS',
          });
        } else {
          const result = await readiness();
          response = result.ready
            ? json(200, { status: 'ok', service, version: deps.version }, context.requestId, cors)
            : json(503, new ApiError('internal', 'Serviço temporariamente indisponível.').toBody(context.requestId), context.requestId, cors);
          if (!result.ready) {
            logger.error({
              severity: 'WARNING',
              event: 'readiness_failed',
              request_id: context.requestId,
              environment: deps.environment,
              service,
              version: deps.version,
              reason: result.reason ?? 'dependency_not_ready',
            });
          }
        }
      } else {
        response = json(404, ApiError.notFound().toBody(context.requestId), context.requestId, cors);
      }
    } catch (error) {
      const apiError = toApiError(error);
      logger.error({
        severity: 'ERROR',
        event: 'request_error',
        request_id: context.requestId,
        environment: deps.environment,
        service,
        version: deps.version,
        error_code: apiError.code,
        internal: apiError.internal,
      });
      response = json(apiError.status, apiError.toBody(context.requestId), context.requestId, cors);
    }

    logger.info({
      severity: 'INFO',
      event: 'http_request',
      request_id: context.requestId,
      environment: deps.environment,
      service,
      version: deps.version,
      method: request.method,
      path: url.pathname,
      status: response.status,
      duration_ms: Math.max(0, nowMs() - startedAtMs),
    });
    return response;
  };
}
