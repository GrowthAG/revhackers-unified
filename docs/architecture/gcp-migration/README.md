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

## Fatos principais verificados

- Aplicação principal React/Vite na raiz; experimento separado fora do build.
- Backend atual depende de Supabase Postgres/PostgREST, Auth, Storage, Realtime, RPCs, cron e Edge Functions.
- 106 migrações SQL e 40 diretórios de funções, sendo 39 implantáveis e um compartilhado.
- O navegador usa Supabase diretamente em uma superfície ampla; Cloud SQL não pode substituir esse endpoint sem API server-side.
- Migrações e tipos gerados divergem; não há snapshot local confiável do schema efetivo.
- O repositório não prova um tenant boundary uniforme nem contém testes cross-tenant.
- Há uma credencial bearer literal em migração histórica; o valor não é reproduzido.
- O build/prerender pode consultar o Supabase definido no ambiente.
- Deploy versionado usa build estático e FTP; o README identifica Hostinger como produção atual.

## Decisões

### Aprovadas

Nenhuma decisão de arquitetura ou migração foi aprovada nesta auditoria.

### Regras já impostas pelo perfil

- navegador nunca conecta ao Cloud SQL;
- Supabase permanece até substituto testado e rollback existir;
- Auth/RLS/Storage/Realtime/RPC/cron/triggers/funções precisam de inventário antes de estimativa;
- fatos operacionais não são inventados;
- produção, billing, infra, secrets, deploy, DNS e ações irreversíveis dependem de Giulliano.

## Recomendação provisória

Manter e endurecer Supabase no curto prazo; em paralelo, avaliar migração incremental por uma API server-side usando dados sintéticos e um domínio de baixo risco. A API pode primeiro encapsular Supabase, reduzindo o acoplamento do frontend. Cloud SQL e substitutos de Auth/Storage/Realtime somente entram após métricas, modelo de tenant, testes, custo, restore e rehearsals.

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

- Qual problema de negócio, prazo e critério de sucesso justificam a migração?
- Qual é a unidade canônica de tenant e a matriz de papéis?
- Qual o schema/configuração efetivos por ambiente?
- Quais volume, tamanho, crescimento, tráfego, conexões, latência e custos reais?
- Quais SLA, RTO, RPO, residência, LGPD e retenção?
- Auth permanece Supabase na primeira fase?
- Quais região, HA e orçamento são aceitáveis?
- Como `develop` e `main` se relacionam a ambientes/destinos de deploy?
- Quais links públicos, buckets e fluxos Realtime são requisitos de negócio?

## Próximo checkpoint

Parar após esta documentação. Antes de qualquer especificação ao Developer, Giulliano deve revisar e aprovar a direção. Aprovação arquitetural futura não substitui os checkpoints separados para recursos pagos, produção, secrets, deploy, DNS ou cutover.
