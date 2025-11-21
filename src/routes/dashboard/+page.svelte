<script lang="ts">
  /**
   * Dashboard Page
   * Main dashboard for logged-in users showing BrainScore and test history
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated, currentProfile, needsOnboarding } from '$lib/stores/auth.store';
  import { getDashboardStats, getSessionHistory } from '$lib/services/dashboard.service';
  import type { DashboardStats, SessionHistoryItem } from '$lib/services/dashboard.service';
  import CurrentScoreCard from '$lib/components/dashboard/CurrentScoreCard.svelte';
  import StatsCard from '$lib/components/dashboard/StatsCard.svelte';
  import SessionHistory from '$lib/components/dashboard/SessionHistory.svelte';
  
  let loading = $state(true);
  let stats = $state<DashboardStats | null>(null);
  let sessions = $state<SessionHistoryItem[]>([]);
  
  // KEINE CLIENT-SIDE GUARDS MEHR!
  // Server-Guard (+page.server.ts) prüft Auth BEVOR die Seite rendert
  
  onMount(async () => {
    // Load dashboard data
    if ($auth.user) {
      try {
        const userId = $auth.user.id;
        
        const [dashboardStats, sessionHistory] = await Promise.all([
          getDashboardStats(userId),
          getSessionHistory(userId, 10)
        ]);
        
        stats = dashboardStats;
        sessions = sessionHistory;
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        loading = false;
      }
    }
  });
  
  async function logout() {
    await auth.signOut();
    goto('/');
  }
</script>

<svelte:head>
  <title>Dashboard | BrainrotAI</title>
</svelte:head>

<div class="min-h-screen bg-white">
  
  {#if $auth.loading || loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {:else if $isAuthenticated}
    
    <!-- Header -->
    <header class="border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">BrainrotAI Dashboard</h1>
            <p class="text-gray-600 mt-1">Willkommen zurück, {$currentProfile?.name || 'dort'}!</p>
          </div>
          <button class="btn btn-ghost" onclick={logout}>
            Abmelden
          </button>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Current Score (Hero Section) -->
        <CurrentScoreCard score={stats?.currentScore ?? null} loading={loading} />
        
        <!-- CTA Button -->
        <div class="text-center">
          <a 
            href="/test" 
            class="btn btn-primary btn-lg text-white"
            data-sveltekit-preload-data="hover"
          >
            {#if stats && stats.totalTests === 0}
              🎯 Ersten Test starten
            {:else}
              🔄 Neuen Test starten
            {/if}
          </a>
        </div>
        
        <!-- Stats -->
        <StatsCard
          averageScore7Days={stats?.averageScore7Days ?? null}
          totalTests={stats?.totalTests ?? 0}
          lastTestDate={stats?.lastTestDate ?? null}
          loading={loading}
        />
        
        <!-- Session History -->
        <SessionHistory sessions={sessions} loading={loading} />
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg">📊 Deine Ziele</h3>
              <p class="text-sm text-gray-600">
                {#if $currentProfile?.goal}
                  {$currentProfile.goal}
                {:else}
                  Noch kein Ziel gesetzt
                {/if}
              </p>
            </div>
          </div>
          
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg">💡 Tipp des Tages</h3>
              <p class="text-sm text-gray-600">
                {#if stats && stats.totalTests === 0}
                  Starte mit deinem ersten Test, um eine Baseline zu erstellen!
                {:else if stats && stats.totalTests < 5}
                  Absolviere mindestens 5 Tests für aussagekräftige Trends.
                {:else if sessions.length > 0 && sessions[0].score < 60}
                  Versuche, dich vor dem Test 5 Minuten zu entspannen.
                {:else}
                  Konsistenz ist der Schlüssel – teste regelmäßig zur gleichen Zeit!
                {/if}
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="border-t border-gray-200 mt-16">
      <div class="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
        <p>BrainrotAI © {new Date().getFullYear()} • Deine persönliche Konzentrationsanalyse</p>
      </div>
    </footer>

  {/if}

</div>
