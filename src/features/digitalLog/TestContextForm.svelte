<script lang="ts">
  /**
   * Test Context Form
   * 
   * Erfasst die Umstände, unter denen der Test durchgeführt wurde.
   * Wird NACH dem Ergebnis und VOR dem Digital Check-in angezeigt.
   */
  
  export type TestContextTag = 
    | 'nach_uni_arbeit' 
    | 'nach_aufstehen' 
    | 'nach_social_media' 
    | 'zwischendurch' 
    | 'im_bett' 
    | 'sonstiges';
  
  export interface TestContext {
    tags: TestContextTag[];
    customText?: string;
  }
  
  const CONTEXT_OPTIONS: { value: TestContextTag; label: string; icon: string }[] = [
    { value: 'nach_uni_arbeit', label: 'Nach der Uni / Arbeit', icon: 'school' },
    { value: 'nach_aufstehen', label: 'Direkt nach dem Aufstehen', icon: 'wb_sunny' },
    { value: 'nach_social_media', label: 'Nach Social Media / Scrollen', icon: 'smartphone' },
    { value: 'zwischendurch', label: 'Zwischendurch / unterwegs', icon: 'directions_walk' },
    { value: 'im_bett', label: 'Im Bett', icon: 'hotel' },
    { value: 'sonstiges', label: 'Sonstiges', icon: 'more_horiz' }
  ];
  
  interface Props {
    onComplete: (context: TestContext) => void;
    onSkip: () => void;
  }
  
  let { onComplete, onSkip }: Props = $props();
  
  let selectedTags = $state<TestContextTag[]>([]);
  let customText = $state('');
  let errorMessage = $state('');
  
  let showCustomInput = $derived(selectedTags.includes('sonstiges'));
  
  function toggleTag(tag: TestContextTag) {
    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      if (selectedTags.length >= 3) {
        errorMessage = 'Maximal 3 Optionen auswählbar';
        return;
      }
      selectedTags = [...selectedTags, tag];
      errorMessage = '';
    }
  }
  
  function handleSubmit() {
    if (selectedTags.length === 0) {
      errorMessage = 'Bitte wähle mindestens eine Option aus';
      return;
    }
    
    const context: TestContext = {
      tags: selectedTags,
      customText: showCustomInput && customText.trim() ? customText.trim() : undefined
    };
    
    onComplete(context);
  }
</script>

<div class="card-modern w-full max-w-2xl animate-fadeIn">
  <div class="p-8 md:p-10">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 mb-4">
        <span class="material-symbols-outlined text-brand-purple">psychology</span>
        <span class="text-sm font-bold text-brand-purple uppercase tracking-wide">Schritt 1 von 2</span>
      </div>
      <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-3">
        Unter welchen Umständen hast du diesen Test gemacht?
      </h2>
      <p class="text-gray-600 text-sm md:text-base">
        Diese Info hilft dir später zu verstehen, in welchen Situationen dein Fokus besonders gut oder eher schwächer ist.
      </p>
    </div>
    
    {#if errorMessage}
      <div class="alert alert-warning bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <span class="material-symbols-outlined text-amber-600">info</span>
        <span class="text-sm text-amber-700 font-medium">{errorMessage}</span>
      </div>
    {/if}
    
    <!-- Context Options (Chips) -->
    <div class="mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each CONTEXT_OPTIONS as option}
          <button
            onclick={() => toggleTag(option.value)}
            disabled={!selectedTags.includes(option.value) && selectedTags.length >= 3}
            class="p-4 rounded-xl border-2 font-bold text-base transition-all flex items-center gap-3 min-h-[64px] {
              selectedTags.includes(option.value)
                ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            } {
              !selectedTags.includes(option.value) && selectedTags.length >= 3
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }"
          >
            <span class="material-symbols-outlined text-2xl flex-shrink-0">{option.icon}</span>
            <span class="flex-1 text-left">{option.label}</span>
            {#if selectedTags.includes(option.value)}
              <span class="material-symbols-outlined text-xl flex-shrink-0">check_circle</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="text-sm text-gray-500 mt-3 text-center font-medium">
        {selectedTags.length} von max. 3 ausgewählt
      </div>
    </div>
    
    <!-- Custom Text (if "Sonstiges" selected) -->
    {#if showCustomInput}
      <div class="mb-6 animate-fadeIn">
        <label for="customContext" class="block text-sm font-bold text-gray-900 mb-2">
          Kurz beschreiben (optional)
        </label>
        <input
          id="customContext"
          type="text"
          bind:value={customText}
          placeholder="z.B. 'Nach dem Sport', 'Vor dem Schlafen', ..."
          maxlength="50"
          class="input input-bordered w-full h-12 text-base rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
        />
        <div class="text-xs text-gray-500 mt-1">
          {customText.length} / 50 Zeichen
        </div>
      </div>
    {/if}
    
    <!-- Actions -->
    <div class="flex gap-4">
      <button
        onclick={onSkip}
        class="btn-secondary flex-1 text-base"
      >
        Überspringen
      </button>
      <button
        onclick={handleSubmit}
        class="btn-gradient-primary flex-1 text-lg font-black"
        disabled={selectedTags.length === 0}
      >
        Weiter <span class="ml-2">→</span>
      </button>
    </div>
    
  </div>
</div>
