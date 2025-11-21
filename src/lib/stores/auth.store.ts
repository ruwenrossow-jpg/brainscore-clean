/**
 * Auth Store
 * 
 * ARCHITEKTUR (NEU):
 * 1. Server (hooks.server.ts) → Session aus Cookie
 * 2. Server (+layout.server.ts) → gibt Session an Client
 * 3. Client (+layout.svelte) → hydrate() mit Server-Session
 * 4. Store → hält State, keine Initiative mehr
 * 
 * ÄNDERUNGEN:
 * - initialize() entfernt → hydrate(session) stattdessen
 * - Keine Timeouts mehr
 * - Einfacheres signIn (kein onboarding check)
 * - Store ist "dumb" → bekommt Daten von außen
 */

import { writable, derived } from 'svelte/store';
import type { AuthState, User, UserProfile } from '$lib/types/auth.types';
import type { Session } from '@supabase/supabase-js';
import { AuthService } from '$lib/services/auth.service';

// Initialer State
const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true
};

// Writable Store
const authStore = writable<AuthState>(initialState);

/**
 * Auth Store mit Helper-Funktionen
 */
export const auth = {
  subscribe: authStore.subscribe,

  /**
   * Store mit Server-Daten hydrieren (OPTIMIERT)
   * Profile kommt bereits vom Server (+layout.server.ts)
   * → Kein zusätzlicher DB-Call mehr!
   */
  hydrate(session: Session | null, profile: UserProfile | null = null) {
    if (session?.user) {
      authStore.set({
        user: session.user,
        profile,
        session,
        loading: false
      });
    } else {
      authStore.set({ ...initialState, loading: false });
    }
  },

  /**
   * User einloggen (OPTIMIERT)
   * - Profile wird beim nächsten Page-Load vom Server geladen
   * - Kein extra DB-Call hier nötig!
   * - Store wird mit basic user-info gesetzt, profile = null
   */
  async signIn(email: string, password: string) {
    const { data, error } = await AuthService.signIn({ email, password });
    
    if (error || !data) {
      return { error };
    }
    
    if (data.user) {
      // Setze nur Session, Profile kommt beim Redirect vom Server
      authStore.set({
        user: data.user,
        profile: null, // Wird nach Navigation geladen
        session: data.session,
        loading: false
      });
      
      return { error: null };
    }
    
    return { error: null };
  },

  /**
   * User registrieren
   */
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await AuthService.signUp({ email, password, name });
    
    if (error) return { error };
    
    // Nach Registrierung: User muss E-Mail bestätigen
    // Session ist erst nach Bestätigung verfügbar
    return { error: null, requiresEmailConfirmation: true };
  },

  /**
   * User ausloggen
   */
  async signOut() {
    await AuthService.signOut();
    authStore.set(initialState);
  },

  /**
   * Auth State Change Listener (OPTIMIERT)
   * - Bei SIGNED_IN: Page reload lädt Profile automatisch
   * - Bei SIGNED_OUT: Clear store
   * - Bei TOKEN_REFRESHED: Keep current state
   */
  setupAuthListener() {
    return AuthService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Trigger Page-Reload → Server lädt Profile
        window.location.reload();
      } else if (event === 'SIGNED_OUT') {
        authStore.set({ ...initialState, loading: false });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token refresh: Update session, keep profile
        authStore.update(state => ({
          ...state,
          session
        }));
      }
    });
  }
};

// Derived Stores (helper für häufige Checks)
export const isAuthenticated = derived(
  authStore,
  $auth => !!$auth.user
);

export const currentUser = derived(
  authStore,
  $auth => $auth.user
);

export const currentProfile = derived(
  authStore,
  $auth => $auth.profile
);

export const needsOnboarding = derived(
  authStore,
  $auth => $auth.user && $auth.profile && !$auth.profile.onboarding_completed
);
