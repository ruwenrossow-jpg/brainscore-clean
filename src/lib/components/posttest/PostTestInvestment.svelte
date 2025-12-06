<script lang="ts">
  /**
   * Post-Test Investment Screen
   * 
   * Hook-Model Investment Phase: User invests context to make future insights valuable
   * - ScreenTime bucket
   * - Main categories (max 2)
   * - Pickup frequency
   * - Context tags (NEW: when/where)
   * - Subjective state (NEW: mental clarity)
   * - Custom context (optional free text)
   */
  import { 
    SCREEN_TIME_LABELS, 
    CATEGORY_LABELS, 
    PICKUP_FREQUENCY_LABELS,
    CONTEXT_TAG_LABELS,
    SUBJECTIVE_STATE_LABELS,
    type ScreenTimeBucket,
    type MainCategory,
    type PickupFrequency,
    type ContextTag,
    type SubjectiveState
  } from '$features/digitalLog/digitalLogTypes';
  
  interface Props {
    testId: string;
    score: number;
    onComplete: () => void;
  }
  
  let { testId, score, onComplete }: Props = $props();
  
  // State: Existing fields
  let screenTimeBucket = $state<ScreenTimeBucket | null>(null);
  let selectedCategories = $state<MainCategory[]>([]);
  let pickupFrequency = $state<PickupFrequency | null>(null);
  
  // State: NEW investment fields
  let selectedContextTags = $state<ContextTag[]>([]);
  let subjectiveState = $state<SubjectiveState | null>(null);
  let customContext = $state('');
  
  // UI State
  let isSaving = $state(false);
  let errorMessage = $state('');
  
  // Category toggle (max 2)
  function toggleCategory(category: MainCategory) {
    const index = selectedCategories.indexOf(category);
    if (index > -1) {
      selectedCategories = selectedCategories.filter(c => c !== category);
    } else {
      if (selectedCategories.length >= 2) return;
      selectedCategories = [...selectedCategories, category];
    }
  }
  
  // Context tag toggle (multi-select)
  function toggleContextTag(tag: ContextTag) {
    const index = selectedContextTags.indexOf(tag);
    if (index > -1) {
      selectedContextTags = selectedContextTags.filter(t => t !== tag);
    } else {
      selectedContextTags = [...selectedContextTags, tag];
    }
  }
  
  // Validation
  const isFormValid = $derived(
    screenTimeBucket !== null &&
    selectedCategories.length > 0 &&
    pickupFrequency !== null &&
    selectedContextTags.length > 0 &&
    subjectiveState !== null
  );
  
  // Save investment data
  async function saveInvestment() {
    if (!isFormValid) {
      errorMessage = 'Bitte fülle alle Felder aus.';
      return;
    }
    
    isSaving = true;
    errorMessage = '';
    
    try {
      const payload = {
        testId,
        screenTimeBucket,
        mainCategories: selectedCategories,
        pickupFrequency,
        contextTags: selectedContextTags,
        subjectiveState,
        customContext: customContext.trim() || null
      };
      
      const response = await fetch('/api/digital-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save investment data');
      }
      
      console.log('✅ Investment gespeichert:', payload);
      onComplete();
    } catch (error) {
      console.error('❌ Investment Fehler:', error);
      errorMessage = 'Fehler beim Speichern. Bitte versuche es erneut.';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="card-modern w-full max-w-3xl animate-fadeIn">
  <div class="p-10">
    
    <!-- Header with Motivation -->
    <div class="text-center mb-10">
      <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-purple/10 to-brand-accent/10 mb-4 border border-brand-purple/20">
        <span class="material-symbols-outlined text-brand-purple text-xl">trending_up</span>
        <span class="text-sm font-bold text-brand-purple uppercase tracking-wide">Kurzer Investment</span>
      </div>
      <h2 class="text-4xl font-black text-gray-900 mb-4">
        Damit dein BrainScore-Profil<br />Sinn ergibt
      </h2>
      <p class="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
        Dein Score: <strong class="text-brand-purple">{score}</strong>. Füge jetzt Kontext hinzu, 
        um später Muster zu erkennen – wann bist du scharf, wann nicht?
      </p>
    </div>
    
    {#if errorMessage}
      <div class="alert alert-error bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span class="material-symbols-outlined text-red-600">error</span>
        <span class="text-sm text-red-700 font-medium">{errorMessage}</span>
      </div>
    {/if}
    
    <!-- Section 1: ScreenTime -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-purple">schedule</span>
          1. Wie viel Zeit am Handy seit dem letzten Test?
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(SCREEN_TIME_LABELS) as [bucket, label]}
          <button
            onclick={() => screenTimeBucket = bucket as ScreenTimeBucket}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all {screenTimeBucket === bucket ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg scale-105' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Section 2: Main Categories -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-purple">apps</span>
          2. Wofür hauptsächlich genutzt? <span class="text-sm font-normal text-gray-500">(max. 2)</span>
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(CATEGORY_LABELS) as [category, { label, icon }]}
          <button
            onclick={() => toggleCategory(category as MainCategory)}
            disabled={!selectedCategories.includes(category as MainCategory) && selectedCategories.length >= 2}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all flex items-center gap-3 {
              selectedCategories.includes(category as MainCategory)
                ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            } {
              !selectedCategories.includes(category as MainCategory) && selectedCategories.length >= 2
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }"
          >
            <span class="material-symbols-outlined text-2xl">{icon}</span>
            <span class="flex-1 text-left">{label}</span>
            {#if selectedCategories.includes(category as MainCategory)}
              <span class="material-symbols-outlined text-xl">check_circle</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="text-sm text-gray-500 mt-2 text-center">
        {selectedCategories.length} von 2 ausgewählt
      </div>
    </div>
    
    <!-- Section 3: Pickup Frequency -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-purple">touch_app</span>
          3. Wie oft zum Handy gegriffen?
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(PICKUP_FREQUENCY_LABELS) as [frequency, { label, description }]}
          <button
            onclick={() => pickupFrequency = frequency as PickupFrequency}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all {
              pickupFrequency === frequency
                ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg scale-105'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            <div>{label}</div>
            <div class="text-xs font-normal opacity-70">{description}</div>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Divider -->
    <div class="relative my-10">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-white px-4 text-sm font-bold text-brand-purple uppercase tracking-wide">
          Neu: Kontext-Investment
        </span>
      </div>
    </div>
    
    <!-- Section 4: Context Tags (NEW) -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-accent">label</span>
          4. Wann/Wo warst du heute?
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(CONTEXT_TAG_LABELS) as [tag, { label, icon }]}
          <button
            onclick={() => toggleContextTag(tag as ContextTag)}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all flex items-center gap-3 {
              selectedContextTags.includes(tag as ContextTag)
                ? 'border-brand-accent bg-brand-accent/5 text-brand-accent shadow-lg'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            <span class="material-symbols-outlined text-2xl">{icon}</span>
            <span class="flex-1 text-left">{label}</span>
            {#if selectedContextTags.includes(tag as ContextTag)}
              <span class="material-symbols-outlined text-xl">check_circle</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="text-sm text-gray-500 mt-2 text-center">
        {selectedContextTags.length} ausgewählt (mehrere möglich)
      </div>
    </div>
    
    <!-- Section 5: Subjective State (NEW) -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-accent">psychology</span>
          5. Wie klar war dein Kopf?
        </span>
      </div>
      <div class="grid grid-cols-3 gap-3">
        {#each Object.entries(SUBJECTIVE_STATE_LABELS) as [state, { label, emoji }]}
          <button
            onclick={() => subjectiveState = state as SubjectiveState}
            class="p-6 rounded-xl border-2 font-bold text-base transition-all flex flex-col items-center gap-2 {
              subjectiveState === state
                ? 'border-brand-accent bg-brand-accent/5 text-brand-accent shadow-lg scale-105'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            <span class="text-3xl">{emoji}</span>
            <span>{label}</span>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Optional: Custom Context -->
    {#if selectedContextTags.includes('other')}
      <div class="mb-8">
        <label for="custom-context" class="block text-base font-bold text-gray-700 mb-3">
          Optional: Was war "Sonstiges"?
        </label>
        <textarea
          id="custom-context"
          bind:value={customContext}
          placeholder="z.B. 'Nach dem Sport', 'Während Autofahrt', ..."
          class="textarea textarea-bordered w-full h-20 text-base resize-none"
          maxlength="200"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1 text-right">
          {customContext.length} / 200
        </div>
      </div>
    {/if}
    
    <!-- Submit Button -->
    <div class="mt-10">
      <button
        onclick={saveInvestment}
        class="btn-gradient-primary w-full text-xl font-black py-5 shadow-xl"
        disabled={isSaving || !isFormValid}
      >
        {#if isSaving}
          <span class="loading loading-spinner loading-md"></span>
          Speichern...
        {:else}
          <span class="material-symbols-outlined text-2xl">check_circle</span>
          Check-in bestätigen
        {/if}
      </button>
      {#if !isFormValid}
        <p class="text-sm text-gray-500 text-center mt-3">
          Bitte beantworte alle 5 Fragen
        </p>
      {/if}
    </div>
    
  </div>
</div>
