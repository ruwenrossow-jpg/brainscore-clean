/**
 * Auth Service
 * Zentrale Business-Logic für Authentication
 * 
 * WARUM ein Service?
 * - Trennung von UI und Auth-Logik
 * - Wiederverwendbar in verschiedenen Komponenten
 * - Error Handling zentral
 */

import { supabase } from './supabase.client';
import type { LoginCredentials, RegisterCredentials, UserProfile } from '$lib/types/auth.types';

export class AuthService {
  /**
   * Registrierung: Neuer User mit E-Mail + Passwort
   * Supabase sendet automatisch Bestätigungs-E-Mail
   */
  static async signUp(credentials: RegisterCredentials) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || 'Neuer Nutzer'
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { data: null, error };
    }
  }

  /**
   * Login: Bestehender User
   */
  static async signIn(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { data: null, error };
    }
  }

  /**
   * Logout: Session beenden
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error };
    }
  }

  /**
   * Aktuelle Session abrufen
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error('❌ Get session error:', error);
      return { session: null, error };
    }
  }

  /**
   * Aktueller User
   */
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Get user error:', error);
      return { user: null, error };
    }
  }

  /**
   * User-Profil aus profiles-Tabelle laden
   */
  static async getProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return { profile: null, error };
    }
  }

  /**
   * Auth State Change Listener
   * Wird bei Login/Logout/Session-Refresh aufgerufen
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
