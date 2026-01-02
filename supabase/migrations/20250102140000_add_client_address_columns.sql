-- Add missing columns to clients table to support the full onboarding form

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS address TEXT, -- Logradouro
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS complement TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Create index for CNPJ as it is a common lookup field
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON public.clients(cnpj);

COMMENT ON COLUMN public.clients.cnpj IS 'CNPJ do cliente (apenas números preferencialmente)';
COMMENT ON COLUMN public.clients.address IS 'Logradouro (Rua, Av, etc)';
