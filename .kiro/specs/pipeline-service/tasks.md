# Tasks: PipelineService — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/services/PipelineService.spec.ts`
- [ ] Setup Supabase mock with chainable methods

## Advance Stage (AC 1-5)
- [ ] Test advanceStage fetches current project and updates stage
- [ ] Test advanceStage returns error when project not found
- [ ] Test advanceStage returns `{ success: true }` on success
- [ ] Test history record includes from_stage and to_stage
- [ ] Test updated_at is set to current ISO timestamp

## Stage History (AC 6-8)
- [ ] Test getStageHistory returns ordered records
- [ ] Test getStageHistory returns empty array when no history
- [ ] Test getStageHistory returns empty array on error

## Projects By Stage (AC 9-11)
- [ ] Test getProjectsByStage returns projects with flattened trade_name
- [ ] Test trade_name is extracted from nested clients object
- [ ] Test returns empty array on error

## Funnel Metrics (AC 12-15)
- [ ] Test getFunnelMetrics counts projects per stage
- [ ] Test diagnostic status projects are excluded
- [ ] Test terminal stages skipped in conversion rates
- [ ] Test empty stages return count 0

## Link Diagnostic (AC 16-20)
- [ ] Test linkDiagnosticToPipeline inserts diagnostico record
- [ ] Test diagnostico id used as FK for opportunity
- [ ] Test diagnostic type correctly mapped to lead_source
- [ ] Test fallback to rei_projects update on opportunity failure
- [ ] Test opportunity stage history inserted on success

## Convert to Lead (AC 21-24)
- [ ] Test conversion updates status to 'lead' and stage to 'lead_inbound'
- [ ] Test already converted project returns error message
- [ ] Test history record includes diagnostic type in notes
- [ ] Test not found project returns null projectId

## Centralized History Insert (AC 25-27)
- [ ] Test insertStageHistory inserts exactly one record
- [ ] Test changed_by defaults to null
- [ ] Test insert failure logs error without throwing
