# Experiments Archive

Dieses Verzeichnis enthält die Dokumentation aller durchgeführten Experimente für BrainrotAI.

---

## 📋 Aktuelle Experimente

*Noch keine Experimente durchgeführt.*

---

## 🔄 Experiment-Status

### 🔄 In Progress
*Keine aktiven Experimente.*

### ✅ Successful (Merged to main)
*Noch keine erfolgreichen Experimente.*

### 🔁 Iterating
*Keine Experimente in Iteration.*

### ❌ Discarded
*Noch keine verworfenen Experimente.*

---

## 📚 Wie man ein neues Experiment startet

1. **Template kopieren:**
   ```bash
   cp docs/master/experiment-template.md docs/experiments/EXP_<Name>_v1.md
   ```

2. **Dokument ausfüllen:**
   - Kontext beschreiben
   - Hypothese definieren
   - Metriken festlegen
   - Erfolgs-/Abbruchkriterien setzen

3. **Branch erstellen:**
   ```bash
   git checkout -b feature/exp-<name>-v1
   ```

4. **Entwickeln nach 5-Phasen-Workflow:**
   - Siehe [Agent Guidelines](../master/agent-guidelines.md)

---

## 🎯 Naming Convention

```
EXP_<FeatureName>_v<Version>.md
```

**Beispiele:**
- `EXP_OnboardingWelcome_v1.md`
- `EXP_DashboardCharts_v2.md`
- `EXP_TutorialMode_v1.md`

---

## 📊 Experiment-Übersicht (Template)

Wenn Experimente durchgeführt werden, wird diese Tabelle befüllt:

| Name | Status | Branch | Metriken | Entscheidung | Datum |
|------|--------|--------|----------|--------------|-------|
| EXP_Example_v1 | ✅ | feature/exp-example-v1 | CTR: 15% → 22% | Merged | 2025-11-28 |

---

## 🔍 Schnellsuche

**Nach Status filtern:**
```bash
# Alle erfolgreichen Experimente
grep -l "Status: ✅ Success" docs/experiments/*.md

# Alle verworfenen Experimente
grep -l "Status: ❌ Discarded" docs/experiments/*.md
```

**Nach Feature suchen:**
```bash
# Alle Onboarding-Experimente
ls docs/experiments/EXP_Onboarding*.md
```

---

## 📖 Weiterführende Dokumentation

- [Agent Guidelines](../master/agent-guidelines.md) - Regelwerk für systematische Entwicklung
- [Experiment Template](../master/experiment-template.md) - Kopiervorlage
- [How to Work with Agent](../master/how-to-work-with-agent.md) - Anleitung für effektive Sessions

---

**Letzte Aktualisierung:** 28.11.2025
