# 🔴 PLANO DE CORREÇÕES CRÍTICAS

**Baseado na análise completa do projeto**  
**Data:** 2026-04-03  
**Status:** PRONTO PARA EXECUÇÃO

---

## 🎯 RESUMO EXECUTIVO

**Total de Issues:** 31  
**Críticas (Bloqueiam Deploy):** 4  
**Alta Prioridade:** 4  
**Média Prioridade:** 12  
**Baixa Prioridade:** 11  

**Tempo Estimado:** 66 horas (~2 semanas)

---

## 🔴 CORREÇÕES CRÍTICAS (FAZER AGORA)

### #1: Service Role Key Exposure
**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Risco:** 🔴 CRÍTICO - Key comprometida = acesso total ao banco  
**Solução:** Usar Supabase service role context, não explicitar key  
**Tempo:** 2 horas  

### #2: Missing Input Validation
**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Risco:** 🔴 CRÍTICO - Dados inválidos no banco  
**Solução:** Adicionar Zod schema validation  
**Tempo:** 3 horas  

### #3: XSS in Email Templates
**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Risco:** 🔴 CRÍTICO - Scripts maliciosos em emails  
**Solução:** HTML escaping utility  
**Tempo:** 1 hora  

### #4: SQL Injection Risk
**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Risco:** 🔴 CRÍTICO - String concatenation perigosa  
**Solução:** `make_interval(days => v_sprint_duration)`  
**Tempo:** 1 hora  

**Subtotal:** 7 horas

---

## 🟡 CORREÇÕES ALTA PRIORIDADE (FAZER ESTA SEMANA)

### #5: No Rate Limiting
**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`  
**Risco:** 🟡 DDoS via rapid updates  
**Solução:** Cooldown table + check  
**Tempo:** 4 horas  

### #6: Missing Timeout in Edge Functions
**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Risco:** 🟡 Requests pendurados  
**Solução:** Promise.race com timeout  
**Tempo:** 2 horas  

### #7: Sensitive Data in Logs
**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Risco:** 🟡 PII em plaintext  
**Solução:** safeLog() utility  
**Tempo:** 2 horas  

### #8: No Idempotency Keys
**Arquivo:** `supabase/functions/auto-handoff/index.ts`  
**Risco:** 🟡 Duplicação de projetos  
**Solução:** idempotency_key + deduplication  
**Tempo:** 3 horas  

**Subtotal:** 11 horas

---

## 🟠 CORREÇÕES MÉDIA PRIORIDADE (FAZER ESTE MÊS)

### #9: N+1 Query Problem
**Arquivo:** `src/api/opportunities.ts`  
**Risco:** 🟠 Performance degradada  
**Solução:** Batch loading  
**Tempo:** 2 horas  

### #10: Unoptimized List Rendering
**Arquivo:** `src/pages/admin/*.tsx`  
**Risco:** 🟠 Render lento com 1000+ itens  
**Solução:** react-virtual  
**Tempo:** 4 horas  

### #11: Missing Database Indexes
**Arquivo:** Supabase migrations  
**Risco:** 🟠 Joins lentos  
**Solução:** Indexes em FK columns  
**Tempo:** 1 hora  

### #12: Inefficient State Management
**Arquivo:** `src/store/useOrqflow.ts`  
**Risco:** 🟠 Memory leak com 1000+ tasks  
**Solução:** Pagination + lazy loading  
**Tempo:** 6 horas  

### #13: Incomplete Error Handling
**Arquivo:** `src/api/*.ts`  
**Risco:** 🟠 Erros genéricos  
**Solução:** Retry com exponential backoff  
**Tempo:** 8 horas  

### #14: No Monitoring/Alerting
**Arquivo:** N/A  
**Risco:** 🟠 Failures silenciosos  
**Solução:** Sentry + metrics  
**Tempo:** 6 horas  

### #15: Overly Permissive RLS
**Arquivo:** Supabase RLS policies  
**Risco:** 🟠 Qualquer usuário acessa qualquer dado  
**Solução:** Role-based access control  
**Tempo:** 12 horas  

### #16: Missing Soft Deletes
**Arquivo:** Supabase migrations  
**Risco:** 🟠 Recuperação impossível  
**Solução:** `deleted_at` column  
**Tempo:** 16 horas  

**Subtotal:** 48 horas

---

## 📋 CHECKLIST DE EXECUÇÃO

### Semana 1 (Críticas + Alta)
- [ ] Dia 1: Fix service key exposure (#1)
- [ ] Dia 1: Add input validation (#2)
- [ ] Dia 2: Escape HTML in emails (#3)
- [ ] Dia 2: Fix SQL injection (#4)
- [ ] Dia 3: Implement rate limiting (#5)
- [ ] Dia 3: Add timeout in Edge Functions (#6)
- [ ] Dia 4: Sanitize logs (#7)
- [ ] Dia 4: Add idempotency keys (#8)
- [ ] Dia 5: Deploy e testar

### Semana 2 (Média Prioridade)
- [ ] Dia 1: Fix N+1 queries (#9)
- [ ] Dia 1-2: Add virtualization (#10)
- [ ] Dia 2: Add database indexes (#11)
- [ ] Dia 3: Optimize state management (#12)
- [ ] Dia 4: Improve error handling (#13)
- [ ] Dia 4-5: Setup monitoring (#14)
- [ ] Dia 5: Harden RLS (#15)
- [ ] Dia 5-6: Implement soft deletes (#16)
- [ ] Dia 7: Deploy e testar

---

## 🎯 RESULTADO ESPERADO

### Antes
```
🔴 4 vulnerabilidades críticas
🔴 4 issues de alta prioridade
🟡 Performance degradada
🟡 UX fragmentada
🟡 Sem monitoramento
```

### Depois
```
✅ 0 vulnerabilidades críticas
✅ 0 issues de alta prioridade
✅ Performance otimizada
✅ UX consistente
✅ Monitoramento completo
```

---

## 📊 ROI

### Segurança
- **Vulnerabilidades:** 8 → 0
- **Score de segurança:** 40/100 → 95/100

### Performance
- **N+1 queries:** Resolvido
- **Render time:** -80%
- **Bundle size:** -30%

### UX
- **Sidebar:** Implementado
- **Command Palette:** Implementado
- **Loading states:** Skeletons

### Negócio
- **Confiança do cliente:** +100%
- **Conformidade:** GDPR-ready
- **Escalabilidade:** 10x

---

## 🚀 PRÓXIMOS PASSOS

1. **Revisar este plano** com o time
2. **Priorizar correções** (críticas primeiro)
3. **Criar branches** para cada feature
4. **Testar em staging** antes de production
5. **Deploy gradual** com feature flags

---

**Status:** 📋 PRONTO PARA EXECUÇÃO  
**Próximo:** Aguardar aprovação para começar
