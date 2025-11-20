/**
 * Supabase Client
 * Zentrale Verbindung zur Datenbank
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,  // Session im Browser speichern (localStorage)
    autoRefreshToken: true,  // Token automatisch erneuern
    detectSessionInUrl: true  // Email-Bestätigungs-Links erkennen
  }
});
