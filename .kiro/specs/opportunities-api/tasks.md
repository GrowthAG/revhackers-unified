# Tasks: Opportunities API — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/api/opportunities.spec.ts`
- [ ] Create Supabase client mock utility
- [ ] Create opportunity fixture objects

## Create (AC 1-5)
- [ ] Test createOpportunity inserts and returns opportunity
- [ ] Test default pipeline_stage is lead_inbound
- [ ] Test default lead_source is manual
- [ ] Test initial stage history is inserted
- [ ] Test error case returns null opportunity with error message

## Read (AC 6-11)
- [ ] Test getAllOpportunities returns mapped rows with display_name
- [ ] Test display_name priority: trade_name > client_company > client_name
- [ ] Test days_in_stage calculated from updated_at
- [ ] Test getOpportunityById returns opportunity for valid ID
- [ ] Test getOpportunityById returns null for invalid ID
- [ ] Test getOpportunitiesByStage filters correctly

## Advance Stage (AC 12-16)
- [ ] Test advanceOpportunityStage updates stage and timestamp
- [ ] Test advancing to won sets won_at
- [ ] Test advancing to lost sets lost_at
- [ ] Test stage history record inserted on advance
- [ ] Test unknown opportunity returns error

## Link Diagnostic (AC 17-19)
- [ ] Test existing opportunity gets updated with diagnostic
- [ ] Test new opportunity created when no existing match
- [ ] Test pipeline_stage set to diagnostic_done

## Convert to Project (AC 20-23)
- [ ] Test RPC convert_opportunity_to_project is called
- [ ] Test handover task created with bleeding cost data
- [ ] Test success plan edge function triggered
- [ ] Test edge function failure does not block conversion

## Funnel Metrics (AC 24-26)
- [ ] Test stage counts calculated correctly
- [ ] Test lost opportunities excluded from pipeline value
- [ ] Test pipeline value uses average of range_min and range_max

## Stage History (AC 27-28)
- [ ] Test history returned in ascending order
- [ ] Test history insert includes all required fields

## Helpers (AC 29-30)
- [ ] Test daysSince with recent date returns correct days
- [ ] Test daysSince with null returns 0
