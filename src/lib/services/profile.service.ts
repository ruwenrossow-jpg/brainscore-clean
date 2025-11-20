/**
 * Profile Service
 * Business-Logic für User-Profile & Onboarding
 * 
 * WARUM ein Service?
 * - Profile-Logik zentral und wiederverwendbar
 * - Trennung von UI und Datenbankzugriffen
 * - Konsistent mit SartService & AuthService Pattern
 */

import { supabase } from './supabase.client';
import type { UserProfile } from '$lib/types/auth.types';

export class ProfileService {
  /**
   * Prüft ob User ein Profil hat
   * @returns true wenn Profil existiert, false wenn nicht
   */
  static async hasProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = "not found" ist OK (bedeutet kein Profil)
        if (error.code === 'PGRST116') return false;
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error checking profile:', error);
      return false;
    }
  }

  /**
   * Lädt User-Profil aus DB
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
      console.error('❌ Error getting profile:', error);
      return { profile: null, error };
    }
  }

  /**
   * Erstellt oder aktualisiert User-Profil
   * Wird beim Onboarding verwendet
   */
  static async upsertProfile(
    userId: string,
    name: string,
    goal?: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name,
          goal: goal || null,
          onboarding_completed: true,
          data_consent: true  // User hat Onboarding abgeschlossen = implizites Consent
        } as any, {
          onConflict: 'id'  // Falls Profil schon existiert: Update
        });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Error upserting profile:', error);
      return { success: false, error };
    }
  }

  /**
   * Prüft ob Onboarding abgeschlossen ist
   */
  static async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) {
        // Kein Profil = Onboarding nötig
        if (error.code === 'PGRST116') return true;
        throw error;
      }

      // Profil existiert, aber Onboarding nicht abgeschlossen
      return !(data as any).onboarding_completed;
    } catch (error) {
      console.error('❌ Error checking onboarding:', error);
      return true;  // Im Fehlerfall: Onboarding zeigen (sicherer)
    }
  }
}
