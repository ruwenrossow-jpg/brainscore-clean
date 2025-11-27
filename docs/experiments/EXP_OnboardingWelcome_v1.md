# EXP_OnboardingWelcome_v1

**Status:** 🔄 In Progress  
**Branch:** `main` (direkt, kein separater Branch da einfache Änderung)  
**Erstellt:** 28.11.2025  
**Letzte Aktualisierung:** 28.11.2025  
**Verantwortlich:** AI Agent + User Request

---

## 📋 Kontext

**Warum dieses Experiment?**
Aktuell startet das Onboarding direkt mit der Namenseingabe. User verstehen möglicherweise nicht sofort, was BrainrotAI macht und warum sie Tests durchführen sollen. Ein Welcome-Screen kann Kontext geben und Motivation erhöhen.

**Aktueller Stand:**
- Onboarding: 4 Steps (1=Name, 2=Goals, 3=Context+Time, 4=Summary)
- Kein Intro-Screen
- Direkte Namenseingabe nach Start

**Related Experiments:**
- Historischer Welcome-Screen existierte in Commit `51785ba` (WelcomeIntroStep.svelte)
- Wurde im Rollback zu stable-24nov entfernt

---

## 💡 Hypothese(n)

**Haupthypothese:**
Ein einfacher Welcome-Screen am Anfang des Onboardings erhöht das Verständnis und reduziert Abbrüche.

**Annahmen:**
- User lesen kurze, einfache Texte
- Klarer Nutzen motiviert zur Completion
- Design-Konsistenz mit bestehendem Onboarding wichtig

---

## 🔨 Was wird gebaut?

### Scope
**Neue Dateien:**
- `src/features/onboarding/WelcomeIntroStep.svelte` - Vereinfachter Welcome-Screen

**Geänderte Dateien:**
- `src/features/onboarding/OnboardingWizard.svelte` - Integration von Step 0 (Welcome)
  - Änderung: `type Step = 1 | 2 | 3 | 4` → `type Step = 0 | 1 | 2 | 3 | 4`
  - Progress-Indicator: Anpassung von "4 Steps" zu "5 Steps"
  - Start bei Step 0 statt Step 1

**NICHT im Scope:**
- Routing-Änderungen (Landing Page bleibt unverändert)
- Auth-Flow-Änderungen
- Neue zusätzliche Steps nach Welcome

### Technische Details
**Textinhalt (vereinfacht):**
```
Überschrift: "Willkommen bei BrainrotAI"

Körper:
- BrainrotAI hilft dir zu verstehen, wie dein Handy deine Aufmerksamkeit beeinflusst
- Du machst kurze Reaktionstests und gibst danach grob deine Screentime an
- Daraus entsteht ein BrainScore und ein Verlauf über die Zeit
- So erkennst du, wann du konzentriert bist – und wann dein Handy dich eher zerstreut

Keine Emojis, Du-Form, einfache Sprache
```

**Design:**
- Konsistent mit bestehendem Onboarding
- DaisyUI Card-Layout
- Progress-Indicator oben
- "Zurück" (zu Landing) + "Weiter" (zu Step 1) Buttons

---

## 📊 Metriken

### Quantitative Metriken
| Metrik | Aktuell (Baseline) | Ziel | Messmethode |
|--------|-------------------|------|-------------|
| Onboarding Completion | ~60% (geschätzt) | >70% | User-Flow-Analyse |
| Time to First Test | ~5 min | <6 min | Tracking |

### Qualitative Metriken
- [ ] Welcome-Text verständlich
- [ ] Design konsistent mit Steps 1-4
- [ ] Keine Routing-Loops
- [ ] Navigation funktioniert

---

## ✅ Erfolgs- & Abbruchkriterien

### Erfolg (Merge to main)
**Mindestkriterien (alle müssen erfüllt sein):**
- [ ] Build erfolgreich
- [ ] TypeScript-Check ohne Fehler
- [ ] Welcome-Screen zeigt korrekt als Step 0
- [ ] Navigation: Landing → Welcome → Step 1 funktioniert
- [ ] Kein Routing-Loop
- [ ] Design passt zu Steps 1-4

### Abbruch (Discard Experiment)
**Hard Criteria:**
- [ ] Routing-Loops entstehen
- [ ] Build schlägt fehl
- [ ] Onboarding-Completion verschlechtert sich

---

## 🧪 Test-Plan

### 1. Build-Tests
```bash
npm run build        # ✅ / ❌
npx tsc --noEmit     # ✅ / ❌
npm run dev          # ✅ / ❌
```

### 2. Funktionale Tests
**User-Flows:**
- [ ] Flow 1: Nicht eingeloggt → Landing → "Jetzt starten" → Onboarding → Welcome-Screen → Step 1
- [ ] Flow 2: Welcome → "Zurück" → Landing Page
- [ ] Flow 3: Welcome → "Weiter" → Step 1 (Name)
- [ ] Flow 4: Komplettes Onboarding (0-4) → Test

**Edge Cases:**
- [ ] Eingeloggt, Onboarding bereits completed → Kein Welcome-Screen erneut

---

## 📈 Test-Ergebnisse

**Datum:** 28.11.2025  
**Durchgeführt von:** AI Agent

### Build-Status
- **Build:** [Wird getestet]
- **TypeScript:** [Wird getestet]
- **Dev-Server:** [Wird getestet]

---

## 🎯 Entscheidung

**Status:** 🔄 In Progress

Wird nach Tests aktualisiert.
