# Brainrot-SART Short v1 und BrainScore v1

**Testarchitektur, Auswertungslogik und kognitive Konstrukte für BrainrotAI**

---

## 1. Ziel und Kontext

Dieses Dokument beschreibt die Testarchitektur, die Auswertungslogik und die kognitiven Konstrukte des in der App BrainrotAI eingebetteten Aufmerksamkeitstests „Brainrot-SART Short v1" sowie die Definition des zusammengesetzten Index „BrainScore v1" (0–100).

Der Test ist fachlich am etablierten Sustained Attention to Response Task (SART) orientiert, wird jedoch für die Nutzung im Consumer-Kontext (Smartphone / PWA) angepasst. Die hier festgelegten Parameter bilden den verbindlichen Referenzstand für:
- Implementierung im Code,
- interne und externe Auswertungen,
- wissenschaftliche Dokumentation.

---

## 2. Theoretische Grundlage: Sustained Attention to Response Task (SART)

Der SART ist ein Go/No-Go-Aufmerksamkeitstest, bei dem Ziffern (1–9) nacheinander präsentiert werden. Pro Trial wird eine Ziffer kurz eingeblendet, anschließend folgt eine Maskenanzeige. Die Teilnehmenden sollen auf alle Ziffern reagieren (Go), außer auf eine fest definierte No-Go-Ziffer (häufig „3"). Wiederholte, monotone Go-Antworten machen die No-Go-Hemmung anstrengend und offenbaren Defizite in Response Inhibition und sustained attention / vigilance.

In typischen Protokollen werden:
- Ziffern 1–9 zufällig präsentiert,
- jeder Stimulus für 250 ms gezeigt,
- anschließend 900 ms eine Maske,
- sodass die gesamte Trialdauer 1150 ms beträgt,
- und Blöcke von neun Trials so konstruiert, dass jede Ziffer einmal ohne Wiederholung vorkommt.

Zentrale Kenngrößen sind:
- Kommissionsfehler (Fehler auf No-Go),
- Omissionsfehler (nicht reagierte Go-Trials),
- Reaktionszeit (RT) und RT-Variabilität (RT-SD),

die in vielen Studien zur Erfassung von Inhibition, Vigilanz und Mind-Wandering genutzt werden.

---

## 3. Testarchitektur: Brainrot-SART Short v1

### 3.1 Stimuli und Timing

- **Stimulusset**: Ziffern 1–9.
- **No-Go-Stimulus**: Ziffer „3".
- **Stimulusdarstellung (stimulusDurationMs)**: 500 ms.
- **Maskendarstellung (maskDurationMs)**: 900 ms.
- **Gesamttrialdauer**: 1400 ms.

Die Einstellung von 500 ms Stimulusdauer ist eine produktseitige Anpassung:
- Abweichung von den klassischen 250 ms in der SART-Literatur, die im Consumer-Test subjektiv als „sehr kurz" und frustrierend empfunden wurden.
- Ziel ist, eine bessere Balance aus wissenschaftlicher Nähe zum SART und praktischer Nutzbarkeit (Motivation, Wiederholbarkeit) im Alltag zu erreichen.

**Wichtig für alle Auswertungen:**
Brainrot-SART Short v1 ist SART-inspiriert, aber aufgrund der verlängerten Stimulusdauer (500 ms statt 250 ms) nicht 1:1 mit klassischen SART-Datensätzen vergleichbar.

### 3.2 Trial- und Blockstruktur

- **Gesamtumfang**: 60 Trials.
- **Struktur**: Kontinuierliche Sequenz ohne sichtbare Blöcke.
- **No-Go-Häufigkeit**: 7–8 No-Go-Trials (Ziffer „3") pro Test, entsprechend einer Rate von ca. 11–13 %.
- **No-Go-Positionierung**:
  - No-Go-Trials werden pseudozufällig über die Sequenz verteilt.
  - Keine zwei aufeinanderfolgenden No-Go-Trials (kein „3,3"-Paar).
  - Die ersten zwei Trials (Index 0, 1) und die letzten zwei Trials (Index 58, 59) enthalten niemals ein No-Go.
- **Go-Trials**: Alle verbleibenden Positionen werden mit Go-Stimuli (Ziffern 1, 2, 4–9) pseudozufällig gefüllt.

**Interne Segmentierung (optional für Analysen)**:
Für spätere Trend-Analysen (z. B. Ermüdungseffekte) kann die Sequenz intern in 6 Segmente à 10 Trials unterteilt werden. Diese Segmentierung ist für die Testperson nicht sichtbar und dient ausschließlich der nachträglichen Auswertung.

### 3.3 Antwortmodus und gültige Trials

- **Instruktion**: 
  - Auf alle Ziffern außer „3" so schnell und korrekt wie möglich reagieren (z. B. Tippen auf ein Reaktionsfeld).
  - Bei Ziffer „3": nicht reagieren.
- **Ein Trial gilt als gültig, wenn**: 
  - der Stimulus technisch korrekt dargestellt wurde,
  - die App nicht im Hintergrund war oder unterbrochen wurde.

Gültigkeit wird im Log pro Trial mit einem Boolean (z. B. isValid) festgehalten.

---

## 4. Erfasste Rohdaten und Basisgrößen

### 4.1 Rohdaten pro Trial

Für jeden Trial werden mindestens erfasst:
- **trialIndex** (0–59)
- **segmentIndex** (0–5, optional; interne Analysevariable für 6 Segmente à 10 Trials)
- **stimulusDigit** (1–9)
- **isNoGo** (true, wenn Ziffer = 3; sonst false)
- **userResponded** (true/false)
- **isCorrect** (true/false)
- **reactionTimeMs** (RT in Millisekunden; null, wenn keine Reaktion)
- **isValid** (true/false; technische Gültigkeit)

### 4.2 Aggregierte Basisgrößen

Auf Grundlage der gültigen Trials werden pro Test berechnet:
- **N_valid** = Anzahl gültiger Trials
- **N_noGo** = Anzahl gültiger No-Go-Trials (typischerweise 7–8, als gemessene Größe)
- **N_go** = Anzahl gültiger Go-Trials (typischerweise 52–53)

**Fehlerraten:**
- **Kommissionsfehlerrate (No-Go-Fehler)**:
  ```
  commissionErrorRate = (Anzahl falscher Reaktionen auf No-Go) / N_noGo
  ```
- **Omissionsfehlerrate (Go-Fehler)**:
  ```
  omissionErrorRate = (Anzahl nicht getätigter Reaktionen auf Go) / N_go
  ```

**Wichtig**: Die Fehlerraten werden als Proportionen berechnet, basierend auf der tatsächlich gemessenen Anzahl gültiger Go- bzw. No-Go-Trials. Da N_noGo zwischen 7 und 8 variieren kann, werden keine festen Absolutwerte vorausgesetzt.

**Reaktionszeiten:**
- **meanGoRT** = mittlere Reaktionszeit aller korrekten Go-Trials
- **goRT-SD** = Standardabweichung der RT über korrekte Go-Trials

**Protokollqualität:**
- **validTrialRatio** = N_valid / 60

---

## 4. Onboarding & Check-in-Konfiguration (MVP)

### 4.1 Ziel und Dauer

Das Onboarding dient der initialen Konfiguration der App und soll maximal **2–3 Minuten** in Anspruch nehmen. Es verfolgt vier Hauptziele:

1. **(a) Erfassung der Hauptziele des Nutzers** – z. B. Fokusverbesserung, Kontrolle von Impulsivität, Erfassung von Ermüdung, Performance-Awareness oder unsicher/explorativ.
2. **(b) Definition von 1–3 Check-in-Kontexten** – Situationen, in denen der Nutzer regelmäßig testen möchte (z. B. „vor dem Lernen", „nach Social Media", „abends vor dem Schlafen"), mit zugeordneten Tageszeiten.
3. **(c) Aktivierung eines Kalender-Reminder-Setups** – Bereitstellung einer .ics-Datei zum Import in den Kalender, um die definierten Check-ins zu erinnern.
4. **(d) Durchführung eines ersten Brainrot-SART-Tests** – zur Erfassung einer initialen Baseline.

**Wichtig**: Das Onboarding hat **keinen Einfluss** auf die SART-Testlogik oder die BrainScore-Berechnung v1. Es dient ausschließlich der Planung und Interpretation der Tests (Kontexte, Tagesverläufe) sowie der Nutzer-Motivation durch strukturierte Check-ins.

### 4.2 Onboarding-Flow (4 Screens)

#### Screen 1: „Welcome"

- **Inhalt**:
  - Kurzbeschreibung des Nutzens von BrainrotAI in einem Satz, z. B.:
    > „BrainrotAI hilft dir, deine Aufmerksamkeit zu verstehen und gezielt zu verbessern – in deinem Alltag, ohne aufwendige Diagnostik."
  - Call-to-Action (CTA): „Loslegen"
- **Ziel**: Motivation und schneller Einstieg.

#### Screen 2: „Ziele/Metriken"

- **Inhalt**:
  - Liste möglicher Ziele mit Mehrfachauswahl (maximal 3):
    - `focus` – Fokusverbesserung
    - `impulsivity` – Kontrolle von Impulsivität
    - `fatigue` – Erfassung von Ermüdung
    - `performanceAwareness` – Performance-Bewusstsein
    - `unsure` – Unsicher / explorativ
- **Technische Umsetzung**:
  - Enum `UserGoal` mit den Werten: `focus`, `impulsivity`, `fatigue`, `performanceAwareness`, `unsure`.
  - Nutzer kann 1–3 Ziele auswählen.
- **Ziel**: Personalisierung und Fokussierung auf relevante Metriken.

#### Screen 3: „Kontexte & Tageszeiten"

- **Inhalt**:
  - Nutzer wählt bis zu 3 Check-in-Kontexte aus vordefinierten Optionen, z. B.:
    - „Vor dem Lernen"
    - „Nach Social Media"
    - „Abends vor dem Schlafen"
    - „Nach dem Sport"
    - „Morgens nach dem Aufwachen"
    - Benutzerdefinierter Kontext (Freitext, optional)
  - Jedem Kontext wird eine Tageszeit zugeordnet:
    - `morning` (Morgen)
    - `noon` (Mittag)
    - `evening` (Abend)
- **Technische Umsetzung**:
  - **TrackingContext-Struktur**:
    ```typescript
    {
      id: string,          // UUID oder generierte ID
      label: string,       // z. B. "Vor dem Lernen"
      slot: 'morning' | 'noon' | 'evening',
      fixedTime: string    // ISO-Zeit, z. B. "08:00", "13:00", "20:00"
    }
    ```
  - **Mapping slot → fixe Uhrzeit** (produktseitige Vereinfachung für MVP):
    - `morning` = 08:00 Uhr
    - `noon` = 13:00 Uhr
    - `evening` = 20:00 Uhr
- **Ziel**: Strukturierung der Test-Routine im Alltag; maximal 3 Kontexte zur Reduktion von Komplexität.

#### Screen 4: „Kalender & erster Test"

- **Inhalt**:
  - Generierung einer `.ics`-Datei basierend auf den definierten Kontexten und Zeitslots.
  - Download/Export der Datei zur Integration in Kalender-Apps (z. B. Google Calendar, Apple Calendar).
  - CTA: „Ersten Test starten" – direkter Start des ersten Brainrot-SART-Tests.
- **Ziel**: 
  - Aktivierung der Reminder-Funktion.
  - Erfassung einer initialen Baseline durch den ersten Test.

### 4.3 Datenmodell-Spezifikation

#### UserGoal-Enum

```typescript
enum UserGoal {
  focus = 'focus',
  impulsivity = 'impulsivity',
  fatigue = 'fatigue',
  performanceAwareness = 'performanceAwareness',
  unsure = 'unsure'
}
```

- Nutzer kann 1–3 Werte aus dieser Liste auswählen.
- Diese Auswahl beeinflusst die Interpretation und Darstellung der Ergebnisse (z. B. Hervorhebung relevanter Metriken wie CommissionErrorRate bei `impulsivity`), hat aber **keinen Einfluss** auf die Testdurchführung oder BrainScore-Berechnung.

#### TrackingContext-Struktur

```typescript
interface TrackingContext {
  id: string;                      // Eindeutige ID (UUID)
  label: string;                   // Nutzer-sichtbare Bezeichnung, z. B. "Vor dem Lernen"
  slot: 'morning' | 'noon' | 'evening';  // Zeitslot
  fixedTime: string;               // ISO-Zeit-String, z. B. "08:00:00"
}
```

#### Slot-zu-Zeit-Mapping (MVP)

Für das MVP wird eine vereinfachte Zuordnung verwendet:

| Slot      | Fixe Uhrzeit |
|-----------|--------------|
| `morning` | 08:00 Uhr    |
| `noon`    | 13:00 Uhr    |
| `evening` | 20:00 Uhr    |

Diese Zeiten sind **produktseitig festgelegt** und dienen der Vereinfachung. In späteren Versionen können individuelle Zeiten durch den Nutzer konfiguriert werden.

### 4.4 Abgrenzung und Erweiterbarkeit

- **Keine Beeinflussung der Testlogik**:
  - Das Onboarding hat **keinerlei Einfluss** auf die Durchführung des Brainrot-SART-Tests oder die Berechnung des BrainScore v1.
  - Es dient ausschließlich der:
    - Planung von Check-ins (Reminder),
    - Interpretation der Ergebnisse (Kontextzuordnung),
    - Visualisierung von Tagesverläufen.
- **MVP-Beschränkungen**:
  - Maximal 3 Kontexte.
  - 3 vordefinierte Zeitslots (morning, noon, evening).
  - Keine individuellen Zeitanpassungen.
- **Geplante Erweiterungen** (nicht Teil des MVP):
  - Individuelle Zeitkonfiguration durch Nutzer.
  - Mehr als 3 Kontexte.
  - Dynamische Reminder basierend auf Nutzerverhalten.
  - Integration mit externen Event-Systemen (z. B. Screentime-Reports, Social-Media-Nutzung).

---

## 5. Kognitive Konstrukte und Diagnostik

### 5.1 Response Inhibition / Impulsivität

- **Indikator**: 
  - Kommissionsfehlerrate (commissionErrorRate)
- **Interpretation**: 
  - Hohe Rate → Schwierigkeiten, die automatisierte Go-Reaktion zu unterdrücken; erhöhte Impulsivität.
  - Niedrige Rate → gute Inhibitionskontrolle.

### 5.2 Sustained Attention / Vigilance

- **Indikatoren**: 
  - Omissionsfehlerrate (omissionErrorRate)
  - Optional in späteren Versionen: Veränderung der Fehler über Blöcke hinweg
- **Interpretation**: 
  - Hohe Omissionsrate → nachlassende Aufmerksamkeit, Ermüdung, Mind-Wandering.

### 5.3 Stabilität der Leistung / Response Consistency

- **Indikator**: 
  - RT-Variabilität der korrekten Go-Trials (goRT-SD)
- **Interpretation**: 
  - Niedrige RT-SD → stabile, konsistente Leistung.
  - Hohe RT-SD → starke Schwankungen; in der SART-Forschung typischer Marker für mind-wandering und instabile Aufmerksamkeit.

### 5.4 Protokollqualität / Engagement

- **Indikator**: 
  - Anteil gültiger Trials (validTrialRatio)
- **Interpretation**: 
  - Niedriger Anteil kann auf technische Probleme oder mangelndes Engagement (z. B. Abbrüche, Wechsel in andere Apps) hinweisen.

---

## 7. BrainScore v1 (0–100)

Der BrainScore v1 ist eine gewichtete Kombination mehrerer Teil-Scores, die jeweils im Bereich 0–100 liegen. Er dient als interpretierebare Gesamtkennzahl für eine Session und soll für Nutzer:innen verständlich bleiben (Skala 0–100).

### 7.1 AccuracyScore (0–100)

Basierend auf Kommissions- und Omissionsfehlern:

1. **Basis-Accuracy**:
   ```
   accuracy = 1 - (commissionErrorRate + omissionErrorRate) / 2
   ```
2. Begrenzung auf [0,1].
3. **AccuracyScore**:
   ```
   AccuracyScore = 100 × accuracy
   ```

### 7.2 SpeedScore (0–100)

Der SpeedScore bildet den Speed–Accuracy-Trade-off ab, wie er in der SART-Forschung beschrieben ist: sehr schnelle Reaktionen gehen oft mit höheren Fehlerquoten einher.

Definition über meanGoRT:
- Wenn **meanGoRT ≤ 300 ms** → SpeedScore = 60 (sehr schnell, potenziell impulsiv)
- Wenn **300 ms < meanGoRT < 600 ms** → linearer Anstieg von 60 → 100
- Wenn **600 ms ≤ meanGoRT ≤ 900 ms** → linearer Abfall von 100 → 40
- Wenn **meanGoRT > 900 ms** → SpeedScore = 40 (sehr langsam, evtl. übervorsichtig)

Die linearen Übergänge werden im Code gemäß einfacher Interpolation implementiert.

### 7.3 ConsistencyScore (0–100)

Der ConsistencyScore basiert auf goRT-SD:
- Wenn **goRT-SD ≤ 80 ms** → ConsistencyScore = 100 (sehr konsistent)
- Wenn **80 ms < goRT-SD < 250 ms** → linearer Abfall von 100 → 40
- Wenn **goRT-SD ≥ 250 ms** → ConsistencyScore = 40 (stark schwankende Leistung)

### 7.4 DisciplineScore (0–100)

Der DisciplineScore bewertet primär die Protokollqualität:
- **Ausgangswert**: 100 Punkte
- Wenn validTrialRatio < 0,8, wird der Score reduziert, z. B.: 
  - 80–90 % gültige Trials → 90 Punkte
  - 60–80 % gültige Trials → 75 Punkte
  - < 60 % gültige Trials → 60 Punkte

Die genauen Schwellen werden im Code entsprechend fest kodiert und können in späteren Versionen empirisch nachjustiert werden.

### 7.5 Gesamt-Score

Der BrainScore v1 ist definiert als:

```
BrainScore_v1 = 0,40 × AccuracyScore +
                0,30 × SpeedScore +
                0,20 × ConsistencyScore +
                0,10 × DisciplineScore
```

- **Wertebereich**: 0–100
- Höhere Werte entsprechen einer präziseren, stabileren und engagierteren Leistung in diesem Test.

---

## 8. Vergleich: Standard-SART vs. Brainrot-SART Short v1

| Parameter | Standard-SART (Literatur) | Brainrot-SART Short v1 | Quelle / Begründung |
|-----------|---------------------------|------------------------|---------------------|
| **Anzahl Trials** | ~225 Trials, kontinuierlich | 60 Trials, kontinuierlich (ohne sichtbare Blöcke) | Reduktion der Belastung und Testdauer für Smartphone; 60 Trials bleiben für Trend- und Vergleichsanalysen ausreichend. |
| **Stimulusset** | Ziffern 1–9, No-Go meist = 3 | Ziffern 1–9, No-Go fix = 3 | Alignment mit gängigen SART-Protokollen (No-Go = 3). |
| **No-Go-Häufigkeit** | Selten, typ. ~11–12 % der Trials | 7–8 No-Go-Trials von 60 (≈ 11–13 %) | Angleichung an typische SART-No-Go-Rate, um vergleichbare Inhibitionsanforderungen zu gewährleisten. Variable Anzahl erhöht Natürlichkeit der Sequenz. |
| **Stimulusdauer** | 250 ms | 500 ms (Produktentscheidung) | 250 ms in der Literatur, für Consumer-Use jedoch als subjektiv „zu kurz" wahrgenommen; 500 ms als Kompromiss zwischen Validität und Nutzbarkeit. |
| **Maskendauer** | 900 ms | 900 ms | Übernahme der klassischen Maskendauer, um die Trialstruktur maximal beizubehalten. |
| **Gesamttrialdauer** | 1150 ms (250 + 900 ms) | 1400 ms (500 + 900 ms) | Leicht verlängert; im Dokument explizit als methodische Abweichung benannt. |
| **Antwortanforderung** | Go auf alle Ziffern außer No-Go-Digit | identisch | Funktionale Gleichheit mit Standard-SART. |
| **Blockstruktur** | Häufig kontinuierlich oder längere Serien ohne kurze Blöcke | Kontinuierliche Sequenz ohne sichtbare Blöcke; optionale interne Segmentierung (6×10) nur für Analysen | Kontinuierliche Struktur nähert sich klassischem SART an und vermeidet künstliche Unterbrechungen. Interne Segmentierung ermöglicht optionale Trend-Analysen (z. B. Ermüdung). |

---

## 9. Geltungsbereich, Limitationen und Nutzung im Prototypen

- **Validität**: 
  - Brainrot-SART Short v1 orientiert sich klar am SART, weicht aber in der Stimulusdauer und Gesamtlänge ab.
  - Ergebnisse sind primär für intraindividuelle Vergleiche (z. B. „vor vs. nach Event", „morgen vs. abends") und Vergleiche innerhalb der BrainrotAI-Nutzerschaft geeignet.
- **Limitationen**: 
  - Keine direkte 1:1-Normierung gegenüber klassischen SART-Studien.
  - Smartphoneumgebung bringt zusätzliche Variabilität (Ablenkungen, Hintergrundprozesse).
- **Geplante Nutzung im Prototypen**: 
  - Einzeltests, deren BrainScore v1 direkt zurückgemeldet wird.
  - Eventbasierte Vergleiche (z. B. pre/post bestimmter Ereignisse) auf Basis der Rohmetriken und des BrainScore v1.
  - Perspektivisch: Aggregation zu Tageswerten (z. B. Mittelwert aus mehreren Tests pro Tag) und Visualisierung von Trends über Tage/Wochen.

---

## 10. Literatur (Auszug)

- Robertson, I. H., Manly, T., Andrade, J., Baddeley, B. T., & Yiend, J. (1997). 'Oops!': Performance correlates of everyday attentional failures in traumatic brain injured and normal subjects on the Sustained Attention to Response Task (SART). *Neuropsychologia, 35*(6), 747–758.
- Seli, P., et al. (2013). Enhancing SART validity by statistically controlling response speed. *Frontiers in Psychology, 4*, 265.

(Weitere Studien zu SART, Mind-Wandering und RT-Variabilität können bei Bedarf ergänzt werden.)
