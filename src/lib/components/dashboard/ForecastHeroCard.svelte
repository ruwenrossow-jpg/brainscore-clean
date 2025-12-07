<script lang="ts">
  /**
   * ForecastHeroCard
   * 
   * Zeigt die Haupt-Prognose für JETZT:
   * - Großer Forecast-Score (0-100)
   * - Label-Badge (fokussiert / stabil / fragil / zerstreut)
   * - Typischer Score für aktuelles Segment (Vergleichswert)
   * - Confidence-Indikator (low / medium / high)
   * - CTAs: "Prognose testen" (primär), "Nur Tagesverlauf ansehen" (sekundär)
   */
  
  import type { ForecastResult } from '$lib/types/forecast';
  import { goto } from '$app/navigation';
  
  export let forecast: ForecastResult;
  
  // Label → Badge-Farbe
  const labelColors: Record<string, string> = {
    fokussiert: 'badge-success',
    stabil: 'badge-info',
    fragil: 'badge-warning',
    zerstreut: 'badge-error',
  };
  
  // Confidence → Icon + Text
  const confidenceInfo: Record<string, { icon: string; text: string }> = {
    low: { icon: 'info', text: 'Erste Einschätzung' },
    medium: { icon: 'check_circle', text: 'Solide Datenbasis' },
    high: { icon: 'verified', text: 'Statistisch robust' },
  };
  
  // Segment → Anzeige-Text
  const segmentLabels: Record<string, string> = {
    morning: 'Morgens',
    forenoon: 'Vormittags',
    midday: 'Mittags',
    afternoon: 'Nachmittags',
    evening: 'Abends',
  };
  
  function handleTestNow() {
    goto('/test');
  }
  
  function handleViewTimeline() {
    // Scroll zu Timeline-Section (falls nicht sichtbar)
    const timeline = document.getElementById('day-timeline');
    timeline?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<div class="card-modern bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20">
  <div class="card-body gap-6">
    <!-- Header: Titel + Confidence -->
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-2xl font-bold text-base-content">
          Deine Prognose
        </h2>
        <p class="text-sm text-base-content/60 mt-1">
          {segmentLabels[forecast.currentSegment]} • Jetzt
        </p>
      </div>
      
      <!-- Confidence Badge -->
      <div class="flex items-center gap-2 text-sm">
        <span class="material-symbols-outlined text-lg opacity-60">
          {confidenceInfo[forecast.confidence].icon}
        </span>
        <span class="opacity-60">{confidenceInfo[forecast.confidence].text}</span>
      </div>
    </div>
    
    <!-- Main Forecast Display -->
    <div class="flex items-center justify-between gap-8">
      <!-- Score (groß) -->
      <div class="flex flex-col">
        {#if forecast.forecastNow !== null}
          <div class="text-7xl font-black text-primary">
            {forecast.forecastNow}
          </div>
          <div class="text-sm text-base-content/60 mt-2">
            BrainScore-Prognose
          </div>
        {:else}
          <div class="text-4xl font-bold text-base-content/40">
            —
          </div>
          <div class="text-sm text-base-content/60 mt-2">
            Noch keine Prognose
          </div>
        {/if}
      </div>
      
      <!-- Label Badge + Typical Score -->
      <div class="flex flex-col items-end gap-4">
        <!-- Label -->
        {#if forecast.label}
          <div class="badge {labelColors[forecast.label]} badge-lg gap-2 px-4 py-3">
            <span class="material-symbols-outlined text-base">
              {forecast.label === 'fokussiert' ? 'bolt' : 
               forecast.label === 'stabil' ? 'trending_flat' :
               forecast.label === 'fragil' ? 'trending_down' :
               'blur_on'}
            </span>
            <span class="font-semibold capitalize">{forecast.label}</span>
          </div>
        {/if}
        
        <!-- Typical Score (Vergleichswert) -->
        {#if forecast.typicalAtThisTime !== null}
          <div class="text-right">
            <div class="text-sm text-base-content/60">
              Typisch für {segmentLabels[forecast.currentSegment].toLowerCase()}:
            </div>
            <div class="text-2xl font-bold text-base-content/80">
              {forecast.typicalAtThisTime}
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Divider -->
    <div class="divider my-0"></div>
    
    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        class="btn-gradient-primary btn-lg flex-1 gap-2"
        on:click={handleTestNow}
      >
        <span class="material-symbols-outlined">play_arrow</span>
        <span>Prognose testen</span>
      </button>
      
      <button
        class="btn btn-outline btn-lg flex-1 gap-2"
        on:click={handleViewTimeline}
      >
        <span class="material-symbols-outlined">schedule</span>
        <span>Tagesverlauf ansehen</span>
      </button>
    </div>
    
    <!-- Info-Hinweis (bei low confidence) -->
    {#if forecast.confidence === 'low'}
      <div class="alert alert-info">
        <span class="material-symbols-outlined">info</span>
        <div class="text-sm">
          <span class="font-semibold">Noch wenige Tests vorhanden.</span>
          Je mehr Tests du machst, desto präziser wird die Prognose.
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-modern {
    @apply shadow-xl;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
