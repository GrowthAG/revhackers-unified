# Requirements: Opportunities API — Sales Pipeline CRUD

## User Story 1: Opportunity Management
As an admin analyst, I want to create, read, update, and advance opportunities through the sales pipeline, so that I can manage the complete sales lifecycle from lead capture to deal closure.

## Acceptance Criteria

### Create Opportunity
1. WHEN `createOpportunity()` is called with valid input THE SYSTEM SHALL insert a row into the `opportunities` table and return the created opportunity.
2. WHEN an opportunity is created THE SYSTEM SHALL default `pipeline_stage` to `lead_inbound` if not specified.
3. WHEN an opportunity is created THE SYSTEM SHALL default `lead_source` to `manual` if not specified.
4. WHEN an opportunity is created THE SYSTEM SHALL insert an initial stage history record with `from_stage: null`.
5. WHEN creation fails THE SYSTEM SHALL return `{ opportunity: null, error: message }`.

### Read Opportunities
6. WHEN `getAllOpportunities()` is called THE SYSTEM SHALL return all opportunities with joined diagnostic data (score, tipo).
7. WHEN mapping opportunities THE SYSTEM SHALL compute `display_name` as: `trade_name || client_company || client_name`.
8. WHEN mapping opportunities THE SYSTEM SHALL compute `days_in_stage` from the `updated_at` timestamp.
9. WHEN `getOpportunityById()` is called with a valid ID THE SYSTEM SHALL return the opportunity.
10. WHEN `getOpportunityById()` is called with an invalid ID THE SYSTEM SHALL return `null`.
11. WHEN `getOpportunitiesByStage()` is called THE SYSTEM SHALL return only opportunities matching the specified stage.

### Advance Stage
12. WHEN `advanceOpportunityStage()` is called with a valid stage THE SYSTEM SHALL update `pipeline_stage` and `updated_at`.
13. WHEN advancing to `won` THE SYSTEM SHALL set `won_at` to current timestamp.
14. WHEN advancing to `lost` THE SYSTEM SHALL set `lost_at` to current timestamp.
15. WHEN a stage is advanced THE SYSTEM SHALL insert a history record with `from_stage` and `to_stage`.
16. WHEN the opportunity is not found THE SYSTEM SHALL return `{ success: false, error: message }`.

### Link Diagnostic
17. WHEN `linkDiagnosticToOpportunity()` is called and an existing opportunity with the same email exists in early stages THE SYSTEM SHALL update the existing opportunity with the diagnostic ID.
18. WHEN `linkDiagnosticToOpportunity()` is called and no existing opportunity exists THE SYSTEM SHALL create a new opportunity.
19. WHEN linking a diagnostic THE SYSTEM SHALL set `pipeline_stage` to `diagnostic_done`.

### Convert to Project
20. WHEN `convertOpportunityToProject()` is called THE SYSTEM SHALL invoke the `convert_opportunity_to_project` RPC.
21. WHEN conversion succeeds and opportunity has `opportunity_data` THE SYSTEM SHALL create a handover task in `orqflow_tasks`.
22. WHEN conversion succeeds THE SYSTEM SHALL trigger `generate-success-plan` edge function asynchronously.
23. WHEN the edge function fails THE SYSTEM SHALL NOT block the main conversion flow.

### Funnel Metrics
24. WHEN `getOpportunityFunnelMetrics()` is called THE SYSTEM SHALL return stage counts and total pipeline value.
25. WHEN calculating pipeline value THE SYSTEM SHALL exclude `lost` opportunities.
26. WHEN `investimento_estimado` is present THE SYSTEM SHALL use the average of `range_min` and `range_max`.

### Stage History
27. WHEN `getOpportunityStageHistory()` is called THE SYSTEM SHALL return records ordered by `changed_at` ascending.
28. WHEN `insertOpportunityStageHistory()` is called THE SYSTEM SHALL insert a record with opportunity_id, from_stage, to_stage, changed_at, and optional notes.

### Helper Functions
29. WHEN `daysSince()` receives a valid ISO date string THE SYSTEM SHALL return the number of full days elapsed.
30. WHEN `daysSince()` receives null THE SYSTEM SHALL return 0.
