/**
 * Forecast Service
 * 
 * Hauptlogik für Dashboard Forecast Timeline:
 * 1. User Baseline berechnen (globale Baseline + User-Modulation)
 * 2. Forecast für JETZT berechnen (Baseline + letzter Test mit Decay)
 * 3. Confidence & Label ermitteln
 */

import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
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
  ForecastEvidence,
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
 * Lookback-Periode für User-Baseline (Tage)
 */
const BASELINE_LOOKBACK_DAYS = 30;

/**
 * Schwellwert für stabile Baseline (Anzahl Tests)
 * 
 * - Unter diesem Wert: Onboarding-Phase → Baseline nutzt ALLE verfügbaren Daten (inkl. heute)
 * - Ab diesem Wert: Stabile Phase → Baseline nutzt nur Tests BIS GESTERN (heutige Tests nur für Forecast)
 */
const MIN_TESTS_FOR_STABLE_BASELINE = 15;

/**
 * LEGACY: Alte Decay-/Modulation-Konstanten (nicht mehr primär verwendet)
 * Neue Logik nutzt 2h-Bins und Local-Window-Gewichtung
 */
const DECAY_HALF_LIFE_HOURS = 4; // Fallback für alte Logic
const MAX_LAST_TEST_WEIGHT = 0.5; // Fallback für alte Logic

// ============================================================================
// BIN-BASED BASELINE v2 (2-Stunden-Bins)
// ============================================================================

/**
 * Anzahl der 2-Stunden-Bins (0-23 Uhr → 12 Bins)
 */
const NUM_BINS = 12;

/**
 * Gibt den Bin-Index (0-11) für eine gegebene Stunde zurück
 * 
 * @param hour - Stunde (0-23)
 * @returns Bin-Index (0-11)
 * 
 * Beispiele:
 * - hour=0 oder 1 → bin=0
 * - hour=2 oder 3 → bin=1
 * - hour=22 oder 23 → bin=11
 */
function getBinIndexForHour(hour: number): number {
  return Math.floor(hour / 2);
}

/**
 * Gibt die beiden Stunden zurück, die zu einem Bin gehören
 * 
 * @param binIndex - Bin-Index (0-11)
 * @returns Array mit 2 Stunden
 */
function getHoursForBin(binIndex: number): number[] {
  const startHour = binIndex * 2;
  return [startHour, startHour + 1];
}

/**
 * Statistiken pro 2-Stunden-Bin
 */
interface BinStats {
  scores: number[];
  timestamps: Date[];
}

/**
 * Ergebnis der Bin-Berechnung
 */
interface BinResult {
  userBinValue: number;
  hasUserData: boolean;
}

// ============================================================================
// USER BASELINE
// ============================================================================

/**
 * Berechnet die User-Baseline (24 Stunden) mit 2-Stunden-Bins
 * 
 * NEUE LOGIK v3 (mit zeitlicher Trennung):
 * - Gruppiert Tests in 12 Bins à 2 Stunden (statt 5 grober Segmente)
 * - Gewichtet Recent Tests (letzten 1-2) stärker als Bin-Durchschnitt
 * - Reduziert globalen Einfluss mit steigender Datenmenge
 * - **Zeitliche Trennung:** Baseline nutzt standardmäßig nur Tests BIS GESTERN
 *   - Ausnahme: Onboarding-Phase (<15 Tests) → nutzt alle verfügbaren Daten (inkl. heute)
 *   - Rationale: Baseline = "typischer Tagesverlauf", nicht durch heutige Tests beeinflusst
 * 
 * Algorithmus:
 * 1. Lade alle Sessions der letzten 30 Tage
 * 2. Zeitliche Filterung: Nur Tests bis gestern (außer Onboarding)
 * 3. Berechne Overall-Average als Fallback
 * 4. Gruppiere nach 12 Bins (0-1h, 2-3h, ..., 22-23h)
 * 5. Pro Bin: Berechne Weighted Average aus Recent + BinMean + GlobalBinValue
 * 6. Erzeuge 24 BaselinePoints (2 pro Bin)
 * 
 * @param supabase - Supabase Client (Server oder Browser)
 * @param userId - Supabase User ID
 * @returns Array von 24 BaselinePoints mit userValue gesetzt
 */
export async function getUserBaseline(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BaselinePoint[]> {
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
    return getAllGlobalBaselinePoints();
  }

  if (!sessions || sessions.length === 0) {
    return getAllGlobalBaselinePoints();
  }

  // 2. Zeitliche Filterung: Baseline-Daten vs. Heute
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  // Prüfe Gesamtanzahl Tests für Onboarding-Phase
  const totalTests = sessions.length;
  const isOnboarding = totalTests < MIN_TESTS_FOR_STABLE_BASELINE;
  
  // Filtere Sessions basierend auf Phase:
  // - Onboarding (<15 Tests): Nutze ALLE Daten (inkl. heute)
  // - Stabil (≥15 Tests): Nutze nur Tests BIS GESTERN
  const baselineSessions = isOnboarding 
    ? sessions 
    : sessions.filter(s => new Date(s.created_at) < startOfToday);
  
  // Fallback: Wenn nach Filterung keine Daten → Global Baseline
  if (baselineSessions.length === 0) {
    return getAllGlobalBaselinePoints();
  }

  // 3. Berechne Overall-Average (globaler Fallback) aus Baseline-Sessions
  const allScores = baselineSessions.map((s) => s.brain_score);
  const overallAverage = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

  // 4. Gruppiere Baseline-Sessions nach 12 Bins (à 2 Stunden)
  const bins: BinStats[] = Array.from({ length: NUM_BINS }, () => ({
    scores: [],
    timestamps: []
  }));

  for (const session of baselineSessions) {
    const sessionDate = new Date(session.created_at);
    const hour = sessionDate.getHours();
    const binIndex = getBinIndexForHour(hour);
    
    bins[binIndex].scores.push(session.brain_score);
    bins[binIndex].timestamps.push(sessionDate);
  }

  // 5. Berechne userBinValue für jeden Bin
  const binResults: BinResult[] = [];

  for (let i = 0; i < NUM_BINS; i++) {
    const binStats = bins[i];
    const n = binStats.scores.length;
    
    // Globaler Durchschnitt für diesen Bin
    const globalHours = getHoursForBin(i);
    const globalBinValue = globalHours.reduce((sum, h) => 
      sum + getGlobalBaselineForHour(h), 0) / globalHours.length;

    if (n === 0) {
      // Keine Tests im Bin → Nutze global baseline
      binResults.push({
        userBinValue: globalBinValue,
        hasUserData: false
      });
      continue;
    }

    // Es gibt mindestens 1 Test im Bin
    const binMean = binStats.scores.reduce((sum, s) => sum + s, 0) / n;

    // Sortiere nach Timestamp (neueste zuerst)
    const sortedIndices = binStats.timestamps
      .map((t, idx) => ({ t, idx }))
      .sort((a, b) => b.t.getTime() - a.t.getTime())
      .map(x => x.idx);
    
    // Recent Scores: Letzten min(2, n) Tests
    const recentCount = Math.min(2, n);
    const recentScores = sortedIndices.slice(0, recentCount).map(idx => binStats.scores[idx]);
    const recentMean = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;

    // Gewichtung basierend auf Datenmenge
    let wRecent: number;
    let wBin: number;
    let wGlobal: number;

    if (n === 1) {
      // 1 Test: Stark auf diesem Test, aber mit Global-Backup
      wRecent = 0.6;
      wBin = 0.0;
      wGlobal = 0.4;
    } else if (n >= 2 && n <= 4) {
      // Wenige Tests: Recent + BinMean + Global
      wRecent = 0.6;
      wBin = 0.2;
      wGlobal = 0.2;
    } else {
      // Viele Tests (>=5): User dominiert, Global minimal
      wRecent = 0.6;
      wBin = 0.3;
      wGlobal = 0.1;
    }

    // Gewichteter Durchschnitt
    const userBinValue = wRecent * recentMean + wBin * binMean + wGlobal * globalBinValue;

    binResults.push({
      userBinValue: Math.max(0, Math.min(100, userBinValue)),
      hasUserData: true
    });
  }

  // 6. Erzeuge 24 BaselinePoints (2 pro Bin)
  const baselinePoints: BaselinePoint[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const binIndex = getBinIndexForHour(hour);
    const binResult = binResults[binIndex];
    const globalValue = getGlobalBaselineForHour(hour);
    
    baselinePoints.push({
      hour,
      globalValue,
      userValue: Math.round(binResult.userBinValue),
      hasUserData: binResult.hasUserData
    });
  }

  return baselinePoints;
}

// ============================================================================
// CONFIDENCE CALCULATION (Window-based)
// ============================================================================

/**
 * Berechnet Confidence basierend auf Local-Window-Datenlage
 * 
 * NEUE LOGIK v2:
 * - Confidence bezieht sich auf Datenlage im AKTUELLEN 2h-Zeitfenster
 * - Nicht mehr nur auf Gesamt-Test-Count
 * 
 * @param nLocal - Anzahl Tests im aktuellen 2h-Fenster
 * @param totalTests - Gesamt-Anzahl Tests (für Fallback)
 * @returns ConfidenceLevel
 */
function getConfidenceForWindow(nLocal: number, totalTests: number): ConfidenceLevel {
  // Zu wenig Gesamt-Daten → Low
  if (totalTests < 5) return 'low';

  // Keine Local-Tests im Fenster → Low (auch wenn gesamt viele Tests)
  if (nLocal === 0) return 'low';

  // 1-2 Local-Tests → Medium
  if (nLocal < 3) return 'medium';

  // 3+ Local-Tests → High
  return 'high';
}

// ============================================================================
// LEGACY FUNCTIONS - REMOVED IN V4
// ============================================================================
// getLastTest() und getTypicalScoreForSegment() wurden entfernt.
// V4 verwendet stattdessen Local-Window-Statistiken innerhalb des 2h-Bins.

// ============================================================================
// LOCAL WINDOW FORECAST v2
// ============================================================================

/**
 * Statistiken für Local-Window (aktuelles 2h-Zeitfenster)
 */
interface LocalWindowStats {
  nLocal: number;
  recentLocalMean: number | null;
  lastLocalTestTimestamp: Date | null;
  totalTests: number;
}

/**
 * Berechnet Local-Window-Statistiken für das aktuelle 2h-Bin
 * 
 * @param supabase - Supabase Client
 * @param userId - User ID
 * @param currentBinIndex - Aktueller Bin-Index (0-11)
 * @returns Local-Window-Statistiken
 */
async function getLocalWindowStats(
  supabase: SupabaseClient<Database>,
  userId: string,
  currentBinIndex: number
): Promise<LocalWindowStats> {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - BASELINE_LOOKBACK_DAYS);

  const { data: sessions, error } = await supabase
    .from('sart_sessions')
    .select('brain_score, created_at')
    .eq('user_id', userId)
    .gte('created_at', lookbackDate.toISOString())
    .order('created_at', { ascending: false })
    .returns<Pick<SartSession, 'brain_score' | 'created_at'>[]>();

  if (error || !sessions) {
    return {
      nLocal: 0,
      recentLocalMean: null,
      lastLocalTestTimestamp: null,
      totalTests: 0
    };
  }

  const totalTests = sessions.length;

  // Filtere Tests im aktuellen Bin
  const localSessions = sessions.filter(session => {
    const hour = new Date(session.created_at).getHours();
    const binIndex = getBinIndexForHour(hour);
    return binIndex === currentBinIndex;
  });

  const nLocal = localSessions.length;

  if (nLocal === 0) {
    return {
      nLocal: 0,
      recentLocalMean: null,
      lastLocalTestTimestamp: null,
      totalTests
    };
  }

  // Nimm letzten min(2, nLocal) Tests
  const recentCount = Math.min(2, nLocal);
  const recentLocal = localSessions.slice(0, recentCount);
  const recentLocalMean = recentLocal.reduce((sum, s) => sum + s.brain_score, 0) / recentLocal.length;
  const lastLocalTestTimestamp = new Date(localSessions[0].created_at);

  return {
    nLocal,
    recentLocalMean,
    lastLocalTestTimestamp,
    totalTests
  };
}

/**
 * Berechnet den Forecast für JETZT mit Local-Window-Logik
 * 
 * NEUE LOGIK v2:
 * - "Typical at this time" = Baseline-Wert (lila Linie)
 * - forecastNow primär durch Tests im GLEICHEN 2h-Zeitfenster beeinflusst
 * - Gewichtung abhängig von Recency (wie lange ist letzter Local-Test her?)
 * - Confidence basiert auf Local-Window-Datenlage
 * 
 * Algorithmus:
 * 1. Lade User-Baseline
 * 2. Bestimme baselineValue (= typicalAtThisTime)
 * 3. Hole Local-Window-Stats (Tests im aktuellen 2h-Bin)
 * 4. Berechne forecastNow:
 *    - Keine Local-Tests: forecast = baseline
 *    - Local-Tests vorhanden: Weighted blend (wLocal × recentLocal + wBaseline × baseline)
 * 5. Confidence = Local-Window-basiert
 * 
 * @param supabase - Supabase Client (Server oder Browser)
 * @param userId - Supabase User ID
 * @param now - Aktueller Zeitpunkt (für Testbarkeit)
 * @returns ForecastResult
 */
export async function getForecastForNow(
  supabase: SupabaseClient<Database>,
  userId: string,
  now: Date = new Date()
): Promise<ForecastResult> {
  // 1. Lade User-Baseline
  const userBaseline = await getUserBaseline(supabase, userId);
  const currentHour = now.getHours();
  const currentSegment = getSegmentForHour(currentHour);

  // Baseline-Wert für JETZT
  const baselinePoint = userBaseline[currentHour];
  const baselineValue = baselinePoint.userValue ?? baselinePoint.globalValue;

  // Typischer Wert = Baseline (NICHT mehr separates Segment-Average!)
  const typicalAtThisTime = baselineValue;

  // 2. Hole Local-Window-Stats für aktuelles 2h-Bin
  const currentBinIndex = getBinIndexForHour(currentHour);
  const localStats = await getLocalWindowStats(supabase, userId, currentBinIndex);

  // 3. Berechne Confidence basierend auf Local-Window
  const confidence = getConfidenceForWindow(localStats.nLocal, localStats.totalTests);

  // 4. Berechne Forecast mit Local-Window-Gewichtung + "Frisch getestet"-Spezialfall
  let forecastNow: number | null = null;
  let label: ForecastLabel | null = null;

  // Schwellwert für "frisch getestet" (5 Minuten)
  // Rationale: Direkt nach einem Test soll der aktuelle BrainScore praktisch identisch
  // mit dem gemessenen Wert sein, um Inkonsistenzen zu vermeiden.
  const FRESH_TEST_THRESHOLD_MINUTES = 5;

  // Berechne Zeit seit letztem Local-Window-Test
  let minutesAgo: number | null = null;
  if (localStats.lastLocalTestTimestamp) {
    const diffMs = now.getTime() - localStats.lastLocalTestTimestamp.getTime();
    minutesAgo = diffMs / (1000 * 60);
  }

  // Case 1: Gerade frisch getestet (≤5 Minuten her)
  if (localStats.nLocal > 0 && minutesAgo !== null && minutesAgo <= FRESH_TEST_THRESHOLD_MINUTES) {
    // 95% Gewicht auf den direkten Messwert, 5% auf Baseline
    // Rationale: Nutzer erwartet, dass Dashboard-Score = soeben gemessener Score
    const wLocal = 0.95;
    const wBaseline = 0.05;

    const localMean = localStats.recentLocalMean ?? baselineValue;
    const combined = wLocal * localMean + wBaseline * baselineValue;

    forecastNow = Math.round(Math.max(0, Math.min(100, combined)));
    label = getLabelForScore(forecastNow);
  }
  // Case 2: Keine Tests in diesem Local-Window
  else if (localStats.nLocal === 0 || localStats.recentLocalMean === null) {
    // Reine Baseline-Prognose
    forecastNow = Math.round(baselineValue);
    label = getLabelForScore(forecastNow);
  }
  // Case 3: Tests vorhanden, aber nicht frisch (>5 Minuten her)
  else {
    // Verwende bestehende Recency-Gewichtung basierend auf Stundenabstand
    const hoursAgo = minutesAgo !== null ? minutesAgo / 60 : Number.POSITIVE_INFINITY;

    let wLocal: number;
    if (hoursAgo <= 2) {
      wLocal = 0.7; // Sehr frisch (innerhalb 2h)
    } else if (hoursAgo <= 6) {
      wLocal = 0.5; // Relativ frisch (6h)
    } else if (hoursAgo <= 24) {
      wLocal = 0.3; // Älter (24h)
    } else {
      wLocal = 0.2; // Sehr alt (>24h)
    }

    const wBaseline = 1 - wLocal;
    const localMean = localStats.recentLocalMean ?? baselineValue;

    // Kombiniere Local-Mean + Baseline
    const combined = wLocal * localMean + wBaseline * baselineValue;
    forecastNow = Math.round(Math.max(0, Math.min(100, combined)));

    label = getLabelForScore(forecastNow);
  }

  // 5. Erzeuge Evidenz-Struktur aus totalTests
  const evidence: ForecastEvidence = {
    level: confidence,
    testCount: localStats.totalTests
  };

  return {
    forecastNow,
    label,
    confidence,
    currentSegment,
    typicalAtThisTime,
    evidence,
  };
}

// ============================================================================
// TODAY'S DEVIATIONS (Heutige Tagesform)
// ============================================================================

/**
 * Berechnet die Abweichungen aller heutigen Tests von der User-Baseline
 * 
 * Diese Funktion ermöglicht die Visualisierung der "heutigen Tagesform" im Verhältnis
 * zur normalen Baseline-Kurve. Für jeden Test, der heute gemacht wurde, wird die
 * Abweichung vom erwarteten Baseline-Wert berechnet.
 * 
 * @param supabase - Supabase Client
 * @param userId - User ID
 * @param userBaseline - Berechnete User-Baseline (24 Stunden)
 * @param now - Aktueller Zeitpunkt (für Tagesberechnung)
 * @returns Summary mit allen heutigen Tests und durchschnittlicher Abweichung
 */
export async function getTodayDeviations(
  supabase: SupabaseClient<Database>,
  userId: string,
  userBaseline: BaselinePoint[],
  now: Date = new Date()
): Promise<import('$lib/types/forecast').TodayDeviationsSummary> {
  // Bestimme Tagesbeginn und -ende (lokal)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Lade alle heutigen Tests
  const { data: sessions, error } = await supabase
    .from('sart_sessions')
    .select('brain_score, created_at')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: true })
    .returns<Pick<SartSession, 'brain_score' | 'created_at'>[]>();

  if (error || !sessions || sessions.length === 0) {
    return {
      tests: [],
      averageDelta: null
    };
  }

  // Berechne Abweichungen für jeden Test
  const tests: import('$lib/types/forecast').TodayTestDeviation[] = sessions.map(session => {
    const testDate = new Date(session.created_at);
    const hour = testDate.getHours();

    // Hole Baseline-Wert für diese Stunde
    const baselinePoint = userBaseline[hour];
    const baselineAtHour = baselinePoint.userValue ?? baselinePoint.globalValue;

    // Berechne Abweichung
    const score = Math.max(0, Math.min(100, session.brain_score));
    const delta = score - baselineAtHour;

    return {
      timestamp: testDate,
      hour,
      score,
      baselineAtHour,
      delta
    };
  });

  // Berechne durchschnittliche Abweichung
  const averageDelta = tests.length > 0
    ? tests.reduce((sum, t) => sum + t.delta, 0) / tests.length
    : null;

  return {
    tests,
    averageDelta
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gibt alle Stunden für ein Segment zurück (weiterhin benötigt für Timeline-Logik)
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
