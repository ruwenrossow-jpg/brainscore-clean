/**
 * Auth Types
 * Typdefinitionen für Authentication & User-Profile
 */

import type { User, Session } from '@supabase/supabase-js';

// Re-export Supabase Types für Konsistenz
export type { User, Session };

// User Profile (aus profiles Tabelle)
export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  goal?: string;
  data_consent: boolean;
  onboarding_completed: boolean;
  avatar_url?: string;
  timezone?: string;
}

// Auth State (kombiniert User + Profile)
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

// Auth Form Data
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}
