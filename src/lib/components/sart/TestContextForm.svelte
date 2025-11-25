<script lang="ts">
  /**
   * TestContextForm.svelte
   * 
   * Neue Komponente für Test Flow v2.0
   * Fragt NACH dem Test und VOR der Screentime-Eingabe nach den Umständen des Tests.
   * 
   * UX-Ziel: User verstehen, in welchen Situationen ihr Fokus besser/schlechter ist
   * Data-Ziel: Kontext-Labels für Research & personalisierte Insights
   */
  
  import { SartService } from '$lib/services/sart.service';
  
  interface Props {
    testId: string;
    onComplete: () => void;
  }
  
  let { testId, onComplete }: Props = $props();
  
  // Available context tags
  const contextOptions = [
    { id: 'nach_uni_arbeit', label: 'Nach der Uni / Arbeit', icon: 'work' },
    { id: 'nach_aufwachen', label: 'Direkt nach dem Aufstehen', icon: 'wb_sunny' },
    { id: 'nach_social_media', label: 'Nach Social Media / Scrollen', icon: 'phone_android' },
    { id: 'zwischendurch', label: 'Zwischendurch / unterwegs', icon: 'commute' },
    { id: 'im_bett', label: 'Im Bett', icon: 'bedtime' },
    { id: 'sonstiges', label: 'Sonstiges', icon: 'more_horiz' },
  ];
  
  let selectedTags = $state<string[]>([]);
  let customText = $state('');
  let isSaving = $state(false);
  
  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter(t => t !== tagId);
    } else {
      if (selectedTags.length >= 3) {
        return; // Max 3 tags
      }
      selectedTags = [...selectedTags, tagId];
    }
  }
  
  async function handleSubmit() {
    if (selectedTags.length === 0) {
      alert('Bitte wähle mindestens einen Kontext aus');
      return;
    }
    
    isSaving = true;
    
    try {
      const success = await SartService.saveTestContext(
        testId, 
        selectedTags, 
        selectedTags.includes('sonstiges') ? customText : undefined
      );
      
      if (success) {
        onComplete();
      } else {
        alert('Fehler beim Speichern. Bitte versuche es erneut.');
      }
    } catch (error) {
      console.error('Error saving test context:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="w-full max-w-lg mx-auto">
  <div class="card bg-white shadow-xl border-2 border-gray-200">
    <div class="card-body p-6 md:p-8">
      
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-3">
          Unter welchen Umständen?
        </h2>
        <p class="text-gray-700 text-sm md:text-base leading-relaxed">
          Diese Info hilft dir später zu verstehen, in welchen Situationen dein Fokus besonders gut oder eher schwächer ist.
        </p>
      </div>
      
      <!-- Context Chips (max 3) -->
      <div class="space-y-3 mb-6">
        {#each contextOptions as option}
          <button
            type="button"
            onclick={() => toggleTag(option.id)}
            disabled={!selectedTags.includes(option.id) && selectedTags.length >= 3}
            class="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all transform active:scale-95 {
              selectedTags.includes(option.id)
                ? 'border-brand-purple bg-brand-purple text-white shadow-lg shadow-purple-500/20'
                : 'border-gray-300 hover:border-brand-purple/50 hover:bg-gray-50 text-gray-900'
            } {
              !selectedTags.includes(option.id) && selectedTags.length >= 3
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer'
            }"
          >
            <span class="material-symbols-outlined text-2xl">
              {option.icon}
            </span>
            <span class="flex-1 text-left font-bold text-base">
              {option.label}
            </span>
            {#if selectedTags.includes(option.id)}
              <span class="material-symbols-outlined text-xl">check_circle</span>
            {/if}
          </button>
        {/each}
      </div>
      
      <!-- Custom Text (if "Sonstiges" selected) -->
      {#if selectedTags.includes('sonstiges')}
        <div class="mb-6">
          <label for="customContext" class="block text-sm font-bold text-gray-900 mb-2">
            Kurz beschreiben (optional)
          </label>
          <input
            id="customContext"
            type="text"
            bind:value={customText}
            placeholder="z.B. 'Nach dem Sport', 'Während Vorlesung'"
            class="input input-bordered w-full h-12 rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            maxlength="100"
          />
          <p class="text-xs text-gray-600 mt-1">
            {customText.length}/100 Zeichen
          </p>
        </div>
      {/if}
      
      <!-- Selection Counter -->
      <div class="text-center mb-6">
        <p class="text-sm font-medium text-gray-700">
          {selectedTags.length} von max. 3 ausgewählt
        </p>
      </div>
      
      <!-- Submit Button -->
      <button
        type="button"
        onclick={handleSubmit}
        disabled={selectedTags.length === 0 || isSaving}
        class="btn-gradient-primary w-full h-14 text-lg font-black"
      >
        {#if isSaving}
          <span class="loading loading-spinner"></span>
          Speichere...
        {:else}
          Weiter zu Screentime
          <span class="ml-2">→</span>
        {/if}
      </button>
      
    </div>
  </div>
</div>
