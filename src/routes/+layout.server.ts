/**
 * Root Layout Server Load (OPTIMIERT)
 * 
 * ZWECK: Session + Profile an Client übergeben
 * - Läuft bei JEDER Navigation (SSR)
 * - Lädt Profile auf Server → kein separater Client-Call nötig
 * - Cache-freundlich: Browser cached Response
 * 
 * FLOW: Cookie → hooks.server.ts → hier (mit Profile) → +layout.svelte → Store
 */

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const start = Date.now();
  const session = await locals.getSession();

  // FIX: Prüfe ob Session gültig ist (nicht nur ob Cookie existiert)
  const hasValidSession = session && session.user && session.user.id;
  
  if (hasValidSession) {
    console.log('✅ Layout: Valid session for user:', session.user.id);
  } else if (session) {
    console.warn('⚠️ Layout: Invalid session (has cookie but no user)');
  } else {
    console.log('ℹ️ Layout: No session (guest user)');
  }

  // Profile auf Server laden (nur bei gültiger Session)
  let profile = null;
  if (hasValidSession) {
    try {
      const { data, error } = await locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.warn('⚠️ Layout: Profile load failed:', error.message);
      } else if (data) {
        profile = data;
        console.log('✅ Layout: Profile loaded');
      } else {
        console.log('ℹ️ Layout: No profile found (needs onboarding)');
      }
    } catch (err) {
      console.error('❌ Layout: Profile load error:', err);
    }
  }

  const duration = Date.now() - start;
  console.log(`⚡ Layout load: ${duration}ms (session: ${hasValidSession}, profile: ${!!profile})`);

  return {
    session: hasValidSession ? session : null,
    profile
  };
};
