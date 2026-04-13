# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos Essenciais

```bash
npm run dev          # Servidor local Vite (porta 5173)
npm run build        # Build prod + prerender SSR (scripts/prerender.js)
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run test:e2e     # Playwright E2E
```

Para rodar um teste especifico: `npx vitest run src/path/to/file.test.ts`

Deploy via FTP Hostinger: `npm run deploy` (requer `.env` com credenciais FTP)

---

# RevHackers Growth Hub - Contexto do Projeto

## O que e este projeto

Ferramenta interna de onboarding, diagnostico e geracao automatica de planejamento estrategico para agencias de crescimento. O fluxo central e:

1. Cliente preenche o **REI** (Reuniao Estrategica Inicial) - formulario de kickoff
2. Sistema coleta transcricao da call (via Notion), analisa site e concorrentes
3. Edge Function `generate-strategic-plan` usa GPT-5.4 para gerar um plano estrategico JSON
4. Admin revisa e cliente ve o plano na `StrategicPlanPresentation`

**Stack:** React + Vite + TypeScript, Supabase (DB + Edge Functions), Tailwind CSS, shadcn/ui, Lucide icons.

---

## Regra de Diagramacao - IMUTAVEL

### Proibicao Total do Em Dash (traco longo)

- ❌ **PROIBIDO: Uso do caractere em dash (`\u2014`) em QUALQUER lugar do projeto**
- ❌ PROIBIDO em: frontend, edge functions, prompts de IA, artigos, materiais, planos estrategicos
- ❌ PROIBIDO em: comentarios de codigo, strings, templates, dados estaticos
- ✅ Usar hifen simples (`-`) como separador universal
- ✅ Usar dois pontos (`:`) para rotulos e titulos (ex: `Fase 1: Setup`)
- ✅ Usar ponto (`.`) ou virgula (`,`) para separar frases em descricoes
- ✅ Usar pipe (`|`) para separadores visuais em UI (ex: `Onboarding | Etapa 1`)

**Isso se aplica tambem a conteudo gerado por IA.** Todos os prompts de Edge Functions devem incluir instrucao explicita para NAO usar em dashes na resposta.

---

## REIs Existentes

| Tipo | Arquivo de Config | Proposito |
|---|---|---|
| `consulting` | `src/config/rei/consultingQuestions.ts` | Funil 360 completo |
| `founder` | `src/config/rei/founderQuestions.ts` | LinkedIn / Personal branding |
| `dev` | `src/config/rei/devQuestions.ts` | Sites e landing pages |
| `crm_ops` | Componentes `src/components/rei/steps/StepCrmOps1-5.tsx` | RevOps / CRM |

> **CRITICO:** `crm_ops` NAO esta em `REI_CONFIGS` (`src/config/rei/index.ts`). Ele usa campos com prefixo `revops_` em snake_case. Os demais usam camelCase sem prefixo. Isso e um problema arquitetural conhecido - nao criar novos REIs com nomenclatura inconsistente.

---

## Design System - Regras Imutaveis

O projeto segue o estilo **Nobibecode** - minimalista, monocromatico, tipografia pesada como elemento visual principal.

### Paleta de Cores

```
Fundo escuro (Cover/Accent):  bg-zinc-950
Fundo claro (Conteudo):       bg-white
Texto primario:               text-zinc-900 / text-black
Texto secundario:             text-zinc-500
Texto terciario:              text-zinc-400
Texto desativado:             text-zinc-300
Bordas:                       border-zinc-200 (light) | border-zinc-800 (dark)
Accent (unico permitido):     #00CC6A  <- usado com extrema parcimonia
```

### Regras de Cor

- ✅ zinc scale para tudo
- ✅ `#00CC6A` apenas para: badges de fase, destaques de KR, icones de terceiro pilar, accents de linha
- ❌ PROIBIDO: cores vibrantes (azul, laranja, roxo, vermelho como cor principal)
- ❌ PROIBIDO: gradientes de qualquer tipo
- ❌ PROIBIDO: background colorido em cards (exceto `bg-zinc-50` ou `bg-zinc-950`)
- ❌ PROIBIDO: texto colorido alem de zinc + `#00CC6A`

### Tipografia

```
Eyebrow labels:   text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500
Titulos H1:       text-5xl md:text-7xl font-black tracking-tight leading-[1.05]
Titulos H2:       text-3xl md:text-[2.75rem] font-black tracking-tight leading-[1.05]
Titulos H3:       text-xl font-bold text-zinc-900
Body:             text-[15px] font-medium leading-relaxed text-zinc-500
Labels de dados:  text-xs font-black text-zinc-400 uppercase tracking-widest
Badges:           text-[10px] font-black uppercase tracking-widest
```

- ✅ `font-black` e o peso padrao para titulos - nao usar `font-bold` em H1/H2
- ✅ `tracking-tight` em titulos grandes
- ✅ `uppercase tracking-widest` apenas em labels/eyebrows
- ❌ PROIBIDO: font-size acima de `text-7xl`
- ❌ PROIBIDO: decoracoes de texto (underline colorido, text-shadow)
- ❌ PROIBIDO: misturar pesos diferentes no mesmo bloco sem hierarquia clara

### Espacamento Padrao

```
Padding de secao:   px-6 md:px-10 lg:px-14 py-8
Padding de conteudo: pb-14 pt-2 (apos header)
Gap entre cards:    gap-6 ou gap-8
```

### Componentes

**Cards light:**
```tsx
className="border border-zinc-200 rounded-2xl shadow-sm bg-white"
```

**Cards dark:**
```tsx
className="bg-zinc-950 rounded-2xl"
```

**Icones:**
```tsx
// Container
className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center"
// Icone dentro
className="w-5 h-5 text-zinc-900"
// Variante accent (ultimo pilar, destaque)
className="w-12 h-12 border border-[#00CC6A]/20 rounded-xl ... shadow-[0_0_15px_rgba(0,204,106,0.1)]"
```

**Badges de fase/ciclo:**
```tsx
className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md inline-block"
```

**Divisores:**
```tsx
// Horizontal
className="w-[2px] h-10 bg-zinc-800"
// Linha decorativa
className="h-[3px] flex-1 bg-zinc-800 rounded-full"
```

**SectionHeader:** Sempre usar o componente `@/components/plan/SectionHeader` para cabecalhos de secao - nunca criar um novo. Props: `eyebrow`, `titleLine1`, `titleLine2?`, `description?`.

### O que nunca fazer em UI

- ❌ Nao criar elementos com `bg-blue-*`, `bg-purple-*`, `bg-orange-*`, `bg-red-*` como cores primarias
- ❌ Nao usar `shadow-lg` ou `shadow-xl` - maximo `shadow-sm`
- ❌ Nao criar novos componentes de header de secao - usar `SectionHeader`
- ❌ Nao usar `rounded-full` em cards/containers (apenas em dots de timeline e avatars)
- ❌ Nao adicionar animacoes de entrada/saida (sem framer-motion em paginas de plano)
- ❌ Nao usar emojis em UI - usar Lucide icons
- ❌ Nao criar botoes coloridos em telas de apresentacao ao cliente (apenas zinc ou white)
- ❌ **Nao usar o caractere em dash (`\u2014`) em NENHUM lugar - usar hifen simples (`-`)**

---

## Arquitetura de Geracao do Plano

```
REI Responses (form data)
        |
generate-strategic-plan (Supabase Edge Function)
        | busca transcript no Notion (via email/empresa)
GPT-5.4 com prompt estruturado
        |
JSON: { summary, context_mirror, signals, risks, decisions,
        pillars, methodology_steps, roadmap_phases, okrs, onboarding_data }
        |
Salvo em strategic_plans.diagnostic_data (jsonb)
        |
StrategicPlanPresentation -> renderiza sections
```

**CRITICO - Deteccao de tipo CRM:** A edge function detecta CRM por string matching fragil:
```ts
const isCrmOps = objective?.includes('CRM') || objective?.includes('RevOps') || objective?.includes('Operacoes');
```
Isso e um bug conhecido. Nao criar logica que dependa de string matching para deteccao de tipo.

---

## Convencoes de Codigo

- Componentes de secao do plano ficam em `src/pages/client/sections/`
- Nomenclatura: `[Nome]Section.tsx` - PascalCase
- Props padrao: `{ plan: any, client?: any }` - tipar mais estritamente ao refatorar
- Dados do plano acessados via: `plan.diagnostic_data`, `plan.roadmap_data`, `plan.okr_data`, `plan.onboarding_data`
- Campos do cliente: `client.company`, `client.logo_url`, `client.email`
- Sempre usar `|| []` e `|| {}` para fallback de dados da IA - o JSON pode ter campos ausentes
- Imports de icones: sempre de `lucide-react`, nunca instalar outras libs de icones
- **NUNCA usar o caractere em dash (\u2014) em codigo, strings, comentarios ou conteudo**

---

## Estrutura de Paginas e Rotas

O `App.tsx` define todas as rotas. As areas principais sao:

| Area | Prefixo | Acesso | Descricao |
|---|---|---|---|
| Publica | `/`, `/blog`, `/servicos`, `/cases`... | Publico | Site institucional |
| Score/Lead | `/score`, `/score-site`, `/score-founder`, `/score-revenue` | Publico | Quiz de maturidade (lead gen) |
| REI | `/rei/wizard`, `/rei/resultado/:id` | ProtectedRoute | Formulario interno de kickoff |
| Admin (GrowthHub) | `/admin/*` | ProtectedRoute | Dashboard operacional completo |
| Pipeline | `/admin/pipeline` | ProtectedRoute | Cockpit comercial / Revenue Cockpit |
| Client | `/plan/:token`, `/success/:token`, `/hub/:id` | Publico com token | Apresentacao do plano ao cliente |
| Deal Room | `/p/:slug` | Publico com slug | Proposta comercial em slides |

**ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`) lida com os roles: `super_admin`, `admin`, `user` (via `useAuth()`).

---

## Autenticacao e Roles

`src/contexts/AuthContext.tsx` e o provedor central. Suporta:
- OTP via email (`signIn`)
- Email + senha (`signInWithPassword`)
- Invite flow: usuario com `user_metadata.invited === true` e redirecionado para criar senha no primeiro acesso

Roles lidos da tabela `profiles` no Supabase (campo `role`).

**Importante:** `QueryClient` em `App.tsx` tem `refetchOnWindowFocus: false` e `refetchOnReconnect: false` para evitar perda de estado em formularios ao trocar de aba.

---

## Camadas de Dados

```
src/api/          -> Chamadas diretas ao Supabase (CRUD simples)
src/services/     -> Logica de negocio + orquestracao (ex: ReiScoringService, PipelineService)
supabase/functions/ -> Edge Functions Deno (AI, webhooks, integrações externas)
```

Hooks (`src/hooks/`) encapsulam react-query + chamadas de API. Ex: `useReiProjects`, `useReiResponses`.

Estado global: **Zustand** (`src/store/`) para estado de UI persistido entre paginas. **React Query** para cache de servidor.

---

## Edge Functions Principais

| Funcao | Proposito |
|---|---|
| `generate-strategic-plan` | GPT-5.4 gera plano JSON completo pos-REI |
| `generate-success-plan` | Gera plano de sucesso (onboarding) |
| `generate-playbook` | Gera playbook de crescimento |
| `analyze-site` | Inspeciona site do cliente via scraping |
| `research-intelligence` | Pesquisa de mercado e concorrentes |
| `transcribe-meeting` | Transcreve audio de reuniao |
| `analyze-meeting-transcript` | Analisa transcript e extrai insights |
| `fathom-webhook` / `fathom-sync` | Integracao com Fathom (gravacoes) |
| `ghl-webhook-handoff` | Automacao pos-venda no GoHighLevel |
| `trigger-post-rei-enrichment` | Enriquecimento automatico pos-REI |
| `invite-member` | Convida usuario com flag `invited` no metadata |
| `ask-agent` / `agent-chat` | Chat AI contextual por projeto |

Todas as edge functions compartilham CORS em `supabase/functions/_shared/cors.ts`.

---

## Problemas Arquiteturais Conhecidos (nao "corrigir" sem planejamento)

1. `crm_ops` fora do sistema `REIConfig` - campos com padrao diferente dos demais REIs
2. `reiScoring.ts` usa `WizardData` desconectada dos REIs reais - scores no DB podem ser incorretos
3. Sem bloco universal de identificacao entre REIs - cada um tem campos de empresa/email diferentes
4. Schema de plano gerado e unico para todos os tipos - nao ha prompt especifico por REI type
5. `site` e `funnel` tem tipo em `REIType` mas sem config de perguntas dedicada
