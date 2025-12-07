# Dashboard Forecast Timeline - Testing Guide

**Feature Branch:** `feature/dashboard-forecast-timeline`  
**Erstellt:** December 7, 2025  
**Status:** Implementierung Complete, Ready for Testing

---

## Testing-Übersicht

Diese Testing-Guide beschreibt **manuelle Test-Szenarien** für das neue Dashboard Forecast Timeline Feature. Da wir keine automatisierten E2E-Tests haben, fokussiert sich dieser Guide auf manuelle Smoke-Tests und Akzeptanzkriterien.

---

## 1. Test-Szenarien nach User-Typ

### Szenario A: Neuer User (0 Tests)

**Setup:**
1. Neuen Account erstellen
2. Onboarding abschließen
3. Direkt zu Dashboard navigieren (OHNE Test zu machen)

**Expected Behavior:**

✅ **ForecastHeroCard:**
- `forecastNow`: Zeigt Wert basierend auf globaler Baseline
- `label`: Zeigt passendes Label (z.B. "stabil" um 12:00, "fragil" um 03:00)
- `confidence`: "low" (Badge: "Erste Einschätzung")
- `typicalAtThisTime`: `null` (keine User-Daten)
- Alert: "Noch wenige Tests vorhanden" wird angezeigt

✅ **DayTimeline:**
- Aktuelles Segment ist highlighted (border-primary)
- Alle Segmente zeigen "Keine Daten" Icon (radio_button_unchecked)

✅ **MiniBaselineChart:**
- Chart rendert erfolgreich (SVG)
- Nur gestrichelte Linie (globale Baseline) ist sichtbar
- Keine Datenpunkte (circles) vorhanden
- Aktueller Zeitpunkt (vertikale Linie) wird gezeigt

**Manual Test Steps:**
```bash
1. Register neuen User: email=test-new@example.com, pw=Test1234!
2. Complete Onboarding (Age, Name, etc.)
3. Navigate zu /dashboard
4. Verify: Forecast zeigt globale Baseline (z.B. ~80 um 11:00)
5. Verify: Confidence Badge = "Erste Einschätzung"
6. Verify: Timeline hat aktuelles Segment highlighted
7. Verify: Chart zeigt nur gestrichelte Linie
```

---

### Szenario B: User mit wenigen Tests (3-5 Tests)

**Setup:**
1. Bestehender Account mit 3-5 abgeschlossenen Tests
2. Tests verteilt über verschiedene Tages-Zeiten
3. Dashboard aufrufen

**Expected Behavior:**

✅ **ForecastHeroCard:**
- `forecastNow`: Modifiziert durch User-Daten (aber nah an globaler Baseline)
- `confidence`: "low" oder "medium" (abhängig von Test-Count)
- `typicalAtThisTime`: Zeigt Wert wenn Tests im aktuellen Segment vorhanden
- Alert: "Noch wenige Tests" nur bei <6 Tests

✅ **DayTimeline:**
- Segmente mit Tests zeigen "Daten vorhanden" Icon (check_circle, grün)
- Segmente ohne Tests zeigen "Keine Daten" Icon

✅ **MiniBaselineChart:**
- Durchgezogene Linie (User-Baseline) erscheint
- Datenpunkte (circles) nur für Stunden mit Tests
- User-Baseline weicht leicht von globaler ab (max. 30% Modulation)

**Manual Test Steps:**
```bash
1. Login mit User der 3-5 Tests hat
2. Navigate zu /dashboard
3. Verify: Forecast unterscheidet sich von globaler Baseline
4. Verify: Confidence = "low" oder "medium"
5. Verify: Timeline zeigt check_circle für Segmente mit Tests
6. Verify: Chart zeigt Datenpunkte für Test-Stunden
7. Verify: User-Baseline (durchgezogene Linie) ist sichtbar
```

---

### Szenario C: Power-User (20+ Tests)

**Setup:**
1. Account mit 20+ Tests über 30 Tage verteilt
2. Tests in verschiedenen Tages-Segmenten
3. Dashboard aufrufen

**Expected Behavior:**

✅ **ForecastHeroCard:**
- `forecastNow`: Personalisierte Prognose
- `confidence`: "high" (Badge: "Statistisch robust")
- `typicalAtThisTime`: Zeigt User-spezifischen Durchschnitt
- Kein "Noch wenige Tests" Alert

✅ **DayTimeline:**
- Mehrere Segmente zeigen "Daten vorhanden" Icon
- Aktuelles Segment klar highlighted

✅ **MiniBaselineChart:**
- Dichte Datenpunkte (viele Stunden mit Tests)
- User-Baseline weicht deutlich von globaler ab (falls User-Pattern abweicht)
- Chart zeigt klare Muster (z.B. User ist morgens schlechter als global)

**Manual Test Steps:**
```bash
1. Login mit Power-User (20+ Tests)
2. Navigate zu /dashboard
3. Verify: Confidence Badge = "Statistisch robust"
4. Verify: typicalAtThisTime zeigt User-spezifischen Wert
5. Verify: Timeline hat mehrere check_circle Icons
6. Verify: Chart hat viele Datenpunkte
7. Verify: User-Baseline unterscheidet sich von globaler Baseline
```

---

## 2. Edge Cases & Error Handling

### Edge Case 1: Test-Completion Flow

**Test:** User macht Test → Wird zu Dashboard redirected

**Expected Behavior:**
- Dashboard zeigt NEUEN Forecast (inkl. letzten Test)
- Forecast hat Decay-Effekt: Wenn Test gerade eben (0 hours ago), weight=0.5
- Timeline zeigt neues Segment als "Daten vorhanden"
- Chart hat neuen Datenpunkt

**Manual Test Steps:**
```bash
1. Navigate zu /test
2. Complete Test (beliebiger Score)
3. Verify: Redirect zu /dashboard?from_test=1
4. Verify: Forecast hat sich aktualisiert (neuer forecastNow)
5. Verify: Chart zeigt neuen Datenpunkt für aktuelle Stunde
```

---

### Edge Case 2: Midnight Transition

**Test:** Dashboard um 23:55 aufrufen, bis 00:05 warten

**Expected Behavior:**
- Timeline wechselt von "Abends" zu "Abends" (evening: 20-05)
- Chart: Vertikale Linie (currentHour) springt von 23 zu 0
- Forecast aktualisiert sich nicht automatisch (nur bei Page-Reload)

**Manual Test Steps:**
```bash
1. Setze System-Zeit auf 23:58
2. Navigate zu /dashboard
3. Verify: currentSegment = "evening"
4. Wait bis 00:02
5. Reload Page
6. Verify: currentSegment immer noch "evening" (korrekt, weil 0-5 ist evening)
7. Verify: Chart currentHour = 0
```

---

### Edge Case 3: Chart Render Error (Fallback)

**Test:** Simuliere Chart-Fehler (z.B. durch Browser ohne SVG-Support)

**Expected Behavior:**
- Alert: "Chart konnte nicht geladen werden"
- Fallback-Tabelle wird angezeigt
- Tabelle zeigt alle 24 Stunden mit Werten
- Aktuelle Stunde ist bold + Badge "Jetzt"

**Manual Test Steps:**
```bash
1. In MiniBaselineChart.svelte: Setze `chartError = true` in onMount
2. Navigate zu /dashboard
3. Verify: Alert wird angezeigt
4. Verify: Tabelle mit 24 Zeilen (0:00 - 23:00)
5. Verify: Aktuelle Stunde ist bold
6. Verify: Status-Column zeigt check_circle für User-Daten
```

---

### Edge Case 4: Einzelnes Segment mit Daten

**Test:** User hat nur Tests in einem einzigen Segment (z.B. nur Vormittags 10-11)

**Expected Behavior:**
- Timeline: Nur "Vormittags" hat check_circle
- Chart: Nur 2 Datenpunkte (10:00, 11:00)
- Forecast: Wenn aktuelles Segment = Vormittags, dann `typicalAtThisTime` vorhanden
- Forecast: Wenn anderes Segment, dann `typicalAtThisTime = null` (Fallback auf global)

**Manual Test Steps:**
```bash
1. Erstelle neuen User
2. Mache 3 Tests alle zwischen 10:00-11:59
3. Navigate zu /dashboard um 10:30
4. Verify: typicalAtThisTime zeigt Durchschnitt der 3 Tests
5. Navigate zu /dashboard um 14:00 (Mittags)
6. Verify: typicalAtThisTime = null (weil keine Daten für Mittags)
```

---

## 3. Cross-Browser Testing

**Browser-Matrix:**
- ✅ Chrome/Edge (Chromium) - Desktop
- ✅ Firefox - Desktop
- ✅ Safari - iOS (Mobile)
- ✅ Chrome - Android (Mobile)

**Test für jeden Browser:**
1. Dashboard laden
2. Verify: ForecastHeroCard rendert korrekt
3. Verify: Timeline ist responsive (Grid layout funktioniert)
4. Verify: Chart SVG rendert (keine Fehler in DevTools Console)
5. Verify: CTAs sind klickbar (Touch-Targets auf Mobile)

---

## 4. Performance Testing

### Load Time Measurement

**Ziel:** Dashboard sollte in <2s laden (inkl. Forecast-Berechnung)

**Test:**
```bash
1. Open DevTools → Network Tab
2. Hard Reload Dashboard (Ctrl+Shift+R)
3. Check "Load" Event Zeit
4. Verify: Total Load Time < 2000ms
```

**Expected Timings:**
- Server-Side Load (Forecast + Baseline): <500ms
- Client-Side getDashboardData: <300ms
- Initial Paint (FCP): <800ms

---

### Large Dataset Performance

**Test:** User mit 100+ Tests

**Expected Behavior:**
- Baseline-Berechnung (30 Tage) sollte <1s dauern
- Chart rendert ohne Lag (<50ms)
- Dashboard bleibt responsive

**Manual Test Steps:**
```bash
1. Erstelle User mit 100+ Tests (via DB-Seed oder manuelle Tests)
2. Navigate zu /dashboard
3. Verify: Keine merkbare Verzögerung beim Laden
4. Verify: Chart rendert flüssig (keine ruckelnden Animationen)
```

---

## 5. Accessibility Testing

### Keyboard Navigation

**Test:** Dashboard nur mit Tastatur bedienen

**Expected Behavior:**
- `Tab`: Fokus wechselt durch CTAs (Prognose testen, Tagesverlauf ansehen)
- `Enter`: Aktiviert Buttons
- `Shift+Tab`: Zurück navigieren
- Focus-Outline ist sichtbar (kein `outline: none` in CSS)

**Manual Test Steps:**
```bash
1. Navigate zu /dashboard
2. Drücke Tab mehrfach
3. Verify: Focus-Ringe um Buttons sind sichtbar
4. Verify: Enter auf "Prognose testen" führt zu /test
5. Verify: Enter auf "Tagesverlauf ansehen" scrollt zu Timeline
```

---

### Screen Reader Testing

**Test:** Dashboard mit NVDA (Windows) oder VoiceOver (macOS)

**Expected Behavior:**
- `forecastNow` wird als "BrainScore-Prognose: [Zahl]" vorgelesen
- Label-Badges haben sinnvolle Aria-Labels
- Chart hat `<title>` Tags für Datenpunkte (Hover-Tooltips)
- Fallback-Tabelle ist vollständig navigierbar

**Manual Test Steps:**
```bash
1. Aktiviere Screen Reader
2. Navigate zu /dashboard
3. Verify: ForecastHeroCard wird vollständig vorgelesen
4. Verify: Timeline-Segmente haben sinnvolle Labels
5. Verify: Chart-Fallback-Tabelle ist zugänglich
```

---

## 6. Integration mit Bestehenden Features

### Hook-Dashboard Forecast (Altes System)

**Test:** Verify dass ALTES Forecast-System nicht mehr verwendet wird

**Expected Behavior:**
- `src/lib/services/forecast.service.ts` (ALT) wird NICHT importiert
- Dashboard lädt nur NEUES forecastService
- Keine Drift-Heuristik mehr (DRIFT_START_HOURS, DRIFT_FULL_HOURS)

**Manual Test Steps:**
```bash
1. Grep nach "DRIFT_START_HOURS" in dashboard/+page.svelte
2. Verify: Keine Treffer
3. Check Import-Statements in +page.svelte
4. Verify: Nur neues forecastService importiert
```

---

### Post-Test Investment Flow

**Test:** Nach Test → Investment Screen → Dashboard

**Expected Behavior:**
- Investment Screen zeigt NEUEN Forecast (forecast.forecastNow)
- Nach Investment-Skip: Redirect zu /dashboard
- Dashboard zeigt aktualisierte Prognose

**Manual Test Steps:**
```bash
1. Complete Test
2. Verify: Investment Screen zeigt Forecast
3. Skip Investment
4. Verify: Redirect zu /dashboard
5. Verify: Forecast ist aktualisiert
```

---

## 7. Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run check` (TypeScript validation)
- [ ] Run `npm run build` (Production Build erfolgreich)
- [ ] Check Browser Console (keine Errors im Prod-Build)
- [ ] Test auf Staging-Environment (falls vorhanden)

### Post-Deployment

- [ ] Verify: Production Dashboard lädt Forecast korrekt
- [ ] Verify: Supabase RLS Policies erlauben Zugriff auf sart_sessions
- [ ] Verify: No 500 Errors in Server Logs
- [ ] Monitor: Check Sentry/Error Tracking für neue Fehler

---

## 8. Known Limitations & Future Improvements

### Bekannte Einschränkungen:

1. **Kein Real-Time Update:**
   - Forecast aktualisiert sich nicht automatisch (nur bei Page-Reload)
   - Workaround: User kann Seite neu laden

2. **30-Tage Lookback:**
   - User-Baseline basiert nur auf letzten 30 Tagen
   - Ältere Tests werden ignoriert
   - Begründung: Balance zwischen Aktualität und historischer Tiefe

3. **Min. 2 Tests pro Stunde:**
   - Einzelne Tests werden nicht für User-Baseline verwendet
   - Begründung: Verhindert Overfitting bei Ausreißern

4. **Keine Confidence-Visualisierung:**
   - Confidence wird nur als Badge angezeigt (low/medium/high)
   - Keine detaillierte Erklärung (z.B. "Basierend auf 23 Tests")

### V2 Features (Future):

- [ ] Real-Time Forecast Updates (via WebSockets oder Polling)
- [ ] Detaillierte Confidence-Erklärung (z.B. "23 Tests, davon 5 im aktuellen Segment")
- [ ] Anpassbare Baseline-Parameter (User kann Gewichtung ändern)
- [ ] Export-Funktion (Baseline als CSV/PNG)
- [ ] Vergleich mit anderen Usern (anonymisierte Global-Baseline)

---

**Testing Complete!** Alle manuellen Test-Szenarien sind dokumentiert. Ready für Review und QA.
