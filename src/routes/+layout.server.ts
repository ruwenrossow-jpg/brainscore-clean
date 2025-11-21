/**
 * Root Layout Server Load
 * 
 * ZWECK: Initiale Session an Client übergeben
 * - Läuft bei JEDER Navigation (SSR)
 * - Holt Session aus event.locals (gesetzt von hooks.server.ts)
 * - Gibt Session an Client zur Hydration
 * 
 * FLOW: Cookie → hooks.server.ts → hier → +layout.svelte → Store
 */

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Session aus hooks.server.ts holen
  const session = await locals.getSession();

  return {
    session
  };
};
