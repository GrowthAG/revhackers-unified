# ⚡ Handoff Automático - Referência Rápida

## 🎯 O Que É?

Sistema que converte automaticamente opportunities "won" em projetos prontos para execução, com sprints e tasks organizadas.

---

## 🚀 Como Funciona?

```
Vendedor fecha venda → Sistema cria projeto → Analista recebe notificação
```

**Tempo:** < 10 segundos  
**SLA:** 24 horas  
**Automático:** 100%

---

## 📊 Templates de Tasks

| Tipo | Duração | Tasks |
|------|---------|-------|
| `founder` | 30 dias | 5 tasks (LinkedIn, Tom de Voz, Posts) |
| `founder` | 90 dias | 6 tasks (Autoridade, PR, Engajamento) |
| `site` | 30 dias | 5 tasks (Sitemap, Setup, Deploy) |
| `site` | 60 dias | 5 tasks (UI/UX, Figma, Integrações) |
| `consulting` | 90 dias | 7 tasks (Diagnóstico, Arquitetura, Treinamento) |
| `crm_ops` | 90 dias | 7 tasks (Setup, Migração, RevOps) |
| Outros | Qualquer | 5 tasks (Kick-off, Escopo, Execução) |

---

## 🔧 Sprints Criados

| Duração Projeto | Sprints | Duração Sprint |
|-----------------|---------|----------------|
| 30 dias | 4 | 7 dias |
| 60 dias | 4 | 14 dias |
| 90 dias | 4 | 21 dias |
| 180+ dias | N/30 | 30 dias |

---

## ✅ Checklist Automático

O sistema faz automaticamente:

- ✅ Cria `rei_project` com status "preparation"
- ✅ Vincula `opportunity.rei_project_id`
- ✅ Cria sprints baseado em duração
- ✅ Injeta tasks do template
- ✅ Define `next_rei_date` (kickoff em 7 dias)
- ✅ Registra métricas de handoff
- ✅ Prepara emails (cliente + analista)

---

## 📧 Emails Enviados

### Cliente
- **Assunto:** "Bem-vindo à RevHackers - Seu projeto foi iniciado!"
- **Conteúdo:** Boas-vindas, próximos passos, link do Hub
- **Quando:** Imediatamente após conversão

### Analista
- **Assunto:** "Novo Projeto Atribuído: [Nome Cliente]"
- **Conteúdo:** Dados do cliente, checklist, link do projeto
- **Quando:** Imediatamente após conversão

---

## 🎯 SLA e Métricas

**SLA:** 24 horas (da venda até projeto pronto)  
**Tracking:** Tabela `handoff_metrics`  
**Alertas:** Automáticos se > 24h

**Métricas Disponíveis:**
- Taxa de sucesso
- Tempo médio de handoff
- Compliance de SLA
- Erros e falhas

---

## 🐛 Troubleshooting

### Projeto não foi criado?

```sql
-- Verificar se trigger está habilitado
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_handoff_on_won';
```

### Tasks não foram injetadas?

```sql
-- Verificar sprints
SELECT COUNT(*) FROM orqflow_sprints 
WHERE project_id = 'seu-project-id';
```

### Email não foi enviado?

Emails estão preparados mas não integrados ainda.  
Integração com Resend pendente.

---

## 📞 Comandos Úteis

### Ver últimos handoffs
```sql
SELECT * FROM handoff_metrics 
ORDER BY created_at DESC 
LIMIT 10;
```

### Ver handoffs com problema
```sql
SELECT * FROM handoff_metrics 
WHERE sla_met = false 
OR validation_passed = false;
```

### Ver tempo médio
```sql
SELECT ROUND(AVG(duration_hours), 2) as avg_hours
FROM handoff_metrics
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## 🚀 Deploy Rápido

```bash
# 1. Deploy Edge Function
supabase functions deploy auto-handoff

# 2. Aplicar Migration
supabase db push

# 3. Testar
# Executar test_handoff.sql no SQL Editor
```

---

## 📚 Documentação Completa

- `HANDOFF_SYSTEM_OVERVIEW.md` - Visão geral completa
- `DEPLOYMENT_GUIDE.md` - Guia de instalação
- `test_handoff.sql` - Script de teste
- `.kiro/context/session_log.md` - Histórico

---

**Última Atualização:** 2026-04-03
