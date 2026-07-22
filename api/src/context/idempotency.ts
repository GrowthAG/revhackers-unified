/**
 * Contrato de idempotência (migração GCP — E4/Fase C).
 *
 * Mutações recebem `Idempotency-Key`. A chave é escopada por tenant + operação;
 * reutilizar a mesma chave com payload diferente é conflito (409), nunca executa
 * duas vezes. A store em memória existe só para testes/dev — Cloud Run usará
 * implementação persistente (Cloud SQL/Redis conforme decisão) satisfazendo a
 * mesma interface.
 */

import { createHash } from 'node:crypto';
import { ApiError } from '../contracts/errors';
import type { TenantId } from '../contracts/tenant';

export interface IdempotencyRecord<T = unknown> {
  tenantId: TenantId;
  operation: string;
  key: string;
  requestHash: string;
  status: 'processing' | 'completed';
  response?: T;
  createdAtMs: number;
}

export interface IdempotencyStore {
  get<T = unknown>(scopedKey: string): Promise<IdempotencyRecord<T> | null>;
  putIfAbsent<T = unknown>(scopedKey: string, record: IdempotencyRecord<T>): Promise<boolean>;
  complete<T = unknown>(scopedKey: string, response: T): Promise<void>;
}

export function hashRequest(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function makeScopedIdempotencyKey(tenantId: TenantId, operation: string, key: string): string {
  if (!key || key.length < 8 || key.length > 128) {
    throw ApiError.validation('Idempotency-Key inválida.');
  }
  return `${tenantId}:${operation}:${key}`;
}

export async function beginIdempotentOperation<T>(input: {
  store: IdempotencyStore;
  tenantId: TenantId;
  operation: string;
  key: string;
  payload: unknown;
  nowMs?: number;
}): Promise<{ status: 'new' } | { status: 'replay'; response: T }> {
  const scopedKey = makeScopedIdempotencyKey(input.tenantId, input.operation, input.key);
  const requestHash = hashRequest(input.payload);
  const existing = await input.store.get<T>(scopedKey);

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw ApiError.conflict('Idempotency-Key reutilizada com payload diferente.');
    }
    if (existing.status === 'completed') {
      return { status: 'replay', response: existing.response as T };
    }
    throw ApiError.conflict('Operação idempotente ainda em processamento.');
  }

  const inserted = await input.store.putIfAbsent(scopedKey, {
    tenantId: input.tenantId,
    operation: input.operation,
    key: input.key,
    requestHash,
    status: 'processing',
    createdAtMs: input.nowMs ?? Date.now(),
  });

  if (!inserted) {
    // Corrida: outro request inseriu entre get e put. Caller pode tentar de novo.
    throw ApiError.conflict('Operação idempotente concorrente.');
  }
  return { status: 'new' };
}

/** Store sintética apenas para testes/dev. Nunca usar em Cloud Run real. */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  async get<T>(scopedKey: string): Promise<IdempotencyRecord<T> | null> {
    return (this.records.get(scopedKey) as IdempotencyRecord<T> | undefined) ?? null;
  }
  async putIfAbsent<T>(scopedKey: string, record: IdempotencyRecord<T>): Promise<boolean> {
    if (this.records.has(scopedKey)) return false;
    this.records.set(scopedKey, record);
    return true;
  }
  async complete<T>(scopedKey: string, response: T): Promise<void> {
    const record = this.records.get(scopedKey);
    if (!record) throw new Error('Idempotency record not found.');
    this.records.set(scopedKey, { ...record, status: 'completed', response });
  }
}
