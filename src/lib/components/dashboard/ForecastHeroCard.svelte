<script lang="ts">
  /**
   * ForecastHeroCard - UX-optimiert
   * 
   * Eine Hauptkennzahl: Aktueller BrainScore
   * - Kompaktes Delta-Signal vs. typischer Wert in Tagesphase
   * - Einfache Zuverlässigkeitsanzeige (Prozent)
   * - Korrekte Fokus-Check-Zählung
   * - Keine Doppelkommunikation
   */
  
  import type { ForecastResult } from '$lib/types/forecast';
  import { goto } from '$app/navigation';
  
  export let forecast: ForecastResult;
  export let typicalForSegment: number;
  export let delta: number | null;
  export let todayTestCount: number;
  export let segmentReliability: number;
  export let segmentTestCount: number;
  
  // Label → Pill-Farbe
  const labelStyles: Record<string, string> = {
    fokussiert: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stabil: 'bg-blue-100 text-blue-800 border-blue-300',
    fragil: 'bg-amber-100 text-amber-800 border-amber-300',
    zerstreut: 'bg-orange-100 text-orange-700 border-orange-300',
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
    const timeline = document.getElementById('day-timeline');
    timeline?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<div class="card-modern bg-gradient-to-br from-purple-50 via-white to-blue-50 border-2 border-purple-200">
  <div class="card-body gap-6">
    
    <!-- Header: Titel + Kontext (OHNE Badge rechts) -->
    <div>
      <h2 class="text-2xl sm:text-3xl font-black text-gray-900">
        Dein aktueller BrainScore
      </h2>
      <p class="text-sm text-gray-600 mt-1">
        {segmentLabels[forecast.currentSegment]} • Jetzt
      </p>
    </div>
    
    <!-- Score Display (zentriert, groß) -->
    <div class="flex flex-col items-center justify-center py-4">
      {#if forecast.forecastNow !== null}
        <!-- Score mit Delta-Signal (kompakt, direkt beim Score) -->
        <div class="relative">
          <div class="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">
            {forecast.forecastNow}
          </div>
          
          <!-- Delta-Pfeil direkt neben Score (nur wenn |delta| >= 2) -->
          {#if delta !== null && Math.abs(delta) >= 2}
            <div class="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2">
              {#if delta > 0}
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-2xl sm:text-3xl text-green-500">▲</span>
                  <span class="text-xs sm:text-sm font-bold text-green-600">{Math.round(Math.abs(delta))}</span>
                </div>
              {:else}
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-2xl sm:text-3xl text-red-500">▼</span>
                  <span class="text-xs sm:text-sm font-bold text-red-600">{Math.round(Math.abs(delta))}</span>
                </div>
              {/if}
            </div>
          {/if}
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
        
        <!-- Zuverlässigkeit (dynamisch basierend auf Segment-Evidenz) -->
        <div class="mt-4 text-center">
          <div class="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-600">Zuverlässigkeit:</span>
              <span class="text-sm font-bold text-gray-900">
                {segmentReliability}%
              </span>
            </div>
            <span class="text-xs text-gray-500">
              {#if segmentTestCount >= 3}
                ({segmentTestCount} Tests {segmentLabels[forecast.currentSegment].toLowerCase()}, {forecast.evidence.testCount} gesamt)
              {:else if segmentTestCount >= 1}
                ({segmentTestCount} Test{segmentTestCount === 1 ? '' : 's'} {segmentLabels[forecast.currentSegment].toLowerCase()}, {forecast.evidence.testCount} gesamt)
              {:else if forecast.evidence.testCount >= 10}
                (basierend auf {forecast.evidence.testCount} historischen Tests)
              {:else}
                ({forecast.evidence.testCount} Test{forecast.evidence.testCount === 1 ? '' : 's'} gesamt)
              {/if}
            </span>
          </div>
        </div>
      {:else}
        <div class="text-5xl font-bold text-gray-400">—</div>
        <p class="text-sm text-gray-500 mt-2">Noch kein Score verfügbar</p>
      {/if}
    </div>
    
    <!-- Fokus-Checks heute (korrigiert) -->
    <div class="flex flex-col items-center gap-2 py-3 px-4 bg-purple-50/50 rounded-xl border border-purple-100">
      <p class="text-sm font-medium text-gray-700">
        <span class="font-bold text-purple-600">Fokus-Checks heute: {todayTestCount}</span>
      </p>
      <p class="text-xs text-gray-600">
        Empfohlen: 2–4 Checks pro Tag
      </p>
      <!-- Optional: Visuelle Dots (max 4) -->
      <div class="flex gap-2">
        {#each Array(Math.min(4, todayTestCount + 1)) as _, i}
          <div class="w-2.5 h-2.5 rounded-full {i < todayTestCount ? 'bg-purple-600' : 'bg-gray-300'}"></div>
        {/each}
      </div>
    </div>
    
    <!-- Divider -->
    <div class="divider my-0"></div>
    
    <!-- CTAs -->
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
    
    <!-- Info-Hinweis (nur bei low confidence) -->
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
