<script lang="ts">
  /**
   * Minimalistisches Dashboard
   * 
   * Skimming-optimiert: Nur das Wichtigste auf einen Blick
   * - Heute: Tages-Score + Test-Count
   * - Woche: 7-Tage-Durchschnitt + Stats
   * - Verlauf: 14-Tage-Chart
   * 
   * NEU: Hook-Dashboard mit Forecast-Card (sofortiger Insight)
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated, currentProfile } from '$lib/stores/auth.store';
  import { getDashboardData } from '$lib/services/dashboard.service';
  import { syncDailyScoresFromSessions } from '$lib/services/dailyScore.service';
  import { getScoreBand, getRelativeTimeString } from '$lib/config/scoring';
  import type { DashboardData } from '$lib/services/dashboard.service';
  import ForecastCard from '$lib/components/dashboard/ForecastCard.svelte';
  import type { PageData } from './$types';
  
  // NEU: Forecast aus Server Load (Hook-Dashboard)
  let { data }: { data: PageData } = $props();
  
  let dashboardData = $state<DashboardData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  onMount(async () => {
    // Wait for auth state to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!$isAuthenticated || !$auth.user) {
      console.log('⚠️ Dashboard requires authentication, redirecting to /auth');
      goto('/auth');
      return;
    }
    
    try {
      // 1. Sync DailyScores aus Sessions (einmalig beim Laden)
      console.log('🔄 Syncing daily scores...');
      const { success, synced } = await syncDailyScoresFromSessions($auth.user.id);
      
      if (success) {
        console.log(`✅ Synced ${synced} daily scores`);
      }
      
      // 2. Lade Dashboard-Daten
      const { data, error: err } = await getDashboardData($auth.user.id);
      
      if (err || !data) {
        error = err || 'Failed to load dashboard data';
        loading = false;
        return;
      }
      
      dashboardData = data;
    } catch (err) {
      console.error('Dashboard error:', err);
      error = 'Unexpected error loading dashboard';
    } finally {
      loading = false;
    }
  });
  
  function handleDayClick(date: string) {
    goto(`/logbuch/${date}`);
  }
  
  function handleTodayClick() {
    if (dashboardData?.today.score !== null) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      goto(`/logbuch/${today}`);
    }
  }
  
  async function logout() {
    await auth.signOut();
    goto('/');
  }
</script>

<svelte:head>
  <title>Dashboard | BrainrotAI</title>
</svelte:head>

<div class="min-h-screen bg-white">
  
  {#if !$isAuthenticated}
    <div class="flex items-center justify-center min-h-screen">
      <div class="loading loading-spinner loading-lg text-brand-purple"></div>
    </div>
  {:else}
    
    <!-- Header - Glassmorphism wie Landing -->
    <header class="nav-glass">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white font-black text-xl">B</span>
            </div>
            <h1 class="text-2xl font-black text-gray-900">BrainScore</h1>
          </div>
          <button class="btn btn-ghost btn-sm touch-target hover:text-brand-purple transition-colors" onclick={logout}>
            Abmelden
          </button>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
      
      {#if loading}
        <div class="flex justify-center py-12">
          <div class="loading loading-spinner loading-lg"></div>
        </div>
      {:else if error}
        <div class="alert alert-error">
          <span>{error}</span>
        </div>
      {:else if dashboardData}
        
        <div class="space-y-6">
          
          <!-- NEU: Hero-Card mit Forecast (Hook-Dashboard) -->
          <div class="animate-fadeIn">
            <ForecastCard forecast={data.forecast} />
          </div>
          
          <!-- NEU: CTA-Buttons direkt unter Forecast -->
          <div class="flex flex-col sm:flex-row gap-3 animate-fadeIn">
            <!-- Primary: Test machen -->
            <button 
              class="btn-gradient-primary flex-1 text-base sm:text-lg"
              onclick={() => goto('/test')}
            >
              <span class="material-symbols-outlined">psychology</span>
              Jetzt aktualisieren (Test machen)
            </button>

            <!-- Secondary: Verlauf -->
            <button 
              class="btn-secondary flex-1"
              onclick={() => goto('/logbuch')}
            >
              <span class="material-symbols-outlined">history</span>
              Nur Verlauf ansehen
            </button>
          </div>
          
          <!-- Card: Heute -->
          <div class="card-modern animate-fadeIn">
            <div class="p-8">
              <h2 class="text-3xl font-black text-gray-900 mb-6">Dein heutiger <span class="text-gradient-purple">BrainScore</span></h2>
              
              {#if dashboardData.today.score !== null}
                <!-- Clickable Score Section -->
                <button
                  onclick={handleTodayClick}
                  class="w-full text-left cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-4 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] mb-6"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-baseline gap-4">
                      <div class="score-display">
                        {dashboardData.today.score}
                      </div>
                      <div class="text-3xl text-gray-400 font-bold">/100</div>
                    </div>
                    <div class="text-gray-400 text-2xl">›</div>
                  </div>
                  
                  <!-- Score Band -->
                  <div class="mb-4">
                    {#if getScoreBand(dashboardData.today.score).color === 'success'}
                      <span class="badge-status">
                        <span class="text-xl">✓</span>
                        {getScoreBand(dashboardData.today.score).label}
                      </span>
                    {:else}
                      <span class="badge badge-lg badge-{getScoreBand(dashboardData.today.score).color}">
                        {getScoreBand(dashboardData.today.score).label}
                      </span>
                    {/if}
                  </div>
                  
                  <!-- Meta Info -->
                  <div class="text-sm text-gray-600">
                    Basierend auf {dashboardData.today.testCount} {dashboardData.today.testCount === 1 ? 'Test' : 'Tests'} heute
                    {#if dashboardData.today.lastTestAt}
                      <span class="ml-1">
                        • Letzter Test: {getRelativeTimeString(new Date(dashboardData.today.lastTestAt))}
                      </span>
                    {/if}
                  </div>
                  
                  <!-- Call to Action Hint -->
                  <div class="mt-3 text-brand-purple font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Kognitive Bausteine anzeigen
                  </div>
                </button>
              {:else}
                <!-- No tests today -->
                <div class="text-center py-8 mb-6">
                  <div class="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p class="text-gray-600 mb-2">Noch kein Test heute</p>
                  <p class="text-sm text-gray-500">Starte deinen ersten Test, um deinen heutigen Score zu sehen.</p>
                </div>
              {/if}
              
              <!-- CTA Button -->
              <div class="mt-8">
                <button 
                  onclick={() => goto('/test')}
                  class="btn-gradient-primary w-full text-lg font-bold"
                >
                  {dashboardData.today.testCount === 0 ? 'Ersten Test starten' : 'Weiteren Test machen'}
                  <span class="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Card: Woche -->
          <div class="card-modern animate-fadeIn" style="animation-delay: 0.1s;">
            <div class="p-8">
              <h2 class="text-3xl font-black text-gray-900 mb-6">Deine letzte <span class="text-gradient-purple">Woche</span></h2>
              
              {#if dashboardData.weekly.sevenDayAvgDailyScore !== null}
                <!-- Weekly Average -->
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-gray-800">
                      {dashboardData.weekly.sevenDayAvgDailyScore}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Durchschnitt</div>
                  </div>
                  
                  <div class="text-center">
                    <div class="text-3xl font-bold text-success">
                      {dashboardData.weekly.bestDailyScore ?? '-'}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Bester Tag</div>
                  </div>
                  
                  <div class="text-center">
                    <div class="text-3xl font-bold text-error">
                      {dashboardData.weekly.worstDailyScore ?? '-'}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Schlechtester Tag</div>
                  </div>
                </div>
                
                <!-- Active Days -->
                <div class="text-sm text-gray-600 text-center">
                  {dashboardData.weekly.activeDays} {dashboardData.weekly.activeDays === 1 ? 'Tag' : 'Tage'} mit Tests
                </div>
              {:else}
                <div class="text-center py-4 text-gray-500">
                  <p>Noch keine Daten für diese Woche</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Card: Verlauf (14 Tage) -->
          <div class="card-modern animate-fadeIn" style="animation-delay: 0.2s;">
            <div class="p-8">
              <h2 class="text-3xl font-black text-gray-900 mb-6"><span class="text-gradient-purple">Verlauf</span> (letzte 14 Tage)</h2>
              
              {#if dashboardData.twoWeekTrend.length > 0}
                <!-- Text-based trend list -->
                <div class="space-y-2 mb-6">
                  {#each dashboardData.twoWeekTrend as day, index (day.date)}
                    {@const isToday = day.date === new Date().toISOString().split('T')[0]}
                    {@const scoreBand = getScoreBand(day.dailyScore)}
                    {@const dateObj = new Date(day.date)}
                    {@const formattedDate = dateObj.toLocaleDateString('de-DE', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                    
                    <button
                      onclick={() => handleDayClick(day.date)}
                      class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                      class:bg-purple-50={isToday}
                      class:hover:bg-purple-100={isToday}
                    >
                      <div class="flex items-center gap-3">
                        <div class="text-sm font-medium text-gray-700" class:font-bold={isToday}>
                          {formattedDate}
                          {#if isToday}
                            <span class="badge badge-sm badge-primary text-white ml-2">Heute</span>
                          {/if}
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-3">
                        <div class="text-2xl font-bold text-gray-900" class:text-brand-purple={isToday}>
                          {day.dailyScore}
                        </div>
                        <div class="badge badge-sm text-white"
                             class:badge-success={scoreBand.color === 'success'}
                             class:badge-warning={scoreBand.color === 'warning'}
                             class:badge-error={scoreBand.color === 'error'}>
                          {scoreBand.label}
                        </div>
                        <div class="text-gray-400 text-xl">›</div>
                      </div>
                    </button>
                  {/each}
                </div>
                
                <div class="text-center">
                  <button 
                    class="btn-secondary w-full"
                    onclick={() => goto('/logbuch')}
                  >
                    Alle Tage anzeigen
                  </button>
                </div>
              {:else}
                <!-- No data state -->
                <div class="text-center py-8">
                  <div class="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p class="text-gray-600 mb-2">In den letzten 14 Tagen wurden noch keine Tests gespeichert.</p>
                  <p class="text-sm text-gray-500">Starte deinen ersten Test, um deinen Verlauf zu sehen.</p>
                </div>
              {/if}
            </div>
          </div>
          
        </div>
        
      {/if}
      
    </main>
    
    <!-- Footer - Dark Section -->
    <footer class="bg-brand-dark text-white mt-16 py-12">
      <div class="container mx-auto px-4 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center shadow-purple-glow mx-auto mb-4">
            <span class="text-white font-black text-2xl">B</span>
          </div>
          <h3 class="text-2xl font-black mb-2 text-white">BrainrotAI</h3>
          <p class="text-gray-400 text-sm">Verstehe deine <span class="text-brand-accent">Aufmerksamkeit</span></p>
        </div>
        <div class="text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} BrainrotAI. Cognitive Performance Testing.</p>
        </div>
      </div>
    </footer>
    
  {/if}
  
</div>
