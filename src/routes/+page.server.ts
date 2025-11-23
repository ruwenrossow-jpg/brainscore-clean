/**
 * Landing Page Server Load
 * 
 * INTELLIGENTER STARTSCREEN:
 * - Nicht eingeloggt → Landing Page zeigen
 * - Eingeloggt + Onboarding complete → Dashboard
 * - Eingeloggt + Onboarding incomplete → Onboarding
 */

import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    // Nicht eingeloggt → Landing Page
    console.log('🏠 Landing: No session, showing landing page');
    return {};
  }
  
  console.log('🔍 Landing: Session found, checking profile...');
  
  // Eingeloggt: Prüfe Onboarding-Status (mit Timeout)
  try {
    const { data: profile, error } = await locals.supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('❌ Landing: Profile query error:', error.message);
      // Bei DB-Fehler: User trotzdem durchlassen (graceful degradation)
      if (error.code === 'PGRST116') {
        // Kein Profil gefunden
        console.log('➡️ Landing: No profile, redirect to /onboarding');
        throw redirect(303, '/onboarding');
      }
      // Anderer Fehler (Timeout, etc.) → Dashboard mit Warning
      console.error('⚠️ Landing: DB error, allowing access to dashboard');
      throw redirect(303, '/dashboard');
    }
    
    if (!profile) {
      // Kein Profil → Onboarding zeigen
      console.log('➡️ Landing: No profile, redirect to /onboarding');
      throw redirect(303, '/onboarding');
    }
    
    if (!(profile as any).onboarding_completed) {
      // Profil existiert aber Onboarding nicht abgeschlossen
      console.log('➡️ Landing: Onboarding incomplete, redirect to /onboarding');
      throw redirect(303, '/onboarding');
    }
    
    // Alles OK → Dashboard
    console.log('➡️ Landing: Onboarding complete, redirect to /dashboard');
    throw redirect(303, '/dashboard');
  } catch (err) {
    // Catch redirect() throws
    throw err;
  }
};
