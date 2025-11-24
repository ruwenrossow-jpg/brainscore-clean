/**
 * Cognitive Metrics Service
 * 
 * Berechnet aggregierte kognitive Metriken auf Tagesebene
 * aus allen SART-Sessions eines Tages
 */

import type { CognitiveInputMetrics } from './cognitiveInterpretation';

/**
 * SART-Session mit allen relevanten Metriken
 */
export interface SartSessionMetrics {
  commissionErrors: number;
  omissionErrors: number;
  goCount: number;
  nogoCount: number;
  meanRtMs: number;
  sdRtMs: number;
  // Optional: validTrialRatio (falls implementiert)
  validTrialRatio?: number;
}

/**
 * Berechnet aggregierte kognitive Metriken für einen Tag
 * aus allen SART-Sessions dieses Tages
 */
export function calculateDayCognitiveMetrics(
  sessions: SartSessionMetrics[]
): CognitiveInputMetrics {
  if (sessions.length === 0) {
    // Fallback: neutrale Werte
    return {
      commissionErrorRate: 0,
      omissionErrorRate: 0,
      goRTSd: 0,
      validTrialRatio: 1.0
    };
  }
  
  // Summiere alle Fehler und Trials über den Tag
  let totalCommissionErrors = 0;
  let totalOmissionErrors = 0;
  let totalGoTrials = 0;
  let totalNoGoTrials = 0;
  let totalValidTrialRatio = 0;
  
  // Sammle alle Go-RTs für Tages-SD-Berechnung
  const allGoRTs: number[] = [];
  
  for (const session of sessions) {
    totalCommissionErrors += session.commissionErrors;
    totalOmissionErrors += session.omissionErrors;
    totalGoTrials += session.goCount;
    totalNoGoTrials += session.nogoCount;
    
    // Valid Trial Ratio (falls vorhanden, sonst 1.0 annehmen)
    totalValidTrialRatio += session.validTrialRatio ?? 1.0;
    
    // Für SD-Berechnung: Rekonstruiere Go-RTs (vereinfacht)
    // Da wir nur mean und sd haben, approximieren wir die Verteilung
    // Für MVP: Nutze einfach die session-level SD und mittele
    allGoRTs.push(session.sdRtMs);
  }
  
  // Berechne Raten
  const commissionErrorRate = totalNoGoTrials > 0
    ? totalCommissionErrors / totalNoGoTrials
    : 0;
    
  const omissionErrorRate = totalGoTrials > 0
    ? totalOmissionErrors / totalGoTrials
    : 0;
  
  // Tages-Go-RT-SD: Durchschnitt der Session-SDs (Vereinfachung)
  // Für präzisere Berechnung bräuchten wir die einzelnen Trial-RTs
  const goRTSd = allGoRTs.reduce((sum, sd) => sum + sd, 0) / allGoRTs.length;
  
  // Valid Trial Ratio: Durchschnitt über alle Sessions
  const validTrialRatio = totalValidTrialRatio / sessions.length;
  
  return {
    commissionErrorRate,
    omissionErrorRate,
    goRTSd,
    validTrialRatio
  };
}
