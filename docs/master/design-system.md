# Design-System v1 – BrainrotAI

**Single Source of Truth für alle visuellen und UI-Entscheidungen**

> **Referenz-Status:** MASTER  
> **Code-Pendant:** `src/lib/design/tokens.ts`, `src/lib/components/ui/*`  
> **Letzte Aktualisierung:** 2025-01-26

---

## 1. Design-Prinzipien

### Core-Philosophie
BrainrotAI ist **wissenschaftlich fundiert, ruhig und fokussiert**. Das Design folgt diesen Prinzipien:

1. **Wissenschaftlich, nicht verspielt**  
   - Keine Gamification-Elemente, keine infantilisierenden Metaphern
   - Klare, direkte Kommunikation

2. **Fokus > Ablenkung**  
   - Minimalistisches Interface, kein visuelles Rauschen
   - Icons nur wo absolut sinnvoll (keine Emojis im App-UI)

3. **Accessibility First**  
   - WCAG AA-Kontraste (min. 4.5:1)
   - Touch-Targets min. 44×44px
   - Sichtbare Focus-States für Tastatur-Navigation

4. **Apple HIG-Inspiration**  
   - Rounded Corners, subtile Shadows
   - Smooth Animations (150–300ms)
   - Clarity in Typography

5. **Brand-Konsistenz**  
   - Landingpage-Ästhetik durchgängig in der App
   - Purple als Brand-Farbe, Schwarz für Kontrast

---

## 2. Farb-System

### Primärfarbe: Brand Purple

```css
--brand-purple: #7C3AED;
--brand-purple-hover: #6D28D9;
--brand-purple-dark: #5B21B6;
```

**Einsatz:**
- Primäre CTAs (Buttons, Links)
- Aktive Zustände (Selected, Focus)
- Fortschrittsbalken, Icons
- Akzent in Headlines (Gradient)

### Sekundärfarben

```css
/* Success & Status */
--brand-green: #10B981;    /* "Sehr gut", positive Trends */

/* Warnings & Alerts */
--brand-warning: #fbbf24;  /* Mittlere Scores, Hinweise */
--brand-error: #ef4444;    /* Fehler, kritische Werte */

/* Neutrals */
--brand-dark: #0f0f0f;     /* Footer, Secondary Buttons */
--brand-black: #000000;    /* Text, Icons */
```

### Graustufen (Semantic)

```css
--gray-900: #1a1a1a;  /* Primary Text */
--gray-600: #6b7280;  /* Secondary Text (WCAG AA compliant) */
--gray-500: #9ca3af;  /* Tertiary Text, disabled states */
--gray-400: #9ca3af;  /* Subtle icons */
--gray-200: #e5e7eb;  /* Borders, Dividers */
--gray-100: #f3f4f6;  /* Subtle Backgrounds */
--gray-50:  #f9fafb;  /* Card Backgrounds */
```

### Kontrast-Anforderungen

| Kombination | Kontrast | Status |
|-------------|----------|--------|
| gray-900 auf white | 12.6:1 | ✅ AAA |
| gray-600 auf white | 7.2:1  | ✅ AA  |
| brand-purple auf white | 5.1:1 | ✅ AA |
| white auf brand-purple | 5.1:1 | ✅ AA |

---

## 3. Typografie

### Schriftfamilie

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
```

### Hierarchie & Größen

| Stufe | Tailwind-Klasse | Größe | Weight | Line-Height | Einsatzzweck |
|-------|----------------|-------|--------|-------------|--------------|
| H1    | `text-4xl md:text-6xl` | 36px / 60px | 900 (Black) | 1.1 | Hero Headlines |
| H2    | `text-3xl md:text-4xl` | 30px / 36px | 900 (Black) | 1.2 | Section Headers |
| H3    | `text-2xl md:text-3xl` | 24px / 30px | 700 (Bold) | 1.3 | Subsection Headers |
| H4    | `text-xl md:text-2xl` | 20px / 24px | 700 (Bold) | 1.4 | Card Titles |
| Body Large | `text-lg` | 18px | 400 | 1.625 | Intro-Text, wichtige Erklärungen |
| Body | `text-base` | 16px | 400 | 1.625 | Standard-Text |
| Body Small | `text-sm` | 14px | 500 (Medium) | 1.5 | Labels, Descriptions |
| Caption | `text-xs` | 12px | 500 (Medium) | 1.4 | Timestamps, Hints |

### Text-Gradients

```css
/* Hero Gradient (Purple → Pink) */
.text-gradient-hero {
  background: linear-gradient(to right, #7C3AED, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Purple Gradient (für Scores) */
.text-gradient-purple {
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Karten-Typen (Cards)

### 4.1 Primary Metric Card

**Zweck:** Anzeige des aktuellen BrainScore (Dashboard-Hauptkarte)

**Layout:**
```
┌─────────────────────────────────┐
│  [Icon] AKTUELLER BRAINSCORE    │
│                                 │
│         78                      │  ← Gradient Purple, 8xl
│    ──────────────               │  ← Subtle Divider
│    Status: Konzentriert         │  ← Badge (green)
│                                 │
│  [CTA: Neuen Test starten]      │
└─────────────────────────────────┘
```

**Eigenschaften:**
- Background: `bg-white`
- Border: `border border-gray-100`
- Radius: `rounded-2xl` (16px)
- Shadow: `shadow-xl`
- Padding: `p-8`
- Hover: `hover:shadow-2xl` (optional)

### 4.2 Secondary Metric Card

**Zweck:** Anzeige kognitiver Bausteine (Inhibition, Vigilance, Consistency)

**Layout:**
```
┌──────────────────────┐
│  Impulskontrolle     │  ← H4
│  (Inhibition)        │  ← Caption
│                      │
│  82                  │  ← Large Score
│  ↑ +5 vs. Durchsch.  │  ← Trend Indicator
└──────────────────────┘
```

**Eigenschaften:**
- Identisch zu Primary, aber kompakter
- Padding: `p-6`
- Optional: Color-Coding basierend auf Metrik

### 4.3 Form Card

**Zweck:** Screentime-Eingabe, Kontextauswahl, Check-ins

**Layout:**
```
┌─────────────────────────────────┐
│  Wie viel Bildschirmzeit?       │  ← H4
│  (Ungefähr, letzte 4h)          │  ← Description
│                                 │
│  [Option 1] [Option 2] [...]    │  ← Buttons (Pills)
│                                 │
│  [Weiter →]                     │  ← Primary CTA
└─────────────────────────────────┘
```

**Eigenschaften:**
- Gleiche Basis wie Primary Metric Card
- Innenabstände für Form-Elemente: `space-y-4`

### 4.4 List Card (Logbuch)

**Zweck:** Einzelne Test-Session im Logbuch

**Layout:**
```
┌─────────────────────────────────┐
│  78  │  Mi, 25. Jan 2025        │
│      │  20:30 Uhr               │
│      │  [Badge: Nach Social]    │
└─────────────────────────────────┘
```

**Eigenschaften:**
- Kompakt: `p-4`
- Grid-Layout: Score | Metadata
- Border: `border-b` statt volle Border (Listenkontext)

### 4.5 Onboarding Card

**Zweck:** Info-Screens + Auswahl im Onboarding

**Eigenschaften:**
- Maximale Breite: `max-w-2xl` (672px)
- Zentriert: `mx-auto`
- Extra Padding: `p-10` (größere Innenabstände)

---

## 5. Buttons & CTAs

### 5.1 Primary Button

**Klasse:** `.btn-gradient-primary`

**Eigenschaften:**
```css
/* Tailwind-Äquivalent */
@apply bg-brand-purple hover:bg-purple-800 text-white font-bold;
@apply py-4 px-8 rounded-full;
@apply shadow-xl shadow-purple-button hover:shadow-purple-button-hover;
@apply transform hover:-translate-y-1;
@apply transition-all duration-300;
@apply min-h-[44px];
```

**Einsatz:**
- Hauptaktionen: "Test starten", "Weiter", "Speichern"
- Immer nur 1× pro Screen (visuelle Hierarchie)

**Beispiel:**
```html
<button class="btn-gradient-primary w-full text-lg font-bold">
  Test starten
  <span class="ml-2">→</span>
</button>
```

### 5.2 Secondary Button

**Klasse:** `.btn-secondary`

**Eigenschaften:**
```css
@apply bg-black text-white px-5 py-2 rounded-full text-sm font-bold;
@apply hover:bg-gray-800 hover:scale-105;
@apply transition-all duration-300;
@apply shadow-lg;
@apply min-h-[44px];
```

**Einsatz:**
- Sekundäre Aktionen: "Nochmal testen", "Kalender hinzufügen"
- Kann mehrfach pro Screen vorkommen

### 5.3 Ghost Button

**Klasse:** `.btn-ghost`

**Eigenschaften:**
```css
@apply bg-transparent border-2 border-gray-200 text-gray-700;
@apply hover:border-brand-purple hover:text-brand-purple;
@apply rounded-xl px-4 py-2;
@apply transition-all duration-200;
@apply min-h-[44px];
```

**Einsatz:**
- Optionale Aktionen: "Überspringen", "Abbrechen"
- Toggles, Filter

### 5.4 Link-Style Button (Tertiary)

**Eigenschaften:**
```css
@apply text-sm text-gray-500 hover:text-gray-700;
@apply transition-colors duration-200;
@apply underline-offset-2 hover:underline;
```

**Einsatz:**
- "Später nachtragen", "Mehr erfahren", "Überspringen"

---

## 6. Navigationsleisten & Layouts

### 6.1 Onboarding Navigation Bar

**Komponente:** `OnboardingNavBar.svelte`

**Layout:**
```
┌─────────────────────────────────┐
│  [← Zurück]  [Progress]  [Weiter →] │
└─────────────────────────────────┘
```

**Eigenschaften:**
- Position: `fixed bottom-0`
- Background: `bg-white`
- Border: `border-t border-gray-200`
- Safe-Area: `pb-safe` (iOS)
- Height: `h-20` (80px inkl. Padding)

### 6.2 Dashboard Header (Glassmorphism)

**Klasse:** `.nav-glass`

**Eigenschaften:**
```css
@apply fixed w-full z-50;
@apply bg-white/90 backdrop-blur-sm;
@apply border-b border-gray-100;
```

**Layout:**
```
┌─────────────────────────────────┐
│  BrainScore  [User]  [Settings] │
└─────────────────────────────────┘
```

### 6.3 Mobile Layout-Prinzipien

- **Container-Padding:** `px-4 sm:px-6 lg:px-8`
- **Max-Width:** `max-w-4xl mx-auto` (Dashboard-Content)
- **Section-Spacing:** `space-y-6` (24px zwischen Cards)
- **Safe-Areas:** Immer `pwa-safe-screen` Klasse verwenden

---

## 7. Charts & Visualisierung

### 7.1 Daily Trend Chart (14-Tage-Verlauf)

**Typ:** Vertikale Balken (Bar Chart)

**Eigenschaften:**
- **Bar-Farben (BrainScore-basiert):**
  - `< 50`: `bg-red-500` (Rot)
  - `50–69`: `bg-yellow-400` (Gelb)
  - `≥ 70`: `bg-brand-green` (Grün)
- **Bar-Radius:** `rounded-t-lg` (oben rund, unten gerade)
- **Bar-Höhe:** Max. 200px, responsive
- **Hover:** `hover:opacity-80 transition-opacity`
- **Spacing:** `gap-1 md:gap-2` zwischen Bars

**Datum-Display:**
```css
text-[10px] md:text-xs text-gray-500
```
(⚠️ Ausnahme von Token-Regel, da extreme Kompaktheit nötig)

### 7.2 Ampel-Indikator (Status Badge)

**Farb-Mapping:**
- **Sehr gut (≥70):** `bg-brand-green`
- **Okay (50–69):** `bg-yellow-400 text-gray-900`
- **Verbesserungsfähig (<50):** `bg-red-500`

**Klasse:** `.badge-status`

---

## 8. Icons

### Icon Library
**Material Symbols Outlined** (Google)

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">
```

### Häufige Icons

| Icon-Name | Einsatzzweck |
|-----------|--------------|
| `check_circle` | Success, Completed |
| `school` | Education, Onboarding |
| `psychology` | Brain, Cognitive Metrics |
| `rocket_launch` | Start Test |
| `calendar_month` | ICS Export |
| `arrow_forward` | Next, CTA |
| `arrow_back` | Back Navigation |
| `info` | Tooltips, Hilfe |
| `close` | Dismiss, Modal Close |

### Icon-Größen

```css
text-base   /* 16px - Extra Small */
text-lg     /* 18px - Small */
text-2xl    /* 24px - Medium (Standard) */
text-3xl    /* 30px - Large */
text-4xl    /* 36px - Extra Large */
```

### Icon-Container

```html
<div class="icon-container">
  <span class="material-symbols-outlined text-brand-purple text-2xl">
    psychology
  </span>
</div>
```

**Klasse:** `.icon-container`
```css
@apply bg-brand-purple/10 p-3 rounded-full;
@apply flex items-center justify-center;
```

---

## 9. Animationen & Transitions

### 9.1 Durations (Timing)

| Dauer | Einsatz |
|-------|---------|
| `150ms` | Micro-Interactions (Hover-Color) |
| `200ms` | Links, Text-Änderungen |
| `300ms` | Buttons, Cards (Standard) |
| `500ms` | Fade-In (Content) |
| `600ms` | Slide-Up (Hero) |

### 9.2 Timing Functions

```css
/* Standard */
transition: all 0.3s ease-out;

/* Smooth Bounce */
transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
```

### 9.3 Standard-Animationen

**Fade-In:**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
```

**Slide-Up:**
```css
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

**Hover-Lift (Buttons):**
```css
transform: translateY(-4px);
```

### 9.4 Animation-Richtlinien

- **Keine wilden Bounces** (außer subtile Hover-Lifts)
- **Keine Infinite-Loops** (außer Loading-Spinner)
- **Respect `prefers-reduced-motion`** (später implementieren)

---

## 10. Accessibility (A11y)

### 10.1 Touch-Targets

**Minimum:** 44×44px für alle interaktiven Elemente

```css
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}
```

### 10.2 Focus-States

**Standard für alle interaktiven Elemente:**
```css
focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
```

### 10.3 Alt-Texte & ARIA

- Icons ohne begleitenden Text: `aria-label` setzen
- Buttons: Immer aussagekräftiger Text (kein "Klick hier")
- Links: Beschreibend (kein "Mehr" ohne Kontext)

### 10.4 Kontraste (WCAG AA)

Alle Text/Hintergrund-Kombinationen erfüllen **min. 4.5:1** (siehe Farb-System).

---

## 11. PWA-Spezifika

### 11.1 Safe Areas (iOS)

```css
.pwa-safe-screen {
  min-height: 100vh;
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 11.2 Bottom Navigation (iOS)

**Problem:** Home-Indicator überlappt Buttons

**Lösung:**
```css
.bottom-nav {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

## 12. Responsive Breakpoints

| Breakpoint | Tailwind | Pixelwert | Einsatz |
|------------|----------|-----------|---------|
| Mobile (Default) | - | < 768px | Basis (Mobile First) |
| Tablet | `md:` | ≥ 768px | Größere Typografie, Side-by-Side |
| Desktop | `lg:` | ≥ 1024px | Multi-Column-Layouts |

**Beispiel:**
```html
<h1 class="text-4xl md:text-5xl lg:text-6xl">Headline</h1>
```

---

## 13. Abweichungen von Standardregeln

### Erlaubte Hardcoded-Werte

**Fall:** Extreme Kompaktheit erforderlich (Chart-Labels, Timestamps)

**Beispiel:**
```html
<div class="text-[10px] md:text-xs">25. Jan</div>
```

**Regel:** IMMER dokumentieren als Kommentar:
```html
<!-- Ausnahme: Chart-Label benötigt 10px für mobile Kompaktheit -->
<div class="text-[10px] md:text-xs">25. Jan</div>
```

---

## 14. Referenzen

**Ergänzende Masterdokumente:**
- `docs/master/test-logic.md` - SART-Test & BrainScore
- `docs/master/animations.md` - Detaillierte Animation-Specs
- `docs/master/overview.md` - System-Übersicht

**Code-Pendants:**
- `src/lib/design/tokens.ts` - TypeScript-Tokens
- `src/lib/components/ui/*` - UI-Primitives
- `tailwind.config.ts` - Tailwind-Tokens

---

**Version:** 1.0.0  
**Status:** MASTER (Single Source of Truth)  
**Maintainer:** BrainrotAI Core Team  
**Letzte Review:** 2025-01-26
