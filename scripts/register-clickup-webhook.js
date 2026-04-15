/**
 * register-clickup-webhook.js
 *
 * Registra a Edge Function clickup-sync como webhook no ClickUp.
 * Roda UMA VEZ apos o deploy da funcao.
 *
 * Pre-requisitos:
 *   1. clickup-sync deployada no Supabase
 *   2. CLICKUP_WEBHOOK_SECRET configurado nos secrets do Supabase
 *   3. WORKSPACE_ID correto (Settings > My Workspace > Team ID)
 *
 * Uso:
 *   node scripts/register-clickup-webhook.js
 *
 * Para listar webhooks existentes:
 *   node scripts/register-clickup-webhook.js --list
 *
 * Para deletar um webhook:
 *   node scripts/register-clickup-webhook.js --delete <webhook_id>
 */

const API_KEY     = process.env.CLICKUP_API_KEY || 'pk_84197570_GYIBMGTI4Z9MCTUUVG6T8THHO6YJR0BB';
const WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID || '';   // preencher
const SUPABASE_FUNCTION_URL = process.env.CLICKUP_SYNC_URL || ''; // preencher: https://<project>.supabase.co/functions/v1/clickup-sync
const BASE = 'https://api.clickup.com/api/v2';

// Eventos que o Hub quer receber do ClickUp
const EVENTS = [
  'taskCreated',
  'taskUpdated',
  'taskStatusUpdated',
  'taskDeleted',
  'folderDeleted',
];

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp ${method} ${path} => ${res.status}: ${text}`);
  }

  return res.json();
}

async function listWebhooks() {
  if (!WORKSPACE_ID) {
    console.error('CLICKUP_WORKSPACE_ID nao configurado. Defina a variavel de ambiente ou edite o script.');
    process.exit(1);
  }

  console.log(`\nListando webhooks do workspace ${WORKSPACE_ID}...\n`);
  const data = await api('GET', `/team/${WORKSPACE_ID}/webhook`);
  const webhooks = data.webhooks || [];

  if (webhooks.length === 0) {
    console.log('Nenhum webhook registrado.');
    return;
  }

  for (const wh of webhooks) {
    console.log(`ID:      ${wh.id}`);
    console.log(`URL:     ${wh.endpoint}`);
    console.log(`Status:  ${wh.health?.status || 'unknown'}`);
    console.log(`Eventos: ${(wh.events || []).join(', ')}`);
    console.log(`Falhas:  ${wh.health?.fail_count || 0}`);
    console.log('---');
  }
}

async function deleteWebhook(webhookId) {
  console.log(`\nDeletando webhook ${webhookId}...`);
  await api('DELETE', `/webhook/${webhookId}`);
  console.log('Webhook deletado com sucesso.');
}

async function registerWebhook() {
  if (!WORKSPACE_ID) {
    console.error('CLICKUP_WORKSPACE_ID nao configurado. Defina a variavel de ambiente ou edite o script.');
    process.exit(1);
  }

  if (!SUPABASE_FUNCTION_URL) {
    console.error('CLICKUP_SYNC_URL nao configurado. Defina a variavel de ambiente ou edite o script.');
    console.error('Exemplo: https://xyzxyzxyz.supabase.co/functions/v1/clickup-sync');
    process.exit(1);
  }

  console.log(`\nRegistrando webhook no workspace ${WORKSPACE_ID}...`);
  console.log(`URL: ${SUPABASE_FUNCTION_URL}`);
  console.log(`Eventos: ${EVENTS.join(', ')}\n`);

  // 1. Verificar se ja existe webhook para essa URL (evita duplicatas)
  const existing = await api('GET', `/team/${WORKSPACE_ID}/webhook`);
  const alreadyExists = (existing.webhooks || []).find(
    (wh) => wh.endpoint === SUPABASE_FUNCTION_URL
  );

  if (alreadyExists) {
    console.log(`Webhook ja existe para esta URL:`);
    console.log(`  ID:     ${alreadyExists.id}`);
    console.log(`  Status: ${alreadyExists.health?.status || 'unknown'}`);
    console.log(`  Falhas: ${alreadyExists.health?.fail_count || 0}`);
    console.log('\nNenhuma acao necessaria. Para recriar, delete primeiro com --delete <id>.');
    return;
  }

  // 2. Registrar webhook
  const payload = {
    endpoint: SUPABASE_FUNCTION_URL,
    events: EVENTS,
  };

  const result = await api('POST', `/team/${WORKSPACE_ID}/webhook`, payload);
  const webhook = result.webhook;

  console.log('Webhook registrado com sucesso!');
  console.log('');
  console.log(`ID do webhook: ${webhook.id}`);
  console.log(`Secret:        ${webhook.secret || '(nao retornado - consulte CLICKUP_WEBHOOK_SECRET)'}`);
  console.log('');
  console.log('Proximos passos:');
  console.log('  1. Copie o "secret" acima e salve no Supabase como CLICKUP_WEBHOOK_SECRET');
  console.log('  2. Atualize a tabela clickup_config com o webhook_secret');
  console.log('  3. Teste enviando um evento de teste via ClickUp ou forcando um update de task');
  console.log('');
  console.log('Para verificar saude do webhook: node scripts/register-clickup-webhook.js --list');
}

// -- Entry point --

const args = process.argv.slice(2);

if (args[0] === '--list') {
  listWebhooks().catch((err) => {
    console.error('Erro:', err.message);
    process.exit(1);
  });
} else if (args[0] === '--delete') {
  const webhookId = args[1];
  if (!webhookId) {
    console.error('Uso: node scripts/register-clickup-webhook.js --delete <webhook_id>');
    process.exit(1);
  }
  deleteWebhook(webhookId).catch((err) => {
    console.error('Erro:', err.message);
    process.exit(1);
  });
} else {
  registerWebhook().catch((err) => {
    console.error('Erro ao registrar webhook:', err.message);
    process.exit(1);
  });
}
