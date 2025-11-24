<script lang="ts">
  /**
   * Logbuch Overview - Zeigt alle Tage mit Tests
   */
  
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.store';
  import { getScoreBand } from '$lib/config/scoring';
  import { fetchDailyScores } from '$lib/services/dailyScore.service';
  import { syncDailyScoresFromSessions } from '$lib/services/dailyScore.service';
  import type { DailyScore } from '$features/logbook/types';
  
  let dailyScores: DailyScore[] = $state([]);
  let loading = $state(true);
  let errorMessage = $state<string | null>(null);
  
  onMount(async () => {
    if (!$auth.user) {
      goto('/login');
      return;
    }
    
    await loadDailyScores();
  });
  
  async function loadDailyScores() {
    loading = true;
    errorMessage = null;
    
    try {
      // Sync first to ensure latest data
      await syncDailyScoresFromSessions($auth.user!.id);
      
      // Fetch all daily scores
      const { data, error: fetchError } = await fetchDailyScores($auth.user!.id, 90); // Last 90 days
      
      if (fetchError) throw fetchError;
      
      dailyScores = data || [];
      
      if (dailyScores.length === 0) {
        errorMessage = 'Noch keine Tests vorhanden';
      }
    } catch (err) {
      console.error('Error loading daily scores:', err);
      errorMessage = 'Fehler beim Laden der Daten';
    } finally {
      loading = false;
    }
  }
  
  function goToDay(date: string) {
    goto(`/logbuch/${date}`);
  }
  
  function goToDashboard() {
    goto('/dashboard');
  }
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  function isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }
  
  function isYesterday(dateString: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === yesterday.toISOString().split('T')[0];
  }
  
  function getDateLabel(dateString: string): string {
    if (isToday(dateString)) return 'Heute';
    if (isYesterday(dateString)) return 'Gestern';
    return formatDate(dateString);
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-black">Logbuch</h1>
    <button 
      class="btn btn-ghost touch-target hover:text-brand-purple transition-colors"
      onclick={goToDashboard}
    >
      ← Dashboard
    </button>
  </div>
  
  {#if loading}
    <div class="flex justify-center items-center min-h-[400px]">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {:else if errorMessage}
    <div class="alert alert-warning">
      <span>{errorMessage}</span>
      <button class="btn btn-sm" onclick={goToDashboard}>Zum Dashboard</button>
    </div>
  {:else if dailyScores.length > 0}
    
    <!-- Days List -->
    <div class="space-y-3">
      {#each dailyScores as day (day.date)}
        {@const scoreBand = getScoreBand(day.dailyScore)}
        <button
          class="card-modern w-full cursor-pointer text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          onclick={() => goToDay(day.date)}
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              
              <!-- Date and Label -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-black">{getDateLabel(day.date)}</h3>
                  {#if isToday(day.date)}
                    <span class="badge badge-sm badge-primary text-white">Heute</span>
                  {/if}
                </div>
                <p class="text-xs text-gray-600">
                  {day.testCount} {day.testCount === 1 ? 'Test' : 'Tests'}
                </p>
              </div>
              
              <!-- Score -->
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-3xl font-bold text-black">{day.dailyScore}</div>
                  <div class="badge badge-sm text-white font-semibold"
                       class:badge-error={scoreBand.color === 'error'}
                       class:badge-warning={scoreBand.color === 'warning'}
                       class:badge-success={scoreBand.color === 'success'}>
                    {scoreBand.label}
                  </div>
                </div>
                <div class="text-gray-400">›</div>
              </div>
              
            </div>
          </div>
        </button>
      {/each}
    </div>
    
    <!-- Summary Card -->
    <div class="card-modern mt-8">
      <div class="card-body">
        <h2 class="text-lg font-semibold text-black mb-4">Gesamt-Übersicht</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-black">{dailyScores.length}</div>
            <p class="text-xs text-gray-600">Tage mit Tests</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-black">
              {Math.round(dailyScores.reduce((sum, d) => sum + d.dailyScore, 0) / dailyScores.length)}
            </div>
            <p class="text-xs text-gray-600">Ø BrainScore</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-black">
              {dailyScores.reduce((sum, d) => sum + d.testCount, 0)}
            </div>
            <p class="text-xs text-gray-600">Tests gesamt</p>
          </div>
        </div>
      </div>
    </div>
    
  {/if}
  
</div>
