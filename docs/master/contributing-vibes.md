# Contributing Guidelines – The BrainrotAI Way

**Vibecoding mit System: Wie wir nachhaltig Features bauen**

> **Zweck:** Standardisierter Entwicklungs-Workflow für BrainrotAI  
> **Zielgruppe:** Alle Contributors (Team + externe Developers)  
> **Letzte Aktualisierung:** 2025-01-26

---

## 🌟 Die BrainrotAI-Philosophie

### Core-Prinzipien

1. **Masterdokument-zentriert:** Text vor Code, Konzept vor Implementierung
2. **Design-System-first:** Nutze existierende UI-Primitives, keine Ad-hoc-Styles
3. **Wissenschaftlich fundiert:** Jede Feature-Entscheidung hat eine Rationale
4. **Accessibility-first:** WCAG AA, Touch-Targets, Focus-States
5. **Performance-bewusst:** Hardware-accelerated Animations, lazy Loading

### Was ist "Vibecoding"?

**Vibecoding** bedeutet:
- **Schnell & sicher entwickeln** durch klare Strukturen
- **Keine Zeit verschwenden** mit Design-Entscheidungen (bereits dokumentiert)
- **Konsistent bleiben** ohne ständige Abstimmungen
- **Iterativ verbessern** mit Feedback-Loops

---

## 🔄 Workflow: Neue Features bauen

### Phase 1: Planung & Konzeption

#### 1.1 Feature-Dokument anlegen

Für jedes neue Feature (z.B. "Daily-Reminder-System"):

```bash
# Neues Feature-Dokument erstellen
docs/features/daily-reminder.md
```

**Inhalt (Template):**
```markdown
# Feature: Daily Reminder

## 1. Problem-Statement
[Was löst dieses Feature? Für wen?]

## 2. User-Stories
- Als [Rolle] möchte ich [Aktion], um [Nutzen]

## 3. Technische Architektur
[Komponenten, Services, DB-Änderungen]

## 4. Design-Requirements
- UI-Komponenten: [z.B. Button, Card, Modal]
- Referenz: docs/master/design-system.md

## 5. Abhängigkeiten
- Bestehende Features: [z.B. Onboarding, Notifications]
- Externe Libraries: [z.B. date-fns]

## 6. Testing-Plan
- Unit-Tests: [Welche Funktionen?]
- Integration-Tests: [Welche Flows?]
```

#### 1.2 Masterdokumente checken

**Fragen:**
- Welche **Design-Komponenten** brauchst du? → [`design-system.md`](../master/design-system.md)
- Welche **Animationen**? → [`animations.md`](../master/animations.md)
- Neue **Test-Logik** oder Metriken? → [`test-logic.md`](../master/test-logic.md)

**Wenn Masterdokument fehlt:**
- Issue erstellen: "Masterdokument-Update: [Thema]"
- Review-Prozess durchlaufen (siehe unten)

---

### Phase 2: Implementierung

#### 2.1 Code-Struktur anlegen

**Für Feature-spezifischen Code:**
```
src/features/[feature-name]/
  ├── components/
  │   ├── FeatureComponent.svelte
  │   └── FeatureModal.svelte
  ├── services/
  │   └── featureService.ts
  ├── types/
  │   └── featureTypes.ts
  └── config/
      └── featureConfig.ts
```

**Für UI-Primitives (wiederverwendbar):**
```
src/lib/components/ui/
  ├── Button.svelte
  ├── Card.svelte
  └── [NewPrimitive].svelte
```

#### 2.2 Design-Tokens & UI-Primitives nutzen

**✅ Do:**
```svelte
<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { COLORS } from '$lib/design/tokens';
</script>

<Button variant="primary" size="lg">
  Feature starten
</Button>
```

**❌ Don't:**
```svelte
<button class="bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-full">
  Feature starten
</button>
```

**Warum?**
- Hard-coded Styles = Inkonsistenz bei späteren Design-Updates
- Duplikation von Code
- Schwierig zu maintainen

#### 2.3 Kommentare & Referenzen

**Jede wichtige Datei braucht oben:**
```typescript
/**
 * [Feature-Name] Service
 * 
 * Referenz: docs/features/[feature-name].md
 * Design-System: docs/master/design-system.md (Buttons, Cards)
 * 
 * Diese Service-Klasse implementiert [Kurzbeschreibung].
 */
```

**Inline-Kommentare nur für:**
- Komplexe Algorithmen (Erklärung des "Warum")
- Temporäre Workarounds (mit TODO + Datum)
- Performance-kritische Sections

**Keine Kommentare für:**
- Offensichtlichen Code (`const isValid = true; // Set valid to true`)
- Self-explanatory Function-Namen

---

### Phase 3: Testing

#### 3.1 Unit-Tests

**Für Services, Utils, reine Funktionen:**
```typescript
// featureService.test.ts
import { describe, it, expect } from 'vitest';
import { calculateFeatureScore } from './featureService';

describe('calculateFeatureScore', () => {
  it('returns correct score for valid input', () => {
    const result = calculateFeatureScore(50, 10);
    expect(result).toBe(60);
  });

  it('handles edge case: negative values', () => {
    const result = calculateFeatureScore(-10, 5);
    expect(result).toBe(0); // Min-Clamping
  });
});
```

**Test-Struktur:**
```
src/features/[feature]/
  __tests__/
    featureService.test.ts
    featureComponent.test.ts
```

#### 3.2 Integration-Tests (optional, für kritische Flows)

**Beispiel: Onboarding-Flow**
```typescript
// onboarding.integration.test.ts
describe('Onboarding Flow', () => {
  it('completes full onboarding and redirects to dashboard', async () => {
    // Setup: Mock user, DB
    // Action: Simulate Step 1-6
    // Assert: User profile created, redirected
  });
});
```

#### 3.3 Manual Testing (Checklist)

- [ ] Desktop (Chrome, Firefox)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] PWA (Installiert auf iOS/Android)
- [ ] Accessibility (Keyboard-Navigation, Screen-Reader)
- [ ] Edge-Cases (leere States, Error-Handling)

---

### Phase 4: Review & Merge

#### 4.1 Pre-Review-Checklist

Vor dem Pull-Request:

- [ ] **TypeScript:** Keine Errors (`npm run check`)
- [ ] **Linting:** Keine Warnings (`npm run lint`, falls konfiguriert)
- [ ] **Tests:** Alle grün (`npm run test`)
- [ ] **Masterdokument-Konformität:** Design-System eingehalten?
- [ ] **Performance:** Keine `console.log` im Production-Code
- [ ] **Accessibility:** Focus-States, Touch-Targets (min. 44px)

#### 4.2 Pull-Request-Template

```markdown
## Feature: [Name]

### Beschreibung
[Was wurde implementiert? Warum?]

### Referenzen
- Feature-Dokument: `docs/features/[feature-name].md`
- Masterdokumente: `docs/master/design-system.md` (Abschnitt X)

### Changes
- [ ] Neue UI-Komponente: [Name]
- [ ] Service: [Name]
- [ ] Tests: [Unit/Integration]

### Screenshots (falls UI-Änderung)
[Screenshot Desktop, Mobile]

### Testing
- [x] Desktop (Chrome)
- [x] Mobile (iOS Safari)
- [ ] PWA (installiert)
- [x] Accessibility (Keyboard-Navigation)

### Breaking Changes
[Falls ja: Migration-Guide?]
```

#### 4.3 Review-Prozess

**Reviewer checkt:**
1. **Code-Qualität:** Lesbar, gut strukturiert, DRY-Prinzip
2. **Masterdokument-Konformität:** Design-System, Animationen korrekt?
3. **Testing:** Ausreichend getestet?
4. **Performance:** Keine unnötigen Re-Renders, optimierte Assets
5. **Accessibility:** WCAG AA erfüllt?

**Approval-Kriterien:**
- Mindestens 1 Approve (bei kleinen Features)
- 2 Approves (bei Breaking Changes oder Masterdokument-Updates)

---

## 🛠️ Code-Konventionen

### TypeScript

**Naming:**
```typescript
// ✅ PascalCase für Komponenten, Klassen, Interfaces
interface UserProfile { }
class AuthService { }

// ✅ camelCase für Funktionen, Variablen
const calculateScore = () => { };
let currentStep = 0;

// ✅ UPPER_SNAKE_CASE für Konstanten
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://...';
```

**Types vs. Interfaces:**
- **Interfaces:** Für Objekt-Shapes (erweiterbar)
  ```typescript
  interface UserProfile {
    id: string;
    name: string;
  }
  ```
- **Types:** Für Unions, Intersections, Mapped Types
  ```typescript
  type Status = 'idle' | 'loading' | 'success' | 'error';
  type UserGoal = 'focus' | 'impulsivity' | 'fatigue';
  ```

**Avoid `any`:**
```typescript
// ❌ Bad
function processData(data: any) { }

// ✅ Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type-Guard
  }
}
```

---

### Svelte 5 (Runes)

**State-Management:**
```svelte
<script lang="ts">
  // ✅ Runes (Svelte 5)
  let count = $state(0);
  let doubled = $derived(count * 2);

  // ❌ Legacy (Svelte 4)
  // let count = 0;
  // $: doubled = count * 2;
</script>
```

**Props:**
```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number; // Optional
  }

  let { title, count = 0 }: Props = $props();
</script>
```

**Events:**
```svelte
<script lang="ts">
  let { onclick }: { onclick?: () => void } = $props();
</script>

<button {onclick}>Click me</button>
```

---

### CSS & Styling

**Tailwind-first:**
```svelte
<!-- ✅ Tailwind-Utilities -->
<div class="flex items-center gap-4 p-6 rounded-xl bg-white shadow-xl">

<!-- ❌ Inline-Styles (nur für dynamic values) -->
<div style="width: {dynamicWidth}px;">
```

**Custom-Classes (nur wenn wiederverwendbar):**
```css
/* app.css */
@layer components {
  .card-modern {
    @apply bg-white rounded-2xl shadow-xl border border-gray-100;
  }
}
```

**Responsive:**
```svelte
<h1 class="text-4xl md:text-5xl lg:text-6xl">
  Headline
</h1>
```

---

## 📦 File-Organization

### Imports sortieren

```typescript
// 1. External Libraries
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

// 2. Internal Libraries (lib/)
import Button from '$lib/components/ui/Button.svelte';
import { COLORS } from '$lib/design/tokens';

// 3. Features (features/)
import { AuthService } from '$lib/services/auth.service';

// 4. Types
import type { UserProfile } from '$lib/types/user.types';

// 5. Relative (same feature)
import { calculateScore } from './utils';
```

### Barrel-Exports (index.ts)

**Für größere Features:**
```typescript
// src/lib/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Badge } from './Badge.svelte';

// Usage:
import { Button, Card } from '$lib/components/ui';
```

---

## 🎨 Design-Spezifika

### Neue UI-Komponente erstellen

**Workflow:**
1. **Masterdokument checken:** Komponente bereits definiert? → [`design-system.md`](../master/design-system.md)
2. **Falls nein:** Issue erstellen "Masterdokument-Update: [Komponente]"
3. **Komponentendefinition:** Layout, Props, Variants
4. **Implementierung:**
   ```
   src/lib/components/ui/[ComponentName].svelte
   ```
5. **Barrel-Export aktualisieren:**
   ```typescript
   // src/lib/components/ui/index.ts
   export { default as NewComponent } from './NewComponent.svelte';
   ```

### Farben verwenden

**✅ Do:**
```svelte
<div class="bg-brand-purple text-white">
<!-- Oder via Tokens: -->
<script>
  import { COLORS } from '$lib/design/tokens';
</script>
<div style="background: {COLORS.brandPurple};">
```

**❌ Don't:**
```svelte
<div class="bg-[#7C3AED]">  <!-- Hard-coded Hex -->
<div style="background: purple;">  <!-- Vage Farbe -->
```

---

## 🧪 Testing-Guidelines

### Was testen?

**Pflicht-Tests:**
- ✅ Business-Logik (Score-Berechnung, Validierung)
- ✅ Services (API-Calls, DB-Interaktion)
- ✅ Utils (Pure Functions)

**Optional (je nach Zeit):**
- ⚠️ Komponenten (UI-Logic, State-Changes)
- ⚠️ Integration-Tests (End-to-End-Flows)

**Kein Testing für:**
- ❌ Triviale Getter/Setter
- ❌ Pure-Markup-Komponenten ohne Logik

### Test-Naming

```typescript
describe('AuthService', () => {
  describe('signUp', () => {
    it('creates profile after successful registration', async () => {
      // Arrange, Act, Assert
    });

    it('throws error when email already exists', async () => {
      // ...
    });
  });
});
```

---

## 🚫 Anti-Patterns (Vermeiden!)

### 1. Premature Optimization

**❌ Bad:**
```typescript
// "Ich mache das gleich performant, falls wir später 1 Mio. User haben"
const memoizedComplexCalculation = useMemo(() => {
  return simpleAddition(a, b);
}, [a, b]);
```

**✅ Good:**
```typescript
// Simple first, optimize when needed
const result = a + b;
```

### 2. Over-Engineering

**❌ Bad:**
```typescript
// Abstract Factory Pattern für 2 Button-Varianten
class ButtonFactory {
  createButton(type: 'primary' | 'secondary'): Button { }
}
```

**✅ Good:**
```svelte
<Button variant="primary">Click</Button>
<Button variant="secondary">Cancel</Button>
```

### 3. Code-Duplizierung ohne Abstraktion

**❌ Bad:**
```svelte
<!-- Kopiert denselben Button-Code 10× -->
<button class="bg-purple-600 py-4 px-8 rounded-full">A</button>
<button class="bg-purple-600 py-4 px-8 rounded-full">B</button>
```

**✅ Good:**
```svelte
<Button variant="primary">A</Button>
<Button variant="primary">B</Button>
```

### 4. Magic Numbers

**❌ Bad:**
```typescript
if (score > 70) { /* ... */ }
```

**✅ Good:**
```typescript
const SCORE_THRESHOLD_VERY_GOOD = 70;
if (score > SCORE_THRESHOLD_VERY_GOOD) { /* ... */ }
```

---

## 📝 Commit-Messages

### Format (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Neues Feature
- `fix`: Bugfix
- `refactor`: Code-Refactoring (keine Feature-Änderung)
- `docs`: Dokumentation
- `style`: Code-Formatierung (keine Logik-Änderung)
- `test`: Tests
- `chore`: Build, Dependencies

**Beispiele:**
```bash
feat(onboarding): add calendar reminder generation

Implements .ics file export for check-in reminders.
Closes #42

---

fix(dashboard): correct BrainScore calculation for edge case

Previous implementation did not handle omissionErrorRate = 0 correctly.
```

---

## 🎯 Performance-Checkliste

### Build-Time

- [ ] **Tree-Shaking:** Nur genutzte Dependencies importieren
  ```typescript
  // ✅ Named Import
  import { goto } from '$app/navigation';

  // ❌ Namespace Import (größer)
  import * as app from '$app/navigation';
  ```

- [ ] **Code-Splitting:** Lazy-Load für Features
  ```typescript
  const FeatureModal = () => import('./FeatureModal.svelte');
  ```

### Runtime

- [ ] **Avoid unnecessary re-renders:**
  ```svelte
  <script>
    let expensiveData = $derived.by(() => {
      // Only recomputes when dependencies change
      return complexCalculation(input);
    });
  </script>
  ```

- [ ] **Images optimieren:**
  - WebP-Format für moderne Browser
  - Lazy-Loading für below-the-fold Images
  - Responsive-Images (`srcset`)

### Animations

- [ ] **Hardware-accelerated properties:**
  - ✅ `transform`, `opacity`
  - ❌ `width`, `height`, `top`, `left`

---

## 📚 Weitere Ressourcen

### Internes

- [Master-Dokumentation Übersicht](./overview.md)
- [Design-System](./design-system.md)
- [Test-Logik](./test-logic.md)
- [Animations](./animations.md)

### Externes

- [Svelte 5 Docs](https://svelte-5-preview.vercel.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🤝 Fragen & Support

**Bei Unklarheiten:**
1. Masterdokumente checken
2. Issue erstellen mit Label `question`
3. Team-Channel (Discord/Slack)

**Bei Bugs:**
1. Issue erstellen mit Label `bug`
2. Template ausfüllen (Steps to Reproduce, Expected vs. Actual)
3. Screenshots/Videos anhängen

---

**Version:** 1.0.0  
**Status:** DRAFT (wird nach Team-Review finalisiert)  
**Maintainer:** BrainrotAI Core Team  
**Letzte Review:** 2025-01-26
