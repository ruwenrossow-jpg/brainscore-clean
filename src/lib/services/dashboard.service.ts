/**
 * Dashboard Data Service
 * 
 * High-level Service für Dashboard-Daten:
 * - Holt und berechnet alle Metriken für das Dashboard
 * - Kombiniert DailyScores mit WeeklyStats
 */

import type { DailyScore, WeeklyStats } from '$features/logbook/types';
import { fetchDailyScores } from './dailyScore.service';
import { 
  calculateWeeklyStats, 
  getTodayScore,
  filterDailyScoresByWindow 
} from '$features/logbook/dailyScoreService';
import { STATS_WINDOWS } from '$lib/config/scoring';

export interface DashboardData {
  today: {
    score: number | null;
    testCount: number;
    lastTestAt: string | null;
  };
  weekly: WeeklyStats;
  twoWeekTrend: DailyScore[];
}

/**
 * Holt alle Dashboard-Daten für einen User
 */
export async function getDashboardData(
  userId: string
): Promise<{ data: DashboardData | null; error: string | null }> {
  try {
    // 1. Hole alle DailyScores (letzte 30 Tage reichen)
    const { data: dailyScores, error } = await fetchDailyScores(userId, 30);
    
    if (error || !dailyScores) {
      return { data: null, error: error || 'Failed to fetch daily scores' };
    }
    
    // 2. Heute
    const todayScore = getTodayScore(dailyScores);
    
    // 3. Weekly Stats
    const weeklyStats = calculateWeeklyStats(dailyScores);
    
    // 4. Two-Week Trend (für Chart)
    const twoWeekTrend = filterDailyScoresByWindow(
      dailyScores, 
      STATS_WINDOWS.twoWeeks
    );
    
    const dashboardData: DashboardData = {
      today: {
        score: todayScore?.dailyScore || null,
        testCount: todayScore?.testCount || 0,
        lastTestAt: todayScore?.lastTestAt || null
      },
      weekly: weeklyStats,
      twoWeekTrend
    };
    
    return { data: dashboardData, error: null };
  } catch (err) {
    console.error('Error getting dashboard data:', err);
    return { data: null, error: 'Unexpected error' };
  }
}

/**
 * Schnelle Version: Holt nur heute + weekly (ohne Trend)
 */
export async function getDashboardSummary(
  userId: string
): Promise<{ data: Pick<DashboardData, 'today' | 'weekly'> | null; error: string | null }> {
  try {
    const { data: dailyScores, error } = await fetchDailyScores(userId, 7);
    
    if (error || !dailyScores) {
      return { data: null, error: error || 'Failed to fetch daily scores' };
    }
    
    const todayScore = getTodayScore(dailyScores);
    const weeklyStats = calculateWeeklyStats(dailyScores);
    
    return {
      data: {
        today: {
          score: todayScore?.dailyScore || null,
          testCount: todayScore?.testCount || 0,
          lastTestAt: todayScore?.lastTestAt || null
        },
        weekly: weeklyStats
      },
      error: null
    };
  } catch (err) {
    console.error('Error getting dashboard summary:', err);
    return { data: null, error: 'Unexpected error' };
  }
}
