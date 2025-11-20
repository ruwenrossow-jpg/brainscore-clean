/**
 * SART-Test Types
 * Klare Typdefinitionen für den gesamten Test-Flow
 */

// Einzelner Trial (eine angezeigte Zahl)
export interface SartTrial {
  index: number;
  digit: number;
  isNoGo: boolean;
  responded: boolean;
  reactionTimeMs: number | null;
}

// Test-Konfiguration
export interface SartConfig {
  totalTrials: number;
  trialDurationMs: number;
  maskDurationMs?: number;
  noGoDigit: number;
}

// Berechnete Metriken nach Test-Ende
export interface SartMetrics {
  commissionErrors: number;    // CE: Reaktion bei NoGo (falsch)
  omissionErrors: number;       // OE: Keine Reaktion bei Go (falsch)
  goTrialsCount: number;
  noGoTrialsCount: number;
  meanReactionTimeMs: number;
  sdReactionTimeMs: number;
  score: number;                // 0-100
}

// Datenbank-Modelle
export interface SartSession {
  id: string;
  created_at: string;
  ce_count: number;
  oe_count: number;
  go_count: number;
  nogo_count: number;
  mean_rt_ms: number;
  sd_rt_ms: number;
  score: number;
}

export interface ScreentimeReport {
  id: string;
  created_at: string;
  session_id: string;
  total_minutes: number;
  activations: number;
  app1_name?: string;
  app1_activations?: number;
  app2_name?: string;
  app2_activations?: number;
  app3_name?: string;
  app3_activations?: number;
}

// State-Machine für Test-Flow
export type TestStep = 'instructions' | 'test' | 'result' | 'screentime' | 'done';
