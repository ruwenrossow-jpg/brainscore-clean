# Tutorial-Modus Dokumentation

## Übersicht

Der Tutorial-Modus ist ein geführter Demo-Test, der neuen Nutzern am Ende des Onboardings die SART-Test-Mechanik erklärt, ohne echte Daten zu persistieren.

## Ziele

1. **Verständnis fördern**: Nutzer verstehen sofort, was sie tun sollen
2. **Unsicherheit reduzieren**: "Es ist kein Test, den man versagen kann"
3. **UI-Orientierung**: Erklärt Score, Verlauf und Screentime-Eingabe
4. **Niedrigschwelliger Einstieg**: Keine Angst vor dem ersten Test

## Architektur

### 1. Konfiguration (`brainrotSartConfig.ts`)

```typescript
export type SartMode = 'tutorial' | 'production';

export const TUTORIAL_SART_CONFIG = {
  TOTAL_TRIALS: 10,              // 10 statt 60 (kurz & überschaubar)
  STIMULUS_DURATION_MS: 800,     // 800ms statt 500ms (mehr Zeit zum Lesen)
  MASK_DURATION_MS: 1200,        // 1200ms statt 900ms (mehr Pause)
  FIXED_SEQUENCE: [2, 7, 3, 5, 8, 3, 1, 6, 9, 4], // Feste Sequenz
  NO_GO_INDICES: [2, 5],         // Trial 2 & 5 sind No-Go (3)
};
```

**Warum feste Sequenz?**
- Konsistente UX: Alle Nutzer erleben die gleiche Tutorial-Erfahrung
- Vorhersehbare Overlays: "Gleich kommt eine 3" funktioniert immer
- Einfachere QA: Tutorial ist reproduzierbar

### 2. Tutorial-Test (`TutorialSartTest.svelte`)

**Flow:**
```
Ampel-Countdown (3s)
  ↓
Trial 0-1: "Klicke auf 'Reagieren' wenn du eine Zahl siehst - außer bei der 3!"
  + Animierter Pfeil nach unten
  + Ring um Button
  ↓
Trial 2: Erste 3
  + VOR Trial: "Gleich kommt eine 3 - bei ihr klickst du NICHT!"
  + NACH Trial (wenn nicht geklickt): "✓ Genau so - bei der 3 lässt du das Feld los!"
  + NACH Trial (wenn geklickt): "Im echten Test wäre das ein Fehler..."
  ↓
Trial 3-9: "Super! So läuft auch der echte Test - nur etwas schneller."
  ↓
Demo-Score berechnen (10 Trials, keine DB)
  ↓
TutorialResultGuide
```

**Tutorial-Phasen:**
1. **Intro** (Trial 0-1): Response-Button erklären mit Highlight
2. **First-NoGo** (Trial 2): No-Go-Mechanik mit Feedback
3. **Remaining** (Trial 3-9): Minimale Führung, Fokus auf Testen

**Komponenten-Features:**
- `tutorialPhase`: State-Machine für Overlays
- `showNoGoWarning`: Zeigt Pre-Trial Warning bei erster 3
- `noGoFeedback`: Zeigt Post-Trial Feedback ('correct' | 'incorrect')
- Demo-Score: Einfache Berechnung (korrekte / total × 100)

### 3. Result-Guide (`TutorialResultGuide.svelte`)

**3 Callouts mit Step-Navigation:**

**Callout 1: Score-Erklärung**
```
💡 Dein BrainScore
Hier siehst du später deinen BrainScore (0–100).
Höher = stabilerer Fokus in diesem Moment.
Der Score schwankt je nach Tagesform, Müdigkeit und Kontext.
```

**Callout 2: Verlauf-Preview**
```
📈 Verlauf über Tage
Hier kannst du später sehen, wie sich dein Fokus über mehrere Tage entwickelt.
Du erkennst Muster: Welche Tageszeiten sind besser? Wie wirkt sich Schlaf aus?
```

**Callout 3: Screentime-Karte**
```
📱 Screentime-Eingabe
Hier trägst du nach jedem Test kurz deine Handynutzung ein.
Das hilft dir, Muster zu erkennen (z.B. "Nach 4h Handy sinkt mein Score")
und liefert wertvolle Daten für unsere Forschung.
```

**Navigation:**
- Nummerierte Badges (1, 2, 3) mit `animate-pulse`
- Dot-Indicators unten (wie Carousel)
- "Zurück" / "Weiter" Buttons
- "Verstanden" / "Zum Dashboard" nach Callout 3

### 4. Route (`/test/tutorial`)

**Flow-Orchestrierung:**
```typescript
let currentStep: 'test' | 'guide';
let demoScore: number;

TutorialSartTest 
  → onComplete(demoScore) 
  → currentStep = 'guide'
  → TutorialResultGuide
  → goto('/dashboard')
```

**Features:**
- Back-Button (oben links): Jederzeit abbrechen → Dashboard
- Keine DB-Persistierung: Demo-Score bleibt im Memory
- Auto-Scroll: `window.scrollTo({ top: 0 })` bei Step-Wechsel

### 5. Onboarding-Integration (`OnboardingWizard.svelte`)

**Step 6 Changes:**

**Alt:**
```svelte
<button onclick={startFirstTest}>
  Ersten Test starten
</button>
```

**Neu:**
```svelte
<button onclick={async () => {
  await completeOnboarding();
  if (!isSaving) goto('/test/tutorial');
}}>
  <span class="material-symbols-outlined">school</span>
  Test-Tutorial ausprobieren
</button>

<p class="text-xs">
  Das Tutorial erklärt dir Schritt für Schritt, wie der Test funktioniert.
  Deine Ergebnisse werden nicht gespeichert.
</p>

<button onclick={goToDashboard}>
  Tutorial überspringen – direkt zum Dashboard
</button>
```

**Flow:**
```
Onboarding Step 6 → "Test-Tutorial ausprobieren"
  ↓
completeOnboarding() (Profil speichern, Contexts in Store)
  ↓
goto('/test/tutorial')
  ↓
TutorialSartTest (10 Trials, Overlays)
  ↓
TutorialResultGuide (3 Callouts)
  ↓
goto('/dashboard')
  ↓
Nutzer sieht Dashboard, kann echten Test starten
```

## Design-Entscheidungen

### Warum kein echter Test im Onboarding?

**Problem:**
- Onboarding-Tests haben hohe Abbruchrate (Nutzer verstehen nicht, was zu tun ist)
- Erste Testergebnisse sind oft schlecht (Lernkurve) → demotivierend
- Screentime-Eingabe verwirrt ("Wofür ist das?")

**Lösung:**
- Tutorial erklärt Mechanik ohne Druck
- Demo-Score ist "zum Lernen", nicht "zum Bewerten"
- UI-Walkthrough zeigt Mehrwert (Verlauf, Insights)

### Warum 10 Trials statt 60?

- **Kurz**: Nutzer verliert nicht die Geduld
- **Überschaubar**: Tutorial soll nicht länger als 60 Sekunden dauern
- **Fokus auf Learning**: Nicht auf akkurate Messung

### Warum feste Trial-Sequenz?

- **Konsistenz**: Alle Nutzer erleben gleiche Tutorial-Qualität
- **Vorhersehbarkeit**: Overlays funktionieren zuverlässig
- **QA**: Tutorial ist testbar und reproduzierbar

### Warum keine DB-Persistierung?

- **Klarheit**: "Das ist ein Demo" → keine echten Daten
- **Fairness**: Tutorial-Score würde Dashboard verfälschen
- **Motivation**: Erster echter Test ist "der erste Test"

## UI/UX Guidelines

### Overlays

**Farben:**
- Tutorial-Info: `bg-blue-50 border-blue-300` (Blau = "Lernmodus")
- No-Go Correct: `bg-green-50 border-green-300`
- No-Go Incorrect: `bg-yellow-50 border-yellow-300` (nicht rot = kein "Fehler")

**Animationen:**
- Intro-Pfeil: `animate-bounce` (zieht Blick auf Button)
- Button-Ring: `ring-4 ring-brand-purple/50 ring-offset-4`
- Callout-Badges: `animate-pulse`

**Typografie:**
- Overlay-Text: `text-sm md:text-base font-bold`
- Min. 14px auf Mobile (WCAG AA)
- Kontrast: 4.5:1 (Blau/Grün/Gelb auf Weiß)

### Touch-Targets

- Response-Button: `h-24` (96px) ✓ >44px iOS HIG
- Back-Button: `.touch-target` class (44×44px)
- Callout-Navigation: `btn-sm` aber min. 44px

### Mobile-Optimierung

- Overlays: `p-4` (nicht zu groß auf kleinen Screens)
- Demo-Chart: `h-24` (kompakt aber lesbar)
- Text: Responsive `text-sm md:text-base`

## Testing Checklist

### Funktional

- [ ] Tutorial startet von Onboarding Step 6
- [ ] Ampel-Countdown funktioniert (3 Sekunden)
- [ ] Trial 0-1: Intro-Overlay + Pfeil sichtbar
- [ ] Trial 2: No-Go-Warning VOR Stimulus
- [ ] Trial 2: Feedback NACH Stimulus (korrekt/inkorrekt)
- [ ] Trial 3-9: "So läuft der echte Test" sichtbar
- [ ] Demo-Score wird berechnet (0-100)
- [ ] TutorialResultGuide zeigt Score
- [ ] 3 Callouts navigierbar (Zurück/Weiter)
- [ ] "Zum Dashboard" Button funktioniert
- [ ] Keine DB-Einträge (sart_sessions, screentime_reports)

### UX

- [ ] Tutorial-Badge "Demo-Modus" immer sichtbar
- [ ] Back-Button "Abbrechen" oben links funktioniert
- [ ] Overlays lesbar auf iPhone SE (375px)
- [ ] Touch-Targets ≥44×44px
- [ ] Kontrast WCAG AA (4.5:1)
- [ ] Keine Scrollbars während Test
- [ ] Auto-Scroll zwischen Steps smooth

### Edge Cases

- [ ] Back-Button während Tutorial → Dashboard (kein Datenverlust)
- [ ] Tutorial wiederholen möglich? (Dashboard → Tutorial-Link?)
- [ ] Tutorial überspringen → direkt Dashboard funktioniert
- [ ] Mehrfach-Klick auf Response-Button (debouncing?)

## Zukünftige Erweiterungen

### Optional: Tutorial im Dashboard

```svelte
<!-- dashboard/+page.svelte -->
<div class="alert alert-info">
  <span>Neu hier? Probiere das Tutorial aus!</span>
  <button onclick={() => goto('/test/tutorial')}>
    Tutorial starten
  </button>
</div>
```

### Optional: Tutorial-Progress speichern

```typescript
// profiles table
tutorial_completed: boolean;
tutorial_completed_at: timestamp;
```

→ Dashboard zeigt Tutorial-Link nur wenn `!tutorial_completed`

### Optional: Erweiterte Overlays

- **Reaction-Time Feedback**: "Das war schnell!" / "Nimm dir Zeit"
- **Commission-Error Hinweis**: "3 erkannt – gut gemacht!"
- **Adaptive Tempo**: Wenn Nutzer struggle → noch langsamer

### Optional: Tutorial-Skip mit Confirm

```svelte
{#if !tutorialCompleted}
  <button onclick={() => {
    if (confirm('Tutorial überspringen? Wir empfehlen es für neue Nutzer.')) {
      goto('/dashboard');
    }
  }}>
    Überspringen
  </button>
{/if}
```

## Bekannte Limitierungen

1. **Keine Response-Time Validation**: Tutorial trackt RT, aber nutzt sie nicht für Feedback
2. **Feste Sequenz**: Kann langweilig werden bei Wiederholung (derzeit nicht relevant)
3. **Keine Accessibility-Overlays**: Screen-Reader-Support für Overlays verbesserbar
4. **Kein Dark-Mode**: Tutorial-Overlays nutzen fixed colors (hellblau/grün/gelb)

## Maintenance

**Bei Config-Änderungen:**
- TUTORIAL_SART_CONFIG in Sync mit BRAINROT_SART_CONFIG halten
- FIXED_SEQUENCE muss valide sein (No-Go an Position 2 & 5)

**Bei UI-Changes:**
- Overlay-Farben: Design-Guide checken
- Touch-Targets: iOS HIG compliance (≥44×44px)
- Typografie: Min. 14px auf Mobile

**Bei Flow-Changes:**
- Onboarding-Integration testen (Step 6 → Tutorial → Dashboard)
- Back-Navigation testen (alle Abbruch-Punkte)
- Demo-Score Berechnung validieren (0-100 Skala)

## Ressourcen

- **Config**: `src/features/brainrotTest/brainrotSartConfig.ts`
- **Test**: `src/lib/components/sart/TutorialSartTest.svelte`
- **Guide**: `src/lib/components/sart/TutorialResultGuide.svelte`
- **Route**: `src/routes/test/tutorial/+page.svelte`
- **Onboarding**: `src/features/onboarding/OnboardingWizard.svelte`
- **Design-Guide**: `docs/design-guide.md` (für Farben, Typografie, Touch-Targets)
