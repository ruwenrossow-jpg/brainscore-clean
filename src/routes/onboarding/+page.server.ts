/**
 * Onboarding Server Load
 * 
 * SERVER-SIDE AUTH GUARD:
 * - Prüft dass User eingeloggt ist
 * - Erlaubt bewussten Zugriff auch für bereits onboarded User
 *   (z.B. "Onboarding neu starten" aus Einstellungen)
 * 
 * HINWEIS: Redirect zu /dashboard wurde entfernt - eingeloggte User
 * können Onboarding jederzeit wiederholen/neu durchlaufen.
 */

import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth.guard';

export const load: PageServerLoad = async (event) => {
  // Guard: User muss eingeloggt sein
  const session = await requireAuth(event);
  
  // Profile laden (optional, für zukünftige Features)
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return {
    profile
  };
};
