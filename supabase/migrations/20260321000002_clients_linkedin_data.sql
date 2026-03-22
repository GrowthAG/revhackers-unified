-- =============================================================================
-- Migration: Add LinkedIn scraping columns to clients
-- Required by scrape-profile edge function (Chrome Extension OSINT pipeline)
-- =============================================================================

-- linkedin_data: full structured profile scraped by the Chrome Extension
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'linkedin_data'
    ) THEN
        ALTER TABLE public.clients
            ADD COLUMN linkedin_data JSONB;
        COMMENT ON COLUMN public.clients.linkedin_data
            IS 'Structured LinkedIn profile data scraped via Chrome Extension (ScrapedLinkedInProfile schema)';
    END IF;
END $$;

-- linkedin_scraped_at: timestamp of last successful scrape
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'linkedin_scraped_at'
    ) THEN
        ALTER TABLE public.clients
            ADD COLUMN linkedin_scraped_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.clients.linkedin_scraped_at
            IS 'Timestamp of last successful LinkedIn profile scrape via Chrome Extension';
    END IF;
END $$;

-- Index for fast lookup of recently scraped profiles (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_clients_linkedin_scraped_at
    ON public.clients(linkedin_scraped_at DESC NULLS LAST)
    WHERE linkedin_data IS NOT NULL;
