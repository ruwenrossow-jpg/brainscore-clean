/**
 * Dashboard Service
 * Handles data fetching for the dashboard view
 */

import { supabase } from './supabase.client';
import type { Database } from './database.types';

type SartSession = Database['public']['Tables']['sart_sessions']['Row'];

export interface DashboardStats {
  currentScore: number | null;
  averageScore7Days: number | null;
  totalTests: number;
  lastTestDate: Date | null;
}

export interface SessionHistoryItem {
  id: number;
  score: number;
  commissionErrors: number;
  omissionErrors: number;
  createdAt: Date;
}

/**
 * Get the latest SART session for the current user
 */
export async function getCurrentScore(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('sart_sessions')
    .select('brain_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching current score:', error);
    return null;
  }

  return (data as any)?.brain_score ?? null;
}

/**
 * Get session history for the user (last n sessions)
 */
export async function getSessionHistory(
  userId: string,
  limit: number = 10
): Promise<SessionHistoryItem[]> {
  const { data, error } = await supabase
    .from('sart_sessions')
    .select('id, brain_score, commission_errors, omission_errors, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching session history:', error);
    return [];
  }

  return (data || []).map((session: any) => ({
    id: session.id,
    score: session.brain_score,
    commissionErrors: session.commission_errors,
    omissionErrors: session.omission_errors,
    createdAt: new Date(session.created_at)
  }));
}

/**
 * Get average score for the last 7 days
 */
export async function getAverageScore7Days(userId: string): Promise<number | null> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('sart_sessions')
    .select('brain_score')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error) {
    console.error('Error fetching 7-day average:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const sum = data.reduce((acc, session: any) => acc + session.brain_score, 0);
  return Math.round(sum / data.length);
}

/**
 * Get total number of tests for the user
 */
export async function getTotalTests(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('sart_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total tests:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get all dashboard stats in one call
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [currentScore, averageScore7Days, totalTests, sessionHistory] = await Promise.all([
    getCurrentScore(userId),
    getAverageScore7Days(userId),
    getTotalTests(userId),
    getSessionHistory(userId, 1)
  ]);

  return {
    currentScore,
    averageScore7Days,
    totalTests,
    lastTestDate: sessionHistory.length > 0 ? sessionHistory[0].createdAt : null
  };
}
