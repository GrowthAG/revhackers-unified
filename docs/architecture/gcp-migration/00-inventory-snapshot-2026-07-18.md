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
esta é a primeira vez que os nomes reais foram confirmados. **Não
corrigido nesta sessão** - reconfigurar storage é mudança de escopo maior
(precisa decidir signed URLs vs. bucket privado por tabela consumidora,
sem quebrar os fluxos que hoje esperam URL pública direta).

## Edge Functions

**47 functions ativas.** 11 delas com `verify_jwt: false` (o gateway do
Supabase não exige JWT antes de invocar - a função precisa fazer sua
própria verificação, se houver):

`generate-strategic-plan`, `generate-success-plan`, `infinitepay-webhook`,
`infinitepay-checkout`, `infinitepay-create-link`, `ghl-webhook-handoff`,
`fathom-webhook`, `clickup-orchestrator`, `clickup-sprint-orchestrator`,
`clickup-provision`, `clickup-notetaker-sync`.

Das 11: `infinitepay-webhook`, `ghl-webhook-handoff` e `fathom-webhook`
são webhooks de provedor externo (esperado não ter JWT de usuário, mas
deveriam validar assinatura do provedor - não auditado aqui se validam de
fato). `generate-strategic-plan` já é conhecido (roteador Claude/GPT,
Frente 2 do plano). As 3 `clickup-*` sem JWT não foram investigadas se
têm validação de webhook secret equivalente.

**Atualização (mesma sessão): 3 dos 11 auditadas.**

- `infinitepay-webhook`: valida `x-webhook-secret` contra `WEBHOOK_SECRET_KEY`,
  falha fechado se o secret não estiver configurado. OK, mas é comparação
  de secret compartilhado (`!==` simples, não constant-time), não a
  assinatura HMAC oficial do provedor sobre o raw body - gap já registrado
  como E9-T5 no backlog de migração.
- `ghl-webhook-handoff`: mesmo padrão de `infinitepay-webhook`, também
  falha fechado corretamente.
- `fathom-webhook`: **achado real, corrigido nesta sessão.** A função só
  existia em produção, nunca foi commitada (drift confirmado - zero
  arquivo em todo o repositório). Pior: a checagem de assinatura só
  rodava `if (webhookSecret)` - se a env var `FATHOM_WEBHOOK_SECRET`
  nunca tivesse sido configurada (ou fosse removida), o endpoint aceitava
  qualquer POST como evento real do Fathom, inserindo linhas falsas em
  `meeting_recordings` e criando tarefas reais em `orqflow_tasks` com
  dado controlado pelo chamador. Trazido para
  `supabase/functions/fathom-webhook/index.ts` e corrigido para falhar
  fechado (rejeita se o secret não estiver configurado, em vez de pular a
  checagem). **Não implantado** - fix local, pronto para deploy quando
  aprovado.

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
