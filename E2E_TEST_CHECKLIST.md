# E2E Test Checklist - stable-24nov Branch

**Datum:** 27.01.2025  
**Tester:** ___________________  
**Branch:** `stable-24nov` (Commit: 3cd04ed)  
**Test-URL:** http://localhost:5174/

---

## ✅ Test-Status

- [ ] **Alle Tests bestanden** - Branch bereit für Merge in `main`
- [ ] **Tests mit Problemen** - Fixes erforderlich (siehe Notizen unten)
- [ ] **Tests abgebrochen** - Kritische Blocker gefunden

---

## 1️⃣ Landing Page (nicht eingeloggt)

**URL:** http://localhost:5174/

### Erwartetes Verhalten:
- Zeigt Startscreen mit Logo + Claim
- Primär-CTA: "Jetzt starten" (führt zu `/auth`)
- Sekundär-CTA: "Ohne Anmeldung testen" (führt zu `/test`) ← **WICHTIG: Sollte NICHT mehr da sein!**
- Keine automatischen Redirects

### Test-Schritte:
- [ ] **1.1** Seite lädt ohne Console-Errors ✅ / ❌
- [ ] **1.2** Logo wird angezeigt ✅ / ❌
- [ ] **1.3** "Jetzt starten" Button sichtbar und klickbar ✅ / ❌
- [ ] **1.4** Klick auf "Jetzt starten" führt zu `/auth` ✅ / ❌
- [ ] **1.5** Keine automatischen Redirects ✅ / ❌

**Notizen:**
```
(Probleme, Console-Errors, etc.)
```

---

## 2️⃣ Registrierung & Login

**URL:** http://localhost:5174/auth

### Erwartetes Verhalten:
- E-Mail + Passwort Eingabe
- "Registrieren" und "Anmelden" Buttons
- Nach erfolgreicher Registrierung: Redirect zu `/onboarding`
- **KEIN** "Profile does not exist" Error
- **KEIN** "User already exists" Error bei neuem Account

### Test-Schritte (Registrierung):
- [ ] **2.1** Auth-Seite lädt ohne Errors ✅ / ❌
- [ ] **2.2** E-Mail-Eingabe funktioniert ✅ / ❌
- [ ] **2.3** Passwort-Eingabe funktioniert ✅ / ❌
- [ ] **2.4** "Registrieren" funktioniert ✅ / ❌
- [ ] **2.5** Nach Registrierung: Redirect zu `/onboarding` ✅ / ❌
- [ ] **2.6** **KEIN** "Profile does not exist" Error ✅ / ❌

**Test-Account:**
```
E-Mail: test-stable-24nov-[timestamp]@test.local
Passwort: TestPass123!
```

**Notizen:**
```
(Probleme, Console-Errors, User-ID falls relevant)
```

### Test-Schritte (Login mit bestehendem Account):
- [ ] **2.7** Logout durchführen ✅ / ❌
- [ ] **2.8** Erneut zu `/auth` navigieren ✅ / ❌
- [ ] **2.9** Mit Test-Account einloggen ✅ / ❌
- [ ] **2.10** Redirect zu `/dashboard` (wenn Onboarding bereits abgeschlossen) ✅ / ❌

---

## 3️⃣ Onboarding (4 Schritte)

**URL:** http://localhost:5174/onboarding

### Erwartetes Verhalten:
- **NUR 4 Schritte** (Step 1, 2, 3, 4)
- **KEINE Steps 0, 5, 6, 7** (die gehören zur experimentellen Version)
- Fortschrittsanzeige: "Schritt X von 4"
- Navigation: [Zurück] [Weiter →] Buttons
- Nach Abschluss: Redirect zu `/test`

### Test-Schritte:

#### **Step 1: Name eingeben**
- [ ] **3.1** Überschrift: "WILLKOMMEN! LASS UNS DEINE AUFMERKSAMKEIT VERSTEHEN." ✅ / ❌
- [ ] **3.2** Name-Eingabefeld vorhanden ✅ / ❌
- [ ] **3.3** "Los geht's →" Button funktioniert ✅ / ❌
- [ ] **3.4** Weiter zu Step 2 ✅ / ❌

**Notizen:**
```
```

#### **Step 2: Ziele auswählen**
- [ ] **3.5** Überschrift: "Deine Ziele" ✅ / ❌
- [ ] **3.6** Max 3 Ziele auswählbar ✅ / ❌
- [ ] **3.7** Ausgewählte Ziele werden markiert ✅ / ❌
- [ ] **3.8** [Zurück] Button funktioniert ✅ / ❌
- [ ] **3.9** [Weiter →] Button funktioniert ✅ / ❌
- [ ] **3.10** Weiter zu Step 3 ✅ / ❌

**Notizen:**
```
```

#### **Step 3: Kontexte + Zeiten**
- [ ] **3.11** Überschrift: "Wann möchtest du dich einchecken?" ✅ / ❌
- [ ] **3.12** Max 3 Kontext-Zeit-Kombinationen wählbar ✅ / ❌
- [ ] **3.13** [Zurück] Button funktioniert ✅ / ❌
- [ ] **3.14** [Weiter →] Button funktioniert ✅ / ❌
- [ ] **3.15** Weiter zu Step 4 ✅ / ❌

**Notizen:**
```
```

#### **Step 4: Summary + Erste Test**
- [ ] **3.16** Überschrift: "Alles bereit!" ✅ / ❌
- [ ] **3.17** Übersicht zeigt Name, Ziele, Kontexte ✅ / ❌
- [ ] **3.18** "Kalender-Reminder hinzufügen" Button vorhanden ✅ / ❌
- [ ] **3.19** "🚀 Ersten Test starten" Button vorhanden ✅ / ❌
- [ ] **3.20** Klick auf "Ersten Test starten" führt zu `/test` ✅ / ❌
- [ ] **3.21** **KEINE** Registrierungs-Step (Step 4 in experimenteller Version) ✅ / ❌
- [ ] **3.22** **KEIN** PWA-Tutorial (Step 5 in experimenteller Version) ✅ / ❌

**Notizen:**
```
```

**KRITISCH - Verifizierung:**
- [ ] **3.23** Onboarding hat NUR 4 Steps (keine 7) ✅ / ❌
- [ ] **3.24** Fortschrittsanzeige zeigt "Schritt X von 4" (nicht "von 7") ✅ / ❌

---

## 4️⃣ SART-Test

**URL:** http://localhost:5174/test

### Erwartetes Verhalten:
- Test-Instruktionen werden angezeigt
- Countdown: 3, 2, 1 (Ampel)
- 90 Trials (nicht 10 wie im Tutorial)
- Zahl erscheint 500ms, Maske 900ms
- Nach Test: BrainScore + Result-Screen
- Session wird in `sart_sessions` gespeichert

### Test-Schritte:

#### **Vor dem Test:**
- [ ] **4.1** Test-Seite lädt (kein Auth-Error) ✅ / ❌
- [ ] **4.2** Instruktionen werden angezeigt ✅ / ❌
- [ ] **4.3** "Test starten" Button funktioniert ✅ / ❌

#### **Während des Tests:**
- [ ] **4.4** Ampel-Countdown (3-2-1) wird angezeigt ✅ / ❌
- [ ] **4.5** Ampel ist INNERHALB der Stimulus-Box (stabiler Stand, kein Layout-Shift) ✅ / ❌
- [ ] **4.6** Test startet nach Countdown ✅ / ❌
- [ ] **4.7** Zahlen erscheinen (0-9, außer 3 ist No-Go) ✅ / ❌
- [ ] **4.8** "Reagieren" Button funktioniert ✅ / ❌
- [ ] **4.9** Trial-Zähler läuft (z.B. "Trial 5/90") ✅ / ❌
- [ ] **4.10** Test läuft bis zum Ende (90 Trials) ✅ / ❌

#### **Nach dem Test:**
- [ ] **4.11** Result-Screen wird angezeigt ✅ / ❌
- [ ] **4.12** BrainScore wird berechnet und angezeigt (0-100) ✅ / ❌
- [ ] **4.13** Ampel-Farbe (grün/gelb/rot) wird angezeigt ✅ / ❌
- [ ] **4.14** "Test beenden" Button führt zu Screentime-Eingabe ✅ / ❌
- [ ] **4.15** Session wird in DB gespeichert (Check Supabase) ✅ / ❌

**Notizen:**
```
BrainScore: ____
Validity: ✅ Valid / ⚠️ Invalid
Console-Errors: 
```

**KRITISCH - Verifizierung:**
- [ ] **4.16** **KEIN** Tutorial-Modus (10 Trials, langsamer) ✅ / ❌
- [ ] **4.17** Echter Test mit 90 Trials, 500ms/900ms Timing ✅ / ❌

---

## 5️⃣ Dashboard

**URL:** http://localhost:5174/dashboard

### Erwartetes Verhalten:
- Zeigt Heute-Score + Ampel
- Zeigt 7-Tage-Durchschnitt
- Zeigt Wochenverlauf-Chart (letzte 14 Tage)
- **WICHTIG:** Chart zeigt Daten auch wenn `daily_scores` leer (Fallback auf `sart_sessions`)
- Keine Console-Errors

### Test-Schritte:

#### **Nach erstem Test:**
- [ ] **5.1** Dashboard lädt ohne Errors ✅ / ❌
- [ ] **5.2** "Heute"-Karte zeigt Score ✅ / ❌
- [ ] **5.3** "Heute"-Karte zeigt Ampel (richtige Farbe) ✅ / ❌
- [ ] **5.4** "7-Tage"-Karte zeigt Durchschnitt (oder "Nicht genug Daten") ✅ / ❌
- [ ] **5.5** Chart zeigt mindestens 1 Bar (heutiger Test) ✅ / ❌
- [ ] **5.6** Chart-Bar hat richtige Höhe (proportional zu Score) ✅ / ❌
- [ ] **5.7** Hover auf Bar zeigt Tooltip (Datum, Score, Test-Anzahl) ✅ / ❌
- [ ] **5.8** "Neuer Test starten" Button funktioniert ✅ / ❌

**Console-Log-Prüfung (wichtig!):**
- [ ] **5.9** Console zeigt `📊 getDashboardData - twoWeekTrend:` Log ✅ / ❌
- [ ] **5.10** Console zeigt `📊 DailyTrendChart received: X entries` ✅ / ❌
- [ ] **5.11** **KEIN** Error: "Cannot read property 'dailyScore' of undefined" ✅ / ❌

**Notizen:**
```
Heute-Score: ____
7-Tage-Durchschnitt: ____
Chart-Bars sichtbar: ____
Console-Logs (relevante):
```

#### **Fallback-Test (optional, wenn Zeit):**
Prüfe ob Dashboard funktioniert wenn `daily_scores` leer ist:
- [ ] **5.12** Supabase: `daily_scores` Tabelle leeren ✅ / ❌
- [ ] **5.13** Dashboard neu laden ✅ / ❌
- [ ] **5.14** Console zeigt: `⚠️ No daily_scores found, falling back to direct session aggregation` ✅ / ❌
- [ ] **5.15** Chart zeigt trotzdem Daten (aus `sart_sessions`) ✅ / ❌

---

## 6️⃣ PWA-Features

**URL:** http://localhost:5174/

### Erwartetes Verhalten:
- Manifest unter `/manifest.webmanifest` erreichbar
- SVG-Icons werden korrekt geladen
- Theme-Color: #7C3AED (lila)
- iOS: App ist installierbar

### Test-Schritte:

#### **Manifest:**
- [ ] **6.1** http://localhost:5174/manifest.webmanifest lädt ohne 404 ✅ / ❌
- [ ] **6.2** Manifest enthält `theme_color: "#7C3AED"` ✅ / ❌
- [ ] **6.3** Manifest enthält SVG-Icons (icon-192.svg, icon-512.svg) ✅ / ❌

#### **Icons:**
- [ ] **6.4** http://localhost:5174/icon-192.svg lädt korrekt ✅ / ❌
- [ ] **6.5** http://localhost:5174/icon-512.svg lädt korrekt ✅ / ❌
- [ ] **6.6** http://localhost:5174/apple-touch-icon.svg lädt korrekt ✅ / ❌
- [ ] **6.7** Browser-Tab zeigt Favicon (logo.svg) ✅ / ❌

#### **Theme-Color:**
- [ ] **6.8** Browser-UI zeigt lila Theme-Color (#7C3AED) ✅ / ❌
  - Chrome Android: Adressleiste lila
  - Safari iOS: Status-Bar lila

#### **Installierbarkeit (optional, wenn Zeit):**
- [ ] **6.9** Chrome: "App installieren" Button erscheint ✅ / ❌ / ⏭️
- [ ] **6.10** iOS Safari: "Zum Homescreen hinzufügen" funktioniert ✅ / ❌ / ⏭️
- [ ] **6.11** Installierte App zeigt SVG-Icon (nicht Placeholder) ✅ / ❌ / ⏭️

**Notizen:**
```
Device: Desktop / Mobile / iOS / Android
Browser: Chrome / Safari / Firefox / Edge
PWA installiert: Ja / Nein
```

---

## 7️⃣ Routing & Navigation

### Erwartetes Verhalten:
- Keine komplexen 4-State-Logik auf Landing Page
- Keine automatischen Redirects ohne User-Aktion
- Keine `/test/tutorial` Route (gehört zur experimentellen Version)

### Test-Schritte:

#### **Landing Page States:**
- [ ] **7.1** Guest-State: "Jetzt starten" → `/auth` ✅ / ❌
- [ ] **7.2** Logged in + Onboarding complete: "Test starten" + "Zum Dashboard" ✅ / ❌
- [ ] **7.3** **KEINE** 4 verschiedenen States (showAuth, showStartscreen, etc.) ✅ / ❌

#### **Route-Check:**
- [ ] **7.4** http://localhost:5174/test/tutorial gibt 404 ✅ / ❌
- [ ] **7.5** http://localhost:5174/onboarding ist öffentlich zugänglich ✅ / ❌

**Notizen:**
```
```

---

## 🔧 Gefundene Probleme

### Kritisch (⛔ Blocker):
```
1. [Beschreibung]
   - File: 
   - Expected: 
   - Actual: 
```

### Major (⚠️ Muss gefixt werden):
```
1. [Beschreibung]
```

### Minor (ℹ️ Nice-to-have):
```
1. [Beschreibung]
```

---

## ✍️ Tester-Notizen

**Gesamteindruck:**
```
(Stabilität, Performance, UX, etc.)
```

**Empfehlung:**
- [ ] ✅ **Merge in `main` empfohlen** - Alle kritischen Tests bestanden
- [ ] ⚠️ **Fixes erforderlich** - Siehe Probleme oben
- [ ] ❌ **NICHT mergen** - Kritische Bugs gefunden

**Zeitaufwand:** ___ Minuten

**Signatur:** ___________________  **Datum:** ___________________

---

## 📚 Referenzen

- **Rollback-Dokumentation:** `docs/STABLE_24NOV_ROLLBACK.md`
- **Change-Analysis:** `CHANGE_ANALYSIS_24NOV_TO_27NOV.md`
- **Branch:** `stable-24nov` (Commit: 3cd04ed)
- **Basis-Commit:** `0c6364e` (24.11.2025)
