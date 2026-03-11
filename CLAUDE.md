# RevHackers Growth Hub — Contexto do Projeto

## O que é este projeto

Ferramenta interna de onboarding, diagnóstico e geração automática de planejamento estratégico para agências de crescimento. O fluxo central é:

1. Cliente preenche o **REI** (Reunião Estratégica Inicial) — formulário de kickoff
2. Sistema coleta transcrição da call (via Notion), analisa site e concorrentes
3. Edge Function `generate-strategic-plan` usa GPT-4o para gerar um plano estratégico JSON
4. Admin revisa e cliente vê o plano na `StrategicPlanPresentation`

**Stack:** React + Vite + TypeScript, Supabase (DB + Edge Functions), Tailwind CSS, shadcn/ui, Lucide icons.

---

## REIs Existentes

| Tipo | Arquivo de Config | Propósito |
|---|---|---|
| `consulting` | `src/config/rei/consultingQuestions.ts` | Funil 360º completo |
| `founder` | `src/config/rei/founderQuestions.ts` | LinkedIn / Personal branding |
| `dev` | `src/config/rei/devQuestions.ts` | Sites e landing pages |
| `crm_ops` | Componentes `src/components/rei/steps/StepCrmOps1-5.tsx` | RevOps / CRM |

> **CRÍTICO:** `crm_ops` NÃO está em `REI_CONFIGS` (`src/config/rei/index.ts`). Ele usa campos com prefixo `revops_` em snake_case. Os demais usam camelCase sem prefixo. Isso é um problema arquitetural conhecido — não criar novos REIs com nomenclatura inconsistente.

---

## Design System — Regras Imutáveis

O projeto segue o estilo **Nobibecode** — minimalista, monocromático, tipografia pesada como elemento visual principal.

### Paleta de Cores

```
Fundo escuro (Cover/Accent):  bg-zinc-950
Fundo claro (Conteúdo):       bg-white
Texto primário:               text-zinc-900 / text-black
Texto secundário:             text-zinc-500
Texto terciário:              text-zinc-400
Texto desativado:             text-zinc-300
Bordas:                       border-zinc-200 (light) | border-zinc-800 (dark)
Accent (único permitido):     #00CC6A  ← usado com extrema parcimônia
```

### Regras de Cor

- ✅ zinc scale para tudo
- ✅ `#00CC6A` apenas para: badges de fase, destaques de KR, ícones de terceiro pilar, accents de linha
- ❌ PROIBIDO: cores vibrantes (azul, laranja, roxo, vermelho como cor principal)
- ❌ PROIBIDO: gradientes de qualquer tipo
- ❌ PROIBIDO: background colorido em cards (exceto `bg-zinc-50` ou `bg-zinc-950`)
- ❌ PROIBIDO: texto colorido além de zinc + `#00CC6A`

### Tipografia

```
Eyebrow labels:   text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500
Títulos H1:       text-5xl md:text-7xl font-black tracking-tight leading-[1.05]
Títulos H2:       text-3xl md:text-[2.75rem] font-black tracking-tight leading-[1.05]
Títulos H3:       text-xl font-bold text-zinc-900
Body:             text-[15px] font-medium leading-relaxed text-zinc-500
Labels de dados:  text-xs font-black text-zinc-400 uppercase tracking-widest
Badges:           text-[10px] font-black uppercase tracking-widest
```

- ✅ `font-black` é o peso padrão para títulos — não usar `font-bold` em H1/H2
- ✅ `tracking-tight` em títulos grandes
- ✅ `uppercase tracking-widest` apenas em labels/eyebrows
- ❌ PROIBIDO: font-size acima de `text-7xl`
- ❌ PROIBIDO: decorações de texto (underline colorido, text-shadow)
- ❌ PROIBIDO: misturar pesos diferentes no mesmo bloco sem hierarquia clara

### Espaçamento Padrão

```
Padding de seção:   px-6 md:px-10 lg:px-14 py-8
Padding de conteúdo: pb-14 pt-2 (após header)
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

**Ícones:**
```tsx
// Container
className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center"
// Ícone dentro
className="w-5 h-5 text-zinc-900"
// Variante accent (último pilar, destaque)
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

**SectionHeader:** Sempre usar o componente `@/components/plan/SectionHeader` para cabeçalhos de seção — nunca criar um novo. Props: `eyebrow`, `titleLine1`, `titleLine2?`, `description?`.

### O que nunca fazer em UI

- ❌ Não criar elementos com `bg-blue-*`, `bg-purple-*`, `bg-orange-*`, `bg-red-*` como cores primárias
- ❌ Não usar `shadow-lg` ou `shadow-xl` — máximo `shadow-sm`
- ❌ Não criar novos componentes de header de seção — usar `SectionHeader`
- ❌ Não usar `rounded-full` em cards/containers (apenas em dots de timeline e avatars)
- ❌ Não adicionar animações de entrada/saída (sem framer-motion em páginas de plano)
- ❌ Não usar emojis em UI — usar Lucide icons
- ❌ Não criar botões coloridos em telas de apresentação ao cliente (apenas zinc ou white)

---

## Arquitetura de Geração do Plano

```
REI Responses (form data)
        ↓
generate-strategic-plan (Supabase Edge Function)
        ↓ busca transcript no Notion (via email/empresa)
GPT-4o com prompt estruturado
        ↓
JSON: { summary, context_mirror, signals, risks, decisions,
        pillars, methodology_steps, roadmap_phases, okrs, onboarding_data }
        ↓
Salvo em strategic_plans.diagnostic_data (jsonb)
        ↓
StrategicPlanPresentation → renderiza sections
```

**CRÍTICO — Detecção de tipo CRM:** A edge function detecta CRM por string matching frágil:
```ts
const isCrmOps = objective?.includes('CRM') || objective?.includes('RevOps') || objective?.includes('Operações');
```
Isso é um bug conhecido. Não criar lógica que dependa de string matching para detecção de tipo.

---

## Convenções de Código

- Componentes de seção do plano ficam em `src/pages/client/sections/`
- Nomenclatura: `[Nome]Section.tsx` — PascalCase
- Props padrão: `{ plan: any, client?: any }` — tipar mais estritamente ao refatorar
- Dados do plano acessados via: `plan.diagnostic_data`, `plan.roadmap_data`, `plan.okr_data`, `plan.onboarding_data`
- Campos do cliente: `client.company`, `client.logo_url`, `client.email`
- Sempre usar `|| []` e `|| {}` para fallback de dados da IA — o JSON pode ter campos ausentes
- Imports de ícones: sempre de `lucide-react`, nunca instalar outras libs de ícones

---

## Problemas Arquiteturais Conhecidos (não "corrigir" sem planejamento)

1. `crm_ops` fora do sistema `REIConfig` — campos com padrão diferente dos demais REIs
2. `reiScoring.ts` usa `WizardData` desconectada dos REIs reais — scores no DB podem ser incorretos
3. Sem bloco universal de identificação entre REIs — cada um tem campos de empresa/email diferentes
4. Schema de plano gerado é único para todos os tipos — não há prompt específico por REI type
5. `site` e `funnel` têm tipo em `REIType` mas sem config de perguntas dedicada

