/**
 * Auth Guard Utility für Server Load Functions
 * 
 * ZWECK: Schützt Routen vor unauthentifizierten Zugriffen
 * - Prüft Session auf Server-Seite (vor Render)
 * - Kein FOUC (Flash of Unauthenticated Content)
 * - Redirects BEVOR die Seite gerendert wird
 */

import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Prüft ob User eingeloggt ist
 * Wirft redirect() wenn nicht → User wird zu /auth weitergeleitet
 */
export async function requireAuth(event: RequestEvent) {
  const session = await event.locals.getSession();
  
  if (!session) {
    throw redirect(303, '/auth');
  }
  
  return session;
}

/**
 * Prüft ob User Onboarding abgeschlossen hat
 * Leitet zu /onboarding wenn nicht abgeschlossen
 */
export async function requireOnboarding(event: RequestEvent) {
  const session = await requireAuth(event);
  
  // Profile aus DB laden
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!profile || !(profile as any).onboarding_completed) {
    throw redirect(303, '/onboarding');
  }
  
  return { session, profile };
}

/**
 * Prüft ob User NICHT eingeloggt ist (für Auth-Seiten)
 * Leitet zu /dashboard wenn bereits eingeloggt
 * OPTIMIERT: Session ist bereits in event.locals gecached
 */
export async function requireGuest(event: RequestEvent) {
  const session = await event.locals.getSession();
  
  if (session) {
    throw redirect(303, '/dashboard');
  }
  
  // Gibt nichts zurück wenn OK (kein unnötiges Objekt)
}
