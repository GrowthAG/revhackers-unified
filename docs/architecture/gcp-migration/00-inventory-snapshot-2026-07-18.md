# E0-T6 — Inventário efetivo do ambiente Supabase (2026-07-18)

Snapshot não secreto, gerado por leitura direta do projeto
`REVHACKERS - DataBase` (`eqspbruarsdybpfeijnf`) via MCP. Complementa
(não substitui) `00-current-state.md`. Contagens são fatos observados
nesta data - recalcular antes de reusar em qualquer decisão de sizing.

## Banco de dados

- **61 tabelas** no schema `public`, **100% com RLS habilitado**
  (`relrowsecurity = true` em todas, confirmado via `pg_class`).
- **108 migrations no histórico oficial** (`list_migrations`, tabela de
  controle do Supabase), batendo exatamente com o `git log` local até
  `20260418000000_rls_policies_clickup`. **As 7 migrations de segurança
  desta sessão (2026-07-17/18) foram aplicadas via SQL Editor, não via
  `supabase migration push` - o SQL rodou de verdade (confirmado por
  leitura direta de policies/funções após cada uma), mas não ficou
  registrado no histórico oficial de migrations do Supabase.** Isso é um
  drift real entre "o que rodou" e "o que o Supabase acha que rodou" -
  não afeta o comportamento do banco agora (as migrations são
  idempotentes, `DROP POLICY IF EXISTS`/`CREATE OR REPLACE FUNCTION`),
  mas quem rodar `supabase db push` no futuro pode não perceber que essas
  mudanças já existem. Registrar isso formalmente (`supabase migration
  repair` ou equivalente) ficou pendente.
- **Drift confirmado**: `diagnosticos` (plural) é a tabela realmente em
  uso desde antes desta sessão; nenhuma migration a criava até
  `20260717000000_secure_diagnosticos_public_access.sql` (guarda
  defensiva `IF NOT EXISTS`, no-op em produção). Ver checkpoint
  2026-07-17 em `docs/PLANO-MESTRE.md`.
- **0 jobs `pg_cron` ativos** (`SELECT * FROM cron.job` retorna vazio).
  A migration `20260303000002_cron_sync_meetings.sql` cria o job
  `sync-google-meetings`, mas ele não está registrado/ativo no ambiente
  atual - inconsistência entre código versionado e estado real, não
  investigada a fundo (pode ter sido removido manualmente, ou nunca
  ter sido de fato agendado).
- Tabelas com maior volume de linhas: `chat_messages` (328),
  `audit_logs` (252), `orqflow_tasks` (51), `organizations` (36),
  `blog_posts` (36). A maioria das tabelas de negócio tem poucas
  dezenas de linhas ou menos - ambiente de produção real mas de porte
  pequeno hoje.

## Storage

**7 buckets, todos marcados `public: true`:**

| Bucket | Criado em | Observação |
|---|---|---|
| `blog-covers` | 2025-12-23 | Conteúdo de site institucional - público faz sentido |
| `brand-assets` | 2026-01-17 | Idem |
| `meet_videos` | 2026-03-23 | **Gravação de reunião de cliente - público não parece intencional** |
| `profiles` | 2025-12-24 | Avatares de usuário - público comum nesse tipo de asset |
| `rei-materials` | 2026-03-14 | Material de referência de projeto de cliente - mesmo risco de `meet_videos` |
| `revhackers-uploads` | 2026-03-19 | Genérico, não investigado o conteúdo real |
| `task-attachments` | 2026-03-21 | Anexo de tarefa - mesmo risco |

Bucket público no Supabase Storage significa que qualquer um com a URL do
objeto lê o arquivo sem nenhum RLS/token - bypass total, não é o mesmo
mecanismo das tabelas corrigidas nesta sessão. Já era o achado P1
"buckets públicos" registrado em `docs/departments/security/01-backlog.md`;
esta é a primeira vez que os nomes reais foram confirmados.

**Atualização 2026-07-19 - achado mais grave da sessão inteira, corrigido:**
`storage.objects` tinha uma policy chamada `"Permitir Tudo"` (SELECT/
INSERT/UPDATE/DELETE, role `public`, **sem nenhum filtro de `bucket_id`**)
- CRUD anônimo completo em todos os arquivos de todos os buckets do
projeto, independente de qual bucket, inclusive os que "pareciam"
protegidos por RLS própria (como `task-attachments`). Mais 3 conjuntos de
policies redundantes davam o mesmo acesso anônimo total especificamente
para `rei-materials`, `meet_videos` e `revhackers-uploads` (esta última
com nome `"Anon_Temp_..."`, indicando que era pra ser temporária).

Corrigido via `20260719000000_secure_storage_objects.sql`: removidas
todas as policies abertas, recriadas com escopo (leitura pública só onde
é intencional - `blog-covers`, portfolio/blog público - resto
`authenticated`-only). `task-attachments` também virou bucket privado
(`public: false`) - zero uso no frontend (grep confirmado), seguro sem
nenhuma mudança de código.

**Ainda pendente, não resolvido nesta correção:** `meet_videos`,
`rei-materials` e `revhackers-uploads` continuam com o bucket marcado
`public: true` - a RLS agora está correta, mas o flag do bucket ainda
permite leitura via `/object/public/...` sem checar RLS nenhuma. Virar
esses 3 buckets privados exige trocar `getPublicUrl()` por
`createSignedUrl()` em `src/utils/uploadImageToSupabase.ts` e
`uploadFileToSupabase.ts`, e verificar cada tela que exibe essas URLs -
trabalho maior, não decidido/feito sozinho.

## Edge Functions

**47 functions ativas.** 11 delas com `verify_jwt: false` (o gateway do
Supabase não exige JWT antes de invocar - a função precisa fazer sua
própria verificação, se houver):

`generate-strategic-plan`, `generate-success-plan`, `ghl-webhook-handoff`,
`clickup-orchestrator`, `clickup-sprint-orchestrator`,
`clickup-provision`, `clickup-notetaker-sync`.

Das 9: `ghl-webhook-handoff` é webhook de provedor externo (esperado não ter
JWT de usuário, mas deveria validar assinatura do provedor - não auditado aqui
se valida de fato). `generate-strategic-plan` já é conhecido (roteador Claude/GPT,
Frente 2 do plano). As 3 `clickup-*` sem JWT não foram investigadas se
têm validação de webhook secret equivalente.

**Atualização (mesma sessão): 3 dos 11 auditadas.**

- `infinitepay-webhook`: integração removida do código ativo e do plano de
  migração; qualquer endpoint/configuração remanescente no ambiente remoto deve
  ser reconciliado e desativado antes do decommission.
- `ghl-webhook-handoff`: mesmo padrão de `infinitepay-webhook`, também
  falha fechado corretamente.
- `fathom-webhook`: **integração descontinuada.** Foi observada no ambiente
  remoto, mas não permanece no código ativo e não será portada para o Google
  Cloud. Antes do decommission do Supabase, o endpoint remoto deve ser
  confirmado como sem tráfego e desativado/removido em operação autorizada.
  A coluna histórica `fathom_meeting_id` permanece apenas para preservar
  registros antigos até a limpeza de dados ser aprovada.

**Ainda não investigado:** as 3 functions `clickup-orchestrator`,
`clickup-sprint-orchestrator`, `clickup-provision` sem `verify_jwt` e
`clickup-notetaker-sync`.

## Auth

Não reconsultado nesta sessão - ver `03-auth-and-tenant-isolation.md`
para o estado já documentado (Supabase Auth com senha/OTP/recovery,
`profiles.role` com `super_admin`/`admin`/`user`/`analyst`, cadastro
público bloqueado no cliente).

**Achado novo desta sessão, já registrado em `03-auth-and-tenant-isolation.md`:**
nenhuma página client-facing usa Supabase Auth - acesso é 100% por
link-capacidade (token opaco comparado a coluna). Ou seja, o "Auth" hoje
só serve a equipe interna RevHackers, não clientes.

## Gaps que continuam sem dado

- Custo real por serviço (E0-T5) - não medido.
- RTO/RPO/retenção/LGPD (E0-T4) - não decidido, não inferível deste snapshot.
- Se os 3 webhooks sem `verify_jwt` validam assinatura do provedor.
- Conteúdo real dos buckets públicos `meet_videos`/`rei-materials`/
  `revhackers-uploads`/`task-attachments` (volume, sensibilidade por
  objeto individual).
