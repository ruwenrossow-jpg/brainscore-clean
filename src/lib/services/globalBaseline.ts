/**
 * Global Baseline Service
 * 
 * Definiert die feste chronobiologische Kurve für kognitive Leistungsfähigkeit.
 * Diese Werte gelten UNIVERSAL für alle User (nicht personalisiert).
 * 
 * Basiert auf:
 * - Circadian Rhythm Research (Peak: 10:00-12:00, Trough: 03:00-05:00)
 * - Ultradian Cycles (Post-Lunch Dip: 14:00-15:00)
 * - Empirische Annahmen für BrainScore-Kontext
 */

import type { BaselinePoint } from '$lib/types/forecast';

/**
 * Globale Baseline-Kurve (24 Stunden)
 * 
 * Werte sind FEST und dürfen NICHT zur Laufzeit geändert werden.
 * 
 * Logik:
 * - Minimum um 03:00 Uhr (35) - Tiefpunkt in der Nacht
 * - Langsamer Anstieg ab 06:00 (40)
 * - Peak zwischen 10:00-12:00 (80) - Optimales Zeitfenster
 * - Leichter Post-Lunch-Dip um 14:00 (75)
 * - Plateau 15:00-18:00 (80)
 * - Abfall ab 20:00 (65 → 50 → 40)
 */
const GLOBAL_BASELINE_VALUES: Record<number, number> = {
  0: 38, // 00:00 - Späte Nacht
  1: 36,
  2: 35,
  3: 35, // 03:00 - Minimum
  4: 36,
  5: 38,
  6: 40, // 06:00 - Aufwachphase beginnt
  7: 50,
  8: 60,
  9: 70,
  10: 80, // 10:00 - Peak beginnt
  11: 80,
  12: 80, // 12:00 - Peak hält an
  13: 78,
  14: 75, // 14:00 - Post-Lunch-Dip
  15: 80, // 15:00 - Zweites Plateau
  16: 80,
  17: 78,
  18: 75,
  19: 70,
  20: 65, // 20:00 - Abendphase
  21: 60,
  22: 50,
  23: 42,
};

/**
 * Holt den globalen Baseline-Wert für eine bestimmte Stunde
 * 
 * @param hour - Stunde des Tages (0-23)
 * @returns Baseline-Score (0-100)
 */
export function getGlobalBaselineForHour(hour: number): number {
  // Normalisiere Stunde (falls außerhalb 0-23)
  const normalizedHour = ((hour % 24) + 24) % 24;

  const value = GLOBAL_BASELINE_VALUES[normalizedHour];

  if (value === undefined) {
    console.warn(`[GlobalBaseline] Keine Daten für Stunde ${normalizedHour}, nutze Fallback 60`);
    return 60; // Fallback auf neutralen Wert
  }

  return value;
}

/**
 * Holt die komplette globale Baseline für alle 24 Stunden
 * 
 * @returns Array von 24 BaselinePoints (nur globalValue gesetzt, userValue=null)
 */
export function getAllGlobalBaselinePoints(): BaselinePoint[] {
  const points: BaselinePoint[] = [];

  for (let hour = 0; hour < 24; hour++) {
    points.push({
      hour,
      globalValue: getGlobalBaselineForHour(hour),
      userValue: null, // Wird später durch User-Baseline-Service gesetzt
      hasUserData: false,
    });
  }

  return points;
}

/**
 * Interpoliert einen Baseline-Wert für einen beliebigen Zeitpunkt (mit Minuten)
 * 
 * Beispiel: 10:30 Uhr → Interpolation zwischen hour=10 (80) und hour=11 (80)
 * 
 * @param hour - Volle Stunde (0-23)
 * @param minute - Minute (0-59)
 * @returns Interpolierter Baseline-Score
 */
export function getGlobalBaselineForTime(hour: number, minute: number = 0): number {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const currentValue = getGlobalBaselineForHour(normalizedHour);

  // Wenn exakt auf der Stunde, kein Interpolation nötig
  if (minute === 0) {
    return currentValue;
  }

  // Nächste Stunde (mit Wrap-around)
  const nextHour = (normalizedHour + 1) % 24;
  const nextValue = getGlobalBaselineForHour(nextHour);

  // Lineare Interpolation
  const fraction = minute / 60; // 0.0 bis 0.999...
  const interpolated = currentValue + (nextValue - currentValue) * fraction;

  return Math.round(interpolated);
}

/**
 * Hilfsfunktion: Statistiken über die globale Baseline
 * 
 * @returns Statistik-Objekt mit Min, Max, Average
 */
export function getGlobalBaselineStats() {
  const values = Object.values(GLOBAL_BASELINE_VALUES);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
    peakHour: 10, // Hardcoded (bekannt aus Kurve)
    troughHour: 3, // Hardcoded (bekannt aus Kurve)
  };
}
