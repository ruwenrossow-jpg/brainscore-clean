# BrainScore - Clean Architecture

Cognitive Performance Testing Web-App mit SART-Test.

## 🏗️ Projekt-Struktur

```
brainscore-clean/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── base/           # Wiederverwendbare UI-Komponenten
│   │   │   │   ├── BaseCard.svelte
│   │   │   │   └── BaseButton.svelte
│   │   │   └── sart/           # SART-Test spezifische Komponenten
│   │   │       ├── SartInstructions.svelte
│   │   │       ├── SartTest.svelte
│   │   │       ├── SartResult.svelte
│   │   │       ├── ScreentimeForm.svelte
│   │   │       └── SuccessScreen.svelte
│   │   ├── services/           # Business Logic Layer
│   │   │   ├── supabase.client.ts
│   │   │   ├── database.types.ts
│   │   │   └── sart.service.ts
│   │   └── types/              # TypeScript Definitionen
│   │       └── sart.types.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte        # Landing Page
│   │   └── test/
│   │       └── +page.svelte    # Test Flow (State Machine)
│   ├── app.css                 # Globale Styles
│   └── app.html
├── package.json
├── tailwind.config.ts
└── .env.example
```

## 🚀 Setup

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen setzen:**
   ```bash
   cp .env.example .env
   # Trage deine Supabase-Credentials ein
   ```

3. **Dev-Server starten:**
   ```bash
   npm run dev
   ```

## 🎯 Architektur-Prinzipien

### **Separation of Concerns**
- **Services**: Alle Business-Logic (Berechungen, DB-Calls)
- **Components**: Nur UI und User-Interaktion
- **Types**: Zentrale Typdefinitionen für Type-Safety

### **DRY (Don't Repeat Yourself)**
- `BaseCard` und `BaseButton` für konsistentes Design
- `SartService` kapselt alle Test-Logik

### **Type-Safety**
- Konsequente TypeScript-Nutzung
- Interfaces für alle Daten-Strukturen
- Keine `any` Types (außer wo unvermeidbar)

### **Error Handling**
- Try-Catch in allen async Funktionen
- Fehler werden geloggt und User-freundlich angezeigt

## 📊 Datenbank-Schema (Supabase)

### `sart_sessions`
```sql
id               UUID PRIMARY KEY
created_at       TIMESTAMP
ce_count         INTEGER
oe_count         INTEGER
go_count         INTEGER
nogo_count       INTEGER
mean_rt_ms       INTEGER
sd_rt_ms         INTEGER
score            INTEGER
```

### `screentime_reports`
```sql
id                UUID PRIMARY KEY
created_at        TIMESTAMP
session_id        UUID REFERENCES sart_sessions(id)
total_minutes     INTEGER
activations       INTEGER
app1_name         TEXT
app1_activations  INTEGER
```

## 🎨 Design-System

### Farben
- Primary: `#000000` (Schwarz)
- Background: `#ffffff` (Weiß)
- Cards: `#f7f7f7` (Off-White)
- Text: `#1a1a1a` (Fast-Schwarz)

### Spacing
- Container-Padding: `py-12` (48px)
- Card-Spacing: `space-y-6` (24px)
- Mobile-First: Responsive mit Tailwind Breakpoints

## 🧪 Testing

```bash
npm run check      # TypeScript Check
npm run build      # Production Build
```

## 📝 Nächste Schritte

- [ ] Unit-Tests für SartService
- [ ] E2E-Tests mit Playwright
- [ ] PWA-Features (Offline-Modus)
- [ ] User-Authentication
- [ ] Dashboard für Ergebnisse

---

**Made with ❤️ using SvelteKit + TypeScript + Tailwind**
