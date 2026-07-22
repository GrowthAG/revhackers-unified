import { ApiError } from './contracts/errors';
import type { ApiEnvironment } from './http/app';

export interface ApiConfig {
  port: number;
  environment: ApiEnvironment;
  service: string;
  version: string;
  allowedOrigins: ReadonlySet<string>;
  shutdownGraceMs: number;
}

function parseInteger(value: string | undefined, fallback: number, min: number, max: number, name: string): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw ApiError.validation(`Configuração ${name} inválida.`);
  }
  return parsed;
}

function parseEnvironment(value: string | undefined): ApiEnvironment {
  if (!value || value === 'development' || value === 'dev') return 'dev';
  if (value === 'staging') return 'staging';
  if (value === 'production') return 'production';
  throw ApiError.validation('Configuração APP_ENV inválida.');
}

function parseOrigins(value: string | undefined): ReadonlySet<string> {
  if (!value?.trim()) return new Set<string>();
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.includes('*')) throw ApiError.validation('CORS wildcard não é permitido.');

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw ApiError.validation('CORS_ALLOWED_ORIGINS contém origem inválida.');
    }
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== origin) {
      throw ApiError.validation('CORS_ALLOWED_ORIGINS deve conter apenas origins exatas.');
    }
  }
  return new Set(origins);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    port: parseInteger(env.PORT, 8080, 1, 65535, 'PORT'),
    environment: parseEnvironment(env.APP_ENV ?? env.NODE_ENV),
    service: env.K_SERVICE?.trim() || 'revhackers-api',
    version: env.K_REVISION?.trim() || env.APP_VERSION?.trim() || 'local',
    allowedOrigins: parseOrigins(env.CORS_ALLOWED_ORIGINS),
    shutdownGraceMs: parseInteger(env.SHUTDOWN_GRACE_MS, 10_000, 1_000, 60_000, 'SHUTDOWN_GRACE_MS'),
  };
}
