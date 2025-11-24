/**
 * Cognitive Interpretation Service
 * 
 * Interpretiert kognitive Konstrukte aus SART-Metriken
 * gemäß Masterdokument Abschnitt 5 "Kognitive Konstrukte und Diagnostik"
 */

// ============================================================================
// Configuration: Thresholds (heuristische Grenzwerte für MVP)
// ============================================================================

const INHIBITION_THRESHOLDS = {
  low: 0.10,   // <= 10% Commission Errors = gute Inhibition
  high: 0.30   // > 30% = auffällige Impulsivität
};

const VIGILANCE_THRESHOLDS = {
  low: 0.05,   // <= 5% Omission Errors = gute Vigilanz
  high: 0.20   // > 20% = auffällige Unaufmerksamkeit
};

const STABILITY_THRESHOLDS = {
  low: 80,     // <= 80ms SD = sehr stabile Reaktionen
  high: 180    // > 180ms SD = inkonsistente Reaktionen
};

const ENGAGEMENT_THRESHOLDS = {
  low: 0.90,   // <= 90% valide Trials = niedrige Protokollqualität
  high: 0.98   // >= 98% = sehr hohes Engagement
};

// ============================================================================
// Types
// ============================================================================

export type Level = 'low' | 'medium' | 'high';

export interface CognitiveDimensionFeedback {
  id: 'inhibition' | 'vigilance' | 'stability' | 'engagement';
  label: string;
  level: Level;
  shortText: string;
}

export interface CognitiveInputMetrics {
  commissionErrorRate: number;  // 0–1 (CE / No-Go-Trials)
  omissionErrorRate: number;    // 0–1 (OE / Go-Trials)
  goRTSd: number;               // in ms (Standardabweichung der Go-RT)
  validTrialRatio: number;      // 0–1 (valide Trials / alle Trials)
}

// ============================================================================
// Interpretation Logic
// ============================================================================

/**
 * Interpretiert kognitive Dimensionen aus aggregierten Tagesmetriken
 */
export function interpretCognitiveDimensions(
  metrics: CognitiveInputMetrics
): CognitiveDimensionFeedback[] {
  return [
    interpretInhibition(metrics.commissionErrorRate),
    interpretVigilance(metrics.omissionErrorRate),
    interpretStability(metrics.goRTSd),
    interpretEngagement(metrics.validTrialRatio)
  ];
}

/**
 * Impulsivität / Response Inhibition
 * Gemessen über Commission Error Rate (bei No-Go reagiert)
 */
function interpretInhibition(commissionErrorRate: number): CognitiveDimensionFeedback {
  let level: Level;
  let shortText: string;
  
  if (commissionErrorRate <= INHIBITION_THRESHOLDS.low) {
    level = 'low';
    shortText = 'Du hast die Stopp-Signale sehr gut erkannt und kaum impulsiv reagiert. Deine Impulskontrolle war in diesem Zeitraum stark.';
  } else if (commissionErrorRate > INHIBITION_THRESHOLDS.high) {
    level = 'high';
    shortText = 'In diesem Test hast du häufiger auf Reize reagiert, bei denen du eigentlich stoppen solltest. Das spricht für eine eher impulsive Antworttendenz in dieser Situation.';
  } else {
    level = 'medium';
    shortText = 'Deine Impulskontrolle lag im mittleren Bereich. Gelegentlich hast du auf Stopp-Signale reagiert, was bei hoher Geschwindigkeit normal ist.';
  }
  
  return {
    id: 'inhibition',
    label: 'Impulsivität / Response Inhibition',
    level,
    shortText
  };
}

/**
 * Vigilanz / Sustained Attention
 * Gemessen über Omission Error Rate (Go-Trials verpasst)
 */
function interpretVigilance(omissionErrorRate: number): CognitiveDimensionFeedback {
  let level: Level;
  let shortText: string;
  
  if (omissionErrorRate <= VIGILANCE_THRESHOLDS.low) {
    level = 'low'; // low = gut (niedrige Fehlerrate)
    shortText = 'Du hast fast alle Zielreize rechtzeitig beantwortet – deine anhaltende Aufmerksamkeit war in diesem Test stabil.';
  } else if (omissionErrorRate > VIGILANCE_THRESHOLDS.high) {
    level = 'high'; // high = auffällig
    shortText = 'Du hast mehrere Reaktionen ausgelassen. Das kann auf nachlassende Konzentration oder eine hohe kognitive Belastung in diesem Zeitraum hindeuten.';
  } else {
    level = 'medium';
    shortText = 'Deine Aufmerksamkeit war überwiegend stabil, mit einigen wenigen Aussetzern. Das ist bei längeren Tests völlig normal.';
  }
  
  return {
    id: 'vigilance',
    label: 'Vigilanz / Sustained Attention',
    level,
    shortText
  };
}

/**
 * Stabilität / Response Consistency
 * Gemessen über Go-RT Standardabweichung
 */
function interpretStability(goRTSd: number): CognitiveDimensionFeedback {
  let level: Level;
  let shortText: string;
  
  if (goRTSd <= STABILITY_THRESHOLDS.low) {
    level = 'low'; // low = sehr stabil (niedrige SD)
    shortText = 'Deine Reaktionszeiten waren sehr gleichmäßig. Das spricht für eine konsistente Konzentration über die gesamte Testdauer.';
  } else if (goRTSd > STABILITY_THRESHOLDS.high) {
    level = 'high'; // high = inkonsistent
    shortText = 'Deine Reaktionszeiten schwankten deutlich. Das kann auf wechselnde Aufmerksamkeit oder äußere Ablenkungen hindeuten.';
  } else {
    level = 'medium';
    shortText = 'Deine Reaktionen zeigten moderate Schwankungen – ein normales Muster bei kognitiven Tests mit mehreren Durchgängen.';
  }
  
  return {
    id: 'stability',
    label: 'Stabilität der Reaktionen',
    level,
    shortText
  };
}

/**
 * Engagement / Protokollqualität
 * Gemessen über Valid Trial Ratio (gültige Trials)
 */
function interpretEngagement(validTrialRatio: number): CognitiveDimensionFeedback {
  let level: Level;
  let shortText: string;
  
  if (validTrialRatio >= ENGAGEMENT_THRESHOLDS.high) {
    level = 'high'; // high = sehr gut
    shortText = 'Du hast den Test sehr gewissenhaft durchgeführt. Fast alle Durchgänge waren technisch valide – ein Zeichen für hohes Engagement.';
  } else if (validTrialRatio <= ENGAGEMENT_THRESHOLDS.low) {
    level = 'low'; // low = auffällig
    shortText = 'Mehrere Testdurchgänge waren technisch nicht verwertbar. Das kann auf Ablenkungen oder technische Probleme hindeuten.';
  } else {
    level = 'medium';
    shortText = 'Die meisten Testdurchgänge waren valide. Gelegentliche Unterbrechungen sind bei längeren Tests normal.';
  }
  
  return {
    id: 'engagement',
    label: 'Engagement / Protokollqualität',
    level,
    shortText
  };
}
