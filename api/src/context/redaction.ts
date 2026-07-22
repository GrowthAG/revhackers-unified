/**
 * Redação de logs (migração GCP — E4/Fase C).
 *
 * Logs estruturados nunca carregam token, segredo, senha, cookie, payload
 * integral ou PII desnecessária. Esta função é uma barreira adicional — não
 * substitui allowlist no call-site. Retorna cópia; nunca muta o objeto original.
 */

import { createHash } from 'node:crypto';

const SENSITIVE_KEY = /(^|_)(authorization|cookie|token|secret|password|passwd|api_?key|service_?role|email|phone|cpf|cnpj)($|_)/i;
const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 8;

export function tenantHash(tenantId: string): string {
  // Hash curto para correlação de logs, sem expor o id de tenant.
  return createHash('sha256').update(tenantId).digest('hex').slice(0, 16);
}

export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[DEPTH_LIMIT]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…[TRUNCATED]`
      : value;
  }
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactForLog(item, depth + 1));

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactForLog(child, depth + 1);
  }
  return output;
}
