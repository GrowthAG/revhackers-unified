-- ============================================================================
-- MIGRATION: Project Schema Alignment for ClickUp Provision
-- Purpose: Add duration_days (INT), tier, update type constraints, and fix
--          the project_duration TEXT->INT casting issue.
-- Date: 2026-04-15
-- ============================================================================

-- 1. Adicionar duration_days (INT) — a coluna que o clickup-provision usa
ALTER TABLE public.rei_projects
  ADD COLUMN IF NOT EXISTS duration_days INT;

-- 2. Adicionar tier (free/paid) — computado automaticamente
ALTER TABLE public.rei_projects
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'paid'
    CHECK (tier IN ('free', 'paid'));

-- 3. Backfill: extrair numero de project_duration TEXT existente
-- Converte "90 dias" -> 90, "180" -> 180, etc
UPDATE public.rei_projects
SET duration_days = (REGEXP_REPLACE(COALESCE(project_duration, '90'), '[^0-9]', '', 'g'))::INT
WHERE duration_days IS NULL
  AND project_duration IS NOT NULL;

-- Fallback para projetos sem project_duration
UPDATE public.rei_projects
SET duration_days = 90
WHERE duration_days IS NULL;

-- 4. Backfill tier com base no tipo + duracao
UPDATE public.rei_projects
SET tier = CASE
  WHEN type = 'consulting' AND COALESCE(duration_days, 90) <= 60 THEN 'free'
  ELSE 'paid'
END;

-- 5. Trigger para computar tier automaticamente em INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.compute_project_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.type = 'consulting' AND COALESCE(NEW.duration_days, 90) <= 60
    THEN 'free'
    ELSE 'paid'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_project_tier ON public.rei_projects;
CREATE TRIGGER trg_compute_project_tier
  BEFORE INSERT OR UPDATE OF type, duration_days
  ON public.rei_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_project_tier();

-- 6. Atualizar constraint de tipos para incluir linkedin e founder
-- (mantendo backward compat con tipos existentes)
ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_type_check;
ALTER TABLE public.rei_projects ADD CONSTRAINT rei_projects_type_check
  CHECK (type IN ('consulting', 'crm_ops', 'site', 'linkedin', 'founder'));

-- Mesma coisa na tabela opportunities
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_type_check;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_type_check
  CHECK (type IN ('consulting', 'crm_ops', 'site', 'linkedin', 'founder'));

-- 7. Adicionar duration_days e tier na opportunities tambem (para consistencia)
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS duration_days INT;
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'paid'
    CHECK (tier IN ('free', 'paid'));

-- 8. Indice para queries por tipo + duracao (usado pelo admin dashboard)
CREATE INDEX IF NOT EXISTS idx_rei_projects_type_duration
  ON public.rei_projects(type, duration_days);

-- 9. Comentarios
COMMENT ON COLUMN public.rei_projects.duration_days IS
  'Duracao do projeto em dias (30, 60, 90, 180, 360). Usado pelo clickup-provision para gerar sprints.';
COMMENT ON COLUMN public.rei_projects.tier IS
  'Tier de pricing: free (consulting ≤60d) ou paid. Computado automaticamente via trigger.';
