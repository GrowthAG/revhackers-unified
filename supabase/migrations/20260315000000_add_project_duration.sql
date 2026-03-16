-- Add project_duration field to rei_projects
-- Allows admin to define project timeline (e.g., "90 dias", "6 semanas", "12 meses")
-- Replaces hardcoded duration logic based on project type

ALTER TABLE rei_projects
  ADD COLUMN IF NOT EXISTS project_duration TEXT DEFAULT '90 dias';

COMMENT ON COLUMN rei_projects.project_duration IS
  'Duração do projeto (ex: "90 dias", "6 semanas", "12 semanas", "6 meses")';
