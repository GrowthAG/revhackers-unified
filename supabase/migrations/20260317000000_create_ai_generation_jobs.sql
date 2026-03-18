CREATE TABLE public.ai_generation_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    result_data JSONB,
    hash_signature TEXT,
    error_log TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Assuming similar policies to other tables, full access for authenticated users/service role
CREATE POLICY "Enable read access for authenticated users" 
ON public.ai_generation_jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON public.ai_generation_jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON public.ai_generation_jobs FOR UPDATE TO authenticated USING (true);

-- Enable Realtime for the table so the Frontend can listen to it
-- We check if publication exists, otherwise create it, but in Supabase it's usually `supabase_realtime`
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'ai_generation_jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ai_generation_jobs;
    END IF;
END $$;
