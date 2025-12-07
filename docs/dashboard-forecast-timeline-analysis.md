# Dashboard Forecast Timeline - Projekt-Analyse

**Branch:** `feature/dashboard-forecast-timeline`  
**Erstellt:** December 7, 2025  
**Status:** Phase 1 - Analyse Complete

---

## 1. Identifizierte Dateien

### Dashboard-Route
- **Haupt-Seite:** `src/routes/dashboard/+page.svelte` (338 Zeilen)
- **Server Load:** `src/routes/dashboard/+page.server.ts` (minimal, nur Auth Guard)
- **Aktuelles Layout:** Client-seitig mit onMount, ruft `getDashboardData()` Service

### Services (Test-Daten)
- **`src/lib/services/dashboard.service.ts`** - Lädt DailyScores (mit Fallback zu sart_sessions)
- **`src/lib/services/dailyScore.service.ts`** - CRUD für daily_scores Tabelle
- **`src/lib/services/sart.service.ts`** - Speichert SART-Sessions, auto-sync DailyScore

### Bestehende Komponenten
- **`src/lib/components/base/`** - Wiederverwendbare UI-Komponenten (BaseCard, BaseButton)
- **`src/lib/components/sart/`** - Test-spezifische Komponenten

---

## 2. Aktuelles Dashboard-Layout

### Struktur (src/routes/dashboard/+page.svelte):
```svelte
<script>
  // Client-side data loading
  onMount(async () => {
    await syncDailyScoresFromSessions(userId); // Sync bei jedem Load
    const { data } = await getDashboardData(userId);
    dashboardData = data;
  });
</script>

<div class="container">
  <!-- Loading State -->
  {#if loading}
    <div class="skeleton-loader">...</div>
  {/if}
  
  <!-- Main Content -->
  {#if dashboardData}
    <!-- Hero: Heute -->
    <div class="card">
      <h2>Heute</h2>
      <div class="text-6xl">{dashboardData.today.dailyScore || '—'}</div>
      <div>Tests: {dashboardData.today.testCount}</div>
    </div>
    
    <!-- Woche: 7-Tage-Stats -->
    <div class="card">
      <h2>Diese Woche</h2>
      <div>Ø {dashboardData.week.average}</div>
      <div>Max: {dashboardData.week.max}</div>
    </div>
    
    <!-- Verlauf: 14-Tage-Chart -->
    <div class="card">
      <h2>Verlauf (14 Tage)</h2>
      <DailyTrendChart data={dashboardData.dailyScores} />
    </div>
  {/if}
</div>
```

### Aktueller Flow:
1. User landet auf Dashboard
2. Client-side: `syncDailyScoresFromSessions()` (kann langsam sein)
3. Client-side: `getDashboardData()` (lädt aus `daily_scores` Tabelle)
4. Render: Heute + Woche + 14-Tage-Chart

### Pain Points:
- ❌ Kein Forecast (nur historische Daten)
- ❌ Client-side sync bei jedem Load (Performance)
- ❌ Keine Tages-Timeline (wann ist optimale Testzeit?)
- ❌ Keine globale Baseline (nur User-Daten)

---

## 3. Supabase-Schema: `sart_sessions` Tabelle

**Quelle:** Dokumentation + Code-Analyse (src/lib/services/sart.service.ts, dailyScore.service.ts)

### Schema (verifiziert):
```sql
CREATE TABLE sart_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Test-Metriken
  commission_errors  INTEGER NOT NULL,  -- Falsche Reaktionen auf No-Go
  omission_errors    INTEGER NOT NULL,  -- Verpasste Reaktionen auf Go
  go_count           INTEGER NOT NULL,  -- Anzahl Go-Trials
  nogo_count         INTEGER NOT NULL,  -- Anzahl No-Go-Trials
  mean_rt_ms         INTEGER NOT NULL,  -- Durchschnittliche Reaktionszeit
  sd_rt_ms           INTEGER NOT NULL,  -- Standardabweichung RT
  
  -- BrainScore (0-100)
  brain_score        INTEGER NOT NULL CHECK (brain_score >= 0 AND brain_score <= 100)
);

-- Indizes
CREATE INDEX idx_sart_sessions_user_id ON sart_sessions(user_id);
CREATE INDEX idx_sart_sessions_created_at ON sart_sessions(created_at DESC);
```

### Wichtige Felder für Forecast:
- **`user_id`** - User-Zuordnung
- **`brain_score`** - 0-100 Score (bestehende Formel, DARF NICHT GEÄNDERT WERDEN)
- **`created_at`** - Timestamp für Stunden-Gruppierung

### Daten-Verfügbarkeit:
- ✅ Sessions sind langfristig persistiert
- ✅ Zeitstempel inkl. Uhrzeit (wichtig für Stunden-Gruppierung)
- ✅ brain_score ist final berechnet (keine Rohmetrik-Auswertung nötig)

---

## 4. Bestehende Services für Test-Daten

### `dashboard.service.ts`
**Funktion:** `getDashboardData(userId)`  
**Rückgabe:** 
```typescript
interface DashboardData {
  today: {
    dailyScore: number | null;
    testCount: number;
    lastTestAt: string | null;
  };
  week: {
    average: number;
    max: number;
    min: number;
    testCount: number;
  };
  dailyScores: DailyScore[]; // Letzte 14 Tage
}
```

**Datenquelle:** 
1. Primär: `daily_scores` Tabelle (gecachte Aggregate)
2. Fallback: `aggregateFromSessions()` (berechnet live aus `sart_sessions`)

### `dailyScore.service.ts`
**Funktionen:**
- `fetchDailyScores(userId, limit?)` - Holt aus `daily_scores`
- `syncDailyScoresFromSessions(userId)` - Re-aggregiert ALLE Sessions
- `syncDailyScoreForDate(userId, date)` - Sync nur ein Datum

**Performance-Hinweis:** 
- `syncDailyScoresFromSessions()` kann bei vielen Sessions (>100) langsam sein
- Wird aktuell bei JEDEM Dashboard-Load aufgerufen (Client-side)

### `sart.service.ts`
**Funktion:** `saveSartSession(metrics, userId)`  
**Wichtig:** 
- Speichert neue Session in `sart_sessions`
- **Auto-Sync:** Ruft `syncDailyScoreForDate(userId, today)` auf
- D.h. nach Test ist `daily_scores` aktuell

---

## 5. Änderungsvorschläge für Forecast-Integration

### A) Server-Side Load statt Client-Side
**Aktuell:** Dashboard lädt Daten client-side in `onMount()`  
**Vorschlag:** Verschiebe zu `+page.server.ts` (Server Load Function)

**Vorteile:**
- ✅ Schneller (keine Client→Server Round-Trips)
- ✅ SEO-freundlich (Server-rendered Data)
- ✅ Besseres UX (kein Loading Flicker)

**Änderung:**
```typescript
// src/routes/dashboard/+page.server.ts
export const load: PageServerLoad = async (event) => {
  const { session, profile } = await requireOnboarding(event);
  const userId = session.user.id;
  const now = new Date();
  
  // NEU: Forecast + Baseline laden (serverseitig)
  const [forecast, userBaseline, dashboardData] = await Promise.all([
    getForecastForNow(userId, now),
    getUserBaseline(userId),
    getDashboardData(userId),
  ]);
  
  return { profile, forecast, userBaseline, dashboardData };
};
```

### B) Entfernung von Sync bei jedem Load
**Aktuell:** `syncDailyScoresFromSessions()` bei jedem Dashboard-Besuch  
**Vorschlag:** Nur nach Test-Completion (bereits implementiert in `sart.service.ts`)

**Änderung in `+page.svelte`:**
```diff
- await syncDailyScoresFromSessions($auth.user.id);
+ // ENTFERNT: Sync passiert automatisch nach Test
```

### C) Neue Komponenten-Hierarchie
```
dashboard/+page.svelte
├── ForecastHeroCard.svelte       (NEU)
├── DayTimeline.svelte             (NEU)
├── MiniBaselineChart.svelte       (NEU)
├── (Bestehende Komponenten)
│   ├── Stats-Cards (Woche, Monat)
│   └── DailyTrendChart (14 Tage)
```

---

## 6. TODOs für Implementation

### Phase 1: Vorbereitung ✅
- [x] Branch erstellt: `feature/dashboard-forecast-timeline`
- [x] Projekt analysiert (diese Datei)
- [x] Schema dokumentiert

### Phase 2: Types & Services (Schritt 2-5)
- [ ] `src/lib/types/forecast.ts` erstellen
- [ ] `src/lib/services/globalBaseline.ts` erstellen
- [ ] `src/lib/services/forecastService.ts` erstellen

### Phase 3: Dashboard Integration (Schritt 6)
- [ ] `+page.server.ts` erweitern (Server-side Forecast)
- [ ] `+page.svelte` refactoren (Sync-Logik entfernen)

### Phase 4: UI Components (Schritt 7-9)
- [ ] `ForecastHeroCard.svelte` erstellen
- [ ] `DayTimeline.svelte` erstellen
- [ ] `MiniBaselineChart.svelte` erstellen (+ Fallback)

### Phase 5: Testing & Cleanup (Schritt 10-12)
- [ ] Dashboard Layout integrieren
- [ ] Test-Szenarien dokumentieren
- [ ] Code Review & TypeScript Checks

---

## 7. Code-Stellen mit TODOs markiert

### `src/routes/dashboard/+page.svelte` (Zeile 33-38)
```svelte
// TODO: dashboard-forecast-timeline: Client-side Sync wird entfernt
// await syncDailyScoresFromSessions($auth.user.id);
```

### `src/routes/dashboard/+page.svelte` (Zeile 55-75)
```svelte
<!-- TODO: dashboard-forecast-timeline: Alter Dashboard-Header -->
<div class="card">
  <h2>Heute</h2>
  <div class="text-6xl">{dashboardData.today.dailyScore || '—'}</div>
</div>
<!-- TODO: dashboard-forecast-timeline: Wird ersetzt durch ForecastHeroCard -->
```

### `src/routes/dashboard/+page.server.ts` (Zeile 12-16)
```typescript
export const load: PageServerLoad = async (event) => {
  const { session, profile } = await requireOnboarding(event);
  
  // TODO: dashboard-forecast-timeline: Forecast + Baseline laden
  
  return { profile };
};
```

---

## 8. Constraints & Wichtige Hinweise

### ⚠️ KRITISCH: BrainScore-Formel
**Die bestehende BrainScore-Berechnung darf NICHT geändert werden!**

**Lokation:** `src/features/brainrotTest/brainScoreV1.ts`  
**Formel:** 30% Accuracy + 35% Speed + 25% Consistency + 10% Discipline

**Was wir NICHT tun:**
- ❌ BrainScore-Berechnung anpassen
- ❌ Historische Scores neu berechnen
- ❌ Metriken in `sart_sessions` ändern

**Was wir tun:**
- ✅ Bestehende Scores aus DB lesen
- ✅ Forecast basierend auf historischen Scores
- ✅ Baseline als separate Logik

### 📊 Daten-Verfügbarkeit
- **Neue User (0 Tests):** Forecast basiert nur auf globaler Baseline
- **Wenige Tests (1-5):** Leichte Modulation von Baseline
- **Viele Tests (10+):** Deutliche Personalisierung

### 🎨 Design-System
- **Framework:** TailwindCSS + DaisyUI
- **Icons:** Material Symbols Outlined
- **Farben:** Bereits definiert in `tailwind.config.ts`
- **Komponenten:** Folgen bestehendem Muster (`card-modern`, `btn-gradient-primary`, etc.)

---

## 9. Nächste Schritte

**Sofort:**
1. Schritt 2 starten: TypeScript Types definieren (`src/lib/types/forecast.ts`)
2. Schritt 3: Globale Baseline implementieren
3. Schritt 4-5: Forecast-Service bauen

**Nach Services:**
4. Dashboard Server Load erweitern
5. UI-Komponenten bauen
6. Integration testen

**Geschätzte Zeit:** 4-6 Stunden für komplette Implementation

---

**Ende der Analyse**
