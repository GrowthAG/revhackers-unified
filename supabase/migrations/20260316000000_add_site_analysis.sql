-- Add site analysis fields to rei_projects
-- client_site: URL of the client's website
-- site_analysis: JSON result from inspect-website edge function (enriched mode)

ALTER TABLE rei_projects
  ADD COLUMN IF NOT EXISTS client_site TEXT,
  ADD COLUMN IF NOT EXISTS site_analysis JSONB;

COMMENT ON COLUMN rei_projects.client_site IS 'URL do site do cliente';
COMMENT ON COLUMN rei_projects.site_analysis IS 'Resultado da analise automatica do site (JSON do inspect-website)';
