-- Create clients table
-- This table stores client information for the CRM/Onboarding system
-- Must be created BEFORE strategic_plans migration

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  
  -- Additional Info
  logo_url TEXT,
  website TEXT,
  linkedin_url TEXT,
  
  -- Address
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  
  -- Business Info
  segment TEXT, -- Vertical de negócio
  company_size TEXT, -- Porte da empresa
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can do everything
CREATE POLICY "Admins can manage all clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.clients IS 'Cadastro de clientes para gestão de onboarding e projetos';
COMMENT ON COLUMN public.clients.segment IS 'Vertical de negócio (ex: SaaS, E-commerce, Educação)';
COMMENT ON COLUMN public.clients.company_size IS 'Porte da empresa (ex: Startup, PME, Enterprise)';
