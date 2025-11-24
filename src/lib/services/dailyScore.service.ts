/**
 * Daily Score Database Service
 * 
 * Service für CRUD-Operationen auf der daily_scores Tabelle
 * und Synchronisation mit test_sessions
 */

import { supabase } from './supabase.client';
import type { Database } from './database.types';
import type { DailyScore, TestSession } from '$features/logbook/types';
import { aggregateToDailyScores } from '$features/logbook/dailyScoreService';

type DailyScoreRow = Database['public']['Tables']['daily_scores']['Row'];
type DailyScoreInsert = Database['public']['Tables']['daily_scores']['Insert'];

/**
 * Holt alle DailyScores für einen User
 */
export async function fetchDailyScores(
  userId: string,
  limit?: number
): Promise<{ data: DailyScore[] | null; error: string | null }> {
  try {
    let query = supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching daily scores:', error);
      return { data: null, error: error.message };
    }
    
    const dailyScores = (data || []).map(rowToDailyScore);
    return { data: dailyScores, error: null };
  } catch (err) {
    console.error('Unexpected error fetching daily scores:', err);
    return { data: null, error: 'Unexpected error' };
  }
}

/**
 * Holt DailyScore für ein bestimmtes Datum
 */
export async function fetchDailyScoreByDate(
  userId: string,
  date: string
): Promise<{ data: DailyScore | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Kein Eintrag gefunden
        return { data: null, error: null };
      }
      console.error('Error fetching daily score by date:', error);
      return { data: null, error: error.message };
    }
    
    return { data: rowToDailyScore(data), error: null };
  } catch (err) {
    console.error('Unexpected error fetching daily score:', err);
    return { data: null, error: 'Unexpected error' };
  }
}

/**
 * Erstellt oder aktualisiert einen DailyScore
 */
export async function upsertDailyScore(
  userId: string,
  dailyScore: Omit<DailyScore, 'userId'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const insert: DailyScoreInsert = {
      user_id: userId,
      date: dailyScore.date,
      daily_score: dailyScore.dailyScore,
      test_count: dailyScore.testCount,
      first_test_at: dailyScore.firstTestAt || null,
      last_test_at: dailyScore.lastTestAt || null
    };
    
    const { error } = await supabase
      .from('daily_scores')
      .upsert(insert as any, {
        onConflict: 'user_id,date',
      })
    
    if (error) {
      console.error('Error upserting daily score:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error upserting daily score:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Berechnet und speichert DailyScores aus allen Test-Sessions
 * 
 * Diese Funktion sollte nach jedem neuen Test aufgerufen werden
 * oder als Batch-Job laufen
 */
export async function syncDailyScoresFromSessions(
  userId: string
): Promise<{ success: boolean; error: string | null; synced: number }> {
  try {
    // 1. Hole alle Test-Sessions des Users
    const { data: sessions, error: sessionsError } = await supabase
      .from('sart_sessions')
      .select('id, created_at, user_id, brain_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return { success: false, error: sessionsError.message, synced: 0 };
    }
    
    if (!sessions || sessions.length === 0) {
      return { success: true, error: null, synced: 0 };
    }
    
    // 2. Konvertiere zu TestSession-Format
    const testSessions: TestSession[] = sessions.map((s: any) => ({
      id: s.id,
      userId: s.user_id || userId,
      timestamp: s.created_at,
      brainScore: s.brain_score
    }));
    
    // 3. Aggregiere zu DailyScores
    const dailyScores = aggregateToDailyScores(testSessions);
    
    // 4. Upsert alle DailyScores
    const inserts: DailyScoreInsert[] = dailyScores.map(ds => ({
      user_id: userId,
      date: ds.date,
      daily_score: ds.dailyScore,
      test_count: ds.testCount,
      first_test_at: ds.firstTestAt || null,
      last_test_at: ds.lastTestAt || null
    }));
    
    const { error: upsertError } = await supabase
      .from('daily_scores')
      .upsert(inserts as any, {
        onConflict: 'user_id,date',
      })
    
    if (upsertError) {
      console.error('Error syncing daily scores:', upsertError);
      return { success: false, error: upsertError.message, synced: 0 };
    }
    
    console.log(`✅ Synced ${dailyScores.length} daily scores for user ${userId}`);
    return { success: true, error: null, synced: dailyScores.length };
  } catch (err) {
    console.error('Unexpected error syncing daily scores:', err);
    return { success: false, error: 'Unexpected error', synced: 0 };
  }
}

/**
 * Aktualisiert den DailyScore für ein bestimmtes Datum
 * basierend auf den Sessions dieses Tages
 */
export async function syncDailyScoreForDate(
  userId: string,
  date: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Hole alle Sessions für dieses Datum
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('sart_sessions')
      .select('id, created_at, user_id, brain_score')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: true });
    
    if (sessionsError) {
      console.error('Error fetching sessions for date:', sessionsError);
      return { success: false, error: sessionsError.message };
    }
    
    if (!sessions || sessions.length === 0) {
      // Keine Tests an diesem Tag - lösche ggf. vorhandenen DailyScore
      const { error: deleteError } = await supabase
        .from('daily_scores')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);
      
      if (deleteError) {
        console.error('Error deleting empty daily score:', deleteError);
        return { success: false, error: deleteError.message };
      }
      
      return { success: true, error: null };
    }
    
    // Berechne DailyScore
    const scores = sessions.map((s: any) => s.brain_score);
    const dailyScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    const sortedSessions = sessions.sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Upsert DailyScore
    const { error: upsertError } = await supabase
      .from('daily_scores')
      .upsert({
        user_id: userId,
        date,
        daily_score: dailyScore,
        test_count: sessions.length,
        first_test_at: (sortedSessions[0] as any).created_at,
        last_test_at: (sortedSessions[sortedSessions.length - 1] as any).created_at
      } as any, {
        onConflict: 'user_id,date'
      });
    
    if (upsertError) {
      console.error('Error upserting daily score for date:', upsertError);
      return { success: false, error: upsertError.message };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error syncing daily score for date:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Hilfsfunktion: Konvertiert DB-Row zu DailyScore
 */
function rowToDailyScore(row: DailyScoreRow): DailyScore {
  return {
    date: row.date,
    dailyScore: row.daily_score,
    testCount: row.test_count,
    firstTestAt: row.first_test_at || undefined,
    lastTestAt: row.last_test_at || undefined
  };
}
