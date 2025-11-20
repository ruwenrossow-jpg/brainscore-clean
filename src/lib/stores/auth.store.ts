/**
 * Auth Store
 * Svelte Store für globalen Auth-State
 * 
 * WARUM ein Store?
 * - Auth-State muss in vielen Komponenten verfügbar sein (Navbar, Guards, etc.)
 * - Reactive: UI aktualisiert sich automatisch bei Login/Logout
 * - Single Source of Truth
 */

import { writable, derived } from 'svelte/store';
import type { AuthState, User, UserProfile } from '$lib/types/auth.types';
import { AuthService } from '$lib/services/auth.service';
import { ProfileService } from '$lib/services/profile.service';

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
   * Session initialisieren (beim App-Start)
   */
  async initialize() {
    authStore.update(state => ({ ...state, loading: true }));

    const { session } = await AuthService.getSession();
    
    if (session?.user) {
      const { profile } = await AuthService.getProfile(session.user.id);
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
   * User einloggen
   */
  async signIn(email: string, password: string) {
    const { data, error } = await AuthService.signIn({ email, password });
    
    if (error || !data) return { error };
    
    if (data.user) {
      const { profile } = await AuthService.getProfile(data.user.id);
      
      // Check ob Onboarding benötigt wird
      const needsOnboarding = await ProfileService.needsOnboarding(data.user.id);
      
      authStore.set({
        user: data.user,
        profile,
        session: data.session,
        loading: false
      });
      
      return { error: null, needsOnboarding };
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
   * Auth State Change Listener registrieren
   */
  setupAuthListener() {
    return AuthService.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const { profile } = await AuthService.getProfile(session.user.id);
        authStore.set({
          user: session.user,
          profile,
          session,
          loading: false
        });
      } else if (event === 'SIGNED_OUT') {
        authStore.set({ ...initialState, loading: false });
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
