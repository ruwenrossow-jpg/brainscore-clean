# Dashboard-Analyse für Forecast-Feature

**Datum:** 6. Dezember 2025  
**Feature-Branch:** `feature/hook-dashboard-forecast`

---

## 📍 Aktuelle Struktur

### Hauptdateien

**Dashboard-Route:**
- `src/routes/dashboard/+page.svelte` ← Haupt-UI-Komponente (338 Zeilen)
- `src/routes/dashboard/+page.server.ts` ← Server Load mit Auth-Guard

**Dashboard-Komponenten:**
- `CurrentScoreCard.svelte` ← Heutige Score-Anzeige
- `DailyTrendChart.svelte` ← 14-Tage-Balkendiagramm
- `SessionHistory.svelte` ← Session-Historie
- `StatsCard.svelte` ← Statistik-Karten

**Services:**
- `dashboard.service.ts` ← Zentrale Datenaggregation (getDashboardData)
- `dailyScore.service.ts` ← DailyScore CRUD + Sync
- `profile.service.ts` ← User-Profil-Daten
- `sart.service.ts` ← SART-Test Sessions
- `auth.service.ts` ← Authentifizierung

---

## 🔄 Aktueller Datenfluss

```
+page.server.ts (SSR)
  └─ requireOnboarding() → session + profile
  
+page.svelte (Client)
  └─ onMount()
      ├─ syncDailyScoresFromSessions() → Sync aus Sessions
      └─ getDashboardData(userId)
          ├─ fetchDailyScores(30 Tage)
          ├─ getTodayScore() → today.score
          ├─ calculateWeeklyStats() → weekly avg/max/min
          └─ filterDailyScoresByWindow() → twoWeekTrend[]
```

---

## 📊 Dashboard-Datenstruktur

```typescript
interface DashboardData {
  today: {
    score: number | null;
    testCount: number;
    lastTestAt: string | null;
  };
  weekly: WeeklyStats;
  twoWeekTrend: DailyScore[];
}
```

**Verfügbare Daten für Forecast:**
- ✅ Letzter BrainScore (today.score)
- ✅ Timestamp letzter Test (today.lastTestAt)
- ✅ 7-Tage-Historie (weekly)
- ✅ 14-Tage-Trend (twoWeekTrend)
- ❌ Screentime-Daten (müssen noch integriert werden)

---

## 🎨 Aktuelles Layout (Dashboard)

```svelte
<header> Glassmorphism Nav </header>

<main>
  {#if loading}
    <spinner />
  {:else if error}
    <error-message />
  {:else}
    <!-- Heute Card (clickable) -->
    <CurrentScoreCard score={today.score} />
    
    <!-- Weekly Stats -->
    <StatsCard stats={weekly} />
    
    <!-- 14-Tage-Verlauf -->
    <DailyTrendChart data={twoWeekTrend} />
    
    <!-- CTA: Test starten -->
    <button onclick={() => goto('/test')}>
      Neuer Test
    </button>
    
    <!-- Session History -->
    <SessionHistory />
  {/if}
</main>
```

---

## 🎯 Geplante Änderungen (Forecast-Feature)

### 1. Neue Komponente: ForecastCard
- Position: **Ganz oben** (vor CurrentScoreCard)
- Daten: ForecastResult (score, label, confidence)
- Design: Hero-Card mit großer Zahl + Erklärtext

### 2. Neue Service: forecast.service.ts
- `computeForecast(userId)` → ForecastResult
- Heuristik: Letzter Score + Zeitdrift + Screentime-Adjustment

### 3. CTAs direkt unter Forecast
- Primary: "Jetzt aktualisieren (Test machen)"
- Secondary: "Nur Verlauf ansehen"

### 4. Fallback: SimpleTrendList
- Alternative zu DailyTrendChart
- Robuster, zeigt Stats + Liste

---

## ⚠️ Constraints

**NICHT ändern:**
- ❌ BrainScore-Berechnung (brainScoreV1.ts)
- ❌ Bestehende Dashboard-Service-Logik (nur erweitern)
- ❌ Auth-Guards (requireOnboarding)

**Nur erweitern:**
- ✅ Neue Komponenten hinzufügen
- ✅ Neue Services für Forecast
- ✅ Dashboard-Layout anpassen (zusätzliche Cards)

---

## 📦 Benötigte neue Dateien

1. `src/lib/services/forecast.service.ts` ← Forecast-Logik
2. `src/lib/components/dashboard/ForecastCard.svelte` ← Hero-Card
3. `src/lib/components/dashboard/SimpleTrendList.svelte` ← Fallback
4. `docs/hook-dashboard-forecast-testing.md` ← Testing-Dokumentation

---

**Status:** ✅ Analyse abgeschlossen  
**Nächster Schritt:** Forecast-Service implementieren
