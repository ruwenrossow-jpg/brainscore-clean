/**
 * Forecast Service
 * 
 * Berechnet eine BrainScore-Prognose für den aktuellen Moment
 * basierend auf historischen Daten und Zeitdrift.
 * 
 * WICHTIG: Ändert NICHT die BrainScore-Berechnung selbst!
 * Setzt nur auf bestehende Scores auf.
 */

import { supabase } from './supabase.client';
import { getScoreBand } from '$lib/config/scoring';

export interface ForecastResult {
  forecastScore: number;        // 0-100
  qualitativeLabel: string;     // "stabil" | "unruhig" | "müde" etc.
  lastTestAt: string | null;    // ISO-String oder null
  confidenceHint: string;       // z.B. "Basierend auf Test von vor 8h"
  basis: 'recent_test' | 'historical' | 'no_data';
  dataPoints: number;           // Anzahl verfügbarer Datenpunkte
}

// TODO: BrainScore v1.1 calibration hookpoint
// Hier kann später die 0-100-Skalierung angepasst werden:
// - Aktuell: linearer Drift zum Mittelwert (60)
// - Zukünftig: Machine Learning Modell basierend auf User-Patterns
const DRIFT_TARGET = 60;      // Mittelwert für alte Tests
const DRIFT_START_HOURS = 24; // Ab 24h beginnt Drift
const DRIFT_FULL_HOURS = 72;  // Nach 72h vollständig gedriftet

/**
 * HEURISTIK: BrainScore-Forecast für aktuellen Moment
 * 
 * Logik:
 * 1. Hole letzten gültigen BrainScore aus daily_scores
 * 2. Falls Test < 24h her:
 *    - Nutze Score direkt (100% Gewicht)
 *    - Optional: Adjustiere basierend auf Screentime (+/- 5 Punkte) [TODO]
 * 3. Falls Test 24-72h her:
 *    - "Drift" zum Mittelwert (60 Punkte): linear interpoliert
 *    - Formel: score + (60 - score) * driftFactor
 *    - driftFactor = (hoursAgo - 24) / (72 - 24)
 * 4. Falls Test > 72h oder keine Daten:
 *    - Nutze historischen 7-Tage-Durchschnitt
 *    - Falls auch nicht vorhanden: Default 60 ("neutral")
 * 
 * WICHTIG: Ändert NICHT die BrainScore-Berechnung in brainScoreV1.ts!
 */
export async function computeForecast(userId: string): Promise<ForecastResult> {
  try {
    // TypeScript: Explizite Type-Definition für Supabase-Queries
    type DailyScoreRow = {
      date: string;
      daily_score: number | null;
      test_count: number;
      last_test_at: string | null;
    };

    // 1. Hole letzten BrainScore aus daily_scores
    const { data: lastScore, error: scoreError } = await supabase
      .from('daily_scores')
      .select('date, daily_score, test_count, last_test_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: DailyScoreRow | null; error: any };

    if (scoreError && scoreError.code !== 'PGRST116') {
      console.error('Error fetching last score:', scoreError);
    }

    // 2. Hole historische Durchschnitte (letzte 7-30 Tage)
    const { data: historicalScores, error: histError } = await supabase
      .from('daily_scores')
      .select('daily_score, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30) as { data: Array<{ daily_score: number | null; date: string }> | null; error: any };

    if (histError) {
      console.error('Error fetching historical scores:', histError);
    }

    const now = new Date();
    const hasRecentTest = lastScore && lastScore.daily_score !== null;
    const lastTestDate = lastScore?.last_test_at ? new Date(lastScore.last_test_at) : null;
    const hoursAgo = lastTestDate ? (now.getTime() - lastTestDate.getTime()) / (1000 * 60 * 60) : Infinity;

    // CASE 1: Letzter Test < 24h her
    if (hasRecentTest && hoursAgo < DRIFT_START_HOURS) {
      const score = Math.round(lastScore.daily_score!); // Non-null assertion (checked above)
      return {
        forecastScore: score,
        qualitativeLabel: getQualitativeLabel(score),
        lastTestAt: lastScore.last_test_at,
        confidenceHint: `Basierend auf Test von vor ${formatHoursAgo(hoursAgo)}`,
        basis: 'recent_test',
        dataPoints: 1
      };
    }

    // CASE 2: Letzter Test 24-72h her (Drift zum Mittelwert)
    if (hasRecentTest && hoursAgo >= DRIFT_START_HOURS && hoursAgo < DRIFT_FULL_HOURS) {
      const baseScore = lastScore.daily_score!; // Non-null assertion (checked above)
      const driftFactor = (hoursAgo - DRIFT_START_HOURS) / (DRIFT_FULL_HOURS - DRIFT_START_HOURS);
      const driftedScore = baseScore + (DRIFT_TARGET - baseScore) * driftFactor;
      const score = Math.round(Math.max(0, Math.min(100, driftedScore)));

      return {
        forecastScore: score,
        qualitativeLabel: getQualitativeLabel(score),
        lastTestAt: lastScore.last_test_at,
        confidenceHint: `Schätzung basierend auf Test von vor ${formatHoursAgo(hoursAgo)}`,
        basis: 'recent_test',
        dataPoints: 1
      };
    }

    // CASE 3: Test > 72h her oder keine Daten → Historischer Durchschnitt
    if (historicalScores && historicalScores.length > 0) {
      const validScores = historicalScores
        .filter(s => s.daily_score !== null)
        .slice(0, 7); // Letzten 7 Tage

      if (validScores.length > 0) {
        const avgScore = validScores.reduce((sum, s) => sum + (s.daily_score || 0), 0) / validScores.length;
        const score = Math.round(avgScore);

        return {
          forecastScore: score,
          qualitativeLabel: getQualitativeLabel(score),
          lastTestAt: lastScore?.last_test_at || null,
          confidenceHint: `Durchschnitt der letzten ${validScores.length} Tage`,
          basis: 'historical',
          dataPoints: validScores.length
        };
      }
    }

    // CASE 4: Keine Daten vorhanden → Neutral
    return {
      forecastScore: DRIFT_TARGET,
      qualitativeLabel: 'neutral',
      lastTestAt: null,
      confidenceHint: 'Noch keine Testdaten – mach deinen ersten Test',
      basis: 'no_data',
      dataPoints: 0
    };

  } catch (err) {
    console.error('Error computing forecast:', err);
    
    // Fallback bei Fehler
    return {
      forecastScore: DRIFT_TARGET,
      qualitativeLabel: 'unbekannt',
      lastTestAt: null,
      confidenceHint: 'Daten konnten nicht geladen werden',
      basis: 'no_data',
      dataPoints: 0
    };
  }
}

/**
 * Hilfsfunktion: Qualitatives Label aus Score
 * 
 * TODO: BrainScore v1.1 calibration hookpoint
 * Diese Schwellenwerte können später angepasst werden,
 * wenn die 0-100-Skalierung kalibriert wird.
 */
function getQualitativeLabel(score: number): string {
  if (score >= 80) return 'hochfokussiert';
  if (score >= 70) return 'sehr gut';
  if (score >= 60) return 'stabil';
  if (score >= 50) return 'okay';
  if (score >= 40) return 'etwas unruhig';
  if (score >= 30) return 'müde';
  if (score >= 20) return 'sehr unruhig';
  return 'erschöpft';
}

/**
 * Formatiert Stunden in lesbaren Text
 */
function formatHoursAgo(hours: number): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} Min.`;
  }
  if (hours < 24) {
    const h = Math.round(hours);
    return `${h} Std.`;
  }
  const days = Math.round(hours / 24);
  return `${days} Tag${days > 1 ? 'en' : ''}`;
}
