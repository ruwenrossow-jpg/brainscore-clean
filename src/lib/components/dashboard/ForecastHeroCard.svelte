<script lang="ts">
  /**
   * ForecastHeroCard
   * 
   * Zeigt den aktuellen BrainScore als Momentaufnahme:
   * - Zentraler Score als Hauptfokus
   * - Label-Pill in warmem Farbton (nicht aggressiv rot)
   * - Check-in Fortschritt (heute)
   * - Vergleichswert für aktuelles Segment
   * - Mobile-optimiert: Score + CTAs im Fokus
   */
  
  import type { ForecastResult } from '$lib/types/forecast';
  import { goto } from '$app/navigation';
  
  export let forecast: ForecastResult;
  export let todayAverageDelta: number | null = null;
  
  // TODO: Check-in Daten (aktuell Platzhalter - keine Logik-Änderung)
  let todayCheckins = 1; // Aus Props/Store holen wenn verfügbar
  let targetCheckins = 3;
  
  // Label → Pill-Farbe (warm, nicht aggressiv)
  const labelStyles: Record<string, string> = {
    fokussiert: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stabil: 'bg-blue-100 text-blue-800 border-blue-300',
    fragil: 'bg-amber-100 text-amber-800 border-amber-300',
    zerstreut: 'bg-orange-100 text-orange-700 border-orange-300',
  };
  
  // Confidence → Kurzer Hinweis
  const confidenceHints: Record<string, string> = {
    low: 'Mehr Tests = genauer',
    medium: 'Wird mit mehr Tests präziser',
    high: 'Statistisch robust',
  };
  
  // Segment → Anzeige-Text
  const segmentLabels: Record<string, string> = {
    morning: 'Morgens',
    forenoon: 'Vormittags',
    midday: 'Mittags',
    afternoon: 'Nachmittags',
    evening: 'Abends',
  };
  
  // Evidenz-Level → Lesbare Texte
  const evidenceLabel = (level: 'low' | 'medium' | 'high'): string => {
    if (level === 'high') return 'hoch';
    if (level === 'medium') return 'mittel';
    return 'niedrig';
  };
  
  function handleTestNow() {
    goto('/test');
  }
  
  function handleViewTimeline() {
    const timeline = document.getElementById('day-timeline');
    timeline?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<div class="card-modern bg-gradient-to-br from-purple-50 via-white to-blue-50 border-2 border-purple-200">
  <div class="card-body gap-6">
    
    <!-- Header: Titel + Validitäts-Hinweis -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <h2 class="text-2xl sm:text-3xl font-black text-gray-900">
          Dein aktueller BrainScore
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          {segmentLabels[forecast.currentSegment]} • Jetzt
        </p>
      </div>
      
      <!-- Validitäts-Tag (rechts oben) -->
      <div class="badge badge-ghost badge-sm text-xs px-3 py-2 whitespace-nowrap">
        {confidenceHints[forecast.confidence]}
      </div>
    </div>
    
    <!-- Score Display (zentriert, groß) -->
    <div class="flex flex-col items-center justify-center py-4">
      {#if forecast.forecastNow !== null}
        <!-- Score -->
        <div class="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">
          {forecast.forecastNow}
        </div>
        
        <!-- Label Pill (unter Score) -->
        {#if forecast.label}
          <div class="mt-4 px-6 py-2.5 rounded-full border-2 {labelStyles[forecast.label]} font-semibold text-base">
            {forecast.label === 'fokussiert' ? '⚡ Fokussiert' :
             forecast.label === 'stabil' ? '✓ Stabil' :
             forecast.label === 'fragil' ? '⚠ Fragil' :
             '○ Zerstreut'}
          </div>
        {/if}
        
        <!-- Evidenz-Anzeige -->
        <div class="mt-3 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-200">
            <span class="text-xs font-medium text-gray-600">Evidenz:</span>
            <span class="text-xs font-semibold text-gray-900">
              {evidenceLabel(forecast.evidence.level)}
            </span>
            {#if forecast.evidence.testCount > 0}
              <span class="text-xs text-gray-500">
                · {forecast.evidence.testCount} Test{forecast.evidence.testCount === 1 ? '' : 's'}
              </span>
            {:else}
              <span class="text-xs text-gray-500">
                · Mach deinen ersten Test
              </span>
            {/if}
          </div>
        </div>
        
        <!-- Heute im Schnitt Delta -->
        {#if todayAverageDelta !== null && todayAverageDelta !== undefined}
          <div class="text-sm text-base-content/70 mt-2">
            {#if todayAverageDelta > 0}
              Heute liegst du im Schnitt <span class="text-success font-semibold">+{Math.round(todayAverageDelta)}</span> Punkte über deiner üblichen Linie
            {:else if todayAverageDelta < -2}
              Heute liegst du im Schnitt <span class="text-error font-semibold">{Math.round(todayAverageDelta)}</span> Punkte unter deiner üblichen Linie
            {:else}
              Heute liegst du etwa auf deiner normalen Linie
            {/if}
          </div>
        {/if}
      {:else}
        <div class="text-5xl font-bold text-gray-400">—</div>
        <p class="text-sm text-gray-500 mt-2">Noch kein Score verfügbar</p>
      {/if}
    </div>
    
    <!-- Check-in Fortschritt (unter Score, vor Vergleich) -->
    <div class="flex flex-col items-center gap-2 py-3 px-4 bg-purple-50/50 rounded-xl border border-purple-100">
      <p class="text-sm font-medium text-gray-700">
        Mentale Check-ins heute: <span class="font-bold text-purple-600">{todayCheckins} von {targetCheckins}</span>
      </p>
      <div class="flex gap-2">
        {#each Array(targetCheckins) as _, i}
          <div class="w-3 h-3 rounded-full {i < todayCheckins ? 'bg-purple-600' : 'bg-gray-300'}"></div>
        {/each}
      </div>
    </div>
    
    <!-- Vergleichswert (deutlich abgegrenzt) -->
    {#if forecast.typicalAtThisTime !== null}
      <div class="text-center py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
        <p class="text-sm text-gray-600 mb-1">
          Dein typischer {segmentLabels[forecast.currentSegment]}-Wert:
        </p>
        <p class="text-3xl font-bold text-gray-900">
          {forecast.typicalAtThisTime}
        </p>
      </div>
    {/if}
    
    <!-- Divider -->
    <div class="divider my-0"></div>
    
    <!-- CTAs (Primary oben auf Mobile) -->
    <div class="flex flex-col gap-3">
      <button
        class="btn-gradient-primary btn-lg w-full gap-2 shadow-lg"
        on:click={handleTestNow}
      >
        <span class="material-symbols-outlined">play_circle</span>
        <span>Fokus jetzt testen (2–3 Min)</span>
      </button>
      
      <button
        class="btn btn-outline btn-lg w-full gap-2"
        on:click={handleViewTimeline}
      >
        <span class="material-symbols-outlined">schedule</span>
        <span>Deinen Tag ansehen</span>
      </button>
    </div>
    
    <!-- Info-Hinweis (freundlich, nicht wie Fehler) -->
    {#if forecast.confidence === 'low'}
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-900">
        <span class="material-symbols-outlined text-lg">lightbulb</span>
        <div class="flex-1">
          <span class="font-medium">Noch wenig Daten: </span>
          <span>Jeder weitere Test macht deine Einschätzung genauer.</span>
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
