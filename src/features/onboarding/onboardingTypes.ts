/**
 * Onboarding Types
 * 
 * Type definitions for onboarding flow:
 * - User goals selection
 * - Tracking contexts configuration
 * - Time slot mapping
 */

export type UserGoal =
  | 'focus'
  | 'impulsivity'
  | 'fatigue'
  | 'performanceAwareness'
  | 'unsure';

export interface TrackingContext {
  id: string;
  label: string;
  time: string; // "HH:MM" im 24h-Format, 15-Minuten-Raster
}

export interface OnboardingState {
  selectedGoals: UserGoal[];
  trackingContexts: TrackingContext[];
  completed: boolean;
}

// Predefined context suggestions with default times
export const CONTEXT_SUGGESTIONS_WITH_TIMES = [
  { label: 'Vor dem Lernen / Arbeiten', defaultTime: '08:00' },
  { label: 'Nach Social Media / Scrollen', defaultTime: '12:00' },
  { label: 'Nach der Uni / Arbeit', defaultTime: '17:00' },
  { label: 'Abends vor dem Schlafen', defaultTime: '21:30' }
] as const;

// Legacy: Simple label list for backward compatibility
export const CONTEXT_SUGGESTIONS = CONTEXT_SUGGESTIONS_WITH_TIMES.map(c => c.label);

// User goal labels
export const USER_GOAL_LABELS: Record<UserGoal, { label: string; description: string }> = {
  focus: {
    label: 'Fokus verbessern',
    description: 'Konzentration und Aufmerksamkeit steigern'
  },
  impulsivity: {
    label: 'Impulsivität kontrollieren',
    description: 'Bessere Selbstkontrolle entwickeln'
  },
  fatigue: {
    label: 'Ermüdung erfassen',
    description: 'Energielevel über den Tag verstehen'
  },
  performanceAwareness: {
    label: 'Performance-Bewusstsein',
    description: 'Leistungsfähigkeit tracken und optimieren'
  },
  unsure: {
    label: 'Unsicher / Explorativ',
    description: 'Einfach ausprobieren und entdecken'
  }
} as const;


