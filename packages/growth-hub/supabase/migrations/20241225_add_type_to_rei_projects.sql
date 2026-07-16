-- Migration: Add type field to rei_projects table
-- Created: 2024-12-25
-- Purpose: Add type field to support unified REI wizard

-- Add type column to rei_projects
ALTER TABLE rei_projects 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'consulting' 
CHECK (type IN ('consulting', 'dev', 'founder'));

-- Create index for faster queries by type
CREATE INDEX IF NOT EXISTS idx_rei_projects_type ON rei_projects(type);

-- Update existing records (if any) to have a default type
-- This is safe since we're adding a default value
UPDATE rei_projects SET type = 'consulting' WHERE type IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN rei_projects.type IS 'Type of REI project: consulting (360º), dev (web/design), or founder (personal branding)';
