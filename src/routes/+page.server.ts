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
  
  // Eingeloggt: Prüfe Onboarding-Status
  try {
    const { data: profile, error } = await locals.supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('❌ Landing: Profile query error:', error.message, error.code);
      
      // 🔧 FIX: Nur bei "Profile nicht gefunden" ins Onboarding leiten
      if (error.code === 'PGRST116') {
        // Kein Profil gefunden → neuer User → Onboarding
        console.log('➡️ Landing: No profile found (PGRST116), redirect to /onboarding');
        throw redirect(303, '/onboarding');
      }
      
      // 🔧 FIX: Bei anderen DB-Fehlern (Timeout, Connection, etc.)
      // NICHT automatisch ins Onboarding leiten!
      // Zeige Landing Page mit Auth-State → User kann manuell navigieren
      console.error('⚠️ Landing: DB error, showing landing with auth state (no auto-redirect)');
      return {}; // Landing Page wird angezeigt, $isAuthenticated = true
    }
    
    // Profile exists - check onboarding status
    if (profile && (profile as any).onboarding_completed === true) {
      // Onboarding abgeschlossen → Dashboard
      console.log('➡️ Landing: Onboarding complete, redirect to /dashboard');
      throw redirect(303, '/dashboard');
    } else {
      // Onboarding nicht abgeschlossen
      console.log('➡️ Landing: Onboarding incomplete, redirect to /onboarding');
      throw redirect(303, '/onboarding');
    }
  } catch (err) {
    // Catch redirect() throws and rethrow
    throw err;
  }
};
