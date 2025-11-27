/**
 * Brainrot-SART Short v1 - Test Configuration
 * 
 * Referenz: docs/master/test-logic.md (ehemals brainrot-sart-short-v1_brainscore-v1.md)
 * Abschnitt: "3. Testarchitektur: Brainrot-SART Short v1"
 * 
 * This configuration defines all parameters for the Brainrot-SART Short v1 cognitive test
 * as specified in docs/master/test-logic.md
 * 
 * Key Parameters:
 * - 60 trials total (continuous sequence, no visible blocks)
 * - Stimulus duration: 500ms (product decision, differs from classic SART's 250ms)
 * - Mask duration: 900ms (aligned with standard SART)
 * - Total trial duration: 1400ms
 * - No-Go digit: 3 (7-8 occurrences, ≈11-13% of trials)
 * - No-Go constraints: no consecutive No-Go pairs, not in first/last 2 trials
 * - Go digits: 1, 2, 4-9 randomly distributed
 * 
 * @see docs/brainrot-sart-short-v1_brainscore-v1.md Section 3.2
 */

/**
 * SART Mode - Controls whether test is tutorial or production
 */
export type SartMode = 'tutorial' | 'production';

export const BRAINROT_SART_CONFIG = {
	// Test structure
	TOTAL_TRIALS: 60,
	
	// Optional segmentation for analysis (6 segments × 10 trials)
	SEGMENTS: 6,
	TRIALS_PER_SEGMENT: 10,

	// Timing (in milliseconds)
	STIMULUS_DURATION_MS: 500, // Product decision: 500ms instead of classic 250ms
	MASK_DURATION_MS: 900, // Standard SART mask duration
	TOTAL_TRIAL_DURATION_MS: 1400,

	// Stimuli
	STIMULUS_DIGITS: [1, 2, 3, 4, 5, 6, 7, 8, 9] as const,
	GO_DIGITS: [1, 2, 4, 5, 6, 7, 8, 9] as const,
	NO_GO_DIGIT: 3,

	// No-Go constraints
	NO_GO_COUNT_MIN: 7, // Minimum No-Go trials per test
	NO_GO_COUNT_MAX: 8, // Maximum No-Go trials per test
	NO_GO_FORBIDDEN_EDGE_POSITIONS: [0, 1, 58, 59], // First 2 and last 2 trials cannot be No-Go
	
	// Valid trial threshold for DisciplineScore
	MIN_VALID_TRIAL_RATIO: 0.8
};

/**
 * Tutorial Mode Configuration
 * Slower, shorter version for onboarding with step-by-step guidance
 */
export const TUTORIAL_SART_CONFIG = {
	// Test structure
	TOTAL_TRIALS: 10, // Short demo: 10 trials instead of 60
	
	// Timing (slower for learning)
	STIMULUS_DURATION_MS: 800, // 800ms instead of 500ms (more time to read)
	MASK_DURATION_MS: 1200, // 1200ms instead of 900ms (more breathing room)
	TOTAL_TRIAL_DURATION_MS: 2000,

	// Stimuli (same as production)
	STIMULUS_DIGITS: [1, 2, 3, 4, 5, 6, 7, 8, 9] as const,
	GO_DIGITS: [1, 2, 4, 5, 6, 7, 8, 9] as const,
	NO_GO_DIGIT: 3,

	// Tutorial-specific: Fixed trial sequence for consistent UX
	// Trial sequence: [2, 7, 3, 5, 8, 3, 1, 6, 9, 4]
	// Position 2 (3rd trial) and 5 (6th trial) are No-Go
	FIXED_SEQUENCE: [2, 7, 3, 5, 8, 3, 1, 6, 9, 4],
	NO_GO_INDICES: [2, 5], // Indices where 3 appears
};

export type StimulusDigit = (typeof BRAINROT_SART_CONFIG.STIMULUS_DIGITS)[number];
