/**
 * SART Service
 * Alle Business-Logic für den SART-Test
 * 
 * WARUM ein Service? 
 * - Trennung von UI und Logik
 * - Testbar ohne Komponenten
 * - Wiederverwendbar
 */

import { supabase } from './supabase.client';
import type { SartMetrics, SartTrial, SartConfig } from '$lib/types/sart.types';

export class SartService {
  private static readonly DEFAULT_CONFIG: SartConfig = {
    totalTrials: 45,
    trialDurationMs: 1000,
    noGoDigit: 3,
  };

  /**
   * Generiert zufällige Trials für den Test
   */
  static generateTrials(config: SartConfig = this.DEFAULT_CONFIG): SartTrial[] {
    const trials: SartTrial[] = [];

    for (let i = 0; i < config.totalTrials; i++) {
      const digit = Math.floor(Math.random() * 9) + 1;
      trials.push({
        index: i,
        digit,
        isNoGo: digit === config.noGoDigit,
        responded: false,
        reactionTimeMs: null,
      });
    }

    return trials;
  }

  /**
   * Berechnet Metriken aus abgeschlossenen Trials
   */
  static computeMetrics(trials: SartTrial[]): SartMetrics {
    const goTrials = trials.filter((t) => !t.isNoGo);
    const noGoTrials = trials.filter((t) => t.isNoGo);

    // Commission Errors: Bei NoGo reagiert (FALSCH)
    const commissionErrors = noGoTrials.filter((t) => t.responded).length;

    // Omission Errors: Bei Go NICHT reagiert (FALSCH)
    const omissionErrors = goTrials.filter((t) => !t.responded).length;

    // Reaktionszeiten (nur Go-Trials mit Response)
    const reactionTimes = goTrials
      .filter((t) => t.responded && t.reactionTimeMs !== null)
      .map((t) => t.reactionTimeMs!);

    const meanReactionTimeMs = reactionTimes.length
      ? reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length
      : 0;

    // Standard-Abweichung
    const sdReactionTimeMs = reactionTimes.length > 1
      ? Math.sqrt(
          reactionTimes
            .map((rt) => Math.pow(rt - meanReactionTimeMs, 2))
            .reduce((sum, val) => sum + val, 0) / (reactionTimes.length - 1)
        )
      : 0;

    // Score-Berechnung (0-100)
    const ceRate = noGoTrials.length ? commissionErrors / noGoTrials.length : 0;
    const oeRate = goTrials.length ? omissionErrors / goTrials.length : 0;

    const inhibitionComponent = 100 * (1 - ceRate);
    const vigilanceComponent = 100 * (1 - oeRate);

    // Speed-Score: Schneller = besser (optimal ~500ms)
    const speedScore = meanReactionTimeMs
      ? Math.max(0, Math.min(100, (700 - meanReactionTimeMs) / 4))
      : 50;

    // Stability-Score: Konsistente RT = besser
    const stabilityScore = sdReactionTimeMs
      ? Math.max(0, Math.min(100, 100 - sdReactionTimeMs / 3))
      : 50;

    const score = Math.round(
      0.35 * inhibitionComponent +
        0.25 * vigilanceComponent +
        0.25 * speedScore +
        0.15 * stabilityScore
    );

    return {
      commissionErrors,
      omissionErrors,
      goTrialsCount: goTrials.length,
      noGoTrialsCount: noGoTrials.length,
      meanReactionTimeMs: Math.round(meanReactionTimeMs),
      sdReactionTimeMs: Math.round(sdReactionTimeMs),
      score,
    };
  }

  /**
   * Speichert SART-Session in Supabase
   * @param metrics Test-Ergebnisse
   * @param userId Optional: User-ID für authentifizierte Sessions (defensiv: null wenn nicht eingeloggt)
   * @returns Session-ID oder null bei Fehler
   */
  static async saveSartSession(
    metrics: SartMetrics, 
    userId?: string | null
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('sart_sessions')
        .insert({
          user_id: userId || null, // ✅ Defensiv: null wenn keine Session
          commission_errors: metrics.commissionErrors,
          omission_errors: metrics.omissionErrors,
          go_count: metrics.goTrialsCount,
          nogo_count: metrics.noGoTrialsCount,
          mean_rt_ms: metrics.meanReactionTimeMs,
          sd_rt_ms: metrics.sdReactionTimeMs,
          brain_score: metrics.score,
        } as any)
        .select('id')
        .single();

      if (error) throw error;
      return (data as any)?.id || null;
    } catch (error) {
      console.error('❌ Error saving SART session:', error);
      return null;
    }
  }

  /**
   * Speichert Screentime-Report
   */
  static async saveScreentimeReport(
    sessionId: string,
    totalMinutes: number,
    activations: number,
    userId?: string | null,
    app1Name?: string,
    app1Activations?: number,
    app2Name?: string,
    app2Activations?: number,
    app3Name?: string,
    app3Activations?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('screentime_reports').insert({
        session_id: sessionId,
        user_id: userId || null,
        total_minutes: totalMinutes,
        activations: activations,
        app1_name: app1Name || null,
        app1_activations: app1Activations || null,
        app2_name: app2Name || null,
        app2_activations: app2Activations || null,
        app3_name: app3Name || null,
        app3_activations: app3Activations || null,
      } as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving screentime:', error);
      return false;
    }
  }

  /**
   * Interpretiert Score für User-Feedback
   */
  static getScoreLabel(score: number): string {
    if (score >= 80) return '⚡ Hervorragend';
    if (score >= 60) return '👍 Gut';
    if (score >= 40) return '📊 Durchschnittlich';
    return '📉 Übung macht den Meister';
  }
}
