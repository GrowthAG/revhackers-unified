-- Migrate old redundant REI type values to the new canonical 4 types
-- 4 Canonical types: consulting, crm_ops, founder, site

-- 1. Updates on `opportunities`
UPDATE public.opportunities SET type = 'consulting' WHERE type IN ('advisory', 'growth');
UPDATE public.opportunities SET type = 'site' WHERE type IN ('funnel', 'dev', 'funnels_impl');
UPDATE public.opportunities SET type = 'crm_ops' WHERE type IN ('revenue', 'crm', 'CRM_CS_OPS');

-- Add constraint to opportunities
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_type_check;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_type_check 
  CHECK (type IN ('consulting', 'crm_ops', 'founder', 'site'));

-- 2. Updates on `rei_projects`
UPDATE public.rei_projects SET type = 'consulting' WHERE type IN ('advisory', 'growth');
UPDATE public.rei_projects SET type = 'site' WHERE type IN ('funnel', 'dev', 'funnels_impl');
UPDATE public.rei_projects SET type = 'crm_ops' WHERE type IN ('revenue', 'crm', 'CRM_CS_OPS');

ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_type_check;
ALTER TABLE public.rei_projects ADD CONSTRAINT rei_projects_type_check 
  CHECK (type IN ('consulting', 'crm_ops', 'founder', 'site'));


