-- Add clickup_doc_id to meeting_recordings for ClickUp NoteTaker deduplication
-- This column stores the ClickUp Doc ID to prevent duplicate imports
ALTER TABLE IF EXISTS public.meeting_recordings
  ADD COLUMN IF NOT EXISTS clickup_doc_id text;

-- Create unique index for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_recordings_clickup_doc_id
  ON public.meeting_recordings (clickup_doc_id)
  WHERE clickup_doc_id IS NOT NULL;

-- Comment
COMMENT ON COLUMN public.meeting_recordings.clickup_doc_id IS 'ID do Doc do ClickUp NoteTaker para deduplicacao de importacoes';
