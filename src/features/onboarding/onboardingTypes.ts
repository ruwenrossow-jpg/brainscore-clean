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

export type TimeSlot = 
  | '06:00' | '07:00' | '08:00' | '09:00' | '10:00' | '11:00'
  | '12:00' | '13:00' | '14:00' | '15:00' | '16:00' | '17:00'
  | '18:00' | '19:00' | '20:00' | '21:00' | '22:00';

export interface TrackingContext {
  id: string;
  label: string;
  slot: TimeSlot;
  fixedTime: string; // "06:00" - "22:00"
}

export interface OnboardingState {
  selectedGoals: UserGoal[];
  trackingContexts: TrackingContext[];
  completed: boolean;
}

// Time slot options with labels
export const TIME_SLOT_OPTIONS: Array<{ value: TimeSlot; label: string }> = [
  { value: '06:00', label: '06:00 Uhr (Früh morgens)' },
  { value: '07:00', label: '07:00 Uhr (Morgens)' },
  { value: '08:00', label: '08:00 Uhr (Morgens)' },
  { value: '09:00', label: '09:00 Uhr (Vormittags)' },
  { value: '10:00', label: '10:00 Uhr (Vormittags)' },
  { value: '11:00', label: '11:00 Uhr (Vormittags)' },
  { value: '12:00', label: '12:00 Uhr (Mittags)' },
  { value: '13:00', label: '13:00 Uhr (Mittags)' },
  { value: '14:00', label: '14:00 Uhr (Nachmittags)' },
  { value: '15:00', label: '15:00 Uhr (Nachmittags)' },
  { value: '16:00', label: '16:00 Uhr (Nachmittags)' },
  { value: '17:00', label: '17:00 Uhr (Nachmittags)' },
  { value: '18:00', label: '18:00 Uhr (Abends)' },
  { value: '19:00', label: '19:00 Uhr (Abends)' },
  { value: '20:00', label: '20:00 Uhr (Abends)' },
  { value: '21:00', label: '21:00 Uhr (Abends)' },
  { value: '22:00', label: '22:00 Uhr (Spät abends)' }
] as const;

// Predefined context suggestions
export const CONTEXT_SUGGESTIONS = [
  'Vor dem Lernen',
  'Nach Social Media',
  'Abends vor dem Schlafen',
  'Nach dem Sport',
  'Morgens nach dem Aufwachen'
] as const;

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


