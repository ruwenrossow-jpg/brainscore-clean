# Routing-Logik v2.0 - Startscreen & Auth Flow

## Übersicht der Änderungen

Die Routing-Logik wurde überarbeitet, um einen dedizierten Startscreen für nicht eingeloggte Nutzer zu gewährleisten und das Onboarding flexibler zu gestalten.

---

## Neue Routing-Logik

### 1. Root Route (`/`)

**Für nicht eingeloggte Nutzer:**
- Zeigt den **Startscreen** mit Logo "BrainrotAI" und Claim
- **Primär-CTA**: "Jetzt starten" → `/onboarding`
- **Sekundär-Link**: "Bereits ein Konto?" → `/auth` (Login)

**Für eingeloggte Nutzer:**
- Automatischer **Redirect zu `/dashboard`**
- Kein erneutes Onboarding (außer bewusst gewählt)

**Implementierung:** `src/routes/+page.server.ts`

```typescript
export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    // Nicht eingeloggt → Startscreen zeigen
    return {};
  }
  
  // Eingeloggt → Direkt zum Dashboard
  throw redirect(303, '/dashboard');
};
```

---

### 2. Onboarding Route (`/onboarding`)

**Auth-Anforderung:**
- User **muss eingeloggt sein** (via `requireAuth`)
- Redirect zu `/` wenn nicht eingeloggt

**Neu:** Kein automatischer Redirect zu Dashboard mehr!
- Eingeloggte User können Onboarding **bewusst wiederholen**
- Nützlich für "Onboarding neu starten" in Einstellungen
- Ermöglicht Anpassung von Zielen/Kontexten

**Implementierung:** `src/routes/onboarding/+page.server.ts`

```typescript
export const load: PageServerLoad = async (event) => {
  // Guard: User muss eingeloggt sein
  const session = await requireAuth(event);
  
  // Profile laden (ohne redirect bei onboarding_completed)
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return { profile };
};
```

---

### 3. Dashboard & Protected Routes

**Auth-Guard:** `requireOnboarding()`
- Prüft Einlog-Status UND Onboarding-Abschluss
- Redirect zu `/onboarding` wenn nicht abgeschlossen
- Redirect zu `/` wenn nicht eingeloggt

**Betroffene Routen:**
- `/dashboard`
- `/test`
- `/logbuch`
- `/logbuch/[date]`

**Keine Änderung nötig** - bestehende Guards funktionieren weiterhin.

---

### 4. Auth Route (`/auth`)

**Login/Register-Seite:**
- Kombinierte Seite mit Tabs (Einloggen / Registrieren)
- "Zurück zur Startseite" Link → `/`

**Keine Änderung nötig** - bestehendes Verhalten bleibt.

---

## Auth Guards

### `requireAuth(event)`

**Zweck:** Prüft ob User eingeloggt ist

**Verhalten:**
- ✅ Session vorhanden → Gibt Session zurück
- ❌ Keine Session → **Redirect zu `/`** (Startscreen)

**Änderung:** Redirect zu `/` statt `/auth`

```typescript
export async function requireAuth(event: RequestEvent) {
  const session = await event.locals.getSession();
  
  if (!session) {
    throw redirect(303, '/'); // NEU: Startscreen statt /auth
  }
  
  return session;
}
```

---

### `requireOnboarding(event)`

**Zweck:** Prüft Onboarding-Abschluss

**Verhalten:**
1. Ruft `requireAuth()` → Redirect zu `/` wenn nicht eingeloggt
2. Lädt Profile aus DB
3. Prüft `onboarding_completed` Flag
4. ❌ Nicht abgeschlossen → **Redirect zu `/onboarding`**
5. ✅ Abgeschlossen → Gibt Session + Profile zurück

**Keine Änderung** - nutzt bereits `requireAuth()` intern.

---

### `requireGuest(event)`

**Zweck:** Prüft dass User NICHT eingeloggt ist (für Auth-Seiten)

**Verhalten:**
- ✅ Keine Session → OK, weitermachen
- ❌ Session vorhanden → **Redirect zu `/dashboard`**

**Keine Änderung** - bestehendes Verhalten bleibt.

---

## User Flows

### Szenario A: Neuer Nutzer (nicht eingeloggt)

```
1. Besucht https://brainscore-clean.vercel.app/
   → Startscreen mit "Jetzt starten" / "Bereits ein Konto?"

2. Klick "Jetzt starten"
   → /onboarding
   → Redirect zu / (nicht eingeloggt)
   → Sieht Startscreen

3. Klick "Bereits ein Konto?" oder nutzt /auth direkt
   → /auth (Login/Register)
   
4. Registrierung abgeschlossen
   → Auto-Login
   → Redirect zu / (von auth)
   → Root erkennt Session → Redirect zu /dashboard
   → Dashboard erkennt kein Onboarding → Redirect zu /onboarding
   
5. Onboarding durchlaufen
   → Profile.onboarding_completed = true
   → Klick "Test-Tutorial ausprobieren" oder "Dashboard"
   → /test/tutorial oder /dashboard
```

### Szenario B: Bestehender Nutzer (eingeloggt)

```
1. Besucht https://brainscore-clean.vercel.app/
   → Root erkennt Session
   → Redirect zu /dashboard
   → Dashboard zeigt Inhalte

2. Direkter Aufruf /onboarding
   → requireAuth() OK (eingeloggt)
   → Onboarding-Wizard wird gezeigt
   → User kann Ziele/Kontexte neu konfigurieren
```

### Szenario C: Eingeloggt, aber Onboarding nicht abgeschlossen

```
1. User loggt sich ein (auth)
   → Redirect zu /
   → Root erkennt Session → Redirect zu /dashboard
   → Dashboard ruft requireOnboarding()
   → Profile.onboarding_completed = false
   → Redirect zu /onboarding
   
2. Onboarding durchlaufen
   → Profile aktualisiert
   → Zugriff auf Dashboard/Test freigegeben
```

---

## Technische Details

### Geänderte Dateien

1. **`src/routes/+page.server.ts`**
   - Vereinfachte Logik: Nur Session-Check
   - Eingeloggt → Redirect `/dashboard`
   - Nicht eingeloggt → Startscreen zeigen

2. **`src/routes/+page.svelte`**
   - "Jetzt starten" → `goto('/onboarding')`
   - Neuer Button: "Bereits ein Konto?" → `goto('/auth')`

3. **`src/routes/onboarding/+page.server.ts`**
   - Entfernt: Redirect zu `/dashboard` bei `onboarding_completed`
   - Erlaubt bewussten Zugriff für alle eingeloggten User

4. **`src/lib/server/auth.guard.ts`**
   - `requireAuth()`: Redirect zu `/` statt `/auth`

### Keine Änderung nötig

- `src/routes/+layout.server.ts` (Session + Profile laden)
- `src/routes/dashboard/+page.server.ts` (requireOnboarding Guard)
- `src/routes/auth/+page.svelte` (Login/Register)
- Alle anderen Protected Routes

---

## Testing Checklist

### Test 1: Nicht eingeloggt

- [ ] `/` zeigt Startscreen (Logo, Claim, "Jetzt starten", "Bereits ein Konto?")
- [ ] Klick "Jetzt starten" → Redirect zu `/` (nicht eingeloggt → requireAuth)
- [ ] Klick "Bereits ein Konto?" → `/auth` (Login-Seite)
- [ ] `/dashboard` → Redirect zu `/` (requireOnboarding → requireAuth)
- [ ] `/test` → Redirect zu `/` (requireAuth)

### Test 2: Eingeloggt, Onboarding abgeschlossen

- [ ] `/` → Redirect zu `/dashboard`
- [ ] `/dashboard` → Dashboard angezeigt
- [ ] `/onboarding` → Onboarding-Wizard angezeigt (bewusster Zugriff erlaubt)
- [ ] `/test` → Test angezeigt

### Test 3: Eingeloggt, Onboarding NICHT abgeschlossen

- [ ] `/` → Redirect zu `/dashboard` → Redirect zu `/onboarding`
- [ ] `/dashboard` → Redirect zu `/onboarding`
- [ ] `/onboarding` → Onboarding-Wizard angezeigt
- [ ] Nach Onboarding: Zugriff auf Dashboard/Test

### Test 4: Auth-Flow

- [ ] `/auth` → Login/Register-Seite
- [ ] Nach Login → Redirect zu `/` → Redirect zu `/dashboard`
- [ ] Nach Register → Auto-Login → wie oben

---

## Vorteile der neuen Logik

✅ **Klarer Einstiegspunkt:** Startscreen für neue Nutzer
✅ **Weniger Verwirrung:** "Jetzt starten" führt logisch zum Onboarding
✅ **Flexibles Onboarding:** Wiederholung möglich (z.B. Ziele ändern)
✅ **Konsistente Guards:** requireAuth → `/`, requireOnboarding → `/onboarding`
✅ **SEO-freundlich:** `/` ist die Landing Page (nicht `/auth`)

---

## Zukünftige Erweiterungen

### Optional: "Onboarding neu starten" in Einstellungen

```svelte
<!-- src/routes/dashboard/settings/+page.svelte -->
<button onclick={() => goto('/onboarding')}>
  Onboarding neu starten
</button>
```

### Optional: Onboarding-Schutz für bereits onboarded User

```typescript
// src/routes/onboarding/+page.server.ts
export const load: PageServerLoad = async (event) => {
  const session = await requireAuth(event);
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Optional: Redirect wenn bereits onboarded (außer ?force=true)
  const forceRestart = event.url.searchParams.get('force') === 'true';
  if (profile?.onboarding_completed && !forceRestart) {
    throw redirect(303, '/dashboard');
  }
  
  return { profile };
};
```

### Optional: Startscreen-Varianten

```svelte
<!-- Dynamischer Content basierend auf Browser-Features -->
{#if isPWA}
  <h2>Willkommen zurück in der App!</h2>
{:else if isReturningVisitor}
  <h2>Schön, dass du wieder da bist!</h2>
{:else}
  <h2>Verstehe endlich, was deine Aufmerksamkeit steuert.</h2>
{/if}
```

---

## Migration Notes

**Keine Breaking Changes:**
- Bestehende User werden weiterhin korrekt weitergeleitet
- Guards funktionieren wie zuvor
- Nur Root-Route (`/`) hat neues Verhalten

**Rollback:**
Falls Probleme auftreten, können die alten Server-Load-Funktionen wiederhergestellt werden:
```bash
git checkout HEAD~1 src/routes/+page.server.ts
git checkout HEAD~1 src/lib/server/auth.guard.ts
```
