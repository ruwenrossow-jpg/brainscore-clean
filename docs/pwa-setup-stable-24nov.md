# PWA Setup - Stable 24nov Branch

**Stand:** 27.11.2025 (nach Rollback + selektive PWA-Fixes)  
**Branch:** `stable-24nov` / `main`  
**Commit:** `a24dddd` (docs: Add PWA setup documentation)

---

## ✅ Vollständige PWA-Konfiguration

### 1. Icons (SVG-Format)
- ✅ `static/icon-192.svg` - PWA Icon 192×192
- ✅ `static/icon-512.svg` - PWA Icon 512×512
- ✅ `static/apple-touch-icon.svg` - iOS Touch Icon 180×180
- ✅ `static/logo.svg` - Favicon (Hauptlogo)
- ✅ `static/logo_neu.svg` - Alternative Favicon

**Design:**
- Hintergrund: `#7C3AED` (Brand Purple)
- Buchstabe: "B" in weiß (Inter Black 900)
- Abgerundete Ecken je nach Größe

**Dateigröße:** ~1.4 KB pro Icon (95% kleiner als PNG)

### 2. Manifest (`static/manifest.webmanifest`)
```json
{
  "name": "BrainrotAI - Cognitive Performance Testing",
  "short_name": "BrainrotAI",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#7C3AED",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "categories": ["health", "productivity", "education"],
  "lang": "de-DE"
}
```

### 3. HTML Meta-Tags (`src/app.html`)
```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#7C3AED" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="BrainrotAI" />
<meta name="mobile-web-app-capable" content="yes" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.webmanifest" />

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
<link rel="apple-touch-icon" sizes="192x192" href="/icon-192.svg" />
<link rel="apple-touch-icon" sizes="512x512" href="/icon-512.svg" />
<link rel="apple-touch-startup-image" href="/icon-512.svg" />

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

### 4. iOS-Spezifische Optimierungen
- ✅ `black-translucent` Status Bar Style (transparenter Hintergrund)
- ✅ `standalone` Display Mode (keine Safari UI)
- ✅ Safe Area Insets für Notch-Geräte
- ✅ Touch-Action Manipulation (kein Double-Tap Zoom)
- ✅ Mehrere Icon-Größen für verschiedene iOS-Versionen

### 5. Service Worker
- ✅ `src/service-worker.js` aktiv
- ✅ Caching-Strategie: Network-first mit Cache-Fallback
- ✅ Offline-Unterstützung für statische Assets

---

## 📱 Browser-Kompatibilität

**SVG Icons unterstützt:**
- ✅ Chrome 93+ (Desktop & Mobile)
- ✅ Safari 15+ (iOS 15+)
- ✅ Firefox 92+
- ✅ Edge 93+

**iOS PWA Standalone Mode:**
- ✅ iOS 15+: Vollständig unterstützt
- ⚠️ iOS 14: SVG Icons funktionieren, aber begrenztere PWA-Features
- ❌ iOS 13 und älter: Nur Web-App-Modus (keine echte Standalone-Installation)

---

## 🎯 Features

### Installierbarkeit
- ✅ "Zum Home-Bildschirm hinzufügen" (iOS Safari)
- ✅ "App installieren" (Chrome Desktop/Android)
- ✅ Standalone-Modus ohne Browser-UI

### Performance
- ✅ 95% kleinere Icon-Dateien (SVG vs PNG)
- ✅ Offline-fähig durch Service Worker
- ✅ Schnellere Ladezeiten durch Caching

### User Experience
- ✅ Branded Splash Screen auf iOS
- ✅ Theme-Color in System UI (#7C3AED)
- ✅ Full-Screen ohne URL-Leiste
- ✅ App-ähnliches Look & Feel

---

## 🔍 Unterschied zu 27nov (experimental)

### Was NICHT übernommen wurde:
- ❌ Komplexe Onboarding-Logik (7 Steps)
- ❌ Routing v2.0 mit 4 States
- ❌ Tutorial-Modus
- ❌ Experimentelle UI-Component-Library
- ❌ Design-Token-System

### Was übernommen wurde:
- ✅ SVG Icons statt PNG (e323e70)
- ✅ Vollständiges Manifest (e323e70)
- ✅ iOS-optimierte Meta-Tags (e323e70)
- ✅ PWA-Dokumentation (a24dddd)

---

## 📚 Dokumentation

Siehe detaillierte Setup-Anleitungen:
- **Icon-Design & Erstellung:** [PWA_ICONS_SETUP.md](../PWA_ICONS_SETUP.md)
- **iOS-Installation & Troubleshooting:** [PWA_IOS_SETUP.md](../PWA_IOS_SETUP.md)
- **Testing-Checklist:** [PWA_TESTING.md](../PWA_TESTING.md)

---

## ✅ Verifikation

### Build-Test
```bash
npm run build
# ✅ Keine Fehler bei Icon-/Manifest-Verarbeitung
# ✅ Service Worker erfolgreich gebundled
```

### Runtime-Test
```bash
npm run dev
# Browser öffnen auf http://localhost:5173
# DevTools > Application > Manifest prüfen
# ✅ Icons laden korrekt
# ✅ Theme-Color wird angezeigt
```

### Deployment
```bash
git push origin main
# Vercel Deployment: https://brainscore-clean.vercel.app/
# ✅ Manifest unter /manifest.webmanifest erreichbar
# ✅ Icons unter /icon-192.svg und /icon-512.svg laden
```

---

## 🎓 Lessons Learned

1. **SVG > PNG für PWA Icons**
   - 95% kleinere Dateigröße
   - Bessere Skalierung
   - Browser-Support ausreichend (iOS 15+)

2. **iOS braucht spezielle Meta-Tags**
   - `apple-mobile-web-app-*` essentiell für Standalone-Modus
   - `black-translucent` für moderne iOS-Ästhetik
   - Mehrere Icon-Größen für Kompatibilität

3. **Manifest muss valide sein**
   - `start_url` muss absoluten Pfad haben
   - `scope` bestimmt, welche URLs in PWA bleiben
   - `purpose: "any maskable"` für adaptives Icon-Design

4. **Service Worker automatisch von SvelteKit**
   - `src/service-worker.js` wird von Vite gebundled
   - Keine manuelle Registrierung nötig
   - Caching-Strategie bereits implementiert

---

**Status:** ✅ PWA-Setup vollständig und produktionsbereit
