-- Orqflow Collab Features: start_date + file attachments
-- SUPABASE STORAGE: create bucket 'task-attachments' (public: false, file size limit: 50MB)
-- supabase storage: run via Dashboard -> Storage -> New Bucket -> task-attachments

-- ============================================================
-- 1. Add start_date column to orqflow_tasks (idempotent)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'orqflow_tasks'
          AND column_name  = 'start_date'
    ) THEN
        ALTER TABLE public.orqflow_tasks
            ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;

        COMMENT ON COLUMN public.orqflow_tasks.start_date
            IS 'Data de inicio da tarefa para renderizacao de barras no Gantt';
    END IF;
END $$;

-- ============================================================
-- 2. Create orqflow_task_attachments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orqflow_task_attachments (
    id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id      UUID    NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    file_name    VARCHAR(500) NOT NULL,
    file_size    BIGINT  DEFAULT 0,           -- bytes
    file_type    VARCHAR(100) DEFAULT '',     -- MIME type (application/pdf, image/png, etc)
    storage_path TEXT    NOT NULL,            -- Supabase Storage path: task-attachments/{task_id}/{uuid}/{filename}
    uploaded_by  UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. Index on task_id for fast lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orqflow_attachments_task
    ON public.orqflow_task_attachments(task_id);

-- ============================================================
-- 4. Row Level Security
-- ============================================================
ALTER TABLE public.orqflow_task_attachments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'orqflow_task_attachments'
          AND policyname = 'Enable ALL for authenticated'
    ) THEN
        CREATE POLICY "Enable ALL for authenticated"
            ON public.orqflow_task_attachments
            FOR ALL
            USING (auth.role() = 'authenticated');
    END IF;
END $$;
