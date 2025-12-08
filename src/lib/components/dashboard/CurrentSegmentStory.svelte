<script lang="ts">
  /**
   * CurrentSegmentStory
   * 
   * Zeigt EINE Story-Card für das aktuell ausgewählte Segment.
   * Keine Swiper-Logik, keine Dots - nur eine fokussierte Story.
   */
  
  import type { DaySegment } from '$lib/types/forecast';
  import { SEGMENT_DEFINITIONS } from '$lib/types/forecast';
  
  interface SegmentSummary {
    segment: DaySegment;
    todayTestCount: number;
    todayAverageScore: number | null;
    typicalSegmentScore: number;
    delta: number | null;
  }
  
  export let currentSegment: DaySegment;
  export let segmentSummaries: SegmentSummary[];
  
  // Segment Labels (für UI)
  const segmentLabels: Record<DaySegment, string> = {
    morning: 'Morgens',
    forenoon: 'Vormittags',
    midday: 'Mittags',
    afternoon: 'Nachmittags',
    evening: 'Abends',
  };
  
  // Finde aktuelles Segment
  $: currentSummary = segmentSummaries.find(s => s.segment === currentSegment);
  $: currentSegmentDef = SEGMENT_DEFINITIONS.find(s => s.segment === currentSegment);
  
  // Story-Text generieren basierend auf Daten
  $: storyText = (() => {
    if (!currentSummary || !currentSegmentDef) return '';
    
    const label = segmentLabels[currentSegment];
    const description = currentSegmentDef.description;
    
    // Keine Tests heute in diesem Segment
    if (currentSummary.todayTestCount === 0) {
      return `${description}. In den letzten 30 Tagen lag dein typischer Score ${label.toLowerCase()} bei ${currentSummary.typicalSegmentScore}.`;
    }
    
    // Tests vorhanden - personalisierte Insights
    const deltaAbs = Math.abs(currentSummary.delta ?? 0);
    
    if (currentSummary.delta === null || deltaAbs < 5) {
      return `Du liegst heute mit durchschnittlich ${currentSummary.todayAverageScore} Punkten im typischen Bereich für diese Phase (${currentSummary.typicalSegmentScore}). ${description}.`;
    }
    
    if (currentSummary.delta! > 0) {
      return `Du liegst heute ${Math.round(deltaAbs)} Punkte über deiner üblichen ${label}-Leistung. Dein Score von ${currentSummary.todayAverageScore} ist deutlich besser als typisch (${currentSummary.typicalSegmentScore}).`;
    }
    
    return `Du liegst heute ${Math.round(deltaAbs)} Punkte unter deiner üblichen ${label}-Linie. Mit einem Score von ${currentSummary.todayAverageScore} bist du etwas niedriger als typisch (${currentSummary.typicalSegmentScore}).`;
  })();
</script>

{#if currentSummary && currentSegmentDef}
  <div class="story-card mt-6 animate-fadeIn">
    <!-- Card Header -->
    <div class="flex items-center gap-3 mb-3">
      <span class="material-symbols-outlined text-3xl text-purple-600">
        {currentSegmentDef.icon}
      </span>
      <div class="flex-1">
        <h4 class="text-lg font-bold text-gray-900">
          {segmentLabels[currentSegment]}
        </h4>
        <div class="text-xs text-gray-500">
          {currentSegmentDef.startHour}:00 – {currentSegmentDef.endHour === 6 ? '5:59' : `${currentSegmentDef.endHour - 1}:59`}
        </div>
      </div>
    </div>
    
    <!-- Story Text -->
    <p class="text-sm text-gray-700 leading-relaxed mb-3">
      {storyText}
    </p>
    
    <!-- Delta Badge (wenn signifikant) -->
    {#if currentSummary.delta !== null && Math.abs(currentSummary.delta) >= 10}
      <div class="pt-3 border-t border-gray-200">
        {#if currentSummary.delta > 0}
          <div class="flex items-center gap-2 text-green-600">
            <span class="material-symbols-outlined text-lg">trending_up</span>
            <span class="text-xs font-semibold">
              Heute {Math.round(currentSummary.delta)} Punkte über typisch
            </span>
          </div>
        {:else}
          <div class="flex items-center gap-2 text-orange-600">
            <span class="material-symbols-outlined text-lg">trending_down</span>
            <span class="text-xs font-semibold">
              Heute {Math.abs(Math.round(currentSummary.delta))} Punkte unter typisch
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .story-card {
    @apply p-5 rounded-xl border-2 border-purple-200 bg-purple-50/30;
    @apply transition-all duration-200;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
</style>
