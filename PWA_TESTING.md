# PWA Testing Guide - BrainrotAI

## iOS PWA Installation & Testing

### Installation auf iPhone/iPad

1. **Öffne die App in Safari**
   - Navigiere zu: `https://your-domain.vercel.app` (oder lokale URL während Entwicklung)
   - **Wichtig:** Nur Safari unterstützt PWA-Installation, Chrome/Firefox nicht!

2. **Zum Home-Bildschirm hinzufügen**
   - Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) in der unteren Leiste
   - Scrolle nach unten und wähle **"Zum Home-Bildschirm"**
   - Bestätige mit **"Hinzufügen"**

3. **App-Icon erscheint**
   - BrainrotAI erscheint jetzt als App-Icon auf dem Home-Bildschirm
   - Icon verwendet `/static/icon-192.png` und `/static/icon-512.png`

### Fullscreen-Testing (Alle Screens)

Öffne die App **vom Home-Bildschirm** (nicht in Safari!) und teste folgende Screens:

#### ✅ Zu testende Screens:

1. **Startscreen (Landing Page)**
   - Kein Browser-Chrome sichtbar
   - Emotionale Headline: "Verstehe endlich, was deine Aufmerksamkeit wirklich steuert."
   - Buttons: "Jetzt starten" / "Ohne Anmeldung testen"

2. **Auth Screen (Login/Register)**
   - Tabs zwischen Login/Register
   - Kein oberer/unterer Rand sichtbar

3. **Onboarding Flow**
   - Welcome → Form → Saving
   - Progress-Dots funktionieren
   - Fullscreen ohne Ränder

4. **Dashboard**
   - Score-Card, Stats, Session-History
   - Navigation zu "/test" bleibt in der App

5. **SART Test**
   - Countdown (3-2-1)
   - Test läuft Fullscreen
   - Button-Interaktionen funktionieren

6. **Screentime Form**
   - Dropdown für Bildschirmzeit (30-Min-Schritte)
   - Autocomplete für Apps
   - Kein Rand oben/unten

### Expected Behavior (Fullscreen PWA)

✅ **Correct:**
- Kein Safari-Browser-Chrome (keine URL-Leiste, keine Bottom-Bar)
- App läuft randlos von Notch bis Home-Indicator
- Safe-Areas werden respektiert (Text nicht unter Notch)
- Alle Transitions bleiben innerhalb der App

❌ **Incorrect (wenn im Safari geöffnet):**
- Safari zeigt immer Browser-Chrome (URL-Leiste, Tabs)
- Das ist **normal** und **gewollt** - nur PWA-Modus ist Fullscreen!

### Technische Details (für Entwickler)

#### CSS Safe-Areas
```css
/* app.css */
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) 
          env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.pwa-safe-screen {
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

#### Meta-Tags (app.html)
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

#### PWA Manifest (vite.config.ts)
```typescript
manifest: {
  display: 'standalone',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  scope: '/',
  start_url: '/'
}
```

### Debugging PWA Issues

**Problem:** App öffnet sich in Safari statt als PWA
- **Lösung:** Lösche das Icon vom Home-Bildschirm und installiere neu

**Problem:** Externe Links öffnen sich außerhalb der App
- **Lösung:** Navigation-Handler in `+layout.svelte` blockiert externe URLs automatisch

**Problem:** Safe-Areas funktionieren nicht
- **Lösung:** `viewport-fit=cover` muss im `<meta>` Tag gesetzt sein (bereits vorhanden)

**Problem:** App zeigt weiße Ränder oben/unten
- **Lösung:** Alle Screens nutzen jetzt `.pwa-safe-screen` statt `py-12`

### Android PWA Testing

1. **Chrome auf Android**
   - Öffne die URL in Chrome
   - Tippe auf **⋮** (Menü)
   - Wähle **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**

2. **Behavior**
   - Android respektiert Safe-Areas automatisch
   - Kein Browser-Chrome sichtbar
   - Status-Bar kann transparent sein (je nach Android-Version)

### Test-Checkliste

- [ ] PWA installiert auf iOS (Safari → Home-Bildschirm)
- [ ] Startscreen zeigt emotionale Headlines
- [ ] Alle Screens laufen randlos (kein Browser-Chrome)
- [ ] Safe-Areas funktionieren (Text nicht unter Notch)
- [ ] Navigation zwischen Screens bleibt in der App
- [ ] Test-Flow komplett durchführbar (Login → Dashboard → Test → Result)
- [ ] Externe Links werden blockiert (z.B. in Konsole prüfen)

### Production Deployment

**Vor dem Deployment prüfen:**
1. Icons vorhanden: `/static/icon-192.png`, `/static/icon-512.png`
2. Manifest generiert: `npm run build` erzeugt `.vite/manifest.json`
3. Service Worker aktiv: In DevTools → Application → Service Workers
4. HTTPS aktiviert: PWAs erfordern HTTPS (Vercel/Netlify automatisch)

**Nach Deployment:**
1. PWA auf echtem iPhone installieren
2. Alle Screens testen (siehe Checkliste oben)
3. Performance prüfen: Service Worker cached Assets
