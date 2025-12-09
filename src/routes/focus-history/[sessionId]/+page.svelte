<script lang="ts">
  /**
   * Focus Check Detail Page
   * 
   * Zeigt Details eines einzelnen Tests mit kognitiven Bausteinen
   */
  
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { SEGMENT_LABELS, LABEL_TEXT, LABEL_COLORS } from '$lib/utils/focusHistory.utils';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  function goBack() {
    goto('/focus-history');
  }
  
  // Block Level Icons
  const LEVEL_ICONS = {
    low: 'trending_down',
    medium: 'remove',
    high: 'trending_up',
  };
  
  // Block Level Colors
  const LEVEL_COLORS = {
    low: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-green-600 bg-green-50 border-green-200',
  };
  
  // Block Key Labels
  const BLOCK_LABELS = {
    impulsivity: 'Impulskontrolle',
    vigilance: 'Aufmerksamkeit',
    stability: 'Konsistenz',
    engagement: 'Fokus-Qualität',
  };
</script>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-safe">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex items-center gap-4">
        <button
          onclick={goBack}
          class="btn btn-ghost btn-sm"
          aria-label="Zurück zur Historie"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div class="flex-1">
          <h1 class="text-2xl font-black text-gray-900">
            Test Details
          </h1>
          <p class="text-sm text-gray-600">
            {data.dateLabel} um {data.timeLabel} Uhr
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Content -->
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    
    <!-- Score Card -->
    <div class="card-modern p-8 text-center animate-fadeIn">
      <div class="mb-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
          <span class="material-symbols-outlined text-base">schedule</span>
          {SEGMENT_LABELS[data.segment]}
        </div>
      </div>
      
      <div class="mb-4">
        <div class="text-7xl font-black text-purple-600 mb-2">
          {data.score}
        </div>
        <div class="badge badge-{LABEL_COLORS[data.label]} badge-lg">
          {LABEL_TEXT[data.label]}
        </div>
      </div>
      
      <p class="text-sm text-gray-600">
        Brain Score
      </p>
    </div>
    
    <!-- Cognitive Blocks -->
    {#if data.insights && data.insights.blocks.length > 0}
      <div class="card-modern p-6 animate-fadeIn" style="animation-delay: 0.1s;">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-purple-600">psychology</span>
          <h2 class="text-xl font-bold text-gray-900">
            Kognitive Bausteine
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each data.insights.blocks as block}
            <div class="border-2 rounded-lg p-4 {LEVEL_COLORS[block.level]} transition-all hover:shadow-lg">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-2xl">
                  {LEVEL_ICONS[block.level]}
                </span>
                <div class="flex-1">
                  <div class="font-bold text-sm uppercase tracking-wide opacity-80">
                    {BLOCK_LABELS[block.key] || block.key}
                  </div>
                  <div class="font-black text-lg">
                    {block.label}
                  </div>
                </div>
              </div>
              
              <p class="text-sm leading-relaxed opacity-90">
                {block.description}
              </p>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- No Insights Available -->
      <div class="card-modern p-8 text-center animate-fadeIn" style="animation-delay: 0.1s;">
        <div class="text-gray-400 mb-4">
          <span class="material-symbols-outlined text-6xl">info</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          Keine detaillierten Bausteine verfügbar
        </h2>
        <p class="text-gray-600">
          Für diesen Test wurden noch keine kognitiven Bausteine gespeichert. 
          Neuere Tests enthalten automatisch diese detaillierte Analyse.
        </p>
      </div>
    {/if}
    
    <!-- Action Buttons -->
    <div class="card-modern p-6 animate-fadeIn" style="animation-delay: 0.2s;">
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          onclick={() => goto('/dashboard')}
          class="btn-gradient-primary flex-1"
        >
          <span class="material-symbols-outlined">dashboard</span>
          Zum Dashboard
        </button>
        
        <button
          onclick={() => goto('/test')}
          class="btn btn-outline flex-1"
        >
          <span class="material-symbols-outlined">play_arrow</span>
          Neuen Test starten
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .card-modern {
    @apply bg-white rounded-2xl shadow-lg border border-gray-200;
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
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
