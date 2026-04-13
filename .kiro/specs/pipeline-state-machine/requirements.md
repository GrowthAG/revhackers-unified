# Requirements: Pipeline State Machine — Stage Transitions & Type Guards

## User Story 1: Stage Transition Validation
As a system operator, I want the pipeline state machine to enforce valid stage transitions, so that opportunities and projects never reach illegal states.

## Acceptance Criteria

### Opportunity Stage Transitions
1. WHEN an opportunity is in `lead_inbound` THE SYSTEM SHALL only allow transitions to `lead_qualified` or `lost`.
2. WHEN an opportunity is in `lead_qualified` THE SYSTEM SHALL only allow transitions to `diagnostic_done` or `lost`.
3. WHEN an opportunity is in `diagnostic_done` THE SYSTEM SHALL only allow transitions to `proposal_draft` or `lost`.
4. WHEN an opportunity is in `proposal_draft` THE SYSTEM SHALL only allow transitions to `proposal_sent` or `lost`.
5. WHEN an opportunity is in `proposal_sent` THE SYSTEM SHALL only allow transitions to `proposal_viewed`, `negotiation`, or `lost`.
6. WHEN an opportunity is in `proposal_viewed` THE SYSTEM SHALL only allow transitions to `negotiation`, `won`, or `lost`.
7. WHEN an opportunity is in `negotiation` THE SYSTEM SHALL only allow transitions to `won` or `lost`.
8. WHEN an opportunity is in `won` THE SYSTEM SHALL not allow any further transitions (empty allowedTransitions).
9. WHEN an opportunity is in `lost` THE SYSTEM SHALL only allow transition back to `lead_inbound`.

### Project Stage Transitions
10. WHEN a project is in `onboarding` THE SYSTEM SHALL only allow transition to `active`.
11. WHEN a project is in `active` THE SYSTEM SHALL only allow transitions to `completed` or `churned`.
12. WHEN a project is in `completed` THE SYSTEM SHALL not allow any further transitions.
13. WHEN a project is in `churned` THE SYSTEM SHALL not allow any further transitions.

### Validation Functions
14. WHEN `isValidOpportunityTransition(from, to)` is called with a valid pair THE SYSTEM SHALL return `true`.
15. WHEN `isValidOpportunityTransition(from, to)` is called with an invalid pair THE SYSTEM SHALL return `false`.
16. WHEN `isValidProjectTransition(from, to)` is called with a valid pair THE SYSTEM SHALL return `true`.
17. WHEN `isValidProjectTransition(from, to)` is called with an invalid pair THE SYSTEM SHALL return `false`.
18. WHEN `isValidTransition(from, to)` is called (unified) THE SYSTEM SHALL check against the combined STAGE_CONFIGS.

---

## User Story 2: Stage Classification
As a system operator, I want reliable type guards and helper functions, so that the UI can correctly classify and display stages.

## Acceptance Criteria

### Type Guards
19. WHEN `isOpportunityStage()` receives a valid opportunity stage string THE SYSTEM SHALL return `true`.
20. WHEN `isOpportunityStage()` receives a project stage or unknown string THE SYSTEM SHALL return `false`.
21. WHEN `isProjectStage()` receives a valid project stage string THE SYSTEM SHALL return `true`.
22. WHEN `isProjectStage()` receives an opportunity stage or unknown string THE SYSTEM SHALL return `false`.

### Helper Functions
23. WHEN `getStageIndex()` is called with `lead_inbound` THE SYSTEM SHALL return `0`.
24. WHEN `getStageIndex()` is called with `churned` THE SYSTEM SHALL return the last index in PIPELINE_STAGES.
25. WHEN `getStageCategory()` is called with any stage THE SYSTEM SHALL return the correct category string from STAGE_CONFIGS.

### Constants Integrity
26. THE SYSTEM SHALL define exactly 9 opportunity stages in OPPORTUNITY_STAGES.
27. THE SYSTEM SHALL define exactly 4 project stages in PROJECT_STAGES.
28. THE SYSTEM SHALL define PIPELINE_STAGES as the union of opportunity + project stages (13 total).
29. THE SYSTEM SHALL have a StageConfig for every stage in PIPELINE_STAGES via STAGE_CONFIGS.
30. THE SYSTEM SHALL define exactly 8 lead sources in LEAD_SOURCES.

### Stage Config Structure
31. WHEN accessing any stage config THE SYSTEM SHALL provide: key, label, labelShort, category, color, icon, description, allowedTransitions.
32. WHEN accessing LEAD_SOURCE_LABELS THE SYSTEM SHALL have a label for every entry in LEAD_SOURCES.
