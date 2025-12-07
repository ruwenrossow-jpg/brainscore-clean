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
import { getForecastForNow, getUserBaseline } from '$lib/services/forecastService';

export const load: PageServerLoad = async (event) => {
  // Guard: Nur eingeloggte User mit abgeschlossenem Onboarding
  const { session, profile } = await requireOnboarding(event);
  
  const userId = session.user.id;
  const now = new Date();
  
  // Parallel laden für bessere Performance
  const [forecast, userBaseline] = await Promise.all([
    getForecastForNow(userId, now),
    getUserBaseline(userId),
  ]);
  
  return {
    profile,
    forecast,
    userBaseline,
  };
};
