CREATE TABLE IF NOT EXISTS client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT UNIQUE NOT NULL,
  client_name TEXT,
  client_company TEXT,
  
  -- IDs no GHL RevHackers
  revhackers_contact_id TEXT,
  revhackers_opportunity_id TEXT,
  
  -- IDs no GHL Funnels  
  funnels_contact_id TEXT,
  funnels_opportunity_id TEXT,
  
  -- Flags de produto
  has_consulting BOOLEAN DEFAULT false,
  has_software BOOLEAN DEFAULT false,
  
  -- Valores
  consulting_value NUMERIC(10,2) DEFAULT 0,
  software_value NUMERIC(10,2) DEFAULT 0,
  
  -- Datas
  consulting_start_date TIMESTAMPTZ,
  consulting_end_date TIMESTAMPTZ,
  software_activation_date TIMESTAMPTZ,
  software_renewal_date TIMESTAMPTZ,
  
  -- Status
  consulting_status TEXT DEFAULT 'pending', -- pending, active, completed
  software_status TEXT DEFAULT 'pending',   -- pending, onboarding, active, churn
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_accounts_email ON client_accounts(client_email);
