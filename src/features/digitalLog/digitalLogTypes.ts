/**
 * Digital Log Types
 * 
 * Kategorienbasiertes ScreenTime-Tracking nach dem Brainrot-Test
 * Keine exakten Zahlen, nur schnelle 3-Tap-Eingabe
 */

export type ScreenTimeBucket = '0-30' | '30-60' | '60-120' | '120plus';

export type MainCategory =
  | 'social'      // Social / Chats
  | 'video'       // Video / Streaming
  | 'games'       // Games
  | 'work'        // Lernen / Arbeit / Uni
  | 'other';      // Sonstiges

export type PickupFrequency =
  | 'low'         // Selten (1–5x)
  | 'medium'      // Gelegentlich (6–15x)
  | 'high'        // Oft (16–40x)
  | 'veryHigh';   // Fast ständig (40x+)

// NEU: Subjektiver mentaler Zustand
export type SubjectiveState =
  | 'clear'       // Sehr klar / fokussiert
  | 'medium'      // Mittel
  | 'distracted'; // Zerstreut / müde

// NEU: Test-Kontext Tags
export type ContextTag =
  | 'after_learning'      // Nach dem Lernen
  | 'after_scrolling'     // Nach langem Scrollen
  | 'before_sleep'        // Vor dem Schlafen
  | 'at_work_uni'         // In der Uni / bei der Arbeit
  | 'on_the_go'          // Unterwegs / zwischendurch
  | 'other';             // Sonstiges (+ custom_context)

export interface DigitalLog {
  id?: string;
  testId: string;
  screenTimeBucket: ScreenTimeBucket;
  mainCategories: MainCategory[];  // max. 2 Einträge
  pickupFrequency: PickupFrequency;
  contextTags?: ContextTag[];      // NEU: Test-Kontext (optional)
  subjectiveState?: SubjectiveState; // NEU: Mentaler Zustand (optional)
  customContext?: string;           // NEU: Freitext bei "Sonstiges"
  createdAt?: string; // ISO-String, wird auf Server gesetzt
}

// UI Labels für bessere UX
export const SCREEN_TIME_LABELS: Record<ScreenTimeBucket, string> = {
  '0-30': '0–30 Min',
  '30-60': '30–60 Min',
  '60-120': '60–120 Min',
  '120plus': 'Mehr als 2 Std'
};

export const CATEGORY_LABELS: Record<MainCategory, { label: string; icon: string }> = {
  social: { label: 'Social / Chats', icon: 'forum' },
  video: { label: 'Video / Streaming', icon: 'play_circle' },
  games: { label: 'Games', icon: 'sports_esports' },
  work: { label: 'Lernen / Arbeit / Uni', icon: 'school' },
  other: { label: 'Sonstiges', icon: 'more_horiz' }
};

export const PICKUP_FREQUENCY_LABELS: Record<PickupFrequency, { label: string; description: string }> = {
  low: { label: 'Selten', description: '1–5x' },
  medium: { label: 'Gelegentlich', description: '6–15x' },
  high: { label: 'Oft', description: '16–40x' },
  veryHigh: { label: 'Fast ständig', description: '40x+' }
};

// NEU: Context Tag Labels
export const CONTEXT_TAG_LABELS: Record<ContextTag, { label: string; icon: string }> = {
  after_learning: { label: 'Nach dem Lernen', icon: 'school' },
  after_scrolling: { label: 'Nach langem Scrollen', icon: 'swipe_vertical' },
  before_sleep: { label: 'Vor dem Schlafen', icon: 'bedtime' },
  at_work_uni: { label: 'In der Uni / bei der Arbeit', icon: 'work' },
  on_the_go: { label: 'Unterwegs / zwischendurch', icon: 'directions_walk' },
  other: { label: 'Sonstiges', icon: 'more_horiz' }
};

// NEU: Subjective State Labels
export const SUBJECTIVE_STATE_LABELS: Record<SubjectiveState, { label: string; emoji: string }> = {
  clear: { label: 'Sehr klar / fokussiert', emoji: '✨' },
  medium: { label: 'Mittel', emoji: '😐' },
  distracted: { label: 'Zerstreut / müde', emoji: '😵‍💫' }
};
