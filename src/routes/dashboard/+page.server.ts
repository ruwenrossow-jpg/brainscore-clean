/**
 * Dashboard Server Load
 * 
 * SERVER-SIDE AUTH GUARD:
 * - Prüft Session BEVOR Seite rendert
 * - Redirect zu /auth wenn nicht eingeloggt
 * - Redirect zu /onboarding wenn nicht abgeschlossen
 * 
 * NEU: Lädt Forecast-Daten serverseitig
 */

import type { PageServerLoad } from './$types';
import { requireOnboarding } from '$lib/server/auth.guard';
import { computeForecast } from '$lib/services/forecast.service';

export const load: PageServerLoad = async (event) => {
  // Guard: Nur eingeloggte User mit abgeschlossenem Onboarding
  const { session, profile } = await requireOnboarding(event);
  
  // NEU: Lade Forecast-Daten (Hook-Dashboard Feature)
  const forecast = await computeForecast(session.user.id);
  
  return {
    profile,
    forecast // NEU: Forecast für Hero-Card
  };
};
