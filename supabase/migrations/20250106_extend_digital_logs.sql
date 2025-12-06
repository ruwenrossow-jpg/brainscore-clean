-- Extend Digital Logs for Post-Test Investment Flow
-- Adds context tags and subjective state for richer insights

-- 1. Add context_tags column (Test-Kontext)
ALTER TABLE digital_logs
  ADD COLUMN IF NOT EXISTS context_tags TEXT[];

-- 2. Add subjective_state column (Subjektive Verfassung)
ALTER TABLE digital_logs
  ADD COLUMN IF NOT EXISTS subjective_state TEXT CHECK (
    subjective_state IS NULL OR 
    subjective_state IN ('clear', 'medium', 'distracted')
  );

-- 3. Add custom_context for free text input
ALTER TABLE digital_logs
  ADD COLUMN IF NOT EXISTS custom_context TEXT;

-- Comment on new columns
COMMENT ON COLUMN digital_logs.context_tags IS 'Test context tags: "Nach dem Lernen", "Nach langem Scrollen", etc.';
COMMENT ON COLUMN digital_logs.subjective_state IS 'Subjective mental state: clear, medium, distracted';
COMMENT ON COLUMN digital_logs.custom_context IS 'Free text for "Sonstiges" context option';

-- Create index for context-based queries (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_digital_logs_subjective_state 
  ON digital_logs(subjective_state) 
  WHERE subjective_state IS NOT NULL;
