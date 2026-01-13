-- Add columns for Onboarding Flow Enhancements
ALTER TABLE public.rei_projects
ADD COLUMN IF NOT EXISTS scheduling_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS technical_evidences JSONB DEFAULT '[]'::jsonb;

-- Comment
COMMENT ON COLUMN public.rei_projects.scheduling_completed IS 'Indicates if the presentation call has been scheduled';
COMMENT ON COLUMN public.rei_projects.technical_evidences IS 'Array of file URLs for technical evidences (prints, GTM, etc)';
