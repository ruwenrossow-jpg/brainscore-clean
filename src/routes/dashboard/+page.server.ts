/**
 * Dashboard - Server Load
 * Auth Guard: Prüft ob User eingeloggt ist
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // TODO: Session aus locals holen (benötigt hooks.server.ts)
  // Für jetzt: Client-side Guard in +page.svelte
  
  return {};
};
