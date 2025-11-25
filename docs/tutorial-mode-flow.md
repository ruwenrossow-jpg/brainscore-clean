# Tutorial-Modus Flow Chart

## Onboarding → Tutorial → Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────┤
│ Step 0: Welcome Intro                                       │
│ Step 1: Name eingeben                                       │
│ Step 2: Ziele auswählen (max 3)                            │
│ Step 3: Kontexte & Zeiten                                  │
│ Step 4: Registrierung (E-Mail/Passwort)                    │
│ Step 5: PWA-Tutorial                                        │
│ Step 6: ┌─────────────────────────────────────┐           │
│         │ "Test-Tutorial ausprobieren" Button │           │
│         │ "Tutorial überspringen" Link         │           │
│         └─────────────────────────────────────┘           │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
                  │ Tutorial              │ Überspringen
                  ▼                       ▼
        ┌─────────────────────┐  ┌─────────────────┐
        │  /test/tutorial     │  │   /dashboard    │
        └─────────────────────┘  └─────────────────┘
                  │
                  │
                  ▼
```

## Tutorial Route Flow

```
┌─────────────────────────────────────────────────────────────┐
│              /test/tutorial (keine DB)                      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Ampel-Countdown (TrafficLightCountdown.svelte)          │
│    ├─ Rot (1s): "Bereit machen..."                         │
│    ├─ Gelb (1s): "Gleich geht's los..."                    │
│    └─ Grün (1s): "Los! 🚀"                                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Tutorial-Test (TutorialSartTest.svelte)                 │
│    10 Trials, 800ms Stimulus, 1200ms Mask                  │
└─────────────────────────────────────────────────────────────┘
        │
        ├─ PHASE 1: Intro (Trial 0-1)
        │   ├─ Overlay: "Klicke auf 'Reagieren' wenn du eine Zahl siehst"
        │   ├─ Animierter Pfeil ↓ zeigt auf Button
        │   └─ Ring um Button (highlight)
        │
        ├─ PHASE 2: First No-Go (Trial 2)
        │   ├─ VOR Stimulus: "Gleich kommt eine 3 – NICHT klicken!"
        │   ├─ Stimulus: 3 (rot gefärbt)
        │   └─ NACH Stimulus:
        │       ├─ Wenn NICHT geklickt: ✓ "Genau so – bei der 3 lässt du das Feld los!"
        │       └─ Wenn geklickt: "Im echten Test wäre das ein Fehler..."
        │
        └─ PHASE 3: Remaining (Trial 3-9)
            └─ Overlay: "Super! So läuft auch der echte Test – nur etwas schneller."
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Demo-Score Berechnung (in Memory)                          │
│ correctResponses / totalTrials × 100 = demoScore           │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Result Guide (TutorialResultGuide.svelte)               │
│    3 Callouts mit Step-Navigation                          │
└─────────────────────────────────────────────────────────────┘
        │
        ├─ CALLOUT 1: Score-Erklärung
        │   ├─ Demo-Score anzeigen (0-100)
        │   ├─ Badge "1" (animate-pulse)
        │   └─ "💡 Hier siehst du später deinen BrainScore..."
        │
        ├─ CALLOUT 2: Verlauf-Preview
        │   ├─ Mock 14-Tage-Chart
        │   ├─ Badge "2" (animate-pulse)
        │   └─ "📈 Hier kannst du später sehen, wie sich dein Fokus entwickelt..."
        │
        └─ CALLOUT 3: Screentime-Karte
            ├─ Mock Screentime-Daten (3h 24min, 47× entsperrt)
            ├─ Badge "3" (animate-pulse)
            └─ "📱 Hier trägst du nach jedem Test deine Handynutzung ein..."
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ "Verstanden – Zum Dashboard" Button                        │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              /dashboard                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ "Starte deinen ersten Test" Card                        ││
│ │ → /test (Production Mode, 60 Trials, DB-Persistierung) ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Komponenten-Hierarchie

```
/test/tutorial/+page.svelte
├─ Back-Button (oben links, immer sichtbar)
│  └─ onclick: goto('/dashboard')
│
└─ {#if currentStep === 'test'}
   ├─ TutorialSartTest.svelte
   │  ├─ TrafficLightCountdown.svelte (Ampel-Countdown)
   │  └─ Tutorial-Overlays (Intro, No-Go Warning, Remaining)
   │     ├─ Phase-basierte Textanzeige
   │     ├─ Animierter Pfeil (Phase 1)
   │     ├─ Button-Ring (Phase 1)
   │     └─ No-Go Feedback (Phase 2)
   │
   └─ {#if currentStep === 'guide'}
      └─ TutorialResultGuide.svelte
         ├─ Demo-Score Display
         ├─ 3 Callouts (nummerierte Badges)
         │  ├─ Callout 1: Score-Erklärung
         │  ├─ Callout 2: Verlauf-Preview (Mock Chart)
         │  └─ Callout 3: Screentime-Karte (Mock Daten)
         └─ Navigation (Zurück/Weiter/Verstanden/Zum Dashboard)
```

## State-Management

### Tutorial Test State

```typescript
// TutorialSartTest.svelte
type TestState = 'countdown' | 'running' | 'finished';
type TutorialPhase = 'intro' | 'first-nogo' | 'remaining';

let testState: TestState = 'countdown';
let tutorialPhase: TutorialPhase = 'intro';
let showNoGoWarning = false;
let noGoFeedback: 'correct' | 'incorrect' | null = null;

// State-Transitions:
countdown → running (Phase: intro)
  → Trial 0-1: intro Phase
  → Trial 2: first-nogo Phase (showNoGoWarning = true)
  → Trial 3-9: remaining Phase
  → finished → onComplete(demoScore)
```

### Tutorial Guide State

```typescript
// TutorialResultGuide.svelte
let currentCallout = 0; // 0, 1, 2
const totalCallouts = 3;

// Navigation:
nextCallout() → currentCallout++
prevCallout() → currentCallout--
finishTutorial() → goto('/dashboard')
```

### Tutorial Route State

```typescript
// /test/tutorial/+page.svelte
type TutorialStep = 'test' | 'guide';

let currentStep: TutorialStep = 'test';
let demoScore: number = 0;

// Flow:
'test' → handleTestComplete(score) → currentStep = 'guide'
'guide' → finishTutorial() → goto('/dashboard')
```

## Config-Vergleich

| Parameter            | Production (BRAINROT_SART_CONFIG) | Tutorial (TUTORIAL_SART_CONFIG) |
|---------------------|-----------------------------------|--------------------------------|
| Trials              | 60                                | 10                             |
| Stimulus Duration   | 500ms                             | 800ms (+60%)                   |
| Mask Duration       | 900ms                             | 1200ms (+33%)                  |
| Total Trial Duration| 1400ms                            | 2000ms                         |
| No-Go Count         | 7-8 (randomized)                  | 2 (fixed positions 2 & 5)      |
| Trial Sequence      | Generated (random)                | Fixed [2,7,3,5,8,3,1,6,9,4]    |
| DB Persistence      | ✓ (sart_sessions)                 | ✗ (Demo-Modus)                 |
| Test Duration       | ~84s (1min 24s)                   | ~20s                           |

## Overlay-Texte

### Phase 1: Intro (Trial 0-1)
```
┌─────────────────────────────────────────────────────────────┐
│ Klicke auf "Reagieren" wenn du eine Zahl siehst - außer    │
│ bei der 3!                                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ (animate-bounce)
┌─────────────────────────────────────────────────────────────┐
│                     [ Reagieren ]                           │
│                 (ring-4 ring-brand-purple/50)               │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: First No-Go (Trial 2)

**VOR Stimulus:**
```
┌─────────────────────────────────────────────────────────────┐
│ Gleich kommt eine 3 – bei ihr klickst du NICHT!           │
│ (bg-blue-50 border-blue-300 animate-pulse)                 │
└─────────────────────────────────────────────────────────────┘
```

**NACH Stimulus (korrekt):**
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Genau so – bei der 3 lässt du das Feld los!             │
│ (bg-green-50 border-green-300)                             │
└─────────────────────────────────────────────────────────────┘
```

**NACH Stimulus (inkorrekt):**
```
┌─────────────────────────────────────────────────────────────┐
│ Im echten Test wäre das ein Fehler. Es geht aber nicht um │
│ Perfektion, sondern um deinen Zustand.                    │
│ (bg-yellow-50 border-yellow-300)                           │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Remaining (Trial 3)
```
┌─────────────────────────────────────────────────────────────┐
│ Super! So läuft auch der echte Test – nur etwas schneller. │
│ (bg-blue-50 border-blue-300)                               │
└─────────────────────────────────────────────────────────────┘
```

## Callout-Inhalte

### Callout 1: Score
```
┌─────────────────────────────────────────────────────────────┐
│ [1] (badge animate-pulse)                                   │
│                                                             │
│ 💡 Dein BrainScore                                          │
│                                                             │
│ Hier siehst du später deinen BrainScore (0–100).           │
│ Höher = stabilerer Fokus in diesem Moment.                 │
│ Der Score schwankt je nach Tagesform, Müdigkeit und        │
│ Kontext.                                                    │
└─────────────────────────────────────────────────────────────┘
```

### Callout 2: Verlauf
```
┌─────────────────────────────────────────────────────────────┐
│ [2] (badge animate-pulse)                                   │
│                                                             │
│ 📈 Verlauf über Tage                                        │
│                                                             │
│ Hier kannst du später sehen, wie sich dein Fokus über      │
│ mehrere Tage entwickelt.                                    │
│ Du erkennst Muster: Welche Tageszeiten sind besser?        │
│ Wie wirkt sich Schlaf aus?                                 │
└─────────────────────────────────────────────────────────────┘
```

### Callout 3: Screentime
```
┌─────────────────────────────────────────────────────────────┐
│ [3] (badge animate-pulse)                                   │
│                                                             │
│ 📱 Screentime-Eingabe                                       │
│                                                             │
│ Hier trägst du nach jedem Test kurz deine Handynutzung    │
│ ein.                                                        │
│ Das hilft dir, Muster zu erkennen (z.B. "Nach 4h Handy     │
│ sinkt mein Score") und liefert wertvolle Daten für         │
│ unsere Forschung.                                           │
└─────────────────────────────────────────────────────────────┘
```

## Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding Step 6                                           │
│ "Test-Tutorial ausprobieren" Button                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ async () => {                                               │
│   await completeOnboarding(); // Profile speichern         │
│   if (!isSaving) goto('/test/tutorial');                   │
│ }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ /test/tutorial/+page.svelte                                 │
│ currentStep = 'test'                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ TutorialSartTest.svelte                                     │
│ ├─ trials = TUTORIAL_SART_CONFIG.FIXED_SEQUENCE            │
│ ├─ Run 10 trials with overlays                             │
│ └─ demoScore = (correct / total) × 100                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ onComplete(demoScore)                                       │
│ ├─ currentStep = 'guide'                                   │
│ └─ window.scrollTo({ top: 0 })                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ TutorialResultGuide.svelte                                  │
│ ├─ demoScore anzeigen                                      │
│ ├─ 3 Callouts mit Navigation                               │
│ └─ "Zum Dashboard" Button                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ finishTutorial()                                            │
│ goto('/dashboard')                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ /dashboard                                                  │
│ User kann echten Test starten (goto('/test'))              │
└─────────────────────────────────────────────────────────────┘
```

## Keine DB-Persistierung

**Tutorial-Modus:**
- ✗ Keine `sart_sessions` Einträge
- ✗ Keine `screentime_reports` Einträge
- ✗ Keine `daily_scores` Berechnung
- ✗ Keine `profiles.last_test_at` Updates

**Production-Modus (/test):**
- ✓ `sart_sessions` mit brain_score
- ✓ `screentime_reports` nach Digital Check-in
- ✓ `daily_scores` auto-sync
- ✓ `profiles.last_test_at` update

## User Journey

```
1. Neuer User: Onboarding durchlaufen
   └─ Step 0-5: Name, Ziele, Kontexte, Registrierung, PWA
   
2. Step 6: "Test-Tutorial ausprobieren" klicken
   └─ completeOnboarding() → Profil gespeichert ✓
   
3. Tutorial-Test (10 Trials, ~20 Sekunden)
   ├─ "Aha, so funktioniert der Test!"
   ├─ "Bei der 3 nicht klicken – verstanden!"
   └─ Demo-Score: 80 / 100
   
4. Result-Guide (3 Callouts, ~30 Sekunden)
   ├─ "Der Score zeigt meinen Fokus"
   ├─ "Ich kann den Verlauf über Tage sehen"
   └─ "Screentime-Eingabe hilft Muster zu erkennen"
   
5. Dashboard: Bereit für ersten echten Test
   └─ "Starte deinen ersten Test" → /test (Production Mode)
```

## Abbruch-Szenarien

### Während Tutorial-Test
```
User klickt "Abbrechen" (oben links)
  → goto('/dashboard')
  → Kein Datenverlust (Tutorial ist Demo)
  → User kann Tutorial wiederholen (Dashboard Link?)
```

### Während Result-Guide
```
User klickt "Abbrechen" (oben links)
  → goto('/dashboard')
  → Kein Datenverlust
```

### Onboarding: "Tutorial überspringen"
```
User klickt "Tutorial überspringen – direkt zum Dashboard"
  → goToDashboard()
  → completeOnboarding() → Profil gespeichert ✓
  → goto('/dashboard')
```

## Performance

| Metrik                | Wert        |
|-----------------------|-------------|
| Tutorial-Dauer        | ~50s        |
| - Countdown           | 3s          |
| - Test (10 Trials)    | ~20s        |
| - Result-Guide        | ~30s        |
| Component Size        | ~15KB total |
| - TutorialSartTest    | ~6KB        |
| - TutorialResultGuide | ~5KB        |
| - Route               | ~2KB        |
| Bundle Impact         | +15KB       |
| No DB calls           | 0           |

## Accessibility

- ✓ Keyboard-Navigation (Tab, Enter)
- ✓ Touch-Targets ≥44×44px (iOS HIG)
- ✓ Kontrast WCAG AA (4.5:1)
- ✓ Responsive (375px - 1920px)
- ⚠ Screen-Reader: Overlays könnten verbessert werden (aria-live?)

## Mobile Optimierung

```css
/* Responsive Breakpoints */
text-sm       /* Mobile: 14px */
md:text-base  /* Tablet: 16px */
lg:text-lg    /* Desktop: 18px */

h-12          /* Mobile: 48px Button */
md:h-14       /* Tablet: 56px Button */

p-4           /* Mobile: 16px Padding */
md:p-6        /* Tablet: 24px Padding */
```

## Browser-Support

- ✓ Safari iOS 13+ (iPhone 6s+)
- ✓ Chrome Android 90+
- ✓ Safari macOS (Desktop)
- ✓ Chrome/Edge Desktop
- ⚠ Firefox (nicht getestet)
