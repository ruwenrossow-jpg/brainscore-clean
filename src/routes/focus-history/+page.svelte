<script lang="ts">
  /**
   * Focus Check History Page
   * 
   * Zeigt alle einzelnen Tests der letzten 14 Tage (nicht aggregiert)
   * Klick auf einen Test führt zur Detailansicht
   */
  
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { SEGMENT_LABELS, LABEL_TEXT, LABEL_COLORS } from '$lib/utils/focusHistory.utils';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  function goToDetail(sessionId: string) {
    goto(`/focus-history/${sessionId}`);
  }
  
  function goBack() {
    goto('/dashboard');
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-safe">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex items-center gap-4">
        <button
          onclick={goBack}
          class="btn btn-ghost btn-sm"
          aria-label="Zurück zum Dashboard"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div class="flex-1">
          <h1 class="text-2xl font-black text-gray-900">
            Fokus-Check Historie
          </h1>
          <p class="text-sm text-gray-600">
            Letzte 14 Tage
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Content -->
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    
    {#if data.historyDays.length === 0}
      <!-- Empty State -->
      <div class="card-modern p-8 text-center">
        <div class="text-gray-400 mb-4">
          <span class="material-symbols-outlined text-6xl">history</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          Noch keine Tests vorhanden
        </h2>
        <p class="text-gray-600 mb-6">
          Mache deinen ersten Fokus-Check, um deine Historie zu starten.
        </p>
        <button
          onclick={() => goto('/test')}
          class="btn-gradient-primary"
        >
          Ersten Test starten
        </button>
      </div>
    {:else}
      <!-- History Days -->
      {#each data.historyDays as day}
        <div class="card-modern p-6 space-y-4 animate-fadeIn">
          <!-- Day Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1">
              <h2 class="text-lg font-bold text-gray-900">
                {day.dateLabel}
              </h2>
              {#if day.isToday}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mt-1">
                  <span class="material-symbols-outlined text-sm">today</span>
                  Heute
                </span>
              {/if}
            </div>
            
            <div class="text-sm text-gray-500">
              {day.entries.length} Test{day.entries.length === 1 ? '' : 's'}
            </div>
          </div>
          
          <!-- Tests List -->
          <div class="space-y-2">
            {#each day.entries as entry}
              <button
                onclick={() => goToDetail(entry.sessionId)}
                class="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <!-- Time -->
                <div class="w-16 text-center">
                  <div class="text-sm font-semibold text-gray-900">
                    {entry.timeLabel}
                  </div>
                  <div class="text-xs text-gray-500">
                    Uhr
                  </div>
                </div>
                
                <!-- Segment Badge -->
                <div class="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  {SEGMENT_LABELS[entry.segment]}
                </div>
                
                <!-- Score -->
                <div class="flex-1 text-center">
                  <div class="text-2xl font-black text-purple-600">
                    {entry.score}
                  </div>
                </div>
                
                <!-- Label Badge -->
                <div class="badge badge-{LABEL_COLORS[entry.label]} badge-lg">
                  {LABEL_TEXT[entry.label]}
                </div>
                
                <!-- Insights Indicator -->
                {#if entry.hasInsights}
                  <div class="flex items-center gap-1 text-purple-600">
                    <span class="material-symbols-outlined text-lg">psychology</span>
                    <span class="text-xs font-medium hidden sm:inline">Bausteine</span>
                  </div>
                {/if}
                
                <!-- Arrow -->
                <span class="material-symbols-outlined text-gray-400 group-hover:text-purple-600 transition-colors">
                  chevron_right
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
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
</style>
