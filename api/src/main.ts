import { loadConfig } from './config';
import { loadDatabaseConfig } from './db/config';
import { checkPostgresReady, createPostgresResources } from './db/postgres';
import { createApiServer } from './server';

async function main(): Promise<void> {
  const config = loadConfig();
  const databaseConfig = loadDatabaseConfig();
  const postgres = await createPostgresResources(databaseConfig);
  const api = createApiServer(config, undefined, {
    readiness: async () => {
      try {
        return { ready: await checkPostgresReady(postgres.pool) };
      } catch {
        return { ready: false, reason: 'postgres_unavailable' };
      }
    },
    close: () => postgres.close(),
  });

  api.server.listen(config.port, '0.0.0.0', () => {
    console.log(JSON.stringify({
      severity: 'INFO',
      event: 'server_started',
      service: config.service,
      version: config.version,
      environment: config.environment,
      port: config.port,
    }));
  });

  let shutdownStarted = false;
  const handleSignal = async (signal: NodeJS.Signals) => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    console.log(JSON.stringify({ severity: 'INFO', event: 'shutdown_started', signal }));
    try {
      await api.shutdown();
      console.log(JSON.stringify({ severity: 'INFO', event: 'shutdown_completed' }));
      process.exitCode = 0;
    } catch (error) {
      console.error(JSON.stringify({
        severity: 'ERROR',
        event: 'shutdown_failed',
        error: error instanceof Error ? error.message : 'unknown',
      }));
      process.exitCode = 1;
    }
  };

  process.once('SIGTERM', () => void handleSignal('SIGTERM'));
  process.once('SIGINT', () => void handleSignal('SIGINT'));
}

void main().catch((error: unknown) => {
  console.error(JSON.stringify({
    severity: 'CRITICAL',
    event: 'startup_failed',
    error: error instanceof Error ? error.message : 'unknown',
  }));
  process.exitCode = 1;
});
