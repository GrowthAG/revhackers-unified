# Requirements: DiagnosticService — Business Logic Engine

## User Story 1: Diagnostic Generation
As an admin analyst, I want the DiagnosticService to generate accurate diagnostic reports from REI form responses, so that clients receive actionable strategic insights tailored to their business profile.

## Acceptance Criteria

### Diagnostic Context Mirror
1. WHEN a ReiResponse is provided with `segmento`, `metaCrescimento`, and CRM data THE SYSTEM SHALL produce a `context_mirror` object with segment, objective, maturity, and restrictions fields that reflect the actual input data.
2. WHEN the projectType is `crm_ops` THE SYSTEM SHALL use `revops_*` field variants (`revops_segmento`, `revops_hub_central`, `revops_ticket_medio`) for context extraction instead of standard field names.
3. WHEN AI plan data (`aiPlanData`) includes a `context_mirror` THE SYSTEM SHALL prefer AI values but fall back to raw form data for missing fields (segment, objective).
4. WHEN `website_url` is present in answers THE SYSTEM SHALL include it in the context_mirror output.

### CRM Detection
5. WHEN the `crm` field value is one of `nao`, `não`, `nenhum`, `nao_tenho`, `nao tenho`, `não tenho`, or empty THE SYSTEM SHALL return `false` for `checkHasCRM()`.
6. WHEN the `crm` field contains a valid CRM name (e.g., `hubspot`, `funnels`, `salesforce`) THE SYSTEM SHALL return `true` for `checkHasCRM()`.
7. WHEN projectType is `crm_ops` THE SYSTEM SHALL also check `revops_hub_central` for CRM presence.

### B2B Detection
8. WHEN the segment field contains any of `b2b`, `tech`, `saas`, `tecnologia`, `consultoria`, `software` THE SYSTEM SHALL return `true` for `checkIsB2B()`.
9. WHEN `tamanho` or `revops_tamanho_time` contains `ep` or `enterprise` THE SYSTEM SHALL return `true` for `checkIsB2B()`.
10. WHEN `ticketMedio` or `revops_ticket_medio` contains `alto` THE SYSTEM SHALL return `true` for `checkIsB2B()`.

### Signal Generation
11. WHEN `hasCRM` is true and no AI signals exist THE SYSTEM SHALL generate a positive signal about infrastructure presence.
12. WHEN `hasCRM` is false and no AI signals exist THE SYSTEM SHALL generate a negative signal about operational blindness.
13. WHEN projectType is `crm_ops` and custom pipelines exist THE SYSTEM SHALL generate a neutral signal with pipeline count and names.
14. WHEN AI signals are provided via `aiPlanData` THE SYSTEM SHALL use AI signals instead of rule-based generation.

### Risk Assessment
15. WHEN `hasCRM` is false and projectType is `crm_ops` THE SYSTEM SHALL generate a high-severity risk about analytical blindness.
16. WHEN pipeline stagnation data exists THE SYSTEM SHALL incorporate it into risk descriptions and mitigations.
17. WHEN lost reasons are mapped THE SYSTEM SHALL generate a medium-severity risk with the count and top reasons.

### Implementation Steps
18. WHEN projectType is `crm_ops` THE SYSTEM SHALL generate exactly 4 implementation steps: Mapeamento As-Is, Design de Propriedades, Automação de Roteamento, Treinamento Comercial.
19. WHEN projectType is standard and `hasCRM` is false THE SYSTEM SHALL include "Implementação de CRM" as the first implementation step.
20. WHEN `isB2B` is true THE SYSTEM SHALL include "Criação de Audiência LinkedIn" in implementation steps.

### Array Safety
21. WHEN `ensureArray()` receives `null` or `undefined` THE SYSTEM SHALL return an empty array `[]`.
22. WHEN `ensureArray()` receives a single string THE SYSTEM SHALL return an array with that string `[value]`.
23. WHEN `ensureArray()` receives an array THE SYSTEM SHALL return the array unchanged.

---

## User Story 2: Strategic Plan Generation
As an admin analyst, I want the DiagnosticService to generate a complete strategic plan from REI responses, so that proposals contain personalized premises, methodology, roadmap, goals, projections, and budget.

## Acceptance Criteria

### Premises
24. WHEN generating premises for a standard project THE SYSTEM SHALL produce 3 pillars: "Contexto do Negócio", "Stack & Infraestrutura", "Diagnóstico Estratégico".
25. WHEN generating premises for `crm_ops` THE SYSTEM SHALL produce 4 pillars: "Contexto do Cliente", "Diagnóstico Operacional", "Arquitetura & Governança", "Compromissos Mútuos".
26. WHEN `observacoes` or `implementationAttempts` exist THE SYSTEM SHALL add an additional "Observações do Cliente" pillar.

### Methodology
27. WHEN projectType is `crm_ops` THE SYSTEM SHALL generate exactly 5 methodology steps spanning weeks 1-12.
28. WHEN `hasCRM` is false in standard flow THE SYSTEM SHALL include "Implementação de CRM" as the first methodology step.
29. WHEN challenges include `leads` THE SYSTEM SHALL add a "Motor de Geração de Leads" step.
30. WHEN challenges include `churn` or `ltv` THE SYSTEM SHALL add a "Programa de Retenção" step with churn rate.

### Benchmarks & Personas
31. WHEN competitor names exist in answers (`revops_concorrente1_nome`, etc.) THE SYSTEM SHALL generate benchmark entries for each named competitor.
32. WHEN no competitors are provided THE SYSTEM SHALL return a single placeholder entry with `company_name: 'Não informado'`.
33. WHEN generating personas THE SYSTEM SHALL map segment and channels from actual answers.

### AI Override
34. WHEN `aiPlanData` provides `pillars`, `methodology_steps`, `roadmap_phases`, or `okrs` THE SYSTEM SHALL use AI-generated content instead of rule-based generation.
35. WHEN AI data includes `okrs` with `sub_results` THE SYSTEM SHALL map them to `krs` format with `label`, `text`, and `target` fields.

### Label Mapping
36. WHEN a raw field ID (e.g., `google-ads`) is passed to `mapLabel()` THE SYSTEM SHALL return a human-readable label (e.g., `Google Ads`).
37. WHEN an unknown ID is passed to `mapLabel()` THE SYSTEM SHALL return the raw ID as fallback.
