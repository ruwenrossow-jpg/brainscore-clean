<script lang="ts">
  /**
   * Digital Check-in Component
   * 
   * Kompakte Ein-Screen-Ansicht mit 3 Fragen
   * - ScreenTime-Niveau (Buckets)
   * - Hauptnutzung (max. 2 Kategorien)
   * - Aktivierungsfrequenz
   */
  import { 
    SCREEN_TIME_LABELS, 
    CATEGORY_LABELS, 
    PICKUP_FREQUENCY_LABELS,
    type ScreenTimeBucket,
    type MainCategory,
    type PickupFrequency
  } from '$features/digitalLog/digitalLogTypes';
  
  interface Props {
    testId: string;
    onComplete: () => void;
    onSkip: () => void;
  }
  
  let { testId, onComplete, onSkip }: Props = $props();
  
  let screenTimeBucket = $state<ScreenTimeBucket | null>(null);
  let selectedCategories = $state<MainCategory[]>([]);
  let pickupFrequency = $state<PickupFrequency | null>(null);
  let isSaving = $state(false);
  let errorMessage = $state('');
  
  function toggleCategory(category: MainCategory) {
    const index = selectedCategories.indexOf(category);
    if (index > -1) {
      selectedCategories = selectedCategories.filter(c => c !== category);
    } else {
      if (selectedCategories.length >= 2) {
        return; // Max 2 categories
      }
      selectedCategories = [...selectedCategories, category];
    }
  }
  
  async function saveDigitalLog() {
    if (!screenTimeBucket || selectedCategories.length === 0 || !pickupFrequency) {
      errorMessage = 'Bitte beantworte alle 3 Fragen.';
      return;
    }
    
    isSaving = true;
    errorMessage = '';
    
    try {
      const response = await fetch('/api/digital-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          screenTimeBucket,
          mainCategories: selectedCategories,
          pickupFrequency
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save digital log');
      }
      
      console.log('✅ Digital Log gespeichert');
      onComplete();
    } catch (error) {
      console.error('❌ Digital Log Fehler:', error);
      errorMessage = 'Fehler beim Speichern. Bitte versuche es erneut.';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="card-modern w-full max-w-2xl animate-fadeIn">
  <div class="p-10">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 mb-4">
        <span class="material-symbols-outlined text-brand-purple">smartphone</span>
        <span class="text-sm font-bold text-brand-purple uppercase tracking-wide">Optional, 10 Sekunden</span>
      </div>
      <h2 class="text-3xl font-black text-gray-900 mb-3">
        Digitaler Check-in
      </h2>
      <p class="text-gray-600 text-base">
        Hilf uns zu verstehen, wie dein Handyverhalten mit deinem BrainScore zusammenhängt.
      </p>
    </div>
    
    {#if errorMessage}
      <div class="alert alert-error bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <span class="material-symbols-outlined text-red-600">error</span>
        <span class="text-sm text-red-700 font-medium">{errorMessage}</span>
      </div>
    {/if}
    
    <!-- Question 1: ScreenTime-Niveau -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        1. Wie viel Zeit am Handy seit dem letzten Test?
      </div>
      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(SCREEN_TIME_LABELS) as [bucket, label]}
          <button
            onclick={() => screenTimeBucket = bucket as ScreenTimeBucket}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all {
              screenTimeBucket === bucket
                ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg scale-105'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Question 2: Hauptnutzung -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        2. Wofür hauptsächlich genutzt? <span class="text-sm font-normal text-gray-500">(max. 2)</span>
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
    
    <!-- Question 3: Aktivierungsfrequenz -->
    <div class="mb-8">
      <div class="block text-lg font-black text-gray-900 mb-4">
        3. Wie oft zum Handy gegriffen?
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
    
    <!-- Actions -->
    <div class="flex gap-4">
      <button
        onclick={onSkip}
        class="btn-secondary flex-1 text-base"
        disabled={isSaving}
      >
        Überspringen
      </button>
      <button
        onclick={saveDigitalLog}
        class="btn-gradient-primary flex-1 text-lg font-black"
        disabled={isSaving || !screenTimeBucket || selectedCategories.length === 0 || !pickupFrequency}
      >
        {#if isSaving}
          <span class="loading loading-spinner"></span>
          Speichern...
        {:else}
          Speichern
        {/if}
      </button>
    </div>
    
  </div>
</div>
