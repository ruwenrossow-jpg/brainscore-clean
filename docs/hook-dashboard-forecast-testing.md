# Testing: Hook-Dashboard Forecast

**Feature-Branch:** `feature/hook-dashboard-forecast`  
**Datum:** 6. Dezember 2025  
**Status:** ✅ Build erfolgreich (234 SSR + 293 Client Module)

---

## 📋 Test-Szenarien

| Szenario | Erwartetes Verhalten | Status | Notizen |
|----------|---------------------|--------|---------|
| **User mit letztem Test < 24h** | Forecast ≈ letzter Score | ⬜ Manuell zu testen | Score direkt übernommen |
| **User mit letztem Test 24-72h** | Forecast driftet Richtung 60 | ⬜ Manuell zu testen | Lineare Interpolation |
| **User mit Test > 72h** | Forecast = historischer 7-Tage-Avg | ⬜ Manuell zu testen | Fallback auf Historie |
| **Neuer User (0 Tests)** | Forecast = 60, Label "neutral" | ⬜ Manuell zu testen | Default-Wert |
| **Dashboard ohne Screentime** | Kein Crash, nutzt nur Test-Daten | ⬜ Manuell zu testen | Robuster Fallback |
| **SimpleTrendList mit 0 Daten** | "Noch keine Daten"-Message | ⬜ Manuell zu testen | Empty State |
| **CTA "Test machen"** | Navigiert zu /test | ⬜ Manuell zu testen | Navigation funktioniert |
| **CTA "Verlauf"** | Navigiert zu /logbuch | ⬜ Manuell zu testen | Navigation funktioniert |
| **TypeScript-Check** | Keine Errors in neuen Dateien | ✅ Geprüft | forecast.service.ts typisiert |
| **Build** | Erfolgreich kompiliert | ✅ Geprüft | 234 SSR + 293 Client Module |

---

## 🧪 Manuelle Checks (Anleitung)

### Schritt 1: Dev-Server starten
```bash
npm run dev
```

### Schritt 2: Als eingeloggter User testen

**Test-Case A: User mit Daten**
1. Öffne `http://localhost:5173/dashboard`
2. **Erwartung:** 
   - Forecast-Card wird oben angezeigt
   - Score + qualitatives Label sichtbar
   - Confidence-Hint zeigt Datenbasis
3. Klicke "Jetzt aktualisieren (Test machen)"
   - → Sollte zu `/test` navigieren
4. Klicke "Nur Verlauf ansehen"
   - → Sollte zu `/logbuch` navigieren

**Test-Case B: Neuer User ohne Tests**
1. Erstelle neuen Test-Account oder nutze Debug-Tool zum Löschen von Scores
2. Öffne Dashboard
3. **Erwartung:**
   - Forecast = 60
   - Label = "neutral"
   - Hint = "Noch keine Testdaten – mach deinen ersten Test"

**Test-Case C: SimpleTrendList (Optional)**
1. Setze Feature-Flag im Dashboard: `const useChartFallback = true;`
2. Reload Dashboard
3. **Erwartung:**
   - SimpleTrendList wird statt Chart angezeigt
   - Stats (Avg, Max, Min) korrekt berechnet
   - Clickable Tages-Liste funktioniert

---

## 🔧 Implementierte Forecast-Heuristik

### Basis-Logik (computeForecast)

```typescript
// CASE 1: Test < 24h her
if (hoursAgo < 24) {
  return lastScore; // 100% Gewicht
}

// CASE 2: Test 24-72h her
if (hoursAgo >= 24 && hoursAgo < 72) {
  driftFactor = (hoursAgo - 24) / (72 - 24);
  return lastScore + (60 - lastScore) * driftFactor; // Linear zu 60
}

// CASE 3: Test > 72h oder keine Daten
if (hoursAgo >= 72 || !lastScore) {
  return historicalAverage || 60; // 7-Tage-Avg oder Default
}
```

### Beispiel-Berechnungen

**Szenario 1: Letzter Test vor 8h, Score 75**
- `hoursAgo = 8 < 24`
- → Forecast = **75** (direkt übernommen)
- Label: "sehr gut"

**Szenario 2: Letzter Test vor 48h, Score 80**
- `hoursAgo = 48` (in 24-72h Fenster)
- `driftFactor = (48 - 24) / (72 - 24) = 0.5`
- `driftedScore = 80 + (60 - 80) * 0.5 = 80 - 10 = 70`
- → Forecast = **70** (gedriftet)
- Label: "sehr gut"

**Szenario 3: Letzter Test vor 100h, 7-Tage-Avg = 65**
- `hoursAgo = 100 > 72`
- → Forecast = **65** (historischer Durchschnitt)
- Label: "stabil"

**Szenario 4: Neuer User, keine Tests**
- `lastScore = null`
- → Forecast = **60** (Default)
- Label: "neutral"

---

## 📂 Geänderte/Neue Dateien

### Neue Dateien:
1. `src/lib/services/forecast.service.ts` (195 Zeilen)
   - `computeForecast()` mit Drift-Heuristik
   - TypeScript-Interfaces: `ForecastResult`
   - Hilfsfunktionen: `getQualitativeLabel()`, `formatHoursAgo()`

2. `src/lib/components/dashboard/ForecastCard.svelte` (85 Zeilen)
   - Hero-Card mit Score-Display
   - Badge-Color basierend auf Score
   - Confidence-Hint mit Icon

3. `src/lib/components/dashboard/SimpleTrendList.svelte` (140 Zeilen)
   - Robuster Fallback für Chart
   - Stats-Berechnung (Avg, Max, Min)
   - Clickable Tages-Liste
   - Empty State

4. `docs/hook-dashboard-forecast-notes.md` (Dashboard-Analyse)
5. `docs/hook-dashboard-forecast-testing.md` (diese Datei)

### Geänderte Dateien:
1. `src/routes/dashboard/+page.server.ts`
   - Import: `computeForecast`
   - Load-Funktion erweitert: `forecast` in Return-Objekt

2. `src/routes/dashboard/+page.svelte`
   - Import: `ForecastCard`, `PageData`
   - Props: `data` aus Server Load
   - Layout: ForecastCard + CTAs ganz oben
   - Buttons: "Test machen" (Primary), "Verlauf" (Secondary)

---

## 🚨 Offene TODOs

### 1. BrainScore v1.1 Calibration Hookpoints

**In forecast.service.ts:**
```typescript
// Zeile 23-27
// TODO: BrainScore v1.1 calibration hookpoint
// Hier kann später die 0-100-Skalierung angepasst werden:
// - Aktuell: linearer Drift zum Mittelwert (60)
// - Zukünftig: Machine Learning Modell basierend auf User-Patterns
const DRIFT_TARGET = 60;

// Zeile 150-155
// TODO: BrainScore v1.1 calibration hookpoint
// Diese Schwellenwerte können später angepasst werden,
// wenn die 0-100-Skalierung kalibriert wird.
function getQualitativeLabel(score: number): string { ... }
```

### 2. Screentime-Integration (Future Enhancement)

**Aktuell:**
Forecast basiert nur auf letztem Test + Historie.

**Zukünftig (Phase 2):**
- Screentime des aktuellen Tages einbeziehen
- Adjustment: +5 bis -5 Punkte je nach Screen-Zeit
- Service-Integration: `ScreentimeService.getTodayScreentime(userId)`

**Implementierungs-Hint:**
```typescript
// In computeForecast(), nach CASE 1:
const todayScreentime = await ScreentimeService.getTodayScreentime(userId);
if (todayScreentime) {
  const screentimeAdjustment = calculateScreentimeImpact(todayScreentime);
  score += screentimeAdjustment; // -5 bis +5
}
```

### 3. Unit-Tests

**Fehlend:**
- `forecast.service.test.ts` für `computeForecast()`
- Mock Supabase-Queries
- Test alle 4 Cases (< 24h, 24-72h, > 72h, no data)

**Beispiel-Test-Struktur:**
```typescript
describe('computeForecast', () => {
  it('should return recent score for tests < 24h old', async () => {
    // Mock lastScore = 75, hoursAgo = 8
    const result = await computeForecast('user-id');
    expect(result.forecastScore).toBe(75);
    expect(result.basis).toBe('recent_test');
  });
  
  it('should drift to 60 for tests 24-72h old', async () => {
    // Mock lastScore = 80, hoursAgo = 48
    const result = await computeForecast('user-id');
    expect(result.forecastScore).toBe(70); // 80 + (60-80)*0.5
  });
  
  // ... weitere Tests
});
```

### 4. E2E-Test

**Fehlend:**
- Kompletter User-Flow: Login → Dashboard → Test → Forecast-Update
- Playwright oder Cypress Test

---

## ✅ Abnahme-Kriterien (Definition of Done)

- [x] Forecast-Service implementiert (forecast.service.ts)
- [x] ForecastCard Komponente erstellt
- [x] SimpleTrendList Fallback gebaut
- [x] CTAs im Dashboard integriert
- [x] TypeScript-Check erfolgreich (keine Errors in neuen Dateien)
- [x] Build erfolgreich (234 SSR + 293 Client Module)
- [ ] Manuelle Tests durchgeführt (alle 8 Szenarien)
- [ ] Unit-Tests für Forecast-Service
- [ ] E2E-Test für kompletten Flow
- [ ] Code-Review durch Team
- [ ] Merge auf develop Branch

---

## 📊 Performance-Metriken

**Ziel:** Forecast-Card rendert in < 500ms

**Gemessen (lokal):**
- Forecast-Berechnung (Server): ~[TODO: Messen]
- Card-Rendering (Client): ~[TODO: Messen]
- Total Time to Interactive: ~[TODO: Messen]

**Optimierungs-Potenzial:**
- [ ] Forecast-Result cachen (Server-Side, 5 Min TTL)
- [ ] Lazy-Load SimpleTrendList wenn nicht sichtbar
- [ ] Virtualisiere Tages-Liste bei > 30 Einträgen

---

**Status:** ✅ Feature implementiert, bereit für manuelle Tests  
**Nächster Schritt:** Manuelle QA + User-Feedback sammeln
