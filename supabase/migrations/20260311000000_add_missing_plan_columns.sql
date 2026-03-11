-- Add missing columns to strategic_plans that sections read/write

-- onboarding_data: used by OnboardingKickoff, Setup, Training, Adoption, Handover sections
ALTER TABLE strategic_plans
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT NULL;

-- cover_data: used by CoverSection EditableField (eyebrow, company_override)
ALTER TABLE strategic_plans
  ADD COLUMN IF NOT EXISTS cover_data JSONB DEFAULT NULL;

-- sla_data: used by SlaSection EditableField (warning_text, target_time)
ALTER TABLE strategic_plans
  ADD COLUMN IF NOT EXISTS sla_data JSONB DEFAULT NULL;
