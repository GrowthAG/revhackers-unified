-- ============================================================================
-- MIGRATION: Soft Deletes
-- Purpose: Add deleted_at column to all main tables for data recovery
-- Date: 2026-04-03
-- ============================================================================

-- 1. Add deleted_at to opportunities
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_opportunities_deleted ON public.opportunities(deleted_at);

-- 2. Add deleted_at to rei_projects
ALTER TABLE public.rei_projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_rei_projects_deleted ON public.rei_projects(deleted_at);

-- 3. Add deleted_at to orqflow_sprints
ALTER TABLE public.orqflow_sprints ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orqflow_sprints_deleted ON public.orqflow_sprints(deleted_at);

-- 4. Add deleted_at to orqflow_tasks
ALTER TABLE public.orqflow_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orqflow_tasks_deleted ON public.orqflow_tasks(deleted_at);

-- 5. Add deleted_at to handoff_metrics
ALTER TABLE public.handoff_metrics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_deleted ON public.handoff_metrics(deleted_at);

-- 6. Add deleted_at to handoff_rate_limit
ALTER TABLE public.handoff_rate_limit ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_rate_limit_deleted ON public.handoff_rate_limit(deleted_at);

-- 7. Add deleted_at to handoff_idempotency
ALTER TABLE public.handoff_idempotency ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_idempotency_deleted ON public.handoff_idempotency(deleted_at);

-- 8. Add deleted_at to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_clients_deleted ON public.clients(deleted_at);

-- 9. Add deleted_at to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_proposals_deleted ON public.proposals(deleted_at);

-- 10. Add deleted_at to rei_responses
ALTER TABLE public.rei_responses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_rei_responses_deleted ON public.rei_responses(deleted_at);

-- 11. Add deleted_at to rei_materials
ALTER TABLE public.rei_materials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_rei_materials_deleted ON public.rei_materials(deleted_at);

-- 12. Add deleted_at to knowledge_libraries
ALTER TABLE public.knowledge_libraries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_knowledge_libraries_deleted ON public.knowledge_libraries(deleted_at);

-- 13. Add deleted_at to client_documents
ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_client_documents_deleted ON public.client_documents(deleted_at);

-- 14. Add deleted_at to meeting_recordings
ALTER TABLE public.meeting_recordings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_deleted ON public.meeting_recordings(deleted_at);

-- 15. Add deleted_at to integrations
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_integrations_deleted ON public.integrations(deleted_at);

-- 16. Add deleted_at to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON public.organizations(deleted_at);

-- 17. Add deleted_at to ghl_organizations
ALTER TABLE public.ghl_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_ghl_organizations_deleted ON public.ghl_organizations(deleted_at);

-- 18. Add deleted_at to ai_agents
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_ai_agents_deleted ON public.ai_agents(deleted_at);

-- 19. Add deleted_at to ai_generation_jobs
ALTER TABLE public.ai_generation_jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_deleted ON public.ai_generation_jobs(deleted_at);

-- 20. Add deleted_at to opportunity_stage_history
ALTER TABLE public.opportunity_stage_history ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_opportunity_stage_history_deleted ON public.opportunity_stage_history(deleted_at);

-- 21. Add deleted_at to pipeline_stage_history
ALTER TABLE public.pipeline_stage_history ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_history_deleted ON public.pipeline_stage_history(deleted_at);

-- 22. Add deleted_at to handoff_idempotency
ALTER TABLE public.handoff_idempotency ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_idempotency_deleted ON public.handoff_idempotency(deleted_at);

-- 23. Add deleted_at to handoff_metrics
ALTER TABLE public.handoff_metrics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_deleted ON public.handoff_metrics(deleted_at);

-- 24. Add deleted_at to handoff_rate_limit
ALTER TABLE public.handoff_rate_limit ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_rate_limit_deleted ON public.handoff_rate_limit(deleted_at);

-- 25. Add deleted_at to rei_projects
ALTER TABLE public.rei_projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_rei_projects_deleted ON public.rei_projects(deleted_at);

-- 26. Add deleted_at to orqflow_sprints
ALTER TABLE public.orqflow_sprints ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orqflow_sprints_deleted ON public.orqflow_sprints(deleted_at);

-- 27. Add deleted_at to orqflow_tasks
ALTER TABLE public.orqflow_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orqflow_tasks_deleted ON public.orqflow_tasks(deleted_at);

-- 28. Add deleted_at to handoff_metrics
ALTER TABLE public.handoff_metrics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_deleted ON public.handoff_metrics(deleted_at);

-- 29. Add deleted_at to handoff_rate_limit
ALTER TABLE public.handoff_rate_limit ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_rate_limit_deleted ON public.handoff_rate_limit(deleted_at);

-- 30. Add deleted_at to handoff_idempotency
ALTER TABLE public.handoff_idempotency ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_handoff_idempotency_deleted ON public.handoff_idempotency(deleted_at);
