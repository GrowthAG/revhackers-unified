# Backlog priorizado de segurança

Prioridade considera impacto, explorabilidade e alcance no estado inferido pelas migrations. Nenhuma correção foi implementada.

## P0

### P0-01 — Revogar e investigar credenciais JWT/bearer versionadas

**Risco:** credenciais copiadas do Git podem permitir chamada privilegiada enquanto forem válidas.
**Evidência:** `supabase/migrations/20260303000002_cron_sync_meetings.sql:19`; `scripts/update_tikpag.ts:5`; `scripts/verify_fix_node.ts:5`. Valores omitidos.
**Cenário de exploração:** alguém com acesso ao repositório recupera o literal e o usa contra o endpoint correspondente para agir com os privilégios codificados no JWT.
**Recomendação:** presumir comprometimento; identificar emissores/audiência sem divulgar o valor, revogar/rotacionar, revisar logs desde a primeira exposição, remover os literais em mudança separada e aplicar secret scanning preventivo. Não reutilizar a credencial.

### P0-02 — Vincular magic links ao token apresentado

**Risco:** a policy “endurecida” permite a qualquer anônimo ler todos os links não expirados e atualizar qualquer link pendente, sem comparar o token da requisição. O trigger definer propaga a alteração para tarefas.
**Evidência:** `supabase/migrations/20260322000000_security_hardening.sql:28-61`; trigger em `supabase/migrations/20260321000001_magic_links_audit_columns.sql:59-73`.
**Cenário de exploração:** atacante anônimo enumera links ainda válidos, escolhe um registro pendente e muda seu status para aprovado/rejeitado; o trigger privilegiado muda o estado da tarefa associada.
**Recomendação:** retirar acesso direto anônimo à tabela; expor RPC/Edge Function mínima que compare token exato, validade, status e operação permitida, com uso único/atomicidade. Fixar `search_path`, revogar EXECUTE de `PUBLIC` e conceder somente ao papel necessário.

### P0-03 — Remover leitura anônima global de diagnósticos pessoais

**Risco:** nome, email, empresa, respostas e resultados ficam enumeráveis via API pública.
**Evidência:** colunas em `supabase/migrations/20251227000000_create_diagnostico_table.sql:3-15`; policy em `:38-43`; índices de email em `:52-53`.
**Cenário de exploração:** cliente anônimo consulta a tabela sem filtro e coleta leads e respostas de todos os respondentes.
**Recomendação:** remover SELECT anônimo da tabela, retornar apenas um resultado mínimo por token opaco/expirável via RPC e separar dados de contato do resultado público.

## P1

### P1-01 — Aplicar isolamento por tenant nas policies `authenticated = true`

**Risco:** qualquer usuário autenticado, inclusive role `user`, pode ler ou alterar dados de outros clientes/organizações.
**Evidência:** proposals `supabase/migrations/20260112180000_fix_proposals_rls_final.sql:18-24`; AI jobs `supabase/migrations/20260317000000_create_ai_generation_jobs.sql:17-25`; sprints `supabase/migrations/20260322000000_security_hardening.sql:85-88`; cases `supabase/migrations/20230101000001_update_cases_rls.sql:52-78`.
**Cenário de exploração:** usuário de um cliente usa o SDK/API diretamente, ignora `ProtectedRoute` e enumera ou modifica linhas pertencentes a outro tenant.
**Recomendação:** definir ownership organizacional canônico e exigir `organization_id`/membership em `USING` e `WITH CHECK`; separar leitura e mutações; reservar administração a role verificado no banco.

### P1-02 — Endurecer todas as funções `SECURITY DEFINER`

**Risco:** 15 das 16 funções efetivas não fixam `search_path`; ausência de revogação explícita deixa risco de execução por roles não pretendidos e resolução insegura de objetos. Owner efetivo não é verificável.
**Evidência:** conjunto em `supabase/migrations/20241224000100_add_role.sql:26-33`, `20250101000000_create_strategic_plans.sql:99-228`, `20260308000001_create_revops_strategic_plan.sql:4-128`, `20260415115825_handoff_financial_fields.sql:11-21`. Única exceção observada: `20260114000001_secure_proposals_rpc.sql:7-18`.
**Cenário de exploração:** caller com EXECUTE aciona função privilegiada além de seu tenant; em configuração de schemas graváveis, resolução de nome não qualificado pode alcançar objeto controlado por atacante.
**Recomendação:** inventariar owner/grants no ambiente, usar owner dedicado sem login, `SET search_path = pg_catalog, public` (ou vazio com nomes totalmente qualificados), `REVOKE ALL ... FROM PUBLIC`, grants mínimos e validação interna de caller/tenant.

### P1-03 — Padronizar autenticação antes de elevar a `service_role`

**Risco:** 26 funções privilegiadas não usam o helper canônico; controles duplicados podem divergir ou deixar rotas sem validação.
**Evidência:** helper `supabase/functions/_shared/require-role.ts:41-106`; exemplos sem helper em `agent-chat/index.ts:150`, `google-meetings/index.ts:10-16`, `process-meeting-audio/index.ts:51`, `transcribe-meeting/index.ts:31`.
**Cenário de exploração:** endpoint acessível aceita payload/identificador controlado e executa leitura ou escrita com bypass total de RLS antes de confirmar identidade, role e tenant.
**Recomendação:** exigir o helper (ou middleware equivalente revisado) em toda rota humana; autenticar assinatura/segredo e replay em webhooks; elevar somente após autorização e limitar consultas pelo tenant validado. Testar cada uma das 26 funções negativamente.

### P1-04 — Tornar gravações e anexos privados por padrão

**Risco:** URLs de objetos podem expor gravações de reuniões, anexos e materiais de clientes.
**Evidência:** `meet_videos` público e leitura pública em `supabase/migrations/20260323000001_video_recordings.sql:10-11`, `:26`; `[BUCKET_TASK_ATTACHMENTS]` público em `20260321999999_create_task_attachments_bucket.sql:2-3`; `rei-materials` público em `20260314000000_create_rei_materials.sql:30-32`.
**Cenário de exploração:** atacante obtém ou enumera caminhos de objeto e baixa vídeo/anexo sem pertencer ao tenant.
**Recomendação:** buckets privados, paths com `organization_id`, policies por membership/owner e URLs assinadas curtas; migrar objetos existentes e invalidar URLs conhecidas.

### P1-05 — Restaurar trilha de auditoria para operações críticas

**Risco:** mudanças em projetos, oportunidades e sprints deixam de gerar registros, reduzindo detecção e investigação de abuso.
**Evidência:** criação de `audit_logs` em `supabase/migrations/20260417000005_create_audit_logs.sql:3-24`; remoções em `20260417000006_disable_audit_trigger.sql:1-7` e `20260417000007_drop_audit_rei_trigger.sql:1-4`.
**Cenário de exploração:** usuário ou função privilegiada altera estágio, valor ou ownership; a alteração não produz evento de auditoria confiável.
**Recomendação:** corrigir a função de auditoria com schema qualificado/search_path fixo, recriar triggers nas tabelas críticas, tornar logs append-only e restringir leitura a auditores/admins.

### P1-06 — Restringir leitura de `audit_logs`

**Risco:** todo usuário autenticado pode ler logs potencialmente contendo IDs, emails, payloads antigos/novos e metadados operacionais.
**Evidência:** `supabase/migrations/20260417000005_create_audit_logs.sql:3-12`, policy em `:22-26`.
**Cenário de exploração:** usuário comum consulta logs para mapear outros tenants, usuários e operações sensíveis.
**Recomendação:** acesso somente a papel de auditoria/super-admin, com filtro de tenant quando aplicável; minimizar/redigir campos sensíveis e definir retenção técnica.

## P2

### P2-01 — Declarar configuração para todas as Edge Functions

**Risco:** dez funções dependem de defaults de plataforma, facilitando drift de `verify_jwt` entre ambientes.
**Evidência:** seções existentes em `supabase/config.toml:8-144`; ausentes: `analyze-meeting-transcript`, `clickup-sync`, `clickup-update-docs-link`, `crux-benchmark`, `generate-image`, `ghl-inspect`, `google-meetings`, `process-meeting-audio`, `transcribe-meeting`, `trigger-post-rei-enrichment`.
**Cenário de exploração:** mudança de default/deploy deixa endpoint privilegiado sem a barreira esperada.
**Recomendação:** seção explícita para todas as 39 funções; `verify_jwt=true` por padrão e exceções documentadas apenas para webhooks com autenticação de mensagem.

### P2-02 — Recriar e testar `on_auth_user_created`

**Risco:** novos usuários podem ficar sem profile/role/status consistente, causando falhas de autorização ou tratamento inseguro de defaults.
**Evidência:** função em `supabase/migrations/20241224000100_add_role.sql:26-33`; criação do trigger comentada em `:35-39`.
**Cenário de exploração:** conta nova não recebe profile; fluxos diferentes interpretam ausência de role de forma divergente e um endpoint menos defensivo concede acesso indevido.
**Recomendação:** migration idempotente para criar o trigger, função definer endurecida, tratamento de conflito e teste automatizado de signup/profile/role padrão.

### P2-03 — Reduzir dados pessoais e financeiros em logs

**Risco:** logs ampliam cópias e acesso a payloads, emails, IDs e contexto financeiro.
**Evidência:** payload completo em `supabase/functions/infinitepay-webhook/index.ts:29`; identidade/alvo em `delete-user/index.ts:75`; email e role em `invite-member/index.ts:88-90`.
**Cenário de exploração:** operador ou integração de observabilidade com acesso amplo usa logs para coletar dados além da necessidade operacional.
**Recomendação:** logging estruturado com allowlist, IDs correlacionáveis não reversíveis, redação de payload/email/token e retenção mínima; nunca logar headers de autorização.

### P2-04 — Transformar métricas de RLS em teste de estado efetivo

**Risco:** contagens textuais misturam policies removidas e atuais, criando falsa confiança; 17 ocorrências de definer incluem comentário.
**Evidência:** correções históricas em `supabase/migrations/20260322000000_security_hardening.sql:6-30`; ocorrência comentada em `20260114000001_secure_proposals_rpc.sql:6`.
**Cenário de exploração:** revisão aprova release pela quantidade de RLS/policies enquanto uma policy permissiva posterior continua efetiva.
**Recomendação:** em ambiente local descartável, aplicar migrations e testar `pg_policies`, grants, owners e casos negativos por role/tenant; bloquear regressões de `USING/WITH CHECK (true)` fora de allowlist justificada.
