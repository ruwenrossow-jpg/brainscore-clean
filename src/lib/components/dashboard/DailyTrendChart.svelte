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

  // FIX 1: Defensive Filtering für valide Scores + aufsteigend sortiert
  let validScores = $derived(
    (dailyScores ?? [])
      .filter((d) => {
        const score = getScoreValue(d);
        const isValid = typeof score === 'number' && !Number.isNaN(score) && score >= 0;
        if (!isValid) {
          console.warn('⚠️ Filtered invalid score:', d);
        }
        return isValid;
      })
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date)) // Chronologisch: älteste zuerst
  );

  let hasData = $derived(validScores.length > 0);
  
  // Helper: Extrahiert Score (auch bei snake_case)
  function getScoreValue(day: DailyScore | any): number {
    if (typeof day.dailyScore === 'number') return day.dailyScore;
    if (typeof day.daily_score === 'number') {
      console.warn('⚠️ Found daily_score instead of dailyScore');
      return day.daily_score;
    }
    return 0;
  }
  
  // Debug-Logging - ERWEITERT
  $effect(() => {
    console.log('📊 DailyTrendChart received:', dailyScores.length, 'entries');
    console.log('📊 Valid scores:', validScores.length);
    if (validScores.length > 0) {
      console.log('📊 First score:', validScores[0]);
      console.log('📊 Last score:', validScores[validScores.length - 1]);
      console.log('📊 All scores:', validScores.map(d => ({ date: d.date, score: getScoreValue(d) })));
    }
  });
  
  function handleDayClick(date: string) {
    if (onSelectDay) {
      onSelectDay(date);
    }
  }
  
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
  
  // FIX 2: Unified Score Getter
  function getScore(day: DailyScore): number {
    return getScoreValue(day);
  }
  
  function getBarColor(score: number | null | undefined): string {
    const s = score ?? 0;
    if (s < 40) return 'bg-red-400';
    if (s < 70) return 'bg-yellow-400';
    return 'bg-brand-green';
  }
</script>

<div class="w-full">
  {#if !hasData}
    <div class="text-center py-8 text-gray-500">
      <p class="font-semibold mb-2">Noch keine Daten verfügbar</p>
      <p class="text-sm">Beginne mit deinem ersten Test, um deinen Verlauf zu sehen.</p>
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
        
        <!-- Bars - FIX: Zeige nur letzte 14 Tage, sortiere chronologisch -->
        {#each validScores.slice(-14) as day, index}
          {@const score = getScore(day)}
          {@const barHeightPercent = Math.max(score, 8)}
          <button
            onclick={() => handleDayClick(day.date)}
            class="flex-1 flex flex-col items-center group cursor-pointer relative z-10 animate-fadeIn"
            style="animation-delay: {index * 0.05}s; min-width: 20px;"
            title="{formatDate(day.date)}: {score} Punkte ({day.testCount} {day.testCount === 1 ? 'Test' : 'Tests'})"
          >
            <!-- Bar - FIXED: Direkte Prozent-Berechnung (0-100 Score → 0-100% Height) -->
            <div 
              class="w-full {getBarColor(score)} rounded-t-lg transition-all duration-300 hover:opacity-90 shadow-sm group-hover:shadow-md"
              style="height: {barHeightPercent}%; min-height: 8px;"
            ></div>
            
            <!-- Date Label -->
            <div class="text-[10px] md:text-xs text-gray-500 mt-2 group-hover:text-brand-purple group-hover:font-semibold transition-colors whitespace-nowrap">
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
