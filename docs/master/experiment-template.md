# Experiment Template

**Kopiere diese Datei zu:** `docs/experiments/EXP_<FeatureName>_v<Version>.md`

---

# EXP_[FeatureName]_v[Version]

**Status:** 🔄 In Progress | ✅ Success | ❌ Discarded | 🔁 Iterating  
**Branch:** `feature/exp-[featurename]-v[version]`  
**Erstellt:** [Datum]  
**Letzte Aktualisierung:** [Datum]  
**Verantwortlich:** [Name/Agent]

---

## 📋 Kontext

**Warum dieses Experiment?**
[Beschreibe den Hintergrund: Welches Problem lösen wir? Welche User-Pain-Points adressieren wir?]

**Aktueller Stand:**
[Beschreibe den Ist-Zustand des Systems: Wie funktioniert es aktuell? Was fehlt?]

**Related Experiments:**
- [Link zu verwandten Experimenten, falls vorhanden]

---

## 💡 Hypothese(n)

**Haupthypothese:**
[Eine klare, testbare Aussage. Beispiel: "Ein Welcome-Screen reduziert die Onboarding-Abbruchrate um 20%"]

**Alternativhypothesen (optional):**
1. [Weitere Hypothesen, falls mehrere Ansätze getestet werden]
2. ...

**Annahmen:**
- [Annahme 1: z.B. "User lesen Text-Inhalte"]
- [Annahme 2: z.B. "Mobile-User verhalten sich ähnlich wie Desktop"]
- ...

---

## 🔨 Was wird gebaut?

### Scope
**Neue Dateien:**
- `src/...` - [Beschreibung]
- `src/...` - [Beschreibung]

**Geänderte Dateien:**
- `src/...` (Lines X-Y) - [Was wird geändert?]
- `src/...` (Lines X-Y) - [Was wird geändert?]

**NICHT im Scope:**
- [Was explizit NICHT geändert wird, um Scope zu begrenzen]

### Technische Details
**Architektur:**
```
[Optionales Diagramm oder Beschreibung des Datenflows]
Component A → Service B → Database C
```

**Abhängigkeiten:**
- [Neue npm-Packages, falls nötig]
- [Bestehende Komponenten, die genutzt werden]

**Besonderheiten:**
- [Technische Herausforderungen]
- [Edge Cases]
- [Performance-Überlegungen]

---

## 📊 Metriken

### Quantitative Metriken
| Metrik | Aktuell (Baseline) | Ziel | Messmethode |
|--------|-------------------|------|-------------|
| [Metrik 1] | [Wert] | [Zielwert] | [Wie gemessen?] |
| [Metrik 2] | [Wert] | [Zielwert] | [Wie gemessen?] |

**Beispiele:**
- Onboarding Completion Rate: 60% → 80%
- Page Load Time: 2.5s → <2s
- Bundle Size: 500KB → <450KB
- Test Completion Time: 5min → 3min

### Qualitative Metriken
- [ ] [User-Flow X funktioniert intuitiv]
- [ ] [Fehlerbehandlung robust]
- [ ] [Mobile UX akzeptabel]
- [ ] [Accessibility (WCAG AA)]

---

## ✅ Erfolgs- & Abbruchkriterien

### Erfolg (Merge to main)
**Mindestkriterien (alle müssen erfüllt sein):**
- [ ] Alle Tests bestanden (Build, TypeScript, Manuell)
- [ ] Keine Regression in bestehenden Features
- [ ] Metriken: [Metrik 1] erreicht Ziel
- [ ] Metriken: [Metrik 2] erreicht Ziel
- [ ] Code-Review positiv (falls Team-Projekt)

**Nice-to-Have (optional):**
- [ ] Performance besser als erwartet
- [ ] Positive User-Feedbacks

### Abbruch (Discard Experiment)
**Hard Criteria (eines erfüllt → Abbruch):**
- [ ] Build schlägt fehl und nicht binnen 2h lösbar
- [ ] Metriken verschlechtern sich um >10%
- [ ] Technischer Blocker (z.B. Browser-Inkompatibilität)
- [ ] Scope explodiert (>3x geplanter Aufwand)

**Soft Criteria (2+ erfüllt → Abbruch erwägen):**
- [ ] Metriken stagnieren (kein Fortschritt nach 3 Iterationen)
- [ ] Code zu komplex / nicht wartbar
- [ ] User-Feedback negativ
- [ ] Bessere Alternative identifiziert

### Iteration (Refine & Retry)
**Wann iterieren:**
- Metriken nur teilweise erreicht
- Edge Cases identifiziert
- User-Feedback ambivalent
- Technische Lösung suboptimal

---

## 🧪 Test-Plan

### 1. Build-Tests
```bash
npm run build        # ✅ / ❌
npx tsc --noEmit     # ✅ / ❌
npm run dev          # ✅ / ❌
```

### 2. Funktionale Tests
**User-Flows:**
- [ ] Flow 1: [Beschreibung] → **Ergebnis:** [✅ / ❌ + Details]
- [ ] Flow 2: [Beschreibung] → **Ergebnis:** [✅ / ❌ + Details]

**Edge Cases:**
- [ ] Edge 1: [Beschreibung] → **Ergebnis:** [✅ / ❌ + Details]
- [ ] Edge 2: [Beschreibung] → **Ergebnis:** [✅ / ❌ + Details]

### 3. Browser-Kompatibilität
- [ ] Chrome Desktop
- [ ] Safari Desktop
- [ ] Firefox Desktop
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### 4. Performance-Tests
```bash
# Lighthouse Score (vor/nach)
Performance: [Score] → [Score]
Accessibility: [Score] → [Score]
Best Practices: [Score] → [Score]

# Bundle Size
npm run build
Client Bundle: [Size] → [Size]
```

---

## 📈 Test-Ergebnisse

**Datum:** [Test-Datum]  
**Durchgeführt von:** [Name]

### Build-Status
- **Build:** ✅ / ❌ [Details]
- **TypeScript:** ✅ / ❌ [Fehleranzahl, falls >0]
- **Dev-Server:** ✅ / ❌ [Startup-Zeit]

### Funktionale Tests
[Kopiere Ergebnisse aus Test-Plan oben oder schreibe Summary]

### Metriken (Ist vs. Ziel)
| Metrik | Baseline | Ziel | Ist | Status |
|--------|----------|------|-----|--------|
| [Metrik 1] | [Wert] | [Wert] | [Wert] | ✅/❌ |
| [Metrik 2] | [Wert] | [Wert] | [Wert] | ✅/❌ |

### Screenshots / Videos
[Optional: Links zu Screenshots/Videos des Features in Aktion]

---

## 🎓 Lessons Learned

### Was lief gut? ✅
- [Erkenntnis 1]
- [Erkenntnis 2]

### Was lief schlecht? ❌
- [Problem 1]
- [Problem 2]

### Überraschungen
- [Unerwartetes Verhalten 1]
- [Unerwartetes Verhalten 2]

### Technische Schulden
- [Workaround 1, der später refactored werden sollte]
- [Quick Fix 2, der nicht optimal ist]

### Empfehlungen für zukünftige Experimente
- [Learning 1: z.B. "Früher testen auf Mobile"]
- [Learning 2: z.B. "Mehr Zeit für Edge Cases einplanen"]

---

## 🎯 Entscheidung

**Status:** [Wähle eine Option]

### ✅ MERGE TO MAIN
**Begründung:**
[Warum ist das Experiment erfolgreich?]

**Nächste Schritte:**
1. PR erstellen: `feature/exp-[name]-v[x]` → `main`
2. Code-Review (falls Team)
3. Merge & Deploy
4. Monitoring: [Welche Metriken überwachen wir nach Deploy?]

---

### 🔁 ITERATE (Version X+1)
**Begründung:**
[Was fehlt noch? Was muss verbessert werden?]

**Änderungen für nächste Iteration:**
1. [Änderung 1]
2. [Änderung 2]

**Neues Ziel:**
[Angepasste Metriken/Kriterien für v2]

---

### ❌ DISCARD
**Begründung:**
[Warum wird das Experiment verworfen?]

**Was behalten wir trotzdem:**
- [Learnings, die in andere Experimente einfließen]
- [Code-Snippets, die wiederverwendbar sind]

**Branch-Cleanup:**
```bash
git branch -D feature/exp-[name]-v[x]
git push origin --delete feature/exp-[name]-v[x]
```

---

## 📚 Referenzen

**Code:**
- [Link zu relevanten Code-Files auf GitHub]

**Dokumentation:**
- [Links zu verwandten Docs]

**Externe Ressourcen:**
- [Artikel, Papers, Libraries die genutzt wurden]

---

## 🗂️ Changelog

| Datum | Version | Änderung |
|-------|---------|----------|
| [Datum] | v1 | Initial Experiment |
| [Datum] | v1 | Test-Ergebnisse ergänzt |
| [Datum] | v1 | Entscheidung: [Merge/Iterate/Discard] |
