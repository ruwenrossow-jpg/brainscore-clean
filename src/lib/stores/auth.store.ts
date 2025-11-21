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
    try {
      console.log('🔐 Starting signIn...');
      const { data, error } = await AuthService.signIn({ email, password });
      
      if (error || !data) {
        console.error('❌ SignIn error:', error);
        return { error };
      }
      
      if (data.user) {
        console.log('✅ User signed in:', data.user.email);
        
        // Profile laden (mit Timeout)
        const profilePromise = AuthService.getProfile(data.user.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile timeout')), 5000)
        );
        
        let profile = null;
        try {
          const result = await Promise.race([profilePromise, timeoutPromise]) as any;
          profile = result.profile;
          console.log('📋 Profile loaded:', profile ? 'Yes' : 'No');
        } catch (e) {
          console.warn('⚠️ Profile load failed:', e);
        }
        
        // Onboarding-Check (mit Timeout)
        let needsOnboarding = false;
        try {
          const onboardingPromise = ProfileService.needsOnboarding(data.user.id);
          const onboardingTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Onboarding check timeout')), 5000)
          );
          needsOnboarding = await Promise.race([onboardingPromise, onboardingTimeout]) as boolean;
          console.log('🎯 Needs onboarding:', needsOnboarding);
        } catch (e) {
          console.warn('⚠️ Onboarding check failed, assuming false:', e);
          needsOnboarding = !profile || !profile.onboarding_completed;
        }
        
        authStore.set({
          user: data.user,
          profile,
          session: data.session,
          loading: false
        });
        
        console.log('✅ Auth store updated');
        return { error: null, needsOnboarding };
      }
      
      return { error: null, needsOnboarding: false };
    } catch (e: any) {
      console.error('💥 SignIn exception:', e);
      return { error: e };
    }
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
