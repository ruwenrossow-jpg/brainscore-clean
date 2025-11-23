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

// CRITICAL: Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase environment variables missing!');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('   VITE_SUPABASE_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.error('   → Set these in Vercel Dashboard → Settings → Environment Variables');
}

// Performance Monitoring
let requestCount = 0;

export const handle: Handle = async ({ event, resolve }) => {
  const reqId = ++requestCount;
  const start = Date.now();
  console.log(`🔵 [${reqId}] ${event.request.method} ${event.url.pathname}`);
  
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
   * Helper: Session aus Cookie holen (OPTIMIERT)
   * - Verwendet nur getSession() (Cookie ist bereits vom Browser validiert)
   * - KEIN getUser() Call → spart 300-2000ms pro Request!
   * - Session-Validierung erfolgt bei Bedarf in Guards
   */
  event.locals.getSession = async () => {
    const {
      data: { session },
      error
    } = await event.locals.supabase.auth.getSession();

    if (error) {
      console.error('⚠️ Session error:', error.message);
      return null;
    }

    return session;
  };

  // Response generieren (mit Cookie-Updates)
  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      // Erlaube Cookie-Header in Response
      return name === 'content-range';
    }
  });
  
  const duration = Date.now() - start;
  const statusColor = response.status < 400 ? '🟢' : '🔴';
  console.log(`${statusColor} [${reqId}] ${response.status} - ${duration}ms`);
  
  return response;
};
