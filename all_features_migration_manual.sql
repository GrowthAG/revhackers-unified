-- ==========================================
-- 1. ADICIONANDO COLUNAS DO NOVO MÓDULO OSINT VISUAL
-- ==========================================
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_data JSONB,
ADD COLUMN IF NOT EXISTS linkedin_scraped_at TIMESTAMPTZ;

ALTER TABLE public.rei_projects
ADD COLUMN IF NOT EXISTS market_data JSONB,
ADD COLUMN IF NOT EXISTS market_data_updated_at TIMESTAMPTZ;

-- ==========================================
-- 2. TAREFAS: START_DATE
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orqflow_tasks' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE public.orqflow_tasks ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ==========================================
-- 3. TAREFAS: TABELA DE ANEXOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orqflow_task_attachments (
    id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id      UUID    NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    file_name    VARCHAR(500) NOT NULL,
    file_size    BIGINT  DEFAULT 0,
    file_type    VARCHAR(100) DEFAULT '',
    storage_path TEXT    NOT NULL,
    uploaded_by  UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orqflow_attachments_task
    ON public.orqflow_task_attachments(task_id);

ALTER TABLE public.orqflow_task_attachments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'orqflow_task_attachments' AND policyname = 'Enable ALL for authenticated'
    ) THEN
        CREATE POLICY "Enable ALL for authenticated"
            ON public.orqflow_task_attachments FOR ALL
            USING (auth.role() = 'authenticated');
    END IF;
END $$;
