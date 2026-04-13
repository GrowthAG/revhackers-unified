# Tasks: Pipeline State Machine — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/types/pipeline.spec.ts`

## Opportunity Transitions (AC 1-9)
- [ ] Test lead_inbound → lead_qualified is valid
- [ ] Test lead_inbound → lost is valid
- [ ] Test lead_inbound → proposal_draft is invalid
- [ ] Test lead_qualified → diagnostic_done is valid
- [ ] Test diagnostic_done → proposal_draft is valid
- [ ] Test proposal_draft → proposal_sent is valid
- [ ] Test proposal_sent → proposal_viewed is valid
- [ ] Test proposal_sent → negotiation is valid
- [ ] Test proposal_viewed → won is valid
- [ ] Test negotiation → won is valid
- [ ] Test won → any is invalid (empty transitions)
- [ ] Test lost → lead_inbound is valid
- [ ] Test lost → won is invalid

## Project Transitions (AC 10-13)
- [ ] Test onboarding → active is valid
- [ ] Test active → completed is valid
- [ ] Test active → churned is valid
- [ ] Test completed → any is invalid
- [ ] Test churned → any is invalid

## Validation Functions (AC 14-18)
- [ ] Test isValidOpportunityTransition returns true for valid pair
- [ ] Test isValidOpportunityTransition returns false for invalid pair
- [ ] Test isValidProjectTransition returns true for valid pair
- [ ] Test isValidProjectTransition returns false for invalid pair
- [ ] Test isValidTransition works with unified stages

## Type Guards (AC 19-22)
- [ ] Test isOpportunityStage('lead_inbound') returns true
- [ ] Test isOpportunityStage('onboarding') returns false
- [ ] Test isOpportunityStage('random_string') returns false
- [ ] Test isProjectStage('active') returns true
- [ ] Test isProjectStage('negotiation') returns false

## Helpers (AC 23-25)
- [ ] Test getStageIndex('lead_inbound') returns 0
- [ ] Test getStageIndex('churned') returns last index
- [ ] Test getStageCategory returns correct category for each stage

## Constants Integrity (AC 26-32)
- [ ] Test OPPORTUNITY_STAGES has exactly 9 entries
- [ ] Test PROJECT_STAGES has exactly 4 entries
- [ ] Test PIPELINE_STAGES has exactly 13 entries
- [ ] Test every PIPELINE_STAGES entry has a StageConfig
- [ ] Test LEAD_SOURCES has exactly 8 entries
- [ ] Test every LEAD_SOURCE has a label in LEAD_SOURCE_LABELS
- [ ] Test every StageConfig has required fields (key, label, category, color, icon, description, allowedTransitions)
