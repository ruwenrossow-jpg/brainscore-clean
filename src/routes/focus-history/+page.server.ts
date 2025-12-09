/**
 * Focus Check History Server Load
 * 
 * Lädt die letzten 14 Tage an einzelnen Tests (nicht aggregiert)
 * für die neue Fokus-Check-Historie Ansicht
 */

import type { PageServerLoad } from './$types';
import { requireOnboarding } from '$lib/server/auth.guard';
import type { FocusCheckHistoryDay, FocusCheckHistoryEntry } from '$lib/types/focusHistory.types';
import {
  formatDateLabel,
  formatTimeLabel,
  isToday,
  getSegmentFromTimestamp,
  getLabelFromScore,
} from '$lib/utils/focusHistory.utils';

const LOOKBACK_DAYS = 14;

export const load: PageServerLoad = async (event) => {
  // Auth Guard
  const { session } = await requireOnboarding(event);
  const userId = session.user.id;
  const supabase = event.locals.supabase;

  // Lookback-Fenster (14 Tage)
  const now = new Date();
  const lookbackDate = new Date(now);
  lookbackDate.setDate(lookbackDate.getDate() - LOOKBACK_DAYS);
  lookbackDate.setHours(0, 0, 0, 0);

  // Query: Alle Sessions der letzten 14 Tage
  const { data: sessions, error } = await supabase
    .from('sart_sessions')
    .select('id, brain_score, created_at, insights_json')
    .eq('user_id', userId)
    .gte('created_at', lookbackDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Focus History] Error loading sessions:', error);
    return { historyDays: [] };
  }

  if (!sessions || sessions.length === 0) {
    return { historyDays: [] };
  }

  // Gruppierung nach Tagen
  const daysMap = new Map<string, FocusCheckHistoryDay>();

  for (const session of sessions as any[]) {
    const dt = new Date(session.created_at);
    
    // ISO Date String für Gruppierung (YYYY-MM-DD)
    const dateIso = dt.toISOString().split('T')[0];
    
    // Segment bestimmen
    const segment = getSegmentFromTimestamp(dt);
    
    // Label bestimmen
    const label = getLabelFromScore(session.brain_score);
    
    // Prüfen ob Insights vorhanden
    const hasInsights = session.insights_json !== null && session.insights_json !== undefined;

    // Entry erstellen
    const entry: FocusCheckHistoryEntry = {
      sessionId: session.id,
      timeLabel: formatTimeLabel(dt),
      segment,
      score: session.brain_score,
      label,
      hasInsights,
    };

    // Tag in Map anlegen oder erweitern
    if (!daysMap.has(dateIso)) {
      daysMap.set(dateIso, {
        dateIso,
        dateLabel: formatDateLabel(dt),
        isToday: isToday(dt),
        entries: [],
      });
    }

    daysMap.get(dateIso)!.entries.push(entry);
  }

  // Aus Map eine sortierte Liste machen (neueste Tage oben)
  const historyDays = Array.from(daysMap.values()).sort((a, b) =>
    a.dateIso < b.dateIso ? 1 : -1
  );

  return {
    historyDays,
  };
};
