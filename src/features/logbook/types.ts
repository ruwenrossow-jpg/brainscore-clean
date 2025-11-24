/**
 * Logbook Types
 * 
 * Type definitions for day-based scoring and logbook features
 */

/**
 * Aggregierter Score für einen einzelnen Tag
 */
export interface DailyScore {
  date: string;           // ISO-Date ohne Zeit, z.B. "2025-11-23"
  dailyScore: number;     // 0-100, aggregierter BrainScore pro Tag
  testCount: number;      // Anzahl Tests an diesem Tag
  firstTestAt?: string;   // ISO-Timestamp des ersten Tests
  lastTestAt?: string;    // ISO-Timestamp des letzten Tests
}

/**
 * Wochenstatistik basierend auf DailyScores
 */
export interface WeeklyStats {
  sevenDayAvgDailyScore: number | null;  // Durchschnitt der letzten 7 Tage
  bestDailyScore: number | null;          // Bester Tages-Score (letzte 7 Tage)
  worstDailyScore: number | null;         // Schlechtester Tages-Score (letzte 7 Tage)
  activeDays: number;                     // Anzahl Tage mit mind. 1 Test
}

/**
 * Einzelner Test-Datensatz (vereinfacht für Aggregation)
 */
export interface TestSession {
  id: string;
  userId: string;
  timestamp: string;      // ISO-Timestamp
  brainScore: number;     // 0-100
  context?: string;       // Optional: "vor dem Lernen", etc.
}

/**
 * Tagesdetail mit allen Tests
 */
export interface DayDetail {
  date: string;
  dailyScore: number;
  testCount: number;
  tests: Array<{
    timestamp: string;
    brainScore: number;
    context?: string;
  }>;
}
