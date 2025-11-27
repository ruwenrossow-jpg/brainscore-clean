/**
 * Design-Tokens v1
 * 
 * Referenz: docs/master/design-system.md
 * Version: 1.0.0
 * 
 * Diese Datei ist das Code-Pendant zum Design-System-Masterdokument.
 * Alle Farben, Typografie-Tokens, Spacing-Werte und andere Design-Konstanten
 * sind hier zentral definiert und dürfen NICHT in Komponenten hard-coded werden.
 * 
 * Bei Änderungen: ERST Masterdokument updaten, DANN diese Datei.
 */

// ============================================================================
// FARBEN
// Referenz: docs/master/design-system.md, Abschnitt "2. Farb-System"
// ============================================================================

export const COLORS = {
  // Primärfarbe: Brand Purple
  brandPurple: '#7C3AED',
  brandPurpleHover: '#6D28D9',
  brandPurpleDark: '#5B21B6',
  
  // Sekundärfarben
  brandAccent: '#A78BFA',        // Purple Light
  brandDark: '#0f0f0f',          // Footer, Secondary Buttons
  brandBlack: '#000000',         // Text, Icons
  brandGreen: '#10B981',         // Success, Positive Scores
  
  // Statusfarben
  warning: '#fbbf24',            // Yellow
  error: '#ef4444',              // Red
  info: '#7C3AED',               // Same as brandPurple
  
  // Graustufen (Semantic)
  gray900: '#1a1a1a',            // Primary Text (12.6:1 Kontrast)
  gray600: '#6b7280',            // Secondary Text (7.2:1 Kontrast, WCAG AA)
  gray500: '#9ca3af',            // Tertiary Text, Disabled
  gray400: '#9ca3af',            // Subtle Icons
  gray200: '#e5e7eb',            // Borders, Dividers
  gray100: '#f3f4f6',            // Subtle Backgrounds
  gray50: '#f9fafb',             // Card Backgrounds
  
  // Spezial
  white: '#ffffff',
  transparent: 'transparent',
} as const;

// Gradient-Strings (für CSS background-image)
export const GRADIENTS = {
  purple: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
  purpleHover: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
  hero: 'linear-gradient(to right, #7C3AED, #EC4899)',
} as const;

// ============================================================================
// TYPOGRAFIE
// Referenz: docs/master/design-system.md, Abschnitt "3. Typografie"
// ============================================================================

export const TYPOGRAPHY = {
  // Font-Family
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  
  // Font-Sizes (in px, kann in Tailwind über text-[size] genutzt werden)
  fontSize: {
    xs: '12px',        // Caption
    sm: '14px',        // Body Small
    base: '16px',      // Body
    lg: '18px',        // Body Large
    xl: '20px',        // H4
    '2xl': '24px',     // H4
    '3xl': '30px',     // H3
    '4xl': '36px',     // H2
    '5xl': '48px',     // H1 (Tablet)
    '6xl': '60px',     // H1 (Desktop)
  },
  
  // Font-Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  // Line-Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
  
  // Letter-Spacing
  letterSpacing: {
    tighter: '-0.02em',
    normal: '0',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// SPACING
// Referenz: docs/master/design-system.md, Abschnitt "5. Buttons & CTAs"
// ============================================================================

export const SPACING = {
  // Standard-Spacing (Tailwind-kompatibel, in rem)
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  
  // Semantic-Spacing
  cardPadding: '2rem',      // 32px (p-8)
  sectionGap: '1.5rem',     // 24px (space-y-6)
} as const;

// ============================================================================
// SHADOWS
// Referenz: docs/master/design-system.md, Abschnitt "4. Komponenten"
// ============================================================================

export const SHADOWS = {
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  purpleGlow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
  purpleButton: '0 25px 50px -12px rgba(124, 58, 237, 0.15)',
  purpleButtonHover: '0 25px 50px -12px rgba(124, 58, 237, 0.35)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ============================================================================
// BORDER-RADIUS
// Referenz: docs/master/design-system.md, Abschnitt "4. Komponenten"
// ============================================================================

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',    // 2px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px (Cards)
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Rounded-full (Buttons, Pills)
} as const;

// ============================================================================
// ANIMATIONS
// Referenz: docs/master/animations.md, Abschnitt "2. Timing & Durations"
// ============================================================================

export const ANIMATION = {
  // Durations (in ms)
  duration: {
    fast: 150,        // Micro-Interactions
    normal: 300,      // Standard (Buttons, Cards)
    slow: 500,        // Content-Fade-In
    slower: 600,      // Hero-Animations
  },
  
  // Easing-Functions (CSS-Strings)
  easing: {
    easeOut: 'ease-out',
    smoothBounce: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
} as const;

// ============================================================================
// BREAKPOINTS
// Referenz: docs/master/design-system.md, Abschnitt "12. Responsive Breakpoints"
// ============================================================================

export const BREAKPOINTS = {
  mobile: 0,          // Default (Mobile First)
  tablet: 768,        // md: (Tailwind)
  desktop: 1024,      // lg: (Tailwind)
} as const;

// ============================================================================
// MISC
// ============================================================================

export const TOUCH_TARGET = {
  minSize: '44px',    // Minimum Touch-Target (Accessibility)
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  modal: 50,
  navbar: 100,
  toast: 200,
} as const;

// ============================================================================
// TYPES (für TypeScript-Inference)
// ============================================================================

export type ColorKey = keyof typeof COLORS;
export type GradientKey = keyof typeof GRADIENTS;
export type SpacingKey = keyof typeof SPACING;
export type ShadowKey = keyof typeof SHADOWS;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
