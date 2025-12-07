<script lang="ts">
  /**
   * DayTimeline
   * 
   * Zeigt 5 Tages-Segmente mit:
   * - Icon + Segment-Name
   * - Statische Beschreibung
   * - Highlight des aktuellen Segments
   * - Indikator ob User-Daten vorhanden (hasUserData)
   */
  
  import type { DaySegment, BaselinePoint } from '$lib/types/forecast';
  import { SEGMENT_DEFINITIONS } from '$lib/types/forecast';
  
  export let currentSegment: DaySegment;
  export let userBaseline: BaselinePoint[];
  
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
    <h3 class="text-xl font-bold text-base-content mb-4">
      Dein Tagesverlauf
    </h3>
    
    <!-- Timeline Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {#each SEGMENT_DEFINITIONS as segmentDef}
        {@const isActive = segmentDef.segment === currentSegment}
        {@const hasData = hasUserDataForSegment(segmentDef.segment)}
        
        <div
          class="segment-card"
          class:active={isActive}
          class:has-data={hasData}
        >
          <!-- Icon + Data Indicator -->
          <div class="flex items-center justify-between mb-2">
            <span class="material-symbols-outlined text-3xl segment-icon">
              {segmentDef.icon}
            </span>
            
            {#if hasData}
              <span class="material-symbols-outlined text-sm text-success" title="Daten vorhanden">
                check_circle
              </span>
            {:else}
              <span class="material-symbols-outlined text-sm text-base-content/30" title="Keine Daten">
                radio_button_unchecked
              </span>
            {/if}
          </div>
          
          <!-- Segment Name -->
          <div class="font-bold text-base mb-1 segment-name">
            {segmentDef.segment === 'morning' ? 'Morgens' :
             segmentDef.segment === 'forenoon' ? 'Vormittags' :
             segmentDef.segment === 'midday' ? 'Mittags' :
             segmentDef.segment === 'afternoon' ? 'Nachmittags' :
             'Abends'}
          </div>
          
          <!-- Hours Range -->
          <div class="text-xs text-base-content/60 mb-2">
            {segmentDef.startHour}:00 - {segmentDef.endHour === 6 ? '5:59' : `${segmentDef.endHour - 1}:59`}
          </div>
          
          <!-- Description -->
          <div class="text-sm text-base-content/70">
            {segmentDef.description}
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Legende -->
    <div class="flex items-center gap-6 mt-6 text-sm text-base-content/60">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-sm text-success">check_circle</span>
        <span>Daten vorhanden</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-sm text-base-content/30">radio_button_unchecked</span>
        <span>Keine Daten</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-primary"></div>
        <span>Aktuelles Segment</span>
      </div>
    </div>
  </div>
</div>

<style>
  .card-modern {
    @apply bg-base-100 rounded-2xl shadow-lg border border-base-300;
  }
  
  .segment-card {
    @apply p-4 rounded-xl border-2 border-base-300 bg-base-100 transition-all duration-200;
  }
  
  .segment-card:hover {
    @apply shadow-md border-primary/30;
  }
  
  .segment-card.active {
    @apply border-primary bg-primary/5;
  }
  
  .segment-card.active .segment-icon {
    @apply text-primary;
  }
  
  .segment-card.active .segment-name {
    @apply text-primary;
  }
  
  .segment-card.has-data:not(.active) {
    @apply border-success/30;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
