# Auditoria de Inconsistências - End-to-End

**Criado:** 2026-04-15
**Proposito:** Mapa unificado de inconsistencias entre codigo, DB, rotas e integracoes. Documento compartilhado entre o agente local (Claude Code em `/Users/giullianoalves/revhackers-growth-hub`) e o agente no Antigravity para trabalharmos em paralelo sem sobrepor mudancas.

**Como usar:**
- Cada item tem `path:line` verificavel.
- Marque `[x]` em `Status` quando o item for resolvido. Commitar a mudanca do checkbox junto com o fix.
- Se descobrir que um item esta errado ou ja foi resolvido, edite a linha e coloque `~~riscado~~ (nota do agente X)`.
- Antes de iniciar trabalho num item, adicione seu nome em `Owner` para evitar colisao.

---

## Contexto resumido

Tres auditorias paralelas foram rodadas (camada de dados, fluxo REI, integracoes/rotas) e os achados foram verificados manualmente nos pontos mais graves. O repositorio esta com divergencia estrutural entre o que o codigo assume como verdade e o que o DB/rotas garantem. Nao e um bug pontual; sao tres camadas de confianca fora de sincronia.

Plano relacionado em execucao: `/Users/giullianoalves/.claude/plans/silly-greeting-grove.md` (fluxo GHL -> Hub -> ClickUp). Itens marcados `[PLAN]` ja estao cobertos por esse plano e nao precisam ser retrabalhados aqui.

---

## Top 10 Inconsistencias por risco

| # | Camada | Inconsistencia | Risco | Status | Owner |
|---|---|---|---|---|---|
| 1 | DB | Tabela `deal_sessions` referenciada sem migration | CRITICO | [ ] | |
| 2 | DB | `diagnosticos` (plural) no codigo vs `diagnostico` (singular) na migration | CRITICO | [ ] | |
| 3 | REI | `crm_ops: consultingConfig` alias + scoring quebrado | CRITICO | [ ] | |
| 4 | Integracao | Race `sprints_status` entre `clickup-provision` e `clickup-orchestrator` | ALTO | [ ] | |
| 5 | DB | `client_accounts` sem CHECK + populacao parcial | ALTO | [PLAN] | Modulo 1 |
| 6 | Plan | `form_data` consumido por section mas nunca gerado pelo prompt | ALTO | [ ] | |
| 7 | Rotas | 18 paths em `App.tsx` fora de `APP_ROUTES` | MEDIO | [ ] | |
| 8 | REI | 8 heuristicas divergentes de deteccao de tipo CRM | MEDIO | [ ] | |
| 9 | Integracao | Edge functions orfas (`analyze-meeting-transcript`, `generate-project-tasks`) | MEDIO | [ ] | |
| 10 | Env | 7 env vars de edge function nao documentadas | MEDIO | [ ] | |

---

## Itens detalhados

### 1. Tabela `deal_sessions` referenciada sem migration

**Path:** `src/pages/public/PublicDealRoom.tsx` (`.from('deal_sessions' as any).insert(...)`)

**Evidencia:** `grep -r "deal_sessions" supabase/migrations/` retorna vazio. O `as any` no cast mascara o erro em compile time.

**Impacto:** Ao visitante de um deal room publico, o insert falha em runtime (erro 42P01 do Postgres). Se o fluxo depende disso para captura de lead, perdemos leads silenciosamente.

**Acao sugerida:** Decidir entre (a) criar migration com schema da tabela ou (b) remover a chamada se a feature foi descontinuada. Se (a), verificar se existe uma tabela similar (`opportunities`, `lead_captures`, `contact_submissions`) que deveria receber o insert em vez de criar nova.

---

### 2. `diagnosticos` (plural) vs `diagnostico` (singular)

**Path DB:** `supabase/migrations/20251227000000_create_diagnostico_table.sql:5` cria `public.diagnostico` (singular).

**Path codigo:** multiplos arquivos consultam `diagnosticos` (plural). Para mapear exatamente, rodar:
```bash
grep -rn "from('diagnosticos" src/ supabase/functions/
```

**Impacto:** Selects retornam erro 42P01 ou vazio dependendo do cliente Supabase. Pipeline de diagnosticos no admin provavelmente renderiza estado vazio sem indicar erro.

**Acao sugerida:** Padronizar em uma forma (recomendo `diagnostico` singular, que ja existe). Se houver registros em producao, rename no DB via migration + search/replace no codigo.

---

### 3. `crm_ops: consultingConfig` alias + scoring quebrado

**Path config:** `src/config/rei/index.ts:10` (`crm_ops: consultingConfig`, `site: devConfig`, `funnel: consultingConfig`).

**Path wizard:** `src/components/rei/REIWizard.tsx:206` usa Steps `StepCrmOps1-5.tsx` que coletam campos `revops_*` em snake_case.

**Path scoring:** `src/services/ReiScoringService.ts:156-205` (`calculateCrmScore`) le `data.crm`, `data.desafios`, `data.metricas`, `data.gargaloFunil`. Nenhum existe em CRM Ops (que usa `revops_hub_central`, `revops_automacoes_core`, etc.).

**Impacto:** Score de CRM Ops sempre retorna o default (baixo). Cliente ve radar artificialmente pobre. Plano gerado pode usar prompt consulting se `projectType` chegar vazio ao edge function.

**Acao sugerida:** Decisao arquitetural necessaria. Opcoes:
- Criar `crmOpsConfig` dedicada em `src/config/rei/crmOpsQuestions.ts` com campos `revops_*` mapeados declarativamente.
- Refatorar `ReiScoringService` para dispatch por tipo (`calculateCrmOpsScore` vs `calculateConsultingScore`).
- Ambos envolvem REI configs. CLAUDE.md marca como "nao corrigir sem planejamento". Abrir sub-plano proprio antes.

---

### 4. Race condition `sprints_status` entre `clickup-provision` e `clickup-orchestrator`

**Path:** `supabase/functions/clickup-provision/index.ts:223,386` e `supabase/functions/clickup-orchestrator/index.ts:190` ambos escrevem em `rei_projects.sprints_status`.

**Impacto:** Se os dois sao acionados em sequencia rapida (ou retry de um coincide com execucao do outro), o campo pode ser sobrescrito com valor stale. Estados conflitantes como `ready` -> `creating` -> `done` podem aparecer na ordem errada.

**Acao sugerida:** Decidir qual funcao e autoritativa. Hipotese: `clickup-orchestrator` cria folder (workspace), `clickup-provision` cria sprints/tasks. Se verdade, cada uma deve escrever em campo separado (`workspace_status` vs `sprints_status`). Verificar se `clickup-orchestrator:190` escreve no campo correto para o seu escopo.

---

### 5. `client_accounts` sem CHECK constraint + populacao parcial [PLAN]

**Cobertura:** Plano `silly-greeting-grove.md` Modulo 1 endereca a populacao. Adicionar CHECK constraints em `consulting_status` e `software_status` tambem deve entrar na migration do Modulo 1.

**Path:** `supabase/migrations/20260417000000_create_client_accounts.sql` (sem CHECK) vs `src/hooks/useClientAccount.ts:19-20` (tipa 3 e 4 valores respectivamente).

**Acao sugerida:** Adicionar na migration do Modulo 1 do plano:
```sql
ALTER TABLE client_accounts
  ADD CONSTRAINT consulting_status_check CHECK (consulting_status IN ('pending','active','completed')),
  ADD CONSTRAINT software_status_check CHECK (software_status IN ('pending','onboarding','active','churn'));
```

---

### 6. `plan.form_data` consumido por section mas nunca gerado pelo prompt

**Path consumidor:** `src/pages/client/sections/PipelineArchitectureSection.tsx` le `plan.form_data` ou `plan.diagnostic_data.form_data`.

**Path produtor:** `supabase/functions/generate-strategic-plan/index.ts` nao faz passthrough das respostas do wizard para o JSON gerado.

**Impacto:** Section renderiza vazia ou com fallback. Cliente nao ve dados proprios no plano.

**Acao sugerida:** No edge function, apos montar o prompt, injetar `form_data: rei_responses.responses` no objeto salvo em `strategic_plans.diagnostic_data`. Alternativa: ler diretamente de `rei_responses` no componente da section (requer join query).

---

### 7. 18 paths em `App.tsx` fora de `APP_ROUTES`

**Path:** `src/App.tsx:245-327` contem rotas como `/admin/contas`, `/admin/integrations/ghl`, `/admin/pipeline`, `/admin/knowledge/:libraryId/doc/*`, `/approve/:token`, `/success/:token` que nao aparecem em `src/config/routes.ts`.

**Impacto:** Regra CLAUDE.md violada ("NUNCA hardcodar URLs/caminhos - usar APP_ROUTES"). Qualquer rename quebra referencias textuais espalhadas.

**Acao sugerida:** Adicionar entradas faltantes em `APP_ROUTES`, depois search/replace em `src/`. Baixo risco, alto ganho de manutenibilidade.

---

### 8. 8 heuristicas divergentes de deteccao de tipo CRM

**Paths:**
1. `src/config/rei/index.ts:10` (alias)
2. `supabase/functions/generate-strategic-plan/index.ts:107` (`projectType === 'crm_ops'`)
3. `supabase/functions/generate-project-tasks/index.ts` (mesmo check)
4. `supabase/functions/research-intelligence/index.ts` (3x repetido)
5. `src/components/rei/REIWizard.tsx:203` (`type === 'crm_ops'`)
6. `src/config/onboardingTemplates.ts:142` (catalog mapping)
7. `src/pages/client/sections/ExecutiveSummarySection.tsx:42` (`plan.rei_projects?.type || plan.project_type`)
8. String matching em prompts (`objective?.includes('CRM')`)

**Impacto:** Quando uma das 8 diverge, sections/prompts/scoring seguem caminhos errados. Debug quase impossivel.

**Acao sugerida:** Extrair helper `isCrmOpsProject(project)` em `src/utils/reiType.ts` (ou similar) e trocar todas as 8 para usar ele. Para edge functions, helper equivalente em `supabase/functions/_shared/rei-type.ts`.

---

### 9. Edge functions orfas

**Paths:** `supabase/functions/analyze-meeting-transcript/`, `supabase/functions/generate-project-tasks/` nao sao invocadas em `src/` nem por webhook documentado.

**Impacto:** Codigo morto, consome limites de deploy do Supabase, risco de deprecar silenciosamente sem ninguem notar.

**Acao sugerida:** Confirmar com o dono do produto se sao planned features ou restos. Se restos, deletar via `supabase functions delete`. Se planned, adicionar TODO no index.ts de cada uma com contexto.

---

### 10. Env vars nao documentadas

**Vars:** `GHL_WEBHOOK_URL`, `PUBLIC_SITE_URL`, `PSI_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`.

**Paths de uso:** `infinitepay-webhook/index.ts:158`, `invite-member/index.ts:39`, `analyze-site/index.ts:35` e outros.

**Impacto:** Deploy em ambiente novo (staging, fork) falha silenciosamente ate alguem descobrir pela pilha de erros.

**Acao sugerida:** Atualizar secao "Variaveis de Ambiente" em `CLAUDE.md` adicionando as 7 vars com proposito curto de cada. Nao alterar comportamento.

---

## Outras descobertas (fora do Top 10)

### 7 tabelas em `src/integrations/supabase/types.ts` sem migration

`authors`, `blog_posts`, `call_recordings`, `chat_messages`, `chat_sessions`, `posts`, `materials`.

**Hipoteses:** (a) tabelas criadas direto no dashboard Supabase sem migration commitada, (b) tipos gerados de outro projeto, (c) migrations perdidas em merge.

**Acao sugerida:** Rodar `supabase db pull` para capturar schema real do remote. Se as tabelas existem no DB mas nao nas migrations, criar migrations de "captura" (`20260415000001_capture_missing_schema.sql`). Se nao existem no DB, remover os tipos.

### `inspect-website` CORS divergente

**Path:** `supabase/functions/inspect-website/index.ts:15-16` define `Access-Control-Allow-Origin: isAllowed ? origin : ALLOWED_ORIGINS[0]` em vez de importar `_shared/cors.ts`.

**Impacto:** Padrao divergente. Se um dia precisarmos trocar CORS globalmente, essa funcao fica pra tras.

**Acao sugerida:** Avaliar se a logica de allowed origin e intencional (ex: restricao de quem pode inspecionar site). Se sim, documentar no header do arquivo. Se nao, padronizar via `_shared/cors.ts`.

### Funnel sem template de onboarding dedicado

**Path:** `src/config/onboardingTemplates.ts:142-147`, `OnboardingCatalog` nao tem entrada `funnel`.

**Impacto:** Projetos `funnel` caem no fallback consulting e veem "Consultoria 360" em vez de "Jornada de Funis em 90 Dias".

**Acao sugerida:** Adicionar `funnel: funnelsTemplate` ao catalog (ja existe o template, so falta mapeamento).

### `/admin/rei` como redirect historico

**Path:** `src/App.tsx:281` (`<Route path="/admin/rei" element={<Navigate to="/admin/pipeline" replace />} />`).

11+ componentes ainda navegam para `/admin/rei` hardcoded. Tecnicamente funcional via redirect, mas gera um hop extra em cada navegacao. Se a rota de redirect for removida no futuro, todas quebram.

**Acao sugerida:** Decisao simbolica: ou assumir `/admin/rei` como alias publico permanente (documentar em APP_ROUTES), ou migrar as 11 chamadas para `/admin/pipeline` e remover o redirect.

---

## Ownership sugerido (split entre agentes)

Para evitar colisao, sugestao de divisao:

**Agente local (Claude Code):**
- #5 (ja no plano `silly-greeting-grove`)
- #7 (APP_ROUTES gap) - trabalho mecanico, baixo risco
- #10 (env vars doc) - edit isolado em CLAUDE.md
- Outras: 7 tabelas types.ts, `inspect-website` CORS

**Agente Antigravity:**
- #1 (deal_sessions) - decisao + migration ou remocao
- #2 (diagnosticos plural) - rename coordenado DB + codigo
- #6 (form_data passthrough) - mudanca em edge function
- #9 (edge functions orfas) - confirmacao com produto

**Decisoes arquiteturais (sincronizar antes de tocar):**
- #3 (crm_ops arquitetura) - exige sub-plano
- #4 (race ClickUp) - decidir autoridade
- #8 (8 heuristicas) - extrair helper so depois de resolver #3

Sobrescrever esta tabela conforme a realidade — ela e um ponto de partida, nao um contrato.

---

## Debito tecnico: sweep de Auth em edge functions (2026-04-15)

Auditoria varreu 31 edge functions que usam `SUPABASE_SERVICE_ROLE_KEY`. 6 foram patchadas em 2 ciclos. 10 restantes tem o helper canonico (`_shared/require-role.ts`) disponivel e devem receber `authenticate(req) + requireRoleIn(auth, [...])` quando forem tocadas por qualquer outro motivo (drive-by fix).

**Patchadas em 9fce42a (escalacao vertical):**
- `invite-member`, `delete-user` — role check + trigger DB em `profiles`

**Patchadas em e1600fb (IDOR + cost abuse):**
- `ghl-create-location`, `ghl-deploy-strategy` — admin/super_admin only
- `trigger-post-rei-enrichment` — service_role | admin | owner-email
- `agent-documents` — ownership pre-ping + admin em libraries

**Patchadas em 2026-04-15 ciclo 3 (OAuth takeover):**
- `ghl-oauth-callback` — admin/super_admin only (vaza tokens para user comum no payload)
- `ghl-oauth-refresh` — admin/super_admin only (mass refresh sem caller check = rate abuse)

**Restantes (10, nenhuma critica isolada, base canonica disponivel):**

| Funcao | Risco | Politica sugerida |
|---|---|---|
| `clickup-orchestrator` | IDOR cria folder ClickUp para projeto alheio | admin/super_admin OR project owner |
| `clickup-provision` | IDOR materializa sprints/tasks | admin/super_admin OR project owner |
| `clickup-sprint-orchestrator` | Idem | admin/super_admin OR project owner |
| `ghl-outbound-relay` | Tem whitelist de event_types (defensivo ok), confirmar validacao de organizationId | authenticated + org match |
| `analyze-meeting-transcript` | Le transcricoes PII de qualquer reuniao | admin OR owner |
| `transcribe-meeting` | Acessa audio | admin OR owner |
| `process-meeting-audio` | Acessa audio + dispara enrichment | admin OR owner |
| `google-meetings` | Le calendario | admin OR owner |
| `scrape-profile` | Cost abuse (fetch externo) | authenticated basta, adicionar rate limit |

**Pendencia de teste:** regressao curl com JWT de user comum rodou em `invite-member`? Se nao, validar os 6 fixes em producao antes de novos ciclos.

## Historico

- **2026-04-15** (Claude Code local): documento criado a partir de 3 auditorias paralelas verificadas.
- **2026-04-15** (Claude Code local): 3 ciclos de auth hardening. Helper `_shared/require-role.ts` criado. 6 edge functions patchadas + trigger DB. 10 edge functions registradas como debito tecnico com politica sugerida por funcao.
