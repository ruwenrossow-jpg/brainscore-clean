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
import { supabase } from './supabase.client';

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
 * FIX: Fallback auf direkte Session-Aggregation wenn daily_scores leer
 */
export async function getDashboardData(
  userId: string
): Promise<{ data: DashboardData | null; error: string | null }> {
  try {
    // 1. Hole alle DailyScores (letzte 30 Tage reichen)
    let { data: dailyScores, error } = await fetchDailyScores(userId, 30);
    
    if (error) {
      return { data: null, error: error || 'Failed to fetch daily scores' };
    }

    // FIX: Fallback auf direkte Session-Aggregation wenn keine DailyScores
    if (!dailyScores || dailyScores.length === 0) {
      console.warn('⚠️ No daily_scores found, falling back to session aggregation');
      dailyScores = await aggregateFromSessions(userId);
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
 * FALLBACK: Aggregiert DailyScores direkt aus sart_sessions
 * Wird verwendet wenn daily_scores Tabelle leer ist
 */
async function aggregateFromSessions(userId: string): Promise<DailyScore[]> {
  try {
    // Hole alle Sessions der letzten 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: sessions, error } = await supabase
      .from('sart_sessions')
      .select('id, created_at, brain_score')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching sessions for aggregation:', error);
      return [];
    }
    
    if (!sessions || sessions.length === 0) {
      return [];
    }
    
    // Gruppiere Sessions nach Datum
    const sessionsByDate = new Map<string, Array<{ brain_score: number; created_at: string }>>();
    
    for (const session of sessions) {
      const date = session.created_at.split('T')[0]; // 'YYYY-MM-DD'
      
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date)!.push({
        brain_score: session.brain_score,
        created_at: session.created_at
      });
    }
    
    // Berechne DailyScore für jeden Tag
    const dailyScores: DailyScore[] = [];
    
    for (const [date, daySessions] of sessionsByDate.entries()) {
      const scores = daySessions
        .map((s) => s.brain_score)
        .filter((v) => typeof v === 'number' && !Number.isNaN(v));
      
      if (scores.length === 0) continue;
      
      const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
      const sortedSessions = [...daySessions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      dailyScores.push({
        date,
        dailyScore: Math.round(avg),
        testCount: scores.length,
        firstTestAt: sortedSessions[0].created_at,
        lastTestAt: sortedSessions[sortedSessions.length - 1].created_at
      });
    }
    
    // Sortiere nach Datum absteigend (neueste zuerst)
    return dailyScores.sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error('Error aggregating from sessions:', err);
    return [];
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
