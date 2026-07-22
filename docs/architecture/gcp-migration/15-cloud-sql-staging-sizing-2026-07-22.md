# Gate de custo e sizing — Cloud SQL staging (2026-07-22)

## Estado verificado

- Projeto: `revhackers-staging` (`254666331430`), organização `638201389343`.
- Billing ativo: `billingAccounts/016669-43980E-F06832`.
- Região fundacional já usada: `southamerica-east1` (São Paulo).
- Nenhuma instância Cloud SQL existente.
- APIs habilitadas nesta sessão: Cloud Billing, Cloud SQL Admin e Identity Toolkit.
- Conta executora: `giulliano@usefunnels.io`, papel `roles/owner` no staging.

## Proposta para o primeiro piloto

Somente staging, sem cliente real no primeiro ciclo:

| Item | Valor proposto | Motivo |
|---|---|---|
| Instância | `revhackers-staging-pg` | Nome inequívoco por ambiente |
| Engine | PostgreSQL 16 | Versão suportada e moderna; validar extensões antes da carga |
| Região | `southamerica-east1` | Mesma região de Artifact Registry/Cloud Run já aprovada |
| Disponibilidade | Zonal | Staging; HA regional fica para sizing de produção |
| Tier | `db-f1-micro` (shared-core, 614.4 MiB) | Menor custo para piloto/contratos; não usar em produção |
| Storage | 10 GiB HDD (low cost) | Mínimo suficiente para schema + fixtures sintéticas |
| Backup | Automático; PITR para ensaiar restore | Restore é gate da migração, não opcional |
| Auth DB | IAM DB Authentication | Sem senha estática; workload identity Cloud Run |
| Rede inicial | Public IP + Cloud SQL Connector obrigatório | Túnel TLS/IAM, sem authorized networks; Private IP será gate de produção |
| Deletion protection | Ativa | Evita exclusão acidental; desativar explicitamente para teardown |
| Pool Cloud Run | Máximo 5 conexões por instância | Protege shared-core; código já limita via `DB_POOL_MAX` |

## Custo oficial consultado

Fonte: Cloud Billing Catalog API, serviço `Cloud SQL` (`9662-B51E-5089`),
`currencyCode=BRL`, SKUs com região `southamerica-east1`, consultado em
2026-07-22. Valores podem mudar; recalcular antes de produção.

| SKU | Preço oficial | Estimativa mensal |
|---|---:|---:|
| PostgreSQL Zonal — Micro instance — São Paulo | R$ 0,093005655/h | R$ 67,89 (730 h) |
| PostgreSQL Zonal — Low cost storage — São Paulo | R$ 0,794668573/GiB-mês | R$ 7,95 (10 GiB) |
| Backups — São Paulo | R$ 0,706372065/GiB-mês | até R$ 7,06 se 10 GiB forem faturados |

**Base mensal compute + 10 GiB:** aproximadamente **R$ 75,84/mês**.
**Conservador com 10 GiB de backup faturado:** aproximadamente **R$ 82,90/mês**.

Não incluídos: impostos, egress eventual, Cloud Logging excedente, armazenamento
de WAL/PITR acima da estimativa e aumento automático de disco. Nenhum custo foi
criado até a aprovação deste gate.

## IAM planejado

1. Service account dedicada `revhackers-api-staging`.
2. Somente `roles/cloudsql.client` e `roles/cloudsql.instanceUser` para conexão.
3. Usuário PostgreSQL IAM correspondente, sem senha.
4. Cloud Run usa essa service account; não usa chave JSON.
5. Papel de runtime no banco não é owner/superuser/BYPASSRLS.
6. Papel de migration separado, usado apenas no pipeline/checkpoint.

## Sequência após aprovação

1. Criar service account e grants mínimos.
2. Criar Cloud SQL com IAM auth e connector enforcement.
3. Criar database `revhackers` e usuário IAM.
4. Aplicar `api/db/migrations/0001_growthmap.sql` com papel de migration.
5. Inserir somente fixture sintética no `project_tenant_registry`.
6. Build da imagem no Cloud Build/Artifact Registry.
7. Deploy Cloud Run privado primeiro; smoke por identidade autorizada.
8. Testar RLS com dois tenants, backup/restore e teardown/rollback.

## Gate humano

Criar a instância inicia cobrança recorrente estimada acima. Exige aprovação
explícita de Giulliano antes do comando `gcloud sql instances create`.
