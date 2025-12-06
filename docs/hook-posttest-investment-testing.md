# Hook Post-Test Investment Flow - Testing Guide

**Feature Branch:** `feature/hook-posttest-investment`  
**Status:** ✅ Implementation Complete (Awaiting Migration + Manual Testing)

---

## 🎯 Feature Overview

**Hook-Model Investment Phase:** Users invest context data immediately after test completion to unlock future pattern insights (Variable Reward).

**New 3-Step Flow:**
1. **SartResult** → Motivational CTA: "Kurz einchecken (Screentime & Kontext)"
2. **PostTestInvestment** → Extended input form (5 sections)
3. **PostTestInsightScreen** → Personalized pattern insight or "need more data" message

---

## 📦 Implementation Checklist

### ✅ Completed Components

- [x] **Data Model Extension**
  - `supabase/migrations/20250106_extend_digital_logs.sql`
  - Added `context_tags TEXT[]`, `subjective_state TEXT`, `custom_context TEXT`
  - Index on `subjective_state` for filtering

- [x] **TypeScript Types**
  - `src/features/digitalLog/digitalLogTypes.ts`
  - New types: `ContextTag`, `SubjectiveState`
  - UI labels: `CONTEXT_TAG_LABELS`, `SUBJECTIVE_STATE_LABELS`

- [x] **Insight Service**
  - `src/lib/services/insight.service.ts`
  - `getPostTestInsight()` analyzes high vs low screentime patterns
  - Threshold: 3 entries minimum, 5-point difference = "significant"

- [x] **Investment Screen Component**
  - `src/lib/components/posttest/PostTestInvestment.svelte` (340 lines)
  - 5 sections: Screentime, Categories, Pickup Frequency, Context Tags (NEW), Subjective State (NEW)
  - Extended API payload with new fields

- [x] **Insight Screen Component**
  - `src/lib/components/posttest/PostTestInsightScreen.svelte` (120 lines)
  - Shows pattern insight or "need more data" message
  - Pattern visualization with high/low screentime averages

- [x] **Flow Integration**
  - Updated `src/lib/components/sart/SartResult.svelte` with motivational CTA
  - Extended `src/routes/test/+page.svelte` state machine with 'investment-input' and 'insight-reward' steps
  - Created `src/routes/test/+page.server.ts` to load userId
  - Updated `/api/digital-log` endpoint to accept new fields

- [x] **Build Validation**
  - ✅ TypeScript: 0 errors
  - ✅ SSR: 234 modules
  - ✅ Client: 293 modules
  - ⚠️ EPERM symlink warning (Windows, non-blocking)

---

## 🚀 Deployment Steps

### 1. Apply Database Migration

**Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
2. Navigate to "SQL Editor"
3. Copy contents of `supabase/migrations/20250106_extend_digital_logs.sql`
4. Execute SQL
5. Verify new columns exist: `SELECT * FROM digital_logs LIMIT 1;`

**Via Supabase CLI (if linked):**
```bash
npx supabase migration up --linked
```

**Verify Migration:**
```sql
-- Should show 3 new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'digital_logs'
  AND column_name IN ('context_tags', 'subjective_state', 'custom_context');
```

### 2. Merge to Develop

```bash
git checkout develop
git merge feature/hook-posttest-investment
git push origin develop
```

### 3. Deploy to Vercel

Vercel will auto-deploy from `develop` branch. Monitor build logs for any issues.

---

## 🧪 Manual Testing Scenarios

### Scenario A: New User (<3 Entries)

**Goal:** Test "need more data" insight message

**Steps:**
1. Complete SART test (any score)
2. Click "Kurz einchecken (Screentime & Kontext)"
3. Fill all 5 sections in PostTestInvestment:
   - Screentime: e.g., "60-120 min"
   - Categories: e.g., "Soziale Medien", "Videos"
   - Pickup Frequency: e.g., "Medium"
   - Context Tags: e.g., "Nach dem Lernen", "Uni/Arbeit"
   - Subjective State: e.g., "Klar" (😎)
4. Click "Check-in bestätigen"
5. **Expected:** PostTestInsightScreen shows:
   - Headline: "Noch zu früh für Muster"
   - Body: "Komm zurück, wenn du mindestens 3 Tests mit Screentime-Daten gemacht hast."
6. Click "Zum Dashboard"
7. **Expected:** Navigate to dashboard

**Verification:**
```sql
SELECT test_id, screen_time_bucket, context_tags, subjective_state
FROM digital_logs
WHERE test_id = 'YOUR_TEST_ID';
```

---

### Scenario B: User with Variety (High/Low Screentime)

**Goal:** Test pattern detection insight

**Setup:**
1. Create 5 test sessions with varying screentime:
   - 2x High screentime (60-120 or 120plus) → Simulate low scores (e.g., 40-50)
   - 3x Low screentime (0-30 or 30-60) → Simulate high scores (e.g., 70-80)

**Steps:**
1. Complete 6th test (any score)
2. Enter investment data with high screentime (60-120 min)
3. Submit
4. **Expected:** PostTestInsightScreen shows:
   - Headline: "Interessantes Muster erkannt!"
   - Body: "Bei wenig Screentime (<60 min) liegt dein durchschnittlicher BrainScore bei **75 Punkten**. Bei viel Screentime (>60 min) sinkt er auf **45 Punkte**."
   - Pattern: "Das sind **30 Punkte Unterschied** – ein deutliches Signal!"
5. Click "Zum Dashboard"

**Verification:**
```sql
-- Should show pattern data
SELECT 
  CASE 
    WHEN screen_time_bucket IN ('60-120', '120plus') THEN 'High'
    ELSE 'Low'
  END AS category,
  AVG(s.brain_score) AS avg_score,
  COUNT(*) AS count
FROM digital_logs dl
JOIN sart_sessions s ON dl.test_id = s.id
WHERE s.user_id = 'YOUR_USER_ID'
  AND dl.screen_time_bucket IS NOT NULL
  AND s.brain_score IS NOT NULL
GROUP BY category;
```

---

### Scenario C: User Without Variety

**Goal:** Test "no clear pattern" insight

**Setup:**
1. Create 5 test sessions with consistent screentime:
   - All with "30-60 min" bucket
   - Scores vary: 50, 60, 55, 70, 65

**Steps:**
1. Complete 6th test
2. Enter investment data
3. Submit
4. **Expected:** PostTestInsightScreen shows:
   - Headline: "Noch kein klares Muster"
   - Body: "Probiere verschiedene Screentime-Level aus, um Zusammenhänge zu erkennen."

---

### Scenario D: Skip Investment Flow

**Goal:** Test backwards compatibility (old flow preserved)

**Steps:**
1. Complete SART test
2. On SartResult screen, click "Später eingeben" (small link)
3. **Expected:** Direct navigation to dashboard (skip investment + insight)

**Verification:**
```sql
-- Should NOT create digital_log entry
SELECT COUNT(*) FROM digital_logs WHERE test_id = 'YOUR_TEST_ID';
-- Expected: 0
```

---

### Scenario E: Context Tags + Custom Context

**Goal:** Test "other" context tag with free text input

**Steps:**
1. Complete test
2. In PostTestInvestment:
   - Select context tag: "Sonstiges"
   - **Expected:** Textarea appears: "Optional: Was war 'Sonstiges'?"
   - Enter custom text: "Nach dem Sport"
3. Submit
4. **Expected:** Insight screen shows (depending on data)

**Verification:**
```sql
SELECT context_tags, custom_context
FROM digital_logs
WHERE test_id = 'YOUR_TEST_ID';
-- Expected: context_tags = {"other"}, custom_context = "Nach dem Sport"
```

---

## 🐛 Edge Cases to Test

### Edge Case 1: Invalid Form Submission

**Steps:**
1. Complete test
2. In PostTestInvestment, leave "Subjective State" empty
3. Try to submit
4. **Expected:** Button disabled + helper text: "Bitte beantworte alle 5 Fragen"

### Edge Case 2: API Failure

**Steps:**
1. Simulate API error (e.g., disconnect network)
2. Fill form and submit
3. **Expected:** Error alert: "Fehler beim Speichern. Bitte versuche es erneut."
4. Fix network and retry
5. **Expected:** Success → Navigate to insight screen

### Edge Case 3: Multiple Context Tags

**Steps:**
1. Select 3 context tags: "Nach dem Lernen", "Uni/Arbeit", "Unterwegs"
2. Submit
3. **Expected:** All tags saved

**Verification:**
```sql
SELECT context_tags FROM digital_logs WHERE test_id = 'YOUR_TEST_ID';
-- Expected: {"after_learning", "at_work_uni", "on_the_go"}
```

### Edge Case 4: Null Brain Score

**Steps:**
1. Create session with `brain_score = NULL` (invalid test)
2. Run insight service
3. **Expected:** Entry excluded from pattern analysis (no crash)

---

## 📊 Analytics to Track (Future)

1. **Investment Completion Rate:**
   - % of users who click "Kurz einchecken" vs "Später eingeben"
   
2. **Context Tag Distribution:**
   - Which tags are most commonly selected?
   
3. **Subjective State Correlation:**
   - Does "clear" correlate with higher scores?
   
4. **Insight Engagement:**
   - % of users who view insight screen
   - Average time spent on insight screen

---

## 🚨 Known Issues

1. **EPERM Symlink Error (Windows Build)**
   - **Status:** Non-blocking
   - **Impact:** Local build warning only, production deployment unaffected
   - **Solution:** Ignore or build in WSL/Linux

2. **Migration Not Auto-Applied**
   - **Status:** Manual step required
   - **Impact:** Feature broken until migration applied
   - **Solution:** Apply via Supabase Dashboard SQL Editor

---

## 📝 Documentation Updates

- [x] Flow analysis: `docs/hook-posttest-investment-notes.md`
- [x] Testing guide: `docs/hook-posttest-investment-testing.md` (this file)
- [ ] Update main `README.md` with feature description
- [ ] Add screenshots of new screens

---

## ✅ Sign-Off Checklist

Before merging to `develop`:

- [ ] Migration applied to production database
- [ ] Scenario A tested (new user)
- [ ] Scenario B tested (pattern detected)
- [ ] Scenario C tested (no pattern)
- [ ] Scenario D tested (skip flow)
- [ ] Edge cases verified
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] Commit messages clear

---

## 🎉 Next Steps (Future Enhancements)

1. **ML-Based Insights (Phase 2)**
   - Replace heuristic pattern detection with logistic regression
   - Add confidence scores to insights
   
2. **Context Tag Insights (Phase 2)**
   - Analyze: "Your score is highest after learning" (not just screentime)
   
3. **Subjective State Insights (Phase 2)**
   - "You perform 15 points better when you feel 'clear'"
   
4. **Streak System (Phase 3)**
   - Reward users who consistently invest context data
   - Badge: "10 Check-ins in a row"

---

**Implementation Date:** December 6, 2025  
**Branch:** `feature/hook-posttest-investment`  
**Build Status:** ✅ Passed (234 SSR + 293 Client modules)
