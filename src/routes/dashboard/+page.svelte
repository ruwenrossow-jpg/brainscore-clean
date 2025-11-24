<script lang="ts">
  /**
   * Minimalistisches Dashboard
   * 
   * Skimming-optimiert: Nur das Wichtigste auf einen Blick
   * - Heute: Tages-Score + Test-Count
   * - Woche: 7-Tage-Durchschnitt + Stats
   * - Verlauf: 14-Tage-Chart
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated, currentProfile } from '$lib/stores/auth.store';
  import { getDashboardData } from '$lib/services/dashboard.service';
  import { syncDailyScoresFromSessions } from '$lib/services/dailyScore.service';
  import { getScoreBand, getRelativeTimeString } from '$lib/config/scoring';
  import DailyTrendChart from '$lib/components/dashboard/DailyTrendChart.svelte';
  import type { DashboardData } from '$lib/services/dashboard.service';
  
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
          
          <!-- Card: Heute -->
          <div class="card-modern animate-fadeIn">
            <div class="p-8">
              <h2 class="text-3xl font-black text-gray-900 mb-6">Dein heutiger <span class="text-gradient-purple">BrainScore</span></h2>
              
              {#if dashboardData.today.score !== null}
                <!-- Score Display -->
                <div class="flex items-baseline gap-4 mb-6">
                  <div class="score-display">
                    {dashboardData.today.score}
                  </div>
                  <div class="text-3xl text-gray-400 font-bold">/100</div>
                </div>
                
                <!-- Score Band -->
                <div class="mb-6">
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
              {:else}
                <!-- No tests today -->
                <div class="text-center py-8">
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
              
              <DailyTrendChart 
                dailyScores={dashboardData.twoWeekTrend}
                onSelectDay={handleDayClick}
              />
              
              {#if dashboardData.twoWeekTrend.length > 0}
                <div class="mt-4 text-center">
                  <button 
                    class="btn-secondary w-full"
                    onclick={() => goto('/logbuch')}
                  >
                    Alle Tage anzeigen
                  </button>
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
