# How to Work with the AI Agent

**Version:** 1.0  
**Letzte Aktualisierung:** 28.11.2025  
**Zielgruppe:** Entwickler, die mit dem AI-Agenten an BrainrotAI arbeiten

---

## 🎯 Überblick

Der AI-Agent ist darauf trainiert, systematisch und experimentell Features für BrainrotAI zu entwickeln. Diese Anleitung erklärt, wie du effektiv mit dem Agenten kommunizierst.

---

## 🚀 Quick Start: Neue Session starten

### Standard-Workflow

**1. Session initialisieren:**
```
Hallo! Ich möchte an einem neuen Feature arbeiten.

Kontext:
- Projekt: BrainrotAI (stable-24nov Branch)
- Feature: [Kurze Beschreibung]

Bitte:
1. Lies die Agent-Guidelines (docs/master/agent-guidelines.md)
2. Erstelle ein Experiment-Dokument für dieses Feature
3. Starte mit Phase 1: Analyse
```

**2. Agent-Antwort:**
Der Agent wird:
- Die Guidelines überfliegen
- Ein Experiment-Dokument anlegen: `docs/experiments/EXP_<Name>_v1.md`
- Den 5-Phasen-Workflow starten (Analyse → Plan → Implementierung → Test → Reporting)

---

## 📝 Experiment starten: Template

### Für neues Feature:
```
Neues Experiment: [Feature-Name]

Kontext:
[2-3 Sätze: Was ist der aktuelle Zustand? Welches Problem lösen wir?]

Hypothese:
[Was erwarten wir? Wie messen wir Erfolg?]

Bitte:
- Erstelle Experiment-Dokument: EXP_[Name]_v1
- Folge dem 5-Phasen-Workflow aus agent-guidelines.md
- Frage bei Unklarheiten nach (keine Annahmen)

Wichtig:
- Ändere NICHT [Liste kritischer Dateien, falls relevant]
- Halte dich an [spezifische Constraints]
```

### Für Bugfix (kein Experiment):
```
Bugfix: [Kurze Beschreibung]

Problem:
[Beschreibung des Bugs mit Steps to Reproduce]

Erwartetes Verhalten:
[Was sollte passieren?]

Bitte:
- Analysiere betroffene Dateien
- Fixe den Bug
- Teste die Änderung
- Committe mit Message: "fix: [Beschreibung]"

(Kein Experiment-Dokument nötig)
```

---

## 🔄 Agent-Workflow verstehen

### Phase 1: ANALYSE
**Was der Agent tut:**
- Liest relevante Code-Dateien
- Prüft bestehende Dokumentation
- Identifiziert Abhängigkeiten

**Was du tun solltest:**
- Gib Kontext (Links zu relevanten Docs, User-Feedback, etc.)
- Beantworte Rückfragen präzise
- Bestätige, dass Agent auf richtigem Weg ist

### Phase 2: PLAN
**Was der Agent tut:**
- Erstellt Experiment-Dokument
- Definiert Hypothese & Metriken
- Plant konkrete Implementierungsschritte

**Was du tun solltest:**
- Überprüfe den Plan (sind Hypothese & Metriken sinnvoll?)
- Gib Feedback zu Scope (zu groß/klein?)
- Bestätige oder justiere

**Beispiel-Feedback:**
```
Plan sieht gut aus! Aber:
- Metrik "Ladezeit <2s" ist zu ambitioniert, lass uns mit <3s starten
- Scope erweitern: Bitte auch Mobile-Optimierung einplanen
```

### Phase 3: IMPLEMENTIERUNG
**Was der Agent tut:**
- Schreibt Code nach Plan
- Hält sich an Guidelines (TypeScript, Naming, etc.)
- Commitet inkrementell
- Fragt bei Unklarheiten nach

**Was du tun solltest:**
- Lass Agent arbeiten (keine Mikromanagement)
- Beantworte Rückfragen zeitnah
- Überprüfe Commits (grob)

### Phase 4: TEST
**Was der Agent tut:**
- Build-Tests durchführen
- Manuelle Tests dokumentieren
- Metriken erheben

**Was du tun solltest:**
- Führe eigene Tests durch (Agent kann nicht alles simulieren)
- Gib Feedback zu UX/UI (Agent hat kein "Gefühl" dafür)
- Berichte Edge Cases, die Agent übersehen hat

### Phase 5: REPORTING
**Was der Agent tut:**
- Füllt Experiment-Dokument komplett aus
- Dokumentiert Lessons Learned
- Empfiehlt Entscheidung (Merge/Iterate/Discard)

**Was du tun solltest:**
- Treffe finale Entscheidung
- Bei Merge: Review Code nochmal gründlich
- Bei Iterate: Gib klare Anweisungen für v2

---

## 💬 Kommunikationstipps

### ✅ Gute Anfragen

**Konkret & strukturiert:**
```
Experiment: Tutorial-Modus für SART-Test

Kontext:
- Aktuell: User springen direkt in 90-Trial Test
- Problem: Hohe Abbruchrate in ersten 20 Trials
- Idee: 10-Trial Tutorial-Modus mit Erklärungen

Hypothese:
Tutorial-Modus reduziert Abbruchrate von 30% auf <10%

Metriken:
- Completion-Rate (Tutorial → Haupttest)
- Durchschnittliche Fehlerquote in Trials 1-20

Bitte starte Experiment: EXP_TutorialMode_v1
```

**Mit klaren Constraints:**
```
WICHTIG:
- Ändere NICHT die bestehende Test-Engine (brainrotSartEngine.ts)
- Tutorial soll OPTIONAL sein (kein Pflicht-Schritt)
- Keine neuen Dependencies
```

### ❌ Schlechte Anfragen

**Zu vage:**
```
Mach den Test besser.
```
→ Problem: Was heißt "besser"? Welche Metriken? Welcher Scope?

**Zu viele Aufgaben gleichzeitig:**
```
Implementiere Tutorial-Modus, redesigne das Dashboard, 
optimiere die Performance und fixe die Bugs.
```
→ Problem: Zu großer Scope, keine Priorisierung

**Ohne Kontext:**
```
Erstelle EXP_Feature_v1
```
→ Problem: Agent weiß nicht, was "Feature" ist

---

## 🎯 Experiment-Naming

### Namenskonvention:
```
EXP_<FeatureName>_v<Version>
```

### Beispiele:
- `EXP_OnboardingWelcome_v1` - Welcome-Screen im Onboarding
- `EXP_DashboardCharts_v2` - Chart-Bibliothek (v2 nach Iteration)
- `EXP_TutorialMode_v1` - Tutorial für SART-Test
- `EXP_MobileOptimization_v1` - Mobile UX Verbesserungen
- `EXP_LazyLoading_v1` - Performance-Optimierung

### Regeln:
- **FeatureName:** CamelCase, beschreibend, <4 Wörter
- **Version:** Startet bei v1, erhöht sich bei Iteration
- **Prefix:** Immer `EXP_` (um von normalen Docs zu unterscheiden)

---

## 📋 Checkliste für effektive Sessions

### Vor Session-Start:
- [ ] Habe ich eine klare Idee, was ich will?
- [ ] Habe ich Erfolgs-Metriken definiert?
- [ ] Habe ich relevante Docs/Links bereit?
- [ ] Bin ich bereit, Rückfragen zu beantworten?

### Während Session:
- [ ] Antworte ich auf Rückfragen zeitnah?
- [ ] Gebe ich konstruktives Feedback?
- [ ] Lass ich Agent systematisch arbeiten?
- [ ] Dokumentiere ich meine Entscheidungen?

### Nach Session:
- [ ] Habe ich Experiment-Dokument überprüft?
- [ ] Habe ich eigene Tests durchgeführt?
- [ ] Habe ich Entscheidung getroffen (Merge/Iterate/Discard)?
- [ ] Habe ich Lessons Learned notiert?

---

## 🛠️ Häufige Szenarien

### Szenario 1: Feature-Request von User
**Input:** User beschwert sich, dass Onboarding zu lang ist

**Deine Aktion:**
```
Neues Experiment: Onboarding verkürzen

Kontext:
- Aktuell: 4 Steps (Context, Time, Goals, Confirm)
- User-Feedback: "Zu lang, ich will direkt testen"
- Daten: 40% brechen bei Step 2 ab

Hypothese:
Reduktion auf 2 Steps erhöht Completion-Rate auf >80%

Plan:
- Kombiniere Context+Time zu 1 Step
- Mache Goals optional (skipable)
- Behalte Confirm als finalen Step

Metriken:
- Completion-Rate: 60% → 80%
- Time-to-first-test: 3min → <90s

Bitte starte: EXP_OnboardingSimplify_v1
```

### Szenario 2: Performance-Problem
**Input:** Dashboard lädt langsam (>5s)

**Deine Aktion:**
```
Performance-Optimierung: Dashboard

Kontext:
- Aktuell: getDashboardData() lädt 30 Tage Daten
- Problem: Langsame Query bei >100 Sessions
- Lighthouse Score: Performance 45/100

Hypothese:
Lazy Loading + Pagination erhöht Performance auf 80/100

Plan:
- Initial nur 7 Tage laden
- "Mehr anzeigen" Button für ältere Daten
- Chart-Library caching

Metriken:
- Initial Load Time: 5s → <2s
- Lighthouse Performance: 45 → 80

Bitte starte: EXP_DashboardPerformance_v1
```

### Szenario 3: A/B Test
**Input:** Unsicher welche UI-Variante besser ist

**Deine Aktion:**
```
A/B Test: CTA-Button-Farbe

Kontext:
- Variante A: Lila (#7C3AED) - aktuell
- Variante B: Grün (#10B981) - Hypothese: höhere Klickrate

Hypothese:
Grüner Button erhöht Klickrate um 15%

Plan:
- Feature-Flag einbauen (50/50 Split)
- Tracking für beide Varianten
- 100 User-Sessions sammeln

Metriken:
- Click-Through-Rate (CTR)
- Time-to-Action

Bitte starte: EXP_CTAButtonColor_v1
```

---

## 🚫 Wann KEIN Experiment?

### Direkt auf main (kein Experiment-Dokument):
- **Bugfixes:** Kleine, isolierte Fehler
- **Typos:** Rechtschreibfehler in Docs/UI
- **Dependencies:** npm-Package-Updates (nach Test)
- **Docs:** Dokumentations-Updates ohne Code-Änderung
- **Refactoring:** Code-Cleanup ohne Verhaltensänderung (wenn <50 Zeilen)

**Template für Non-Experiment-Request:**
```
Bugfix: [Beschreibung]
Problem: [Details]
Bitte fixe direkt (kein Experiment nötig)
```

---

## 📚 Weiterführende Ressourcen

**In diesem Projekt:**
- [Agent Guidelines](./agent-guidelines.md) - Vollständige Regelwerk für Agent
- [Experiment Template](./experiment-template.md) - Kopiervorlage für neue Experimente
- [Existing Experiments](../experiments/) - Archiv abgeschlossener Experimente

**Externe Ressourcen:**
- [Build-Measure-Learn](https://en.wikipedia.org/wiki/Build%E2%80%93Measure%E2%80%93Learn) - Lean Startup Methodik
- [SvelteKit Docs](https://kit.svelte.dev/docs) - Framework-Dokumentation
- [Supabase Docs](https://supabase.com/docs) - Database/Auth

---

## 🎓 Beispiel-Session (End-to-End)

```
👤 USER:
Neues Experiment: Welcome-Screen im Onboarding

Kontext:
- Aktuell: Onboarding startet direkt mit Context-Eingabe
- Problem: User verstehen nicht, worum es geht
- Idee: Intro-Screen mit App-Erklärung

Hypothese:
Welcome-Screen erhöht Completion-Rate von 60% auf 80%

Metriken:
- Onboarding Completion Rate
- Time-to-first-test

Bitte starte: EXP_OnboardingWelcome_v1

---

🤖 AGENT:
Verstanden! Ich starte das Experiment.

PHASE 1: ANALYSE
Ich lese:
- docs/master/agent-guidelines.md ✓
- src/features/onboarding/OnboardingWizard.svelte ✓
- src/routes/onboarding/+page.svelte ✓

Erkenntnisse:
- Aktuelles Onboarding: 4 Steps (1=Context, 2=Time, 3=Goals, 4=Confirm)
- OnboardingWizard.svelte steuert Step-Logik
- Keine Welcome-Screen-Komponente vorhanden

Erstelle Experiment-Dokument: docs/experiments/EXP_OnboardingWelcome_v1.md

PHASE 2: PLAN
Plan für Implementierung:
1. Erstelle WelcomeIntroStep.svelte (neue Komponente)
2. Erweitere OnboardingWizard: 4 Steps → 5 Steps (0=Welcome, 1-4=existing)
3. Update Step-Counter: "Schritt X von 4" → "Schritt X von 5"

Frage: Soll Welcome-Screen skipable sein?

---

👤 USER:
Nein, nicht skipable. User sollen Welcome lesen.

---

🤖 AGENT:
Verstanden, nicht skipable.

PHASE 3: IMPLEMENTIERUNG
[Agent implementiert Code...]

Commits:
- feat: Add WelcomeIntroStep component (EXP_OnboardingWelcome_v1)
- feat: Integrate WelcomeIntroStep into OnboardingWizard
- fix: Update step counter to reflect 5 steps

PHASE 4: TEST
Build-Tests:
- npm run build ✅
- npx tsc --noEmit ✅
- npm run dev ✅

Manuelle Tests:
- Onboarding-Flow durchlaufen ✅
- Welcome-Screen zeigt korrekt ✅
- Navigation zu Step 1 funktioniert ✅

PHASE 5: REPORTING
Experiment-Dokument aktualisiert mit Test-Ergebnissen.

Empfehlung: ✅ MERGE TO MAIN
- Alle Tests bestanden
- Code sauber und typisiert
- Keine Regression

Nächste Schritte:
1. Du testest manuell (UX-Check)
2. Bei OK: Ich erstelle PR
3. Merge & Deploy

Was sagst du?

---

👤 USER:
Ich habe getestet, sieht gut aus! Bitte PR erstellen.

---

🤖 AGENT:
Perfect! Erstelle PR...
[Agent erstellt Pull Request]

PR: feature/exp-onboarding-welcome-v1 → main
✅ Ready for merge
```

---

## 🆘 Support & Hilfe

**Bei Problemen:**
1. Prüfe [Agent Guidelines](./agent-guidelines.md) für Regeln
2. Schaue [Experiment Template](./experiment-template.md) für Struktur
3. Konsultiere bestehende Experimente in `docs/experiments/`
4. Frage Agent: "Ich bin unsicher bei [X], welche Optionen gibt es?"

**Agent neu starten:**
Wenn Agent "off-track" ist:
```
STOP. Lass uns neu starten.

Bitte:
1. Lies nochmal docs/master/agent-guidelines.md
2. Lies das Experiment-Dokument
3. Erkläre mir, was der aktuelle Stand ist
4. Was sollte der nächste Schritt sein?
```

---

**Version History:**
- v1.0 (28.11.2025): Initial Guide nach stable-24nov Rollback
