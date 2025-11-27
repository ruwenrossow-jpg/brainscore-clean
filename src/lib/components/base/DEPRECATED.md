# Base-Komponenten – DEPRECATED

> ⚠️ **DEPRECATED:** Diese Komponenten werden durch `src/lib/components/ui/*` ersetzt.

## Migration-Guide

### BaseButton → Button

**Alt (`src/lib/components/base/BaseButton.svelte`):**
```svelte
<script>
  import BaseButton from '$lib/components/base/BaseButton.svelte';
</script>

<BaseButton variant="primary" onclick={handleClick}>
  Click me
</BaseButton>
```

**Neu (`src/lib/components/ui/Button.svelte`):**
```svelte
<script>
  import { Button } from '$lib/components/ui';
</script>

<Button variant="primary" {onclick}>
  Click me
</Button>
```

### BaseCard → Card

**Alt (`src/lib/components/base/BaseCard.svelte`):**
```svelte
<script>
  import BaseCard from '$lib/components/base/BaseCard.svelte';
</script>

<BaseCard title="My Card" centered>
  Content
</BaseCard>
```

**Neu (`src/lib/components/ui/Card.svelte`):**
```svelte
<script>
  import { Card } from '$lib/components/ui';
</script>

<Card title="My Card" centered>
  Content
</Card>
```

## Zeitplan

- **Phase 1 (aktuell):** Beide Komponenten parallel verfügbar
- **Phase 2 (Sprint 2):** Alle Imports auf neue Komponenten migrieren
- **Phase 3 (Sprint 3):** Base-Komponenten entfernen

## Neue Features in UI-Komponenten

- **Button:**
  - Neue Variante: `link`
  - Bessere Loading-States
  - Konsistente Focus-Rings

- **Card:**
  - Neue Varianten: `compact`, `form`, `list`
  - Optionales Hover-Effect
  - Bessere Max-Width-Optionen

## Referenz

- Design-System: [`docs/master/design-system.md`](../../docs/master/design-system.md)
- UI-Komponenten: `src/lib/components/ui/`
