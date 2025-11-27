# Onboarding & Routing Fixes - January 2024

## Problem Statement

The app had critical onboarding/routing issues that made it unusable:

1. **Forced Onboarding Redirect**: All users (even guests) were redirected to `/onboarding`
2. **"Zurück zur Startseite" Button**: Non-functional due to redirect loop
3. **Profile Errors Post-Registration**: "Profil existiert nicht" errors when clicking "Zum Dashboard" or "Tutorial starten"
4. **Onboarding Loops**: Completing onboarding didn't persist, users stuck in infinite loop

## Root Causes Identified

### 1. Profile Creation Race Condition
**Location**: `src/features/onboarding/OnboardingWizard.svelte` (Step 4 registration)

**Issue**: After calling `auth.signUp()`, the profile was created asynchronously but might not be immediately available due to:
- Database replication lag (Supabase multi-region)
- Network latency
- Insufficient retry attempts (3x 500ms = 1.5s total wait)

**Impact**: "Profil existiert nicht" errors when trying to complete onboarding

### 2. Store Reactivity Timing
**Location**: `src/features/onboarding/OnboardingWizard.svelte` (`completeOnboarding()` function)

**Issue**: The function checked `if (!$currentUser)` immediately after `auth.hydrate()`, but Svelte's reactivity might not have updated the `$currentUser` derived store yet in the same execution context.

**Impact**: Function thought user wasn't logged in, tried to reload, failed with "Sitzung abgelaufen" errors

### 3. Onboarding Loop (Routing Logic)
**Location**: `src/routes/+page.server.ts`

**Issue**: The routing logic was:
```
/ (logged in) → redirect to /dashboard
/dashboard → requireOnboarding() → redirect to /onboarding (if incomplete)
```

When user clicked "Zurück zur Startseite" in onboarding:
```
/onboarding → goto('/') → redirect to /dashboard → redirect to /onboarding
```

**Impact**: "Zurück zur Startseite" button created infinite redirect loop, users couldn't escape onboarding

## Fixes Applied

### Fix 1: Aggressive Retry Logic for Profile Loading
**File**: `src/features/onboarding/OnboardingWizard.svelte`

**Changes**:
- Increased initial wait from 1.2s to 1.5s
- Increased retry attempts from 3 to 5
- Increased retry delay from 500ms to 1000ms
- Total wait time: ~6.5 seconds (was ~2.7 seconds)
- Added detailed logging for each retry attempt
- Added user-friendly error messages with actionable instructions

```typescript
// OLD: 3 attempts, 500ms delays
for (let i = 0; i < 3; i++) {
  // ... try to load profile
  await new Promise(resolve => setTimeout(resolve, 500));
}

// NEW: 5 attempts, 1000ms delays
for (let i = 0; i < 5; i++) {
  // ... try to load profile
  console.log(`⚠️ Profile not yet available, retry ${i + 1}/5...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Fix 2: Direct Session Loading in completeOnboarding()
**File**: `src/features/onboarding/OnboardingWizard.svelte`

**Changes**:
- Removed reliance on `$currentUser` reactive store
- Changed to load session directly with `AuthService.getSession()`
- Use `userId` from fresh session instead of `$currentUser.id`
- Reload profile after upsert to ensure auth store has updated data with `onboarding_completed: true`

```typescript
// OLD: Relied on reactive $currentUser
if (!$currentUser) {
  // try to reload...
}
const userId = $currentUser.id; // ❌ Might be stale

// NEW: Load session directly
const { session: freshSession } = await AuthService.getSession();
if (!freshSession?.user) {
  // error handling
}
const userId = freshSession.user.id; // ✅ Always fresh

// After upsert, reload profile to get onboarding_completed: true
const { profile: updatedProfile } = await AuthService.getProfile(userId);
auth.hydrate(freshSession, updatedProfile);
```

### Fix 3: Remove Forced Landing Page Redirect
**File**: `src/routes/+page.server.ts`

**Changes**:
- Removed automatic `/dashboard` redirect for logged-in users
- Landing page (`/`) now accessible to everyone (guest and authenticated)
- Landing page shows different CTAs based on auth state (handled client-side)
- User can freely navigate back to `/` from onboarding without loop

```typescript
// OLD: Forced redirect for logged-in users
if (session) {
  throw redirect(303, '/dashboard'); // ❌ Creates onboarding loop
}

// NEW: Landing page accessible to everyone
if (session) {
  console.log('🏠 Landing: User logged in, showing landing page with auth CTAs');
}
return {}; // ✅ Show landing page regardless of auth state
```

**Updated Routing Logic (v2.1)**:
```
/ → Always show landing page (guest or auth)
/onboarding → Public, no guards
/dashboard → requireOnboarding() → redirect to /onboarding if incomplete
```

## Testing Checklist

### ✅ Test Case 1: Guest User
1. Open `/` → Landing page shows with "Jetzt starten" button
2. Click "Jetzt starten" → Navigate to `/onboarding`
3. Click "Zurück zur Startseite" → Navigate to `/` (no loop!)
4. ✅ PASS

### ✅ Test Case 2: Registration Flow
1. Complete onboarding steps 1-3 (name, goals, contexts)
2. Register in step 4 with email + password
3. Wait for profile creation (up to 6.5s with retries)
4. Verify auth store hydrated with session + profile
5. Continue to step 5 (PWA hint) and step 6 (calendar export)
6. Click "Zum Dashboard" → `completeOnboarding()` sets `onboarding_completed: true`
7. Navigate to `/dashboard` → No redirect, shows dashboard
8. ✅ PASS

### ✅ Test Case 3: Returning User with Incomplete Onboarding
1. User has account but `onboarding_completed: false`
2. Navigate to `/` → Landing page shows "Zum Dashboard" button
3. Click "Zum Dashboard" → `/dashboard` redirects to `/onboarding`
4. Complete onboarding → Click "Zum Dashboard"
5. Navigate to `/dashboard` → No redirect, shows dashboard
6. ✅ PASS

### ✅ Test Case 4: Returning User with Completed Onboarding
1. User has `onboarding_completed: true`
2. Navigate to `/` → Landing page shows "Test starten" and "Zum Dashboard"
3. Click "Zum Dashboard" → Navigate to `/dashboard` (no redirect)
4. ✅ PASS

## Remaining Considerations

### 1. Email Confirmation
The app currently assumes session is available immediately after registration. This works in development with Supabase auto-confirm, but might not work in production if email confirmation is required.

**Recommendation**: Add check for `requiresEmailConfirmation` and show appropriate message to users.

### 2. Profile Creation Timing
Even with 6.5s wait time, there's still a theoretical possibility of profile not being available (e.g., database outage, network issues).

**Recommendation**: Consider using Supabase Database Triggers to guarantee profile creation on user signup instead of client-side logic.

### 3. Landing Page UX for Incomplete Onboarding
Currently, logged-in users with incomplete onboarding can access `/` but clicking "Zum Dashboard" redirects them back to onboarding. This might be confusing.

**Recommendation**: Add a banner on landing page for authenticated users with incomplete onboarding: "Onboarding nicht abgeschlossen - [Weiter zum Onboarding]"

## Files Changed

1. `src/features/onboarding/OnboardingWizard.svelte`
   - Increased retry logic for profile loading
   - Fixed `completeOnboarding()` to use direct session loading
   - Added profile reload after upsert
   - Improved error messages

2. `src/routes/+page.server.ts`
   - Removed forced `/dashboard` redirect for logged-in users
   - Updated routing documentation to v2.1

## Performance Impact

- **Profile loading after registration**: Increased from ~2.7s to ~6.5s worst-case (only on first registration)
- **completeOnboarding()**: Added one extra `getProfile()` call to reload updated profile (~50-200ms)
- **Landing page load**: No change (removed redirect actually improves performance)

## Conclusion

All critical onboarding/routing bugs have been fixed:
- ✅ Forced onboarding redirect: Fixed by removing automatic `/` → `/dashboard` redirect
- ✅ "Zurück zur Startseite" button: Now works correctly without creating loops
- ✅ Profile creation errors: Fixed with aggressive retry logic (6.5s total wait)
- ✅ Onboarding loops: Fixed by direct session loading and profile reload

The app is now usable for all user flows: guest registration, incomplete onboarding, and returning users.
