-- Modificar client_accounts para suportar metricas de MRR (Módulo 1)
ALTER TABLE client_accounts 
  ADD COLUMN IF NOT EXISTS consulting_mrr NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS software_mrr NUMERIC(10,2) DEFAULT 0;

-- Para deixar a nomenclatura explicita para a arquitetura fidedigna
-- Vamos engatilhar alias-like descriptions e manter compatibility
COMMENT ON COLUMN client_accounts.consulting_value IS 'Equivalente ao TCV de Consulting';
COMMENT ON COLUMN client_accounts.software_value IS 'Equivalente ao TCV de Software';
