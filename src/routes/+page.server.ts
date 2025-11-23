/**
 * Landing Page Server Load
 * 
 * Redirect eingeloggte User zu Dashboard
 * Nicht-eingeloggte User sehen Landing Page
 */

import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  // Wenn eingeloggt → redirect zu Dashboard
  // Dashboard prüft dann ob Onboarding nötig ist
  if (session) {
    throw redirect(303, '/dashboard');
  }
  
  return {};
};
