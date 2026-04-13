# RevHackers Development Framework

> Sistema de desenvolvimento de alta performance para Revenue Operations

## 🎯 Filosofia

Combinamos o melhor de:
- **BMAD METHOD** - Agentes especializados e workflows estruturados
- **AIOX Core** - Memória persistente e CLI First
- **RevOps Best Practices** - Bow Tie, Handoff, Health Score

## 📁 Estrutura

```
.kiro/
├── context/        # Memória persistente do projeto
├── agents/         # Agentes especializados RevHackers
├── workflows/      # Workflows estruturados por fase
├── templates/      # Templates de documentos
├── playbooks/      # Playbooks operacionais
└── metrics/        # Definições de métricas
```

## 🚀 Quick Start

### Para IA (Kiro/Claude)
```bash
# Sempre no início de cada sessão
cat .kiro/context/project_memory.md
cat .kiro/context/session_log.md
```

### Para Desenvolvedores
```bash
# Consultar agentes disponíveis
ls .kiro/agents/

# Ver workflows
ls .kiro/workflows/

# Usar template
cp .kiro/templates/handoff-checklist.md docs/
```

## 🤖 Agentes Disponíveis

| Agente | Responsabilidade | Quando Usar |
|--------|------------------|-------------|
| `revenue-architect` | Arquitetura de Revenue Operations | Design de sistemas de receita |
| `handoff-specialist` | Handoff Vendas → CS | Transições entre times |
| `health-score-analyst` | Análise de saúde de projetos | Prevenção de churn |
| `bow-tie-strategist` | Estratégia Bow Tie Funnel | Planejamento de funil completo |
| `onboarding-orchestrator` | Orquestração de onboarding | Setup de novos clientes |

## 📋 Workflows Principais

### 1. Discovery (Lead → Qualified)
- Lead qualification
- Diagnostic REI
- Scoring automático

### 2. Sales (Qualified → Won)
- Proposal generation
- Negotiation tracking
- Deal closing

### 3. Handoff (Won → Onboarding) ⭐
- Context transfer
- Kickoff preparation
- SLA tracking (24h)

### 4. Delivery (Onboarding → Active)
- Sprint planning
- Task execution
- Client communication

### 5. Expansion (Active → Growth)
- Health score monitoring
- Upsell detection
- Renewal preparation

## 🎯 Comandos Úteis

```bash
# Atualizar log de sessão
echo "## $(date +%Y-%m-%d) - Título" >> .kiro/context/session_log.md

# Criar nova decisão
touch .kiro/context/decisions/$(date +%Y-%m-%d)-titulo.md

# Validar estrutura
ls -R .kiro/
```

## 📖 Documentação

- [Memória do Projeto](.kiro/context/project_memory.md)
- [Log de Sessões](.kiro/context/session_log.md)
- [Decisões Arquiteturais](.kiro/context/decisions/)

## 🔄 Manutenção

- **Diária:** Atualizar session_log.md
- **Semanal:** Revisar project_memory.md
- **Mensal:** Arquivar sessões antigas
- **Sempre:** Documentar decisões importantes

---

**Mantido por:** Equipe RevHackers + IA  
**Última atualização:** 2026-04-03
