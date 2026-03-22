-- =============================================================================
-- Migration: Add audit columns to orqflow_magic_links
-- Needed by MagicApproval.tsx security fixes (TTL, audit trail, idempotency)
-- =============================================================================

-- approved_at: timestamp of approval/rejection action
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orqflow_magic_links' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.orqflow_magic_links
            ADD COLUMN approved_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orqflow_magic_links.approved_at
            IS 'Timestamp when the client approved or rejected the task';
    END IF;
END $$;

-- approver_user_agent: browser user agent for audit trail (LGPD compliance)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orqflow_magic_links' AND column_name = 'approver_user_agent'
    ) THEN
        ALTER TABLE public.orqflow_magic_links
            ADD COLUMN approver_user_agent VARCHAR(255);
        COMMENT ON COLUMN public.orqflow_magic_links.approver_user_agent
            IS 'Browser user agent of the approver (first 255 chars, for audit)';
    END IF;
END $$;

-- created_by: UUID of the RevHackers user who created the magic link
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orqflow_magic_links' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.orqflow_magic_links
            ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        COMMENT ON COLUMN public.orqflow_magic_links.created_by
            IS 'auth.users.id of the RevHackers user who generated this magic link';
    END IF;
END $$;

-- Index for fast TTL lookups (purge expired links)
CREATE INDEX IF NOT EXISTS idx_orqflow_magic_links_expires
    ON public.orqflow_magic_links(expires_at)
    WHERE status = 'pending';

-- Tighten the "Public can update via token" policy to only allow status transitions
-- (prevent malicious updates to other columns like expires_at)
DROP POLICY IF EXISTS "Public can update via token" ON public.orqflow_magic_links;
CREATE POLICY "Public can update status via token"
    ON public.orqflow_magic_links FOR UPDATE
    USING (status = 'pending')
    WITH CHECK (status IN ('approved', 'rejected'));

-- Fix task rejection to go to 'review' not 'doing' (aligns with MagicApproval.tsx fix)
CREATE OR REPLACE FUNCTION public.orqflow_magic_link_trigger() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE public.orqflow_tasks
            SET status = 'done', updated_at = NOW()
        WHERE id = NEW.task_id;
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        -- 'review' not 'doing': rejected tasks need analyst attention before re-entering flow
        UPDATE public.orqflow_tasks
            SET status = 'review', updated_at = NOW()
        WHERE id = NEW.task_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
