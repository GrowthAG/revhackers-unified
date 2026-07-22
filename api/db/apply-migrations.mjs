#!/usr/bin/env node
// Aplica migrations Cloud SQL via Node.js (pg driver)
// Uso: node apply-migrations.mjs
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __dir = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dir, 'migrations');

const PG_PASS = readFileSync('/tmp/.pg_migrator_env', 'utf8')
  .split('\n')
  .find(l => l.startsWith('PGPASSWORD='))
  ?.replace('PGPASSWORD=', '')
  .trim();

if (!PG_PASS) {
  console.error('Senha não encontrada em /tmp/.pg_migrator_env');
  process.exit(1);
}

const client = new Client({
  host: '34.39.242.211',
  port: 5432,
  database: 'revhackers',
  user: 'postgres',
  password: PG_PASS,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Conectado ao Cloud SQL revhackers-staging-pg');

  // Cria schema de controle de migrations se não existir
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS _migrations;
    CREATE TABLE IF NOT EXISTS _migrations.applied (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await client.query(
      'SELECT 1 FROM _migrations.applied WHERE name = $1',
      [file]
    );
    if (rows.length > 0) {
      console.log(`  [SKIP]  ${file} — já aplicado`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`  [APPLY] ${file}`);
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations.applied (name) VALUES ($1)',
        [file]
      );
      console.log(`  [DONE]  ${file}`);
    } catch (err) {
      console.error(`  [ERRO]  ${file}:`, err.message);
      process.exit(1);
    }
  }

  // Verifica tabelas criadas
  const { rows: tables } = await client.query(`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog','information_schema','pg_toast')
    ORDER BY schemaname, tablename;
  `);
  console.log('\nTabelas no banco:');
  tables.forEach(r => console.log(`  ${r.schemaname}.${r.tablename}`));

  await client.end();
  console.log('\nMigrations concluídas com sucesso.');
}

run().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
