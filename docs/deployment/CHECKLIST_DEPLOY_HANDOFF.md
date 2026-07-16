# ✅ Checklist de Deploy - Sistema de Handoff Automático

**Data:** 2026-04-03  
**Responsável:** Giulliano  
**Tempo Estimado:** 30 minutos  
**Status:** Pronto para executar

---

## 📋 PRÉ-DEPLOY

### Preparação (5 minutos)

- [ ] **Ler documentação básica**
  - [ ] `START_HERE_HANDOFF.md` (2 min)
  - [ ] `HANDOFF_IMPLEMENTATION_SUMMARY.md` (3 min)

- [ ] **Verificar acessos**
  - [ ] Acesso ao Supabase Dashboard
  - [ ] Supabase CLI instalado (`npm install -g supabase`)
  - [ ] Credenciais anotadas (URL + Service Role Key)

- [ ] **Backup (Opcional mas Recomendado)**
  - [ ] Backup do banco de dados
  - [ ] Backup das migrations atuais
  - [ ] Plano de rollback definido

---

## 🚀 DEPLOY

### Passo 1: Deploy da Edge Function (5 minutos)

```bash
# 1.1 Login no Supabase
supabase login
```
- [ ] Login realizado com sucesso

```bash
# 1.2 Link ao projeto
supabase link --project-ref seu-projeto-ref
```
- [ ] Projeto linkado corretamente

```bash
# 1.3 Deploy da função
supabase functions deploy auto-handoff
```
- [ ] Função deployada sem erros
- [ ] URL da função anotada

### Passo 2: Aplicar Migration (5 minutos)

**Opção A: Via CLI (Recomendado)**
```bash
supabase db push
```
- [ ] Migration aplicada com sucesso

**Opção B: Via SQL Editor**
- [ ] Abrir Supabase Dashboard → SQL Editor
- [ ] Copiar conteúdo de `supabase/migrations/20260403000000_auto_handoff_trigger.sql`
- [ ] Colar e executar
- [ ] Verificar mensagem de sucesso

### Passo 3: Validar Instalação (5 minutos)

```sql
-- 3.1 Verificar RPC
SELECT proname FROM pg_proc 
WHERE proname = 'convert_opportunity_to_project_v2';
```
- [ ] Retornou 1 linha

```sql
-- 3.2 Verificar Trigger
SELECT tgname, tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';
```
- [ ] Retornou 1 linha com tgenabled = 'O'

```sql
-- 3.3 Verificar Tabela
SELECT * FROM handoff_metrics LIMIT 1;
```
- [ ] Tabela existe (pode estar vazia)

```sql
-- 3.4 Verificar pg_net
SELECT * FROM pg_available_extensions 
WHERE name = 'pg_net';
```
- [ ] Extensão disponível

---

## 🧪 TESTE

### Passo 4: Teste End-to-End (10 minutos)

- [ ] **Abrir SQL Editor**
- [ ] **Copiar e colar `test_handoff.sql`**
- [ ] **Executar PARTE 1: Limpeza**
  - [ ] Sem erros
- [ ] **Executar PARTE 2: Criar Opportunity**
  - [ ] 1 opportunity criada
  - [ ] ID anotado
- [ ] **Executar PARTE 3: Simular Fechamento**
  - [ ] UPDATE executado
  - [ ] Aguardar 10 segundos
- [ ] **Executar PARTE 5: Validar Resultados**
  - [ ] 5.1: 1 projeto criado ✅
  - [ ] 5.2: opportunity vinculada ✅
  - [ ] 5.3: 4 sprints criados ✅
  - [ ] 5.4: 7 tasks injetadas ✅
  - [ ] 5.5: 1 métrica registrada ✅
  - [ ] 5.6: 1 histórico criado ✅
- [ ] **Executar PARTE 6: Relatório Final**
  - [ ] OPPORTUNITY: 1 ✅
  - [ ] PROJECT: 1 ✅
  - [ ] SPRINTS: 4 ✅
  - [ ] TASKS: 7 ✅
  - [ ] HANDOFF_METRICS: 1 ✅

### Resultado do Teste

- [ ] ✅ **TODOS OS TESTES PASSARAM**
- [ ] ❌ **ALGUM TESTE FALHOU** → Ver Troubleshooting

---

## 🎯 PÓS-DEPLOY

### Passo 5: Validação em Produção (5 minutos)

- [ ] **Escolher 1 opportunity real em "negotiation"**
  - [ ] Opportunity ID: _______________
  - [ ] Cliente: _______________

- [ ] **Mudar stage para "won"**
  - [ ] Via RevenueCockpit
  - [ ] Aguardar 10 segundos

- [ ] **Verificar resultado**
  ```sql
  SELECT * FROM rei_projects 
  WHERE client_email = 'email-do-cliente';
  ```
  - [ ] Projeto criado ✅
  - [ ] Sprints criados ✅
  - [ ] Tasks injetadas ✅

- [ ] **Verificar métricas**
  ```sql
  SELECT * FROM handoff_metrics 
  ORDER BY created_at DESC LIMIT 1;
  ```
  - [ ] Métrica registrada ✅
  - [ ] SLA cumprido (< 24h) ✅

---

## 📊 MONITORAMENTO

### Passo 6: Configurar Monitoramento (Opcional)

- [ ] **Criar query salva no Supabase**
  ```sql
  -- Dashboard de Handoff
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN sla_met THEN 1 ELSE 0 END) as sla_ok,
    ROUND(AVG(duration_hours), 2) as avg_hours
  FROM handoff_metrics
  WHERE created_at >= NOW() - INTERVAL '7 days';
  ```

- [ ] **Configurar alerta de SLA** (Opcional)
  - [ ] Webhook para Slack/Discord
  - [ ] Email para gestores
  - [ ] Notificação in-app

---

## 📚 DOCUMENTAÇÃO

### Passo 7: Compartilhar com Time (5 minutos)

- [ ] **Vendedores**
  - [ ] Avisar que handoff é automático agora
  - [ ] Explicar que não precisa mais avisar ninguém
  - [ ] Compartilhar `QUICK_REFERENCE.md`

- [ ] **Analistas**
  - [ ] Avisar que receberão email automático
  - [ ] Explicar que projeto já vem pronto
  - [ ] Compartilhar `QUICK_REFERENCE.md`

- [ ] **Gestores**
  - [ ] Compartilhar `HANDOFF_IMPLEMENTATION_SUMMARY.md`
  - [ ] Mostrar dashboard de métricas
  - [ ] Definir KPIs de acompanhamento

---

## 🎉 CONCLUSÃO

### Checklist Final

- [ ] Edge Function deployada e funcionando
- [ ] Migration aplicada com sucesso
- [ ] Trigger habilitado e ativo
- [ ] Teste end-to-end passou 100%
- [ ] Teste em produção validado
- [ ] Time avisado e treinado
- [ ] Documentação compartilhada
- [ ] Monitoramento configurado

### Resultado Esperado

Após completar este checklist:
- ✅ Sistema 100% funcional
- ✅ Handoff automático ativo
- ✅ SLA < 24h garantido
- ✅ Métricas sendo coletadas
- ✅ Time preparado

---

## 🐛 TROUBLESHOOTING

### Problema: Edge Function não responde

**Sintomas:**
- Trigger dispara mas projeto não é criado
- Sem logs na Edge Function

**Solução:**
```bash
# Ver logs da função
supabase functions logs auto-handoff

# Testar manualmente
curl -X POST https://seu-projeto.supabase.co/functions/v1/auto-handoff \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"opportunity_id":"test","analyst_email":"test@test.com","won_at":"2026-04-03T10:00:00Z"}'
```

- [ ] Problema identificado
- [ ] Solução aplicada
- [ ] Teste repetido

### Problema: Tasks não são injetadas

**Sintomas:**
- Projeto criado mas sem tasks
- Sprints criados mas vazios

**Solução:**
```sql
-- Verificar se sprints existem
SELECT COUNT(*) FROM orqflow_sprints 
WHERE project_id = 'seu-project-id';

-- Ver logs da Edge Function
-- Supabase Dashboard → Edge Functions → auto-handoff → Logs
```

- [ ] Problema identificado
- [ ] Solução aplicada
- [ ] Teste repetido

### Problema: Trigger não dispara

**Sintomas:**
- Opportunity muda para "won" mas nada acontece
- Sem logs, sem projeto criado

**Solução:**
```sql
-- Verificar se trigger está habilitado
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';

-- Se retornar 'D', habilitar:
ALTER TABLE opportunities 
ENABLE TRIGGER trigger_auto_handoff_on_won;
```

- [ ] Problema identificado
- [ ] Solução aplicada
- [ ] Teste repetido

---

## 📞 SUPORTE

### Documentação Completa
- `START_HERE_HANDOFF.md` - Início rápido
- `HANDOFF_IMPLEMENTATION_SUMMARY.md` - Resumo executivo
- `.kiro/workflows/03-handoff/DEPLOYMENT_GUIDE.md` - Guia detalhado
- `.kiro/workflows/03-handoff/QUICK_REFERENCE.md` - Referência rápida

### Comandos Úteis
```sql
-- Ver últimos handoffs
SELECT * FROM handoff_metrics 
ORDER BY created_at DESC LIMIT 10;

-- Ver problemas
SELECT * FROM handoff_metrics 
WHERE sla_met = false OR validation_passed = false;

-- Ver tempo médio
SELECT ROUND(AVG(duration_hours), 2) 
FROM handoff_metrics;
```

---

## 🔄 ROLLBACK (Se Necessário)

### Desabilitar Sistema

```sql
-- 1. Desabilitar trigger
ALTER TABLE opportunities 
DISABLE TRIGGER trigger_auto_handoff_on_won;

-- 2. Verificar
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';
-- Deve retornar 'D' (disabled)
```

- [ ] Trigger desabilitado
- [ ] Sistema voltou ao manual
- [ ] Time avisado

### Remover Completamente (Extremo)

```sql
-- Remover trigger
DROP TRIGGER IF EXISTS trigger_auto_handoff_on_won ON opportunities;

-- Remover função
DROP FUNCTION IF EXISTS auto_handoff_on_won();

-- Remover RPC
DROP FUNCTION IF EXISTS convert_opportunity_to_project_v2(UUID, TEXT);

-- Remover tabela
DROP TABLE IF EXISTS handoff_metrics;
```

- [ ] Sistema removido
- [ ] Backup restaurado (se necessário)
- [ ] Causa raiz identificada

---

## ✅ ASSINATURA

**Deploy realizado por:** _______________  
**Data:** _______________  
**Hora:** _______________  
**Status:** ✅ Sucesso / ❌ Falhou  
**Observações:** _______________

---

**Criado por:** Kiro (AI) + Giulliano  
**Data:** 2026-04-03  
**Versão:** 1.0
