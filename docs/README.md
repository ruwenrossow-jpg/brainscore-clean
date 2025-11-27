# BrainrotAI – Dokumentation

**Zentrale Übersicht aller Dokumentation**

> Letzte Aktualisierung: 2025-01-26

---

## 📚 Masterdokumente (Single Source of Truth)

Die **Masterdokumente** sind die verbindlichen Referenzen für Design, Architektur und Logik.  
Sie befinden sich in `docs/master/` und werden bei jeder Änderung versioniert.

| Dokument | Beschreibung | Status |
|----------|--------------|--------|
| [`master/overview.md`](./master/overview.md) | System-Übersicht & Verlinkung aller Masterdokumente | ✅ Aktiv |
| [`master/design-system.md`](./master/design-system.md) | UI, Farben, Typografie, Komponenten | ✅ Aktiv |
| [`master/animations.md`](./master/animations.md) | Motion-Design, Transitions, Durations | ✅ Aktiv |
| [`master/test-logic.md`](./master/test-logic.md) | SART-Test, BrainScore-Berechnung | ✅ Aktiv |
| [`master/contributing-vibes.md`](./master/contributing-vibes.md) | Entwicklungs-Workflow, Code-Konventionen | ✅ Aktiv |

**→ Start hier:** [`master/overview.md`](./master/overview.md)

---

## 📋 Weitere Dokumentation

### Architektur & Flows

| Dokument | Beschreibung | Status |
|----------|--------------|--------|
| [`requirements.md`](./requirements.md) | Funktionale Anforderungen | ✅ Aktiv |
| [`routing-logik-v2.md`](./routing-logik-v2.md) | Routing-Architektur | ✅ Aktiv |
| [`test-flow-v2.md`](./test-flow-v2.md) | Test-Flow-Diagramm | ✅ Aktiv |
| [`tutorial-mode-flow.md`](./tutorial-mode-flow.md) | Tutorial-Spezifikation | ✅ Aktiv |
| [`tutorial-mode.md`](./tutorial-mode.md) | Tutorial-Konzept | ✅ Aktiv |

### Legacy-Dokumentation (veraltet)

| Dokument | Beschreibung | Status |
|----------|--------------|--------|
| [`design-guide.md`](./design-guide.md) | Altes Design-System | ⚠️ **DEPRECATED** (siehe `master/design-system.md`) |

---

## 🚀 Quick-Links für Entwickler

### Ich möchte...

- **Ein neues Feature bauen** → [`master/contributing-vibes.md`](./master/contributing-vibes.md)
- **UI-Komponente stylen** → [`master/design-system.md`](./master/design-system.md)
- **Animation hinzufügen** → [`master/animations.md`](./master/animations.md)
- **Test-Logik verstehen** → [`master/test-logic.md`](./master/test-logic.md)
- **Überblick erhalten** → [`master/overview.md`](./master/overview.md)

### Code-Pendants (Implementierung)

- **Design-Tokens:** `src/lib/design/tokens.ts`
- **UI-Komponenten:** `src/lib/components/ui/*`
- **Test-Engine:** `src/features/brainrotTest/*`
- **Layout-Komponenten:** `src/lib/components/layout/*`

---

## 📝 Dokumentations-Workflow

### Änderungen an Masterdokumenten

1. **Issue erstellen:** "Masterdokument-Update: [Thema]"
2. **Review:** Mindestens 1 Team-Member prüft Rationale
3. **Approval:** Explizite Zustimmung erforderlich
4. **Update:** Masterdokument aktualisieren + Version erhöhen
5. **Code-Update:** Alle betroffenen Code-Pendants anpassen
6. **Testing:** Sicherstellen, dass Implementierung korrekt

### Neue Dokumentation erstellen

**Für Feature-spezifische Docs:**
```
docs/features/[feature-name].md
```

**Für projektweite Architektur-Docs:**
```
docs/[topic].md
```

**Für Masterdokumente:**
```
docs/master/[topic].md
```
(Nur nach Team-Approval!)

---

## 🔍 Suche & Navigation

### Volltextsuche

Nutze die GitHub-Suche oder `grep` im Terminal:

```bash
# Suche nach "BrainScore" in allen Markdown-Dateien
grep -r "BrainScore" docs/

# Suche nach "Button" in Masterdokumenten
grep -r "Button" docs/master/
```

### Verlinkung

Alle Masterdokumente sind untereinander verlinkt.  
Start: [`master/overview.md`](./master/overview.md)

---

## 📞 Support

**Bei Fragen zur Dokumentation:**
- Issue erstellen mit Label `documentation`
- Team-Channel (Discord/Slack)

**Bei fehlender Dokumentation:**
- Issue erstellen: "Missing docs: [Thema]"
- Template nutzen (falls vorhanden)

---

**Maintainer:** BrainrotAI Core Team  
**Letzte Review:** 2025-01-26
