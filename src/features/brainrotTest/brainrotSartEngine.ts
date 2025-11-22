/**
 * Brainrot-SART Short v1 - Trial Generation Engine
 * 
 * Handles trial sequence generation according to the continuous structure defined in
 * docs/brainrot-sart-short-v1_brainscore-v1.md
 * 
 * Sequence Structure:
 * - 60 trials in continuous sequence (no visible blocks)
 * - 7-8 No-Go trials (digit = 3), pseudorandomly distributed
 * - No consecutive No-Go trials (no "3,3" pairs)
 * - No No-Go in first 2 or last 2 trials (positions 0, 1, 58, 59)
 * - Go trials filled with digits 1, 2, 4-9 pseudorandomly
 * - Optional internal segmentation (6 segments × 10 trials) for analysis
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 3.2
 */

import { BRAINROT_SART_CONFIG, type StimulusDigit } from './brainrotSartConfig';

export interface BrainrotSartTrial {
	trialIndex: number; // 0-59
	segmentIndex?: number; // 0-5 (optional, for internal analysis)
	stimulusDigit: StimulusDigit;
	isNoGo: boolean;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Generates No-Go positions with constraints:
 * - Random count between NO_GO_COUNT_MIN and NO_GO_COUNT_MAX (7-8)
 * - No consecutive No-Go trials
 * - Not in positions 0, 1, 58, 59
 * 
 * @returns Array of trial indices that should be No-Go
 */
function generateNoGoPositions(): number[] {
	const {
		TOTAL_TRIALS,
		NO_GO_COUNT_MIN,
		NO_GO_COUNT_MAX,
		NO_GO_FORBIDDEN_EDGE_POSITIONS
	} = BRAINROT_SART_CONFIG;

	// Randomly choose 7 or 8 No-Go trials
	const noGoCount = NO_GO_COUNT_MIN + Math.floor(Math.random() * (NO_GO_COUNT_MAX - NO_GO_COUNT_MIN + 1));

	// Available positions (excluding edges)
	const availablePositions: number[] = [];
	for (let i = 0; i < TOTAL_TRIALS; i++) {
		if (!NO_GO_FORBIDDEN_EDGE_POSITIONS.includes(i)) {
			availablePositions.push(i);
		}
	}

	// Try to place No-Go positions with constraints (max 100 attempts)
	for (let attempt = 0; attempt < 100; attempt++) {
		const positions = shuffleArray(availablePositions).slice(0, noGoCount).sort((a, b) => a - b);

		// Check constraint: no consecutive positions
		let hasConsecutive = false;
		for (let i = 1; i < positions.length; i++) {
			if (positions[i] === positions[i - 1] + 1) {
				hasConsecutive = true;
				break;
			}
		}

		if (!hasConsecutive) {
			return positions;
		}
	}

	// Fallback: force valid placement if random attempts fail
	const positions: number[] = [];
	let lastPos = -2; // Start at -2 so position 0 would be valid (but it's forbidden anyway)
	
	while (positions.length < noGoCount) {
		const candidate = lastPos + 2 + Math.floor(Math.random() * 3); // Skip at least 1 position
		if (candidate < TOTAL_TRIALS && !NO_GO_FORBIDDEN_EDGE_POSITIONS.includes(candidate)) {
			positions.push(candidate);
			lastPos = candidate;
		}
	}

	return positions.sort((a, b) => a - b);
}

/**
 * Generates the complete trial sequence for Brainrot-SART Short v1
 * 
 * Sequence Structure:
 * - 60 trials continuous
 * - 7-8 No-Go trials (digit 3) pseudorandomly placed
 * - No consecutive No-Go trials
 * - No No-Go in first/last 2 trials
 * - Go trials filled with random digits 1,2,4-9
 * 
 * @returns Array of 60 trials
 */
export function generateBrainrotSartTrials(): BrainrotSartTrial[] {
	const { TOTAL_TRIALS, GO_DIGITS, NO_GO_DIGIT, TRIALS_PER_SEGMENT } = BRAINROT_SART_CONFIG;

	// Generate No-Go positions
	const noGoPositions = new Set(generateNoGoPositions());

	// Generate trial sequence
	const trials: BrainrotSartTrial[] = [];

	for (let trialIndex = 0; trialIndex < TOTAL_TRIALS; trialIndex++) {
		const isNoGo = noGoPositions.has(trialIndex);
		const stimulusDigit = isNoGo
			? (NO_GO_DIGIT as StimulusDigit)
			: (GO_DIGITS[Math.floor(Math.random() * GO_DIGITS.length)] as StimulusDigit);

		trials.push({
			trialIndex,
			segmentIndex: Math.floor(trialIndex / TRIALS_PER_SEGMENT), // 0-5 for analysis
			stimulusDigit,
			isNoGo
		});
	}

	return trials;
}

/**
 * Validates that a trial sequence conforms to the Brainrot-SART specification
 * Useful for testing and debugging
 * 
 * @param trials The trial sequence to validate
 * @returns Object with validation results
 */
export function validateTrialSequence(trials: BrainrotSartTrial[]): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];
	const {
		TOTAL_TRIALS,
		NO_GO_DIGIT,
		NO_GO_COUNT_MIN,
		NO_GO_COUNT_MAX,
		NO_GO_FORBIDDEN_EDGE_POSITIONS
	} = BRAINROT_SART_CONFIG;

	// Check total trial count
	if (trials.length !== TOTAL_TRIALS) {
		errors.push(`Expected ${TOTAL_TRIALS} trials, got ${trials.length}`);
	}

	// Count No-Go trials
	const noGoTrials = trials.filter((t) => t.isNoGo);
	const noGoCount = noGoTrials.length;
	
	if (noGoCount < NO_GO_COUNT_MIN || noGoCount > NO_GO_COUNT_MAX) {
		errors.push(
			`Expected ${NO_GO_COUNT_MIN}-${NO_GO_COUNT_MAX} No-Go trials, got ${noGoCount}`
		);
	}

	// Check No-Go trials are not at forbidden edge positions
	noGoTrials.forEach((trial) => {
		if (NO_GO_FORBIDDEN_EDGE_POSITIONS.includes(trial.trialIndex)) {
			errors.push(
				`No-Go trial at forbidden position ${trial.trialIndex} (forbidden: ${NO_GO_FORBIDDEN_EDGE_POSITIONS.join(', ')})`
			);
		}
	});

	// Check no consecutive No-Go trials
	for (let i = 1; i < trials.length; i++) {
		if (trials[i].isNoGo && trials[i - 1].isNoGo) {
			errors.push(
				`Consecutive No-Go trials at positions ${i - 1} and ${i} (not allowed)`
			);
		}
	}

	// Check isNoGo flag matches digit
	trials.forEach((trial) => {
		const expectedNoGo = trial.stimulusDigit === NO_GO_DIGIT;
		if (trial.isNoGo !== expectedNoGo) {
			errors.push(
				`Trial ${trial.trialIndex}: isNoGo flag (${trial.isNoGo}) does not match digit ${trial.stimulusDigit}`
			);
		}
	});

	return {
		valid: errors.length === 0,
		errors
	};
}
