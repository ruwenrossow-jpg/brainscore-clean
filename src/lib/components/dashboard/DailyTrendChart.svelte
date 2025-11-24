<script lang="ts">
  /**
   * Minimaler Dashboard Chart (Platzhalter)
   * 
   * Zeigt einen einfachen Balken-Chart für die letzten 14 Tage
   * Später kann hier eine Chart-Library integriert werden
   */
  import type { DailyScore } from '$features/logbook/types';
  
  interface Props {
    dailyScores: DailyScore[];
    onSelectDay?: (date: string) => void;
  }
  
  let { dailyScores, onSelectDay }: Props = $props();
  
  function handleDayClick(date: string) {
    if (onSelectDay) {
      onSelectDay(date);
    }
  }
  
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
  
  function getBarColor(score: number): string {
    if (score < 40) return 'bg-red-400';
    if (score < 70) return 'bg-yellow-400';
    return 'bg-brand-green';
  }
</script>

<div class="w-full">
  {#if dailyScores.length === 0}
    <div class="text-center py-8 text-gray-500">
      <p>Noch keine Daten verfügbar</p>
      <p class="text-sm">Starte deinen ersten Test, um deine Entwicklung zu sehen.</p>
    </div>
  {:else}
    <!-- Chart Area - Improved Visibility -->
    <div class="relative">
      <!-- Y-Axis Labels -->
      <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 pr-2">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>
      
      <!-- Chart Container -->
      <div class="flex items-end justify-between gap-2 h-48 pl-8 pr-2 border-l-2 border-b-2 border-gray-300 relative">
        <!-- Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div class="border-t border-gray-200"></div>
          <div class="border-t border-gray-200"></div>
          <div class="border-t border-gray-200"></div>
          <div class="border-t border-gray-200"></div>
        </div>
        
        <!-- Bars -->
        {#each dailyScores.slice().reverse() as day, index}
          <button
            onclick={() => handleDayClick(day.date)}
            class="flex-1 flex flex-col items-center group cursor-pointer min-w-0 relative z-10 animate-fadeIn"
            style="animation-delay: {index * 0.05}s;"
            title="{formatDate(day.date)}: {day.dailyScore} Punkte ({day.testCount} {day.testCount === 1 ? 'Test' : 'Tests'})"
          >
            <!-- Bar -->
            <div 
              class="w-full {getBarColor(day.dailyScore)} rounded-t-lg transition-all duration-300 hover:opacity-90 shadow-sm group-hover:shadow-md"
              style="height: {Math.max(day.dailyScore, 8)}%;"
            ></div>
            
            <!-- Date Label -->
            <div class="text-xs text-gray-500 mt-2 group-hover:text-brand-purple group-hover:font-semibold transition-colors whitespace-nowrap">
              {formatDate(day.date).split('.')[0]}
            </div>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Legend -->
    <div class="flex justify-center gap-4 mt-4 text-xs text-gray-600">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-red-400 rounded"></div>
        <span>Niedrig</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-yellow-400 rounded"></div>
        <span>Okay</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-brand-green rounded"></div>
        <span>Sehr gut</span>
      </div>
    </div>
  {/if}
</div>
