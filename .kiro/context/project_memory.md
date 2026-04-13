# RevHackers Growth Hub - Memória de Contexto Permanente

> **ATENÇÃO KIRO/CLAUDE**: Sempre leia este arquivo no início de QUALQUER sessão sobre este projeto.

## 🎯 Visão Geral do Projeto

**Nome:** RevHackers Growth Hub  
**Tipo:** Plataforma SaaS B2B de Revenue Operations  
**Stack:** React + TypeScript + Vite + Supabase + Tailwind CSS  
**Deploy:** Hostinger via FTP  
**Domínio:** revhackers.com.br

## 🏗️ Arquitetura Core

### Fluxo Principal
```
Lead → Diagnóstico REI → Proposta → Fechamento (Won) → Onboarding → Execução (Sprints) → Entrega
```

### Separação de Responsabilidades
- **Opportunities (Vendas)**: Tabela `opportunities` - Pipeline comercial até "won"
- **Projects (CS/Entrega)**: Tabela `rei_projects` - Execução pós-venda
- **Orqflow (Tasks)**: Tabela `orqflow_tasks` + `orqflow_sprints` - Gestão de entregas

## 📊 Tipos de REI (Diagnósticos)

| Tipo | Arquivo Config | Público-Alvo | Duração Típica |
|------|---------------|--------------|----------------|
| `consulting` | `src/config/rei/consultingQuestions.ts` | Growth 360° | 90 dias |
| `crm_ops` | `src/components/rei/steps/StepCrmOps*.tsx` | RevOps/CRM | 60 dias |
| `founder` | `src/config/rei/founderQuestions.ts` | Personal Branding | 30 dias |
| `dev` | `src/config/rei/devQuestions.ts` | Sites/LPs | 45 dias |
| `site` | (sem config dedicado) | Auditoria Web | 30 dias |
| `funnel` | (sem config dedicado) | Automações | 60 dias |

## 🎨 Design System "Nobibecode"

### Regras IMUTÁVEIS
- ✅ Paleta: zinc scale (preto/branco/cinza)
- ✅ Único accent: `#00CC6A` (verde RevHackers)
- ✅ Tipografia: `font-black` para títulos, `font-medium` para body
- ❌ PROIBIDO: gradientes, cores vibrantes, em dashes (—)
- ❌ PROIBIDO: `shadow-lg`, `rounded-full` em cards

### Componentes Padrão
```tsx
// Header de Seção (SEMPRE usar este)
<SectionHeader 
  eyebrow="FASE 01" 
  titleLine1="Diagnóstico" 
  titleLine2="Profundo"
  description="Análise 360° do negócio"
/>

// Card Light
className="border border-zinc-200 rounded-2xl shadow-sm bg-white"

// Card Dark
className="bg-zinc-950 rounded-2xl"

// Badge de Status
className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md"
```

## 🔄 Pipeline de Vendas → CS

### Stages de Opportunity (Vendas)
```typescript
'lead_inbound' → 'lead_qualified' → 'diagnostic_done' → 
'proposal_draft' → 'proposal_sent' → 'proposal_viewed' → 
'negotiation' → 'won' | 'lost'
```

### Stages de Project (CS/Entrega)
```typescript
'onboarding' → 'active' → 'completed' | 'churned'
```

### Handoff Crítico (Vendas → CS)
**Momento:** Quando `opportunity.pipeline_stage = 'won'`  
**Ação Necessária:**
1. Criar `rei_project` com `status = 'onboarding'`
2. Vincular `opportunity.rei_project_id = project.id`
3. Criar sprints no `orqflow_sprints`
4. Injetar tasks do template via `getTemplateForREI()`
5. Enviar email de boas-vindas ao cliente

## 📁 Estrutura de Dados Crítica

### rei_projects (Projetos de Entrega)
```typescript
{
  id: uuid
  type: 'consulting' | 'crm_ops' | 'founder' | 'dev' | 'site' | 'funnel'
  status: 'lead' | 'onboarding' | 'active' | 'completed' | 'churned'
  client_name: string
  client_email: string
  client_company: string
  trade_name: string // Nome fantasia
  analyst_email: string
  project_duration: '30' | '60' | '90' | '180' | '360' // dias
  scheduling_completed: boolean
  next_rei_date: timestamp
  focal_points: FocalPoint[] // Stakeholders
  enrichment_data: jsonb // CNPJ + Site Performance
}
```

### orqflow_tasks (Tasks de Entrega)
```typescript
{
  id: uuid
  project_id: uuid → rei_projects
  sprint_id: uuid → orqflow_sprints
  title: string
  content: jsonb // Tiptap rich content
  status: 'backlog' | 'todo' | 'doing' | 'review' | 'done' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id: uuid → auth.users
  due_date: timestamp
  position_order: integer
  estimated_hours: numeric
}
```

### orqflow_sprints (Ciclos de Entrega)
```typescript
{
  id: uuid
  project_id: uuid → rei_projects
  name: string // "Sprint 01: Setup & Diagnóstico"
  start_date: date
  end_date: date
  status: 'planned' | 'active' | 'completed'
}
```

## 🚨 Problemas Arquiteturais Conhecidos

### 1. CRM_OPS fora do padrão
- Usa `StepCrmOps*.tsx` em vez de config JSON
- Campos com prefixo `revops_` em snake_case
- Não está em `REI_CONFIGS` (`src/config/rei/index.ts`)
- **Ação:** NÃO criar novos REIs com nomenclatura inconsistente

### 2. Detecção de tipo frágil
```typescript
// RUIM (atual)
const isCrmOps = objective?.includes('CRM') || objective?.includes('RevOps');

// BOM (fazer)
const isCrmOps = project.type === 'crm_ops';
```

### 3. Falta de handoff automatizado
- Não existe trigger automático de `won` → criar projeto
- Analista precisa criar manualmente o projeto
- **Oportunidade:** Automatizar com Supabase Function

## 📍 Onde Estamos Agora (Última Atualização)

### Contexto Atual
Giulliano quer criar uma **jornada de passagem de bastão ponta a ponta** entre Vendas e CS, baseada em:
- Livro "Onboarding Orquestrado"
- Livro "Receita Previsível" (Aaron Ross)
- Metodologia Winning by Design (Bow Tie Funnel)

### Objetivo
Criar um sistema onde:
1. Lead entra (diagnóstico/inbound)
2. Vendas qualifica e fecha
3. **Handoff automatizado** para CS
4. CS executa com sprints/tasks visíveis
5. Cliente acompanha tudo no Hub
6. Feedback loop para melhorar vendas

### Próximos Passos
- [ ] Analisar gaps no handoff atual
- [ ] Mapear Bow Tie Funnel no sistema
- [ ] Criar automações de transição
- [ ] Melhorar visibilidade do cliente
- [ ] Implementar health score

## 🔗 Arquivos Críticos

### Configuração
- `src/types/pipeline.ts` - Tipos de stages
- `src/types/rei.ts` - Tipos de REI
- `src/api/reiProjects.ts` - CRUD de projetos
- `src/store/useOrqflow.ts` - State de tasks

### Páginas Admin
- `src/pages/admin/OrchestratedOnboarding.tsx` - Onboarding orquestrado
- `src/pages/admin/RevenueCockpit.tsx` - Pipeline comercial
- `src/pages/admin/ProjectDetails.tsx` - Workspace do projeto

### Páginas Cliente
- `src/pages/client/ClientProjectHub.tsx` - Portal do cliente
- `src/pages/client/StrategicPlanPresentation.tsx` - Plano estratégico

### Workflows
- `.agent/workflows/protocolos_rei.md` - Separação de protocolos
- `.agent/workflows/atualizacao_contexto.md` - Sistema de memória

## 💡 Convenções de Código

### Nomenclatura
- Componentes: PascalCase (`ClientProjectHub.tsx`)
- Funções: camelCase (`getReiProjectById`)
- Constantes: UPPER_SNAKE_CASE (`OPPORTUNITY_STAGES`)
- CSS: kebab-case (`bg-zinc-950`)

### Imports
```typescript
// Ordem padrão
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getReiProjectById } from '@/api/reiProjects';
import type { ReiProject } from '@/api/reiProjects';
```

### Tratamento de Dados
```typescript
// SEMPRE usar fallback para dados da IA
const insights = plan.diagnostic_data?.insights || [];
const pillars = plan.roadmap_data?.pillars || [];

// SEMPRE validar antes de mapear
{Array.isArray(tasks) && tasks.map(task => (...))}
```

## 🎯 Clientes Reais (Não Confundir)

- **Tunad** (Cesar Junior) - Cliente real, projeto CRM Ops
- **Sarah Penido** - Cliente real, projeto Arquitetura
- Não são exemplos, são projetos em produção

## 📝 Notas de Sessão

### Sessão Atual (2026-04-03)
- Giulliano pediu análise ponta a ponta do sistema
- Foco em handoff Vendas → CS
- Referências: Onboarding Orquestrado, Receita Previsível, Winning by Design
- Objetivo: Criar jornada automatizada e visível para o cliente

---

**ÚLTIMA ATUALIZAÇÃO:** 2026-04-03  
**PRÓXIMA REVISÃO:** Sempre que houver mudança arquitetural significativa
