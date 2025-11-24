/**
 * Daily Score Service
 * 
 * Service-Layer für Aggregation von Test-Ergebnissen zu Tages-Scores
 * und Berechnung von Weekly Stats
 */

import type { DailyScore, WeeklyStats, TestSession, DayDetail } from './types';
import { STATS_WINDOWS, AGGREGATION_METHOD } from '$lib/config/scoring';

/**
 * Aggregiert Test-Sessions zu DailyScores
 * 
 * @param sessions - Liste aller Test-Sessions
 * @returns Array von DailyScore-Objekten, sortiert nach Datum (neueste zuerst)
 */
export function aggregateToDailyScores(sessions: TestSession[]): DailyScore[] {
  // Gruppiere Sessions nach Datum
  const sessionsByDate = new Map<string, TestSession[]>();
  
  for (const session of sessions) {
    const date = session.timestamp.split('T')[0]; // "2025-11-23"
    
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  }
  
  // Berechne DailyScore für jeden Tag
  const dailyScores: DailyScore[] = [];
  
  for (const [date, daySessions] of sessionsByDate.entries()) {
    const scores = daySessions.map(s => s.brainScore);
    // Currently always using mean aggregation
    const dailyScore = calculateMean(scores);
    
    // Sortiere Sessions nach Timestamp
    const sortedSessions = [...daySessions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    dailyScores.push({
      date,
      dailyScore: Math.round(dailyScore), // Runde auf ganze Zahl
      testCount: daySessions.length,
      firstTestAt: sortedSessions[0].timestamp,
      lastTestAt: sortedSessions[sortedSessions.length - 1].timestamp
    });
  }
  
  // Sortiere nach Datum absteigend (neueste zuerst)
  return dailyScores.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Berechnet Weekly Stats aus DailyScores
 * 
 * @param dailyScores - Array von DailyScore-Objekten
 * @param referenceDate - Referenzdatum (default: heute)
 * @returns WeeklyStats-Objekt
 */
export function calculateWeeklyStats(
  dailyScores: DailyScore[],
  referenceDate: Date = new Date()
): WeeklyStats {
  // Filtere auf letzte 7 Tage
  const sevenDaysAgo = new Date(referenceDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - STATS_WINDOWS.week);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  const recentScores = dailyScores.filter(ds => ds.date >= sevenDaysAgoStr);
  
  if (recentScores.length === 0) {
    return {
      sevenDayAvgDailyScore: null,
      bestDailyScore: null,
      worstDailyScore: null,
      activeDays: 0
    };
  }
  
  const scores = recentScores.map(ds => ds.dailyScore);
  
  return {
    sevenDayAvgDailyScore: Math.round(calculateMean(scores)),
    bestDailyScore: Math.max(...scores),
    worstDailyScore: Math.min(...scores),
    activeDays: recentScores.length
  };
}

/**
 * Holt den heutigen DailyScore
 */
export function getTodayScore(dailyScores: DailyScore[]): DailyScore | null {
  const today = new Date().toISOString().split('T')[0];
  return dailyScores.find(ds => ds.date === today) || null;
}

/**
 * Erstellt DayDetail-Objekt für eine spezifische Tagesansicht
 */
export function getDayDetail(
  date: string,
  sessions: TestSession[]
): DayDetail | null {
  const daySessions = sessions.filter(s => s.timestamp.startsWith(date));
  
  if (daySessions.length === 0) {
    return null;
  }
  
  const scores = daySessions.map(s => s.brainScore);
  const dailyScore = Math.round(calculateMean(scores));
  
  const tests = daySessions
    .map(s => ({
      timestamp: s.timestamp,
      brainScore: s.brainScore,
      context: s.context
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  return {
    date,
    dailyScore,
    testCount: daySessions.length,
    tests
  };
}

/**
 * Hilfsfunktion: Durchschnitt berechnen
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Hilfsfunktion: Median berechnen
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Filtert DailyScores für ein bestimmtes Zeitfenster
 */
export function filterDailyScoresByWindow(
  dailyScores: DailyScore[],
  days: number,
  referenceDate: Date = new Date()
): DailyScore[] {
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  return dailyScores.filter(ds => ds.date >= cutoffStr);
}
