# BrainrotAI – Design Guide

## 1. Brand & Tonalität

### **Zielgruppe**
Ambitionierte Studierende und Young Professionals, die an digitaler Ablenkung und kognitiver Fragmentierung leiden.

### **Tonalität**
- **Klar & fokussiert**: Direkte Kommunikation ohne Umschweife
- **Wissenschaftlich fundiert**: Basiert auf SART-Forschung, aber zugänglich erklärt
- **Empowerment**: Nutzer bekommt Kontrolle über seine Aufmerksamkeit zurück
- **Kein Gamification-Sprech**: Keine spielerischen Metaphern, keine infantilisierenden Formulierungen

### **Sprachstil**
- Aktive Verben: "Verstehe", "Tracke", "Kontrolliere"
- Direkte Ansprache: "Du" statt "Sie"
- Headlines: Imperativ oder Aussagen ("Gewinne die Kontrolle zurück", "Dein BrainScore")
- **Keine Emojis** in der UI (stattdessen: Material Symbols Outlined Icons)

## 2. Farben

### **Primärfarbe: Brand Purple**
```css
--brand-purple: #7C3AED;
--brand-purple-hover: #6D28D9;
--brand-purple-dark: #5B21B6;
```

**Einsatz:**
- Primäre Buttons (Gradient: `#7C3AED` → `#6D28D9`)
- Akzent-Highlights in Headlines (Gradient mit Text: "AUFMERKSAMKEIT")
- Links, Icons, Progress-Bars
- Hover-States (dunklere Variante)

### **Sekundärfarben**

**Brand Accent (Purple Light):**
```css
--brand-accent: #A78BFA;
```
- Für subtilere Highlights
- Hintergrund bei hover-cards
- Badge-Varianten

**Brand Dark:**
```css
--brand-dark: #0f0f0f;
```
- Footer-Hintergrund
- Sekundäre Buttons
- Text auf weißem Grund (Kontrast zu Black `#000000`)

**Brand Green (Success):**
```css
--brand-green: #10B981;
```
- Status-Badge "Konzentriert", "Sehr gut"
- Success-States
- Positive Trend-Indicators

**Weitere Akzentfarben:**
```css
--brand-warning: #fbbf24; /* Yellow */
--brand-error: #ef4444;   /* Red */
```

### **Graustufen**
```css
--gray-900: #1a1a1a;  /* Haupttext */
--gray-600: #6b7280;  /* Sekundärtext */
--gray-400: #9ca3af;  /* Tertiary Text */
--gray-200: #e5e7eb;  /* Borders, Dividers */
--gray-100: #f3f4f6;  /* Subtle Backgrounds */
--gray-50:  #f9fafb;  /* Card Backgrounds */
```

### **Kontrast-Anforderungen (WCAG AA)**
- **Text auf Weiß:** min. 4.5:1 → `gray-900` (#1a1a1a) ✓
- **Buttons (Text auf Hintergrund):** min. 4.5:1 → White on Purple (#7C3AED) ✓
- **Links:** `brand-purple` mit Underline on hover für zusätzliche Barrierefreiheit

## 3. Typografie

### **Schriftfamilie**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Import (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
```

**Gewichte:**
- 300 (Light): Für sehr subtile Texte (selten)
- 400 (Regular): Body Text, Descriptions
- 600 (SemiBold): Subheadlines, Labels
- 700 (Bold): Wichtige UI-Elemente, Buttons
- 900 (Black): Headlines, Hero-Text

### **Hierarchie**

**Headlines:**
- H1 (Hero): `text-5xl` (48px) bis `text-6xl` (60px), `font-black` (900)
- H2 (Section): `text-4xl` (36px), `font-black` (900)
- H3 (Subsection): `text-3xl` (30px), `font-bold` (700)
- H4 (Card Title): `text-2xl` (24px), `font-bold` (700)

**Body Text:**
- Large: `text-lg` (18px), `font-normal` (400)
- Base: `text-base` (16px), `font-normal` (400)
- Small: `text-sm` (14px), `font-medium` (500)
- Extra Small: `text-xs` (12px), `font-medium` (500)

**Line Heights:**
- Headlines: `leading-tight` (1.2)
- Body: `leading-relaxed` (1.625)

**Letter Spacing:**
- Headlines: `-tracking-tight` (-0.02em)
- Body: Default (0)
- Uppercase Labels: `tracking-wider` (0.05em)

### **Text-Gradients**
```css
/* Purple Gradient für Akzent-Wörter in Headlines */
.text-gradient-hero {
  background: linear-gradient(to right, #7C3AED, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Score Display mit Purple Gradient */
.text-gradient-purple {
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 4. Komponenten

### **Buttons**

**Primary Button (`btn-gradient-primary`):**
```html
<button class="bg-brand-purple hover:bg-purple-800 text-white font-bold 
               py-4 px-8 rounded-full 
               transition-all duration-300 
               shadow-xl shadow-purple-button hover:shadow-purple-button-hover 
               transform hover:-translate-y-1">
  BRAINROT TEST STARTEN
</button>
```

**Eigenschaften:**
- Border Radius: `rounded-full` (vollständig rund)
- Padding: Vertikal `py-4` (16px), Horizontal `px-8` (32px)
- Min-Height: 44px (Touch-Target)
- Hover: Leichtes Hochfahren `hover:-translate-y-1` (4px nach oben)
- Shadow: `shadow-purple-button` → `shadow-purple-button-hover` (intensiviert auf hover)

**Secondary Button (`btn-secondary`):**
```html
<button class="bg-black text-white px-5 py-2 rounded-full 
               text-sm font-bold 
               hover:bg-gray-800 transition transform hover:scale-105 
               shadow-lg">
  Nochmal testen
</button>
```

**Eigenschaften:**
- Schwarz statt Purple
- Kleinere Padding: `py-2 px-5`
- Hover: Leichte Skalierung `hover:scale-105` (5% größer)

### **Cards**

**Standard Card (`card-modern`):**
```html
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
  <!-- Content -->
</div>
```

**Eigenschaften:**
- Border Radius: `rounded-2xl` (16px)
- Shadow: `shadow-xl` (groß, aber weich)
- Border: `border border-gray-100` (sehr subtil, fast unsichtbar)
- Padding: `p-8` (32px innen)
- Hover: Optional `hover:shadow-2xl` (noch größer)

### **Badges**

**Status Badge (`badge-status`):**
```html
<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
            bg-brand-green text-white font-medium text-sm">
  <span class="material-symbols-outlined text-lg">check_circle</span>
  Konzentriert
</div>
```

**Varianten:**
- Success: `bg-brand-green`
- Warning: `bg-yellow-400 text-gray-900`
- Error: `bg-red-500 text-white`
- Info: `bg-brand-purple text-white`

### **Icon Container**

```html
<div class="bg-brand-purple/10 p-3 rounded-full">
  <span class="material-symbols-outlined text-brand-purple text-2xl">
    school
  </span>
</div>
```

**Eigenschaften:**
- Background: 10% Opacity der Primärfarbe (`bg-brand-purple/10`)
- Icon: Volle Primärfarbe
- Border Radius: `rounded-full`
- Padding: `p-3` (12px)

### **Input Fields**

```html
<input type="text" 
       class="input input-bordered w-full h-14 
              text-lg font-medium rounded-xl 
              bg-gray-50 border-gray-300 
              focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20">
```

**Eigenschaften:**
- Height: `h-14` (56px) für Touch-Targets
- Border Radius: `rounded-xl` (12px, weniger rund als Buttons)
- Background: `bg-gray-50` (subtiler als white)
- Focus: Purple Ring `focus:ring-brand-purple/20`

### **Progress Indicators**

**Step Dots (Onboarding):**
```html
<div class="w-2 h-2 rounded-full 
     {currentStep === step ? 'bg-black' : 'bg-gray-200'}">
</div>
```

**Progress Bar:**
```html
<div class="w-full bg-gray-100 rounded-full h-3">
  <div class="bg-gradient-purple h-3 rounded-full transition-all duration-500" 
       style="width: {progress}%"></div>
</div>
```

## 5. Layout

### **Container Max-Width**
- **Standard Content:** `max-w-7xl` (1280px)
- **Text Content:** `max-w-4xl` (896px)
- **Narrow Text:** `max-w-2xl` (672px)
- **Card/Form:** `max-w-lg` (512px)

### **Spacing**
- **Section Padding:** `py-12 lg:py-20` (vertikal), `px-4 sm:px-6 lg:px-8` (horizontal)
- **Card Padding:** `p-8` (32px) oder `p-10` (40px) für große Cards
- **Gap in Grids:** `gap-4` (16px) bis `gap-8` (32px)

### **Dashboard Layout**

**Struktur:**
```
├── Header (Glassmorphism Navbar)
├── Main Content (Container max-w-4xl)
│   ├── Today Section (Tages-Score, Badge, CTA)
│   ├── Weekly Section (7-Tage-Durchschnitt, Best/Worst)
│   └── Trend Chart (14 Tage)
└── Footer (Brand Dark Background)
```

**Sections:**
- Abstand zwischen Sections: `space-y-6` (24px)
- Card-Animation: `animate-fadeIn` mit `animation-delay` gestuft (0.1s, 0.2s)

### **Onboarding Wizard**

**Step-by-Step:**
- Progress Indicator oben zentriert (Dots + Line)
- Step Counter: "Schritt X von 4"
- Card mit Form-Content
- Navigation: Back (Secondary) + Next (Primary)

**Container:**
```html
<div class="min-h-screen bg-white flex items-center justify-center px-4 pwa-safe-screen">
  <div class="w-full max-w-2xl">
    <!-- Progress -->
    <!-- Card -->
  </div>
</div>
```

### **Responsive Breakpoints**
```css
/* Mobile First: Default */
/* Tablet: md: (768px+) */
/* Desktop: lg: (1024px+) */
```

**Responsive Text:**
```html
<h1 class="text-4xl lg:text-6xl">Headline</h1>
```

## 6. Animationen & Transitions

### **Fade-In**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
```

**Einsatz:** Cards beim Dashboard-Load, Success-Messages

### **Slide-Up**
```css
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.animate-slideUp {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

**Einsatz:** Hero-Content, Result-Cards

### **Hover-Transitions**

**Buttons:**
- Duration: `duration-300` (300ms)
- Transform: `hover:-translate-y-1` (4px nach oben)
- Shadow: Intensivierung auf hover

**Cards:**
- Duration: `duration-300`
- Shadow: `hover:shadow-2xl` (größer)

**Links:**
- Duration: `duration-200` (200ms)
- Color: `hover:text-brand-purple`
- Optional: Underline on hover für Barrierefreiheit

### **Timing Functions**
- **Standard:** `ease-out` (schneller Start, langsamer Ende)
- **Smooth Bounce:** `cubic-bezier(0.16, 1, 0.3, 1)`
- **Linear:** für Progress-Bars

## 7. Icons

### **Icon Library**
Google Material Symbols Outlined

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">
```

### **Verwendung**
```html
<span class="material-symbols-outlined text-brand-purple text-2xl">
  check_circle
</span>
```

### **Häufige Icons**
- `check_circle`: Success, Completed
- `school`: Education, Learning
- `psychology`: Brain, Cognitive
- `arrow_forward`: CTA, Next
- `arrow_back`: Back Navigation
- `calendar_month`: ICS Export, Scheduling
- `rocket_launch`: Start, Begin Test
- `info`: Information, Help
- `close`: Dismiss, Remove
- `more_horiz`: Options, More

### **Icon-Größen**
- Extra Small: `text-base` (16px)
- Small: `text-lg` (18px)
- Medium: `text-2xl` (24px)
- Large: `text-3xl` (30px)
- Extra Large: `text-4xl` (36px)

## 8. Navigation

### **Fixed Glassmorphism Navbar**
```html
<nav class="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
  <div class="container mx-auto px-4 py-4">
    <!-- Logo + Navigation -->
  </div>
</nav>
```

**Eigenschaften:**
- Position: `fixed w-full z-50` (immer oben)
- Background: Semi-transparent mit Blur `bg-white/90 backdrop-blur-sm`
- Border: Subtil unten `border-b border-gray-100`
- Height: `h-16` (64px)

## 9. Accessibility

### **Touch Targets**
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

Alle interaktiven Elemente (Buttons, Links, Icon-Buttons) mindestens 44×44px.

### **Fokus-States**
```css
focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
```

Alle interaktiven Elemente haben sichtbaren Focus-Ring für Tastatur-Navigation.

### **Alt-Texte & ARIA**
- Icons mit `aria-label` wenn ohne Text
- Buttons mit aussagekräftigem Text (nicht nur Icons)
- Links mit aussagekräftigem Label (nicht "Klick hier")

### **Kontraste**
Alle Text/Hintergrund-Kombinationen erfüllen WCAG AA (4.5:1).

## 10. PWA-Spezifisches

### **Safe Areas**
```css
.pwa-safe-screen {
  min-height: 100vh;
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Berücksichtigt iOS Notch und Home-Indicator.

## 11. Referenz

Dieses Dokument ergänzt:
- `docs/brainrot-sart-short-v1_brainscore-v1.md` (Test- und Scorelogik)
- `docs/requirements.md` (Funktionale Anforderungen)

---

**Version:** MVP v1.0  
**Letzte Aktualisierung:** Januar 2025  
**Maintainer:** BrainrotAI Team
