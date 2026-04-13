# 🚀 START HERE - Guia de Início Rápido

**Data:** 2026-04-03  
**Status:** Pronto para começar

## 🎯 Por Onde Começar?

Vamos seguir a ordem de **maior impacto com menor esforço** (Quick Wins primeiro):

## 📍 Fase 0: Validação e Mapeamento (AGORA - 2h)

Antes de automatizar, precisamos entender o estado atual:

### ✅ Checklist de Validação

1. **Mapear Fluxo Atual**
   - [ ] Como funciona hoje quando uma oportunidade vira "won"?
   - [ ] Quem faz o quê manualmente?
   - [ ] Quanto tempo demora?
   - [ ] O que pode dar errado?

2. **Identificar Dados Críticos**
   - [ ] Quais campos são obrigatórios para criar um projeto?
   - [ ] Quais dados vêm do diagnóstico?
   - [ ] Quais dados vêm da proposta?
   - [ ] O que está faltando hoje?

3. **Validar Casos Reais**
   - [ ] Pegar 1 opportunity "won" recente (Tunad ou Sarah)
   - [ ] Verificar se tem todos os dados necessários
   - [ ] Simular o handoff automático
   - [ ] Identificar gaps

### 🔍 Perguntas Críticas para Responder

```
1. Quando uma opportunity vira "won", o que acontece HOJE?
   → Analista cria projeto manualmente?
   → Quanto tempo demora?
   → Alguma coisa se perde?

2. Quais são os BLOCKERS mais comuns?
   → Falta de dados?
   → Falta de acessos?
   → Cliente não responde?

3. O que o CLIENTE vê hoje?
   → Ele sabe que mudou de "vendas" para "entrega"?
   → Ele recebe algum email?
   → Ele sabe o que esperar?

4. Qual é o MAIOR PROBLEMA hoje?
   → Demora muito?
   → Perde contexto?
   → Cliente fica confuso?
```

## 📊 Fase 1: Quick Win - Checklist Manual (Hoje - 4h)

Antes de automatizar, vamos criar um checklist manual que funcione 100%:

### Passo 1: Criar Template de Checklist (1h)

```markdown
# Checklist de Handoff Vendas → CS

**Opportunity ID:** _______
**Cliente:** _______
**Analista:** _______
**Data Won:** _______

## Pré-Requisitos (Vendas)
- [ ] Proposta assinada
- [ ] Diagnóstico completo (score > 0)
- [ ] Stakeholders mapeados (min 2)
  - [ ] Nome + Email + Cargo
- [ ] Tipo de projeto definido (consulting/crm_ops/founder/dev)
- [ ] Duração definida (30/60/90 dias)
- [ ] Investimento acordado
- [ ] Expectativas documentadas

## Dados do Cliente
- [ ] Nome completo
- [ ] Email principal
- [ ] Empresa (razão social)
- [ ] Nome fantasia (trade_name)
- [ ] Site
- [ ] CNPJ (opcional)

## Contexto de Vendas
- [ ] Principais dores identificadas
- [ ] Promessas feitas
- [ ] Objeções superadas
- [ ] Motivo da compra
- [ ] Urgência/Timeline

## Preparação CS
- [ ] Analista atribuído
- [ ] Materiais solicitados ao cliente
- [ ] Acessos solicitados (CRM, site, etc)
- [ ] Kickoff agendado (data/hora)
- [ ] Agenda de kickoff preparada

## Comunicação
- [ ] Email de boas-vindas enviado ao cliente
- [ ] Analista notificado
- [ ] Link do Hub do Cliente enviado
- [ ] Próximos passos claros

## Validação Final
- [ ] Projeto criado no sistema
- [ ] Sprints planejados
- [ ] Tasks iniciais criadas
- [ ] Cliente tem acesso ao Hub
- [ ] SLA cumprido (< 24h)

---
**Responsável:** _______
**Data de Conclusão:** _______
**Tempo Total:** _______
```

### Passo 2: Testar com 1 Caso Real (2h)

Escolher 1 opportunity recente e executar o checklist manualmente:
- Preencher todos os campos
- Identificar o que está faltando
- Cronometrar cada etapa
- Documentar problemas encontrados

### Passo 3: Refinar Checklist (1h)

Baseado no teste:
- Adicionar campos que faltaram
- Remover campos desnecessários
- Ajustar ordem das etapas
- Definir responsáveis claros

**Entregável:** Checklist validado e funcionando 100% manualmente

## 🤖 Fase 2: Automação Básica (Amanhã - 6h)

Agora que sabemos o que funciona manualmente, vamos automatizar:

### Passo 1: Criar Supabase Function (3h)

```typescript
// supabase/functions/auto-handoff/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { opportunity_id } = await req.json()

  // 1. Buscar opportunity
  const { data: opp } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunity_id)
    .single()

  // 2. Validar checklist
  const validation = validateHandoff(opp)
  if (!validation.isValid) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', missing: validation.missing }),
      { status: 400 }
    )
  }

  // 3. Criar projeto
  const { data: project } = await supabase
    .from('rei_projects')
    .insert({
      type: opp.type,
      client_name: opp.client_name,
      client_email: opp.client_email,
      client_company: opp.client_company,
      status: 'onboarding',
      analyst_email: opp.analyst_email,
      // ... outros campos
    })
    .select()
    .single()

  // 4. Vincular opportunity ao projeto
  await supabase
    .from('opportunities')
    .update({ rei_project_id: project.id })
    .eq('id', opportunity_id)

  // 5. Criar sprints e tasks
  // ... (implementar depois)

  // 6. Enviar emails
  // ... (implementar depois)

  return new Response(
    JSON.stringify({ success: true, project_id: project.id }),
    { status: 200 }
  )
})
```

### Passo 2: Criar Trigger (1h)

```sql
-- supabase/migrations/YYYYMMDD_auto_handoff_trigger.sql

CREATE OR REPLACE FUNCTION auto_handoff_on_won()
RETURNS TRIGGER AS $$
BEGIN
  -- Só dispara se mudou para "won"
  IF NEW.pipeline_stage = 'won' AND OLD.pipeline_stage != 'won' THEN
    -- Chamar edge function
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/auto-handoff',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object('opportunity_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_opportunity_won
  AFTER UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION auto_handoff_on_won();
```

### Passo 3: Testar (2h)

- Criar opportunity de teste
- Mudar para "won"
- Verificar se trigger dispara
- Validar projeto criado
- Ajustar bugs

**Entregável:** Handoff automático básico funcionando

## 🎨 Fase 3: UI e Comunicação (Dia 3 - 6h)

### Passo 1: Dashboard de Handoff (3h)

Adicionar no `RevenueCockpit.tsx`:
- Badge de "Handoff Pendente" em opportunities won
- Indicador de SLA (verde/amarelo/vermelho)
- Botão "Executar Handoff Manual" (fallback)

### Passo 2: Email Templates (2h)

Criar templates em `supabase/functions/send-email/`:
- Boas-vindas ao cliente
- Notificação ao analista
- Lembrete de kickoff

### Passo 3: Portal do Cliente (1h)

Adicionar no `ClientProjectHub.tsx`:
- Badge "Novo Projeto"
- Seção "Bem-vindo"
- Timeline de próximos passos

**Entregável:** Cliente e analista recebem comunicação automática

## 📈 Fase 4: Métricas e Monitoramento (Dia 4 - 4h)

### Passo 1: Criar Tabela de Métricas (1h)

```sql
CREATE TABLE handoff_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_hours NUMERIC,
  sla_met BOOLEAN,
  validation_passed BOOLEAN,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Passo 2: Dashboard de Métricas (2h)

Criar página `AdminHandoffMetrics.tsx`:
- Handoff Success Rate
- Tempo médio de handoff
- SLA Compliance
- Gráfico de evolução

### Passo 3: Alertas (1h)

Sistema de alertas para:
- SLA em risco (> 20h)
- Validação falhou
- Erro no handoff

**Entregável:** Métricas e alertas funcionando

## 🎯 Resumo: Ordem de Execução

```
DIA 1 (Hoje - 6h total)
├─ Manhã (2h): Fase 0 - Validação e Mapeamento
│  └─ Entender fluxo atual + identificar gaps
│
└─ Tarde (4h): Fase 1 - Checklist Manual
   └─ Criar + testar + refinar checklist

DIA 2 (Amanhã - 6h)
└─ Fase 2 - Automação Básica
   ├─ Supabase Function (3h)
   ├─ Trigger (1h)
   └─ Testes (2h)

DIA 3 (6h)
└─ Fase 3 - UI e Comunicação
   ├─ Dashboard (3h)
   ├─ Emails (2h)
   └─ Portal Cliente (1h)

DIA 4 (4h)
└─ Fase 4 - Métricas
   ├─ Tabela (1h)
   ├─ Dashboard (2h)
   └─ Alertas (1h)

TOTAL: 22h (3 dias úteis)
```

## 🚀 Começar AGORA

### Ação Imediata (Próximos 30min)

1. **Escolher 1 caso real** para validar
   - Tunad ou Sarah?
   - Ou criar opportunity de teste?

2. **Responder perguntas críticas**
   - Como funciona hoje?
   - Qual o maior problema?
   - O que o cliente vê?

3. **Decidir prioridade**
   - Começar pelo checklist manual?
   - Ou ir direto para automação?

---

**Próximo Passo:** Você decide! O que faz mais sentido começar?

A) Mapear fluxo atual (Fase 0)
B) Criar checklist manual (Fase 1)
C) Ir direto para automação (Fase 2)

**Minha recomendação:** Começar pela Fase 0 (2h) para entender bem o problema antes de automatizar.
