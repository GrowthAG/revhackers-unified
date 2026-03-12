# RevHackers Growth Hub — Contexto Completo de Sessão

## O Projeto
Plataforma interna de geração de Planejamentos Estratégicos personalizados para clientes B2B.
Stack: React + TypeScript + Vite + Supabase (DB + Edge Functions Deno) + Tailwind CSS + shadcn/ui.
Design System: "Nobibecode" — apenas zinc scale + #00CC6A como accent. Sem gradientes, sem 
shadow-lg, sem cores vibrantes. Font-black em títulos, font-medium em body.

Branch ativa: `develop`. Repositório: GrowthAG/revhackers-growth-hub.

---

## O que foi feito nessa sessão

### Auditoria completa de ponta a ponta
Mapeei todo o fluxo de dados: REI form → StrategicEnrichmentService (Perplexity) → 
generate-strategic-plan (GPT-4o Edge Function) → DiagnosticService → Supabase DB → 
19 seções do StrategicPlanPresentation.

Identifiquei e corrigi 3 bugs críticos + 1 restauração de seção ausente.

---

## Bug 1 — onboarding_data nunca era salvo no banco
**Arquivo:** `src/pages/admin/StrategicPlanGenerator.tsx` (~linha 383)

**Problema:** A Edge Function GPT-4o gerava o `onboarding_data` completo 
(kickoff, setup, training, adoption, handover) mas ele nunca era incluído no 
objeto `finalPlanData` antes do `supabase.from('strategic_plans').upsert()`.
As 5 seções de onboarding sempre exibiam apenas placeholders.

**Fix aplicado:**
```ts
const finalPlanData = {
    ...dbSafePlanData,
    onboarding_data: aiPlanData?.onboarding_data || null,  // ← ADICIONADO
    persona_data: personaData,
    rei_project_id: reiProjectId,
    ...
};
```

## Bug 2 — OKRs da IA nunca eram exibidos na GoalsSection
**Arquivo:** `src/services/DiagnosticService.ts` (~linha 390)

**Problema:** Incompatibilidade de schema entre IA e frontend.

GPT-4o retorna: `okrs: [{ description, timeline, sub_results: ["KR1", "KR2"] }]`
GoalsSection lê: `okrs[i].krs[j].text` (formato `{label, text, target}`)
O merge `{ ...baseOKRs[i], ...aiOKR }` preservava os KRs hardcoded do base porque `sub_results` nunca era mapeado para `krs`.

**Fix aplicado:**
```ts
goals_data: aiPlanData?.okrs ? {
    okrs: aiPlanData.okrs.map((o: any) => ({
        ...o,
        krs: Array.isArray(o.sub_results) && o.sub_results.length > 0
            ? o.sub_results.map((text: string, j: number) => ({
                label: `RK ${j + 1}`,
                text,
                target: o.timeline || 'Trimestre'
            }))
            : (o.krs || [])
    }))
} : this.generateGoals(objective, growthGoal, answers, projectType),
```

## Bug 3 — SlaSection ausente da apresentação do cliente
**Arquivo:** `src/pages/client/StrategicPlanPresentation.tsx`

**Problema:** A seção "Regras do Jogo" (SlaSection) foi removida acidentalmente durante a refatoração das 19 seções. O arquivo `src/pages/client/sections/SlaSection.tsx` existia e estava completo (adapta conteúdo para crm_ops vs full), mas não estava importado nem roteado. O cliente não via as responsabilidades de cada lado.

**Fix aplicado:**
- Adicionado `ShieldCheck` ao import de `lucide-react`
- Removido import morto de `ApprovalSection` (lógica era inline)
- Adicionado import: `import SlaSection from './sections/SlaSection'`
- Adicionado ao `NAV_SECTIONS` entre Handover e Projeções:
  `{ id: 'sla', name: 'Regras do Jogo', icon: <ShieldCheck className="w-4 h-4" /> }`
- Adicionado ao switch renderSection:
  `case 'sla': return <SlaSection plan={plan} client={client} />;`

## Estado atual das 19 seções (após correções)
| ID da Seção | Fonte de Dados | Status |
|---|---|---|
| 1. cover | `client.company` + `plan.created_at` | ✅ Dinâmico |
| 2. premises | `premises_data.pillars` (GPT-4o) | ✅ IA |
| 3. diagnostic_symptoms | `diagnostic_data.signals` + `context_mirror` | ✅ IA |
| 4. diagnostic_causes | `diagnostic_data.risks` + `decisions` | ✅ IA |
| 5. thesis | Hardcoded | ✅ Intencional |
| 6. persona | `persona_data.personas` (Perplexity) | ✅ IA |
| 7. benchmark | `persona_data market data` (Perplexity) | ✅ IA |
| 8. methodology | Hardcoded | ✅ Intencional |
| 9. goals | `goals_data.okrs.krs` | ✅ IA (bug 2 corrigido) |
| 10. roadmap_macro | `roadmap_data.phases` (GPT-4o) | ✅ IA |
| 11. onboarding_kickoff | `onboarding_data.kickoff` (GPT-4o) | ✅ IA (bug 1 corrigido) |
| 12. onboarding_setup | `onboarding_data.setup` (GPT-4o) | ✅ IA (bug 1 corrigido) |
| 13. onboarding_training | `onboarding_data.training` (GPT-4o) | ✅ IA (bug 1 corrigido) |
| 14. onboarding_adoption | `onboarding_data.adoption` (GPT-4o) | ✅ IA (bug 1 corrigido) |
| 15. onboarding_handover | `onboarding_data.handover` (GPT-4o) | ✅ IA (bug 1 corrigido) |
| 16. sla | Hardcoded por `project_type` | ✅ Restaurado (bug 3 corrigido) |
| 17. projections | `financial_projections` (DiagnosticService) | ✅ Gerado |
| 18. investment | `budget_data` (admin preenche) | ✅ OK por design |
| 19. approval | Inline no Presentation | ✅ Assinatura digital |

**Filtros por tipo de projeto:**
- `crm_ops`: remove seções projections, investment, persona, benchmark
- `full / consulting`: exibe todas as 19 seções

## Pipeline de IA (ordem de execução no StrategicPlanGenerator)
1. **REI Form (admin)** → `rei_responses.responses.form_data`
2. **StrategicEnrichmentService** (Perplexity — não-bloqueante)
   → personas, competitor_benchmarks, industry_trends, benchmark CAC/LTV
   → salvo em: `persona_data`
3. **generate-strategic-plan** (GPT-4o — Edge Function Supabase)
   → recebe: rei_responses + segment + objective + isB2B
   → busca transcript no Notion automaticamente por email/empresa
   → retorna: summary, context_mirror, signals, risks, decisions, pillars, methodology_steps, roadmap_phases, okrs, onboarding_data
4. **DiagnosticService.generateDiagnosis()**
   → orquestra: `aiPlanData` (GPT-4o) + `marketCtx` (Perplexity) + `answers` (REI)
   → aplica fallbacks: se IA falhou, gera dados baseados no REI
   → monta todos os campos do banco
   → SEMPRE verifica `projectType` antes de ler campos do formulário
5. **supabase.from('strategic_plans').upsert(finalPlanData)**
   → salva todas as colunas JSON no banco

## Schema exato que a Edge Function GPT-4o gera
```json
{
  "summary": "string",
  "context_mirror": {
    "maturity": "string",
    "restrictions": "string"
  },
  "signals": [
    { "type": "positive|negative|neutral", "text": "string", "impact": "string" }
  ],
  "risks": [
    { "severity": "high|medium|low", "text": "string", "mitigation": "string" }
  ],
  "decisions": [
    {
      "title": "string",
      "recommendation": "string",
      "basedOn": ["string"],
      "ruleApplied": "string"
    }
  ],
  "pillars": [
    { "name": "string", "icon": "building|settings|search|chart|handshake", "items": ["string"] }
  ],
  "roadmap_phases": [
    { "name": "Ciclo 01", "title": "string", "items": ["string"] }
  ],
  "okrs": [
    { "description": "string", "timeline": "string", "sub_results": ["string"] }
  ],
  "onboarding_data": {
    "kickoff": {
      "main_title": "string", "subtitle": "string",
      "p1_title": "string", "p1_desc": "string", "p1_output": "string",
      "p2_title": "string", "p2_desc": "string", "p2_output": "string",
      "p3_title": "string", "p3_desc": "string", "p3_output": "string"
    },
    ...
  }
}
```

IMPORTANTE: `context_mirror` da IA só retorna `maturity` e `restrictions`. `segment` e `objective` são injetados pelo `DiagnosticService` via fallback das respostas REI — garantindo que sempre estejam presentes.

## Regra de Ouro — Cada REI é um REI
Os tipos de projeto têm formulários e campos completamente distintos:

| Tipo | Campos únicos | Lógica específica |
|---|---|---|
| crm_ops | `revops_hub_central`, `revops_custom_pipelines`, `revops_lost_reasons`, `revops_sla_*` | GPT-4o recebe prompt focado em 90 dias de implementação RevOps |
| full / consulting | `canais`, `budget`, `concorrentes`, `crm`, `temCRM` | GPT-4o recebe prompt de growth marketing |
| funnels_impl | Campos de site/funil | Fluxo próprio |
| content_seo | Campos de conteúdo | Fluxo próprio |

NUNCA ler `answers.budget` em um projeto `crm_ops`.
NUNCA ler `answers.revops_pipeline_stagnation` em um projeto `full`.
O `DiagnosticService` já tem guards `if (projectType === 'crm_ops')` em todo lugar — manter esse padrão.

## Arquivos críticos para qualquer nova feature
- `src/pages/admin/StrategicPlanGenerator.tsx` — orquestrador da geração
- `src/services/DiagnosticService.ts` — monta todos os dados do plano
- `src/services/StrategicEnrichmentService.ts` — Perplexity (personas + market)
- `supabase/functions/generate-strategic-plan/index.ts` — Edge Function GPT-4o
- `src/pages/client/StrategicPlanPresentation.tsx` — apresentação das 19 seções
- `src/pages/client/sections/*` — cada seção individual
- `src/components/plan/PlanEditContext.tsx` — EditableField (edição inline)
- `src/components/plan/SectionHeader.tsx` — cabeçalho padrão Nobibecode

## Gaps identificados para próximas evoluções

### 1. Website Scraping para enriquecimento do diagnóstico
O REI coleta URL do site do cliente. O StrategicEnrichmentService usa Perplexity que é nativo para busca na web. Passar website_url como contexto adicional permitiria: análise real de tech stack, copy de CTAs, estrutura do funil, presença orgânica — tudo isso antes de gerar o diagnóstico.
Ponto de entrada: `StrategicEnrichmentService.getFullEnrichment(segment, { website_url, ... })`

### 2. Campo de Concorrentes no REI crm_ops
O REI full tem `answers.concorrentes[]` que alimenta o benchmark via Perplexity. O REI crm_ops não tem esse campo — gap real de inteligência competitiva.
Proposta: Adicionar `revops_concorrentes` no formulário crm_ops. O StrategicEnrichmentService já sabe usar esse dado.

### 3. objective dos OKRs secundários ainda hardcoded
Os cabeçalhos dos cards 01–04 da GoalsSection (ex: "RK 1 — Infraestrutura e Fundação") ainda vêm dos defaults hardcoded porque a IA não gera campo objective nos OKRs secundários.
Solução simples: Adicionar `objective: string` no schema dos `okrs[]` da Edge Function. O GoalsSection já faz o merge automaticamente.
