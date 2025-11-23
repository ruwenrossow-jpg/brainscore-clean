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
    console.log('🔐 [auth.store] signIn started');
    const start = performance.now();
    
    const { data, error } = await AuthService.signIn({ email, password });
    const duration = performance.now() - start;
    console.log(`🔐 [auth.store] AuthService.signIn: ${duration.toFixed(0)}ms`);
    
    if (error || !data) {
      console.error('❌ [auth.store] signIn error:', error);
      return { error };
    }
    
    if (data.user) {
      console.log('✅ [auth.store] User authenticated, updating store...');
      // Setze nur Session, Profile kommt beim Redirect vom Server
      authStore.set({
        user: data.user,
        profile: null, // Wird nach Navigation geladen
        session: data.session,
        loading: false
      });
      console.log('✅ [auth.store] Store updated');
      
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
   * Auth State Change Listener (OPTIMIERT + DEBOUNCED)
   * - Bei SIGNED_IN: SKIP (signIn() handled es bereits)
   * - Bei SIGNED_OUT: Clear store
   * - Bei TOKEN_REFRESHED: Keep current state
   * - Debouncing verhindert infinite loops
   * 
   * WICHTIG: KEIN Reload bei SIGNED_IN!
   * Login-Flow: signIn() → Store Update → goto('/dashboard') → Server lädt Profile
   */
  setupAuthListener() {
    let lastEvent = '';
    let lastEventTime = 0;
    const DEBOUNCE_MS = 1000; // Ignoriere duplizierte Events innerhalb 1 Sekunde
    
    return AuthService.onAuthStateChange((event, session) => {
      const now = Date.now();
      const eventKey = `${event}-${session?.user?.id || 'null'}`;
      
      // Debounce: Ignoriere identische Events innerhalb DEBOUNCE_MS
      if (eventKey === lastEvent && (now - lastEventTime) < DEBOUNCE_MS) {
        // Silent ignore - kein Log spam
        return;
      }
      
      lastEvent = eventKey;
      lastEventTime = now;
      console.log(`🔔 [auth.store] Auth event: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // SKIP - signIn() hat Store bereits gesetzt
        // goto() in LoginForm navigiert zum Dashboard
        console.log('ℹ️ [auth.store] SIGNED_IN event ignored (handled by signIn())');
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 [auth.store] SIGNED_OUT - clearing store');
        authStore.set({ ...initialState, loading: false });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 [auth.store] TOKEN_REFRESHED - updating session');
        // Token refresh: Update session, keep profile
        authStore.update(state => ({
          ...state,
          session
        }));
      } else if (event === 'INITIAL_SESSION') {
        // Initial session wird von hydrate() gehandelt, ignorieren
        console.log('ℹ️ [auth.store] INITIAL_SESSION event ignored (handled by hydrate())');
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
