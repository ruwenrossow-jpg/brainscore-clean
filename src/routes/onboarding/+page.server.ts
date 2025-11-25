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
  let profile = null;
  if (session?.user) {
    const { data } = await locals.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    profile = data;
  }
  
  return {
    session,
    profile
  };
};
