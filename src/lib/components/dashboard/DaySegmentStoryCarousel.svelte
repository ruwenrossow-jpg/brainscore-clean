<script lang="ts">
  /**
   * DaySegmentStoryCarousel
   * 
   * Zeigt Story-Karten für Tagesphasen:
   * - Mobil: Eine Story sichtbar, horizontal scrollbar
   * - Desktop: 2-3 Stories nebeneinander
   * - Auto-scroll zur aktuellen Tagesphase
   * - Personalisierte Insights basierend auf heutigen Daten
   */
  
  import { onMount } from 'svelte';
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
  
  let carouselContainer: HTMLDivElement;
  
  // Segment Labels (für UI)
  const segmentLabels: Record<DaySegment, string> = {
    morning: 'Morgens',
    forenoon: 'Vormittags',
    midday: 'Mittags',
    afternoon: 'Nachmittags',
    evening: 'Abends',
  };
  
  // Story-Texte generieren basierend auf Daten
  function getStoryText(summary: SegmentSummary): string {
    const label = segmentLabels[summary.segment];
    const segmentDef = SEGMENT_DEFINITIONS.find(s => s.segment === summary.segment);
    const description = segmentDef?.description ?? '';
    
    // Keine Tests heute in diesem Segment
    if (summary.todayTestCount === 0) {
      return `${label}: ${description}. In den letzten 30 Tagen lag dein typischer Score hier bei ${summary.typicalSegmentScore}.`;
    }
    
    // Tests vorhanden - personalisierte Insights
    const deltaAbs = Math.abs(summary.delta ?? 0);
    
    if (summary.delta === null || deltaAbs < 5) {
      return `${label}: Du liegst heute mit durchschnittlich ${summary.todayAverageScore} Punkten im typischen Bereich für diese Phase (${summary.typicalSegmentScore}). ${description}.`;
    }
    
    if (summary.delta! > 0) {
      return `${label}: Du liegst heute ${Math.round(deltaAbs)} Punkte über deiner üblichen ${label}-Leistung. Dein Score von ${summary.todayAverageScore} ist deutlich besser als typisch (${summary.typicalSegmentScore}).`;
    }
    
    return `${label}: Du liegst heute ${Math.round(deltaAbs)} Punkte unter deiner üblichen ${label}-Linie. Mit einem Score von ${summary.todayAverageScore} bist du etwas niedriger als typisch (${summary.typicalSegmentScore}).`;
  }
  
  // Auto-scroll zur aktuellen Phase beim Mount
  onMount(() => {
    if (!carouselContainer) return;
    
    const currentIndex = SEGMENT_DEFINITIONS.findIndex(s => s.segment === currentSegment);
    if (currentIndex === -1) return;
    
    const cards = carouselContainer.querySelectorAll('.story-card');
    const targetCard = cards[currentIndex] as HTMLElement;
    
    if (targetCard) {
      // Smooth scroll zur aktuellen Karte
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 300);
    }
  });
</script>

<div class="card-modern" id="story-carousel">
  <div class="card-body">
    <!-- Header -->
    <h3 class="text-xl font-bold text-gray-900 mb-1">
      Deine Tagesphasen – kurz erklärt
    </h3>
    <p class="text-sm text-gray-600 mb-4">
      Swipe für mehr Details zu jeder Phase
    </p>
    
    <!-- Carousel Container (horizontal scroll) -->
    <div
      bind:this={carouselContainer}
      class="story-carousel-container"
    >
      {#each SEGMENT_DEFINITIONS as segmentDef}
        {@const summary = segmentSummaries.find(s => s.segment === segmentDef.segment)}
        {@const isActive = segmentDef.segment === currentSegment}
        
        <div
          class="story-card"
          class:active={isActive}
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-2xl text-purple-600">
                {segmentDef.icon}
              </span>
              <h4 class="text-base font-bold text-gray-900">
                {segmentLabels[segmentDef.segment]}
              </h4>
            </div>
            
            {#if isActive}
              <span class="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                JETZT
              </span>
            {/if}
          </div>
          
          <!-- Time Range -->
          <div class="text-xs text-gray-500 mb-3">
            {segmentDef.startHour}:00 – {segmentDef.endHour === 6 ? '5:59' : `${segmentDef.endHour - 1}:59`}
          </div>
          
          <!-- Story Text (personalisiert) -->
          {#if summary}
            <p class="text-sm text-gray-700 leading-relaxed">
              {getStoryText(summary)}
            </p>
          {:else}
            <p class="text-sm text-gray-700 leading-relaxed">
              {segmentLabels[segmentDef.segment]}: {segmentDef.description}
            </p>
          {/if}
          
          <!-- Delta Badge (wenn signifikant) -->
          {#if summary && summary.delta !== null && Math.abs(summary.delta) >= 10}
            <div class="mt-4 pt-3 border-t border-gray-200">
              {#if summary.delta > 0}
                <div class="flex items-center gap-2 text-green-600">
                  <span class="material-symbols-outlined text-lg">trending_up</span>
                  <span class="text-xs font-semibold">
                    Heute {Math.round(summary.delta)} Punkte über typisch
                  </span>
                </div>
              {:else}
                <div class="flex items-center gap-2 text-orange-600">
                  <span class="material-symbols-outlined text-lg">trending_down</span>
                  <span class="text-xs font-semibold">
                    Heute {Math.abs(Math.round(summary.delta))} Punkte unter typisch
                  </span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
    
    <!-- Scroll Indicator (Dots) -->
    <div class="flex justify-center items-center gap-2 mt-4">
      {#each SEGMENT_DEFINITIONS as segmentDef}
        {@const isActive = segmentDef.segment === currentSegment}
        <div
          class="w-2 h-2 rounded-full transition-all"
          class:bg-purple-600={isActive}
          class:w-6={isActive}
          class:bg-gray-300={!isActive}
        ></div>
      {/each}
    </div>
  </div>
</div>

<style>
  .card-modern {
    @apply bg-white rounded-2xl shadow-lg border border-gray-200;
  }
  
  .card-body {
    @apply p-6;
  }
  
  /* Carousel Container: Horizontal Scroll */
  .story-carousel-container {
    @apply flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth;
    @apply pb-2 -mx-2 px-2;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  
  .story-carousel-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  /* Story Card */
  .story-card {
    @apply flex-shrink-0 snap-center;
    @apply p-5 rounded-xl border-2 border-gray-200 bg-white;
    @apply transition-all duration-200;
    
    /* Mobil: 85% Breite (eine Karte sichtbar) */
    width: 85%;
    min-width: 280px;
    
    /* Desktop: ~33% Breite (2-3 Karten nebeneinander) */
    @media (min-width: 640px) {
      width: 48%;
      min-width: 320px;
    }
    
    @media (min-width: 1024px) {
      width: 32%;
      min-width: 340px;
    }
  }
  
  .story-card:hover {
    @apply shadow-md border-purple-300;
  }
  
  /* Aktive Story: Hervorheben */
  .story-card.active {
    @apply border-purple-500 bg-purple-50 shadow-lg;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
