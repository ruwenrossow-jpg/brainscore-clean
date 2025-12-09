/**
 * Focus History Utils
 * 
 * Wiederverwendbare Hilfsfunktionen für Fokus-Check-Historie
 * Nutzt bestehende Logik aus forecast.ts und scoring.ts
 */

import { getSegmentForHour, getLabelForScore, type DaySegment } from '$lib/types/forecast';
import type { BrainScoreLabel } from '$lib/types/focusHistory.types';

/**
 * Segment Labels für UI (Deutsch)
 */
export const SEGMENT_LABELS: Record<DaySegment, string> = {
  morning: 'Morgens',
  forenoon: 'Vormittags',
  midday: 'Mittags',
  afternoon: 'Nachmittags',
  evening: 'Abends',
};

/**
 * Label zu User-Text Mapping
 */
export const LABEL_TEXT: Record<BrainScoreLabel, string> = {
  fokussiert: 'Fokussiert',
  stabil: 'Stabil',
  fragil: 'Fragil',
  zerstreut: 'Zerstreut',
};

/**
 * Label zu Tailwind-Farbe Mapping
 */
export const LABEL_COLORS: Record<BrainScoreLabel, string> = {
  fokussiert: 'success',
  stabil: 'info',
  fragil: 'warning',
  zerstreut: 'error',
};

/**
 * Formatiert Datum für UI
 * @param date Date Objekt
 * @returns z.B. "Mo., 08.12."
 */
export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Formatiert Uhrzeit für UI
 * @param date Date Objekt
 * @returns z.B. "20:14"
 */
export function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Prüft ob ein Datum heute ist (lokale Zeitzone)
 * @param date Date Objekt
 * @returns true wenn heute
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Bestimmt Segment aus Timestamp
 * (Wrapper für getSegmentForHour aus forecast.ts)
 * @param timestamp ISO String oder Date
 * @returns DaySegment
 */
export function getSegmentFromTimestamp(timestamp: string | Date): DaySegment {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return getSegmentForHour(date.getHours());
}

/**
 * Bestimmt BrainScore Label aus Score
 * (Wrapper für getLabelForScore aus forecast.ts)
 * @param score BrainScore 0-100
 * @returns BrainScoreLabel
 */
export function getLabelFromScore(score: number): BrainScoreLabel {
  // getLabelForScore gibt ForecastLabel zurück, welches identisch zu BrainScoreLabel ist
  return getLabelForScore(score) as BrainScoreLabel;
}
