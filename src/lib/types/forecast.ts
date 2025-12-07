/**
 * Forecast System - Type Definitions
 * 
 * Definiert alle TypeScript-Typen für das neue Dashboard Forecast Timeline Feature.
 * Basiert auf globalem Baseline-Konzept mit User-Modulation und zeitbasiertem Decay.
 */

// ============================================================================
// FORECAST RESULTS
// ============================================================================

/**
 * Hauptergebnis der Forecast-Berechnung für einen Zeitpunkt
 */
export interface ForecastResult {
  /** Prognostizierter BrainScore für JETZT (0-100, oder null wenn nicht berechenbar) */
  forecastNow: number | null;

  /** Label basierend auf forecastNow (oder null wenn kein Forecast) */
  label: ForecastLabel | null;

  /** Confidence-Level der Prognose (basiert auf Daten-Verfügbarkeit) */
  confidence: ConfidenceLevel;

  /** Aktuelles Tages-Segment (z.B. "morning", "afternoon") */
  currentSegment: DaySegment;

  /** Typischer Score für dieses Segment (aus User-Baseline, oder null) */
  typicalAtThisTime: number | null;
}

/**
 * Label für Forecast-Interpretation
 */
export type ForecastLabel = 'fokussiert' | 'stabil' | 'fragil' | 'zerstreut';

/**
 * Confidence-Level der Prognose
 * 
 * - low: 0-5 Tests gesamt (wenig Daten)
 * - medium: 6-15 Tests (solide Datenbasis)
 * - high: 16+ Tests (statistisch robust)
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Tages-Segmente (5 Blöcke)
 */
export type DaySegment = 'morning' | 'forenoon' | 'midday' | 'afternoon' | 'evening';

// ============================================================================
// BASELINE DATA
// ============================================================================

/**
 * Einzelner Baseline-Datenpunkt für eine Stunde
 */
export interface BaselinePoint {
  /** Stunde des Tages (0-23) */
  hour: number;

  /** Globaler Baseline-Wert (0-100) */
  globalValue: number;

  /** User-spezifischer Wert (modifizierte Baseline, oder null wenn keine User-Daten) */
  userValue: number | null;

  /** Hat der User Daten für diese Stunde? */
  hasUserData: boolean;
}

/**
 * Komplette Baseline für einen Tag (24 Stunden)
 */
export type DayBaseline = BaselinePoint[];

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Aggregierte Test-Daten für eine bestimmte Stunde (User-Daten)
 */
export interface HourlyTestData {
  /** Stunde des Tages (0-23) */
  hour: number;

  /** Durchschnittlicher Score für diese Stunde */
  averageScore: number;

  /** Anzahl Tests in dieser Stunde */
  testCount: number;

  /** Standardabweichung (für Confidence-Berechnung) */
  stdDeviation?: number;
}

/**
 * Letzter Test-Datensatz (für Decay-Berechnung)
 */
export interface LastTestData {
  /** BrainScore des letzten Tests (0-100) */
  score: number;

  /** Timestamp des letzten Tests */
  timestamp: Date;

  /** Stunden seit dem letzten Test */
  hoursAgo: number;
}

// ============================================================================
// SEGMENT MAPPINGS
// ============================================================================

/**
 * Segment-Definition mit Stunden-Range
 */
export interface SegmentDefinition {
  /** Segment-Typ */
  segment: DaySegment;

  /** Start-Stunde (inklusiv) */
  startHour: number;

  /** End-Stunde (exklusiv) */
  endHour: number;

  /** Beschreibung (für UI) */
  description: string;

  /** Icon-Name (Material Symbols) */
  icon: string;
}

/**
 * Mapping: Stunde → Segment
 * 
 * - Morning: 06:00 - 09:59
 * - Forenoon: 10:00 - 11:59
 * - Midday: 12:00 - 15:59
 * - Afternoon: 16:00 - 19:59
 * - Evening: 20:00 - 05:59
 */
export const SEGMENT_DEFINITIONS: SegmentDefinition[] = [
  {
    segment: 'morning',
    startHour: 6,
    endHour: 10,
    description: 'Langsam hochfahren',
    icon: 'wb_twilight',
  },
  {
    segment: 'forenoon',
    startHour: 10,
    endHour: 12,
    description: 'Optimales Zeitfenster',
    icon: 'wb_sunny',
  },
  {
    segment: 'midday',
    startHour: 12,
    endHour: 16,
    description: 'Stabiles Plateau',
    icon: 'light_mode',
  },
  {
    segment: 'afternoon',
    startHour: 16,
    endHour: 20,
    description: 'Leichter Rückgang',
    icon: 'wb_twilight',
  },
  {
    segment: 'evening',
    startHour: 20,
    endHour: 6, // Wraps to next day
    description: 'Regenerationsphase',
    icon: 'bedtime',
  },
];

/**
 * Hilfsfunktion: Ermittelt Segment für eine bestimmte Stunde
 * 
 * @param hour - Stunde des Tages (0-23)
 * @returns Das zugehörige Segment
 */
export function getSegmentForHour(hour: number): DaySegment {
  // Normalisiere Stunde (0-23)
  const normalizedHour = ((hour % 24) + 24) % 24;

  // Morning: 06:00 - 09:59
  if (normalizedHour >= 6 && normalizedHour < 10) {
    return 'morning';
  }

  // Forenoon: 10:00 - 11:59
  if (normalizedHour >= 10 && normalizedHour < 12) {
    return 'forenoon';
  }

  // Midday: 12:00 - 15:59
  if (normalizedHour >= 12 && normalizedHour < 16) {
    return 'midday';
  }

  // Afternoon: 16:00 - 19:59
  if (normalizedHour >= 16 && normalizedHour < 20) {
    return 'afternoon';
  }

  // Evening: 20:00 - 05:59 (Default/Fallback)
  return 'evening';
}

/**
 * Hilfsfunktion: Ermittelt Label basierend auf Score
 * 
 * @param score - BrainScore (0-100)
 * @returns Passende Label-Kategorie
 */
export function getLabelForScore(score: number): ForecastLabel {
  if (score >= 75) return 'fokussiert';
  if (score >= 60) return 'stabil';
  if (score >= 45) return 'fragil';
  return 'zerstreut';
}

/**
 * Hilfsfunktion: Berechnet Confidence basierend auf Test-Count
 * 
 * @param totalTests - Gesamtanzahl Tests des Users
 * @returns Confidence-Level
 */
export function getConfidenceForTestCount(totalTests: number): ConfidenceLevel {
  if (totalTests >= 16) return 'high';
  if (totalTests >= 6) return 'medium';
  return 'low';
}
