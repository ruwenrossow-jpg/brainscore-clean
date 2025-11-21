/**
 * Onboarding Server Load
 * 
 * SERVER-SIDE AUTH GUARD:
 * - Prüft dass User eingeloggt ist
 * - Redirect zu /dashboard wenn bereits onboarded
 */

import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth.guard';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  // Guard: User muss eingeloggt sein
  const session = await requireAuth(event);
  
  // Profile laden
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Wenn bereits onboarded → redirect zu Dashboard
  if (profile && (profile as any).onboarding_completed) {
    throw redirect(303, '/dashboard');
  }
  
  return {
    profile
  };
};
