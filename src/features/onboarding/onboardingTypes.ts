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

export interface TestContextPreset {
  label: string;
  defaultTime: string;
  icon?: string;
}

export interface OnboardingState {
  selectedGoals: UserGoal[];
  trackingContexts: TrackingContext[];
  completed: boolean;
}

// Predefined context suggestions with default times
export const CONTEXT_SUGGESTIONS_WITH_TIMES = [
  { label: 'Morgens direkt nach dem Aufwachen', defaultTime: '07:00', icon: 'wb_sunny' },
  { label: 'Vor dem Lernen / Arbeiten', defaultTime: '08:30', icon: 'school' },
  { label: 'Nach intensiver Bildschirmzeit', defaultTime: '11:00', icon: 'devices' },
  { label: 'Nach Social Media / Scrollen', defaultTime: '12:30', icon: 'smartphone' },
  { label: 'Nach dem Mittagessen', defaultTime: '14:00', icon: 'restaurant' },
  { label: 'Nachmittags nach der Uni / Arbeit', defaultTime: '17:00', icon: 'work' },
  { label: 'Nach dem Sport / Training', defaultTime: '18:30', icon: 'fitness_center' },
  { label: 'Abends vor dem Schlafen', defaultTime: '21:30', icon: 'bedtime' },
  { label: 'Vor wichtigen Aufgaben / Prüfungen', defaultTime: '09:00', icon: 'task_alt' },
  { label: 'Nach längeren Pausen / Freizeit', defaultTime: '16:00', icon: 'free_breakfast' }
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


