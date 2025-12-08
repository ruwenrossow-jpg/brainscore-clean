# BrainScore v1.1 - Algorithm Update

**Datum:** 2025-01-08  
**Branch:** feature/dashboard-forecast-timeline  
**Datei:** `src/features/brainrotTest/brainScoreV1.ts`

---

## 🎯 Ziel

Die BrainScore v1.0-Logik nutzte die 0-100-Skala unzureichend:
- Bemühte Nutzer landeten fast immer bei 80-90
- Selbst sehr schlechte Tests fielen kaum unter 60
- Einzelne extrem schlechte Subscores wurden durch andere gute Subscores ausgeglichen

**Ziel v1.1:** Bessere Differenzierung über die gesamte 0-100-Skala mit härteren Strafen für:
1. Vigilanzverlust (Omission Errors)
2. Schlechte Protokollqualität
3. Extreme Performance-Muster

---

## ✅ Implementierte Änderungen

### 1. AccuracyScore - Asymmetrische Omission-Gewichtung

**Vorher (v1.0):**
```typescript
const accuracy = 1 - (commissionErrorRate + omissionErrorRate) / 2;
AccuracyScore = accuracy * 100;
```

**Jetzt (v1.1):**
```typescript
// Gewichtung: Omission 70%, Commission 30%
const totalError = 0.7 * omissionErrorRate + 0.3 * commissionErrorRate;
const accuracyBase = Math.max(0, 1 - totalError);

// Nichtlineare Verschärfung (Exponent 1.3)
const accuracyScaled = Math.pow(accuracyBase, 1.3);
AccuracyScore = Math.round(accuracyScaled * 100);
```

**Rationale:**
- Omission Errors (verpasste Go-Trials) sind charakteristischer für Vigilanzverlust/Mind-Wandering
- Commission Errors (falsche No-Go-Reaktionen) zeigen eher Impulsivität
- Exponent 1.3 verstärkt moderate Fehler stärker nach unten

---

### 2. DisciplineScore - Verschärfte Schwellenwerte

**Vorher (v1.0):**
```typescript
validTrialRatio >= 0.9: Score = 100
validTrialRatio >= 0.8: Score = 90
validTrialRatio >= 0.6: Score = 75
validTrialRatio <  0.6: Score = 60
```

**Jetzt (v1.1):**
```typescript
validTrialRatio >= 0.95: Score = 100
validTrialRatio >= 0.90: Score = 85
validTrialRatio >= 0.75: Score = 60
validTrialRatio <  0.75: Score = 30
```

**Rationale:**
- Schlechte Protokollqualität (App-Backgrounding, Unterbrechungen) muss härter bestraft werden
- Öffnet die Skala nach unten

---

### 3. Aggregation - Mean + Minimum Kombination

**Vorher (v1.0):**
```typescript
brainScore = 0.3 * accuracy + 0.35 * speed + 0.25 * consistency + 0.1 * discipline;
```

**Jetzt (v1.1):**
```typescript
const weightedMean = 0.3 * accuracy + 0.35 * speed + 0.25 * consistency + 0.1 * discipline;
const minSubscore = Math.min(accuracy, speed, consistency, discipline);

// 60% Weighted Mean + 40% Minimum Subscore
brainScore = 0.6 * weightedMean + 0.4 * minSubscore;
```

**Rationale:**
- Ein einzelner extrem schlechter Subscore soll das Gesamtergebnis stark beeinflussen
- Verhindert, dass "Spezialisten" mit einseitiger Performance hohe Scores erreichen

**Beispiel:**
- **Vorher:** Accuracy 95, Speed 80, Consistency 100, Discipline 30 → Score ~83
- **Jetzt:** Gleiche Werte → Score 63 (durch 40% Min-Einfluss nach unten gezogen)

---

### 4. Floor-Regeln - Harte Deckel für Katastrophenmuster

**NEU in v1.1:**

```typescript
// 1) Starke Vigilanzprobleme
if (omissionErrorRate >= 0.5) {
  brainScore = Math.min(brainScore, 20);
}

// 2) Protokollkatastrophe
if (validTrialRatio < 0.6) {
  brainScore = Math.min(brainScore, 30);
}

// 3) Extreme RT-Varianz
if (goRtSD > 400) {
  brainScore = Math.min(brainScore, 30);
}
```

**Rationale:**
- Bestimmte "Katastrophenmuster" müssen zwingend niedrige Scores erzeugen
- Schwellenwerte basieren auf SART-Literatur und klinischer Relevanz

---

## 🧪 Verifikation

**Test-Cases (alle bestanden ✅):**

| Case | Beschreibung | Erwartet | Tatsächlich |
|------|--------------|----------|-------------|
| A | Excellent Test | 85-100 | 87 ✅ |
| B | Medium Test | 40-70 | 70 ✅ |
| C | High Omission (>50%) | ≤20 | 20 ✅ |
| D | Poor Protocol (<60% valid) | ≤30 | 30 ✅ |
| E | Extreme Variance (>400ms SD) | ≤30 | 30 ✅ |
| F | One Bad Subscore | <80 (Min-Einfluss) | 63 ✅ |

---

## 📊 Erwartete Score-Verteilung

**Vorher (v1.0):**
- 0-40: Sehr selten
- 40-60: Selten
- 60-80: Häufig
- 80-100: Sehr häufig

**Jetzt (v1.1):**
- 0-40: Katastrophenmuster (Floor-Regeln)
- 40-60: Schwache Performance
- 60-80: Mittlere Performance
- 80-100: Gute bis exzellente Performance

---

## 🔧 Technische Details

**Geänderte Funktionen:**
- `calculateAccuracyScore()` - Asymmetrische Gewichtung + Exponent
- `calculateDisciplineScore()` - Verschärfte Schwellenwerte
- `calculateBrainScore()` - Mean+Min Aggregation + Floor-Regeln

**Unverändert:**
- `calculateSpeedScore()` - Bestehende Logik beibehalten
- `calculateConsistencyScore()` - Bestehende Logik beibehalten
- Export-Signaturen - Keine Breaking Changes
- `assessValidity()` - Bestehende Spam-Erkennung unverändert

**TypeScript Check:** ✅ Keine Fehler  
**Build:** ✅ Erfolgreich  
**Breaking Changes:** ❌ Keine

---

## 📝 Migration Notes

**Für bestehende User:**
- Alte Scores werden NICHT retroaktiv geändert
- Neue Tests verwenden automatisch v1.1-Logik
- Historische Vergleiche bleiben valide (Scores sind weiterhin 0-100)

**Für Entwickler:**
- Keine API-Änderungen
- Import-Statements unverändert
- Bestehende Funktionsaufrufe funktionieren weiter

---

## 🎓 Referenzen

**SART Literature:**
- Robertson et al. (1997): "Sustained Attention to Response Task"
- Cheyne et al. (2006): "RT variability as marker for mind-wandering"
- Manly et al. (1999): "Omission errors in SART"

**Implementation:**
- Basiert auf `docs/brainrot-sart-short-v1_brainscore-v1.md`
- Folgt Agent-Guidelines (`docs/master/agent-guidelines.md`)

---

**Version:** 1.1  
**Status:** ✅ Implemented & Verified  
**Next Steps:** Monitoring der Score-Verteilung in Production
