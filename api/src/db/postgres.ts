import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import type { TenantId } from '../contracts/tenant';
import type { DatabaseConfig } from './config';

export interface QueryableClient {
  query<R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<R>>;
  release(): void;
}

export interface QueryablePool {
  connect(): Promise<QueryableClient>;
  query<R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<R>>;
  end(): Promise<void>;
}

export interface PostgresResources {
  pool: QueryablePool;
  close(): Promise<void>;
}

/**
 * Cria pool Cloud SQL com IAM DB Authentication. Nenhuma senha é aceita em
 * staging/produção: o conector usa Application Default Credentials da service
 * account do Cloud Run e certificados efêmeros.
 */
export async function createPostgresResources(config: DatabaseConfig): Promise<PostgresResources> {
  let connector: Connector | null = null;
  let pool: Pool;

  if (config.kind === 'cloud-sql-iam') {
    connector = new Connector();
    const connectorOptions = await connector.getOptions({
      instanceConnectionName: config.instanceConnectionName,
      authType: AuthTypes.IAM,
      ipType: config.ipType === 'PRIVATE' ? IpAddressTypes.PRIVATE : IpAddressTypes.PUBLIC,
    });
    pool = new Pool({
      ...connectorOptions,
      user: config.user,
      database: config.database,
      max: config.maxConnections,
      connectionTimeoutMillis: config.connectionTimeoutMs,
      idleTimeoutMillis: config.idleTimeoutMs,
      allowExitOnIdle: false,
    });
  } else {
    pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections,
      connectionTimeoutMillis: config.connectionTimeoutMs,
      idleTimeoutMillis: config.idleTimeoutMs,
      allowExitOnIdle: false,
    });
  }

  return {
    pool: pool as QueryablePool,
    async close() {
      await pool.end();
      connector?.close();
    },
  };
}

/**
 * Executa operação em transação com contexto tenant LOCAL à transação.
 * O valor é parametrizado e vem do servidor. COMMIT/ROLLBACK remove o contexto,
 * impedindo vazamento entre requests na mesma conexão do pool.
 */
export async function withTenantTransaction<T>(
  pool: QueryablePool,
  tenantId: TenantId,
  operation: (client: QueryableClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserva o erro original; pool descarta conexão quebrada conforme pg.
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Readiness mínima: query local ao banco, sem tocar tabela de domínio. */
export async function checkPostgresReady(pool: QueryablePool): Promise<boolean> {
  const result = await pool.query<{ ok: number }>('SELECT 1 AS ok');
  return result.rows[0]?.ok === 1;
}
