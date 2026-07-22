import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { describe, expect, test } from 'vitest';
import { loadConfig, type ApiConfig } from '../../api/src/config';
import { createApp, type StructuredLogger } from '../../api/src/http/app';
import { createApiServer } from '../../api/src/server';

function captureLogger() {
  const info: Record<string, unknown>[] = [];
  const error: Record<string, unknown>[] = [];
  const logger: StructuredLogger = {
    info: (event) => info.push(event),
    error: (event) => error.push(event),
  };
  return { logger, info, error };
}

const appBase = {
  environment: 'staging' as const,
  service: 'revhackers-api',
  version: 'test-revision',
};

describe('E4 HTTP — health, readiness e erros', () => {
  test('raiz identifica o serviço sem expor dados', async () => {
    const app = createApp(appBase);
    const response = await app(new Request('https://api.test/'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', service: 'revhackers-api' });
  });

  test('healthz responde contrato OpenAPI, request id e headers de segurança', async () => {
    const { logger, info } = captureLogger();
    const app = createApp({ ...appBase, logger });
    const response = await app(new Request('https://api.test/healthz', {
      headers: { 'x-request-id': 'req-health-0001' },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', service: 'revhackers-api', version: 'test-revision' });
    expect(response.headers.get('x-request-id')).toBe('req-health-0001');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(info.at(-1)).toMatchObject({ event: 'http_request', status: 200, path: '/healthz' });
  });

  test('request id fora do formato seguro é descartado', async () => {
    const app = createApp(appBase);
    const response = await app(new Request('https://api.test/healthz', {
      headers: { 'x-request-id': 'bad' },
    }));
    expect(response.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('readyz retorna 503 padronizado e registra motivo interno sem expor no body', async () => {
    const { logger, error } = captureLogger();
    const app = createApp({
      ...appBase,
      logger,
      readiness: async () => ({ ready: false, reason: 'cloud_sql_not_ready' }),
    });
    const response = await app(new Request('https://api.test/readyz'));
    const body = await response.json() as any;

    expect(response.status).toBe(503);
    expect(body.error).toMatchObject({ code: 'internal', message: 'Serviço temporariamente indisponível.' });
    expect(JSON.stringify(body)).not.toContain('cloud_sql_not_ready');
    expect(error.at(-1)).toMatchObject({ event: 'readiness_failed', reason: 'cloud_sql_not_ready' });
  });

  test('rota inexistente responde 404 sem revelar detalhe interno', async () => {
    const app = createApp(appBase);
    const response = await app(new Request('https://api.test/private/unknown'));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: 'not_found' } });
  });

  test('método inválido responde 405 e allow explícito', async () => {
    const app = createApp(appBase);
    const response = await app(new Request('https://api.test/healthz', { method: 'POST' }));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, OPTIONS');
  });
});

describe('E4 HTTP — CORS explícito', () => {
  const allowed = 'https://staging.revhackers.test';

  test('origem exata autorizada recebe CORS credenciado', async () => {
    const app = createApp({ ...appBase, allowedOrigins: new Set([allowed]) });
    const response = await app(new Request('https://api.test/healthz', { headers: { origin: allowed } }));
    expect(response.headers.get('access-control-allow-origin')).toBe(allowed);
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    expect(response.headers.get('vary')).toBe('Origin');
  });

  test('origem não autorizada nunca recebe access-control-allow-origin', async () => {
    const app = createApp({ ...appBase, allowedOrigins: new Set([allowed]) });
    const response = await app(new Request('https://api.test/healthz', {
      headers: { origin: 'https://evil.example' },
    }));
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  test('wildcard é rejeitado no startup', () => {
    expect(() => createApp({ ...appBase, allowedOrigins: new Set(['*']) })).toThrow(/wildcard/i);
  });

  test('preflight de origem autorizada responde 204', async () => {
    const app = createApp({ ...appBase, allowedOrigins: new Set([allowed]) });
    const response = await app(new Request('https://api.test/v1/growthmaps/x', {
      method: 'OPTIONS',
      headers: { origin: allowed },
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-methods')).toContain('GET');
  });
});

describe('E4 HTTP — config e adapter Node/Cloud Run', () => {
  test('config valida porta, ambiente e origins exatas', () => {
    const config = loadConfig({
      PORT: '9090',
      APP_ENV: 'staging',
      K_SERVICE: 'revhackers-staging-api',
      K_REVISION: 'rev-001',
      CORS_ALLOWED_ORIGINS: 'https://one.test,https://two.test',
    });
    expect(config).toMatchObject({ port: 9090, environment: 'staging', service: 'revhackers-staging-api', version: 'rev-001' });
    expect(config.allowedOrigins.has('https://two.test')).toBe(true);
  });

  test('config rejeita porta e CORS inseguros', () => {
    expect(() => loadConfig({ PORT: '99999' })).toThrow(/PORT/);
    expect(() => loadConfig({ CORS_ALLOWED_ORIGINS: '*' })).toThrow(/wildcard/i);
    expect(() => loadConfig({ CORS_ALLOWED_ORIGINS: 'https://ok.test/path' })).toThrow(/origins exatas/i);
  });

  test('servidor HTTP real responde health e faz shutdown gracioso', async () => {
    const { logger } = captureLogger();
    const config: ApiConfig = {
      port: 8080,
      environment: 'staging',
      service: 'revhackers-api',
      version: 'integration-test',
      allowedOrigins: new Set(),
      shutdownGraceMs: 2_000,
    };
    const api = createApiServer(config, logger);
    api.server.listen(0, '127.0.0.1');
    await once(api.server, 'listening');
    const address = api.server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${address.port}/healthz`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok', version: 'integration-test' });

    await api.shutdown();
    expect(api.server.listening).toBe(false);
  });

  test('adapter bloqueia payload maior que 1 MiB antes de chegar à aplicação', async () => {
    const { logger } = captureLogger();
    const config: ApiConfig = {
      port: 8080,
      environment: 'staging',
      service: 'revhackers-api',
      version: 'integration-test',
      allowedOrigins: new Set(),
      shutdownGraceMs: 2_000,
    };
    const api = createApiServer(config, logger);
    api.server.listen(0, '127.0.0.1');
    await once(api.server, 'listening');
    const address = api.server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${address.port}/unknown`, {
      method: 'POST',
      body: 'x'.repeat(1_048_577),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: 'validation' } });

    await api.shutdown();
  });
});
