<script lang="ts">
  /**
   * Forecast Card - Hero-Insight für Dashboard
   * 
   * Zeigt BrainScore-Prognose für den aktuellen Moment
   * basierend auf letztem Test + historischen Daten.
   */
  
  import type { ForecastResult } from '$lib/services/forecast.service';

  interface Props {
    forecast: ForecastResult;
  }

  let { forecast }: Props = $props();

  // Badge-Color basierend auf Score
  let badgeColor = $derived(() => {
    if (forecast.forecastScore >= 70) return 'bg-brand-green text-white';
    if (forecast.forecastScore >= 50) return 'bg-yellow-400 text-gray-900';
    return 'bg-red-500 text-white';
  });

  // Icon basierend auf Basis
  let basisIcon = $derived(() => {
    switch (forecast.basis) {
      case 'recent_test': return 'schedule';
      case 'historical': return 'history';
      case 'no_data': return 'help_outline';
      default: return 'psychology';
    }
  });
</script>

<!-- Hero Forecast Card -->
<div class="card-modern overflow-hidden">
  <div class="p-6 sm:p-8">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-brand-purple text-xl">{basisIcon()}</span>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-gray-900">Dein Fokus jetzt</h2>
          <p class="text-sm text-gray-500">(Einschätzung)</p>
        </div>
      </div>
      
      <!-- Data Points Badge -->
      {#if forecast.dataPoints > 0}
        <div class="hidden sm:block text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {forecast.dataPoints} {forecast.dataPoints === 1 ? 'Datenpunkt' : 'Datenpunkte'}
        </div>
      {/if}
    </div>

    <!-- Score Display (Hero) -->
    <div class="text-center mb-6">
      <div class="score-display mb-4">
        {forecast.forecastScore}
      </div>
      
      <!-- Label Badge -->
      <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full {badgeColor()} font-bold text-lg shadow-lg">
        {#if forecast.forecastScore >= 70}
          <span class="material-symbols-outlined text-xl">check_circle</span>
        {:else if forecast.forecastScore >= 50}
          <span class="material-symbols-outlined text-xl">info</span>
        {:else}
          <span class="material-symbols-outlined text-xl">warning</span>
        {/if}
        <span class="capitalize">{forecast.qualitativeLabel}</span>
      </div>
    </div>

    <!-- Confidence Hint -->
    <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-brand-purple flex-shrink-0">info</span>
        <div class="flex-1">
          <p class="text-sm text-gray-700 font-medium mb-1">
            {forecast.confidenceHint}
          </p>
          <p class="text-xs text-gray-500">
            💡 Diese Schätzung wird mit jedem Test genauer – aktualisiere dein Profil mit einem neuen Test.
          </p>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  /* Responsive Score Display - nutzt bestehende Utility-Class */
  .score-display {
    font-size: clamp(3rem, 12vw, 6rem);
  }
</style>
