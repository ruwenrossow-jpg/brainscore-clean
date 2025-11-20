/**
 * Database Types
 * Auto-generiert aus Supabase Schema (oder manuell definiert)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          goal: string | null;
          data_consent: boolean;
          onboarding_completed: boolean;
          avatar_url: string | null;
          timezone: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          goal?: string | null;
          data_consent?: boolean;
          onboarding_completed?: boolean;
          avatar_url?: string | null;
          timezone?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          goal?: string | null;
          data_consent?: boolean;
          onboarding_completed?: boolean;
          avatar_url?: string | null;
          timezone?: string | null;
        };
      };
      sart_sessions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          commission_errors: number;
          omission_errors: number;
          go_count: number;
          nogo_count: number;
          mean_rt_ms: number;
          sd_rt_ms: number;
          brain_score: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          commission_errors: number;
          omission_errors: number;
          go_count: number;
          nogo_count: number;
          mean_rt_ms: number;
          sd_rt_ms: number;
          brain_score: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          commission_errors?: number;
          omission_errors?: number;
          go_count?: number;
          nogo_count?: number;
          mean_rt_ms?: number;
          sd_rt_ms?: number;
          brain_score?: number;
        };
      };
      screentime_reports: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          user_id: string | null;
          total_minutes: number;
          activations: number;
          app1_name: string | null;
          app1_activations: number | null;
          app2_name: string | null;
          app2_activations: number | null;
          app3_name: string | null;
          app3_activations: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          user_id?: string | null;
          total_minutes: number;
          activations: number;
          app1_name?: string | null;
          app1_activations?: number | null;
          app2_name?: string | null;
          app2_activations?: number | null;
          app3_name?: string | null;
          app3_activations?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string;
          user_id?: string | null;
          total_minutes?: number;
          activations?: number;
          app1_name?: string | null;
          app1_activations?: number | null;
          app2_name?: string | null;
          app2_activations?: number | null;
          app3_name?: string | null;
          app3_activations?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
