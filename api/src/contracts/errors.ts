/**
 * Erro padronizado da API (migração GCP — E4/Fase C).
 *
 * Toda resposta de erro tem o mesmo formato, independente do domínio.
 * Nunca inclui token, payload bruto, PII ou detalhe interno de banco — a
 * mensagem é segura para chegar ao cliente. Contexto sensível vai só para o
 * log estruturado (ver context/redaction.ts), correlacionado por request_id.
 *
 * Ref: docs/architecture/gcp-migration/02-target-architecture.md
 */

export type ErrorCode =
  | 'unauthenticated'      // 401 — token ausente/inválido/expirado/emissor errado
  | 'forbidden'           // 403 — autenticado, mas sem membership/papel/tenant
  | 'not_found'           // 404 — recurso inexistente OU cross-tenant (não revela qual)
  | 'validation'          // 400 — payload/entrada inválidos
  | 'conflict'            // 409 — idempotência/estado conflitante
  | 'rate_limited'        // 429
  | 'internal';           // 500 — falha não esperada

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  validation: 400,
  conflict: 409,
  rate_limited: 429,
  internal: 500,
};

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    request_id?: string;
  };
}

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Detalhe interno para log — NUNCA serializado na resposta. */
  readonly internal: Record<string, unknown> | undefined;

  constructor(code: ErrorCode, message: string, internal?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.internal = internal;
  }

  toBody(requestId?: string): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(requestId ? { request_id: requestId } : {}),
      },
    };
  }

  static unauthenticated(message = 'Autenticação necessária.', internal?: Record<string, unknown>) {
    return new ApiError('unauthenticated', message, internal);
  }
  static forbidden(message = 'Acesso negado.', internal?: Record<string, unknown>) {
    return new ApiError('forbidden', message, internal);
  }
  static notFound(message = 'Recurso não encontrado.', internal?: Record<string, unknown>) {
    return new ApiError('not_found', message, internal);
  }
  static validation(message = 'Requisição inválida.', internal?: Record<string, unknown>) {
    return new ApiError('validation', message, internal);
  }
  static conflict(message = 'Conflito de estado.', internal?: Record<string, unknown>) {
    return new ApiError('conflict', message, internal);
  }
}
