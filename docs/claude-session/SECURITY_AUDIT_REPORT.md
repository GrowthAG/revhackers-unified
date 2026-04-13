# 🔒 Relatório de Auditoria de Segurança

**Data:** 2026-04-03  
**Sistema:** Handoff Automático  
**Auditor:** Kiro (AI)  
**Status:** ⚠️ 7 Vulnerabilidades Encontradas

---

## 🚨 VULNERABILIDADES CRÍTICAS

### 1. SQL Injection via String Concatenation ⚠️ ALTA

**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Linha:** ~160

**Problema:**
```sql
v_sprint_start_date + (v_sprint_duration || ' days')::INTERVAL
```

**Risco:**
- Se `v_sprint_duration` vier de input não sanitizado, pode causar SQL injection
- Concatenação de string em INTERVAL pode ser explorada

**Impacto:** ALTO  
**Probabilidade:** BAIXA (valor vem de CASE interno)

**Correção:**
```sql
-- ANTES (Vulnerável)
v_sprint_start_date + (v_sprint_duration || ' days')::INTERVAL

-- DEPOIS (Seguro)
v_sprint_start_date + make_interval(days => v_sprint_duration)
```

**Status:** ⚠️ Precisa correção

---

### 2. Exposição de Service Role Key no Trigger 🔴 CRÍTICA

**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Linha:** ~280

**Problema:**
```sql
'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
```

**Risco:**
- Service role key é exposta em logs
- Se trigger falhar, key pode vazar em error messages
- Logs do PostgreSQL podem conter a key

**Impacto:** CRÍTICO  
**Probabilidade:** MÉDIA

**Correção:**
```sql
-- Usar pg_net com autenticação via database role
-- Não passar service_role_key explicitamente
-- Configurar pg_net com credenciais seguras

-- OU usar função auxiliar que não loga a key
CREATE OR REPLACE FUNCTION get_service_key() 
RETURNS TEXT AS $
BEGIN
  RETURN current_setting('app.supabase_service_role_key', true);
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**Status:** 🔴 CRÍTICO - Corrigir antes de deploy

---

### 3. Falta de Rate Limiting no Trigger ⚠️ MÉDIA

**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Linha:** ~265

**Problema:**
```sql
-- Trigger dispara para CADA UPDATE
-- Sem rate limiting
-- Pode ser explorado para DDoS
```

**Risco:**
- Atacante pode fazer múltiplos UPDATEs rápidos
- Cada UPDATE dispara Edge Function
- Edge Function consome recursos

**Impacto:** MÉDIO  
**Probabilidade:** BAIXA (precisa autenticação)

**Correção:**
```sql
-- Adicionar cooldown
CREATE TABLE IF NOT EXISTS handoff_cooldown (
  opportunity_id UUID PRIMARY KEY,
  last_triggered_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT cooldown_check CHECK (
    last_triggered_at + INTERVAL '1 minute' < now()
  )
);

-- No trigger, verificar cooldown
IF EXISTS (
  SELECT 1 FROM handoff_cooldown 
  WHERE opportunity_id = NEW.id 
  AND last_triggered_at + INTERVAL '1 minute' > now()
) THEN
  RAISE NOTICE 'Handoff cooldown active for opportunity %', NEW.id;
  RETURN NEW;
END IF;
```

**Status:** ⚠️ Recomendado adicionar

---

### 4. Edge Function sem Validação de Input 🔴 ALTA

**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Linha:** ~320

**Problema:**
```typescript
const payload: HandoffPayload = await req.json();
const { opportunity_id, analyst_email } = payload;

// Sem validação!
// opportunity_id pode ser qualquer string
// analyst_email pode ser malicioso
```

**Risco:**
- UUID inválido pode causar erro
- Email malicioso pode causar XSS nos emails
- Falta de sanitização

**Impacto:** ALTO  
**Probabilidade:** MÉDIA

**Correção:**
```typescript
// Validar UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(opportunity_id)) {
  throw new Error("Invalid opportunity_id format");
}

// Validar email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (analyst_email && !EMAIL_REGEX.test(analyst_email)) {
  throw new Error("Invalid analyst_email format");
}

// Sanitizar para HTML
const sanitizeHTML = (str: string) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
```

**Status:** 🔴 ALTA - Corrigir antes de deploy

---

### 5. XSS nos Email Templates ⚠️ MÉDIA

**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Linha:** ~150, ~200

**Problema:**
```typescript
<p>Olá <strong>${clientName}</strong>,</p>
<li><strong>Nome:</strong> ${clientName}</li>
<li><strong>Email:</strong> ${clientEmail}</li>
```

**Risco:**
- Se clientName contém `<script>alert('xss')</script>`
- Email será renderizado com script malicioso
- Pode roubar sessão do usuário

**Impacto:** MÉDIO  
**Probabilidade:** BAIXA (dados vêm do banco)

**Correção:**
```typescript
const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Usar em todos os templates
<p>Olá <strong>${escapeHTML(clientName)}</strong>,</p>
```

**Status:** ⚠️ Recomendado adicionar

---

### 6. Falta de Timeout na Edge Function ⚠️ BAIXA

**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Linha:** Todo o arquivo

**Problema:**
```typescript
// Sem timeout nas operações
await supabase.rpc(...) // Pode travar indefinidamente
await supabase.from(...).select(...) // Sem timeout
```

**Risco:**
- Edge Function pode travar
- Consumo de recursos
- Falta de graceful degradation

**Impacto:** BAIXO  
**Probabilidade:** BAIXA

**Correção:**
```typescript
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    ),
  ]);
};

// Usar
const rpcResult = await withTimeout(
  supabase.rpc("convert_opportunity_to_project_v2", {...}),
  30000 // 30 segundos
);
```

**Status:** ⚠️ Recomendado adicionar

---

### 7. Logs Podem Vazar Dados Sensíveis ⚠️ MÉDIA

**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Linha:** ~325, ~340, ~380

**Problema:**
```typescript
console.log(`[auto-handoff] Processing opportunity: ${opportunity_id}`);
console.log(`[auto-handoff] Project created: ${projectId}`);
console.error("[auto-handoff] RPC error:", rpcError);
```

**Risco:**
- Logs podem conter PII (emails, nomes)
- Logs são armazenados em plaintext
- Podem ser acessados por admins

**Impacto:** MÉDIO  
**Probabilidade:** ALTA

**Correção:**
```typescript
// Criar função de log segura
const safeLog = (message: string, data?: any) => {
  const sanitized = data ? {
    ...data,
    client_email: data.client_email ? "***@***" : undefined,
    client_name: data.client_name ? "***" : undefined,
  } : undefined;
  console.log(message, sanitized);
};

// Usar
safeLog("[auto-handoff] Processing opportunity", { 
  opportunity_id // OK - UUID não é PII
});
```

**Status:** ⚠️ Recomendado adicionar

---

## 🛡️ BOAS PRÁTICAS FALTANDO

### 8. Falta de Retry Logic

**Problema:**
- Se RPC falhar, não há retry
- Edge Function retorna erro imediatamente

**Correção:**
```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
};
```

### 9. Falta de Idempotência

**Problema:**
- Se Edge Function for chamada 2x com mesmo payload
- Pode criar 2 projetos

**Correção:**
```typescript
// Adicionar idempotency key
const idempotencyKey = `handoff-${opportunity_id}-${won_at}`;

// Verificar se já processado
const { data: existing } = await supabase
  .from("handoff_metrics")
  .select("id")
  .eq("opportunity_id", opportunity_id)
  .single();

if (existing) {
  return new Response(JSON.stringify({
    success: true,
    message: "Already processed",
    idempotent: true
  }), { status: 200 });
}
```

### 10. Falta de Monitoring

**Problema:**
- Sem métricas de erro
- Sem alertas
- Sem tracing

**Correção:**
```typescript
// Adicionar métricas
const recordMetric = async (metric: string, value: number) => {
  await supabase.from("system_metrics").insert({
    metric_name: metric,
    metric_value: value,
    timestamp: new Date().toISOString()
  });
};

// Usar
await recordMetric("handoff_duration_ms", Date.now() - startTime);
await recordMetric("handoff_success", 1);
```

---

## 📊 RESUMO DE VULNERABILIDADES

| # | Vulnerabilidade | Severidade | Probabilidade | Risco | Status |
|---|----------------|------------|---------------|-------|--------|
| 1 | SQL Injection | Alta | Baixa | Médio | ⚠️ Corrigir |
| 2 | Service Key Exposure | Crítica | Média | Alto | 🔴 CRÍTICO |
| 3 | No Rate Limiting | Média | Baixa | Baixo | ⚠️ Recomendado |
| 4 | No Input Validation | Alta | Média | Alto | 🔴 CRÍTICO |
| 5 | XSS em Emails | Média | Baixa | Baixo | ⚠️ Recomendado |
| 6 | No Timeout | Baixa | Baixa | Baixo | ⚠️ Recomendado |
| 7 | Log Leakage | Média | Alta | Médio | ⚠️ Recomendado |

---

## ✅ CHECKLIST DE CORREÇÕES

### Antes do Deploy (OBRIGATÓRIO)

- [ ] **#2 - Service Key Exposure** 🔴
  - Remover service_role_key dos logs
  - Usar função auxiliar segura
  
- [ ] **#4 - Input Validation** 🔴
  - Validar UUID format
  - Validar email format
  - Sanitizar inputs

### Recomendado (Alta Prioridade)

- [ ] **#1 - SQL Injection**
  - Usar `make_interval()` em vez de concatenação

- [ ] **#5 - XSS em Emails**
  - Adicionar `escapeHTML()` function
  - Sanitizar todos os outputs

- [ ] **#7 - Log Leakage**
  - Criar `safeLog()` function
  - Remover PII dos logs

### Melhorias (Média Prioridade)

- [ ] **#3 - Rate Limiting**
  - Adicionar cooldown table
  - Implementar rate limit

- [ ] **#6 - Timeout**
  - Adicionar `withTimeout()` wrapper
  - Definir timeouts razoáveis

- [ ] **#8 - Retry Logic**
  - Implementar retry com backoff

- [ ] **#9 - Idempotência**
  - Adicionar idempotency keys
  - Verificar duplicatas

- [ ] **#10 - Monitoring**
  - Adicionar métricas
  - Configurar alertas

---

## 🎯 PRIORIZAÇÃO

### Deploy Blocker (NÃO FAZER DEPLOY SEM CORRIGIR)

1. **Service Key Exposure** (#2)
2. **Input Validation** (#4)

### High Priority (Corrigir em 1 semana)

3. **SQL Injection** (#1)
4. **XSS em Emails** (#5)
5. **Log Leakage** (#7)

### Medium Priority (Corrigir em 1 mês)

6. **Rate Limiting** (#3)
7. **Timeout** (#6)
8. **Retry Logic** (#8)

### Low Priority (Backlog)

9. **Idempotência** (#9)
10. **Monitoring** (#10)

---

## 📝 CONCLUSÃO

**Status Geral:** ⚠️ NÃO PRONTO PARA PRODUÇÃO

**Vulnerabilidades Críticas:** 2  
**Vulnerabilidades Altas:** 2  
**Vulnerabilidades Médias:** 3  
**Vulnerabilidades Baixas:** 1

**Recomendação:** Corrigir #2 e #4 antes de fazer deploy em produção.

**Tempo Estimado de Correção:**
- Críticas: 2-3 horas
- Altas: 2-3 horas
- Médias: 4-6 horas
- **Total:** 8-12 horas

---

**Auditado por:** Kiro (AI)  
**Data:** 2026-04-03  
**Próxima Auditoria:** Após correções
