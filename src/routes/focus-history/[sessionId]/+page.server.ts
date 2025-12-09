/**
 * Focus Check Detail Page - Server Load
 * 
 * Lädt Details eines einzelnen Tests inkl. insights_json
 */

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { requireOnboarding } from '$lib/server/auth.guard';
import { 
  getSegmentFromTimestamp, 
  getLabelFromScore,
  formatDateLabel,
  formatTimeLabel
} from '$lib/utils/focusHistory.utils';
import type { SessionInsights } from '$lib/types/focusHistory.types';

export const load: PageServerLoad = async (event) => {
  const { session } = await requireOnboarding(event);
  const userId = session.user.id;
  const supabase = event.locals.supabase;
  const sessionId = event.params.sessionId;

  // Query test session
  const { data: testSession, error: dbError } = await supabase
    .from('sart_sessions')
    .select('id, brain_score, created_at, insights_json')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();

  if (dbError || !testSession) {
    throw error(404, 'Test nicht gefunden');
  }

  const session_any = testSession as any;

  // Parse insights if available
  let insights: SessionInsights | null = null;
  if (session_any.insights_json) {
    try {
      insights = JSON.parse(session_any.insights_json) as SessionInsights;
    } catch (e) {
      console.error('Failed to parse insights_json:', e);
    }
  }

  const createdAt = new Date(session_any.created_at);

  return {
    sessionId: session_any.id,
    score: session_any.brain_score,
    dateLabel: formatDateLabel(createdAt),
    timeLabel: formatTimeLabel(createdAt),
    segment: getSegmentFromTimestamp(createdAt),
    label: getLabelFromScore(session_any.brain_score),
    insights,
  };
};
