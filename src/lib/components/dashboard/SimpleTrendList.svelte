<script lang="ts">
  /**
   * Simple Trend List - Robuster Fallback für Chart-Komponente
   * 
   * Zeigt 7-Tage-Verlauf als kompakte Liste mit Stats
   * statt komplexem Balkendiagramm.
   */
  
  import { goto } from '$app/navigation';
  import type { DailyScore } from '$features/logbook/types';

  interface Props {
    dailyScores: DailyScore[];
  }

  let { dailyScores = [] }: Props = $props();

  // Falls keine Daten: zeige Empty State
  let hasData = $derived(dailyScores.length > 0);
  
  // Stats berechnen (letzte 7 Tage)
  let last7Days = $derived(dailyScores.slice(0, 7));
  let avgScore = $derived(() => {
    if (last7Days.length === 0) return null;
    const sum = last7Days.reduce((acc, d) => acc + (d.dailyScore || 0), 0);
    return Math.round(sum / last7Days.length);
  });
  let maxScore = $derived(() => {
    if (last7Days.length === 0) return null;
    return Math.max(...last7Days.map(d => d.dailyScore || 0));
  });
  let minScore = $derived(() => {
    if (last7Days.length === 0) return null;
    return Math.min(...last7Days.map(d => d.dailyScore || 0));
  });

  // Qualitatives Label für Score
  function getLabel(score: number): string {
    if (score >= 80) return 'hochfokussiert';
    if (score >= 70) return 'sehr gut';
    if (score >= 60) return 'stabil';
    if (score >= 50) return 'okay';
    if (score >= 40) return 'etwas unruhig';
    if (score >= 30) return 'müde';
    return 'sehr unruhig';
  }

  // Format Datum
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  // Score-Color
  function getScoreColor(score: number): string {
    if (score >= 70) return 'text-brand-green';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  function handleDayClick(date: string) {
    goto(`/logbuch/${date}`);
  }
</script>

<div class="card-modern">
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Deine letzten 7 Tage</h3>

    {#if !hasData}
      <!-- Empty State -->
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-3xl text-gray-400">bar_chart</span>
        </div>
        <p class="text-gray-500 mb-2 font-medium">Noch keine Daten</p>
        <p class="text-sm text-gray-400">Mach deinen ersten Test, um deinen Verlauf zu sehen</p>
      </div>
    {:else}
      <!-- Kompakte Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="text-center bg-gray-50 rounded-xl p-4">
          <div class="font-bold text-2xl text-gray-900">{avgScore()}</div>
          <div class="text-xs text-gray-500 mt-1">Durchschnitt</div>
        </div>
        <div class="text-center bg-green-50 rounded-xl p-4">
          <div class="font-bold text-2xl text-brand-green">{maxScore()}</div>
          <div class="text-xs text-gray-500 mt-1">Bestwert</div>
        </div>
        <div class="text-center bg-red-50 rounded-xl p-4">
          <div class="font-bold text-2xl text-red-600">{minScore()}</div>
          <div class="text-xs text-gray-500 mt-1">Schwächster</div>
        </div>
      </div>

      <!-- Tages-Liste -->
      <div class="space-y-2">
        {#each last7Days as day}
          <button
            onclick={() => handleDayClick(day.date)}
            class="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <span class="text-sm font-medium text-gray-700">{formatDate(day.date)}</span>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold {getScoreColor(day.dailyScore || 0)}">
                {day.dailyScore || '—'}
              </span>
              <span class="text-sm text-gray-500 capitalize min-w-[120px] text-right">
                {day.dailyScore ? getLabel(day.dailyScore) : 'Keine Daten'}
              </span>
              <span class="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
            </div>
          </button>
        {/each}
      </div>

      <!-- Hint -->
      {#if last7Days.length < 7}
        <p class="text-xs text-gray-500 mt-4 text-center">
          Nur {last7Days.length} Tag{last7Days.length > 1 ? 'e' : ''} mit Daten – mach mehr Tests für einen vollständigen Verlauf
        </p>
      {/if}
    {/if}
  </div>
</div>
