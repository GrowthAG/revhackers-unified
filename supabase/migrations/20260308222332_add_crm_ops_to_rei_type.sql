-- Allow 'crm_ops' as a valid REI project type
ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_type_check;
ALTER TABLE public.rei_projects ADD CONSTRAINT rei_projects_type_check 
  CHECK (type IN ('consulting', 'dev', 'founder', 'funnel', 'site', 'crm_ops'));

-- In case there is any check constraint on responses
ALTER TABLE public.rei_responses DROP CONSTRAINT IF EXISTS rei_responses_type_check;
ALTER TABLE public.rei_responses ADD CONSTRAINT rei_responses_type_check 
  CHECK (type IN ('consulting', 'dev', 'founder', 'funnel', 'site', 'crm_ops'));
