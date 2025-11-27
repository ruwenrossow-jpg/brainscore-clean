# Animations v1 – BrainrotAI

**Single Source of Truth für alle Animationen und Motion-Design**

> **Referenz-Status:** MASTER  
> **Code-Pendant:** `src/lib/animations/motion.ts`, `src/app.css` (Animation-Layer)  
> **Letzte Aktualisierung:** 2025-01-26

---

## 1. Animation-Philosophie

### Design-Prinzipien

BrainrotAI-Animationen folgen diesen Grundsätzen:

1. **Subtil > Auffällig**  
   - Animationen unterstützen, lenken aber nicht ab
   - Keine wilden Bounces oder Rotationen

2. **Schnell & Smooth**  
   - Durations: 150–600ms (je nach Kontext)
   - Kurze Micro-Interactions (Hover: 150–200ms)

3. **Natural Motion**  
   - Ease-Out für die meisten Transitions (schneller Start, langsames Ausrollen)
   - Cubic-Bezier für organische Bewegungen

4. **Functional, not Decorative**  
   - Jede Animation hat einen Zweck (Feedback, Guidance, State-Change)
   - Keine Loops ohne Grund (außer Loading-Spinner)

5. **Accessibility-Aware**  
   - Respect `prefers-reduced-motion` (Zukunft)
   - Keine flackernden/blinkenden Effekte (Epilepsie-Prävention)

---

## 2. Timing & Durations

### Standard-Durations

| Duration | Einsatzzweck | Beispiele |
|----------|--------------|-----------|
| **150ms** | Micro-Interactions | Hover-Color-Changes, Icon-Highlights |
| **200ms** | Text-Änderungen | Link-Hover, Text-Opacity |
| **300ms** | UI-Element-Transitions | Button-Hover, Card-Shadow, Background-Changes |
| **500ms** | Content-Fade-In | Cards beim Page-Load, Success-Messages |
| **600ms** | Hero-Animationen | Slide-Up von Headlines, Large-Scale-Entries |

### Timing-Functions

```css
/* Standard: Ease-Out (schneller Start, langsames Ende) */
transition: all 0.3s ease-out;

/* Smooth-Bounce: Organische Bewegung (z.B. Hero-Slide-Up) */
transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

/* Linear: Nur für Progress-Bars */
transition: width 0.5s linear;
```

**Verwendung:**
- **ease-out:** Default für 90 % aller Animationen
- **cubic-bezier(0.16, 1, 0.3, 1):** Hero-Content, wichtige State-Changes
- **linear:** Progress-Bars, Loading-Animations

---

## 3. Standard-Animationen

### 3.1 Fade-In

**Einsatz:**
- Cards beim Dashboard-Load
- Success-Messages nach Form-Submission
- Tutorial-Callouts

**Keyframes:**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
```

**Delay für gestaffelte Animationen:**
```html
<div class="animate-fadeIn" style="animation-delay: 0.1s;"></div>
<div class="animate-fadeIn" style="animation-delay: 0.2s;"></div>
<div class="animate-fadeIn" style="animation-delay: 0.3s;"></div>
```

### 3.2 Slide-Up

**Einsatz:**
- Hero-Headlines auf Landing-Page
- Result-Cards nach Test-Completion
- Wichtige Announcements

**Keyframes:**
```css
@keyframes slideUp {
  0% { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.animate-slideUp {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

**Parameter:**
- Start-Offset: `20px` (subtil, kein großer Jump)
- Timing: `cubic-bezier(0.16, 1, 0.3, 1)` (Smooth-Bounce)

### 3.3 Hover-Lift (Buttons)

**Einsatz:**
- Primary Buttons
- Cards (optional)

**CSS:**
```css
.btn-gradient-primary {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}

.btn-gradient-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.35);
}

.btn-gradient-primary:active {
  transform: scale(0.95);
}
```

**Parameter:**
- Lift-Distance: `-4px` (Y-Achse nach oben)
- Active-Scale: `0.95` (5 % kleiner beim Klick)

### 3.4 Scale-Hover (Secondary Buttons)

**Einsatz:**
- Secondary Buttons
- Icon-Buttons

**CSS:**
```css
.btn-secondary {
  transition: transform 0.3s ease-out;
}

.btn-secondary:hover {
  transform: scale(1.05);
}

.btn-secondary:active {
  transform: scale(0.98);
}
```

**Parameter:**
- Hover-Scale: `1.05` (5 % größer)
- Active-Scale: `0.98` (2 % kleiner)

### 3.5 Shadow-Intensify (Cards)

**Einsatz:**
- Cards beim Hover
- Interactive Tiles

**CSS:**
```css
.card-modern {
  transition: box-shadow 0.3s ease-out;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-modern:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}
```

---

## 4. Spezialisierte Animationen

### 4.1 SART-Test Stimulus Fade

**Einsatz:**
- Einblenden der Ziffer (Stimulus)
- Einblenden der Maske

**Eigenschaften:**
```css
.stimulus-fade-in {
  animation: fadeIn 0.15s ease-out;
}
```

**Rationale:**
- Extrem kurz (150ms), da Test-Timing kritisch
- Kein Slide, nur Fade (keine Bewegung → weniger ablenkend)

### 4.2 Result-Score Reveal

**Einsatz:**
- BrainScore-Anzeige nach Test

**Animation:**
```css
@keyframes scoreReveal {
  0% { 
    transform: scale(0.8); 
    opacity: 0; 
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% { 
    transform: scale(1); 
  }
}

.score-reveal {
  animation: scoreReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

**Parameter:**
- Start-Scale: `0.8` (80 %)
- Overshoot: `1.05` (5 % größer bei 60 %)
- End-Scale: `1.0` (normal)

### 4.3 Ampel-Puls (Status Badge)

**Einsatz:**
- Optional: Pulsieren der Ampel bei schlechtem Score (< 50)

**Animation:**
```css
@keyframes badgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.badge-pulse {
  animation: badgePulse 2s ease-in-out infinite;
}
```

**Regel:**
- **NUR bei kritischen Zuständen** (z.B. "Fehler", "Warnung")
- **Nie dauerhaft**, nur für 3–5 Sekunden
- Kann mit `animation-iteration-count: 3;` begrenzt werden

### 4.4 Progress-Bar Fill

**Einsatz:**
- Onboarding-Fortschritt
- Test-Completion-Indicator

**CSS:**
```css
.progress-bar-fill {
  transition: width 0.5s linear;
}
```

**Rationale:**
- Linear, nicht Ease-Out (gleichmäßige Geschwindigkeit)
- 500ms für smooth, aber nicht zu langsam

---

## 5. Onboarding-Spezifika

### 5.1 Step-Transition

**Einsatz:**
- Wechsel zwischen Onboarding-Steps

**Animation:**
```css
/* Ausgehender Step */
.step-exit {
  animation: fadeOut 0.3s ease-out forwards;
}

/* Eingehender Step */
.step-enter {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.1s; /* Warten, bis alter Step weg ist */
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

### 5.2 Progress-Dots

**Einsatz:**
- Onboarding-Fortschrittsanzeige (Dots)

**Animation:**
```css
.progress-dot {
  transition: all 0.3s ease-out;
}

.progress-dot.active {
  background: #000000;
  transform: scale(1.2);
}

.progress-dot.inactive {
  background: #e5e7eb;
  transform: scale(1);
}
```

---

## 6. Dashboard-Animationen

### 6.1 Card-Staggered-Fade-In

**Einsatz:**
- Dashboard-Cards beim Page-Load

**Implementation (Svelte):**
```svelte
{#each cards as card, i}
  <div class="animate-fadeIn" style="animation-delay: {i * 0.1}s;">
    {@render cardContent(card)}
  </div>
{/each}
```

**Delay-Intervall:** 100ms (0.1s) pro Card

### 6.2 Chart-Bar Grow-In

**Einsatz:**
- Daily-Trend-Chart Bars

**Animation:**
```css
@keyframes barGrowIn {
  0% { transform: scaleY(0); transform-origin: bottom; }
  100% { transform: scaleY(1); }
}

.chart-bar {
  animation: barGrowIn 0.5s ease-out forwards;
}
```

**Staggered Delay:**
```html
<div class="chart-bar" style="animation-delay: {index * 0.05}s;"></div>
```

---

## 7. Interaktive Elemente

### 7.1 Button-States

**State-Transitions:**
```css
button {
  transition: all 0.3s ease-out;
}

/* Hover */
button:hover {
  transform: translateY(-2px); /* Subtiler als Primary (4px) */
}

/* Active (Pressed) */
button:active {
  transform: scale(0.95);
  transition-duration: 0.1s; /* Schneller für direktes Feedback */
}

/* Focus (Keyboard) */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3);
  transition: box-shadow 0.2s ease-out;
}
```

### 7.2 Link-Hover

**CSS:**
```css
a {
  color: #7C3AED;
  transition: color 0.2s ease-out;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color 0.2s ease-out;
}

a:hover {
  color: #6D28D9;
  text-decoration-color: currentColor;
}
```

**Parameter:**
- Duration: 200ms (kürzer als Buttons)
- Underline-Offset: 4px (Abstand zum Text)

### 7.3 Form-Field Focus

**CSS:**
```css
input, textarea {
  transition: all 0.2s ease-out;
  border: 2px solid #e5e7eb;
}

input:focus, textarea:focus {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
```

---

## 8. Loading-States

### 8.1 Spinner (DaisyUI)

**HTML:**
```html
<span class="loading loading-spinner loading-lg text-brand-purple"></span>
```

**Größen:**
- `loading-sm`: 16px
- `loading-md`: 24px (Default)
- `loading-lg`: 32px

### 8.2 Skeleton-Loader (Zukunft)

**Konzept:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 9. Error & Success Feedback

### 9.1 Success-Toast

**Animation:**
```css
/* Slide-In from Top */
@keyframes toastSlideIn {
  0% { 
    transform: translateY(-100%); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.toast-success {
  animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### 9.2 Error-Shake

**Einsatz:**
- Form-Felder bei Validation-Error

**Animation:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-shake {
  animation: shake 0.4s ease-in-out;
}
```

---

## 10. Accessibility

### 10.1 `prefers-reduced-motion`

**Implementation (Zukunft):**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Rationale:**
- User mit Motion-Sensitivität (Epilepsie, Vestibular Disorders) können Animationen deaktivieren
- Animationen werden auf 0.01ms verkürzt (= instant)

### 10.2 Flicker-Prevention

**Regel:**
- Keine Animationen < 3 Hz (< 3 Blitze/Sekunde)
- Keine roten Flashes (Epilepsie-Trigger)

---

## 11. Performance-Richtlinien

### 11.1 Hardware-Accelerated Properties

**Verwende NUR diese Properties für Animationen:**
- `transform` (translateX, translateY, scale, rotate)
- `opacity`

**Vermeide:**
- `width`, `height` (Layout-Reflows)
- `top`, `left` (Layout-Shifts)
- `background-position` (außer Shimmer-Effects)

### 11.2 `will-change` (Sparsam einsetzen)

**Nur für kritische Animationen:**
```css
.performance-critical {
  will-change: transform, opacity;
}
```

**Nach Animation entfernen:**
```js
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

---

## 12. Code-Conventions

### 12.1 Tailwind-Utilities

**Bevorzuge Tailwind, wo möglich:**
```html
<!-- ✅ Gut -->
<div class="transition-all duration-300 hover:scale-105">

<!-- ❌ Vermeiden (außer Custom-Keyframes) -->
<div style="transition: all 0.3s; transform: scale(1.05);">
```

### 12.2 Custom-Keyframes

**Definiere in `app.css`:**
```css
@layer utilities {
  @keyframes customAnimation {
    /* ... */
  }
  .animate-custom {
    animation: customAnimation 0.5s ease-out;
  }
}
```

### 12.3 Inline-Delays

**Für Staggered-Animationen:**
```html
<div class="animate-fadeIn" style="animation-delay: {index * 0.1}s;"></div>
```

---

## 13. Verbotene Patterns

❌ **Keine Infinite-Loops ohne Zweck**
```css
/* Schlecht */
.wobble {
  animation: wobble 2s infinite;
}
```

❌ **Keine Auto-Playing-Carousels**
- Ablenkend, accessibility-feindlich

❌ **Keine Parallax-Effects**
- Performance-intensiv, motion-sickness-inducing

❌ **Keine wilden Rotationen**
```css
/* Schlecht */
.spin-360 {
  transform: rotate(360deg);
}
```

---

## 14. Referenzen

**Ergänzende Masterdokumente:**
- `docs/master/design-system.md` - Farben, Typografie, Komponenten
- `docs/master/overview.md` - System-Übersicht

**Code-Pendants:**
- `src/lib/animations/motion.ts` - TypeScript-Animation-Utils (Zukunft)
- `src/app.css` - Keyframe-Definitionen

**Externe Ressourcen:**
- [Material Design Motion](https://m3.material.io/styles/motion/overview)
- [Apple HIG - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

---

**Version:** 1.0.0  
**Status:** MASTER (Single Source of Truth)  
**Maintainer:** BrainrotAI Core Team  
**Letzte Review:** 2025-01-26
