<script lang="ts">
  /**
   * SART Result - Minimalistisches Ergebnis-Display
   */
  
  import { goto, invalidateAll } from '$app/navigation';
  import { getScoreBand } from '$lib/config/scoring';
  import type { SartMetrics } from '$lib/types/sart.types';
  import { buildSessionInsights } from '$lib/utils/sessionInsights.utils';
  
  interface Props {
    metrics: SartMetrics | null;
    onNext: () => void;
  }
  
  let { metrics, onNext }: Props = $props();
  
  // Build cognitive insights for display
  let insights = $derived(metrics ? buildSessionInsights(metrics) : null);
  
  let showDetails = $state(false);
  
  let scoreBand = $derived(
    metrics ? getScoreBand(metrics.score) : null
  );
  
  async function goToDashboard() {
    // Invalidate all server loads to ensure fresh forecast data
    await invalidateAll();
    goto('/dashboard');
  }
</script>

{#if metrics && scoreBand}
  <div class="card-modern w-full max-w-lg animate-slideUp">
    <div class="p-8 items-center text-center">
      
      <!-- Validity Warning (if test is invalid) -->
      {#if !metrics.isValid}
        <div class="w-full mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left animate-fadeIn">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-2xl text-amber-600 flex-shrink-0">info</span>
            <div>
              <div class="font-black text-amber-900 mb-1">Test möglicherweise nicht repräsentativ</div>
              <p class="text-sm text-amber-800">
                {#if metrics.invalidReason === 'low_valid_ratio'}
                  Zu viele unterbrochene Trials. Stelle sicher, dass du den Test ohne Unterbrechungen durchführst.
                {:else if metrics.invalidReason === 'too_many_ultrafast'}
                  Sehr schnelle Reaktionen bei hoher Fehlerquote deuten auf Spam-Klicken hin. Versuche, konzentriert auf die Aufgabe zu reagieren.
                {:else}
                  Mehrere Qualitätsprobleme erkannt. Wir empfehlen, den Test in ruhiger Umgebung zu wiederholen.
                {/if}
              </p>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Hero Score Display -->
      <div class="w-full mb-10">
        <p class="text-sm text-gray-600 uppercase tracking-wider mb-4 font-bold">Dein BrainScore</p>
        <div class="text-8xl font-black mb-6 bg-gradient-purple bg-clip-text text-transparent">{metrics.score}</div>
        {#if scoreBand.color === 'success'}
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-green text-white font-bold text-lg">
            <span class="material-symbols-outlined text-2xl">check_circle</span>
            {scoreBand.label}
          </div>
        {:else if scoreBand.color === 'warning'}
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 text-gray-900 font-bold text-lg">
            <span class="material-symbols-outlined text-2xl">warning</span>
            {scoreBand.label}
          </div>
        {:else}
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white font-bold text-lg">
            <span class="material-symbols-outlined text-2xl">error</span>
            {scoreBand.label}
          </div>
        {/if}
      </div>

      <!-- Cognitive Insights Reward -->
      {#if insights && insights.blocks.length > 0}
        <div class="w-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6 mb-6 animate-fadeIn">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-2xl text-purple-600">psychology</span>
            <h3 class="text-lg font-bold text-gray-900">Deine Kognitiven Bausteine</h3>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {#each insights.blocks as block}
              {@const levelColors = {
                low: 'bg-red-100 text-red-700 border-red-300',
                medium: 'bg-amber-100 text-amber-700 border-amber-300',
                high: 'bg-green-100 text-green-700 border-green-300',
              }}
              {@const levelIcons = {
                low: 'trending_down',
                medium: 'remove',
                high: 'trending_up',
              }}
              <div class="border-2 rounded-lg p-3 {levelColors[block.level]} text-left">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-symbols-outlined text-lg">{levelIcons[block.level]}</span>
                  <span class="font-bold text-sm">{block.label}</span>
                </div>
                <p class="text-xs leading-relaxed opacity-90">
                  {block.description.substring(0, 80)}...
                </p>
              </div>
            {/each}
          </div>
          
          <p class="text-xs text-gray-600 text-center">
            💡 Detaillierte Bausteine in deiner Fokus-Check-Historie ansehen
          </p>
        </div>
      {/if}

      <!-- Details Toggle -->
      <button 
        class="btn btn-ghost btn-sm mb-6 hover:bg-gray-100 transition-colors"
        onclick={() => showDetails = !showDetails}
      >
        <span class="material-symbols-outlined text-lg">{showDetails ? 'expand_less' : 'expand_more'}</span>
        {showDetails ? 'Details ausblenden' : 'Details anzeigen'}
      </button>

      <!-- Collapsible Details -->
      {#if showDetails}
        <div class="w-full bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6 space-y-4 animate-fadeIn">
          
          <div class="grid grid-cols-2 gap-4">
            
            <div class="text-center">
              <div class="text-2xl font-bold text-black">{metrics.commissionErrors}</div>
              <p class="text-xs text-gray-600 mt-1">Fehler<br/>(bei 3 geklickt)</p>
            </div>

            <div class="text-center">
              <div class="text-2xl font-bold text-black">{metrics.omissionErrors}</div>
              <p class="text-xs text-gray-600 mt-1">Ausgelassen<br/>(nicht geklickt)</p>
            </div>

            <div class="text-center col-span-2">
              <div class="text-2xl font-bold text-black">{metrics.meanReactionTimeMs} ms</div>
              <p class="text-xs text-gray-600 mt-1">Reaktionszeit</p>
            </div>

          </div>

        </div>
      {/if}

      <!-- CTAs -->
      <div class="w-full space-y-3">
        <button 
          class="btn-gradient-primary w-full text-lg font-bold"
          onclick={goToDashboard}
        >
          Zum Dashboard
          <span class="ml-2">→</span>
        </button>
        
        {#if insights && insights.blocks.length > 0}
          <button 
            class="btn btn-outline w-full text-base"
            onclick={async () => {
              await invalidateAll();
              goto('/focus-history');
            }}
          >
            <span class="material-symbols-outlined">psychology</span>
            Alle Bausteine ansehen
          </button>
        {/if}
        
        <button 
          class="btn-secondary w-full text-base"
          onclick={onNext}
        >
          Nochmal testen
        </button>
      </div>

    </div>
  </div>
{/if}
