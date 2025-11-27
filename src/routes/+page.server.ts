/**
 * Landing Page Server Load
 * 
 * ROUTING-LOGIK (v2.2 - FINAL FIX):
 * Root (`/`) = Startscreen für ALLE User
 * - Nicht eingeloggt: "Jetzt starten" (→ /onboarding) / "Bereits ein Konto?" (→ /auth)
 * - Eingeloggt + kein Profile: "Jetzt starten" (→ /onboarding)
 * - Eingeloggt + onboarding incomplete: "Onboarding fortsetzen" (→ /onboarding)
 * - Eingeloggt + onboarding complete: "Test starten" (→ /test) / "Zum Dashboard" (→ /dashboard)
 * 
 * WHY? CTAs müssen zum tatsächlichen User-Status passen!
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    console.log('🏠 Landing: No session');
    return { session: null, profile: null };
  }
  
  // Lade Profile um korrekten Status zu kennen
  let profile = null;
  try {
    const { data } = await locals.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    profile = data;
    
    if (!profile) {
      console.log('🏠 Landing: User logged in, but NO PROFILE → needs onboarding');
    } else if (!profile.onboarding_completed) {
      console.log('🏠 Landing: User logged in, onboarding incomplete');
    } else {
      console.log('🏠 Landing: User logged in, onboarding complete');
    }
  } catch (err) {
    console.error('❌ Landing: Profile load error:', err);
  }
  
  return { session, profile };
};
