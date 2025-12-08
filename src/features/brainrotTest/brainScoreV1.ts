/**
 * BrainScore v1 - Composite Score Calculation
 * 
 * Implements the BrainScore v1 formula as defined in
 * docs/brainrot-sart-short-v1_brainscore-v1.md
 * 
 * BrainScore v1 is a weighted composite score (0-100) combining:
 * - AccuracyScore (30%): Based on commission and omission errors
 * - SpeedScore (35%): Based on mean Go reaction time with speed-accuracy trade-off
 * - ConsistencyScore (25%): Based on reaction time variability (SD)
 * - DisciplineScore (10%): Based on protocol quality (valid trial ratio)
 * 
 * Formula (Updated 2025-01):
 * BrainScore_v1 = 0.30 × AccuracyScore + 0.35 × SpeedScore + 0.25 × ConsistencyScore + 0.10 × DisciplineScore
 * 
 * Changes from initial version: RT/Speed more important, Accuracy slightly reduced
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
 * NEW Formula (v1.1):
 * - Asymmetrische Gewichtung: Omission Errors (Vigilanzverlust) schwerer als Commission Errors (Impulsivität)
 * - Omission: 70%, Commission: 30%
 * - Nichtlineare Verschärfung (Exponent 1.3) für stärkere Differenzierung
 * 
 * Rationale: Omission Errors sind charakteristischer für Vigilanzverlust/Mind-Wandering,
 * während Commission Errors eher Impulsivität zeigen.
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.1
 */
export function calculateAccuracyScore(
	commissionErrorRate: number,
	omissionErrorRate: number
): number {
	// Gewichtung: Omission (Vigilanzverlust) stärker als Commission (Impulsivität)
	const omissionWeight = 0.7;
	const commissionWeight = 0.3;

	const totalError = omissionWeight * omissionErrorRate + commissionWeight * commissionErrorRate;

	// Basis-Accuracy (0–1), mit unterer Grenze 0
	const accuracyBase = Math.max(0, 1 - totalError);

	// Leichte nichtlineare Verschärfung:
	// Werte <1 werden durch die Potenz etwas nach unten gezogen,
	// damit moderate Fehler stärker sichtbar werden.
	const accuracyExponent = 1.3;
	const accuracyScaled = Math.pow(accuracyBase, accuracyExponent);

	let accuracyScore = Math.round(accuracyScaled * 100);
	accuracyScore = Math.max(0, Math.min(100, accuracyScore));

	return accuracyScore;
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
 * NEW Thresholds (v1.1) - Deutlich verschärft:
 * - Excellent (≥95% valid): 100
 * - Good (90-95% valid): 85
 * - Fair (75-90% valid): 60
 * - Poor (<75% valid): 30
 * 
 * Rationale: Schlechte Protokollqualität (viele ungültige Trials durch App-Backgrounding,
 * Unterbrechungen etc.) muss stärker bestraft werden, um die Skala nach unten zu öffnen.
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 6.4
 */
export function calculateDisciplineScore(validTrialRatio: number): number {
	if (validTrialRatio >= 0.95) {
		return 100;
	} else if (validTrialRatio >= 0.9) {
		return 85;
	} else if (validTrialRatio >= 0.75) {
		return 60;
	} else {
		return 30;
	}
}

/**
 * Calculates the complete BrainScore v1 from raw metrics
 * 
 * NEW Aggregation (v1.1):
 * - Kombination aus gewichteter Mitte (60%) und schlechtestem Subscore (40%)
 * - Weighted Mean = 0.30 × Accuracy + 0.35 × Speed + 0.25 × Consistency + 0.10 × Discipline
 * - Final Score = 0.6 × WeightedMean + 0.4 × min(all subscores)
 * 
 * Rationale: Ein einzelner extrem schlechter Subscore soll das Gesamtergebnis stärker beeinflussen,
 * auch wenn andere Subscores gut sind. Dies verhindert, dass "Spezialisten" mit einseitiger
 * Performance hohe Scores erreichen.
 * 
 * Floor-Regeln (v1.1):
 * - Omission-Rate ≥50%: Score ≤20 (starke Vigilanzprobleme)
 * - ValidTrialRatio <60%: Score ≤30 (Protokollkatastrophe)
 * - GoRtSD >400ms: Score ≤30 (extreme Varianz/instabile Aufmerksamkeit)
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

	// NEW: Weighted mean (60%) + minimum subscore (40%)
	const weightedMean =
		0.3 * accuracyScore + 0.35 * speedScore + 0.25 * consistencyScore + 0.1 * disciplineScore;

	const minSubscore = Math.min(accuracyScore, speedScore, consistencyScore, disciplineScore);

	// Kombination: minSubscore erhält 40% Einfluss, um Ausreißer nach unten stark wirken zu lassen
	let brainScore = 0.6 * weightedMean + 0.4 * minSubscore;

	// Vorläufig clampen auf 0–100
	brainScore = Math.max(0, Math.min(100, brainScore));

	// ============================================================================
	// FLOOR-REGELN: Harte Deckel nach unten für Katastrophenmuster
	// ============================================================================

	// 1) Starke Vigilanz-Probleme: viele Omission Errors
	// Rationale: ≥50% Omission = Hälfte der Go-Trials verpasst → schwerer Vigilanzverlust
	if (rawMetrics.omissionErrorRate >= 0.5) {
		brainScore = Math.min(brainScore, 20);
	}

	// 2) Protokollkatastrophe: sehr niedrige Protokollqualität
	// Rationale: <60% valid trials = massives Backgrounding/Unterbrechungen → Test unzuverlässig
	if (rawMetrics.validTrialRatio < 0.6) {
		brainScore = Math.min(brainScore, 30);
	}

	// 3) Extreme Varianz der Reaktionszeiten: sehr instabile Aufmerksamkeit
	// Rationale: >400ms SD = massive RT-Schwankungen → inkonsistente Aufmerksamkeit
	if (rawMetrics.goRtSD > 400) {
		brainScore = Math.min(brainScore, 30);
	}

	// Final clamping (Rounding passiert im return)
	brainScore = Math.max(0, Math.min(100, brainScore));

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

/**
 * Validity assessment result
 */
export interface ValidityResult {
	isValid: boolean;
	reason?: 'low_valid_ratio' | 'too_many_ultrafast' | 'mixed';
}

/**
 * Assesses whether a test session is valid or likely spam/invalid
 * 
 * Criteria:
 * 1. Protocol quality: validTrialRatio < 0.8 suggests distractions/technical issues
 * 2. Ultra-fast spam clicking: meanGoRT < 350ms + high error rate (>30%)
 * 
 * @param raw Raw metrics from the test session
 * @returns Validity result with isValid flag and optional reason
 */
export function assessValidity(raw: RawMetrics): ValidityResult {
	const reasons: Array<'low_valid_ratio' | 'too_many_ultrafast'> = [];

	// 1. Protocol quality check
	if (raw.validTrialRatio < 0.8) {
		reasons.push('low_valid_ratio');
	}

	// 2. Ultra-fast spam clicking check
	// If average RT is very fast (<350ms) AND error rate is high (>30%),
	// this suggests mindless spam-clicking rather than genuine testing
	const totalErrorRate = (raw.commissionErrorRate + raw.omissionErrorRate) / 2;
	if (raw.meanGoRT < 350 && totalErrorRate > 0.3) {
		reasons.push('too_many_ultrafast');
	}

	// Return validity result
	if (reasons.length === 0) {
		return { isValid: true };
	}
	if (reasons.length === 1) {
		return { isValid: false, reason: reasons[0] };
	}
	return { isValid: false, reason: 'mixed' };
}
