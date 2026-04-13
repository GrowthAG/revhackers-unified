# 🚀 Guia de Deploy - Sistema de Handoff Automático

**Data:** 2026-04-03  
**Status:** Pronto para deploy  
**Tempo Estimado:** 30 minutos

## 📋 Pré-Requisitos

- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Acesso ao projeto Supabase (credenciais)
- [ ] Extensão `pg_net` habilitada no Supabase
- [ ] Variáveis de ambiente configuradas

## 🔧 Passo 1: Configurar Variáveis de Ambiente

No Supabase Dashboard → Settings → API:

```bash
# Anotar estas variáveis:
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
```

## 📦 Passo 2: Deploy da Edge Function

```bash
# 1. Login no Supabase
supabase login

# 2. Link ao projeto
supabase link --project-ref seu-projeto-ref

# 3. Deploy da função
supabase functions deploy auto-handoff

# 4. Configurar secrets (se necessário para email)
supabase secrets set RESEND_API_KEY=re_...
```

## 🗄️ Passo 3: Aplicar Migration

```bash
# 1. Testar migration localmente (opcional)
supabase db reset

# 2. Aplicar em produção
supabase db push

# OU via SQL Editor no Dashboard:
# Copiar e colar o conteúdo de:
# supabase/migrations/20260403000000_auto_handoff_trigger.sql
```

## ✅ Passo 4: Validar Instalação

### 4.1 Verificar Função RPC

```sql
-- No SQL Editor do Supabase
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'convert_opportunity_to_project_v2';

-- Deve retornar 1 linha
```

### 4.2 Verificar Trigger

```sql
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';

-- Deve retornar 1 linha com tgenabled = 'O' (enabled)
```

### 4.3 Verificar Tabela de Métricas

```sql
SELECT * FROM handoff_metrics LIMIT 1;

-- Deve retornar estrutura da tabela (pode estar vazia)
```

### 4.4 Verificar Edge Function

```bash
# Testar endpoint manualmente
curl -X POST https://seu-projeto.supabase.co/functions/v1/auto-handoff \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": "uuid-de-teste",
    "analyst_email": "giulliano@revhackers.com",
    "won_at": "2026-04-03T10:00:00Z"
  }'

# Deve retornar erro 404 ou erro de validação (normal, pois UUID não existe)
# O importante é que a função responda
```

## 🧪 Passo 5: Teste End-to-End

### Cenário 1: Criar Opportunity de Teste

```sql
-- 1. Criar opportunity de teste
INSERT INTO opportunities (
  client_name,
  client_email,
  client_company,
  type,
  pipeline_stage,
  analyst_email,
  opportunity_data
) VALUES (
  'Cliente Teste Handoff',
  'teste@revhackers.com',
  'Empresa Teste LTDA',
  'consulting',
  'negotiation',
  'giulliano@revhackers.com',
  '{"project_duration": "90"}'::jsonb
)
RETURNING id;

-- Anotar o ID retornado
```

### Cenário 2: Simular Fechamento (Won)

```sql
-- 2. Mudar stage para "won" (isso deve disparar o trigger)
UPDATE opportunities
SET pipeline_stage = 'won'
WHERE id = 'uuid-anotado-acima';
```

### Cenário 3: Validar Resultado

```sql
-- 3. Verificar se projeto foi criado
SELECT * FROM rei_projects 
WHERE client_email = 'teste@revhackers.com';

-- Deve retornar 1 projeto com status = 'preparation'

-- 4. Verificar sprints criados
SELECT * FROM orqflow_sprints 
WHERE project_id = 'project-id-do-passo-3';

-- Deve retornar 4 sprints (para projeto de 90 dias)

-- 5. Verificar tasks injetadas
SELECT * FROM orqflow_tasks 
WHERE project_id = 'project-id-do-passo-3';

-- Deve retornar 7 tasks (template consulting 90 dias)

-- 6. Verificar métricas de handoff
SELECT * FROM handoff_metrics 
WHERE opportunity_id = 'uuid-anotado-acima';

-- Deve retornar 1 linha com duration_hours e sla_met
```

## 🐛 Troubleshooting

### Problema: Trigger não dispara

```sql
-- Verificar se trigger está habilitado
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';

-- Se retornar 'D' (disabled), habilitar:
ALTER TABLE opportunities ENABLE TRIGGER trigger_auto_handoff_on_won;
```

### Problema: Edge Function não é chamada

```sql
-- Verificar se pg_net está instalado
SELECT * FROM pg_available_extensions 
WHERE name = 'pg_net';

-- Se não estiver, instalar:
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Problema: Tasks não são injetadas

```sql
-- Verificar logs da Edge Function
-- No Supabase Dashboard → Edge Functions → auto-handoff → Logs

-- Verificar se sprints existem
SELECT COUNT(*) FROM orqflow_sprints 
WHERE project_id = 'seu-project-id';

-- Se 0, o problema está na criação de sprints na RPC
```

### Problema: Emails não são enviados

```
Emails estão preparados mas não integrados ainda.
Para integrar:
1. Criar conta no Resend (resend.com)
2. Adicionar API key nos secrets
3. Descomentar código de envio na Edge Function
```

## 📊 Monitoramento

### Dashboard de Métricas

```sql
-- Taxa de sucesso de handoff (últimos 30 dias)
SELECT 
  COUNT(*) as total_handoffs,
  SUM(CASE WHEN sla_met THEN 1 ELSE 0 END) as sla_met_count,
  ROUND(AVG(duration_hours), 2) as avg_duration_hours,
  ROUND(100.0 * SUM(CASE WHEN sla_met THEN 1 ELSE 0 END) / COUNT(*), 2) as sla_compliance_pct
FROM handoff_metrics
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Alertas de SLA

```sql
-- Handoffs que estouraram SLA (> 24h)
SELECT 
  hm.opportunity_id,
  o.client_name,
  hm.duration_hours,
  hm.created_at
FROM handoff_metrics hm
JOIN opportunities o ON o.id = hm.opportunity_id
WHERE hm.sla_met = false
ORDER BY hm.created_at DESC;
```

## 🎯 Próximos Passos

Após validar que tudo funciona:

1. [ ] Integrar serviço de email (Resend)
2. [ ] Criar dashboard UI no RevenueCockpit
3. [ ] Adicionar indicadores de SLA
4. [ ] Configurar alertas automáticos
5. [ ] Documentar para o time

## 📝 Rollback (Se Necessário)

```sql
-- Desabilitar trigger
ALTER TABLE opportunities DISABLE TRIGGER trigger_auto_handoff_on_won;

-- Remover função
DROP FUNCTION IF EXISTS auto_handoff_on_won();

-- Remover RPC v2
DROP FUNCTION IF EXISTS convert_opportunity_to_project_v2(UUID, TEXT);

-- Remover tabela de métricas
DROP TABLE IF EXISTS handoff_metrics;
```

---

**Responsável:** Giulliano + Kiro  
**Última Atualização:** 2026-04-03
