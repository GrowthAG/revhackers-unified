# Workflow: Won → Onboarding

**Objetivo:** Transição automática e sem perda de contexto de Vendas para CS

## Trigger

```sql
-- Quando opportunity muda para "won"
UPDATE opportunities 
SET pipeline_stage = 'won', 
    won_at = NOW()
WHERE id = ?
```

## Pré-Requisitos

### Dados Obrigatórios
- [x] `client_name` preenchido
- [x] `client_email` preenchido
- [x] `client_company` preenchido
- [x] `type` definido (consulting, crm_ops, founder, dev)
- [x] `diagnostico_id` vinculado
- [x] `analyst_email` atribuído

### Validações
- [x] Proposta assinada (proposal.status = 'signed')
- [x] Stakeholders mapeados (min 2)
- [x] Diagnóstico completo (rei_response.total_score > 0)

## Fluxo Automático

### Step 1: Validação (0-5min)
```typescript
const validation = await handoffSpecialist.validateHandoff(opportunityId);

if (!validation.isValid) {
  // Notificar vendedor
  await notify({
    to: opportunity.analyst_email,
    subject: 'Handoff Bloqueado - Dados Faltando',
    body: validation.missingFields,
    priority: 'high'
  });
  
  // Parar fluxo
  return { status: 'blocked', reason: validation.missingFields };
}
```

### Step 2: Criação do Projeto (5-10min)
```typescript
const project = await createReiProject({
  // Dados básicos
  type: opportunity.type,
  client_name: opportunity.client_name,
  client_email: opportunity.client_email,
  client_company: opportunity.client_company,
  trade_name: opportunity.trade_name,
  
  // Status inicial
  status: 'onboarding',
  
  // Analista
  analyst_email: opportunity.analyst_email,
  
  // Datas
  next_rei_date: addDays(new Date(), 7), // Kickoff em 7 dias
  project_duration: opportunity.opportunity_data?.project_duration || '90',
  
  // Contexto de vendas
  sales_context: {
    opportunity_id: opportunity.id,
    won_at: opportunity.won_at,
    proposal_id: opportunity.proposal_id,
    stakeholders: opportunity.opportunity_data?.stakeholders,
    promises: opportunity.opportunity_data?.promises,
    investment: opportunity.opportunity_data?.investimento_estimado,
    diagnostic_score: opportunity.diagnostic_score
  }
});
```

### Step 3: Vinculação (10-12min)
```typescript
// Vincular opportunity ao projeto
await updateOpportunity(opportunity.id, {
  rei_project_id: project.id
});

// Vincular diagnóstico ao projeto
if (opportunity.diagnostico_id) {
  await linkDiagnosticToProject(opportunity.diagnostico_id, project.id);
}
```

### Step 4: Criação de Sprints (12-15min)
```typescript
const duration = parseInt(project.project_duration);
const sprintDuration = duration <= 30 ? 7 : duration <= 60 ? 14 : 21; // dias

const sprints = await createSprintsFromTemplate({
  project_id: project.id,
  type: project.type,
  duration: duration,
  sprint_duration: sprintDuration,
  start_date: addDays(new Date(), 7) // Após kickoff
});
```

### Step 5: Injeção de Tasks (15-18min)
```typescript
const template = getTemplateForREI(project.type, project.project_duration);

const tasks = await bulkCreateTasks(
  template.map(t => ({
    ...t,
    project_id: project.id,
    sprint_id: sprints[t.sprint_index]?.id
  }))
);
```

### Step 6: Comunicação com Cliente (18-20min)
```typescript
// Email de boas-vindas
await sendEmail({
  to: project.client_email,
  template: 'client-welcome',
  data: {
    client_name: project.client_name,
    analyst_name: getAnalystName(project.analyst_email),
    kickoff_date: project.next_rei_date,
    project_duration: project.project_duration,
    hub_url: `${BASE_URL}/hub/${project.id}`
  }
});

// Notificar analista
await sendEmail({
  to: project.analyst_email,
  template: 'analyst-new-project',
  data: {
    client_name: project.client_name,
    project_type: project.type,
    kickoff_date: project.next_rei_date,
    admin_url: `${BASE_URL}/admin/projects/${project.id}`
  }
});
```

### Step 7: Agendamento de Kickoff (20-22min)
```typescript
// Se kickoff não foi agendado ainda
if (!project.scheduling_completed) {
  await createCalendarEvent({
    title: `Kickoff - ${project.client_company}`,
    date: project.next_rei_date,
    duration: 60, // minutos
    attendees: [
      project.client_email,
      project.analyst_email,
      ...project.focal_points?.map(fp => fp.email)
    ],
    description: `
      Kickoff do projeto ${project.type}
      
      Agenda:
      1. Apresentação do time RevHackers
      2. Revisão do diagnóstico
      3. Apresentação do plano estratégico
      4. Alinhamento de expectativas
      5. Próximos passos
      
      Link do Hub: ${BASE_URL}/hub/${project.id}
    `
  });
}
```

### Step 8: Logging & Metrics (22-24min)
```typescript
// Registrar evento de handoff
await createStageEvent({
  opportunity_id: opportunity.id,
  from_stage: 'won',
  to_stage: 'onboarding',
  changed_at: new Date(),
  changed_by: 'system',
  notes: 'Handoff automático executado com sucesso'
});

// Atualizar métricas
await updateMetrics({
  handoff_count: increment(1),
  handoff_success_rate: recalculate(),
  avg_handoff_time: recalculate()
});
```

## SLA Tracking

```typescript
const handoffStarted = opportunity.won_at;
const handoffCompleted = project.created_at;
const handoffDuration = differenceInHours(handoffCompleted, handoffStarted);

if (handoffDuration > 24) {
  // SLA quebrado
  await notify({
    to: 'ops@revhackers.com.br',
    subject: 'SLA de Handoff Quebrado',
    body: `
      Opportunity: ${opportunity.id}
      Cliente: ${opportunity.client_name}
      Duração: ${handoffDuration}h
      SLA: 24h
    `,
    priority: 'critical'
  });
}
```

## Rollback (Em Caso de Erro)

```typescript
try {
  // Executar handoff
  await executeHandoff(opportunityId);
} catch (error) {
  // Rollback
  await rollbackHandoff({
    opportunity_id: opportunityId,
    project_id: project?.id,
    error: error.message
  });
  
  // Notificar
  await notify({
    to: 'ops@revhackers.com.br',
    subject: 'Handoff Falhou - Intervenção Manual Necessária',
    body: `
      Opportunity: ${opportunityId}
      Erro: ${error.message}
      Stack: ${error.stack}
    `,
    priority: 'critical'
  });
}
```

## Métricas de Sucesso

- ✅ Handoff completo em < 24h
- ✅ Zero perda de contexto
- ✅ Cliente recebe email de boas-vindas
- ✅ Analista notificado
- ✅ Kickoff agendado
- ✅ Tasks criadas
- ✅ Sprints planejados

## Próximos Passos

Após handoff completo:
1. Analista prepara kickoff
2. Cliente acessa Hub do Projeto
3. Kickoff acontece (D+7)
4. Status muda para 'active'
5. Sprints começam

---

**Responsável:** @handoff-specialist  
**SLA:** 24h  
**Última atualização:** 2026-04-03
