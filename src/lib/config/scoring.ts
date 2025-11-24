/**
 * Scoring Configuration
 * 
 * Zentrale Konfiguration für BrainScore-Bewertung und UI-Darstellung
 */

/**
 * Score-Bänder für qualitative Bewertung (0-100)
 */
export const SCORE_BANDS = {
  low: { min: 0, max: 40, label: 'Niedrig', color: 'error' },
  okay: { min: 40, max: 70, label: 'Okay', color: 'warning' },
  good: { min: 70, max: 100, label: 'Sehr gut', color: 'success' }
} as const;

/**
 * Zeitfenster für Statistiken
 */
export const STATS_WINDOWS = {
  today: 0,           // Aktueller Tag
  week: 7,            // Letzte 7 Tage
  twoWeeks: 14,       // Letzte 14 Tage (für Charts)
  month: 30           // Letzte 30 Tage
} as const;

/**
 * Aggregationsmethoden für DailyScore
 */
export const AGGREGATION_METHOD = {
  current: 'mean',    // 'mean' oder 'median'
  fallback: 'mean'
} as const;

/**
 * UI-Schwellenwerte
 */
export const UI_THRESHOLDS = {
  minTestsForReliableScore: 1,        // Min. Tests für validen Tages-Score
  minDaysForWeeklyTrend: 3,            // Min. Tage für aussagekräftigen Wochentrend
  recentTestThresholdMinutes: 60       // "Vor X Min" vs "Vor X Std" Anzeige
} as const;

/**
 * Insights-Schwellenwerte
 */
export const INSIGHTS_CONFIG = {
  minTestsForInsights: 5,              // Min. Gesamttests für kognitive Insights
  minTestsPerDayForInsights: 2         // Min. Tests pro Tag für Tages-Insights
} as const;

/**
 * Hilfsfunktion: Score-Band ermitteln
 */
export function getScoreBand(score: number | null | undefined) {
  if (score === null || score === undefined || isNaN(score)) {
    return { label: 'Keine Daten', color: 'neutral' };
  }
  
  if (score < SCORE_BANDS.okay.min) return SCORE_BANDS.low;
  if (score < SCORE_BANDS.good.min) return SCORE_BANDS.okay;
  return SCORE_BANDS.good;
}

/**
 * Hilfsfunktion: Relativer Zeitstring
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'gerade eben';
  if (diffMinutes < 60) return `vor ${diffMinutes} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return 'gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
