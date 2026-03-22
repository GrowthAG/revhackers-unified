-- Migration para Inteligencia de Mercado OSINT (JSONB)
-- Tabela: clients e rei_projects

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_data JSONB,
ADD COLUMN IF NOT EXISTS linkedin_scraped_at TIMESTAMPTZ;

ALTER TABLE public.rei_projects
ADD COLUMN IF NOT EXISTS market_data JSONB,
ADD COLUMN IF NOT EXISTS market_data_updated_at TIMESTAMPTZ;
