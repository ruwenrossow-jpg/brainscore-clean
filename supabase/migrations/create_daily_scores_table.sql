-- Migration: Create daily_scores table
-- Tabelle für aggregierte Tages-Scores

CREATE TABLE IF NOT EXISTS public.daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_score INTEGER NOT NULL CHECK (daily_score >= 0 AND daily_score <= 100),
  test_count INTEGER NOT NULL DEFAULT 1 CHECK (test_count >= 1),
  first_test_at TIMESTAMPTZ,
  last_test_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint: Ein DailyScore pro User pro Tag
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Index für schnelle Abfragen nach User + Datum
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date 
  ON public.daily_scores(user_id, date DESC);

-- Index für zeitbasierte Abfragen
CREATE INDEX IF NOT EXISTS idx_daily_scores_date 
  ON public.daily_scores(date DESC);

-- RLS (Row Level Security) aktivieren
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;

-- Policy: User kann nur eigene DailyScores lesen
CREATE POLICY "Users can read own daily scores"
  ON public.daily_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User kann eigene DailyScores erstellen/updaten
CREATE POLICY "Users can insert own daily scores"
  ON public.daily_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily scores"
  ON public.daily_scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_daily_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.daily_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_scores_updated_at();

-- Kommentar zur Tabelle
COMMENT ON TABLE public.daily_scores IS 
  'Aggregierte BrainScores pro Tag und User. Wird aus test_sessions berechnet und gecacht für Performance.';

-- Kommentare zu wichtigen Spalten
COMMENT ON COLUMN public.daily_scores.daily_score IS 
  'Aggregierter BrainScore (0-100) für diesen Tag, berechnet als Durchschnitt aller Tests des Tages';

COMMENT ON COLUMN public.daily_scores.test_count IS 
  'Anzahl der Tests, die in diesen Tages-Score eingeflossen sind';
