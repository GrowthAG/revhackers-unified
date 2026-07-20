#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const OPERATIONS = ['from', 'rpc', 'channel', 'storage', 'functions.invoke'];
const ENDPOINTS = ['/rest/v1', '/auth/v1', '/storage/v1', '/realtime/v1', '/functions/v1'];
const TEXT_EXTENSIONS = /(?:\.(?:[cm]?[jt]sx?|sql|toml|ya?ml|json|md|html|css)|(?:^|\/)Dockerfile)$/i;
const AUDIT_ARTIFACTS = new Set([
  'scripts/audit-supabase-dependencies.mjs',
  'tests/audit-supabase-dependencies.test.mjs',
  'docs/architecture/gcp-migration/supabase-dependency-baseline.json'
]);

function trackedFiles(root) {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return output.split('\0').filter(Boolean).sort();
}

function occurrences(text, regex, symbol, category, path, into) {
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const matches = lines[index].match(regex);
    if (matches?.length) into.push({ category, path, count: matches.length, line: index + 1, symbol });
  }
}

function addPresence(entries, category, path, symbol) {
  entries.push({ category, path, count: 1, line: 0, symbol });
}

export function scanRepository(root = process.cwd()) {
  root = resolve(root);
  const files = trackedFiles(root);
  const entries = [];
  const functionDirs = new Set();
  const configSections = new Set();

  for (const path of files) {
    if (AUDIT_ARTIFACTS.has(path)) continue;
    const full = resolve(root, path);
    if ((relative(root, full).startsWith(`..${sep}`)) || !existsSync(full) || !lstatSync(full).isFile()) continue;
    const dirMatch = path.match(/^supabase\/functions\/([^/]+)\//);
    if (dirMatch && dirMatch[1] !== '_shared') functionDirs.add(dirMatch[1]);
    if (!TEXT_EXTENSIONS.test(path)) continue;
    const text = readFileSync(full, 'utf8');

    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const names = lines[index].match(/\b(?:SUPABASE_[A-Z0-9_]+|VITE_SUPABASE_[A-Z0-9_]+)\b/g) || [];
      for (const name of [...new Set(names)].sort()) {
        entries.push({ category: 'environment-name', path, count: names.filter((item) => item === name).length, line: index + 1, symbol: name });
      }
    }
    occurrences(text, /(?:from\s+['"][^'"]*supabase[^'"]*['"]|require\s*\(\s*['"][^'"]*supabase[^'"]*['"]\s*\))/gi, 'supabase-import', 'import-or-wrapper', path, entries);
    occurrences(text, /\bcreateClient\s*\(/g, 'createClient', 'import-or-wrapper', path, entries);
    occurrences(text, /\.from\s*\(/g, 'from', 'operation', path, entries);
    occurrences(text, /\.rpc\s*\(/g, 'rpc', 'operation', path, entries);
    occurrences(text, /\.channel\s*\(/g, 'channel', 'operation', path, entries);
    occurrences(text, /\.storage\b/g, 'storage', 'operation', path, entries);
    occurrences(text, /\.functions\s*\.\s*invoke\s*\(/g, 'functions.invoke', 'operation', path, entries);
    for (const endpoint of ENDPOINTS) occurrences(text, new RegExp(endpoint.replace('/', '\\/'), 'g'), endpoint, 'endpoint', path, entries);

    if (path === 'supabase/config.toml') {
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^\s*\[functions\.([A-Za-z0-9_-]+)\]\s*$/);
        if (match) {
          configSections.add(match[1]);
          entries.push({ category: 'config-section', path, count: 1, line: i + 1, symbol: match[1] });
        }
      }
    }

    const related = path.startsWith('supabase/migrations/') ? 'migration'
      : path.startsWith('.github/workflows/') ? 'workflow'
      : path === 'scripts/prerender.js' ? 'prerender'
      : path.startsWith('scripts/') ? 'script' : null;
    if (related && (related === 'migration' || related === 'prerender' || /supabase/i.test(text))) addPresence(entries, `related-${related}`, path, related);
  }

  for (const name of [...functionDirs].sort()) addPresence(entries, 'deployable-function', `supabase/functions/${name}`, name);
  for (const name of [...functionDirs].filter((name) => !configSections.has(name)).sort()) addPresence(entries, 'function-without-config-section', `supabase/functions/${name}`, name);
  for (const name of [...configSections].filter((name) => !functionDirs.has(name)).sort()) addPresence(entries, 'orphan-config-section', 'supabase/config.toml', name);

  entries.sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path) || a.line - b.line || a.symbol.localeCompare(b.symbol));
  const totals = Object.fromEntries([...new Set(entries.map((entry) => entry.category))].sort().map((category) => [category, entries.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.count, 0)]));
  totals.entries = entries.length;
  totals.trackedFiles = files.filter((path) => !AUDIT_ARTIFACTS.has(path)).length;
  totals.deployableFunctions = functionDirs.size;
  totals.configFunctionSections = configSections.size;
  return { schemaVersion: 1, entries, totals };
}

export function serialize(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function main() {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf('--root');
  const outputIndex = args.indexOf('--output');
  const checkIndex = args.indexOf('--check');
  const root = rootIndex >= 0 ? args[rootIndex + 1] : process.cwd();
  const bytes = serialize(scanRepository(root));
  if (checkIndex >= 0) {
    const baseline = args[checkIndex + 1];
    if (!baseline || readFileSync(resolve(root, baseline), 'utf8') !== bytes) throw new Error('Supabase dependency baseline drift detected (metadata-only; no source values shown).');
  } else if (outputIndex >= 0) {
    writeFileSync(resolve(root, args[outputIndex + 1]), bytes);
  } else process.stdout.write(bytes);
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try { main(); } catch (error) {
    const drift = error instanceof Error && error.message.startsWith('Supabase dependency baseline drift');
    process.stderr.write(drift ? `${error.message}\n` : 'Supabase dependency audit failed (metadata-only; no source values shown).\n');
    process.exitCode = 1;
  }
}

export { ENDPOINTS, OPERATIONS };
