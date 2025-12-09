/**
 * Session Insights Builder
 * 
 * Konvertiert SART-Session-Metriken in kognitive Bausteine (insights_json)
 */

import type { SartMetrics } from '$lib/types/sart.types';
import type { SessionInsights, CognitiveBlockInsight } from '$lib/types/focusHistory.types';
import { interpretCognitiveDimensions, type CognitiveInputMetrics } from '$features/insights/cognitiveInterpretation';

/**
 * Erstellt SessionInsights aus einer einzelnen SART-Session
 * 
 * Diese Funktion mappt die vorhandene Tages-Logik auf Session-Ebene
 */
export function buildSessionInsights(metrics: SartMetrics): SessionInsights {
  // Map SartMetrics -> CognitiveInputMetrics
  const inputMetrics: CognitiveInputMetrics = {
    commissionErrorRate: metrics.noGoTrialsCount > 0
      ? metrics.commissionErrors / metrics.noGoTrialsCount
      : 0,
    omissionErrorRate: metrics.goTrialsCount > 0
      ? metrics.omissionErrors / metrics.goTrialsCount
      : 0,
    goRTSd: metrics.sdReactionTimeMs,
    validTrialRatio: 1.0, // TODO: Wenn wir validTrialRatio implementieren
  };

  // Nutze vorhandene Interpretation
  const dimensions = interpretCognitiveDimensions(inputMetrics);

  // Map auf CognitiveBlockInsight (für UI)
  const blocks: CognitiveBlockInsight[] = dimensions.map((dim) => {
    // Map id -> key
    let key: CognitiveBlockInsight['key'];
    switch (dim.id) {
      case 'inhibition':
        key = 'impulsivity';
        break;
      case 'vigilance':
        key = 'vigilance';
        break;
      case 'stability':
        key = 'stability';
        break;
      case 'engagement':
        key = 'engagement';
        break;
      default:
        key = 'engagement'; // Fallback
    }

    return {
      key,
      level: dim.level,
      label: dim.label,
      description: dim.shortText,
    };
  });

  return { blocks };
}
