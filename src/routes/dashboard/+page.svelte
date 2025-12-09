<script lang="ts">
  /**
   * Minimalistisches Dashboard
   * 
   * DASHBOARD FORECAST TIMELINE (NEU):
   * - ForecastHeroCard: Prognose für JETZT
   * - DayTimeline: 5 Tages-Segmente mit Status
   * - MiniBaselineChart: User-Baseline-Kurve (24h)
   * 
   * BESTEHEND:
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
  import type { DashboardData } from '$lib/services/dashboard.service';
  
  // NEU: Forecast Timeline Components
  import ForecastHeroCard from '$lib/components/dashboard/ForecastHeroCard.svelte';
  import DayTimeline from '$lib/components/dashboard/DayTimeline.svelte';
  import MiniBaselineChart from '$lib/components/dashboard/MiniBaselineChart.svelte';
  
  // NEU: Server-Load Props (aus +page.server.ts)
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // NEU: Forecast + Baseline (aus Server-Load)
  const { forecast, userBaseline } = data;
  
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
      // GEÄNDERT: Kein Sync mehr bei jedem Load (passiert automatisch nach Test)
      // Nur Dashboard-Daten laden (client-side)
      const { data: dashData, error: err } = await getDashboardData($auth.user.id);
      
      if (err || !dashData) {
        error = err || 'Failed to load dashboard data';
        loading = false;
        return;
      }
      
      dashboardData = dashData;
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
        
        <div class="space-y-8">
          
          <!-- NEU: Forecast Timeline Section (Mobile-optimiertes Spacing) -->
          <section class="space-y-6 mb-12">
            <!-- Forecast Hero -->
            <ForecastHeroCard 
              {forecast} 
              typicalForSegment={data.typicalForSegment}
              delta={data.delta}
              todayTestCount={data.todayTestCount}
              segmentReliability={data.segmentReliability}
              segmentTestCount={data.segmentTestCount}
            />
            
            <!-- Baseline Chart (VERSCHOBEN: vor Timeline für Hook-Reward) -->
            <MiniBaselineChart 
              {userBaseline}
              currentHour={new Date().getHours()}
              todayTests={data.todayDeviations?.tests ?? []}
            />
            
            <!-- Day Timeline mit integrierter Story -->
            <DayTimeline 
              currentSegment={forecast.currentSegment}
              {userBaseline}
              segmentSummaries={data.segmentSummaries}
            />
          </section>
          
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
