/**
 * Onboarding Server Load
 * 
 * ÖFFENTLICH ZUGÄNGLICH:
 * - Nicht eingeloggte User können Onboarding starten
 * - Registrierung erfolgt in Step 4 des Wizards
 * - Eingeloggte User können Onboarding wiederholen
 * 
 * KEIN AUTH-GUARD: Onboarding ist der Einstiegspunkt für neue User!
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  // Profile laden wenn eingeloggt (optional)
  // FIX: maybeSingle() statt single() - nach fresh signup existiert Profil evtl. noch nicht
  let profile = null;
  if (session?.user) {
    const { data, error } = await locals.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.warn('⚠️ Profile load in onboarding failed:', error.message);
    }
    profile = data;
  }
  
  return {
    session,
    profile
  };
};
