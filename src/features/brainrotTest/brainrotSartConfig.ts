/**
 * Brainrot-SART Short v1 - Test Configuration
 * 
 * This configuration defines all parameters for the Brainrot-SART Short v1 cognitive test
 * as specified in docs/brainrot-sart-short-v1_brainscore-v1.md
 * 
 * Key Parameters:
 * - 90 trials total (10 blocks × 9 trials per block)
 * - Stimulus duration: 500ms (product decision, differs from classic SART's 250ms)
 * - Mask duration: 900ms (aligned with standard SART)
 * - Total trial duration: 1400ms
 * - No-Go digit: 3 (must not appear at block positions 1 or 9)
 * - Each block contains digits 1-9 exactly once in randomized order
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md
 */

export const BRAINROT_SART_CONFIG = {
	// Test structure
	TOTAL_TRIALS: 90,
	TRIALS_PER_BLOCK: 9,
	TOTAL_BLOCKS: 10,

	// Timing (in milliseconds)
	STIMULUS_DURATION_MS: 500,
	MASK_DURATION_MS: 900,
	TOTAL_TRIAL_DURATION_MS: 1400,

	// Stimuli
	STIMULUS_DIGITS: [1, 2, 3, 4, 5, 6, 7, 8, 9] as const,
	NO_GO_DIGIT: 3,

	// Block constraints
	NO_GO_FORBIDDEN_POSITIONS: [0, 8] as readonly number[], // No-Go must not be at first or last position in block

	// Valid trial threshold for DisciplineScore
	MIN_VALID_TRIAL_RATIO: 0.8
};

export type StimulusDigit = (typeof BRAINROT_SART_CONFIG.STIMULUS_DIGITS)[number];
