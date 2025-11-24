/**
 * BrainScore v1 - Composite Score Calculation
 * 
 * Implements the BrainScore v1 formula as defined in
 * docs/brainrot-sart-short-v1_brainscore-v1.md
 * 
 * BrainScore v1 is a weighted composite score (0-100) combining:
 * - AccuracyScore (40%): Based on commission and omission errors
 * - SpeedScore (30%): Based on mean Go reaction time with speed-accuracy trade-off
 * - ConsistencyScore (20%): Based on reaction time variability (SD)
 * - DisciplineScore (10%): Based on protocol quality (valid trial ratio)
 * 
 * Formula:
 * BrainScore_v1 = 0.40 × AccuracyScore + 0.30 × SpeedScore + 0.20 × ConsistencyScore + 0.10 × DisciplineScore
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6
 */

import { BRAINROT_SART_CONFIG } from './brainrotSartConfig';

/**
 * Raw metrics computed from trial data
 */
export interface RawMetrics {
	// Trial counts
	nValid: number; // Total valid trials
	nNoGo: number; // Valid No-Go trials (should be 10)
	nGo: number; // Valid Go trials (should be 80)

	// Error rates
	commissionErrorRate: number; // False alarms on No-Go trials
	omissionErrorRate: number; // Missed responses on Go trials

	// Reaction times (for correct Go trials only)
	meanGoRT: number; // Mean reaction time in ms
	goRtSD: number; // Standard deviation of reaction times in ms

	// Protocol quality
	validTrialRatio: number; // nValid / totalTrials (90)
}

/**
 * Sub-scores (each 0-100)
 */
export interface SubScores {
	accuracyScore: number; // 0-100
	speedScore: number; // 0-100
	consistencyScore: number; // 0-100
	disciplineScore: number; // 0-100
}

/**
 * Complete BrainScore v1 result
 */
export interface BrainScoreResult extends SubScores {
	brainScore: number; // 0-100, weighted composite
	rawMetrics: RawMetrics;
}

/**
 * Linear interpolation helper
 * @param x Current value
 * @param x1 Lower bound input
 * @param y1 Lower bound output
 * @param x2 Upper bound input
 * @param y2 Upper bound output
 */
function linearInterpolate(x: number, x1: number, y1: number, x2: number, y2: number): number {
	return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Calculates AccuracyScore (0-100) based on commission and omission error rates
 * 
 * Formula:
 * accuracy = 1 - (commissionErrorRate + omissionErrorRate) / 2
 * AccuracyScore = 100 × accuracy
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.1
 */
export function calculateAccuracyScore(
	commissionErrorRate: number,
	omissionErrorRate: number
): number {
	const accuracy = 1 - (commissionErrorRate + omissionErrorRate) / 2;
	const boundedAccuracy = clamp(accuracy, 0, 1);
	return boundedAccuracy * 100;
}

/**
 * Calculates SpeedScore (0-100) based on mean Go reaction time
 * 
 * Implements speed-accuracy trade-off as described in SART literature:
 * - Very fast (≤300ms): 60 (potentially impulsive)
 * - Optimal (300-600ms): 60 → 100 (linear increase)
 * - Good (600-900ms): 100 → 40 (linear decrease)
 * - Very slow (>900ms): 40 (overly cautious)
 * 
 * PENALTY: Bei schnellen Reaktionen (<400ms) + hoher Fehlerquote (>25%) wird Score halbiert
 * um "Spam-Klicken" zu bestrafen.
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.2
 */
export function calculateSpeedScore(
	meanGoRT: number,
	commissionErrorRate: number,
	omissionErrorRate: number
): number {
	let baseSpeedScore = 0;
	
	if (meanGoRT <= 300) {
		baseSpeedScore = 60;
	} else if (meanGoRT < 600) {
		// Linear from 60 at 300ms to 100 at 600ms
		baseSpeedScore = linearInterpolate(meanGoRT, 300, 60, 600, 100);
	} else if (meanGoRT <= 900) {
		// Linear from 100 at 600ms to 40 at 900ms
		baseSpeedScore = linearInterpolate(meanGoRT, 600, 100, 900, 40);
	} else {
		baseSpeedScore = 40;
	}
	
	// PENALTY: Bei schnellen Reaktionen + hohen Fehlerquoten (Spam-Klicken)
	const totalErrorRate = (commissionErrorRate + omissionErrorRate) / 2;
	if (meanGoRT < 400 && totalErrorRate > 0.25) {
		// Bei >25% Fehlerquote und <400ms: Score halbieren
		baseSpeedScore = baseSpeedScore * 0.5;
	}
	
	return baseSpeedScore;
}

/**
 * Calculates ConsistencyScore (0-100) based on Go reaction time variability
 * 
 * Lower SD indicates more consistent performance:
 * - Excellent (≤80ms SD): 100
 * - Good (80-250ms SD): 100 → 40 (linear decrease)
 * - Poor (≥250ms SD): 40
 * 
 * High RT variability is a typical marker for mind-wandering and unstable attention in SART research.
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.3
 */
export function calculateConsistencyScore(goRtSD: number): number {
	if (goRtSD <= 80) {
		return 100;
	} else if (goRtSD < 250) {
		// Linear from 100 at 80ms to 40 at 250ms
		return linearInterpolate(goRtSD, 80, 100, 250, 40);
	} else {
		return 40;
	}
}

/**
 * Calculates DisciplineScore (0-100) based on protocol quality
 * 
 * Valid trial ratio indicates engagement and technical quality:
 * - Excellent (≥90% valid): 100
 * - Good (80-90% valid): 90
 * - Fair (60-80% valid): 75
 * - Poor (<60% valid): 60
 * 
 * Low valid trial ratio may indicate technical issues or lack of engagement
 * (e.g., app backgrounding, distractions).
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.4
 */
export function calculateDisciplineScore(validTrialRatio: number): number {
	if (validTrialRatio >= 0.9) {
		return 100;
	} else if (validTrialRatio >= 0.8) {
		return 90;
	} else if (validTrialRatio >= 0.6) {
		return 75;
	} else {
		return 60;
	}
}

/**
 * Calculates the complete BrainScore v1 from raw metrics
 * 
 * BrainScore v1 = 0.40 × AccuracyScore + 0.30 × SpeedScore + 0.20 × ConsistencyScore + 0.10 × DisciplineScore
 * 
 * @param rawMetrics The aggregated metrics from the test session
 * @returns Complete BrainScore result with sub-scores and composite score
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.5
 */
export function calculateBrainScore(rawMetrics: RawMetrics): BrainScoreResult {
	// Calculate sub-scores
	const accuracyScore = calculateAccuracyScore(
		rawMetrics.commissionErrorRate,
		rawMetrics.omissionErrorRate
	);
	const speedScore = calculateSpeedScore(
		rawMetrics.meanGoRT,
		rawMetrics.commissionErrorRate,
		rawMetrics.omissionErrorRate
	);
	const consistencyScore = calculateConsistencyScore(rawMetrics.goRtSD);
	const disciplineScore = calculateDisciplineScore(rawMetrics.validTrialRatio);

	// Calculate weighted composite score
	const brainScore =
		0.4 * accuracyScore + 0.3 * speedScore + 0.2 * consistencyScore + 0.1 * disciplineScore;

	return {
		brainScore: Math.round(brainScore * 10) / 10, // Round to 1 decimal place
		accuracyScore: Math.round(accuracyScore * 10) / 10,
		speedScore: Math.round(speedScore * 10) / 10,
		consistencyScore: Math.round(consistencyScore * 10) / 10,
		disciplineScore: Math.round(disciplineScore * 10) / 10,
		rawMetrics
	};
}

/**
 * Computes raw metrics from trial results
 * 
 * @param trials Array of trial results with user responses
 * @returns Aggregated raw metrics ready for score calculation
 */
export interface TrialResult {
	isValid: boolean;
	isNoGo: boolean;
	userResponded: boolean;
	isCorrect: boolean;
	reactionTimeMs: number | null;
}

export function computeRawMetrics(trials: TrialResult[]): RawMetrics {
	const validTrials = trials.filter((t) => t.isValid);
	const nValid = validTrials.length;
	const validTrialRatio = nValid / BRAINROT_SART_CONFIG.TOTAL_TRIALS; // 60 trials

	// Separate Go and No-Go trials
	const validGoTrials = validTrials.filter((t) => !t.isNoGo);
	const validNoGoTrials = validTrials.filter((t) => t.isNoGo);

	const nGo = validGoTrials.length;
	const nNoGo = validNoGoTrials.length;

	// Commission errors: responded on No-Go
	const commissionErrors = validNoGoTrials.filter((t) => t.userResponded).length;
	const commissionErrorRate = nNoGo > 0 ? commissionErrors / nNoGo : 0;

	// Omission errors: did not respond on Go
	const omissionErrors = validGoTrials.filter((t) => !t.userResponded).length;
	const omissionErrorRate = nGo > 0 ? omissionErrors / nGo : 0;

	// Reaction time statistics (correct Go trials only)
	const correctGoTrialsWithRT = validGoTrials.filter(
		(t) => t.isCorrect && t.reactionTimeMs !== null
	);

	let meanGoRT = 0;
	let goRtSD = 0;

	if (correctGoTrialsWithRT.length > 0) {
		const rts = correctGoTrialsWithRT.map((t) => t.reactionTimeMs!);
		meanGoRT = rts.reduce((sum, rt) => sum + rt, 0) / rts.length;

		// Calculate standard deviation
		if (rts.length > 1) {
			const variance =
				rts.reduce((sum, rt) => sum + Math.pow(rt - meanGoRT, 2), 0) / (rts.length - 1);
			goRtSD = Math.sqrt(variance);
		}
	}

	return {
		nValid,
		nNoGo,
		nGo,
		commissionErrorRate,
		omissionErrorRate,
		meanGoRT,
		goRtSD,
		validTrialRatio
	};
}
