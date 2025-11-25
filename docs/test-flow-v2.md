# Test Flow v2.0 - Dokumentation

**Letzte Änderung:** 2025-11-25

## Übersicht

Der neue Test-Flow wurde komplett überarbeitet für bessere UX und wertvollere Research-Daten.

## Flow-Ablauf

### 1. **Instruktionen** (`SartInstructions.svelte`)
- Erklärt den Test-Ablauf
- **NEU:** "Wichtig zu wissen"-Box betont:
  - Test ist KEIN Performance-Test
  - Misst Zustand, nicht Können
  - "Versagen" gibt es nicht
  - Dient als kognitiver "Thermometer"

### 2. **Ampel-Countdown** (`TrafficLightCountdown.svelte`)
- **ERSETZT** numerischen 3-2-1 Countdown
- **Grund:** Verwechslungsgefahr mit Test-Zahlen vermeiden
- **Ablauf:**
  - Phase 1 (1000ms): 🔴 Rot leuchtet → "Bereit machen..."
  - Phase 2 (1000ms): 🟡 Gelb leuchtet → "Gleich geht's los..."
  - Phase 3 (1000ms): 🟢 Grün leuchtet → "Los! 🚀"
- Gesamtdauer: ~3 Sekunden (wie vorher)
- Tastatur/Eingabe bleibt blockiert bis Test startet

### 3. **SART Test** (`SartTest.svelte`)
- Brainrot-SART Short v1 (90 Trials)
- 500ms Stimulus + 900ms Maske
- Space-Taste oder Button für "Reagieren"
- Performance.now() für präzise RT-Messung

### 4. **Ergebnis** (`SartResult.svelte`)
- BrainScore-Anzeige mit Visualisierung
- Kurze Metrik-Übersicht
- CTA: "Weiter" → Test-Kontext-Form

### 5. **Test-Kontext-Form** (`TestContextForm.svelte`) ⭐ NEU
- **Ziel:** User verstehen, wann Fokus gut/schwach ist
- **Frage:** "Unter welchen Umständen hast du diesen Test gemacht?"
- **Auswahl:** Max. 3 Context-Tags:
  - Nach der Uni / Arbeit
  - Direkt nach dem Aufstehen
  - Nach Social Media / Scrollen
  - Zwischendurch / unterwegs
  - Im Bett
  - Sonstiges (mit optionalem Freitextfeld)
- **Speicherung:** `sart_sessions.test_context_tags` (Array) + `test_context_custom` (Text)
- **UX:** Große Touch-Flächen, Brand-Purple bei Auswahl, Counter "X von 3"

### 6. **Digital Check-in** (`DigitalCheckIn.svelte`)
- **DEUTLICH prominenter** als vorher
- **Neue Texte:**
  - Überschrift: "Kontext & Screentime eintragen"
  - Kurztext betont Mehrwert für User UND Research
  - "Das dauert nur ein paar Sekunden"
- **Eingaben:**
  - Screentime in Minuten (Bucket-Auswahl)
  - App-Kategorien (Top 3 mit Aktivierungen)
  - Pickups/Freischaltungen
- **CTAs:**
  - Primär: "Speichern und fortfahren" (prominent)
  - Sekundär: "Diesmal überspringen" (Textlink, weniger dominant)
- **Layout:** Große Card wie Score-Card, ausreichend Margin/Padding

### 7. **Dashboard-Redirect**
- Nach Abschluss oder Skip → `/dashboard`
- DailyScore wird automatisch aktualisiert (via `syncDailyScoreForDate()`)

---

## Technische Änderungen

### Neue Komponenten
- `TrafficLightCountdown.svelte` - Ampel-Countdown (3 Phasen)
- `TestContextForm.svelte` - Test-Kontext-Auswahl (max 3 Tags)

### Erweiterte Services
- **`SartService.saveTestContext()`**
  - Parameter: `sessionId`, `tags[]`, `customText?`
  - Update: `sart_sessions.test_context_tags`, `test_context_custom`

### Datenbank-Schema (database.types.ts)
```typescript
// sart_sessions erweitert:
{
  test_context_tags?: string[];      // ['nach_uni', 'im_bett']
  test_context_custom?: string;      // Freitext für "Sonstiges"
}
```

### Flow-Orchestrierung (`routes/test/+page.svelte`)
```typescript
type ExtendedTestStep = TestStep | 'test-context' | 'digital-checkin';

// State Machine:
// instructions → test → result → test-context → digital-checkin → dashboard
```

---

## Design-Guidelines

### Touch-Targets
- Alle interaktiven Elemente: **Min. 44×44px** (iOS HIG)
- Context-Tags: `p-4` → ~48px Höhe ✅
- Buttons: `h-12` (48px) oder `h-14` (56px) ✅

### Farben
- **Ampel:**
  - Rot: `bg-red-500` (Warnfarbe)
  - Gelb: `bg-yellow-400` (Akzent)
  - Grün: `bg-green-500` (Erfolg)
- **Context-Tags (selected):**
  - `border-brand-purple`, `bg-brand-purple`, `text-white`
  - `shadow-lg shadow-purple-500/20`
- **Context-Tags (unselected):**
  - `border-gray-300`, `hover:border-brand-purple/50`

### Typografie
- Headlines: `font-black`, `text-2xl` / `text-3xl`
- Body: `font-bold` oder `font-medium`
- Alle Texte in Deutsch ✅

---

## Research-Wert

### Test-Kontext liefert:
1. **User-Insights:** "Fokus nach Social Media schlechter" → Self-awareness
2. **Personalisierung:** Kontext-spezifische Empfehlungen
3. **Research:** Korrelation zwischen Kontext und BrainScore
4. **Validität:** Ausreißer-Erkennung ("Im Bett" = möglicherweise müde)

### Screentime/Digital-Log liefert:
1. **Korrelation:** Screentime ↔ BrainScore
2. **App-Kategorien:** Welche Apps beeinflussen Fokus?
3. **Pickups:** Fragmentierungsgrad der Aufmerksamkeit
4. **Longitudinal:** Trends über Zeit

---

## Bekannte Limitationen

- ⚠️ Test-Kontext wird NICHT validiert (User könnte Skip-Option brauchen)
- ⚠️ Screentime ist self-reported (Ungenauigkeit möglich)
- ⚠️ Ampel-Countdown ist zeitbasiert (kein "Bereit"-Button)

---

## Nächste Schritte (Future)

- [ ] Skip-Option für Test-Kontext-Form (niedrige Priorität)
- [ ] "Bereit"-Button statt fixer Ampel-Dauer?
- [ ] Test-Kontext-Tags personalisieren (lernend)?
- [ ] Screentime via iOS ScreenTime API automatisch abrufen?

---

**Status:** ✅ Implementiert und getestet (2025-11-25)
