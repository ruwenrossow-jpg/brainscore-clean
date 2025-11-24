/**
 * Onboarding State Management
 * 
 * Svelte store for onboarding wizard state:
 * - Selected user goals
 * - Configured tracking contexts
 * - Completion status
 */

import { writable } from 'svelte/store';
import type { OnboardingState, UserGoal, TrackingContext } from './onboardingTypes';

const STORAGE_KEY = 'brainscore_onboarding_completed';

// Initial state
const initialState: OnboardingState = {
  selectedGoals: [],
  trackingContexts: [],
  completed: false
};

// Create writable store
const onboardingStore = writable<OnboardingState>(initialState);

/**
 * Onboarding Store with helper methods
 */
export const onboarding = {
  subscribe: onboardingStore.subscribe,

  /**
   * Set selected goals (max 3)
   */
  setGoals(goals: UserGoal[]) {
    if (goals.length > 3) {
      console.warn('Maximum 3 goals allowed, truncating to first 3');
      goals = goals.slice(0, 3);
    }
    onboardingStore.update(state => ({ ...state, selectedGoals: goals }));
  },

  /**
   * Add a tracking context (max 3)
   */
  addContext(context: TrackingContext) {
    onboardingStore.update(state => {
      if (state.trackingContexts.length >= 3) {
        console.warn('Maximum 3 tracking contexts allowed');
        return state;
      }
      return {
        ...state,
        trackingContexts: [...state.trackingContexts, context]
      };
    });
  },

  /**
   * Update a tracking context
   */
  updateContext(id: string, updates: Partial<TrackingContext>) {
    onboardingStore.update(state => ({
      ...state,
      trackingContexts: state.trackingContexts.map(ctx =>
        ctx.id === id ? { ...ctx, ...updates } : ctx
      )
    }));
  },

  /**
   * Remove a tracking context
   */
  removeContext(id: string) {
    onboardingStore.update(state => ({
      ...state,
      trackingContexts: state.trackingContexts.filter(ctx => ctx.id !== id)
    }));
  },

  /**
   * Mark onboarding as completed
   */
  complete() {
    onboardingStore.update(state => ({ ...state, completed: true }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  },

  /**
   * Check if onboarding was completed
   */
  isCompleted(): boolean {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  },

  /**
   * Reset onboarding state (for testing)
   */
  reset() {
    onboardingStore.set(initialState);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};
