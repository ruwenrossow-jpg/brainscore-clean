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

  // Profile auf Server laden (wenn eingeloggt)
  let profile = null;
  if (session?.user) {
    try {
      const { data, error } = await locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.warn('⚠️ Profile load failed:', error.message);
      } else {
        profile = data;
      }
    } catch (err) {
      console.error('❌ Profile load error:', err);
    }
  }

  const duration = Date.now() - start;
  console.log(`⚡ Layout load: ${duration}ms (session: ${!!session}, profile: ${!!profile})`);

  return {
    session,
    profile
  };
};
