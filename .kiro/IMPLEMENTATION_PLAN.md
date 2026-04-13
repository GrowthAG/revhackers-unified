# Plano de Implementação - RevHackers High Performance Framework

**Data:** 2026-04-03  
**Status:** Pronto para Execução  
**Prazo:** 4 semanas

## 🎯 Objetivo

Criar uma jornada de passagem de bastão ponta a ponta entre Vendas e CS, com:
- Handoff automatizado (SLA 24h)
- Zero perda de contexto
- Visibilidade total para o cliente
- Health Score para prevenção de churn
- Bow Tie Funnel completo

## 📊 Análise: O Que Temos vs O Que Precisamos

### ✅ O Que Já Funciona Bem

1. **Separação Clara de Responsabilidades**
   - `opportunities` (Vendas) ✅
   - `rei_projects` (CS/Entrega) ✅
   - `orqflow_tasks` + `orqflow_sprints` (Gestão) ✅

2. **Sistema de Diagnóstico Robusto**
   - 4 tipos de REI funcionais ✅
   - Scoring automático ✅
   - Insights por IA ✅

3. **Portal do Cliente**
   - `ClientProjectHub.tsx` com progresso real-time ✅
   - Integração com sprints/tasks ✅
   - NPS blocker ✅

4. **Orqflow Engine**
   - Tasks estilo Notion/ClickUp ✅
   - Sprints com datas ✅
   - Time tracking ✅
   - Dependencies ✅

### ❌ Gaps Críticos Identificados

1. **Handoff Manual (Não Automatizado)**
   - Analista cria projeto manualmente
   - Risco de perda de contexto
   - Sem SLA definido

2. **Falta de Visibilidade do Cliente**
   - Cliente não vê transição Vendas → CS
   - Sem comunicação automática
   - Sem expectativa clara

3. **Bow Tie Incompleto**
   - Só temos lado esquerdo (aquisição)
   - Falta lado direito (expansão, renovação)
   - Sem tracking de NRR, upsell

4. **Sem Health Score**
   - Não há métrica de saúde do projeto
   - Sem alertas de risco de churn
   - Sem tracking de engajamento

## 🚀 Solução: Framework Híbrido Customizado

### Decisão Arquitetural

**NÃO vamos adotar BMAD ou AIOX diretamente.**

Criamos metodologia híbrida que pega o melhor dos dois:

| Fonte | O Que Pegamos |
|-------|---------------|
| **BMAD** | Agentes especializados, Workflows estruturados, Scale-adaptive |
| **AIOX** | Memória persistente, CLI First, Squads modulares |
| **RevOps** | Bow Tie, Handoff, Health Score, Onboarding Orquestrado |

### Estrutura Criada

```
.kiro/
├── context/                    # ✅ Memória persistente (IMPLEMENTADO)
│   ├── project_memory.md       # Contexto permanente
│   ├── session_log.md          # Log cronológico
│   └── decisions/              # Decisões arquiteturais
│
├── agents/                     # ✅ Agentes especializados (IMPLEMENTADO)
│   ├── handoff-specialist.md   # Handoff Vendas→CS
│   ├── revenue-architect.md    # Arquitetura de Revenue
│   ├── health-score-analyst.md # (TODO)
│   ├── bow-tie-strategist.md   # (TODO)
│   └── onboarding-orchestrator.md # (TODO)
│
├── workflows/                  # ✅ Workflows estruturados (PARCIAL)
│   ├── 01-discovery/           # (TODO)
│   ├── 02-sales/               # (TODO)
│   ├── 03-handoff/             # ✅ IMPLEMENTADO
│   │   └── won-to-onboarding.md
│   ├── 04-delivery/            # (TODO)
│   └── 05-expansion/           # (TODO)
│
├── templates/                  # Templates de documentos (TODO)
├── playbooks/                  # Playbooks operacionais (TODO)
└── metrics/                    # Definições de métricas (TODO)
```

## 📅 Cronograma de 4 Semanas

### Semana 1: Fundação + Handoff Automático

#### Dia 1-2: Setup
- [x] Sistema de memória persistente
- [x] Agentes core (handoff-specialist, revenue-architect)
- [x] Workflow de handoff documentado
- [ ] Template de checklist de handoff

#### Dia 3-4: Implementação Backend
- [ ] Criar Supabase Function `auto_create_project_from_opportunity()`
- [ ] Criar trigger `on_opportunity_won`
- [ ] Implementar validação de checklist
- [ ] Implementar SLA tracking

#### Dia 5: Implementação Frontend
- [ ] Dashboard de handoff status (admin)
- [ ] Indicador de SLA no RevenueCockpit
- [ ] Alertas visuais de handoff pendente

**Entregável Semana 1:** Handoff automático funcionando com SLA de 24h

### Semana 2: Comunicação + Visibilidade

#### Dia 1-2: Email Templates
- [ ] Template de boas-vindas ao cliente
- [ ] Template de notificação ao analista
- [ ] Template de lembrete de kickoff
- [ ] Template de SLA quebrado

#### Dia 3-4: Portal do Cliente
- [ ] Adicionar seção "Transição" no ClientProjectHub
- [ ] Timeline visual de progresso
- [ ] Notificações in-app
- [ ] Badge de "Novo Projeto"

#### Dia 5: Testes
- [ ] Testar fluxo completo com projeto piloto
- [ ] Validar emails
- [ ] Validar SLA tracking
- [ ] Ajustes finais

**Entregável Semana 2:** Cliente vê transição e recebe comunicação automática

### Semana 3: Health Score + Alertas

#### Dia 1-2: Definição de Health Score
- [ ] Definir fatores (engagement, velocity, satisfaction, adoption)
- [ ] Criar fórmula de cálculo
- [ ] Definir thresholds (low, medium, high, critical)
- [ ] Documentar em `.kiro/metrics/health-score-formula.md`

#### Dia 3-4: Implementação
- [ ] Criar tabela `project_health_scores`
- [ ] Criar função de cálculo
- [ ] Criar cron job (diário)
- [ ] Criar sistema de alertas

#### Dia 5: Dashboard
- [ ] Widget de Health Score no ProjectDetails
- [ ] Lista de projetos em risco no AdminDashboard
- [ ] Gráfico de evolução de health score
- [ ] Alertas visuais

**Entregável Semana 3:** Health Score funcionando com alertas de risco

### Semana 4: Bow Tie + Expansão

#### Dia 1-2: Lado Direito do Bow Tie
- [ ] Criar tabela `expansion_opportunities`
- [ ] Tracking de upsell/cross-sell
- [ ] Renewal pipeline
- [ ] Referral tracking

#### Dia 3-4: Dashboard Bow Tie
- [ ] Visualização completa do funil
- [ ] Métricas por stage
- [ ] Conversion rates
- [ ] NRR tracking

#### Dia 5: Documentação + Treinamento
- [ ] Documentar tudo em `.kiro/`
- [ ] Criar guia de uso para o time
- [ ] Gravar vídeo de treinamento
- [ ] Apresentar para o time

**Entregável Semana 4:** Bow Tie completo com tracking de expansão

## 🎯 Métricas de Sucesso

### Semana 1
- ✅ Handoff Success Rate > 95%
- ✅ SLA Compliance > 90%
- ✅ Tempo médio de handoff < 12h

### Semana 2
- ✅ Cliente recebe email em < 5min após won
- ✅ Analista notificado em < 1min
- ✅ Kickoff agendado automaticamente

### Semana 3
- ✅ Health Score calculado para 100% dos projetos
- ✅ Alertas de risco enviados em < 1h
- ✅ Churn prevenido em > 20% dos casos

### Semana 4
- ✅ Upsell opportunities detectadas automaticamente
- ✅ Renewal pipeline visível
- ✅ NRR tracking funcionando

## 🔧 Stack Técnico

### Backend
- Supabase Functions (TypeScript)
- PostgreSQL Triggers
- Cron Jobs (pg_cron)

### Frontend
- React + TypeScript
- Zustand (state)
- React Query (data fetching)
- Tailwind CSS (styling)

### Integrações
- Email (SendGrid ou Resend)
- Calendar (Google Calendar API)
- Notifications (Supabase Realtime)

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Trigger não dispara | Média | Alto | Testes extensivos + fallback manual |
| Email não chega | Baixa | Médio | Retry logic + log de envios |
| SLA quebrado | Média | Alto | Alertas múltiplos + escalação |
| Health Score impreciso | Alta | Médio | Calibração com dados reais |

## 📖 Como Usar Este Framework

### Para IA (Kiro/Claude)
```bash
# SEMPRE no início de cada sessão
cat .kiro/context/project_memory.md
cat .kiro/context/session_log.md

# Consultar agente específico
cat .kiro/agents/handoff-specialist.md

# Ver workflow
cat .kiro/workflows/03-handoff/won-to-onboarding.md
```

### Para Desenvolvedores
```bash
# Ver estrutura completa
tree .kiro/

# Consultar decisões
ls .kiro/context/decisions/

# Usar template
cp .kiro/templates/handoff-checklist.md docs/
```

## 🎓 Próximos Passos Imediatos

1. **Revisar este plano** com Giulliano
2. **Priorizar** o que é mais crítico
3. **Começar Semana 1** - Handoff automático
4. **Iterar** baseado em feedback

## 📚 Referências

- [BMAD METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [AIOX Core](https://github.com/SynkraAI/aiox-core)
- [Winning by Design - Bow Tie](https://winningbydesign.com)
- [Predictable Revenue](https://predictablerevenue.com)
- [Onboarding Orquestrado](https://www.amazon.com.br/Onboarding-Orquestrado)

---

**Status:** Pronto para execução  
**Próxima revisão:** Fim da Semana 1  
**Responsável:** Giulliano + Kiro
