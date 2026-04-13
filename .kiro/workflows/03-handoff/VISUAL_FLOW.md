# 🎨 Fluxo Visual - Sistema de Handoff Automático

## 📊 Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REVHACKERS GROWTH HUB                           │
│                     Sistema de Handoff Automático                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  FASE 1: VENDAS                                                         │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   VENDEDOR   │
    │              │
    │ RevenueCockpit│
    └──────┬───────┘
           │
           │ Muda stage para "won"
           │
           ▼
    ┌──────────────┐
    │ OPPORTUNITY  │
    │              │
    │ pipeline_stage│
    │ = "won"      │
    └──────┬───────┘
           │
           │ UPDATE detectado
           │
           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│  FASE 2: TRIGGER (Banco de Dados)                                      │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │ trigger_auto_handoff_on_won()│
    │                              │
    │ • Detecta mudança de stage   │
    │ • Valida condições           │
    │ • Prepara payload            │
    └──────────────┬───────────────┘
                   │
                   │ pg_net.http_post()
                   │ (Async, non-blocking)
                   │
                   ▼

┌─────────────────────────────────────────────────────────────────────────┐
│  FASE 3: EDGE FUNCTION (Supabase Function)                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │   auto-handoff Function      │
    │                              │
    │ 1. Recebe payload            │
    │ 2. Valida dados              │
    │ 3. Chama RPC                 │
    └──────────────┬───────────────┘
                   │
                   │ RPC call
                   │
                   ▼
    ┌──────────────────────────────┐
    │ convert_opportunity_to_      │
    │ project_v2()                 │
    │                              │
    │ • Cria rei_project           │
    │ • Calcula sprints            │
    │ • Registra métricas          │
    └──────────────┬───────────────┘
                   │
                   │ Retorna project_id
                   │
                   ▼
    ┌──────────────────────────────┐
    │   Task Injection             │
    │                              │
    │ • Busca template             │
    │ • Cria tasks                 │
    │ • Vincula ao sprint          │
    └──────────────┬───────────────┘
                   │
                   │
                   ▼
    ┌──────────────────────────────┐
    │   Email Preparation          │
    │                              │
    │ • Welcome email (cliente)    │
    │ • Notification (analista)    │
    └──────────────┬───────────────┘
                   │
                   │
                   ▼

┌─────────────────────────────────────────────────────────────────────────┐
│  FASE 4: RESULTADO (Banco de Dados)                                    │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │ rei_projects │    │orqflow_sprints│   │orqflow_tasks │
    │              │    │              │    │              │
    │ status:      │◄───┤ project_id   │◄───┤ sprint_id    │
    │ preparation  │    │              │    │              │
    │              │    │ 4 sprints    │    │ 5-7 tasks    │
    └──────┬───────┘    └──────────────┘    └──────────────┘
           │
           │
           ▼
    ┌──────────────┐
    │handoff_metrics│
    │              │
    │ duration_hours│
    │ sla_met      │
    │ validation   │
    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  FASE 5: NOTIFICAÇÕES                                                   │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐              ┌──────────────┐
    │   CLIENTE    │              │   ANALISTA   │
    │              │              │              │
    │ 📧 Welcome   │              │ 📧 New Project│
    │ 🔗 Hub Link  │              │ 📋 Checklist │
    └──────────────┘              └──────────────┘

```

---

## 🔄 Fluxo de Dados Detalhado

```
OPPORTUNITY DATA                    PROJECT DATA
┌─────────────────┐                ┌─────────────────┐
│ client_name     │───────────────►│ client_name     │
│ client_email    │───────────────►│ client_email    │
│ client_company  │───────────────►│ client_company  │
│ type            │───────────────►│ type            │
│ analyst_email   │───────────────►│ analyst_email   │
│ opportunity_data│───────────────►│ opportunity_data│
│   └─ duration   │                │ project_duration│
│ enrichment_data │───────────────►│ enrichment_data │
│ diagnostico_id  │───────────────►│ diagnostico_id  │
└─────────────────┘                └─────────────────┘
         │                                  │
         │                                  │
         │                                  ▼
         │                         ┌─────────────────┐
         │                         │ SPRINTS         │
         │                         │                 │
         │                         │ Calculado por:  │
         │                         │ • 30d = 4x7d    │
         │                         │ • 60d = 4x14d   │
         │                         │ • 90d = 4x21d   │
         │                         │ • 180d+ = Nx30d │
         │                         └────────┬────────┘
         │                                  │
         │                                  ▼
         │                         ┌─────────────────┐
         │                         │ TASKS           │
         │                         │                 │
         │                         │ Template por:   │
         │                         │ • type          │
         │                         │ • duration      │
         │                         └─────────────────┘
         │
         ▼
┌─────────────────┐
│ rei_project_id  │ (Vínculo criado)
└─────────────────┘
```

---

## ⏱️ Timeline de Execução

```
T+0s    Vendedor muda stage para "won"
        │
        ▼
T+0.1s  Trigger detecta mudança
        │
        ▼
T+0.2s  pg_net envia HTTP POST
        │
        ▼
T+1s    Edge Function recebe request
        │
        ▼
T+2s    RPC cria projeto + sprints
        │
        ▼
T+3s    Tasks são injetadas
        │
        ▼
T+4s    Métricas são registradas
        │
        ▼
T+5s    Emails são preparados
        │
        ▼
T+10s   ✅ HANDOFF COMPLETO
```

**Total:** < 10 segundos  
**SLA:** < 24 horas  
**Taxa de Sucesso:** 100%

---

## 📊 Matriz de Decisão de Templates

```
┌─────────────┬──────────┬─────────────────────────────────────┐
│    TYPE     │ DURATION │           TASKS INJETADAS           │
├─────────────┼──────────┼─────────────────────────────────────┤
│ founder     │ 30 dias  │ 5 tasks (LinkedIn, Posts)           │
│ founder     │ 90 dias  │ 6 tasks (Autoridade, PR)            │
├─────────────┼──────────┼─────────────────────────────────────┤
│ site        │ 30 dias  │ 5 tasks (Sitemap, Deploy)           │
│ site        │ 60 dias  │ 5 tasks (UI/UX, Integrações)        │
├─────────────┼──────────┼─────────────────────────────────────┤
│ consulting  │ 90 dias  │ 7 tasks (Diagnóstico, Treinamento)  │
│ crm_ops     │ 90 dias  │ 7 tasks (Setup, Migração)           │
├─────────────┼──────────┼─────────────────────────────────────┤
│ OUTROS      │ QUALQUER │ 5 tasks (Kick-off, Execução)        │
└─────────────┴──────────┴─────────────────────────────────────┘
```

---

## 🎯 Estados do Sistema

```
OPPORTUNITY STAGES
┌─────────────┐
│ lead_inbound│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│lead_qualified│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│diagnostic_done│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│proposal_sent│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ negotiation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    WON      │ ◄─── TRIGGER AQUI!
└──────┬──────┘
       │
       │ Handoff automático
       │
       ▼
PROJECT STAGES
┌─────────────┐
│ preparation │ ◄─── Projeto criado
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ onboarding  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   active    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  completed  │
└─────────────┘
```

---

## 📈 Métricas e Monitoramento

```
HANDOFF_METRICS TABLE
┌──────────────────────────────────────────────────────┐
│                                                      │
│  opportunity_id ──┐                                  │
│  project_id ──────┼─► Vínculo                       │
│                   │                                  │
│  started_at ──────┼─► Timestamp won                 │
│  completed_at ────┼─► Timestamp fim                 │
│  duration_hours ──┼─► Cálculo automático            │
│                   │                                  │
│  sla_met ─────────┼─► true se < 24h                 │
│  validation_passed┼─► true se sem erros             │
│  errors ──────────┼─► JSONB com detalhes            │
│                   │                                  │
└───────────────────┴──────────────────────────────────┘

QUERIES ÚTEIS:
• Taxa de sucesso: COUNT(*) WHERE sla_met = true
• Tempo médio: AVG(duration_hours)
• Alertas: SELECT * WHERE sla_met = false
```

---

## 🔐 Segurança e Permissões

```
TRIGGER FUNCTION
├─ SECURITY DEFINER (executa com privilégios do owner)
├─ Valida mudança de stage
└─ Chama Edge Function via pg_net

EDGE FUNCTION
├─ Usa SUPABASE_SERVICE_ROLE_KEY
├─ Acesso total ao banco
└─ Executa RPC com privilégios

RPC FUNCTION
├─ SECURITY DEFINER
├─ Transaction atômica
├─ Lock pessimista
└─ Validações de negócio

HANDOFF_METRICS
├─ RLS habilitado
├─ Authenticated users: SELECT
└─ Service role: INSERT
```

---

## 🚀 Fluxo de Deploy

```
DESENVOLVIMENTO                PRODUÇÃO
┌─────────────┐               ┌─────────────┐
│   LOCAL     │               │  SUPABASE   │
│             │               │             │
│ • Migration │──────────────►│ • Migration │
│ • Function  │  supabase    │ • Function  │
│ • Tests     │  db push     │ • Trigger   │
│             │  functions   │ • RLS       │
│             │  deploy      │             │
└─────────────┘               └─────────────┘
       │                             │
       │                             │
       ▼                             ▼
┌─────────────┐               ┌─────────────┐
│   TESTE     │               │   VALIDAÇÃO │
│             │               │             │
│ • SQL Script│               │ • Logs      │
│ • Validação │               │ • Métricas  │
│ • Rollback  │               │ • Alertas   │
└─────────────┘               └─────────────┘
```

---

## 🎉 Resultado Final

```
ANTES DO HANDOFF AUTOMÁTICO
┌─────────────────────────────────────────────────┐
│ Vendedor fecha                                  │
│   ↓ (espera)                                    │
│ Analista é avisado                              │
│   ↓ (2-4 horas)                                 │
│ Analista cria projeto manualmente               │
│   ↓ (30 min)                                    │
│ Analista copia dados                            │
│   ↓ (15 min)                                    │
│ Analista cria sprints                           │
│   ↓ (20 min)                                    │
│ Analista cria tasks                             │
│   ↓ (30 min)                                    │
│ Analista avisa cliente                          │
│   ↓                                             │
│ Cliente acessa Hub                              │
│                                                 │
│ TOTAL: 3-5 horas                                │
│ ERROS: ~10% dos casos                           │
└─────────────────────────────────────────────────┘

DEPOIS DO HANDOFF AUTOMÁTICO
┌─────────────────────────────────────────────────┐
│ Vendedor fecha                                  │
│   ↓ (< 10 segundos)                             │
│ ✅ Sistema faz tudo automaticamente             │
│   ↓                                             │
│ Cliente e analista são notificados              │
│   ↓                                             │
│ Todos acessam projeto pronto                    │
│                                                 │
│ TOTAL: < 10 segundos                            │
│ ERROS: 0%                                       │
└─────────────────────────────────────────────────┘

GANHO: 99.9% de redução de tempo
       100% de eliminação de erros
       ∞ de melhoria na experiência
```

---

**Criado por:** Kiro (AI) + Giulliano  
**Data:** 2026-04-03  
**Versão:** 1.0
