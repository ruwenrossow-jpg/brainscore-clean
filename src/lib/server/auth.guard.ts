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
 * Wirft redirect() wenn nicht → User wird zum Startscreen (/) weitergeleitet
 * 
 * FIX: Prüft auch ob Session gültig ist (nicht nur ob Cookie existiert)
 */
export async function requireAuth(event: RequestEvent) {
  const session = await event.locals.getSession();
  
  if (!session) {
    console.log('❌ requireAuth: No session, redirect to /');
    throw redirect(303, '/');
  }
  
  // FIX: Prüfe ob Session auch wirklich gültig ist
  // Alte/abgelaufene Sessions haben ein Cookie, aber keine gültige Session
  if (!session.user || !session.user.id) {
    console.log('❌ requireAuth: Invalid session (no user), redirect to /');
    throw redirect(303, '/');
  }
  
  console.log('✅ requireAuth: Valid session for user:', session.user.id);
  return session;
}

/**
 * Prüft ob User Onboarding abgeschlossen hat
 * Leitet zu /onboarding wenn nicht abgeschlossen
 * 
 * WICHTIG:
 * - requireAuth() wird ZUERST aufgerufen → leitet zu / bei ungültiger Session
 * - Nur wenn Session gültig: Prüfe Profil
 * - Kein Profil ODER nicht abgeschlossen → /onboarding
 * 
 * OPTIMIERT:
 * - Nur ein DB-Call (Profile)
 * - maybeSingle() verhindert Fehler bei fehlendem Profil
 */
export async function requireOnboarding(event: RequestEvent) {
  // STEP 1: Prüfe ob Session gültig ist (leitet zu / wenn nicht)
  const session = await requireAuth(event);
  
  console.log('🔍 requireOnboarding: Checking profile for user:', session.user.id);
  
  // STEP 2: Lade Profil (maybeSingle = kein Fehler wenn nicht vorhanden)
  const { data: profile, error } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  
  if (error) {
    console.error('❌ requireOnboarding: Error loading profile:', error);
    console.log('➡️ requireOnboarding: Redirecting to /onboarding due to error');
    throw redirect(303, '/onboarding');
  }
  
  if (!profile) {
    console.log('⚠️ requireOnboarding: No profile found for user:', session.user.id);
    console.log('➡️ requireOnboarding: Redirecting to /onboarding (needs profile creation)');
    throw redirect(303, '/onboarding');
  }
  
  if (!(profile as any).onboarding_completed) {
    console.log('⚠️ requireOnboarding: Profile exists but onboarding not completed');
    console.log('➡️ requireOnboarding: Redirecting to /onboarding (needs completion)');
    throw redirect(303, '/onboarding');
  }
  
  console.log('✅ requireOnboarding: Profile complete, allowing access');
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
