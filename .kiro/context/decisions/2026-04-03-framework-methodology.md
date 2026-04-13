# Decisão: Framework de Desenvolvimento para RevHackers

**Data:** 2026-04-03  
**Status:** Proposta  
**Decisor:** Giulliano + Kiro

## Contexto

Giulliano questionou se devemos adotar:
1. **BMAD METHOD** - Framework ágil para desenvolvimento com IA
2. **AIOX Core** - Sistema de orquestração de agentes IA

Ambos são frameworks robustos para desenvolvimento assistido por IA, mas têm filosofias diferentes.

## Análise Comparativa

### BMAD METHOD
**Filosofia:** "AI como colaborador expert que guia seu pensamento"

✅ **Pontos Fortes:**
- Scale-adaptive (ajusta complexidade automaticamente)
- Workflows estruturados (análise → planejamento → arquitetura → implementação)
- 12+ agentes especializados (PM, Architect, Developer, UX, etc)
- Party Mode (múltiplos agentes em uma sessão)
- Ciclo completo (brainstorming → deployment)
- 100% gratuito, sem paywalls
- Instalação simples: `npx bmad-method install`

❌ **Pontos Fracos:**
- Mais focado em desenvolvimento de software genérico
- Menos foco em Revenue Operations
- Não tem módulos específicos para B2B SaaS

### AIOX Core
**Filosofia:** "CLI First → Observability Second → UI Third"

✅ **Pontos Fortes:**
- Planejamento Agêntico (analyst, pm, architect colaboram)
- Desenvolvimento Contextualizado (histórias hiperdetalhadas)
- Squads modulares (estende para qualquer domínio)
- ADE (Autonomous Development Engine) com 7 Epics
- Sistema de memória persistente
- Worktree Manager (isolamento de branches)
- Recovery System (recuperação automática de falhas)
- Instalação moderna: `npx aiox-core init`

❌ **Pontos Fracos:**
- Mais complexo (curva de aprendizado maior)
- Foco em autonomia total (pode ser overkill)
- Requer mais setup inicial

## Decisão: Híbrido Customizado

**NÃO vamos adotar nenhum dos dois diretamente.**

Vamos criar uma **metodologia híbrida customizada** para RevHackers que:

### 1. Pega o Melhor do BMAD
- ✅ Agentes especializados (PM, Architect, Dev, QA)
- ✅ Workflows estruturados por fase
- ✅ Scale-adaptive planning
- ✅ Party Mode (múltiplos agentes)

### 2. Pega o Melhor do AIOX
- ✅ Sistema de memória persistente (já implementamos!)
- ✅ CLI First philosophy
- ✅ Squads modulares
- ✅ Recovery System

### 3. Adiciona Especificidades RevHackers
- ✅ Agentes específicos para RevOps
- ✅ Workflows de Handoff Vendas → CS
- ✅ Metodologia Bow Tie Funnel
- ✅ Onboarding Orquestrado
- ✅ Health Score tracking

## Estrutura Proposta

```
.kiro/
├── context/                    # Memória persistente (já existe)
│   ├── project_memory.md
│   ├── session_log.md
│   └── decisions/
│
├── agents/                     # Agentes especializados RevHackers
│   ├── revenue-architect.md    # Arquiteto de Revenue Operations
│   ├── handoff-specialist.md   # Especialista em Handoff Vendas→CS
│   ├── health-score-analyst.md # Analista de Health Score
│   ├── bow-tie-strategist.md   # Estrategista Bow Tie Funnel
│   └── onboarding-orchestrator.md
│
├── workflows/                  # Workflows estruturados
│   ├── 01-discovery/
│   │   ├── lead-qualification.md
│   │   └── diagnostic-rei.md
│   ├── 02-sales/
│   │   ├── proposal-generation.md
│   │   └── negotiation-tracking.md
│   ├── 03-handoff/             # CRÍTICO
│   │   ├── won-to-onboarding.md
│   │   ├── context-transfer.md
│   │   └── kickoff-preparation.md
│   ├── 04-delivery/
│   │   ├── sprint-planning.md
│   │   ├── task-execution.md
│   │   └── client-communication.md
│   └── 05-expansion/
│       ├── health-score-monitoring.md
│       ├── upsell-detection.md
│       └── renewal-preparation.md
│
├── templates/                  # Templates de documentos
│   ├── handoff-checklist.md
│   ├── kickoff-agenda.md
│   ├── sprint-retrospective.md
│   └── health-score-report.md
│
├── playbooks/                  # Playbooks operacionais
│   ├── sales-to-cs-handoff.md
│   ├── client-onboarding.md
│   ├── sprint-execution.md
│   └── churn-prevention.md
│
└── metrics/                    # Definições de métricas
    ├── pipeline-metrics.md
    ├── health-score-formula.md
    └── bow-tie-kpis.md
```

## Implementação Faseada

### Fase 1: Fundação (Esta Semana)
- [x] Sistema de memória persistente (`.kiro/context/`)
- [ ] Definir agentes core (5 principais)
- [ ] Criar workflow de handoff
- [ ] Template de checklist de handoff

### Fase 2: Automação (Próxima Semana)
- [ ] Trigger automático won → onboarding
- [ ] Email templates de boas-vindas
- [ ] Dashboard de handoff status
- [ ] SLA tracking (24h)

### Fase 3: Inteligência (Semana 3)
- [ ] Health Score MVP
- [ ] Alertas de risco
- [ ] Bow Tie dashboard
- [ ] Predictive analytics

### Fase 4: Expansão (Semana 4)
- [ ] Upsell detection
- [ ] Renewal pipeline
- [ ] Referral tracking
- [ ] Case study automation

## Justificativa

### Por que não BMAD puro?
- BMAD é genérico para software development
- Não tem conceitos de Revenue Operations
- Não entende Bow Tie Funnel
- Não tem workflows de handoff

### Por que não AIOX puro?
- AIOX é muito complexo para nosso caso
- Foco em autonomia total (não precisamos)
- Overhead de setup muito grande
- Não tem domínio de RevOps

### Por que híbrido customizado?
- ✅ Mantém simplicidade
- ✅ Foco em RevOps (nosso domínio)
- ✅ Usa melhores práticas de ambos
- ✅ Customizado para nosso workflow
- ✅ Escalável e mantível

## Consequências

### Positivas
- Sistema sob nosso controle total
- Evolui com nossas necessidades
- Documentação específica do domínio
- Curva de aprendizado menor

### Negativas
- Não temos comunidade pronta
- Precisamos manter a metodologia
- Menos features "de graça"

### Mitigação
- Documentar tudo em `.kiro/`
- Criar guias de uso claros
- Iterar baseado em feedback
- Manter simples e pragmático

## Próximos Passos

1. [ ] Criar agentes core em `.kiro/agents/`
2. [ ] Definir workflow de handoff em `.kiro/workflows/03-handoff/`
3. [ ] Criar template de checklist
4. [ ] Implementar trigger automático
5. [ ] Testar com projeto piloto (Tunad ou Sarah)

## Referências

- [BMAD METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [AIOX Core](https://github.com/SynkraAI/aiox-core)
- [Winning by Design - Bow Tie](https://winningbydesign.com)
- [Predictable Revenue - Aaron Ross](https://predictablerevenue.com)

---

**Decisão Final:** Criar metodologia híbrida customizada para RevHackers, inspirada em BMAD e AIOX, mas focada em Revenue Operations e Handoff Vendas→CS.
