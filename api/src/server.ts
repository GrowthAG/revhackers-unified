import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { ApiError } from './contracts/errors';
import { resolveRequestId } from './context/request-context';
import { redactForLog } from './context/redaction';
import { createApp, type StructuredLogger } from './http/app';
import type { ApiConfig } from './config';

const MAX_BODY_BYTES = 1_048_576; // 1 MiB; rotas específicas poderão reduzir.

const consoleLogger: StructuredLogger = {
  info: (event) => console.log(JSON.stringify(redactForLog(event))),
  error: (event) => console.error(JSON.stringify(redactForLog(event))),
};

async function readBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return undefined;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      throw ApiError.validation('Payload excede o limite permitido.', { reason: 'payload_too_large' });
    }
    chunks.push(buffer);
  }
  return chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined;
}

function requestUrl(req: IncomingMessage): URL {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protoValue = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const protocol = protoValue === 'https' ? 'https' : 'http';
  const host = req.headers.host || 'localhost';
  return new URL(req.url || '/', `${protocol}://${host}`);
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const body = await readBody(req);
  const headers = new Headers();
  for (let index = 0; index < req.rawHeaders.length; index += 2) {
    const name = req.rawHeaders[index];
    const value = req.rawHeaders[index + 1];
    if (name !== undefined && value !== undefined) headers.append(name, value);
  }
  const init: RequestInit = {
    method: req.method || 'GET',
    headers,
    ...(body !== undefined ? { body } : {}),
  };
  return new Request(requestUrl(req), init);
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body);
}

function writeAdapterError(req: IncomingMessage, res: ServerResponse, error: unknown, logger: StructuredLogger): void {
  const requestId = resolveRequestId(
    typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : undefined,
  );
  const apiError = error instanceof ApiError
    ? error
    : new ApiError('internal', 'Erro interno. Tente novamente.');
  logger.error({
    severity: 'ERROR',
    event: 'http_adapter_error',
    request_id: requestId,
    error_code: apiError.code,
    internal: apiError.internal,
  });
  res.statusCode = apiError.status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-request-id', requestId);
  res.end(JSON.stringify(apiError.toBody(requestId)));
}

export interface ApiServer {
  server: Server;
  /** Marca readiness=false e fecha conexões sem interromper o processo à força. */
  shutdown(): Promise<void>;
}

export function createApiServer(config: ApiConfig, logger: StructuredLogger = consoleLogger): ApiServer {
  let ready = true;
  let shuttingDown = false;

  const app = createApp({
    environment: config.environment,
    service: config.service,
    version: config.version,
    allowedOrigins: config.allowedOrigins,
    logger,
    readiness: async () => ({
      ready: ready && !shuttingDown,
      ...(!ready || shuttingDown ? { reason: 'shutting_down' } : {}),
    }),
  });

  const server = createServer(async (req, res) => {
    try {
      const request = await toWebRequest(req);
      const response = await app(request);
      await writeWebResponse(res, response);
    } catch (error) {
      writeAdapterError(req, res, error, logger);
    }
  });

  async function shutdown(): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    ready = false;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        server.closeAllConnections?.();
        reject(new Error('Graceful shutdown timeout exceeded.'));
      }, config.shutdownGraceMs);
      timeout.unref();

      server.close((error) => {
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve();
      });
      server.closeIdleConnections?.();
    });
  }

  return { server, shutdown };
}
