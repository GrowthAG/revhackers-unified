/**
 * test-provision-preview.ts
 *
 * Script de preview: mostra o que o clickup-provision criaria
 * para cada combinacao tipo x duracao, sem chamar nenhuma API.
 *
 * Rodar com: npx tsx supabase/functions/clickup-provision/test-provision-preview.ts
 */

// Importa usando path relativo (pra rodar fora do Deno)
import { getProjectTemplate } from './task-templates.ts';
import type { ProjectType, DurationDays } from './task-templates.ts';

const VALID_COMBINATIONS: [ProjectType, DurationDays][] = [
  ['consulting', 30],
  ['consulting', 60],
  ['consulting', 90],
  ['consulting', 180],
  ['consulting', 360],
  ['site', 30],
  ['site', 60],
  ['linkedin', 90],
  ['linkedin', 180],
  ['linkedin', 360],
  ['crm_ops', 30],
  ['crm_ops', 60],
  ['crm_ops', 90],
];

console.log('='.repeat(80));
console.log('CLICKUP PROVISION — Preview de Templates');
console.log('='.repeat(80));
console.log('');

// Mostra detalhe completo de 1 exemplo
const EXAMPLE_TYPE: ProjectType = 'consulting';
const EXAMPLE_DURATION: DurationDays = 90;

console.log(`\n${'━'.repeat(80)}`);
console.log(`EXEMPLO COMPLETO: ${EXAMPLE_TYPE.toUpperCase()} × ${EXAMPLE_DURATION} dias`);
console.log(`${'━'.repeat(80)}`);

const example = getProjectTemplate(EXAMPLE_TYPE, EXAMPLE_DURATION);
console.log(`  Tipo: ${example.type}`);
console.log(`  Duração: ${example.duration_days} dias`);
console.log(`  Tier: ${example.tier}`);
console.log(`  Sprints: ${example.sprint_count}`);
console.log('');

for (const sprint of example.sprints) {
  console.log(`  📋 Sprint ${sprint.index}: ${sprint.theme}`);
  console.log(`     Goal: ${sprint.goal}`);
  console.log(`     Tasks (${sprint.tasks.length}):`);
  for (const task of sprint.tasks) {
    const priorityEmoji = ['', '🔴', '🟠', '🟡', '🟢'][task.priority];
    console.log(`       ${priorityEmoji} ${task.name} [${task.tag}]`);
  }
  console.log('');
}

// Tabela resumo de todas as combinacoes
console.log(`\n${'━'.repeat(80)}`);
console.log('RESUMO — Todas as combinações tipo × duração');
console.log(`${'━'.repeat(80)}`);
console.log('');
console.log(
  '  Tipo'.padEnd(16) +
  'Duração'.padEnd(10) +
  'Tier'.padEnd(8) +
  'Sprints'.padEnd(10) +
  'Tasks Total'.padEnd(14) +
  'Avg/Sprint'
);
console.log('  ' + '─'.repeat(62));

for (const [type, duration] of VALID_COMBINATIONS) {
  const tmpl = getProjectTemplate(type, duration);
  const totalTasks = tmpl.sprints.reduce((sum, s) => sum + s.tasks.length, 0);
  const avg = (totalTasks / tmpl.sprint_count).toFixed(1);

  console.log(
    `  ${type.padEnd(14)}${String(duration + 'd').padEnd(10)}${tmpl.tier.padEnd(8)}${String(tmpl.sprint_count).padEnd(10)}${String(totalTasks).padEnd(14)}${avg}`
  );
}

console.log('');
console.log('='.repeat(80));
console.log('Preview concluido. Nenhuma chamada de API foi feita.');
console.log('='.repeat(80));
