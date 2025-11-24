-- Digital Logs Table
-- Speichert kategorienbasierte ScreenTime-Daten nach dem Brainrot-Test

CREATE TABLE IF NOT EXISTS digital_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key zu SART-Test-Sessions
  test_id UUID NOT NULL REFERENCES sart_sessions(id) ON DELETE CASCADE,
  
  -- ScreenTime Bucket (kategorien statt exakte Minuten)
  screen_time_bucket TEXT NOT NULL CHECK (screen_time_bucket IN ('0-30', '30-60', '60-120', '120plus')),
  
  -- Hauptnutzung (max. 2 Kategorien als Array)
  main_categories TEXT[] NOT NULL CHECK (array_length(main_categories, 1) BETWEEN 1 AND 2),
  
  -- Aktivierungsfrequenz (kategorien statt exakte Zahl)
  pickup_frequency TEXT NOT NULL CHECK (pickup_frequency IN ('low', 'medium', 'high', 'veryHigh')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Constraint: Pro Test nur 1 Digital Log
  CONSTRAINT unique_test_digital_log UNIQUE (test_id)
);

-- Index für schnelle Abfragen nach Test-ID
CREATE INDEX idx_digital_logs_test_id ON digital_logs(test_id);

-- Index für Zeitbereich-Analysen
CREATE INDEX idx_digital_logs_created_at ON digital_logs(created_at);

-- RLS (Row Level Security) - User sieht nur eigene Logs
ALTER TABLE digital_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own digital logs"
  ON digital_logs
  FOR SELECT
  USING (
    test_id IN (
      SELECT id FROM sart_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own digital logs"
  ON digital_logs
  FOR INSERT
  WITH CHECK (
    test_id IN (
      SELECT id FROM sart_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own digital logs"
  ON digital_logs
  FOR UPDATE
  USING (
    test_id IN (
      SELECT id FROM sart_sessions WHERE user_id = auth.uid()
    )
  );
