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
  
  return {
    profile,
    forecast,
    userBaseline,
    todayDeviations,
  };
};
