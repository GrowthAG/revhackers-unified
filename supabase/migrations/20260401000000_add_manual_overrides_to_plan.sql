-- Add manual_overrides column to strategic_plans
ALTER TABLE strategic_plans 
ADD COLUMN IF NOT EXISTS manual_overrides JSONB DEFAULT '{}'::jsonb;
