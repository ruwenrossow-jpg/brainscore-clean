# BrainrotAI – MVP Requirements

## 1. Funktionale Anforderungen

### **Auth & User-Accounts**
- Login/Registrierung über Supabase Authentication
- Tests sind nur für eingeloggte Nutzer verfügbar (keine anonymen Sessions)
- User Profile mit Name und Primary Goal
- Session Management mit JWT-Tokens

### **Brainrot-SART Short v1**
- 60 Trials continuous sequence (keine sichtbaren Blöcke)
- Go/No-Go Test mit Ziffer 3 als No-Go (7-8 No-Go trials, ~11-13%)
- Stimulusdauer: 500ms, Maskendauer: 900ms, Total: 1400ms pro Trial
- BrainScore v1 (0–100) als Composite Score:
  - **30% Accuracy** (Commission/Omission Errors)
  - **35% Speed** (Mean RT mit Speed-Accuracy Trade-off)
  - **25% Consistency** (RT Variabilität/SD)
  - **10% Discipline** (Valid Trial Ratio)
- **Validitätsprüfung**: Tests werden als invalid markiert bei:
  - Protocol Quality < 80% (low_valid_ratio)
  - Ultra-fast Spam (<350ms mean RT + >30% Fehlerquote)

### **Test-Flow**
- **Onboarding-Wizard** (4 Schritte):
  1. Welcome & Name
  2. Zielauswahl (UserGoals: focus, impulsivity, fatigue, performanceAwareness, unsure; max. 3)
  3. Kontexte + Uhrzeiten kombiniert (TrackingContexts mit time in HH:MM, 15-Min-Raster; max. 3)
  4. Summary + ICS-Export mit täglichen Erinnerungen + Erster Test
  
- **Test-Seite** mit Flow:
  - Instruktionen → Test (60 Trials) → Ergebnis → Optionaler digitaler Check-in → Dashboard

### **Digitaler Check-in**
- Optionaler Schritt nach dem Test (Pro Test max. 1 Log)
- Erfasst drei Dimensionen:
  - **ScreenTime-Bucket**: '0-30', '30-60', '60-120', '120plus' (Minuten heute)
  - **Hauptnutzung**: MainCategories (social, video, games, work, other; max. 2)
  - **PickupFrequency**: low, medium, high, veryHigh (Aktivierungen)
- Speicherung in `digital_logs` Tabelle mit Foreign Key zu `sart_sessions`

### **Logbuch / Tages-Scores**
- **DailyScores**:
  - Aggregation von Test-Sessions zu `daily_scores` (date, dailyScore, testCount, first/lastTestAt)
  - Auto-Sync nach jedem Test-Abschluss
  - Berechnung: Durchschnitt aller BrainScores des Tages
  
- **Dashboard**:
  - Heute: Tages-Score + Test-Count + Score-Band (Konzentriert/Ablenkung)
  - Woche: 7-Tage-Durchschnitt, Best/Worst Day, Active Days
  - Verlauf: 14-Tage-Trend als interaktive Chart (Bars mit Hover)
  
- **Logbuch-Übersicht**:
  - Liste aller Tage mit Tests (chronologisch, neueste zuerst)
  - Badge mit Test-Count pro Tag
  
- **Tagesdetail** (`/logbuch/[date]`):
  - Alle Tests des Tages mit Uhrzeit, Score, Validitätsflag
  - **Kognitive Dimensionen** (Durchschnitte des Tages):
    - Impulsivität (Commission Errors)
    - Vigilanz (Omission Errors)
    - Stabilität (RT Consistency/SD)
    - Engagement (Valid Trial Ratio)

## 2. Nicht-funktionale Anforderungen

### **Usability & Mobile-First**
- Alle Kern-Views sind auf mobilen Viewports (375px+) gut nutzbar
- Views starten beim Aufruf oben (kein „abgeschnittener" Start via `scrollTo(0,0)`)
- Onboarding ist in 2–3 Minuten abschließbar
- Native mobile time picker für Zeitauswahl (15-Min-Raster via `step="900"`)
- Touch-Targets mindestens 44×44px
- PWA-Safe-Area-Insets für Notch/Home-Indicator

### **Visuelles Design**
- Angelehnt an Landingpage brainrotai.de
- **Farben**:
  - Brand Purple: `#7C3AED`
  - Purple Accent: `#A78BFA`
  - Brand Dark: `#0f0f0f`
  - Brand Green: `#10B981` (Success)
- **Typografie**:
  - Font: Inter (300, 400, 600, 700, 900)
  - Headlines: font-black (900 weight), 2xl–5xl
  - Body: 1rem–1.125rem, font-normal
- **Komponenten**:
  - Buttons: `rounded-full`, `shadow-purple-button`, hover:-translate-y-1
  - Cards: `rounded-2xl`, `shadow-xl`, `border-gray-100`
- Hohe Kontraste (min. WCAG AA für Text/Buttons: 4.5:1)
- **Keine Emojis** in produktiven UI-Komponenten (stattdessen Material Symbols Outlined Icons)

### **Daten & Privacy**
- Tests und Logs sind immer einem User-Account zugeordnet (`user_id NOT NULL`)
- Row Level Security (RLS) auf allen Tabellen (User sieht nur eigene Daten)
- Keine dauerhafte Speicherung von PII über das notwendige Minimum hinaus
- ICS-Export enthält keine sensitiven Daten (nur Context-Labels + Uhrzeiten)

### **Performance**
- Test-Interface mit sofortiger Reaktion (keine Verzögerung beim Klick)
- Dashboard-Loading mit 100ms Auth-State-Delay (vermeidet Flash-of-Content)
- Chart-Animationen: staggered 50ms per bar für smooth reveal
- Animations: `fadeIn` 0.5s, `slideUp` 0.6s cubic-bezier

## 3. Technische Anforderungen

### **Frontend**
- SvelteKit 5.0 mit Svelte 5 Runes (`$state`, `$props`, `$derived`)
- TypeScript für alle .ts/.svelte Files
- Tailwind CSS 3.x + DaisyUI für Komponenten
- Material Symbols Outlined für Icons

### **Backend/Database**
- Supabase PostgreSQL
- Tabellen:
  - `profiles` (user_id, name, primary_goal)
  - `sart_sessions` (user_id, brain_score, metrics, timestamps)
  - `daily_scores` (user_id, date, daily_score, test_count, aggregated metrics)
  - `digital_logs` (test_id FK, screen_time_bucket, main_categories[], pickup_frequency)
- RLS Policies auf allen Tabellen
- Auto-Trigger für `updated_at` Timestamps

### **API Routes**
- `/api/ics` (POST): ICS-Datei-Generierung aus TrackingContexts
- `/api/digital-log` (POST): Digital Log speichern/updaten

### **Deployment**
- Vercel oder ähnliche Plattform
- Environment Variables für Supabase (URL, Anon Key)
- PWA-Manifest für Add-to-Homescreen

## 4. Open Points / Future Work

### **Erweiterte Validierung**
- Test-Retest-Reliabilität messen
- Korrelation mit etablierten Fragebögen (z.B. Sustained Attention)
- Normwerte über größere Sample-Size

### **Bessere Screentime-Integration**
- Native System-APIs (iOS Screen Time, Android Digital Wellbeing)
- Automatischer Import statt manueller Eingabe
- Granularere Kategorien (App-Level statt übergeordnete Kategorien)

### **Erweiterte Insights**
- Personalisierte Empfehlungen basierend auf Patterns
- Wochenberichte mit Trend-Analyse
- Korrelation: ScreenTime vs. BrainScore
- Kontext-basierte Performance (Welcher Kontext = beste Scores?)

### **Social Features**
- Optionales Teilen von Achievements
- Anonymisierte Vergleichswerte (Peer-Group)
- Community-Challenges

### **Erweiterte Tests**
- Weitere kognitive Tests (Stroop, N-Back, etc.)
- Multi-Test-Battery für umfassende Profile
- Adaptive Test-Länge basierend auf Performance

---

**Version:** MVP v1.0  
**Letzte Aktualisierung:** Januar 2025  
**Status:** In Entwicklung
