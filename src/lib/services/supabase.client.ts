/**
 * Supabase Browser Client
 * 
 * WICHTIG: Nur für BROWSER-seitige Auth-Operations!
 * - Login/Logout passiert im Browser
 * - Session wird in Cookies gespeichert
 * - Server liest Session aus Cookies (via hooks.server.ts)
 * 
 * @supabase/ssr managed Cookie-Synchronisation automatisch
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing. Check your .env file.');
}

/**
 * Browser-Client mit Cookie-basierter Session
 * createBrowserClient handled Cookie read/write automatisch über document.cookie
 */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
