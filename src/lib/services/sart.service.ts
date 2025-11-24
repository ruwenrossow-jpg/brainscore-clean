/**
 * SART Service - Database Layer
 * Handles database interactions for Brainrot-SART Short v1 test results
 * 
 * Test logic and score calculation now lives in:
 * - src/features/brainrotTest/brainrotSartEngine.ts (trial generation)
 * - src/features/brainrotTest/brainScoreV1.ts (score calculation)
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md
 */

import { supabase } from './supabase.client';
import type { SartMetrics, SartTrial } from '$lib/types/sart.types';
import type { BrainrotSartTrial } from '$features/brainrotTest/brainrotSartEngine';
import { 
  generateBrainrotSartTrials 
} from '$features/brainrotTest/brainrotSartEngine';
import { 
  computeRawMetrics, 
  calculateBrainScore,
  assessValidity,
  type TrialResult,
  type BrainScoreResult 
} from '$features/brainrotTest/brainScoreV1';
import { syncDailyScoreForDate } from './dailyScore.service';

export class SartService {
  /**
   * Generates trials according to Brainrot-SART Short v1 specification
   * 90 trials (10 blocks × 9 trials), each block contains digits 1-9 once
   * 
   * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 3.2
   */
  static generateTrials(): SartTrial[] {
    const brainrotTrials = generateBrainrotSartTrials();
    
    // Convert to legacy SartTrial format for UI compatibility
    return brainrotTrials.map((trial) => ({
      index: trial.trialIndex,
      digit: trial.stimulusDigit,
      isNoGo: trial.isNoGo,
      responded: false,
      reactionTimeMs: null,
    }));
  }

  /**
   * Computes BrainScore v1 metrics from completed trials
   * Uses updated scoring formula (2025-01): 30% Accuracy + 35% Speed + 25% Consistency + 10% Discipline
   * 
   * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6
   */
  static computeMetrics(trials: SartTrial[]): SartMetrics {
    // Convert legacy SartTrial format to TrialResult format
    const trialResults: TrialResult[] = trials.map((trial) => ({
      isValid: true, // For now, all trials are valid (no app backgrounding detection yet)
      isNoGo: trial.isNoGo,
      userResponded: trial.responded,
      isCorrect: trial.isNoGo ? !trial.responded : trial.responded,
      reactionTimeMs: trial.reactionTimeMs,
    }));

    // Compute raw metrics, validity, and BrainScore v1
    const rawMetrics = computeRawMetrics(trialResults);
    const validity = assessValidity(rawMetrics);
    const brainScoreResult = calculateBrainScore(rawMetrics);

    // Return in legacy format for backward compatibility + validity flags
    return {
      commissionErrors: Math.round(rawMetrics.commissionErrorRate * rawMetrics.nNoGo),
      omissionErrors: Math.round(rawMetrics.omissionErrorRate * rawMetrics.nGo),
      goTrialsCount: rawMetrics.nGo,
      noGoTrialsCount: rawMetrics.nNoGo,
      meanReactionTimeMs: Math.round(rawMetrics.meanGoRT),
      sdReactionTimeMs: Math.round(rawMetrics.goRtSD),
      score: Math.round(brainScoreResult.brainScore),
      isValid: validity.isValid,
      invalidReason: validity.reason
    };
  }

  /**
   * Speichert SART-Session in Supabase
   * ⚠️ Erfordert userId - anonyme Sessions werden nicht mehr unterstützt
   * @param metrics Test-Ergebnisse
   * @param userId User-ID (erforderlich)
   * @returns Session-ID oder null bei Fehler
   */
  static async saveSartSession(
    metrics: SartMetrics, 
    userId?: string | null
  ): Promise<string | null> {
    // Auth-Check: Keine anonymen Sessions mehr
    if (!userId) {
      console.error('❌ Cannot save SART session: userId is required');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('sart_sessions')
        .insert({
          user_id: userId,
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
      
      const sessionId = (data as any)?.id || null;
      
      // 🔄 Auto-sync DailyScore for today after test completion
      if (sessionId && userId) {
        const today = new Date().toISOString().split('T')[0];
        await syncDailyScoreForDate(userId, today);
        console.log('✅ DailyScore synced for today:', today);
      }
      
      return sessionId;
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
