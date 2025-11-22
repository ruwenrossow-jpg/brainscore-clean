/**
 * Brainrot-SART Short v1 - Trial Generation Engine
 * 
 * Handles trial sequence generation according to the block structure defined in
 * docs/brainrot-sart-short-v1_brainscore-v1.md
 * 
 * Block Structure:
 * - 10 blocks of 9 trials each
 * - Each block contains all digits 1-9 exactly once (randomized order)
 * - Exactly 1 No-Go trial per block (digit = 3)
 * - No-Go digit must NOT appear at positions 0 or 8 within the block
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md
 */

import { BRAINROT_SART_CONFIG, type StimulusDigit } from './brainrotSartConfig';

export interface BrainrotSartTrial {
	trialIndex: number; // 0-89
	blockIndex: number; // 0-9
	positionInBlock: number; // 0-8
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
 * Generates a single block of 9 trials with the following constraints:
 * - Contains all digits 1-9 exactly once
 * - No-Go digit (3) is NOT at positions 0 or 8
 * 
 * @param blockIndex The index of the block (0-9)
 * @returns Array of 9 trials
 */
function generateBlock(blockIndex: number): BrainrotSartTrial[] {
	const { STIMULUS_DIGITS, NO_GO_DIGIT, NO_GO_FORBIDDEN_POSITIONS, TRIALS_PER_BLOCK } =
		BRAINROT_SART_CONFIG;

	let validSequence = false;
	let sequence: StimulusDigit[] = [];

	// Keep shuffling until No-Go digit is not at forbidden positions
	while (!validSequence) {
		sequence = shuffleArray([...STIMULUS_DIGITS]);
		const noGoPosition = sequence.indexOf(NO_GO_DIGIT as StimulusDigit);
		validSequence = !NO_GO_FORBIDDEN_POSITIONS.includes(noGoPosition);
	}

	// Convert to trial objects
	return sequence.map((digit, positionInBlock) => ({
		trialIndex: blockIndex * TRIALS_PER_BLOCK + positionInBlock,
		blockIndex,
		positionInBlock,
		stimulusDigit: digit,
		isNoGo: digit === NO_GO_DIGIT
	}));
}

/**
 * Generates the complete trial sequence for Brainrot-SART Short v1
 * 
 * @returns Array of 90 trials (10 blocks × 9 trials)
 */
export function generateBrainrotSartTrials(): BrainrotSartTrial[] {
	const { TOTAL_BLOCKS } = BRAINROT_SART_CONFIG;
	const allTrials: BrainrotSartTrial[] = [];

	for (let blockIndex = 0; blockIndex < TOTAL_BLOCKS; blockIndex++) {
		const blockTrials = generateBlock(blockIndex);
		allTrials.push(...blockTrials);
	}

	return allTrials;
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
	const { TOTAL_TRIALS, TOTAL_BLOCKS, TRIALS_PER_BLOCK, NO_GO_DIGIT, NO_GO_FORBIDDEN_POSITIONS } =
		BRAINROT_SART_CONFIG;

	// Check total trial count
	if (trials.length !== TOTAL_TRIALS) {
		errors.push(`Expected ${TOTAL_TRIALS} trials, got ${trials.length}`);
	}

	// Check each block
	for (let blockIndex = 0; blockIndex < TOTAL_BLOCKS; blockIndex++) {
		const blockTrials = trials.slice(
			blockIndex * TRIALS_PER_BLOCK,
			(blockIndex + 1) * TRIALS_PER_BLOCK
		);

		// Check block size
		if (blockTrials.length !== TRIALS_PER_BLOCK) {
			errors.push(`Block ${blockIndex}: Expected ${TRIALS_PER_BLOCK} trials, got ${blockTrials.length}`);
			continue;
		}

		// Check all digits 1-9 appear exactly once
		const digits = blockTrials.map((t) => t.stimulusDigit);
		const uniqueDigits = new Set(digits);
		if (uniqueDigits.size !== TRIALS_PER_BLOCK) {
			errors.push(`Block ${blockIndex}: Digits are not unique`);
		}

		// Check exactly one No-Go per block
		const noGoTrials = blockTrials.filter((t) => t.isNoGo);
		if (noGoTrials.length !== 1) {
			errors.push(`Block ${blockIndex}: Expected 1 No-Go trial, got ${noGoTrials.length}`);
		} else {
			// Check No-Go is not at forbidden positions
			const noGoPosition = blockTrials.findIndex((t) => t.isNoGo);
			if (NO_GO_FORBIDDEN_POSITIONS.includes(noGoPosition)) {
				errors.push(
					`Block ${blockIndex}: No-Go at forbidden position ${noGoPosition} (must not be at ${NO_GO_FORBIDDEN_POSITIONS.join(' or ')})`
				);
			}
		}

		// Check isNoGo flag matches digit
		blockTrials.forEach((trial, idx) => {
			const expectedNoGo = trial.stimulusDigit === NO_GO_DIGIT;
			if (trial.isNoGo !== expectedNoGo) {
				errors.push(
					`Block ${blockIndex}, position ${idx}: isNoGo flag (${trial.isNoGo}) does not match digit ${trial.stimulusDigit}`
				);
			}
		});
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
