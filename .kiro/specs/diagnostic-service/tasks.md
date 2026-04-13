# Tasks: DiagnosticService — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/services/DiagnosticService.spec.ts`
- [ ] Create shared fixtures in `src/__tests__/fixtures/reiResponses.ts`

## CRM Detection (AC 5-7)
- [ ] Test `checkHasCRM` returns false for empty string via generateDiagnosis
- [ ] Test `checkHasCRM` returns false for `nao`, `não`, `nenhum`, `nao_tenho`, `nao tenho`, `não tenho`
- [ ] Test `checkHasCRM` returns true for `hubspot`, `funnels`, `salesforce`, `pipedrive`
- [ ] Test `checkHasCRM` uses `revops_hub_central` when projectType is `crm_ops`
- [ ] Test `checkHasCRM` handles `crm: 'outro'` with `crm_outro` field

## B2B Detection (AC 8-10)
- [ ] Test `checkIsB2B` returns true for segments containing `b2b`, `saas`, `tech`, `tecnologia`, `consultoria`, `software`
- [ ] Test `checkIsB2B` returns true when `tamanho` contains `enterprise`
- [ ] Test `checkIsB2B` returns true when `ticketMedio` contains `alto`
- [ ] Test `checkIsB2B` returns false for B2C segments

## Array Safety (AC 21-23)
- [ ] Test `ensureArray` with null input (via generateDiagnosis with null desafios)
- [ ] Test `ensureArray` with string input
- [ ] Test `ensureArray` with array input

## Context Mirror (AC 1-4)
- [ ] Test context_mirror populates from standard fields
- [ ] Test context_mirror populates from `revops_*` fields when projectType is `crm_ops`
- [ ] Test context_mirror uses AI data when `aiPlanData.context_mirror` is provided
- [ ] Test context_mirror includes `website_url` when present

## Signal Generation (AC 11-14)
- [ ] Test positive signal generated when CRM exists (no AI)
- [ ] Test negative signal generated when CRM absent (no AI)
- [ ] Test pipeline signal generated for crm_ops with custom pipelines
- [ ] Test AI signals override rule-based signals

## Risk Assessment (AC 15-17)
- [ ] Test high-severity risk when crm_ops has no CRM
- [ ] Test risk includes pipeline stagnation data when present
- [ ] Test risk includes lost reasons count and details

## Implementation Steps (AC 18-20)
- [ ] Test crm_ops generates exactly 4 steps
- [ ] Test standard without CRM starts with "Implementação de CRM"
- [ ] Test B2B includes LinkedIn step

## Premises Generation (AC 24-26)
- [ ] Test standard project generates 3 pillars
- [ ] Test crm_ops generates 4 pillars
- [ ] Test "Observações do Cliente" pillar added when observacoes exist

## Methodology Generation (AC 27-30)
- [ ] Test crm_ops generates 5 methodology steps
- [ ] Test no CRM starts with CRM implementation step
- [ ] Test challenges array drives step generation

## Benchmarks & Personas (AC 31-33)
- [ ] Test competitors mapped from `revops_concorrente*_nome` fields
- [ ] Test empty competitors returns placeholder
- [ ] Test personas include segment from answers

## AI Override (AC 34-35)
- [ ] Test AI pillars override rule-based premises
- [ ] Test AI okrs with sub_results mapped to krs format

## Label Mapping (AC 36-37)
- [ ] Test known IDs return correct labels
- [ ] Test unknown IDs return raw value as fallback
