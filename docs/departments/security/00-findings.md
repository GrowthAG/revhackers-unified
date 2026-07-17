# Auditoria contínua de segurança — reverificação

Data da revisão: 2026-07-17
Escopo: análise estática do conteúdo versionado no worktree atual. Não foram lidos `.env`, serviços remotos, histórico operacional nem configuração implantada. “Estado atual” abaixo significa o estado que resulta da ordem dos arquivos de migration no repositório; não confirma o estado do banco remoto.

## Resultado executivo

O levantamento quantitativo anterior foi reproduzido integralmente. Também foram confirmados os 39 diretórios implantáveis de Edge Functions, seis consumidores do helper compartilhado e dez funções sem seção explícita no `config.toml`.

Foram localizadas três credenciais JWT/bearer literais versionadas. Seus valores não foram lidos, copiados ou registrados neste relatório. A validade e o ambiente a que pertencem não são verificáveis estaticamente; por isso o achado é P0, mas não é classificado aqui como incidente ativo confirmado.

## Reverificação ponto a ponto

| Afirmação anterior | Resultado | Evidência e observação |
|---|---|---|
| 71 ativações de RLS | **Confirmado** | 71 ocorrências case-insensitive de `ENABLE ROW LEVEL SECURITY` nos 106 arquivos de `supabase/migrations/*.sql`; exemplos: `supabase/migrations/20260417000005_create_audit_logs.sql:14` e `supabase/migrations/20260317000000_create_ai_generation_jobs.sql:15`. |
| 179 `CREATE POLICY` | **Confirmado** | 179 ocorrências nas migrations. |
| 61 `USING (true)` | **Confirmado** | 61 ocorrências, tolerando espaços e caixa. Exemplos relevantes: `supabase/migrations/20251227000000_create_diagnostico_table.sql:43`, `supabase/migrations/20260314000000_create_rei_materials.sql:25` e `supabase/migrations/20260317000000_create_ai_generation_jobs.sql:19`. A contagem histórica inclui policies posteriormente removidas. |
| 32 `WITH CHECK (true)` | **Confirmado** | 32 ocorrências. Exemplos: `supabase/migrations/20251227000000_create_diagnostico_table.sql:36`, `supabase/migrations/20260314000000_create_rei_materials.sql:22` e `supabase/migrations/20260317000000_create_ai_generation_jobs.sql:22`. |
| 17 `SECURITY DEFINER` | **Confirmado com ressalva** | 17 ocorrências textuais; uma é comentário (`supabase/migrations/20260114000001_secure_proposals_rpc.sql:6`). Há 16 declarações executáveis. Apenas `get_proposal_by_slug` fixa `search_path` (`...secure_proposals_rpc.sql:10-11`). Não há `REVOKE EXECUTE ... FROM PUBLIC` nos arquivos que declaram essas funções. |
| 69 `auth.uid()` | **Confirmado** | 69 ocorrências nas migrations. |
| 32 `auth.role()` | **Confirmado** | 32 ocorrências nas migrations. |
| Uma migration histórica contém bearer literal | **Confirmado** | `supabase/migrations/20260303000002_cron_sync_meetings.sql:19`. O valor foi deliberadamente omitido. |
| `audit_logs` é criada e triggers posteriores são removidos | **Confirmado** | Criação e RLS em `supabase/migrations/20260417000005_create_audit_logs.sql:3-24`. Remoção do `audit_trigger` em `rei_projects`, `opportunities` e `orqflow_sprints` em `.../20260417000006_disable_audit_trigger.sql:1-7`; remoção adicional de `audit_rei_projects` em `.../20260417000007_drop_audit_rei_trigger.sql:1-4`. Não há migration posterior que recrie esses triggers. |
| 39 Edge Functions implantáveis | **Confirmado** | Existem 39 diretórios de primeiro nível (excluindo `_shared`), todos com `index.ts`. |
| Helper compartilhado usado por seis funções | **Confirmado** | Helper em `supabase/functions/_shared/require-role.ts:41-106`. Imports em `agent-documents/index.ts:4`, `ghl-create-location/index.ts:5`, `ghl-deploy-strategy/index.ts:5`, `ghl-oauth-callback/index.ts:5`, `ghl-oauth-refresh/index.ts:5` e `trigger-post-rei-enrichment/index.ts:4`. |
| Várias funções usam `SUPABASE_SERVICE_ROLE_KEY` | **Confirmado e quantificado** | 32 funções implantáveis referenciam a chave; 26 delas não importam o helper compartilhado. Exemplos: `agent-chat/index.ts:150`, `google-meetings/index.ts:14`, `infinitepay-webhook/index.ts:42`, `delete-user/index.ts:10`. `delete-user` e `invite-member` fazem validação equivalente local antes da elevação (`delete-user/index.ts:24-71`, `invite-member/index.ts:24-82`), portanto ausência do helper não equivale automaticamente a ausência de auth. |
| Há `verify_jwt=false` | **Confirmado** | `infinitepay-webhook`, `ghl-webhook-handoff` e `autentique-webhook`: `supabase/config.toml:61-74`. |
| Dez diretórios não têm seção explícita | **Confirmado** | `analyze-meeting-transcript`, `clickup-sync`, `clickup-update-docs-link`, `crux-benchmark`, `generate-image`, `ghl-inspect`, `google-meetings`, `process-meeting-audio`, `transcribe-meeting`, `trigger-post-rei-enrichment`. As seções existentes ficam em `supabase/config.toml:8-144`. |
| Roles `super_admin`, `admin`, `user` vêm de `profiles` | **Confirmado** | Tipo e leitura: `src/contexts/AuthContext.tsx:12`, `:31`, `:45-49`; gestão: `src/pages/admin/AdminUsers.tsx:51`, `:171-186`. |
| `ProtectedRoute` é navegação, não fronteira de dados | **Confirmado** | O componente só redireciona/renderiza no cliente (`src/components/auth/ProtectedRoute.tsx:10-40`); as rotas são envolvidas no frontend, por exemplo `src/App.tsx:239-299`. |

## Revisões específicas

### Policies amplas e isolamento por tenant

As 61/32 contagens são históricas, não a quantidade de policies amplas ainda efetivas. Foram observadas correções posteriores:

- A leitura pública ampla de `strategic_plans` criada em `20250101000000_create_strategic_plans.sql:76-81` é removida e substituída em `20260322000000_security_hardening.sql:6-24`.
- As policies públicas amplas originais de magic links (`20260319210000_create_magic_approval.sql:33-42`) são removidas em `20260322000000_security_hardening.sql:28-30`. Porém, a substituição ainda não compara o token da requisição: qualquer anônimo pode ler todo link não expirado e alterar qualquer link pendente (`:32-61`).
- A leitura pública de proposals é removida em `20260114000001_secure_proposals_rpc.sql:27-31`, mas qualquer usuário autenticado continua com `FOR ALL USING/WITH CHECK (true)` desde `20260112180000_fix_proposals_rls_final.sql:18-24`; não há isolamento por organização/tenant.
- `project_sprints` mantém leitura de todas as linhas por qualquer autenticado (`20260322000000_security_hardening.sql:85-88`).
- `ai_generation_jobs` permite leitura, inserção e atualização globais a qualquer autenticado (`20260317000000_create_ai_generation_jobs.sql:17-25`).
- `diagnostico` recebeu SELECT anônimo global (`20251227000000_create_diagnostico_table.sql:38-43`) e não foi localizada migration que remova essa policy. A tabela contém email e respostas (`:3-15`).

Há diversas tabelas antigas em que “authenticated” é tratado como “admin”, por exemplo `cases` (`20230101000001_update_cases_rls.sql:52-78`). Isso conflita com a existência explícita do role `user` e não constitui isolamento de tenant.

### `SECURITY DEFINER`

Das 16 declarações executáveis, somente `public.get_proposal_by_slug` define `SET search_path = public` (`20260114000001_secure_proposals_rpc.sql:7-18`). As demais não fixam um `search_path` seguro. Nenhum arquivo declarante revoga o EXECUTE padrão de `PUBLIC`.

Casos de maior exposição:

- `create_diagnostic_entry` é `SECURITY DEFINER` e explicitamente executável por `anon` (`20260322000001_fix_diagnostic_isolation.sql:12-22`, `:82`).
- `generate_strategic_plan` e `generate_revops_strategic_plan` são concedidas a todo `authenticated` (`20250101000000_create_strategic_plans.sql:99-228`; `20260308000001_create_revops_strategic_plan.sql:4-128`).
- Funções de conversão/handoff manipulam várias tabelas privilegiadas sem `search_path` fixo (`20260415115825_handoff_financial_fields.sql:11-21`, `:138-223`).
- `handle_new_user` também é definer sem `search_path` (`20241224000100_add_role.sql:26-33`).

Owner real e privilégios efetivos no banco implantado são **não verificáveis** pelo repositório. O repositório tampouco contém validação explícita de owner.

### Edge Functions e `service_role`

Há 32 funções com `SUPABASE_SERVICE_ROLE_KEY`; 26 não importam o helper canônico. A lista é:

`agent-chat`, `analyze-meeting-transcript`, `auto-enrich-project`, `clickup-notetaker-sync`, `clickup-orchestrator`, `clickup-provision`, `clickup-sprint-orchestrator`, `clickup-sync`, `clickup-update-docs-link`, `crux-benchmark`, `delete-user`, `enrich-strategic-data`, `generate-playbook`, `generate-project-tasks`, `generate-strategic-plan`, `generate-success-plan`, `ghl-outbound-relay`, `ghl-webhook-handoff`, `google-meetings`, `infinitepay-webhook`, `invite-member`, `market-intelligence`, `process-meeting-audio`, `research-intelligence`, `scrape-profile`, `transcribe-meeting`.

Isto é uma superfície de revisão, não uma afirmação de que as 26 estejam sem autenticação: `delete-user` e `invite-member`, por exemplo, validam JWT e role localmente. O risco é a inconsistência e a possibilidade de uma rota elevar antes de uma checagem completa. `google-meetings` cria cliente privilegiado em `index.ts:10-16` e persiste dados pessoais de reuniões em `:19-43`, sem consumir o helper.

### Credenciais literais versionadas

Confirmadas, sem registrar valores:

- `supabase/migrations/20260303000002_cron_sync_meetings.sql:19` — bearer/JWT literal.
- `scripts/update_tikpag.ts:5` — JWT literal.
- `scripts/verify_fix_node.ts:5` — JWT literal.

Não é possível afirmar validade, ambiente ou exploração atual sem consultar sistemas externos, o que não foi feito. Ainda assim, credencial versionada deve ser presumida comprometida até rotação e investigação.

### `handle_new_user`

A função é criada em `supabase/migrations/20241224000100_add_role.sql:26-33`, mas as únicas instruções encontradas para criar `on_auth_user_created` estão comentadas (`:35-39`). Não foi localizada outra criação do trigger. Portanto, o histórico versionado confirma função presente e trigger ausente/comentado. O estado remoto é **não verificável**.

### Dados pessoais e Storage

Sinalização estritamente técnica:

- `diagnostico` armazena nome, email e respostas (`20251227000000_create_diagnostico_table.sql:3-15`) com SELECT anônimo amplo (`:38-43`).
- O bucket `meet_videos` é público e possui policy pública de leitura (`20260323000001_video_recordings.sql:10-11`, `:26`).
- `[BUCKET_TASK_ATTACHMENTS]` é marcado público (`20260321999999_create_task_attachments_bucket.sql:2-3`), apesar de policies SQL nomeadas como autenticadas.
- `rei-materials` é criado público (`20260314000000_create_rei_materials.sql:30-32`); as escritas foram endurecidas depois (`20260329000000_storage_security_hardening.sql:28-50`), mas a publicidade do bucket não é revertida.
- O webhook de pagamento registra o payload completo (`supabase/functions/infinitepay-webhook/index.ts:29`), podendo enviar dados pessoais/financeiros ao provedor de logs.
- `delete-user` e `invite-member` registram IDs/emails/roles (`supabase/functions/delete-user/index.ts:75`, `supabase/functions/invite-member/index.ts:88-90`).

Não foi localizada criptografia em nível de aplicação/coluna para esses dados. Criptografia efetiva de infraestrutura é **não verificável** estaticamente.

## Divergências e limites

- Nenhuma divergência quantitativa foi encontrada.
- A contagem de 17 `SECURITY DEFINER` inclui uma ocorrência em comentário; são 16 declarações SQL efetivas.
- “Implantada”, “owner atual”, grants efetivos, validade de credenciais e estado real de triggers/policies não podem ser confirmados sem acesso remoto, deliberadamente não utilizado.
