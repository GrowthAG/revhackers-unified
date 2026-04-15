-- Migration: 20260415121247_clickup_sync_events
-- Description: Cria tabela de idempotencia e deduplicacao para os webhooks do ClickUp bidirecional.

CREATE TABLE IF NOT EXISTS public.clickup_sync_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text NOT NULL,              -- Webhook payload event ID ou hash compativel
    event_type text NOT NULL,
    task_id text,
    hub_project_id uuid,
    payload jsonb,
    processed_at timestamptz DEFAULT now(),
    UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_events_task ON public.clickup_sync_events(task_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_project ON public.clickup_sync_events(hub_project_id);

-- Log table helper views or specific policies if needed
ALTER TABLE public.clickup_sync_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role sync events access" ON public.clickup_sync_events;
CREATE POLICY "Service role sync events access"
    ON public.clickup_sync_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Adding observablity tracking column for the project table
ALTER TABLE public.rei_projects ADD COLUMN IF NOT EXISTS last_clickup_sync_at timestamptz;

-- Comments
COMMENT ON TABLE public.clickup_sync_events IS 'Stores processed clickup webhook events to prevent duplicated syncing or infinity loops.';
COMMENT ON COLUMN public.rei_projects.last_clickup_sync_at IS 'Last time this project had any modification synced from the ClickUp environment.';
