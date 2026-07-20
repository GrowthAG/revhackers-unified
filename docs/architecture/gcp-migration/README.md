# Auditoria de migração Supabase → Google Cloud

## Status

Auditoria local e planejamento concluídos sobre a base `5acc0ede44fd29f1806a9f0c5d4214db07725c88`. Nenhum handoff, provisioning, deploy, acesso a produção, leitura de segredo, exportação ou mudança em código da aplicação foi realizado.

## Como ler

- **Fato verificado:** observado no repositório recuperado.
- **Inferência:** hipótese técnica que precisa de validação.
- **Pergunta aberta/entrada não verificada:** bloqueia decisão ou sizing.
- **Recomendação provisória:** direção para discussão, sem autoridade de implantação.

## Documentos

1. [00-current-state.md](./00-current-state.md) — runtime, build, deploy e inventário Supabase/Auth/RLS/Storage/Realtime/RPC/cron/Edge Functions.
2. [01-options-and-decision-matrix.md](./01-options-and-decision-matrix.md) — três opções, trade-offs e recomendação provisória.
3. [02-target-architecture.md](./02-target-architecture.md) — trust boundaries, fluxos e componentes candidatos.
4. [03-auth-and-tenant-isolation.md](./03-auth-and-tenant-isolation.md) — Auth/RLS atuais, substituição segura e testes negativos.
5. [04-migration-runbook.md](./04-migration-runbook.md) — descoberta, POC, staging, rehearsals, cutover, reconciliação e rollback.
6. [05-security-cost-observability.md](./05-security-cost-observability.md) — threat model, secrets, IAM, logs, recovery, custos e budget controls.
7. [06-approved-direction.md](./06-approved-direction.md) — decisão final de migrar integralmente para Google Cloud e critérios para extinguir o Supabase.
8. [07-gcp-project-topology.md](./07-gcp-project-topology.md) — separação `dev`/`staging`/`prod`, IAM, rede, CI/CD, budgets e DNS.
9. [08-edge-functions-mapping.md](./08-edge-functions-mapping.md) — destino proposto e gates individuais para as 31 Edge Functions versionadas.
10. [09-migration-backlog.md](./09-migration-backlog.md) — backlog ordenado em 13 épicos, com dependências, evidências e checkpoints humanos.
11. [10-supabase-decommission-checklist.md](./10-supabase-decommission-checklist.md) — critérios objetivos de zero runtime, retenção e exclusão final.
12. [11-first-developer-task.md](./11-first-developer-task.md) — primeira tarefa local segura para automatizar o inventário de dependências Supabase.

## Fatos principais verificados

- Aplicação principal React/Vite na raiz; experimento separado fora do build.
- Backend atual depende de Supabase Postgres/PostgREST, Auth, Storage, Realtime, RPCs, cron e Edge Functions.
- 106 migrações SQL e 32 diretórios de funções, sendo 31 implantáveis e um compartilhado no estado versionado atual.
- O navegador usa Supabase diretamente em uma superfície ampla; Cloud SQL não pode substituir esse endpoint sem API server-side.
- Migrações e tipos gerados divergem; não há snapshot local confiável do schema efetivo.
- O repositório não prova um tenant boundary uniforme nem contém testes cross-tenant.
- Há uma credencial bearer literal em migração histórica; o valor não é reproduzido.
- O build/prerender pode consultar o Supabase definido no ambiente.
- Deploy versionado usa build estático e FTP; o README identifica Hostinger como produção atual.

## Decisões

### Aprovadas

- Google Cloud é o destino final da infraestrutura do RevHackers.
- O Supabase será completamente removido do runtime após cutover e estabilização.
- A execução será incremental, com coexistência somente durante a migração.
- O navegador nunca acessará Cloud SQL diretamente.

Serviços específicos, região, sizing, orçamento e calendário ainda dependem de decisão e checkpoint próprios.

### Regras já impostas pelo perfil

- navegador nunca conecta ao Cloud SQL;
- Supabase permanece até substituto testado e rollback existir;
- Auth/RLS/Storage/Realtime/RPC/cron/triggers/funções precisam de inventário antes de estimativa;
- fatos operacionais não são inventados;
- produção, billing, infra, secrets, deploy, DNS e ações irreversíveis dependem de Giulliano.

## Estratégia aprovada

Migrar integralmente para Google Cloud por etapas. No curto prazo, o Supabase permanece operacional apenas como origem e fallback temporário. Uma API server-side deve reduzir o acoplamento do frontend e permitir substituir cada domínio com dados sintéticos, staging, reconciliação e rollback. Cloud SQL e substitutos de Auth, Storage e Realtime entram somente após métricas, modelo de tenant, testes, custo, restore e rehearsals.

Big-bang e acesso direto do browser ao banco estão fora da recomendação.

## Riscos prioritários

1. Ausência de schema efetivo reconciliado e drift migrações/tipos.
2. Tenant isolation não comprovado; políticas amplas aparecem no histórico.
3. Edge Functions com service role e controles de entrada heterogêneos.
4. Credencial literal no histórico e logging potencial de payload sensível.
5. Build com possível dependência de dados remotos do ambiente configurado.
6. Storage público/privado e URLs persistidas ainda não inventariados operacionalmente.
7. Auth, cron, Realtime, triggers e auditoria efetivos podem divergir do Git.
8. Nenhuma evidência de restore, rollback ou reconciliação em escala real.

## Perguntas abertas bloqueantes

- Qual prazo e critério de sucesso serão usados para a migração já aprovada?
- Qual é a unidade canônica de tenant e a matriz de papéis?
- Qual o schema/configuração efetivos por ambiente?
- Quais volume, tamanho, crescimento, tráfego, conexões, latência e custos reais?
- Quais SLA, RTO, RPO, residência, LGPD e retenção?
- Auth permanece Supabase na primeira fase?
- Quais região, HA e orçamento são aceitáveis?
- Como `develop` e `main` se relacionam a ambientes/destinos de deploy?
- Quais links públicos, buckets e fluxos Realtime são requisitos de negócio?

## Próximo checkpoint

A direção, a topologia lógica e a primeira tarefa local estão documentadas. O próximo gate é executar a auditoria metadata-only com o perfil Developer restrito, revisar independentemente o diff e então decidir o primeiro domínio piloto. Modelo de tenant, provedor de identidade, região, serviços, IaC, sizing e orçamento continuam pendentes. Isso não substitui os checkpoints separados para recursos pagos, produção, secrets, deploy, DNS, cutover ou decommission.
