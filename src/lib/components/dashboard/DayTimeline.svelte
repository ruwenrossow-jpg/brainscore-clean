<script lang="ts">
  /**
   * DayTimeline
   * 
   * Zeigt 5 Tages-Segmente mit:
   * - Icon + Segment-Name
   * - Statische Beschreibung
   * - Highlight des aktuellen Segments
   * - Indikator ob User-Daten vorhanden (hasUserData)
   * - Heutige Test-Counts und Delta vs. Baseline
   * - Integrierte Story für aktuelles Segment
   */
  
  import type { DaySegment, BaselinePoint } from '$lib/types/forecast';
  import { SEGMENT_DEFINITIONS } from '$lib/types/forecast';
  import CurrentSegmentStory from './CurrentSegmentStory.svelte';
  
  export let currentSegment: DaySegment;
  export let userBaseline: BaselinePoint[];
  
  interface SegmentSummary {
    segment: DaySegment;
    todayTestCount: number;
    todayAverageScore: number | null;
    typicalSegmentScore: number;
    delta: number | null;
  }
  
  export let segmentSummaries: SegmentSummary[] = [];
  
  // Prüfe ob User Daten für ein Segment hat
  function hasUserDataForSegment(segment: DaySegment): boolean {
    const segmentDef = SEGMENT_DEFINITIONS.find((s) => s.segment === segment);
    if (!segmentDef) return false;
    
    // Prüfe Stunden des Segments
    const hours = getHoursForSegment(segment);
    const hasData = hours.some((hour) => {
      const point = userBaseline.find((p) => p.hour === hour);
      return point?.hasUserData ?? false;
    });
    
    return hasData;
  }
  
  function getHoursForSegment(segment: DaySegment): number[] {
    switch (segment) {
      case 'morning':
        return [6, 7, 8, 9];
      case 'forenoon':
        return [10, 11];
      case 'midday':
        return [12, 13, 14, 15];
      case 'afternoon':
        return [16, 17, 18, 19];
      case 'evening':
        return [20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
    }
  }
</script>

<div class="card-modern" id="day-timeline">
  <div class="card-body">
    <!-- Header -->
    <h3 class="text-xl font-bold text-gray-900 mb-1">
      Dein Tagesverlauf
    </h3>
    <p class="text-sm text-gray-600 mb-4">
      Kontext für die verschiedenen Tagesphasen
    </p>
    
    <!-- Timeline Grid (kompakter) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {#each SEGMENT_DEFINITIONS as segmentDef}
        {@const isActive = segmentDef.segment === currentSegment}
        {@const hasData = hasUserDataForSegment(segmentDef.segment)}
        {@const summary = segmentSummaries.find(s => s.segment === segmentDef.segment)}
        
        <div
          class="segment-card"
          class:active={isActive}
          class:has-data={hasData}
          class:positive-delta={summary?.delta !== null && summary.delta >= 5}
          class:negative-delta={summary?.delta !== null && summary.delta <= -5}
        >
          <!-- Icon + Data Indicator + "Jetzt" Label -->
          <div class="flex items-center justify-between mb-2">
            <span class="material-symbols-outlined text-2xl segment-icon">
              {segmentDef.icon}
            </span>
            
            <div class="flex items-center gap-1.5">
              {#if isActive}
                <span class="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  JETZT
                </span>
              {/if}
              {#if hasData}
                <div class="w-2 h-2 rounded-full bg-purple-600" title="Daten vorhanden"></div>
              {:else}
                <div class="w-2 h-2 rounded-full bg-gray-300" title="Noch keine Daten"></div>
              {/if}
            </div>
          </div>
          
          <!-- Segment Name -->
          <div class="font-bold text-sm mb-0.5 segment-name">
            {segmentDef.segment === 'morning' ? 'Morgens' :
             segmentDef.segment === 'forenoon' ? 'Vormittags' :
             segmentDef.segment === 'midday' ? 'Mittags' :
             segmentDef.segment === 'afternoon' ? 'Nachmittags' :
             'Abends'}
          </div>
          
          <!-- Hours Range -->
          <div class="text-[11px] text-gray-500 mb-2">
            {segmentDef.startHour}:00 - {segmentDef.endHour === 6 ? '5:59' : `${segmentDef.endHour - 1}:59`}
          </div>
          
          <!-- Description (kompakter) -->
          <div class="text-xs text-gray-600 leading-snug mb-2">
            {segmentDef.description}
          </div>
          
          <!-- Segment Metrics (heutige Daten) -->
          {#if summary}
            {#if summary.todayTestCount > 0}
              <div class="segment-metrics mt-3 pt-3 border-t border-gray-200">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] text-gray-500">Heute:</span>
                  <span class="text-xs font-semibold text-gray-700">
                    {summary.todayTestCount} Test{summary.todayTestCount === 1 ? '' : 's'}
                  </span>
                </div>
                {#if summary.todayAverageScore !== null}
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] text-gray-500">Ø Score:</span>
                    <span class="text-xs font-medium text-gray-700">
                      {summary.todayAverageScore}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-gray-500">Typisch:</span>
                    <span class="text-xs font-medium text-gray-500">
                      {summary.typicalSegmentScore}
                    </span>
                  </div>
                  {#if summary.delta !== null && Math.abs(summary.delta) >= 3}
                    <div class="mt-2 text-center">
                      {#if summary.delta > 0}
                        <span class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          ▲ {Math.round(summary.delta)}
                        </span>
                      {:else}
                        <span class="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          ▼ {Math.abs(Math.round(summary.delta))}
                        </span>
                      {/if}
                    </div>
                  {/if}
                {/if}
              </div>
            {:else}
              <div class="segment-metrics mt-3 pt-3 border-t border-gray-200">
                <span class="text-[10px] text-gray-400 italic">Noch keine Tests heute</span>
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
    
    <!-- Legende (kompakter, mit farbigen Punkten) -->
    <div class="flex flex-wrap items-center gap-4 mt-5 text-xs text-gray-600 border-t border-gray-200 pt-4">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-purple-600"></div>
        <span>Daten vorhanden</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-gray-300"></div>
        <span>Noch keine Tests</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded border-2 border-purple-600"></div>
        <span>Aktueller Abschnitt</span>
      </div>
    </div>
    
    <!-- Story für aktuelles Segment -->
    <CurrentSegmentStory {currentSegment} {segmentSummaries} />
  </div>
</div>

<style>
  .card-modern {
    @apply bg-white rounded-2xl shadow-lg border border-gray-200;
  }
  
  .segment-card {
    @apply p-3 rounded-lg border-2 border-gray-200 bg-white transition-all duration-200;
  }
  
  .segment-card:hover {
    @apply shadow-md border-purple-300;
  }
  
  /* Aktives Segment: Stark hervorheben */
  .segment-card.active {
    @apply border-purple-500 bg-purple-50 shadow-lg;
  }
  
  .segment-card.active .segment-icon {
    @apply text-purple-600;
  }
  
  .segment-card.active .segment-name {
    @apply text-purple-700;
  }
  
  /* Cards mit Daten: Subtiler Hinweis */
  .segment-card.has-data:not(.active) {
    @apply border-purple-200 bg-purple-50/30;
  }
  
  /* Positive Delta: Leicht grüner Rahmen */
  .segment-card.positive-delta {
    @apply border-green-300 bg-green-50/20;
  }
  
  /* Negative Delta: Leicht orangener Rahmen */
  .segment-card.negative-delta {
    @apply border-orange-300 bg-orange-50/20;
  }
  
  .segment-metrics {
    @apply text-left;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
