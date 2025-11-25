/**
 * Landing Page Server Load
 * 
 * ROUTING-LOGIK (v2.0):
 * Root (`/`) = Startscreen für Gäste, redirect zu `/dashboard` für eingeloggte Nutzer.
 * Onboarding nur über `/onboarding` erreichbar.
 * 
 * - Nicht eingeloggt → Landing Page/Startscreen zeigen
 * - Eingeloggt → Automatischer redirect zu /dashboard
 * 
 * Onboarding-Status wird NICHT mehr hier geprüft.
 * Eingeloggte User greifen auf /onboarding zu, wenn sie es explizit wählen.
 */

import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    // Nicht eingeloggt → Startscreen zeigen
    console.log('🏠 Landing: No session, showing landing page');
    return {};
  }
  
  // Eingeloggt → Direkt zum Dashboard
  console.log('➡️ Landing: User logged in, redirect to /dashboard');
  throw redirect(303, '/dashboard');
};
