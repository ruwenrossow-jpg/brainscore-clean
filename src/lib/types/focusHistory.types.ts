/**
 * Types for Focus Check History
 * 
 * Individual test-level history grouped by days (not daily aggregates)
 */

import type { DaySegment } from './forecast';

/**
 * Label für BrainScore (wiederverwendet aus forecast.ts)
 */
export type BrainScoreLabel = 'fokussiert' | 'stabil' | 'fragil' | 'zerstreut';

/**
 * Einzelner Fokus-Check Eintrag (ein Test)
 */
export interface FocusCheckHistoryEntry {
  /** Session ID für Navigation zur Detailansicht */
  sessionId: string;
  
  /** Uhrzeit formatiert, z.B. "20:14" */
  timeLabel: string;
  
  /** Tagesphase (morning, forenoon, midday, afternoon, evening) */
  segment: DaySegment;
  
  /** BrainScore 0-100 */
  score: number;
  
  /** Score-Label (fokussiert, stabil, fragil, zerstreut) */
  label: BrainScoreLabel;
  
  /** Ob kognitive Baustein-Daten gespeichert sind */
  hasInsights: boolean;
}

/**
 * Fokus-Check Historie für einen Tag
 */
export interface FocusCheckHistoryDay {
  /** ISO Date String: "2024-12-08" */
  dateIso: string;
  
  /** Formatiertes Datum für UI: "Mo., 08.12." */
  dateLabel: string;
  
  /** Ist dieser Tag heute? */
  isToday: boolean;
  
  /** Liste aller Tests an diesem Tag */
  entries: FocusCheckHistoryEntry[];
}

/**
 * Kognitive Baustein-Insights für einen einzelnen Test
 */
export interface CognitiveBlockInsight {
  /** Baustein-Key */
  key: 'impulsivity' | 'vigilance' | 'stability' | 'engagement';
  
  /** Level des Bausteins */
  level: 'low' | 'medium' | 'high';
  
  /** UI-Label */
  label: string;
  
  /** Beschreibung für die Card */
  description: string;
}

/**
 * Session Insights (gespeichert als JSON in DB)
 */
export interface SessionInsights {
  /** Kognitive Bausteine */
  blocks: CognitiveBlockInsight[];
}
