-- Adiciona rastreamento persistente de fase do onboarding em rei_projects
-- Resolve buraco negro #1: fase calculada apenas em memoria, sem persistencia no banco

ALTER TABLE public.rei_projects
  ADD COLUMN IF NOT EXISTS onboarding_phase INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_phase_entered_at TIMESTAMPTZ DEFAULT now();

-- Backfill: projetos ativos ja estao na fase 4
UPDATE public.rei_projects
SET onboarding_phase = 4,
    onboarding_phase_entered_at = updated_at
WHERE status = 'active' OR pipeline_stage = 'active';

-- Backfill: projetos com agendamento confirmado estao na fase 3
UPDATE public.rei_projects
SET onboarding_phase = 3,
    onboarding_phase_entered_at = updated_at
WHERE scheduling_completed = true
  AND onboarding_phase < 3;

-- Comentario: fases 1 e 2 nao tem marcador confiavel no banco para backfill
-- Novos avancos serao persistidos pelo OrchestratedOnboarding via persistPhase()

COMMENT ON COLUMN public.rei_projects.onboarding_phase IS '1=Diagnostico, 2=Agendamento, 3=Planejamento, 4=GoLive';
COMMENT ON COLUMN public.rei_projects.onboarding_phase_entered_at IS 'Timestamp da ultima mudanca de fase - usado para detectar clientes parados';
