# Rollback auf Stable-Stand vom 24.11.2025

**Datum:** 27.01.2025  
**Branch:** `stable-24nov`  
**Basis-Commit:** `0c6364e815f4905f22d152a3c13957679240c9dd` (24.11.2025)

---

## 📋 Übersicht

Dieses Dokument beschreibt den erfolgreichen Rollback vom experimentellen Stand (27.11.2025) auf die letzte stabile Version (24.11.2025) mit selektiver Übernahme von wertvollen Fixes.

### Ziel
Die WebApp lief am 27.11.2025 nicht mehr funktionsfähig aufgrund von:
- Routing v2.0 (komplexe 4-State-Logic auf Landing Page)
- 7-Schritt-Onboarding (vorher 4 Schritte) mit Race Conditions
- Tutorial-Modus (neu, nicht getestet)
- UI-Component-Library (unvollständig)
- Profile-Creation-Bugs

**Lösung:** Rollback auf 24.11.2025 + selektive Übernahme von PWA- und Dashboard-Fixes.

---

## 🔄 Durchgeführte Schritte

### PHASE 0: Backup
```bash
git checkout f25c873fb5d90c4945e283c58fd986e25d4c9eae
git branch backup-experimental-27nov
```
✅ Sicherung des experimentellen Stands als `backup-experimental-27nov`

---

### PHASE 1: Stable Checkout
```bash
git checkout 0c6364e815f4905f22d152a3c13957679240c9dd
git branch stable-24nov
git checkout stable-24nov
npm install
npm run dev
```

**Verifizierung:**
- ✅ Dev-Server läuft (http://localhost:5173/)
- ✅ OnboardingWizard: 4 Schritte (keine 7)
- ✅ Landing Page: Simple Routing (keine 4-State-Logic)
- ✅ Keine Tutorial-Mode-Route (`/test/tutorial`)

---

### PHASE 2.1: PWA & Icon Fixes (übernommen)
```bash
# Kopiere verbesserte PWA-Assets
git checkout backup-experimental-27nov -- \
  static/icon-192.svg \
  static/icon-512.svg \
  static/apple-touch-icon.svg \
  static/logo.svg \
  static/logo_neu.svg \
  static/manifest.webmanifest

# Update app.html mit iOS-Support und theme-color
# (manuelle Anpassung)

git add src/app.html static/
git commit -m "feat: PWA optimizations from 27nov (SVG icons, manifest, iOS support)"
```

**Änderungen:**
- PNG-Icons (11 Byte Placeholder) → SVG-Icons (1.4 KB, 95% kleiner)
- `manifest.webmanifest` mit theme_color #7C3AED
- iOS-PWA-Support: `apple-touch-icon`, `apple-mobile-web-app-capable`
- Bessere Installierbarkeit auf iOS/Android

**Commit:** `e323e70`

---

### PHASE 2.2: Dashboard-Chart-Fix (übernommen)
```bash
# Übernehme Fallback-Logik für leere daily_scores Tabelle
# (manuelle Code-Anpassungen)

git add src/lib/services/dashboard.service.ts \
       src/lib/components/dashboard/DailyTrendChart.svelte
git commit -m "fix: Dashboard chart fallback + defensive score extraction from 27nov"
```

**Änderungen:**

**dashboard.service.ts:**
- Neue Funktion `aggregateFromSessions()` (90 Zeilen)
- Fallback auf `sart_sessions` wenn `daily_scores` leer
- Debug-Logging für Datenpfad-Validierung
- Null-Check für leere DailyScores

**DailyTrendChart.svelte:**
- Defensive Filterung für valide Scores
- Helper `getScoreValue()` für snake_case/camelCase-Kompatibilität
- Zeigt nur letzte 14 Tage
- Debug-Logging für Chart-Daten

**Commit:** `51e0a22`

---

### PHASE 2.3: CHANGE_ANALYSIS Dokumentation
```bash
git add CHANGE_ANALYSIS_24NOV_TO_27NOV.md
git commit -m "docs: CHANGE_ANALYSIS 24nov-27nov for rollback reference"
```

**Commit:** `c1986a2`

---

### PHASE 3: Verifizierung (KEINE experimentellen Features)
```bash
# Prüfe, dass keine buggy Features übernommen wurden
grep -r "step.*[456]" src/features/onboarding/OnboardingWizard.svelte
find src/routes/test/tutorial/
find src/lib/components/ui/
find src/lib/design/tokens.ts
grep -r "landingPageState" src/routes/+page.svelte
```

**Ergebnis:**
- ✅ OnboardingWizard: Nur Steps 1-4 (keine 0, 5, 6, 7)
- ✅ Keine `/test/tutorial` Route
- ✅ Keine `src/lib/components/ui/` Library
- ✅ Keine `src/lib/design/tokens.ts`
- ✅ Keine 4-State-Logic in `+page.svelte`

---

## 📊 Was wurde NICHT übernommen (bleiben in backup-experimental-27nov)

### Routing v2.0
- 4-State-Logic auf Landing Page (`showAuth`, `showStartscreen`, `showOnboarding`, `showDashboard`)
- `LandingPageState` enum
- Komplexe Navigation-Conditions

### Onboarding v2.0
- 7-Schritt-Flow (Steps 0, 1, 2, 3, 4, 5, 6)
- Registrierungsschritt (Step 0)
- PWA-Hint-Step (Step 4)
- Welcome-Intro-Step (Step 6)
- `OnboardingNavBar` Component
- Race Conditions bei Profil-Erstellung

### Tutorial-Modus
- `/test/tutorial` Route
- Tutorial-Konfiguration
- Guided-Mode-Logic

### UI-Component-Library
- `src/lib/components/ui/` (Button, Card, Badge, IconContainer)
- Design-Token-System (`src/lib/design/tokens.ts`)
- DEPRECATED-Markierungen für Base-Components

### Sonstige
- BrainScore-Algorithmus-Änderung (Gewichte: 30/30/40 → 25/25/50)
- Cognitive-Metrics-Refactoring
- Animation-System

---

## 🧪 End-to-End-Testplan (PHASE 4 - TODO)

Vor Merge in `main` muss folgendes getestet werden:

### 1. Landing Page
- [ ] Nicht eingeloggt: Zeigt Startscreen
- [ ] "Jetzt starten" führt zu `/auth`
- [ ] Eingeloggt: Zeigt "Test starten" + "Zum Dashboard"
- [ ] Keine Auto-Redirects

### 2. Registrierung
- [ ] `/auth` lädt ohne Fehler
- [ ] Registrierung funktioniert
- [ ] **KEIN** "Profile does not exist" Error nach Registrierung
- [ ] Automatischer Redirect zu `/onboarding` nach erfolgreicher Registrierung

### 3. Onboarding (4 Schritte)
- [ ] Step 1: Name-Eingabe funktioniert
- [ ] Step 2: Zielauswahl (max 3) funktioniert
- [ ] Step 3: Context + Time (max 3) funktioniert
- [ ] Step 4: Summary + ICS-Download + "Starten" funktioniert
- [ ] Navigation vor/zurück funktioniert ohne Abstürze
- [ ] Nach Abschluss: Redirect zu `/test`

### 4. Test
- [ ] Test startet ohne Fehler
- [ ] Test läuft durch (20-30 Trials)
- [ ] BrainScore wird berechnet und angezeigt
- [ ] Session wird in `sart_sessions` gespeichert

### 5. Dashboard
- [ ] Dashboard lädt nach erstem Test
- [ ] Chart zeigt Daten (Fallback auf `sart_sessions`)
- [ ] Keine Console-Errors bei leerem `daily_scores`
- [ ] Weekly-Stats werden korrekt berechnet
- [ ] Heute-Score wird angezeigt

### 6. PWA
- [ ] Manifest unter `/manifest.webmanifest` erreichbar
- [ ] SVG-Icons werden korrekt angezeigt
- [ ] iOS: App ist installierbar (Share → Add to Home Screen)
- [ ] Android: Install-Prompt erscheint
- [ ] Theme-Color (#7C3AED) wird korrekt angezeigt

---

## 🚀 Nächste Schritte

1. **PHASE 4: E2E-Tests durchführen** (siehe Testplan oben)
2. **Debug-Logs entfernen** (optional - nur console.log mit 📊 und ⚠️)
3. **Dokumentation in `docs/` aktualisieren**
4. **Branch-Management:**
   ```bash
   # Option A: Stable → Main (empfohlen)
   git checkout main
   git merge stable-24nov
   
   # Option B: Main auf Stable resetten (aggressiv)
   git checkout main
   git reset --hard stable-24nov
   git push --force
   ```

---

## 📚 Referenzen

- **CHANGE_ANALYSIS_24NOV_TO_27NOV.md** - Vollständige Diff-Analyse (1016 Zeilen)
- **backup-experimental-27nov** - Branch mit allen experimentellen Features
- **stable-24nov** - Dieser Branch (stabiler Stand + selektive Fixes)

---

## 🔒 Git-Status

```bash
# Branches
main                     # Original-Branch (nicht geändert)
backup-experimental-27nov # Backup vom 27.11.2025 (f25c873)
stable-24nov             # Aktueller Stand (dieser Branch)

# Commits auf stable-24nov
0c6364e - 24.11.2025: "fix: Mobile UX & WCAG AA contrast compliance" (BASE)
e323e70 - 27.01.2025: "feat: PWA optimizations from 27nov"
51e0a22 - 27.01.2025: "fix: Dashboard chart fallback + defensive score extraction"
c1986a2 - 27.01.2025: "docs: CHANGE_ANALYSIS 24nov-27nov for rollback reference"
```

---

## ✅ Status: ABGESCHLOSSEN (PHASE 0-3)

- ✅ PHASE 0: Backup erstellt
- ✅ PHASE 1: Stable Stand ausgecheckt und verifiziert
- ✅ PHASE 2: Wertvolle Fixes übernommen (PWA, Dashboard)
- ✅ PHASE 3: Verifiziert, dass KEINE buggy Features übernommen wurden
- ⏳ PHASE 4: E2E-Tests ausstehend

**Dev-Server läuft:** http://localhost:5173/  
**Build funktioniert:** `npm run build` erfolgreich (Vercel-Adapter-Warning irrelevant)

---

*Erstellt am 27.01.2025 als Teil des strukturierten Rollback-Prozesses.*
