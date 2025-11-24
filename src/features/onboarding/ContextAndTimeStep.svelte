<script lang="ts">
  /**
   * Context & Time Selection Step
   * 
   * Combined step where user selects:
   * - WHAT contexts they want to test in (max 3)
   * - WHEN (specific time with 15-min intervals)
   * 
   * Uses native <input type="time" step="900"> for mobile-friendly time picker
   */
  import { CONTEXT_SUGGESTIONS_WITH_TIMES, type TrackingContext } from './onboardingTypes';
  
  interface Props {
    contexts: TrackingContext[];
    onContextsChange: (contexts: TrackingContext[]) => void;
  }
  
  let { contexts = $bindable([]), onContextsChange }: Props = $props();
  
  // Active context IDs (for predefined suggestions)
  let activeContextIds = $state<Set<string>>(new Set());
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
    
    // Reset custom inputs
    customLabel = '';
    customTime = '08:00';
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
  }
</script>

<div class="space-y-4 md:space-y-6">
  <div>
    <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3">Wann & wofür testen?</h2>
    <p class="text-gray-600 text-sm md:text-base mb-2">
      Wähle bis zu drei Situationen, in denen du regelmäßig einen Test machen möchtest, und lege gleich die Uhrzeit fest.
    </p>
    <div class="text-sm text-brand-purple font-bold">
      {contexts.length} von 3 ausgewählt
    </div>
  </div>
  
  <!-- Predefined Context Cards -->
  <div class="space-y-3">
    {#each CONTEXT_SUGGESTIONS_WITH_TIMES as { label, defaultTime }}
      {@const isActive = isContextActive(label)}
      {@const matchingContext = contexts.find(c => c.label === label)}
      {@const isDisabled = !isActive && contexts.length >= 3}
      
      <button
        onclick={() => togglePredefinedContext(label, defaultTime)}
        disabled={isDisabled}
        class="w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all {
          isActive
            ? 'border-brand-purple bg-brand-purple/5 shadow-lg'
            : isDisabled
              ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
              : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
        }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="font-black text-base md:text-lg text-gray-900 mb-1">{label}</div>
            
            {#if isActive && matchingContext}
              <!-- Time Picker (active state) -->
              <div class="mt-3">
                <label for="time-{matchingContext.id}" class="block text-xs font-semibold text-gray-700 mb-1">
                  Uhrzeit:
                </label>
                <input
                  id="time-{matchingContext.id}"
                  type="time"
                  step="900"
                  value={matchingContext.time}
                  oninput={(e) => updateContextTime(matchingContext.id, e.currentTarget.value)}
                  onclick={(e) => e.stopPropagation()}
                  class="input input-bordered w-full max-w-[180px] h-10 md:h-12 text-sm md:text-base font-mono bg-white"
                />
              </div>
            {:else}
              <!-- Default time hint (inactive state) -->
              <div class="text-sm text-gray-600">
                Standard: {defaultTime} Uhr
              </div>
            {/if}
          </div>
          
          <div class="flex-shrink-0">
            {#if isActive}
              <span class="material-symbols-outlined text-2xl md:text-3xl text-brand-purple">check_circle</span>
            {:else if isDisabled}
              <span class="material-symbols-outlined text-2xl md:text-3xl text-gray-300">radio_button_unchecked</span>
            {:else}
              <span class="material-symbols-outlined text-2xl md:text-3xl text-gray-500">add_circle</span>
            {/if}
          </div>
        </div>
      </button>
    {/each}
  </div>
  
  <!-- Custom Context Card -->
  {#if contexts.length < 3}
    <div class="p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
      <div class="font-black text-base md:text-lg text-gray-900 mb-3">Eigene Situation hinzufügen</div>
      
      <div class="space-y-3">
        <div>
          <label for="custom-label" class="block text-xs font-semibold text-gray-700 mb-1">
            Situation beschreiben:
          </label>
          <input
            id="custom-label"
            type="text"
            bind:value={customLabel}
            placeholder="z.B. 'Vor dem Training'"
            class="input input-bordered w-full h-10 md:h-12 text-sm md:text-base font-medium rounded-xl bg-white border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
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
            class="input input-bordered w-full max-w-[180px] h-10 md:h-12 text-sm md:text-base font-mono bg-white"
          />
        </div>
        
        <button
          onclick={addCustomContext}
          class="btn-gradient-primary w-full h-10 md:h-12 text-sm md:text-base font-black"
          disabled={!customLabel.trim()}
        >
          <span class="material-symbols-outlined mr-2">add</span>
          Hinzufügen
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Summary: Selected Contexts -->
  {#if contexts.length > 0}
    <div class="p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/20">
      <div class="text-sm font-black text-gray-900 mb-3">Deine Situationen:</div>
      <div class="space-y-2">
        {#each contexts as context}
          <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div class="flex-1">
              <div class="font-bold text-gray-900">{context.label}</div>
              <div class="text-sm text-gray-600 font-mono">{context.time} Uhr</div>
            </div>
            <button
              onclick={() => removeContext(context.id)}
              class="text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Entfernen"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
