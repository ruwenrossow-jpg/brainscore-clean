/**
 * Forecast Service
 * 
 * Hauptlogik für Dashboard Forecast Timeline:
 * 1. User Baseline berechnen (globale Baseline + User-Modulation)
 * 2. Forecast für JETZT berechnen (Baseline + letzter Test mit Decay)
 * 3. Confidence & Label ermitteln
 */

import { supabase } from './supabase.client';
import type { Database } from './database.types';
import {
  getGlobalBaselineForHour,
  getGlobalBaselineForTime,
  getAllGlobalBaselinePoints,
} from './globalBaseline';
import type {
  ForecastResult,
  BaselinePoint,
  HourlyTestData,
  LastTestData,
  DaySegment,
  ConfidenceLevel,
  ForecastLabel,
} from '$lib/types/forecast';
import {
  getSegmentForHour,
  getLabelForScore,
  getConfidenceForTestCount,
} from '$lib/types/forecast';

// Type Helpers
type SartSession = Database['public']['Tables']['sart_sessions']['Row'];

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * User-Modulation: Wie stark werden User-Daten gewichtet?
 * 0.3 = 30% User-Einfluss, 70% Globale Baseline
 */
const USER_MODULATION_WEIGHT = 0.3;

/**
 * Decay: Nach wie vielen Stunden ist der letzte Test-Einfluss halbiert?
 */
const DECAY_HALF_LIFE_HOURS = 4;

/**
 * Max. Gewichtung des letzten Tests (selbst bei 0 Stunden)
 */
const MAX_LAST_TEST_WEIGHT = 0.5;

/**
 * Minimum Anzahl Tests pro Stunde für User-Baseline
 * (Verhindert Overfitting bei einzelnen Tests)
 */
const MIN_TESTS_PER_HOUR = 2;

/**
 * Lookback-Periode für User-Baseline (Tage)
 */
const BASELINE_LOOKBACK_DAYS = 30;

// ============================================================================
// USER BASELINE
// ============================================================================

/**
 * Berechnet die User-Baseline (24 Stunden)
 * 
 * Algorithmus:
 * 1. Lade alle Sessions der letzten 30 Tage
 * 2. Gruppiere nach Stunde (0-23)
 * 3. Berechne Durchschnitt pro Stunde (nur wenn >= 2 Tests)
 * 4. Modulation: userValue = globalValue + (userAvg - globalValue) * 0.3
 * 
 * @param userId - Supabase User ID
 * @returns Array von 24 BaselinePoints mit userValue gesetzt
 */
export async function getUserBaseline(userId: string): Promise<BaselinePoint[]> {
  // 1. Lade alle Sessions der letzten 30 Tage
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - BASELINE_LOOKBACK_DAYS);

  const { data: sessions, error } = await supabase
    .from('sart_sessions')
    .select('brain_score, created_at')
    .eq('user_id', userId)
    .gte('created_at', lookbackDate.toISOString())
    .order('created_at', { ascending: false })
    .returns<Pick<SartSession, 'brain_score' | 'created_at'>[]>();

  if (error) {
    console.error('[ForecastService] Fehler beim Laden der Sessions:', error);
    // Fallback: Nur globale Baseline
    return getAllGlobalBaselinePoints();
  }

  if (!sessions || sessions.length === 0) {
    // Kein User-Daten vorhanden → nur globale Baseline
    return getAllGlobalBaselinePoints();
  }

  // 2. Gruppiere nach Stunde
  const hourlyData: Map<number, number[]> = new Map();

  for (const session of sessions) {
    const hour = new Date(session.created_at).getHours();
    const score = session.brain_score;
    
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, []);
    }
    hourlyData.get(hour)!.push(score);
  }

  // 3. Berechne Durchschnitt pro Stunde
  const hourlyAverages: Map<number, HourlyTestData> = new Map();

  for (const [hour, scores] of hourlyData.entries()) {
    if (scores.length >= MIN_TESTS_PER_HOUR) {
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      hourlyAverages.set(hour, {
        hour,
        averageScore: average,
        testCount: scores.length,
      });
    }
  }

  // 4. Erstelle BaselinePoints mit Modulation
  const baselinePoints: BaselinePoint[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const globalValue = getGlobalBaselineForHour(hour);
    const userData = hourlyAverages.get(hour);

    if (userData) {
      // User hat genug Daten für diese Stunde
      const userAverage = userData.averageScore;
      const modulation = (userAverage - globalValue) * USER_MODULATION_WEIGHT;
      const userValue = Math.round(globalValue + modulation);

      // Clamp auf 0-100
      const clampedUserValue = Math.max(0, Math.min(100, userValue));

      baselinePoints.push({
        hour,
        globalValue,
        userValue: clampedUserValue,
        hasUserData: true,
      });
    } else {
      // Keine User-Daten → Fallback auf globale Baseline
      baselinePoints.push({
        hour,
        globalValue,
        userValue: null,
        hasUserData: false,
      });
    }
  }

  return baselinePoints;
}

// ============================================================================
// LAST TEST DATA
// ============================================================================

/**
 * Holt den letzten Test des Users
 * 
 * @param userId - Supabase User ID
 * @returns LastTestData oder null wenn kein Test vorhanden
 */
async function getLastTest(userId: string): Promise<LastTestData | null> {
  const { data, error } = await supabase
    .from('sart_sessions')
    .select('brain_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<Pick<SartSession, 'brain_score' | 'created_at'>>();

  if (error || !data) {
    return null;
  }

  const timestamp = new Date(data.created_at);
  const now = new Date();
  const hoursAgo = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

  return {
    score: data.brain_score,
    timestamp,
    hoursAgo,
  };
}

// ============================================================================
// FORECAST CALCULATION
// ============================================================================

/**
 * Berechnet den Forecast für JETZT
 * 
 * Algorithmus:
 * 1. Lade User-Baseline für aktuelle Stunde
 * 2. Lade letzten Test
 * 3. Berechne Decay-Gewichtung: weight = clamp(1 - hoursAgo / 8, 0, 0.5)
 * 4. Kombiniere: forecast = (1 - weight) * baseline + weight * lastScore
 * 5. Ermittle Label, Confidence, Segment
 * 
 * @param userId - Supabase User ID
 * @param now - Aktueller Zeitpunkt (für Testbarkeit)
 * @returns ForecastResult
 */
export async function getForecastForNow(
  userId: string,
  now: Date = new Date()
): Promise<ForecastResult> {
  // 1. Lade User-Baseline
  const userBaseline = await getUserBaseline(userId);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSegment = getSegmentForHour(currentHour);

  // Baseline-Wert für JETZT (mit Minuten-Interpolation)
  const baselinePoint = userBaseline[currentHour];
  const baselineValue = baselinePoint.userValue ?? baselinePoint.globalValue;

  // Typischer Wert für aktuelles Segment (Durchschnitt aller Stunden im Segment)
  const typicalAtThisTime = getTypicalScoreForSegment(userBaseline, currentSegment);

  // 2. Lade letzten Test
  const lastTest = await getLastTest(userId);

  // 3. Zähle Gesamt-Tests für Confidence
  const { count: totalTests } = await supabase
    .from('sart_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const confidence = getConfidenceForTestCount(totalTests ?? 0);

  // 4. Berechne Forecast
  let forecastNow: number | null = null;
  let label: ForecastLabel | null = null;

  if (lastTest) {
    // Decay-Gewichtung: Exponential Decay basierend auf DECAY_HALF_LIFE_HOURS
    const decayFactor = Math.pow(0.5, lastTest.hoursAgo / DECAY_HALF_LIFE_HOURS);
    const weightLastTest = Math.min(decayFactor, MAX_LAST_TEST_WEIGHT);
    const weightBaseline = 1 - weightLastTest;

    // Kombiniere Baseline + Letzter Test
    const combined = weightBaseline * baselineValue + weightLastTest * lastTest.score;
    forecastNow = Math.round(combined);

    // Clamp auf 0-100
    forecastNow = Math.max(0, Math.min(100, forecastNow));

    // Label ermitteln
    label = getLabelForScore(forecastNow);
  } else {
    // Kein Test vorhanden → Forecast = Baseline
    forecastNow = Math.round(baselineValue);
    label = getLabelForScore(forecastNow);
  }

  return {
    forecastNow,
    label,
    confidence,
    currentSegment,
    typicalAtThisTime,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Berechnet den typischen Score für ein Segment (Durchschnitt aller Stunden im Segment)
 * 
 * @param baseline - User-Baseline (24 Stunden)
 * @param segment - Tages-Segment
 * @returns Durchschnittlicher Score oder null wenn keine User-Daten
 */
function getTypicalScoreForSegment(
  baseline: BaselinePoint[],
  segment: DaySegment
): number | null {
  // Segment → Stunden-Range
  const segmentHours = getHoursForSegment(segment);

  // Filtere Baseline-Points für dieses Segment
  const segmentPoints = baseline.filter((point) => segmentHours.includes(point.hour));

  // Nur User-Daten berücksichtigen
  const userValues = segmentPoints
    .filter((p) => p.userValue !== null)
    .map((p) => p.userValue!);

  if (userValues.length === 0) {
    // Fallback auf globale Baseline
    const globalValues = segmentPoints.map((p) => p.globalValue);
    if (globalValues.length === 0) return null;
    return Math.round(globalValues.reduce((sum, v) => sum + v, 0) / globalValues.length);
  }

  // Durchschnitt der User-Werte
  const average = userValues.reduce((sum, v) => sum + v, 0) / userValues.length;
  return Math.round(average);
}

/**
 * Hilfsfunktion: Gibt alle Stunden für ein Segment zurück
 * 
 * @param segment - Tages-Segment
 * @returns Array von Stunden (0-23)
 */
function getHoursForSegment(segment: DaySegment): number[] {
  switch (segment) {
    case 'morning':
      return [6, 7, 8, 9];
    case 'forenoon':
      return [10, 11];
    case 'midday':
      return [12, 13, 14, 15];
    case 'afternoon':
      return [16, 17, 18, 19];
    case 'evening':
      // 20-23, 0-5 (Wrap-around)
      return [20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
  }
}
