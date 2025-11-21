/**
 * Auth Page Server Load
 * 
 * Redirect zu Dashboard wenn bereits eingeloggt
 */

import type { PageServerLoad } from './$types';
import { requireGuest } from '$lib/server/auth.guard';

export const load: PageServerLoad = async (event) => {
  // Guard: User darf nicht eingeloggt sein
  await requireGuest(event);
  
  return {};
};
