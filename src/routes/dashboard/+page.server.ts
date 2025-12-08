/**
 * Dashboard Server Load
 * 
 * SERVER-SIDE AUTH GUARD:
 * - Prüft Session BEVOR Seite rendert
 * - Redirect zu /auth wenn nicht eingeloggt
 * - Redirect zu /onboarding wenn nicht abgeschlossen
 * 
 * FORECAST TIMELINE:
 * - Lädt Forecast für JETZT (getForecastForNow)
 * - Lädt User-Baseline (24 Stunden)
 * - Wird parallel zu Profile geladen für schnelles Rendering
 */

import type { PageServerLoad } from './$types';
import { requireOnboarding } from '$lib/server/auth.guard';
import { getForecastForNow, getUserBaseline, getTodayDeviations } from '$lib/services/forecastService';
import { getTypicalScoreForSegment, getHoursForSegment, SEGMENT_DEFINITIONS, type DaySegment } from '$lib/types/forecast';

export const load: PageServerLoad = async (event) => {
  // Guard: Nur eingeloggte User mit abgeschlossenem Onboarding
  const { session, profile } = await requireOnboarding(event);
  
  const userId = session.user.id;
  const now = new Date();
  const supabase = event.locals.supabase;
  
  // Parallel laden für bessere Performance
  // WICHTIG: getUserBaseline muss vor getTodayDeviations geladen werden
  const userBaseline = await getUserBaseline(supabase, userId);
  
  const [forecast, todayDeviations] = await Promise.all([
    getForecastForNow(supabase, userId, now),
    getTodayDeviations(supabase, userId, userBaseline, now),
  ]);
  
  // Berechne typischen Score für aktuelles Segment
  const typicalForSegment = getTypicalScoreForSegment(userBaseline, forecast.currentSegment);
  
  // Berechne Delta vs. segment-spezifische Baseline
  const delta = forecast.forecastNow !== null 
    ? forecast.forecastNow - typicalForSegment 
    : null;
  
  // Zähle heutige Tests
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  const { count: todayTestCount } = await supabase
    .from('sart_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfToday.toISOString())
    .lte('created_at', endOfToday.toISOString());
  
  // Berechne Segment-Zusammenfassungen (für Timeline-Kacheln)
  const segmentSummaries = SEGMENT_DEFINITIONS.map((segmentDef) => {
    const segment = segmentDef.segment;
    const hours = getHoursForSegment(segment);
    
    // Typischer Score für dieses Segment
    const typicalSegmentScore = getTypicalScoreForSegment(userBaseline, segment);
    
    // Heutige Tests in diesem Segment
    const testsInSegment = (todayDeviations?.tests ?? []).filter((test) =>
      hours.includes(test.hour)
    );
    
    // Durchschnitt der heutigen Tests in diesem Segment
    const todayAverageScore = testsInSegment.length > 0
      ? Math.round(testsInSegment.reduce((sum, t) => sum + t.score, 0) / testsInSegment.length)
      : null;
    
    // Delta vs. typische Linie
    const segmentDelta = todayAverageScore !== null
      ? todayAverageScore - typicalSegmentScore
      : null;
    
    return {
      segment,
      todayTestCount: testsInSegment.length,
      todayAverageScore,
      typicalSegmentScore,
      delta: segmentDelta,
    };
  });
  
  return {
    profile,
    forecast,
    userBaseline,
    todayDeviations,
    typicalForSegment,
    delta,
    todayTestCount: todayTestCount ?? 0,
    segmentSummaries,
  };
};
