# Post-Test-Investment Flow - Analyse & Implementierung

**Feature-Branch:** `feature/hook-posttest-investment`  
**Datum:** 6. Dezember 2025  
**Ziel:** Hook-Modell Investment-Step nach SART-Test

---

## 📍 Aktueller Flow (IST-Zustand)

### Komponenten-Struktur:

**Test-Route:** `src/routes/test/+page.svelte`
- Orchestriert: Instructions → Test → Result → Digital Check-in
- State Machine mit `ExtendedTestStep = 'instructions' | 'test' | 'result' | 'digital-checkin'`
- `showDigitalCheckIn` State für Anzeige des Check-ins

**Ergebnis-Screen:** `src/lib/components/sart/SartResult.svelte`
- Zeigt BrainScore, Label, Validitäts-Warnung
- Buttons:
  - Primary: "Zum Dashboard"
  - Secondary: "Nochmal testen"
- **Kein** CTA für Check-in (nur in test/+page.svelte)

**Digital Check-in:** `src/features/digitalLog/DigitalCheckIn.svelte` (206 Zeilen)
- **Aktuell:** 3 Fragen in einem Screen
  1. Screentime-Bucket ('0-30', '30-60', '60-120', '120plus')
  2. Main Categories (max. 2: social, video, games, work, other)
  3. Pickup Frequency (low, medium, high, veryHigh)
- Speichert in `digital_logs` Tabelle via `/api/digital-log`
- **Problem:** Wirkt optional, keine direkte Belohnung

### Aktueller Ablauf:

```
Test abgeschlossen
  ↓
SartResult (Score + Label)
  ↓
[Optional Button: "Digitalen Check-in ausfüllen"]
  ↓
DigitalCheckIn (3 Fragen)
  ↓
Speichern → Dashboard (OHNE Insight)
```

---

## 🎯 Gewünschter Flow (SOLL-Zustand)

### Step 1: Ergebnis-Screen (angepasst)
```
SartResult
├─ Score + Label (wie bisher)
├─ ✨ Neuer Text: "Das ist dein heutiger Fokus-Score"
└─ CTAs:
   ├─ PRIMARY: "Kurz einchecken (Screentime & Kontext)" [dominant]
   └─ Secondary Link: "Später eingeben" [klein, dezent]
```

### Step 2: Investment-Screen (erweitert)
```
Screentime & Kontext Investment
├─ Motivierender Header:
│  "Damit dein BrainScore-Profil Sinn ergibt, brauchen wir Kontext"
├─ Eingaben:
│  1) Screentime-Bucket (wie bisher)
│  2) Context-Tags (NEU! Erweitert):
│     - "Nach dem Lernen"
│     - "Nach langem Scrollen"
│     - "Vor dem Schlafen"
│     - "In der Uni / bei der Arbeit"
│     - "Unterwegs / zwischendurch"
│     - "Sonstiges" + Freitext
│  3) Subjektiver State (NEU, optional):
│     - "Sehr klar"
│     - "Mittel"
│     - "Zerstreut / müde"
└─ Button: "Check-in bestätigen" [groß, klar]
```

### Step 3: Mini-Insight Screen (NEU!)
```
Belohnung: Pattern-Insight
├─ Fall A (≥3 Einträge mit Screentime):
│  "An Tagen mit mehr als X Stunden Handyzeit lag dein
│   Score bisher im Schnitt Y Punkte niedriger/höher."
│
├─ Fall B (<3 Einträge):
│  "Danke für deinen Check-in. Je mehr Tage du eingibst,
│   desto mehr können wir dir zeigen, was deinen Fokus beeinflusst."
│
└─ CTAs:
   ├─ PRIMARY: "Zum Dashboard"
   └─ Link: "Noch einen Test machen" (optional)
```

---

## 🗄️ Datenmodell-Analyse

### Bestehende Tabelle: `digital_logs`

**Schema (bereits vorhanden):**
```sql
CREATE TABLE digital_logs (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES sart_sessions(id),
  screen_time_bucket TEXT CHECK (...), -- '0-30', '30-60', '60-120', '120plus'
  main_categories TEXT[],              -- max. 2 Kategorien
  pickup_frequency TEXT CHECK (...),   -- 'low', 'medium', 'high', 'veryHigh'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fehlend für neuen Flow:**
1. **Context-Tags:** Separates Feld für Test-Kontext (statt/zusätzlich zu main_categories)
2. **Subjective State:** Feld für subjektive Verfassung

### Geplante Migration:

**Option A: Tabelle erweitern (konservativ)**
```sql
ALTER TABLE digital_logs
  ADD COLUMN context_tags TEXT[],            -- Test-Kontext
  ADD COLUMN subjective_state TEXT CHECK (...); -- 'clear', 'medium', 'distracted'
```

**Option B: Neue Tabelle (sauber getrennt)**
```sql
CREATE TABLE test_context_logs (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES sart_sessions(id),
  context_tags TEXT[],           -- "Nach dem Lernen", "Unterwegs", etc.
  subjective_state TEXT,         -- 'clear', 'medium', 'distracted'
  custom_context TEXT,           -- Freitext bei "Sonstiges"
  created_at TIMESTAMPTZ
);
```

**Empfehlung:** **Option A** (Tabelle erweitern)
- Weniger komplex
- Context + Screentime gehören zusammen
- Backwards-kompatibel (Spalten nullable)

---

## 📊 Mini-Insight Service - Logik

### Funktion: `getPostTestInsight(userId, currentScreentimeBucket)`

**Input:**
- `userId`: string
- `currentScreentimeBucket`: ScreenTimeBucket (gerade eingegeben)

**Output:**
```typescript
interface PostTestInsight {
  hasEnoughData: boolean;
  headline: string;
  body: string;
  pattern?: {
    highScreentimeAvgScore: number;
    lowScreentimeAvgScore: number;
    difference: number;
  };
}
```

**Algorithmus (MVP):**

```typescript
async function getPostTestInsight(userId, currentBucket) {
  // 1. Hole alle Tests mit BrainScore + Screentime
  const entriesWithData = await fetchEntriesWithScoreAndScreentime(userId);

  // 2. Check: Genug Daten?
  if (entriesWithData.length < 3) {
    return {
      hasEnoughData: false,
      headline: "Danke für deinen Check-in!",
      body: "Je mehr Tage du eingibst, desto mehr können wir dir zeigen, wie deine Handyzeit und dein Fokus zusammenhängen."
    };
  }

  // 3. Kategorisiere: High vs. Low Screentime
  const highScreentimeEntries = entriesWithData.filter(e => 
    e.screentime === '60-120' || e.screentime === '120plus'
  );
  const lowScreentimeEntries = entriesWithData.filter(e =>
    e.screentime === '0-30' || e.screentime === '30-60'
  );

  // 4. Berechne Durchschnitte
  const highAvg = average(highScreentimeEntries.map(e => e.score));
  const lowAvg = average(lowScreentimeEntries.map(e => e.score));
  const diff = lowAvg - highAvg;

  // 5. Generiere Text
  if (Math.abs(diff) >= 5) { // Signifikanter Unterschied
    const direction = diff > 0 ? "niedriger" : "höher";
    return {
      hasEnoughData: true,
      headline: "Interessantes Muster erkannt!",
      body: `An Tagen mit mehr Handyzeit (>60 Min) lag dein Score bisher im Schnitt ${Math.abs(diff)} Punkte ${direction} als an Tagen mit weniger Nutzung.`,
      pattern: { highScreentimeAvgScore: highAvg, lowScreentimeAvgScore: lowAvg, difference: diff }
    };
  } else {
    return {
      hasEnoughData: true,
      headline: "Noch kein klares Muster",
      body: "Deine bisherigen Daten zeigen noch keinen eindeutigen Zusammenhang zwischen Screentime und Fokus – aber je mehr du einträgst, desto besser wird das Bild."
    };
  }
}
```

---

## 🎨 UI/UX-Änderungen

### 1. SartResult.svelte - Neue CTAs

**Aktuell:**
```svelte
<button class="btn-gradient-primary" onclick={goToDashboard}>
  Zum Dashboard
</button>
<button class="btn-secondary" onclick={onNext}>
  Nochmal testen
</button>
```

**Neu:**
```svelte
<!-- Neuer Motivations-Text -->
<p class="text-gray-700 mb-6">
  Das ist dein heutiger Fokus-Score. Mach ihn aussagekräftig!
</p>

<!-- Primary CTA: Check-in -->
<button class="btn-gradient-primary" onclick={handleCheckIn}>
  <span class="material-symbols-outlined">checklist</span>
  Kurz einchecken (Screentime & Kontext)
</button>

<!-- Secondary: Später -->
<button class="text-gray-500 text-sm hover:underline mt-3" onclick={goToDashboard}>
  Später eingeben
</button>
```

### 2. Neue Komponente: PostTestInvestment.svelte

**Struktur:**
```svelte
<PostTestInvestment {sessionId} {score} onComplete={handleInvestmentComplete}>
  <!-- Motivierender Header -->
  <header>
    "Damit dein BrainScore-Profil wirklich Sinn ergibt, brauchen wir Kontext."
  </header>

  <!-- 3 Eingabe-Sektionen -->
  <section>
    1) Screentime-Bucket (Buttons wie bisher)
    2) Context-Tags (Multi-Select, neu)
    3) Subjective State (3-Button-Choice, neu)
  </section>

  <!-- Bestätigen-Button -->
  <button class="btn-gradient-primary">
    Check-in bestätigen
  </button>
</PostTestInvestment>
```

### 3. Neue Komponente: PostTestInsightScreen.svelte

**Struktur:**
```svelte
<PostTestInsightScreen {insight} onContinue={gotoDashboard}>
  <!-- Icon + Badge -->
  <div class="icon-badge">
    <span class="material-symbols-outlined">insights</span>
  </div>

  <!-- Headline -->
  <h2>{insight.headline}</h2>

  <!-- Body Text -->
  <p>{insight.body}</p>

  <!-- Pattern Visual (falls vorhanden) -->
  {#if insight.pattern}
    <div class="pattern-card">
      High Screentime: {insight.pattern.highScreentimeAvgScore}
      Low Screentime: {insight.pattern.lowScreentimeAvgScore}
      Differenz: {insight.pattern.difference} Punkte
    </div>
  {/if}

  <!-- CTAs -->
  <button class="btn-gradient-primary">
    Zum Dashboard
  </button>
  <a href="/test">Noch einen Test machen</a>
</PostTestInsightScreen>
```

---

## 🔧 Implementierungs-Schritte

### Phase 1: Datenmodell erweitern ✅
1. Migration erstellen: `20250106_extend_digital_logs.sql`
2. TypeScript-Types aktualisieren
3. API-Endpoint anpassen

### Phase 2: Investment-Screen bauen
1. PostTestInvestment.svelte erstellen
2. Context-Tags UI + Subjective-State UI
3. Speicher-Logik erweitern

### Phase 3: Mini-Insight Service
1. insight.service.ts erstellen
2. getPostTestInsight() implementieren
3. Pattern-Analyse robust machen

### Phase 4: Insight-Screen bauen
1. PostTestInsightScreen.svelte erstellen
2. Pattern-Visualisierung
3. Navigation-Handling

### Phase 5: Flow verbinden
1. SartResult CTAs anpassen
2. test/+page.svelte State Machine erweitern
3. Alle Schritte verlinken

### Phase 6: Testing
1. Manuelle Tests (< 3 Einträge, ≥ 3 Einträge)
2. Edge Cases (keine Screentime-Daten, DB-Fehler)
3. UI-Feedback sammeln

---

**Status:** 📝 Analyse abgeschlossen  
**Nächster Schritt:** Datenmodell-Migration erstellen
