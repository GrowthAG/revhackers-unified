-- Migration: Add context, source, and score versioning to rei_responses
-- Created: 2024-12-25
-- Purpose: Critical adjustments for scalability (ChatGPT feedback)

-- Add classification fields (context and source)
ALTER TABLE rei_responses 
ADD COLUMN IF NOT EXISTS context TEXT NOT NULL DEFAULT 'internal' 
  CHECK (context IN ('internal', 'lead_gen', 'public')),
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'rei' 
  CHECK (source IN ('rei', 'diagnostic', 'quiz'));

-- Add score versioning fields
ALTER TABLE rei_responses
ADD COLUMN IF NOT EXISTS score_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rei_responses_context ON rei_responses(context);
CREATE INDEX IF NOT EXISTS idx_rei_responses_source ON rei_responses(source);
CREATE INDEX IF NOT EXISTS idx_rei_responses_context_source ON rei_responses(context, source);

-- Add comments to document the fields
COMMENT ON COLUMN rei_responses.context IS 'Context of the response: internal (REI system), lead_gen (public diagnostics for leads), public (open quizzes)';
COMMENT ON COLUMN rei_responses.source IS 'Source system: rei (internal REI), diagnostic (public diagnostics), quiz (quick assessments)';
COMMENT ON COLUMN rei_responses.score_version IS 'Version of the scoring algorithm used to calculate results';
COMMENT ON COLUMN rei_responses.calculated_at IS 'Timestamp when the score was calculated (may differ from created_at)';

-- Update existing records to have proper context/source
UPDATE rei_responses 
SET 
  context = 'internal',
  source = 'rei',
  score_version = 'v1.0',
  calculated_at = created_at
WHERE context IS NULL OR source IS NULL;
