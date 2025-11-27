# Dashboard Fallback-Logik

**Stand:** 27.11.2025 (stable-24nov Branch)  
**Commit:** 14d3046

---

## 🎯 Problem & Lösung

### Problem
Wenn ein User Tests macht, aber die `daily_scores` Tabelle noch leer ist (z.B. beim ersten Login oder bei DB-Reset), zeigt das Dashboard keine Daten an - obwohl `sart_sessions` vorhanden sind.

### Lösung
**Zwei-stufiger Datenabruf mit automatischem Fallback:**

1. **Primär:** Hole `daily_scores` (vorberechnete Tagesdurchschnitte)
2. **Fallback:** Wenn leer → Aggregiere direkt aus `sart_sessions`

---

## 📊 Datenfluss

```
getDashboardData(userId)
  │
  ├─► fetchDailyScores(userId, 30 Tage)
  │     │
  │     ├─► daily_scores vorhanden?
  │     │     YES: ✓ Return daily_scores
  │     │     NO:  ↓
  │     │
  │     └─► aggregateFromSessions(userId)
  │           │
  │           ├─► Hole sart_sessions (letzte 30 Tage)
  │           ├─► Gruppiere nach Datum (YYYY-MM-DD)
  │           ├─► Berechne Durchschnitt pro Tag
  │           └─► Return DailyScore[] Format
  │
  ├─► getTodayScore(dailyScores)
  ├─► calculateWeeklyStats(dailyScores)
  └─► filterDailyScoresByWindow(dailyScores, 14 Tage)
        │
        └─► DailyTrendChart.svelte
              │
              ├─► Filter: Nur valide Scores (number, !NaN, >=0)
              ├─► Sort: Chronologisch (älteste zuerst)
              ├─► Slice: Zeige letzte 14 Tage
              └─► Render: Balken mit height = score%
```

---

## 🔧 Implementierung

### 1. Dashboard Service (`dashboard.service.ts`)

#### `getDashboardData(userId)`
```typescript
// Hauptfunktion für Dashboard-Daten
export async function getDashboardData(userId: string) {
  // 1. Versuche daily_scores zu holen
  let { data: dailyScores } = await fetchDailyScores(userId, 30);
  
  // 2. FALLBACK: Wenn leer, aggregiere aus Sessions
  if (!dailyScores || dailyScores.length === 0) {
    console.warn('⚠️ No daily_scores found, falling back to session aggregation');
    dailyScores = await aggregateFromSessions(userId);
  }
  
  // 3. Berechne Metriken
  return {
    today: getTodayScore(dailyScores),
    weekly: calculateWeeklyStats(dailyScores),
    twoWeekTrend: filterDailyScoresByWindow(dailyScores, 14)
  };
}
```

#### `aggregateFromSessions(userId)`
```typescript
// Fallback: Berechne DailyScores aus sart_sessions
async function aggregateFromSessions(userId: string): Promise<DailyScore[]> {
  // 1. Hole alle Sessions (letzte 30 Tage)
  const { data: sessions } = await supabase
    .from('sart_sessions')
    .select('created_at, brain_score')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  // 2. Gruppiere nach Datum
  const sessionsByDate = new Map<string, number[]>();
  for (const session of sessions) {
    const date = session.created_at.split('T')[0]; // 'YYYY-MM-DD'
    if (!sessionsByDate.has(date)) sessionsByDate.set(date, []);
    sessionsByDate.get(date).push(session.brain_score);
  }
  
  // 3. Berechne Durchschnitt pro Tag
  const dailyScores: DailyScore[] = [];
  for (const [date, scores] of sessionsByDate) {
    const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
    dailyScores.push({
      date,
      dailyScore: Math.round(avg),
      testCount: scores.length
    });
  }
  
  return dailyScores.sort((a, b) => b.date.localeCompare(a.date));
}
```

### 2. Chart Komponente (`DailyTrendChart.svelte`)

#### Defensive Score-Extraktion
```typescript
// Unterstützt beide Formate: dailyScore UND daily_score (snake_case)
function getScoreValue(day: DailyScore | any): number {
  if (typeof day.dailyScore === 'number') return day.dailyScore;
  if (typeof day.daily_score === 'number') return day.daily_score;
  return 0;
}

// Filtere nur valide Scores
let validScores = $derived(
  (dailyScores ?? [])
    .filter((d) => {
      const score = getScoreValue(d);
      return typeof score === 'number' && !Number.isNaN(score) && score >= 0;
    })
    .sort((a, b) => a.date.localeCompare(b.date)) // Chronologisch
);
```

#### Balken-Rendering
```svelte
{#each validScores.slice(-14) as day}
  {@const score = getScore(day)}
  {@const barHeightPercent = Math.max(score, 8)}
  
  <div 
    style="height: {barHeightPercent}%; min-height: 8px;"
    class="bg-brand-green rounded-t-lg"
  ></div>
{/each}
```

**Besonderheiten:**
- `Math.max(score, 8)` → Minimum 8% Höhe (auch Score 0 ist sichtbar)
- `slice(-14)` → Zeige nur letzte 14 Tage
- `min-height: 8px` → Mindesthöhe auch bei kleinem Container

---

## 📋 DailyScore Format

```typescript
interface DailyScore {
  date: string;          // 'YYYY-MM-DD'
  dailyScore: number;    // 0-100
  testCount: number;     // Anzahl Tests an diesem Tag
  firstTestAt?: string;  // ISO timestamp
  lastTestAt?: string;   // ISO timestamp
}
```

**Quellen:**
1. **Primär:** `daily_scores` Tabelle (vorberechnet)
2. **Fallback:** Aggregiert aus `sart_sessions.brain_score`

---

## 🎯 Annahmen & Grenzen

### Annahmen
1. **Score-Range:** 0-100 (BrainScore ist normalisiert)
2. **Zeitfenster:** 30 Tage für Datenabfrage, 14 Tage für Chart-Display
3. **Aggregation:** Durchschnitt aller Tests pro Tag (nicht Median/Max)
4. **Zeitzone:** UTC (Server-Timestamps, keine lokale Konvertierung)

### Grenzen
1. **Performance:** Bei >1000 Sessions kann Aggregation langsam werden
   - **Lösung:** Background-Job könnte `daily_scores` befüllen
2. **Echtzeit:** Fallback-Daten nicht gecached, jeder Request berechnet neu
3. **Invalidität:** Keine Berücksichtigung von `validity_assessment` aus Sessions
   - Auch invalide Tests fließen in Durchschnitt ein
4. **Lücken:** Tage ohne Tests zeigen keine Balken (kein Interpolation)

### Zukünftige Verbesserungen
- [ ] Background-Job: Befülle `daily_scores` nach jedem Test
- [ ] Caching: Cache aggregierte Daten für 5-10 Minuten
- [ ] Filter: Ignoriere invalide Tests (`validity.isValid === false`)
- [ ] Tooltip: Zeige Details beim Hover (Score, Anzahl Tests, Zeit)

---

## 🧪 Testing

### Manuelle Tests
1. **Leere daily_scores:**
   ```sql
   DELETE FROM daily_scores WHERE user_id = '<test_user>';
   ```
   → Dashboard sollte trotzdem Daten aus `sart_sessions` zeigen

2. **Gemischte Daten:**
   - Tag 1: 3 Tests (Scores: 70, 75, 80) → Durchschnitt: 75
   - Tag 2: 1 Test (Score: 90) → Durchschnitt: 90
   → Chart zeigt 2 Balken mit korrekter Höhe

3. **Keine Sessions:**
   → Chart zeigt "Noch keine Daten verfügbar"

### Edge Cases
- ✓ `dailyScores = null` → Fallback funktioniert
- ✓ `dailyScores = []` → Fallback funktioniert
- ✓ Score = 0 → Balken hat 8% Höhe (sichtbar)
- ✓ Score = NaN → Wird gefiltert, kein Crash
- ✓ `daily_score` statt `dailyScore` → Wird erkannt und verwendet

---

## 🔍 Debugging

### Console Warnings
```typescript
// Nur kritische Warnung, wenn Fallback aktiv
console.warn('⚠️ No daily_scores found, falling back to session aggregation');
```

### DevTools Checks
```javascript
// In Browser Console:
// 1. Prüfe Dashboard-Daten
fetch('/api/dashboard').then(r => r.json()).then(console.log);

// 2. Prüfe Sessions
fetch('/api/sessions').then(r => r.json()).then(console.log);
```

---

## ✅ Status

**Dashboard-Fallback vollständig implementiert:**
- ✅ `getDashboardData()` mit automatischem Fallback
- ✅ `aggregateFromSessions()` für Session-Aggregation
- ✅ `DailyTrendChart.svelte` mit defensiver Score-Extraktion
- ✅ Minimale Balkenhöhe (8%) für Sichtbarkeit
- ✅ Valide Score-Filterung (NaN, null, negative Werte)
- ✅ Debug-Logs entfernt (nur kritische Warnungen)

**Robustheit:**
- Kein Crash bei leerer `daily_scores` Tabelle
- Kein Crash bei fehlenden Sessions
- Kein Crash bei invaliden Score-Werten
- Unterstützt beide Formate: `dailyScore` und `daily_score`
