---
description: Prompt para auditoria completa da aplicacao - integracoes, APIs mortas, funcionalidades e ClickUp
---

# Auditoria Completa - RevHackers Growth Hub

Voce e um auditor tecnico senior. Sua missao e analisar a aplicacao RevHackers Growth Hub de ponta a ponta e produzir um relatorio detalhado sobre o estado de saude de todas as integracoes, APIs, edge functions e funcionalidades. Foque especialmente em **codigo morto, integracoes quebradas e APIs que nao estao mais sendo utilizadas**.

---

## Contexto do Projeto

- **Stack:** React 18 + Vite + TypeScript, Supabase (DB + Edge Functions + Auth), Tailwind CSS, shadcn/ui
- **Infra:** Supabase Edge Functions (Deno runtime), deploy via FTP na Hostinger (SPA estatico)
- **Branch:** `develop` (PR target: `main`)

### Integracoes Externas Ativas (12 servicos)

| Servico | Tipo | Arquivos Chave |
|---------|------|----------------|
| **Supabase** | DB + Auth + Realtime + Edge Functions | Toda a aplicacao |
| **ClickUp** | Project management + task automation + NoteTaker | `supabase/functions/clickup-orchestrator/`, `clickup-sprint-orchestrator/` |
| **GoHighLevel (GHL)** | CRM + webhooks + OAuth | `supabase/functions/ghl-*` (6 funcoes) |
| **OpenAI** | Geracao de planos, analise, enrichment | `generate-strategic-plan`, `auto-enrich-project`, etc. |
| **Anthropic Claude** | Agent chat, analise de docs/transcripts | `agent-chat`, `analyze-meeting-transcript` |
| **Google (Calendar/Drive/Meet)** | Sync de reunioes e gravacoes | `google-auth`, `sync-calendar-meetings`, `sync-drive-recordings` |
| **Google PSI + CrUX** | Web performance metrics | `analyze-site`, `crux-benchmark` |
| **BrasilAPI** | CNPJ lookup | `fetch-cnpj`, `auto-enrich-project` |
| **InfinitePay** | Pagamentos | `infinitepay-create-link`, `infinitepay-webhook` |
| **LinkedIn** | Scraping de perfis | `scrape-profile`, `research-intelligence` |
| **Vercel Analytics** | Frontend analytics | `@vercel/analytics` no package.json |

---

## O que voce DEVE analisar

### 1. INTEGRACOES - Saude e Consistencia

Para CADA integracao listada acima:

- **A edge function existe e esta completa?** Leia o `index.ts` de cada uma
- **Ha chamadas no frontend que invocam essa funcao?** Grep por `supabase.functions.invoke('nome-da-funcao')` no `src/`
- **O fluxo de dados faz sentido?** Frontend -> Edge Function -> API externa -> resposta -> DB
- **Ha tratamento de erro adequado?** Try/catch, fallbacks, retry logic
- **As env vars necessarias estao referenciadas?** (`Deno.env.get(...)` nas edge functions)
- **Ha tabelas no DB que suportam essa integracao?** Verifique em `src/integrations/supabase/types.ts`

### 2. CLICKUP - Auditoria Profunda

Esta e a integracao mais critica para auditar:

- Leia `supabase/functions/clickup-orchestrator/index.ts` linha por linha
- Leia `supabase/functions/clickup-sprint-orchestrator/index.ts` linha por linha
- Verifique a tabela `clickup_integrations` - schema e uso
- Mapeie TODOS os pontos no frontend que chamam essas funcoes
- Verifique se a logica de idempotencia funciona (nao duplicar folders/tasks)
- Verifique se o retry com exponential backoff esta correto
- Verifique se ha rate limiting adequado para a API do ClickUp
- Identifique se ha **edge cases** nao tratados (ex: e se o space_id mudar? e se o folder ja existir mas com nome diferente?)
- Verifique se `CLICKUP_API_KEY` e `CLICKUP_SPACE_ID` estao sendo usados corretamente

### 3. APIs MORTAS - Codigo que ninguem chama

Analise TODOS os arquivos em `src/api/` e verifique:

- **Cada funcao exportada e importada em algum lugar?** Grep por cada export
- **Ha hooks em `src/hooks/` que usam essas APIs?** Se o hook nao e usado, a API e morta
- **Ha edge functions que ninguem invoca?** Verifique se cada funcao em `supabase/functions/` e chamada por algum codigo no frontend ou por algum webhook/trigger

**Arquivos suspeitos de serem mortos (verificar):**
- `src/api/knowledge.ts` - tinha `AdminKnowledgeBase.tsx` que foi removido
- `src/api/posts.ts` - tinha `AdminPosts.tsx` que foi removido
- `src/api/dossier.ts` - verificar se algum componente ainda usa
- `src/api/hubMessaging.ts` - verificar se o messaging esta ativo
- `src/api/signatures.ts` - verificar se o fluxo de assinatura funciona
- `src/api/materialsService.ts` vs `src/api/materials.ts` - por que dois arquivos?
- `src/services/migrationService.ts` - provavelmente temporario
- `src/services/ScrapingService.ts` - verificar se ainda e usado

**Edge functions suspeitas:**
- `seed-db` - so para dev, nao deveria ir pra prod
- `ask-agent` vs `agent-chat` - sao redundantes?
- `generate-image` - esta sendo chamada por alguem?
- `market-intelligence` vs `research-intelligence` - qual a diferenca e ambas sao usadas?
- `enrich-strategic-data` vs `auto-enrich-project` vs `trigger-post-rei-enrichment` - tres funcoes de enrichment parece redundante

### 4. SERVICES - Consistencia e Uso

Analise cada arquivo em `src/services/`:

- `DiagnosticService.ts` (67KB) - esta gigante, e usado? por quem?
- `MarketIntelligenceService.ts` - chamado por quais componentes?
- `PipelineService.ts` - e o servico do RevenueCockpit?
- `ReiScoringService.ts` - CONHECIDO POR TER BUGS (usa campos inexistentes) - documentar o estado
- `StrategicEnrichmentService.ts` - usado ou substituido pelas edge functions?
- `ScrapingService.ts` - client-side scraping? isso funciona em producao?
- `migrationService.ts` - temporario ou permanente?

### 5. HOOKS - Verificar uso

Para cada hook em `src/hooks/`, verifique:
- E importado por algum componente ativo?
- O componente que o importava foi deletado?
- Ha hooks duplicados ou com funcionalidade sobreposta?

### 6. ROTAS MORTAS

Em `src/App.tsx`, verifique:
- Cada `<Route>` aponta para um componente que existe?
- Ha lazy imports que apontam para arquivos deletados?
- Ha redirects que apontam para rotas que nao existem mais?

### 7. WEBHOOKS - Seguranca e Funcionamento

Para cada webhook handler (`ghl-webhook-handoff`, `infinitepay-webhook`):
- Ha validacao de origem/assinatura?
- Ha protecao contra replay attacks?
- O processamento e idempotente?
- Ha logging adequado para debug?

---

## Formato do Relatorio

Produza o relatorio neste formato:

```
## 1. Saude das Integracoes

### ClickUp
- Status: [SAUDAVEL | PROBLEMAS | CRITICO]
- Funcoes: clickup-orchestrator, clickup-sprint-orchestrator
- Frontend calls: [listar onde e chamado]
- Problemas encontrados: [lista]
- Recomendacoes: [lista]

### GoHighLevel
... (mesmo formato)

(repetir para cada integracao)

## 2. APIs e Funcoes Mortas

### Edge Functions Mortas
| Funcao | Motivo | Evidencia | Acao Recomendada |
|--------|--------|-----------|------------------|
| ...    | ...    | ...       | Remover / Manter |

### API Files Mortos (src/api/)
| Arquivo | Funcoes Mortas | Evidencia | Acao |
|---------|---------------|-----------|------|
| ...     | ...           | ...       | ...  |

### Hooks Mortos (src/hooks/)
| Hook | Motivo | Acao |
|------|--------|------|
| ...  | ...    | ...  |

### Services Mortos (src/services/)
| Service | Motivo | Acao |
|---------|--------|------|
| ...     | ...    | ...  |

## 3. Rotas Mortas ou Quebradas
(lista)

## 4. Problemas de Seguranca em Webhooks
(lista)

## 5. Redundancias e Duplicacoes
(lista de funcoes/services que fazem a mesma coisa)

## 6. Recomendacoes Prioritarias
1. [CRITICO] ...
2. [ALTO] ...
3. [MEDIO] ...
4. [BAIXO] ...
```

---

## Regras de Conduta

- NAO corrija nada. Apenas analise e reporte.
- NAO assuma que algo funciona - verifique lendo o codigo.
- Se uma funcao exportada nao e importada em NENHUM lugar, ela e morta. Confirme com grep.
- Se uma edge function nao e chamada por `supabase.functions.invoke()` NEM por webhook externo, ela e suspeita.
- Priorize profundidade sobre velocidade. Leia os arquivos, nao apenas os nomes.
- Use grep extensivamente para rastrear imports e invocacoes.
- Reporte numeros concretos: "5 de 24 arquivos em src/api/ tem funcoes mortas".
