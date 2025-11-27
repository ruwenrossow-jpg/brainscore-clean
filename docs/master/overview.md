# Master-Dokumentation Übersicht – BrainrotAI

**System-weite Orientierung für Entwicklung & Design**

> **Zweck:** Zentrale Übersicht aller Masterdokumente und deren Code-Pendants  
> **Letzte Aktualisierung:** 2025-01-26  
> **Maintainer:** BrainrotAI Core Team

---

## 📋 Was sind Masterdokumente?

Masterdokumente sind die **Single Source of Truth** für zentrale Aspekte des Projekts. Sie definieren:

1. **Was** implementiert werden soll (Konzept, Logik, Design)
2. **Warum** Entscheidungen getroffen wurden (Rationale)
3. **Wie** die Umsetzung strukturiert ist (Architektur, Konventionen)

Jedes Masterdokument hat ein **Code-Pendant** – die technische Implementierung, die sich strikt an die Vorgaben hält.

### Prinzipien

- ✅ **Text zuerst, Code danach:** Änderungen beginnen immer im Masterdokument
- ✅ **Verlinkung:** Code-Dateien verweisen auf ihr Masterdokument (Kommentar)
- ✅ **Versionierung:** Masterdokumente haben Versionsnummern
- ✅ **Review-Pflicht:** Änderungen an Mastern erfordern explizite Approval

---

## 🗂️ Struktur der Masterdokumente

```
docs/
  master/
    ├── overview.md              ← Dieses Dokument
    ├── test-logic.md            ← SART-Test & BrainScore-Logik
    ├── design-system.md         ← UI, Farben, Typografie, Komponenten
    ├── animations.md            ← Motion-Design, Transitions
    └── contributing-vibes.md    ← Entwicklungs-Guidelines (Vibecoding)
```

---

## 📚 Masterdokumente im Detail

### 1. Test-Logik & BrainScore

**Dokument:** [`docs/master/test-logic.md`](./test-logic.md)

**Inhalt:**
- Brainrot-SART Short v1 (60 Trials, 500ms Stimulus)
- BrainScore-Berechnung v1 (0–100)
- Kognitive Konstrukte (Inhibition, Vigilance, Consistency)
- Onboarding & Check-in-Konfiguration
- Abgrenzung zu klassischem SART

**Code-Pendants:**
- `src/features/brainrotTest/brainrotSartConfig.ts` - Test-Parameter
- `src/features/brainrotTest/brainrotSartEngine.ts` - Test-Engine
- `src/features/brainrotTest/brainScoreV1.ts` - Score-Berechnung
- `src/features/insights/cognitiveMetrics.ts` - Kognitive Interpretation

**Version:** 1.0 (Stable)

---

### 2. Design-System

**Dokument:** [`docs/master/design-system.md`](./design-system.md)

**Inhalt:**
- Design-Prinzipien (wissenschaftlich, fokussiert, accessibility-first)
- Farb-System (Brand Purple, Graustufen, Semantische Farben)
- Typografie (Inter, Hierarchie, Text-Gradients)
- Karten-Typen (Primary Metric, Form Card, List Card, etc.)
- Buttons & CTAs (Primary, Secondary, Ghost, Link)
- Navigation & Layouts (Onboarding, Dashboard, Mobile)
- Charts & Visualisierung
- Icons (Material Symbols)
- Responsive Breakpoints
- PWA-Spezifika (Safe Areas)

**Code-Pendants:**
- `src/lib/design/tokens.ts` - Design-Tokens (TypeScript)
- `src/app.css` - Tailwind-Utilities & Custom-Classes
- `tailwind.config.ts` - Tailwind-Theme-Config
- `src/lib/components/ui/*` - UI-Primitives (Button, Card, etc.)

**Version:** 1.0 (Stable)

---

### 3. Animations

**Dokument:** [`docs/master/animations.md`](./animations.md)

**Inhalt:**
- Animation-Philosophie (subtil, schnell, funktional)
- Timing & Durations (150ms–600ms)
- Standard-Animationen (Fade-In, Slide-Up, Hover-Lift)
- Spezialisierte Animationen (Score-Reveal, Chart-Bar-Grow)
- Onboarding-Transitions
- Dashboard-Animationen
- Loading-States
- Error & Success-Feedback
- Accessibility (`prefers-reduced-motion`)
- Performance-Richtlinien

**Code-Pendants:**
- `src/app.css` - Keyframe-Definitionen (@keyframes, @layer utilities)
- `src/lib/animations/motion.ts` - Animation-Utils (Zukunft)

**Version:** 1.0 (Stable)

---

### 4. Contributing & Vibecoding

**Dokument:** [`docs/master/contributing-vibes.md`](./contributing-vibes.md)

**Inhalt:**
- Workflow für neue Features ("The BrainrotAI Way")
- Masterdokument-zentrierte Entwicklung
- Code-Konventionen
- Testing-Guidelines
- Review-Prozess

**Code-Pendants:**
- Gilt projekt-weit (keine spezifische Datei)

**Version:** 1.0 (Draft)

---

## 🔗 Verlinkung: Masterdokument ↔ Code

### Kommentar-Style in Code-Dateien

Jede Code-Datei, die ein Masterdokument implementiert, sollte oben einen Verweis enthalten:

```typescript
/**
 * Design-Tokens v1
 * 
 * Referenz: docs/master/design-system.md
 * Version: 1.0
 * 
 * Diese Datei implementiert alle Farben, Typografie-Tokens, Spacing-Werte
 * und andere Design-Konstanten gemäß Masterdokument.
 */
```

### Beispiel: Button-Komponente

```svelte
<script lang="ts">
  /**
   * BaseButton - UI Primitive
   * 
   * Referenz: docs/master/design-system.md, Abschnitt "Buttons & CTAs"
   * 
   * Implementiert Primary, Secondary, Ghost-Varianten mit
   * standardisierten Hover-States, Touch-Targets (44px), und
   * Accessibility-Features (Focus-Rings).
   */
  
  // Implementation...
</script>
```

---

## 🔄 Update-Prozess

### Änderungen an Masterdokumenten

1. **Diskussion:** Issue/PR mit Änderungsvorschlag
2. **Review:** Mindestens 1 Team-Member prüft Rationale
3. **Approval:** Explizite Zustimmung erforderlich
4. **Update:** Masterdokument aktualisieren
5. **Versionierung:** Version-Nummer erhöhen (z.B. 1.0 → 1.1)
6. **Code-Update:** Alle betroffenen Code-Pendants anpassen
7. **Testing:** Sicherstellen, dass Implementierung korrekt

### Breaking Changes

Bei grundlegenden Änderungen (z.B. Farb-System-Overhaul):

- **Major Version:** 1.0 → 2.0
- **Migration-Guide:** Separate Datei anlegen (z.B. `MIGRATION_v1_to_v2.md`)
- **Deprecation-Period:** Alte Version min. 1 Sprint parallel supporten

---

## 🛠️ Entwicklungs-Workflow (Kurzversion)

### Neues Feature bauen

1. **Text-Master zuerst:**
   - Falls neues Feature: Mini-Dokument in `docs/features/[feature-name].md` anlegen
   - Beschreibe: Was, Warum, Wie (Architektur)

2. **Bestehende Masterdokumente checken:**
   - Welche Design-Komponenten brauchst du? → `design-system.md`
   - Welche Animationen? → `animations.md`
   - Neue Test-Logik? → `test-logic.md` erweitern

3. **Code implementieren:**
   - Nutze UI-Primitives aus `src/lib/components/ui/*`
   - Nutze Design-Tokens aus `src/lib/design/tokens.ts`
   - Keine hardcoded Styles (außer dokumentierte Ausnahmen)

4. **Verlinke im Code:**
   - Kommentar oben: `// Referenz: docs/master/design-system.md`

5. **Testing:**
   - Unit-Tests für Logik
   - Visual-Regression (falls vorhanden)

6. **Review:**
   - Code-Review + Masterdokument-Konsistenz-Check

---

## 📦 Code-Struktur (Überblick)

```
src/
  lib/
    design/
      tokens.ts                  ← Design-Tokens (design-system.md)
    animations/
      motion.ts                  ← Animation-Utils (animations.md)
    components/
      ui/
        Button.svelte            ← UI-Primitives (design-system.md)
        Card.svelte
        Badge.svelte
        IconContainer.svelte
      layout/
        OnboardingNavBar.svelte  ← Layout-Komponenten
        DashboardHeader.svelte
    services/
      sart.service.ts            ← Test-Logik (test-logic.md)
      brainScore.service.ts
  features/
    brainrotTest/
      brainrotSartConfig.ts      ← Test-Parameter (test-logic.md)
      brainrotSartEngine.ts      ← Test-Engine
      brainScoreV1.ts            ← Score-Berechnung
    insights/
      cognitiveMetrics.ts        ← Kognitive Interpretation (test-logic.md)
    onboarding/
      OnboardingWizard.svelte    ← Onboarding-Flow
    digitalLog/
      DigitalCheckIn.svelte      ← Check-in-Feature
    logbook/
      dailyScoreService.ts       ← Aggregation
  routes/
    +layout.svelte
    +page.svelte                 ← Landing Page
    dashboard/
      +page.svelte               ← Dashboard
    test/
      +page.svelte               ← SART-Test
```

---

## 🎯 Ziel dieser Struktur

### Vorteile

1. **Clarity:** Jeder weiß, wo die Wahrheit steht (Masterdokument)
2. **Consistency:** Code folgt stringenten Vorgaben
3. **Maintainability:** Änderungen sind nachvollziehbar und kontrolliert
4. **Onboarding:** Neue Team-Member haben klare Referenzen
5. **Vibecoding:** Schnelles, sicheres Entwickeln ohne ständiges Raten

### Anti-Patterns (Vermeiden!)

❌ **Code-first, Doku-later:** Nicht erst coden, dann dokumentieren  
❌ **Hardcoded-Styles:** Keine Farben/Sizes direkt im Component  
❌ **Inkonsistente Naming:** Nutze Master-Terminologie  
❌ **Masterdokument-Drift:** Code weicht vom Master ab ohne Update

---

## 📖 Weitere Dokumentation

### Projekt-spezifische Docs (nicht Master-Status)

```
docs/
  requirements.md              ← Funktionale Anforderungen
  routing-logik-v2.md          ← Routing-Architektur
  test-flow-v2.md              ← Test-Flow-Diagramm
  tutorial-mode-flow.md        ← Tutorial-Spezifikation
  design-guide.md              ← VERALTET (siehe design-system.md)
```

**Hinweis:** `design-guide.md` ist inzwischen durch `master/design-system.md` ersetzt. Die alte Datei bleibt zur Referenz, gilt aber als **deprecated**.

---

## 🚀 Quick-Links

| Was brauchst du? | Wo findest du es? |
|-----------------|-------------------|
| UI-Design, Farben, Buttons | [`design-system.md`](./design-system.md) |
| Animationen, Transitions | [`animations.md`](./animations.md) |
| Test-Logik, BrainScore | [`test-logic.md`](./test-logic.md) |
| Entwicklungs-Guidelines | [`contributing-vibes.md`](./contributing-vibes.md) |
| TypeScript-Tokens | `src/lib/design/tokens.ts` |
| UI-Komponenten | `src/lib/components/ui/*` |

---

## 📝 Changelog

| Version | Datum | Änderung |
|---------|-------|----------|
| 1.0.0   | 2025-01-26 | Initial: Masterdokument-System etabliert |

---

**Version:** 1.0.0  
**Status:** ACTIVE  
**Maintainer:** BrainrotAI Core Team
