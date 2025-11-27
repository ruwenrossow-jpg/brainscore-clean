# Agent Guidelines - BrainrotAI Development

**Version:** 1.0  
**Gültig für:** stable-24nov Branch und darauf basierende Experimente  
**Letzte Aktualisierung:** 28.11.2025

---

## 🎯 Rolle & Verantwortung

Als AI-Entwicklungsagent für BrainrotAI unterstütze ich systematisches, experimentelles Feature-Development nach der **Build-Measure-Learn** Methodik.

### Kernaufgaben:
1. **Experimentelles Bauen:** Features als isolierte, testbare Experimente entwickeln
2. **Qualitätssicherung:** Code-Standards einhalten, keine Breaking Changes ohne Abstimmung
3. **Dokumentation:** Jeden Schritt transparent und reproduzierbar dokumentieren
4. **Feedback-Integration:** Messergebnisse in nächste Iteration einfließen lassen

### Prinzipien:
- ✅ **Inkrementell:** Kleine, testbare Schritte statt große Rewrites
- ✅ **Reversibel:** Änderungen müssen rollback-fähig sein (Git-Branches)
- ✅ **Messbar:** Jedes Feature hat klare Erfolgs-/Abbruchkriterien
- ✅ **Transparent:** Dokumentation läuft parallel zur Implementierung

---

## 🔄 5-Phasen Workflow

### Phase 1: ANALYSE
**Ziel:** Vollständiges Verständnis des Kontexts

**Aufgaben:**
1. Lies relevante bestehende Dateien:
   - Betroffene Code-Dateien (Routes, Components, Services)
   - Bestehende Dokumentation (`docs/`, `README.md`)
   - Verwandte Experimente (`docs/experiments/`)
2. Identifiziere:
   - Abhängigkeiten zu anderen Modulen
   - Potenzielle Konflikte mit bestehendem Code
   - Wiederverwendbare Komponenten/Logic
3. Erstelle mentales Modell des Datenflows

**Deliverable:** Kurze Zusammenfassung (3-5 Bullet Points) des Ist-Zustands

---

### Phase 2: PLAN
**Ziel:** Konkrete, umsetzbare Schritte definieren

**Aufgaben:**
1. Erstelle Experiment-Dokument: `docs/experiments/EXP_<Name>.md`
2. Definiere im Dokument:
   - **Hypothese:** Was erwarten wir?
   - **Scope:** Welche Dateien werden geändert?
   - **Metriken:** Wie messen wir Erfolg?
   - **Rollback-Plan:** Wie machen wir rückgängig?
3. Liste konkrete Implementierungsschritte:
   - Step 1: Datei X anlegen/ändern (Lines Y-Z)
   - Step 2: Service Y erweitern
   - Step 3: Test Z hinzufügen
4. Identifiziere Risiken & Unklarheiten

**Deliverable:** Vollständiges Experiment-Dokument mit Plan

---

### Phase 3: IMPLEMENTIERUNG
**Ziel:** Code schreiben, Standards einhalten

**Regeln:**
- ✅ TypeScript: Vollständige Typisierung, keine `any` ohne Begründung
- ✅ SvelteKit Conventions: Server-Logic in `.server.ts`, Client in `.svelte`
- ✅ Comments: Komplexe Logik mit kurzen Kommentaren dokumentieren
- ✅ Naming: Sprechende Variablen-/Funktionsnamen (DE oder EN, konsistent)
- ✅ Git: Atomic Commits mit aussagekräftigen Messages
- ✅ Incremental: Kleine Änderungen, regelmäßig committen

**Was NICHT ohne Rückfrage geändert wird:**
- ❌ **Core-Routing-Logik** (`src/routes/+page.server.ts`, Auth-Guards)
- ❌ **Datenbank-Schema** (Supabase Migrations)
- ❌ **Onboarding-Flow** (wenn nicht explizit Teil des Experiments)
- ❌ **Scoring-Algorithmus** (`brainScoreV1.ts` - nur nach Abstimmung)
- ❌ **Build-Konfiguration** (`vite.config.ts`, `svelte.config.js`)

**Bei Unklarheiten:**
→ Frage nach! Lieber 1 Frage zu viel als 1 Bug zu viel.

**Deliverable:** Funktionierende Implementierung mit Git-History

---

### Phase 4: TEST
**Ziel:** Qualität sichern, Metriken erheben

**Testebenen:**
1. **Build-Test:** `npm run build` erfolgreich?
2. **TypeScript-Check:** `npx tsc --noEmit` ohne Fehler?
3. **Dev-Server:** `npm run dev` startet ohne Errors?
4. **Manueller Test:** Feature wie erwartet nutzbar?
5. **Edge Cases:** Was passiert bei invaliden Inputs?

**Metriken erheben (aus Experiment-Dokument):**
- Quantitativ: Ladezeit, Bundle-Size, Test-Durchlaufzeit
- Qualitativ: User-Flow funktioniert, Fehlerbehandlung robust

**Dokumentiere im Experiment-Dokument:**
```markdown
## Test-Ergebnisse

**Build:** ✅ / ❌
**TypeScript:** ✅ / ❌
**Manuelle Tests:**
- [ ] Flow A: Beschreibung → Ergebnis
- [ ] Flow B: Beschreibung → Ergebnis

**Metriken:**
- Metrik 1: Wert (Ziel: X)
- Metrik 2: Wert (Ziel: Y)
```

**Deliverable:** Ausgefüllte Test-Sektion im Experiment-Dokument

---

### Phase 5: REPORTING
**Ziel:** Learnings festhalten, Entscheidung treffen

**Aufgaben:**
1. Aktualisiere Experiment-Dokument:
   - **Lessons Learned:** Was lief gut/schlecht?
   - **Entscheidung:** ✅ Merge to main | 🔄 Iterate | ❌ Discard
   - **Next Steps:** Was kommt als nächstes?
2. Erstelle Summary für User (5-8 Sätze):
   - Was wurde gebaut?
   - Welche Metriken wurden erreicht?
   - Welche Überraschungen gab es?
   - Was ist die Empfehlung?
3. Bei Merge: Aktualisiere relevante Dokumentation (`README.md`, etc.)

**Deliverable:** Abgeschlossenes Experiment-Dokument + User-Summary

---

## 📋 Experiment-Setup

### Wann ein neues Experiment?
- ✅ Neues Feature (z.B. "Tutorial-Modus")
- ✅ Größeres Refactoring (z.B. "Routing v2.0")
- ✅ UI-Redesign (z.B. "Dashboard-Optimierung")
- ✅ Performance-Optimierung (z.B. "Lazy Loading")

### Wann KEIN Experiment?
- ❌ Bugfixes (direkt auf main)
- ❌ Doku-Updates (direkt auf main)
- ❌ Dependency-Updates (direkt auf main, nach Test)
- ❌ Typo-Corrections (direkt auf main)

### Namenskonvention:
```
EXP_<FeatureName>_v<Version>
```

**Beispiele:**
- `EXP_OnboardingWelcome_v1`
- `EXP_DashboardCharts_v2`
- `EXP_TutorialMode_v1`

### Branch-Strategie:
```
main (stable-24nov)
  └─► feature/exp-onboarding-welcome-v1
        └─► Experiment isoliert entwickeln
        └─► Bei Erfolg: PR → main
        └─► Bei Misserfolg: Branch löschen, Learnings behalten
```

---

## 🚫 Was NICHT ohne Abstimmung geändert wird

### Core-System
- ❌ `src/routes/+page.server.ts` (Haupt-Routing-Logik)
- ❌ `src/lib/server/auth.guard.ts` (Auth-Checks)
- ❌ `src/features/brainrotTest/brainScoreV1.ts` (Scoring-Algorithmus)
- ❌ `supabase/migrations/**` (Datenbank-Schema)

### Build-Konfiguration
- ❌ `vite.config.ts`, `svelte.config.js`
- ❌ `package.json` (außer neue Dependencies für Experiment)
- ❌ `tsconfig.json`

### Existierende Features (wenn nicht Teil des Experiments)
- ❌ Onboarding-Flow (4 Steps)
- ❌ SART-Test-Engine
- ❌ Dashboard-Komponenten (außer explizit geplant)

### Warum?
→ **Stabilität:** main-Branch muss jederzeit deploybar bleiben  
→ **Nachvollziehbarkeit:** Änderungen müssen klar einem Experiment zuordenbar sein  
→ **Rollback:** Bei Problemen können wir gezielt das Experiment zurücknehmen

---

## 🎓 Best Practices

### Code-Qualität
```typescript
// ✅ GUT: Typisiert, sprechende Namen, kommentiert
interface OnboardingStep {
  id: number;
  title: string;
  component: ComponentType;
}

/**
 * Lädt den nächsten Onboarding-Schritt
 * @returns false wenn bereits am letzten Schritt
 */
function nextStep(): boolean { ... }

// ❌ SCHLECHT: any, kryptische Namen, keine Doku
function nS(): any { ... }
```

### Git-Commits
```bash
# ✅ GUT: Atomic, aussagekräftig, Prefix
git commit -m "feat: Add welcome screen to onboarding (EXP_OnboardingWelcome_v1)"
git commit -m "fix: Prevent double-submit in SART test"
git commit -m "docs: Update experiment template with metrics section"

# ❌ SCHLECHT: Vage, zu groß, kein Kontext
git commit -m "changes"
git commit -m "fixed stuff"
```

### Experiment-Dokumentation
```markdown
# ✅ GUT: Konkret, messbar, klare Kriterien
**Hypothese:** Ein Welcome-Screen reduziert Abbruchrate im Onboarding um 20%
**Metrik:** Completion-Rate (Schritt 1 → Schritt 4)
**Erfolg:** >80% Completion-Rate
**Abbruch:** <60% Completion-Rate nach 50 Test-Usern

# ❌ SCHLECHT: Vage, nicht messbar
**Hypothese:** Onboarding wird besser
**Metrik:** Schaut ob es funktioniert
```

---

## 🔧 Technischer Kontext

### Stack:
- **Framework:** SvelteKit 2.0
- **Language:** TypeScript 5.x
- **Database:** Supabase (PostgreSQL)
- **Styling:** TailwindCSS + DaisyUI
- **Deployment:** Vercel

### Dateistruktur:
```
src/
  routes/                 # SvelteKit Pages
  lib/
    components/          # Wiederverwendbare UI
    services/            # Backend-Logik (Supabase-Calls)
    stores/              # Svelte Stores (Client State)
  features/              # Feature-Module (Test, Onboarding, etc.)
docs/
  master/                # Agent-Guidelines, Templates
  experiments/           # Experiment-Dokumentation
```

### Wichtige Services:
- `auth.service.ts` - User-Auth & Profile
- `dashboard.service.ts` - Dashboard-Daten mit Fallback
- `sart.service.ts` - Test-Session-Management
- `dailyScore.service.ts` - Score-Aggregation

---

## 📞 Support & Fragen

**Bei Unklarheiten:**
1. Prüfe bestehende Dokumentation (`docs/`, `README.md`)
2. Analysiere ähnliche bestehende Implementierungen
3. Frage nach! Template:
   ```
   Ich arbeite an EXP_<Name>_v<X>.
   Unklarheit: [Beschreibung]
   
   Kontext: [Relevante Dateien/Code]
   
   Optionen, die ich sehe:
   A) ...
   B) ...
   
   Empfehlung?
   ```

**Bei Blockern:**
→ Dokumentiere im Experiment-Dokument unter "Blocker"  
→ Pause Implementierung, informiere User  
→ Keine "blinden" Workarounds ohne Abstimmung

---

## ✅ Checklist für jedes Experiment

Vor Start:
- [ ] Experiment-Dokument erstellt (`docs/experiments/EXP_<Name>.md`)
- [ ] Hypothese & Metriken definiert
- [ ] Branch angelegt (`feature/exp-<name>-v<x>`)
- [ ] Abhängigkeiten geprüft

Während Entwicklung:
- [ ] Atomic Commits mit aussagekräftigen Messages
- [ ] TypeScript-Checks regelmäßig ausführen
- [ ] Core-System nicht ohne Abstimmung ändern
- [ ] Bei Unklarheiten nachfragen

Vor Abschluss:
- [ ] Alle Tests durchgeführt & dokumentiert
- [ ] Metriken erhoben & im Experiment-Dokument eingetragen
- [ ] Lessons Learned dokumentiert
- [ ] Entscheidung (Merge/Iterate/Discard) getroffen
- [ ] User-Summary erstellt

---

**Version History:**
- v1.0 (28.11.2025): Initial Guidelines nach Rollback zu stable-24nov
