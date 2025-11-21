/**
 * SvelteKit Server Hooks
 * 
 * ZWECK: Session-Management auf Server-Ebene
 * - Extrahiert Supabase Session aus Cookie
 * - Stellt Session in event.locals bereit
 * - Läuft bei JEDEM Server-Request (SSR, API, Load Functions)
 * 
 * WICHTIG: Läuft nur auf Server, nicht im Browser!
 */

import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

export const handle: Handle = async ({ event, resolve }) => {
  /**
   * Erstelle Supabase Client mit SSR Cookie-Handling
   * - Liest Session aus Request-Cookie
   * - Schreibt Session-Updates in Response-Cookie
   */
  event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: '/' });
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: '/' });
      }
    }
  });

  /**
   * Helper: Sichere Methode um Session zu holen
   * - Versucht getUser() (validiert Token serverseitig)
   * - Fallback zu getSession() wenn getUser() fehlschlägt
   */
  event.locals.getSession = async () => {
    const {
      data: { user },
      error: userError
    } = await event.locals.supabase.auth.getUser();

    if (userError || !user) {
      // Kein valider User, lösche Session
      return null;
    }

    // User ist valide, hole Session
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    return session;
  };

  // Response generieren (mit Cookie-Updates)
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      // Erlaube Cookie-Header in Response
      return name === 'content-range';
    }
  });
};
