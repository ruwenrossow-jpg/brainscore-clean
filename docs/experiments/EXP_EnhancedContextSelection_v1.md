# EXP_EnhancedContextSelection_v1

**Status:** 🔄 In Progress  
**Branch:** `main` (direkt, da UX-Verbesserung)  
**Erstellt:** 28.11.2025  
**Verantwortlich:** AI Agent + User Request

---

## 📋 Kontext

**Warum dieses Experiment?**
Aktuell bietet der Kontext-Auswahl-Step nur 4 vordefinierte Optionen. User könnten mehr Vielfalt brauchen, um passende Test-Situationen zu finden. Die "Eigene Situation"-Funktion ist aktuell in einer separaten gestrichelten Box - sollte aber gleichwertig zu den anderen Optionen wirken.

**Aktueller Stand:**
- 4 vordefinierte Kontexte:
  - Vor dem Lernen / Arbeiten (08:00)
  - Nach Social Media / Scrollen (12:00)
  - Nach der Uni / Arbeit (17:00)
  - Abends vor dem Schlafen (21:30)
- "Eigene Situation" in separater gestrichelter Box
- Max. 3 Kontexte wählbar

**Ziel:**
- Mehr vordefinierte Optionen (8-10)
- "Eigene Situation" als gleichwertige Karte
- Intuitivere, selbsterklärende Labels

---

## 💡 Hypothese(n)

**Haupthypothese:**
Mehr Kontext-Optionen erhöhen die Wahrscheinlichkeit, dass User passende Situationen finden und daher eher 3 (statt nur 1-2) Kontexte auswählen.

**Annahmen:**
- User verstehen kurze, konkrete Situationsbeschreibungen
- 8-10 Optionen sind überschaubar (nicht überfordernd)
- "Eigene Situation" als Karte wirkt niedrigschwelliger

---

## 🔨 Was wird gebaut?

### Scope
**Neue Kontexte (8-10 Optionen):**
1. Vor dem Lernen / der Uni (08:00)
2. Nach dem Aufwachen (07:30)
3. Nach Social Media / Scrollen (12:00)
4. Nach der Arbeit / Vorlesung (17:00)
5. Nach einer Konzentrationsphase (15:00)
6. Wenn du dich zerstreut fühlst (14:00)
7. Vor wichtigen Aufgaben (09:00)
8. Abends vor dem Schlafen (21:30)
9. Nach dem Mittagessen (13:00)
10. Am Wochenende (11:00)

**Geänderte Dateien:**
- `src/features/onboarding/onboardingTypes.ts` - Erweiterte CONTEXT_SUGGESTIONS_WITH_TIMES
- `src/features/onboarding/ContextAndTimeStep.svelte` - "Eigene Situation" als Karte

**NICHT im Scope:**
- Änderung der Max-Anzahl (bleibt bei 3)
- Änderung der Speicherlogik
- Backend-Änderungen

### Technische Details
**"Eigene Situation" als Karte:**
- Gleicher visueller Stil wie vordefinierte Optionen
- Beim Klick: Karte expandiert und zeigt Input-Felder
- Kein separater "Hinzufügen"-Button mehr sichtbar bis Karte angeklickt

---

## 📊 Metriken

### Quantitative Metriken
| Metrik | Aktuell (Baseline) | Ziel | Messmethode |
|--------|-------------------|------|-------------|
| Durchschn. Kontexte pro User | ~2 (geschätzt) | 2.5+ | Analytics |
| % User mit 3 Kontexten | ~30% (geschätzt) | >50% | Analytics |

### Qualitative Metriken
- [ ] Kontexte selbsterklärend
- [ ] "Eigene Situation" intuitiv nutzbar
- [ ] Keine Überforderung durch zu viele Optionen

---

## ✅ Erfolgs- & Abbruchkriterien

### Erfolg
- [ ] Build erfolgreich
- [ ] 8-10 Kontext-Optionen verfügbar
- [ ] "Eigene Situation" als Karte implementiert
- [ ] Max. 3 Kontexte enforcement funktioniert
- [ ] Keine UI-Breaks auf Mobile

### Abbruch
- [ ] UI wird unübersichtlich (zu viele Optionen)
- [ ] Performance-Probleme
- [ ] User-Feedback negativ

---

## 🧪 Test-Plan

### Funktionale Tests
- [ ] Auswahl von 1, 2, 3 vordefinierten Kontexten
- [ ] Auswahl von 2 vordefiniert + 1 eigene Situation
- [ ] Versuch >3 Kontexte zu wählen (sollte blockiert werden)
- [ ] "Eigene Situation" Karte klicken → Expansion
- [ ] Custom Context hinzufügen und wieder entfernen

---

## 📈 Test-Ergebnisse

**Status:** In Progress
