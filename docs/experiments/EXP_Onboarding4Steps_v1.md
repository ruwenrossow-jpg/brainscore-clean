# EXP_Onboarding4Steps_v1

**Datum:** 28.11.2025  
**Version:** 1.0  
**Status:** 🔨 In Implementation  
**Branch:** main (stable-24nov)

---

## Kontext

**Problem:**
- Aktueller Onboarding-Flow: 5 Steps (0-4)
- Step 0 (Welcome) ist separater Screen → verlängert Onboarding unnötig
- User-Feedback: "Zu viele Schritte vor dem ersten Test"
- Navigation-Bugs nach Einführung von Step 0

**Ist-Zustand:**
```
Step 0: Welcome Screen (WelcomeIntroStep.svelte) - 75 Zeilen
Step 1: Namenseingabe
Step 2: Ziele (max 3)
Step 3: Kontexte + Zeiten (max 3)
Step 4: Summary + ICS + Test starten
```

**Ziel:**
- Reduzierung auf 4 Steps (1-4)
- Welcome-Text sinnvoll in Step 1 integrieren
- Step 1: Erklärung + Namenseingabe kombiniert
- Kürzerer, klarerer Onboarding-Flow

---

## Hypothese(n)

**H1:** Ein 4-Step-Onboarding (statt 5) reduziert die Abbruchrate um ≥10%

**H2:** Kombination von Welcome + Name in einem Step ist intuitiver als getrennte Screens

**Annahmen:**
- User wollen schnell zum ersten Test
- Erklärungstext ist wichtig, aber sollte nicht eigenen Step benötigen
- Namenseingabe ist niederschwellig genug für kombinierten Step

---

## Was wird gebaut?

### Scope

**Entfernt:**
- WelcomeIntroStep.svelte (komplette Komponente)
- Step 0 aus OnboardingWizard (Type: 0 | 1 | 2 | 3 | 4 → 1 | 2 | 3 | 4)

**Geändert:**
- OnboardingWizard.svelte:
  - `type Step = 1 | 2 | 3 | 4` (statt 0-4)
  - `currentStep = 1` als Start (statt 0)
  - Progress-Indikator: "Schritt 1-4" (statt 1-5)
  - Step 1 Render-Logik: Integriert Welcome-Text + Namenseingabe

**Beibehaltene Steps:**
- Step 1 (NEU): Welcome + Name kombiniert
- Step 2: Ziele (unverändert)
- Step 3: Kontexte + Zeiten (unverändert)
- Step 4: Summary + ICS + Test (unverändert)

### Technische Details

**Step 1 Layout:**
```svelte
<div class="space-y-6">
  <!-- Welcome Header -->
  <h2>Willkommen bei BrainrotAI</h2>
  
  <!-- Kurzer Intro-Text (2-3 Absätze) -->
  <div>
    BrainrotAI hilft dir zu verstehen, wie dein Handy...
    (vereinfacht aus WelcomeIntroStep)
  </div>
  
  <!-- Separator -->
  <div class="border-t"></div>
  
  <!-- Namenseingabe -->
  <label>Wie sollen wir dich nennen?</label>
  <input bind:value={userName} />
</div>
```

**Datenfluss:** Unverändert (userName → ProfileService)

---

## Metriken

### Quantitativ
| Metrik | Ist-Zustand | Ziel | Messung |
|--------|-------------|------|---------|
| **Onboarding Completion-Rate** | Unbekannt (neu) | ≥80% | Sessions mit completed=true / Gesamt |
| **Time-to-first-test** | ~6-8 Min (geschätzt) | ≤5 Min | Registration → erster SART-Test |
| **Step-Abbruchrate Step 1** | N/A | ≤15% | Abbrüche auf Step 1 / Gesamt-Starts |
| **Code-Reduktion** | 469 Zeilen | -75 Zeilen | WelcomeIntroStep.svelte entfernt |

### Qualitativ
- **UX-Klarheit:** Step 1 wirkt nicht überladen (Text + Input)
- **Konsistenz:** Schritte 2-4 unverändert, keine Verwirrung
- **Fehlervermeidung:** Keine Navigation-Bugs mehr (kein Step 0)

---

## Erfolgs- & Abbruchkriterien

### ✅ Merge-Kriterien (Experime nt als Erfolg)
1. **Build erfolgreich** (keine TypeScript-Fehler)
2. **Manuelle Tests bestanden:**
   - Kompletter Onboarding-Flow (Step 1-4) durchlaufbar
   - Namenseingabe funktioniert
   - Ziele + Kontexte unverändert
   - Test-Start nach Step 4 erfolgreich
3. **UX-Test:** Mindestens 3 User testen → 2+ finden es "klarer als vorher"
4. **Keine Regression:** Dashboard, Test, Logbuch funktionieren weiterhin

### 🔁 Iterations-Kriterien
1. Step 1 wirkt überladen (Textmenge zu hoch)
2. User überspringen Text ohne zu lesen
3. Completion-Rate sinkt (statt zu steigen)

### ❌ Discard-Kriterien
1. Technisch nicht umsetzbar ohne Breaking Changes
2. User-Feedback: "Ich vermisse den Welcome-Screen"
3. Abbruchrate steigt signifikant (>20% auf Step 1)

---

## Test-Plan

### Build-Tests
- [x] `npm run build` erfolgreich
- [x] TypeScript-Check (`npx tsc --noEmit`)
- [x] Bundle-Size-Vergleich (sollte ~-1 KB sein)

### Funktionale Tests
- [ ] **T1:** Onboarding starten → Step 1 zeigt Welcome + Name ✅/❌
- [ ] **T2:** Step 1: Name leer → Weiter blockiert ✅/❌
- [ ] **T3:** Step 1: Name eingegeben → Weiter zu Step 2 ✅/❌
- [ ] **T4:** Step 2-4: Unverändert funktionsfähig ✅/❌
- [ ] **T5:** Step 4: Test starten → navigiert zu /test ✅/❌
- [ ] **T6:** Zurück-Button Step 1: disabled (kein Zurück möglich) ✅/❌
- [ ] **T7:** Progress-Indikator zeigt "Schritt 1 von 4" ✅/❌

### Browser-Tests
- [ ] Chrome Desktop: Layout korrekt
- [ ] Safari iOS: Text lesbar, Input funktioniert
- [ ] Firefox: Keine Console-Errors

### Edge Cases
- [ ] Sehr langer Name (>50 Zeichen) → Input handled gracefully
- [ ] Refresh auf Step 2 → State bleibt erhalten
- [ ] Zurück-Navigation im Browser → keine Fehler

---

## Test-Ergebnisse

**Build:**
```
[Wird ausgefüllt nach npm run build]
Bundle Size: X KB (vorher: Y KB)
TypeScript Errors: 0
```

**Funktionale Tests:**
```
[Wird ausgefüllt nach manuellen Tests]
T1-T7: ✅/❌
```

**Screenshots:**
```
[Optional: Step 1 vor/nach Vergleich]
```

---

## Lessons Learned

### Was lief gut
- [Nach Implementation ausfüllen]

### Was lief schlecht
- [Nach Implementation ausfüllen]

### Überraschungen
- [Nach Implementation ausfüllen]

### Für zukünftige Experimente
- [Nach Implementation ausfüllen]

---

## Entscheidung

**Status:** 🔨 In Implementation

**Begründung:** [Nach Tests ausfüllen]

---

## Changelog

| Version | Datum | Änderung |
|---------|-------|----------|
| 1.0 | 28.11.2025 | Experiment erstellt, Implementation gestartet |

