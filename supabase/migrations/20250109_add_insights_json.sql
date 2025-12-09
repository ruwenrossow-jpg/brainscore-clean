-- Add insights_json column to sart_sessions table
-- This stores cognitive building blocks for each test session

ALTER TABLE sart_sessions
ADD COLUMN IF NOT EXISTS insights_json JSONB;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_sart_sessions_insights_json 
ON sart_sessions USING GIN (insights_json);

-- Add comment
COMMENT ON COLUMN sart_sessions.insights_json IS 'Cognitive building blocks insight data (SessionInsights type)';
