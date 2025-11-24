<script lang="ts">
  /**
   * Logbuch Day Detail - Zeigt alle Tests eines bestimmten Tages
   */
  
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.store';
  import { getScoreBand, INSIGHTS_CONFIG } from '$lib/config/scoring';
  import { getDayDetail } from '$features/logbook/dailyScoreService';
  import { supabase } from '$lib/services/supabase.client';
  import type { DayDetail, TestSession } from '$features/logbook/types';
  import type { PageData } from './$types';
  import { calculateDayCognitiveMetrics, type SartSessionMetrics } from '$features/insights/cognitiveMetrics';
  import { interpretCognitiveDimensions, type CognitiveDimensionFeedback } from '$features/insights/cognitiveInterpretation';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let dayDetail = $state<DayDetail | null>(null);
  let loading = $state(true);
  let errorMessage = $state<string | null>(null);
  let cognitiveInsights = $state<CognitiveDimensionFeedback[] | null>(null);
  let totalUserTests = $state(0);
  let showInsights = $state(false);
  
  // Formatted date for display
  let formattedDate = $derived(
    dayDetail ? new Date(dayDetail.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : ''
  );
  
  let scoreBand = $derived(
    dayDetail ? getScoreBand(dayDetail.dailyScore) : null
  );
  
  onMount(async () => {
    if (!$auth.user) {
      goto('/login');
      return;
    }
    
    await loadDayDetail();
  });
  
  async function loadDayDetail() {
    loading = true;
    errorMessage = null;
    
    try {
      // Fetch total test count for insights visibility
      const { count: totalCount } = await supabase
        .from('sart_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', $auth.user!.id);
      
      totalUserTests = totalCount || 0;
      
      // Fetch all test sessions for this user on this date (with full metrics)
      const { data: sessions, error: fetchError } = await supabase
        .from('sart_sessions')
        .select('*')
        .eq('user_id', $auth.user!.id)
        .gte('created_at', `${data.date}T00:00:00`)
        .lt('created_at', `${data.date}T23:59:59`)
        .order('created_at', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (!sessions || sessions.length === 0) {
        errorMessage = 'Keine Tests für diesen Tag gefunden';
        loading = false;
        return;
      }
      
      // Convert to TestSession format for day detail
      const testSessions: TestSession[] = sessions.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        timestamp: s.created_at,
        brainScore: s.brain_score ?? s.score ?? 0,
        context: s.context || undefined
      }));
      
      // Use service to calculate day detail
      dayDetail = getDayDetail(data.date, testSessions);
      
      if (!dayDetail) {
        errorMessage = 'Fehler beim Laden der Tagesdaten';
      }
      
      // Calculate cognitive insights if conditions met
      if (
        totalUserTests >= INSIGHTS_CONFIG.minTestsForInsights &&
        sessions.length >= INSIGHTS_CONFIG.minTestsPerDayForInsights
      ) {
        showInsights = true;
        
        // Convert to SartSessionMetrics for cognitive analysis
        const sessionMetrics: SartSessionMetrics[] = sessions.map((s: any) => ({
          commissionErrors: s.commission_errors,
          omissionErrors: s.omission_errors,
          goCount: s.go_count,
          nogoCount: s.nogo_count,
          meanRtMs: s.mean_rt_ms,
          sdRtMs: s.sd_rt_ms,
          validTrialRatio: 1.0 // Placeholder - not yet implemented
        }));
        
        const dayMetrics = calculateDayCognitiveMetrics(sessionMetrics);
        cognitiveInsights = interpretCognitiveDimensions(dayMetrics);
      }
    } catch (err) {
      console.error('Error loading day detail:', err);
      errorMessage = 'Fehler beim Laden der Daten';
    } finally {
      loading = false;
    }
  }
  
  function goBack() {
    goto('/logbuch');
  }
  
  function formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function getTestIcon(score: number): string {
    if (score >= 70) return '🟢';
    if (score >= 40) return '🟡';
    return '🔴';
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  
  <!-- Back Button -->
  <button 
    class="btn btn-ghost mb-4 touch-target hover:text-brand-purple transition-colors"
    onclick={goBack}
  >
    ← Zurück zum Logbuch
  </button>
  
  {#if loading}
    <div class="flex justify-center items-center min-h-[400px]">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {:else if errorMessage}
    <div class="alert alert-warning">
      <span>{errorMessage}</span>
      <button class="btn btn-sm" onclick={goBack}>Zurück</button>
    </div>
  {:else if dayDetail && scoreBand}
    
    <!-- Day Header -->
    <div class="card-modern mb-6">
      <div class="card-body">
        <h1 class="text-2xl font-bold text-black mb-4">{formattedDate}</h1>
        
        <div class="flex items-center gap-4 mb-4">
          <div class="text-6xl font-bold bg-gradient-purple bg-clip-text text-transparent">{dayDetail.dailyScore}</div>
          <div>
            {#if scoreBand.color === 'success'}
              <div class="badge-status mb-2">
                <span>✓</span>
                {scoreBand.label}
              </div>
            {:else}
              <div class="badge badge-lg text-white font-semibold mb-2"
                   class:badge-error={scoreBand.color === 'error'}
                   class:badge-warning={scoreBand.color === 'warning'}>
                {scoreBand.label}
              </div>
            {/if}
            <p class="text-sm text-gray-600">
              {dayDetail.testCount} {dayDetail.testCount === 1 ? 'Test' : 'Tests'}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Timeline -->
    <div class="card-modern">
      <div class="card-body">
        <h2 class="text-xl font-bold mb-4">Tagesverlauf</h2>
        
        <div class="space-y-3">
          {#each dayDetail.tests as test, index (test.timestamp)}
            <div class="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
              
              <!-- Timeline connector -->
              <div class="flex flex-col items-center">
                <div class="text-2xl">{getTestIcon(test.brainScore)}</div>
                {#if index < dayDetail.tests.length - 1}
                  <div class="w-0.5 h-8 bg-gray-300 mt-2"></div>
                {/if}
              </div>
              
              <!-- Test details -->
              <div class="flex-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-3xl font-bold text-black">{test.brainScore}</span>
                  <span class="text-sm text-gray-500">{formatTime(test.timestamp)}</span>
                </div>
                
                {#if test.context}
                  <div class="mt-1">
                    <span class="badge badge-sm badge-outline">{test.context}</span>
                  </div>
                {/if}
              </div>
              
            </div>
          {/each}
        </div>
        
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="card-modern mt-6">
      <div class="card-body">
        <h2 class="text-xl font-bold mb-4">Statistiken</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-black">
              {Math.max(...dayDetail.tests.map(t => t.brainScore))}
            </div>
            <p class="text-xs text-gray-600">Bester Test</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-black">
              {Math.min(...dayDetail.tests.map(t => t.brainScore))}
            </div>
            <p class="text-xs text-gray-600">Schlechtester Test</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-black">
              {Math.round(dayDetail.tests.reduce((sum, t) => sum + (t.brainScore - dayDetail!.dailyScore) ** 2, 0) / dayDetail.tests.length)}
            </div>
            <p class="text-xs text-gray-600">Varianz</p>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- Cognitive Insights (optional deep-dive) -->
    {#if showInsights && cognitiveInsights}
      <div class="card-modern mt-6">
        <div class="card-body">
          <h2 class="text-xl font-bold mb-2">Kognitive Bausteine dieses Tages</h2>
          <p class="text-xs text-gray-500 mb-6 italic">
            Diese Einschätzungen sind orientierende Hinweise und ersetzen keine Diagnostik.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each cognitiveInsights as insight (insight.id)}
              <div class="bg-white rounded-lg border border-gray-300 p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-sm text-black">{insight.label}</h3>
                  <span class="badge badge-sm text-white"
                        class:badge-success={insight.level === 'low'}
                        class:badge-warning={insight.level === 'medium'}
                        class:badge-error={insight.level === 'high'}>
                    {#if insight.level === 'low'}
                      Gut
                    {:else if insight.level === 'medium'}
                      Mittel
                    {:else}
                      Auffällig
                    {/if}
                  </span>
                </div>
                <p class="text-xs text-gray-700 leading-relaxed">
                  {insight.shortText}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if !showInsights && totalUserTests < INSIGHTS_CONFIG.minTestsForInsights}
      <div class="card-modern mt-6">
        <div class="card-body">
          <h2 class="text-xl font-bold mb-2">Kognitive Bausteine</h2>
          <p class="text-sm text-gray-600">
            Sobald du ein paar mehr Tests gemacht hast ({totalUserTests}/{INSIGHTS_CONFIG.minTestsForInsights}), 
            können wir dir detailliertere Einblicke in deine Aufmerksamkeit und Impulsivität geben.
          </p>
        </div>
      </div>
    {/if}
    
  {/if}
  
</div>
