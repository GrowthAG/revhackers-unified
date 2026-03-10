---
description: Arquitetura e Separação de Protocolos REI (360, CRM, Founder, Sites). Diretrizes Oficiais para Manutenção dos Protocolos REI (RevHackers).
---

Esta skill documenta a separação **estrita** de cada protocolo de diagnóstico (REI). Cada protocolo possui um público diferente, perguntas diferentes, e **deve gerar um Planejamento Estratégico completamente diferente**, embora todos compartilhem a mesma arquitetura de layout e diagramação (UI visual).

## 1. Princípio Fundamental
**NUNCA misture os dados, lógicas ou fluxos de um protocolo com o outro.** Se você estiver alterando o "REI CRM", certifique-se de que a lógica tem um `if (projectType === 'crm_ops')` ou similar no Backend/Serviços, protegendo a regra para não impactar o "REI 360", "Founder" ou os outros.

## 2. Os Quatro Protocolos e Seus Domínios

### A. REI 360 (Consulting Geral / Growth)
* **Objetivo:** Visão macro de aquisição, canais, tráfego (Google, Meta Ads), conversão geral.
* **Componentes de Formulário (`REIWizard.tsx`):**
  - Passo 2: `Step2Contexto` (Segmento, Ticket Médio, MRR)
  - Passo 3: `Step3Desafios` (Metas, Gargalos, Persona)
  - Passo 4: `Step4Estrategia` (Canais de Aquisição, CAC, LTV)
  - Passo 5: `Step5Expectativas`
* **Geração de Plano (`DiagnosticService.ts`):** Rota default de processamento. Focada em otimização de campanhas, mídia paga, SEO e Outbound. Mapeia dados demográficos e desafios gerais.

### B. REI CRM & RevOps (crm_ops)
* **Objetivo:** Foco exclusivo no "cano de vendas": arquitetura de dados nativos, SLA Vendas/Marketing, Tech Stack de RevOps, Retenção, Pipeline Visual e motivos de perda. **Sem foco em canais de mídia paga e tráfego**.
* **Componentes de Formulário (`REIWizard.tsx`):**
  - Passo 1: `StepCrmOps1Context`
  - Passo 2: `StepCrmOps2TechStack`
  - Passo 3: `StepCrmOps3AquisicaoSLA`
  - Passo 4: `StepCrmOps4Execucao`
  - Passo 5: `StepCrmOps5Retencao`
* **Geração de Plano (`DiagnosticService.ts`):** Lógica encapsulada em `if (projectType === 'crm_ops')`. Premissas exclusivas de Rastreamento, SLA, Processos; Roadmap injeta módulos de Infraestrutura de CRM, Automação Nativa e Treinamento Comercial; Metas trazem OKRs de Win Rate e Qualidade de Pipeline.

### C. REI Founder (Founder Led Sales)
* **Objetivo:** Posicionamento de autoridade, LinkedIn, criação de conteúdo, Social Selling e vendas originadas pelos founders.
* **Componentes de Formulário (`REIWizard.tsx`):**
  - Passo 1: `StepFounderLinkedIn`
  - Passo 2: `StepFounderDeepDive`
  - Passo 3: `Step5Expectativas`
* **Geração de Plano:** Focado em rotina de produção de conteúdo, framework de autoridade (Playbooks de LinkedIn) e cadência de engajamento social.

### D. REI Sites e LPs (site / dev)
* **Objetivo:** Diagnóstico de estabilidade técnica, conversão UX/UI da página, CMS (WordPress, Framer, Webflow, etc.), SEO Técnico e Arquitetura de Informação.
* **Componentes de Formulário (`REIWizard.tsx`):**
  - Passo 1: `StepDevTechnical`
  - Passo 2: `Step5Expectativas`
* **Geração de Plano:** Auditoria de performance, wireframing, testes de conversão (CRO) e UI/UX Guidelines.

## 3. Arquitetura Universal de Interface (UI)
As telas que o cliente final enxerga, ou seja, os componentes visuais de Dashboard (como `GoalsSection.tsx`, `RoadmapSection.tsx`, `MethodologySection.tsx` na pasta de seções UI), são **universais e agnósticas**.
* **Regra de Ouro:** Não crie componentes visuais separados para cada plano (ex: `RoadmapCRM.tsx`, `Roadmap360.tsx`).
* **Como funciona:** Garanta que o Serviço/Backend (`DiagnosticService.ts`) envie os **arrays de dados dinâmicos** que cada componente espera (como `steps`, `krs`, `pillars`), empacotando o conteúdo daquele respectivo REI, garantindo que o `projectType` correto filtrou o processamento. Os React components apenas vão iterar e renderizar na tela o input validado, mantendo a diagramação Premium padrão da RevHackers.

## Instrução Prática
1. Ao receber qualquer pedido para alterar ou depurar um fluxo REI, identifique primeiramente **qual o REI (tipo/projectType)** que está sendo afetado.
2. Isole as alterações de form e processamento (`.tsx` dos passos e métodos no `DiagnosticService`, respectivamente).
3. Teste o mock do respectivo fluxo no script de backend ou abrindo na interface real.
