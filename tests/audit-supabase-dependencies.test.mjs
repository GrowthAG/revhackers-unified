// @vitest-environment node

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';
import { scanRepository, serialize } from '../scripts/audit-supabase-dependencies.mjs';

const scanner = resolve('scripts/audit-supabase-dependencies.mjs');
const sentinel = 'AUDIT_SECRET_SENTINEL_7f9e';
const envSentinel = 'AUDIT_ENV_SECRET_SENTINEL_2c41';
const ignoredSentinel = 'AUDIT_IGNORED_SECRET_SENTINEL_8bd3';
const urlSentinel = `https://${sentinel}.supabase.co/rest/v1?apikey=${sentinel}`;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'supabase-audit-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  execFileSync('git', ['add', '.'], { cwd: root });
  return root;
}

test('presence, absence, duplicates and deterministic ordering', () => {
  const root = fixture({
    'z.ts': `const key = 'SUPABASE_URL'; client.from('${sentinel}'); client.from('${sentinel}')`,
    'a.ts': 'plain text',
    'supabase/functions/b/index.ts': 'client.rpc("hidden")',
    'supabase/functions/a/index.ts': 'client.channel("hidden")',
    'supabase/config.toml': '[functions.a]\nverify_jwt = true\n[functions.orphan]\n'
  });
  const report = scanRepository(root);
  assert.equal(report.totals.deployableFunctions, 2);
  assert.equal(report.entries.some((entry) => entry.path === 'a.ts'), false);
  assert.equal(report.entries.find((entry) => entry.category === 'operation' && entry.symbol === 'from').count, 2);
  assert.deepEqual(report.entries, [...report.entries].sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path) || a.line - b.line || a.symbol.localeCompare(b.symbol)));
  assert.equal(serialize(report).includes(sentinel), false);
  assert.equal(report.entries.some((entry) => entry.category === 'function-without-config-section' && entry.symbol === 'b'), true);
  assert.equal(report.entries.some((entry) => entry.category === 'orphan-config-section' && entry.symbol === 'orphan'), true);
});

test('.env and other gitignored files are neither enumerated nor leaked', () => {
  const root = fixture({
    '.gitignore': '.env\nignored-secret.ts\n',
    '.env': `SUPABASE_URL=${envSentinel}\n`,
    'ignored-secret.ts': `client.from('${ignoredSentinel}')`,
    'tracked.ts': 'const tracked = true;\n'
  });
  const report = scanRepository(root);
  const json = serialize(report);
  const result = spawnSync(process.execPath, [scanner, '--root', root], { encoding: 'utf8' });

  assert.equal(result.status, 0);
  assert.equal(report.totals.trackedFiles, 2);
  assert.equal(report.entries.some((entry) => entry.path === '.env' || entry.path === 'ignored-secret.ts'), false);
  for (const secret of [envSentinel, ignoredSentinel]) {
    assert.equal(json.includes(secret), false);
    assert.equal(`${result.stdout}${result.stderr}`.includes(secret), false);
  }
});

test('tracked sentinel URL is redacted while permitted metadata-only symbols remain', () => {
  const root = fixture({
    'tracked.ts': `const SUPABASE_URL = '${urlSentinel}';\n`
  });
  const report = scanRepository(root);
  const json = serialize(report);
  const result = spawnSync(process.execPath, [scanner, '--root', root], { encoding: 'utf8' });

  assert.equal(result.status, 0);
  assert.equal(json.includes(urlSentinel), false);
  assert.equal(result.stdout.includes(urlSentinel), false);
  assert.equal(result.stderr.includes(urlSentinel), false);
  assert.deepEqual(report.entries.map(({ category, symbol }) => ({ category, symbol })), [
    { category: 'endpoint', symbol: '/rest/v1' },
    { category: 'environment-name', symbol: 'SUPABASE_URL' }
  ]);
  assert.deepEqual(JSON.parse(result.stdout).entries.map(({ category, symbol }) => ({ category, symbol })), [
    { category: 'endpoint', symbol: '/rest/v1' },
    { category: 'environment-name', symbol: 'SUPABASE_URL' }
  ]);
});

test('two executions are byte-identical and never emit sentinel', () => {
  const root = fixture({ 'x.ts': `client.functions.invoke('${sentinel}')` });
  const one = spawnSync(process.execPath, [scanner, '--root', root], { encoding: 'utf8' });
  const two = spawnSync(process.execPath, [scanner, '--root', root], { encoding: 'utf8' });
  assert.equal(one.status, 0);
  assert.equal(one.stdout, two.stdout);
  assert.equal(`${one.stdout}${one.stderr}${two.stdout}${two.stderr}`.includes(sentinel), false);
});

test('baseline drift fails with metadata-only output, including failure with secret', () => {
  const root = fixture({ 'x.ts': `client.from('${sentinel}')`, 'baseline.json': '{}\n' });
  const result = spawnSync(process.execPath, [scanner, '--root', root, '--check', 'baseline.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /metadata-only/);
  assert.equal(`${result.stdout}${result.stderr}`.includes(sentinel), false);
});

test('current baseline has 39 functions and autentique-webhook orphan', () => {
  const report = scanRepository(resolve('.'));
  assert.equal(report.totals.deployableFunctions, 39);
  assert.equal(report.entries.some((entry) => entry.category === 'orphan-config-section' && entry.symbol === 'autentique-webhook'), true);
});
