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
  
  console.log('🐛 [Dashboard Server] Loading data for user:', userId);
  
  // Parallel laden für bessere Performance
  // WICHTIG: getUserBaseline muss vor getTodayDeviations geladen werden
  const userBaseline = await getUserBaseline(supabase, userId);
  
  const [forecast, todayDeviations] = await Promise.all([
    getForecastForNow(supabase, userId, now),
    getTodayDeviations(supabase, userId, userBaseline, now),
  ]);
  
  console.log('🐛 [Dashboard Server] UserBaseline loaded:', userBaseline.length, 'points');
  console.log('🐛 [Dashboard Server] Points with hasUserData=true:', userBaseline.filter(p => p.hasUserData).length);
  console.log('🐛 [Dashboard Server] Sample baseline point (hour 14):', userBaseline.find(p => p.hour === 14));
  console.log('🐛 [Dashboard Server] Today\'s tests:', todayDeviations.tests.length, 'Average delta:', todayDeviations.averageDelta);
  
  return {
    profile,
    forecast,
    userBaseline,
    todayDeviations,
  };
};
