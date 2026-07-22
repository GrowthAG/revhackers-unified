import { ApiError } from '../contracts/errors';

export type CloudSqlIpType = 'PUBLIC' | 'PRIVATE';

export interface CloudSqlConfig {
  kind: 'cloud-sql-iam';
  instanceConnectionName: string;
  database: string;
  user: string;
  ipType: CloudSqlIpType;
  maxConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
}

export interface DirectPostgresConfig {
  kind: 'direct-dev';
  connectionString: string;
  maxConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
}

export type DatabaseConfig = CloudSqlConfig | DirectPostgresConfig;

function integer(value: string | undefined, fallback: number, min: number, max: number, name: string): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw ApiError.validation(`Configuração ${name} inválida.`);
  }
  return parsed;
}

function common(env: NodeJS.ProcessEnv) {
  return {
    maxConnections: integer(env.DB_POOL_MAX, 5, 1, 20, 'DB_POOL_MAX'),
    connectionTimeoutMs: integer(env.DB_CONNECTION_TIMEOUT_MS, 10_000, 1_000, 60_000, 'DB_CONNECTION_TIMEOUT_MS'),
    idleTimeoutMs: integer(env.DB_IDLE_TIMEOUT_MS, 30_000, 1_000, 300_000, 'DB_IDLE_TIMEOUT_MS'),
  };
}

export function loadDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const instance = env.CLOUD_SQL_INSTANCE?.trim();
  if (instance) {
    const database = env.CLOUD_SQL_DATABASE?.trim();
    const user = env.CLOUD_SQL_IAM_USER?.trim();
    if (!database || !/^[A-Za-z_][A-Za-z0-9_-]{0,62}$/.test(database)) {
      throw ApiError.validation('CLOUD_SQL_DATABASE ausente ou inválido.');
    }
    if (!user || user.length > 255) {
      throw ApiError.validation('CLOUD_SQL_IAM_USER ausente ou inválido.');
    }
    const ipType = (env.CLOUD_SQL_IP_TYPE?.trim() || 'PUBLIC') as CloudSqlIpType;
    if (!['PUBLIC', 'PRIVATE'].includes(ipType)) {
      throw ApiError.validation('CLOUD_SQL_IP_TYPE deve ser PUBLIC ou PRIVATE.');
    }
    return {
      kind: 'cloud-sql-iam',
      instanceConnectionName: instance,
      database,
      user,
      ipType,
      ...common(env),
    };
  }

  const connectionString = env.DATABASE_URL?.trim();
  const appEnv = env.APP_ENV ?? env.NODE_ENV ?? 'dev';
  if (!connectionString) {
    throw ApiError.validation('CLOUD_SQL_INSTANCE é obrigatório (DATABASE_URL apenas em dev).');
  }
  if (!['dev', 'development', 'test'].includes(appEnv)) {
    throw ApiError.validation('DATABASE_URL direta é proibida fora de dev/test.');
  }
  return { kind: 'direct-dev', connectionString, ...common(env) };
}
