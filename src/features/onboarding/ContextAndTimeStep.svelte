<script lang="ts">
  /**
   * Context & Time Selection Step - REDESIGNED
   * 
   * Phase 1: Auswahl der Situationen (max 3) → einheitliche Karten
   * Phase 2: Zeit-Anpassung für ausgewählte Kontexte (optional)
   * 
   * UX-Prinzipien:
   * - Einheitliche Karten für alle Optionen (Vorschläge + Custom)
   * - Zeit-Eingabe erst NACH Auswahl sichtbar
   * - "Eigene Situation" wirkt wie normale Option
   */
  import { CONTEXT_SUGGESTIONS_WITH_TIMES, type TrackingContext } from './onboardingTypes';
  
  interface Props {
    contexts: TrackingContext[];
    onContextsChange: (contexts: TrackingContext[]) => void;
  }
  
  let { contexts = $bindable([]), onContextsChange }: Props = $props();
  
  // UI State
  let showCustomInput = $state(false);
  let editingContextId = $state<string | null>(null);
  let customLabel = $state('');
  let customTime = $state('08:00');
  
  // Check if a predefined context is already added
  function isContextActive(label: string): boolean {
    return contexts.some(c => c.label === label);
  }
  
  // Toggle predefined context
  function togglePredefinedContext(label: string, defaultTime: string) {
    const existing = contexts.find(c => c.label === label);
    
    if (existing) {
      // Remove
      contexts = contexts.filter(c => c.id !== existing.id);
      onContextsChange(contexts);
    } else {
      // Add (if under limit)
      if (contexts.length >= 3) {
        return;
      }
      
      const newContext: TrackingContext = {
        id: crypto.randomUUID(),
        label,
        time: defaultTime
      };
      
      contexts = [...contexts, newContext];
      onContextsChange(contexts);
    }
  }
  
  // Open custom context form
  function openCustomForm() {
    if (contexts.length >= 3) return;
    showCustomInput = true;
  }
  
  // Add custom context
  function addCustomContext() {
    if (!customLabel.trim() || contexts.length >= 3) return;
    
    const newContext: TrackingContext = {
      id: crypto.randomUUID(),
      label: customLabel.trim(),
      time: customTime
    };
    
    contexts = [...contexts, newContext];
    onContextsChange(contexts);
    
    // Reset & close
    customLabel = '';
    customTime = '08:00';
    showCustomInput = false;
  }
  
  // Cancel custom input
  function cancelCustomInput() {
    customLabel = '';
    customTime = '08:00';
    showCustomInput = false;
  }
  
  // Update context time
  function updateContextTime(id: string, time: string) {
    contexts = contexts.map(ctx =>
      ctx.id === id ? { ...ctx, time } : ctx
    );
    onContextsChange(contexts);
  }
  
  // Remove context
  function removeContext(id: string) {
    contexts = contexts.filter(c => c.id !== id);
    onContextsChange(contexts);
    if (editingContextId === id) {
      editingContextId = null;
    }
  }
</script>

<div class="space-y-4 md:space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3">Wann & wofür testen?</h2>
    <p class="text-gray-600 text-sm md:text-base mb-3">
      Wähle bis zu <strong>drei Situationen</strong>, in denen du regelmäßig testen möchtest. 
      Die Uhrzeiten kannst du später anpassen.
    </p>
    <div class="flex items-center gap-2">
      <div class="text-sm font-bold text-brand-purple">
        {contexts.length} von 3 ausgewählt
      </div>
      {#if contexts.length === 3}
        <span class="text-xs text-gray-500">• Limit erreicht</span>
      {/if}
    </div>
  </div>
  
  <!-- Context Selection Grid - Einheitliche Karten -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    {#each CONTEXT_SUGGESTIONS_WITH_TIMES as { label, defaultTime, icon }}
      {@const isActive = isContextActive(label)}
      {@const matchingContext = contexts.find(c => c.label === label)}
      {@const isDisabled = !isActive && contexts.length >= 3}
      
      <div
        class="p-4 rounded-xl border-2 transition-all {
          isActive
            ? 'border-brand-purple bg-brand-purple/5'
            : isDisabled
              ? 'border-gray-200 bg-gray-50 opacity-50'
              : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
        }"
      >
        <button
          onclick={() => togglePredefinedContext(label, defaultTime)}
          disabled={isDisabled}
          class="w-full text-left {isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 pt-1">
              <span class="material-symbols-outlined text-2xl {isActive ? 'text-brand-purple' : 'text-gray-400'}">
                {icon || 'schedule'}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm md:text-base text-gray-900 mb-1 leading-tight">{label}</div>
              {#if !isActive}
                <div class="text-xs text-gray-500 font-mono">{defaultTime} Uhr</div>
              {/if}
            </div>
            <div class="flex-shrink-0">
              {#if isActive}
                <span class="material-symbols-outlined text-xl text-brand-purple">check_circle</span>
              {:else}
                <span class="material-symbols-outlined text-xl text-gray-300">radio_button_unchecked</span>
              {/if}
            </div>
          </div>
        </button>
        
        <!-- Zeit-Picker erscheint direkt in der Karte nach Auswahl -->
        {#if isActive && matchingContext}
          <div class="mt-3 pt-3 border-t border-gray-200">
            <label for="time-{matchingContext.id}" class="block text-xs font-semibold text-gray-700 mb-2">
              Uhrzeit:
            </label>
            <input
              id="time-{matchingContext.id}"
              type="time"
              step="900"
              value={matchingContext.time}
              oninput={(e) => updateContextTime(matchingContext.id, e.currentTarget.value)}
              onclick={(e) => e.stopPropagation()}
              class="input input-bordered w-full max-w-[160px] h-10 text-sm font-mono bg-white"
            />
          </div>
        {/if}
      </div>
    {/each}
    
    <!-- Custom Context Card - IDENTISCHES Design -->
    {#if !showCustomInput}
      <button
        onclick={openCustomForm}
        disabled={contexts.length >= 3}
        class="text-left p-4 rounded-xl border-2 transition-all min-h-[80px] {
          contexts.length >= 3
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50 active:scale-[0.98]'
        }"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 pt-1">
            <span class="material-symbols-outlined text-2xl text-brand-purple">add_circle</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm md:text-base text-gray-900 mb-1 leading-tight">Eigene Situation</div>
            <div class="text-xs text-gray-500">Individuelle Zeit hinzufügen</div>
          </div>
        </div>
      </button>
    {:else}
      <!-- Custom Input Expanded -->
      <div class="col-span-1 md:col-span-2 p-4 rounded-xl border-2 border-brand-purple bg-brand-purple/5">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-brand-purple text-xl">edit</span>
          <div class="font-bold text-sm text-gray-900">Eigene Situation erstellen</div>
        </div>
        
        <div class="space-y-3">
          <div>
            <label for="custom-label" class="block text-xs font-semibold text-gray-700 mb-1">
              Beschreibung:
            </label>
            <input
              id="custom-label"
              type="text"
              bind:value={customLabel}
              placeholder="z.B. 'Vor dem Training'"
              class="input input-bordered w-full h-10 text-sm bg-white"
              onkeydown={(e) => e.key === 'Enter' && addCustomContext()}
            />
          </div>
          
          <div>
            <label for="custom-time" class="block text-xs font-semibold text-gray-700 mb-1">
              Uhrzeit:
            </label>
            <input
              id="custom-time"
              type="time"
              step="900"
              bind:value={customTime}
              class="input input-bordered w-full max-w-[140px] h-10 text-sm font-mono bg-white"
            />
          </div>
          
          <div class="flex gap-2">
            <button
              onclick={addCustomContext}
              class="btn-gradient-primary flex-1 h-10 text-sm font-bold"
              disabled={!customLabel.trim()}
            >
              Hinzufügen
            </button>
            <button
              onclick={cancelCustomInput}
              class="px-4 py-2 rounded-lg font-semibold text-sm border-2 border-gray-300 hover:border-gray-400 active:scale-95"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Selected Contexts - Zusammenfassung -->
  {#if contexts.length > 0}
    <div class="p-4 md:p-5 bg-brand-purple/5 rounded-xl border border-brand-purple/20">
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-sm text-gray-900">Deine Auswahl:</div>
        <div class="text-xs text-gray-500">{contexts.length} {contexts.length === 1 ? 'Situation' : 'Situationen'}</div>
      </div>
      <div class="space-y-2">
        {#each contexts as context}
          <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-gray-900 truncate">{context.label}</div>
              <div class="text-xs text-gray-600 font-mono mt-0.5">{context.time} Uhr</div>
            </div>
            <button
              onclick={() => removeContext(context.id)}
              class="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors ml-3"
              aria-label="Entfernen"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
