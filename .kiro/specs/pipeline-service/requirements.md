# Requirements: PipelineService — Project Pipeline Operations

## User Story 1: Stage Management
As an admin, I want the PipelineService to manage project pipeline stages with full history tracking, so that every stage transition is auditable and no data is lost.

## Acceptance Criteria

### Advance Stage
1. WHEN `advanceStage()` is called with a valid projectId and newStage THE SYSTEM SHALL fetch the current stage, update the project, and insert a history record.
2. WHEN the project is not found THE SYSTEM SHALL return `{ success: false, error: 'Projeto nao encontrado' }`.
3. WHEN the update succeeds THE SYSTEM SHALL return `{ success: true }`.
4. WHEN inserting history THE SYSTEM SHALL include the `from_stage` (previous stage), `to_stage`, and optional notes.
5. WHEN `advanceStage()` is called THE SYSTEM SHALL set `updated_at` to the current ISO timestamp.

### Stage History
6. WHEN `getStageHistory()` is called with a projectId THE SYSTEM SHALL return all history records ordered by `changed_at` ascending.
7. WHEN no history exists THE SYSTEM SHALL return an empty array.
8. WHEN a database error occurs THE SYSTEM SHALL log the error and return an empty array.

### Projects By Stage
9. WHEN `getProjectsByStage()` is called with a stage THE SYSTEM SHALL return projects matching that stage with joined `trade_name` from clients.
10. WHEN mapping results THE SYSTEM SHALL extract `trade_name` from the nested `clients` object and flatten it.
11. WHEN a database error occurs THE SYSTEM SHALL return an empty array.

### Funnel Metrics
12. WHEN `getFunnelMetrics()` is called THE SYSTEM SHALL return stage counts for all pipeline stages.
13. WHEN calculating counts THE SYSTEM SHALL exclude projects with `status: 'diagnostic'`.
14. WHEN calculating conversion rates THE SYSTEM SHALL skip terminal stages (`completed`, `lost`, `churned`).
15. WHEN no projects exist for a stage THE SYSTEM SHALL return 0 for that stage count.

---

## User Story 2: Diagnostic-to-Pipeline Integration
As the system, I want diagnostics to automatically create pipeline entries, so that no lead is lost between the diagnostic form and the sales funnel.

## Acceptance Criteria

### Link Diagnostic
16. WHEN `linkDiagnosticToPipeline()` is called THE SYSTEM SHALL insert a record into `diagnosticos` table.
17. WHEN the diagnostico record is created THE SYSTEM SHALL use the returned `id` as FK for the opportunity.
18. WHEN creating the opportunity THE SYSTEM SHALL map `diagnosticType` to `lead_source` using the predefined mapping (growth→diagnostico_growth, revenue→diagnostico_revenue, founder→diagnostico_founder, site→diagnostico_site).
19. WHEN the opportunity insert fails THE SYSTEM SHALL fallback to updating the `rei_projects` table directly (legacy compat).
20. WHEN the opportunity succeeds THE SYSTEM SHALL insert an initial stage history record.

### Convert Diagnostic to Lead
21. WHEN `convertDiagnosticoToLead()` is called on a project with `status: 'diagnostic'` THE SYSTEM SHALL update status to `lead` and pipeline_stage to `lead_inbound`.
22. WHEN the project already has `status: 'lead'` or `status: 'active'` THE SYSTEM SHALL return `{ projectId, error: 'Projeto ja esta convertido' }`.
23. WHEN conversion succeeds THE SYSTEM SHALL insert a stage history record with `notes` including the diagnostic type.
24. WHEN the project is not found THE SYSTEM SHALL return `{ projectId: null, error: message }`.

### Stage History Insert (Centralized)
25. WHEN `insertStageHistory()` is called THE SYSTEM SHALL insert exactly one record into `pipeline_stage_history`.
26. WHEN `changed_by` is not provided THE SYSTEM SHALL default to `null`.
27. WHEN the insert fails THE SYSTEM SHALL log the error but NOT throw.
