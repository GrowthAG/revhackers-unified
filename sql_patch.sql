ALTER TABLE rei_projects DROP CONSTRAINT IF EXISTS rei_projects_type_check;
ALTER TABLE rei_projects ADD CONSTRAINT rei_projects_type_check CHECK (type IN ('consulting', 'dev', 'founder', 'funnel', 'site', 'crm_ops'));
