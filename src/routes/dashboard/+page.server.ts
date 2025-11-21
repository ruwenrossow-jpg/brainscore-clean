/**
 * Dashboard Server Load
 * 
 * SERVER-SIDE AUTH GUARD:
 * - Prüft Session BEVOR Seite rendert
 * - Redirect zu /auth wenn nicht eingeloggt
 * - Redirect zu /onboarding wenn nicht abgeschlossen
 */

import type { PageServerLoad } from './$types';
import { requireOnboarding } from '$lib/server/auth.guard';

export const load: PageServerLoad = async (event) => {
  // Guard: Nur eingeloggte User mit abgeschlossenem Onboarding
  const { session, profile } = await requireOnboarding(event);
  
  return {
    profile
  };
};
