<script lang="ts">
  /**
   * Test Flow - State Machine
   * Orchestriert den gesamten SART-Test-Ablauf + Digital Check-in
   * 
   * ⚠️ Auth-Guard: Nur für eingeloggte User zugänglich
   */
  
  import { onMount } from 'svelte';
  import type { TestStep } from '$lib/types/sart.types';
  import type { SartMetrics } from '$lib/types/sart.types';
  
  import SartInstructions from '$lib/components/sart/SartInstructions.svelte';
  import SartTest from '$lib/components/sart/SartTest.svelte';
  import SartResult from '$lib/components/sart/SartResult.svelte';
  import PostTestInvestment from '$lib/components/posttest/PostTestInvestment.svelte';
  import PostTestInsightScreen from '$lib/components/posttest/PostTestInsightScreen.svelte';
  import { getPostTestInsight, type PostTestInsight } from '$lib/services/insight.service';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth.store';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  type ExtendedTestStep = TestStep | 'investment-input' | 'insight-reward';
  
  let step = $state<ExtendedTestStep>('instructions');
  let metrics: SartMetrics | null = $state(null);
  let sessionId: string | null = $state(null);
  let insight: PostTestInsight | null = $state(null);
  let authCheckComplete = $state(false);
  
  // Auth-Guard: Redirect wenn nicht eingeloggt
  onMount(async () => {
    // Wait for auth state to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!$isAuthenticated) {
      console.log('⚠️ Test requires authentication, redirecting to /auth');
      goto('/auth');
      return;
    }
    
    authCheckComplete = true;
  });

  function handleTestComplete(data: { metrics: SartMetrics; sessionId: string | null }) {
    metrics = data.metrics;
    sessionId = data.sessionId;
    step = 'result';
  }
  
  function handleShowInvestment() {
    step = 'investment-input';
  }
  
  async function handleInvestmentComplete() {
    console.log('✅ Investment completed, fetching insight...');
    
    try {
      insight = await getPostTestInsight(data.userId);
      step = 'insight-reward';
    } catch (error) {
      console.error('❌ Failed to fetch insight:', error);
      // Fallback: Go to dashboard on error
      goto('/dashboard');
    }
  }
  
  function handleInsightComplete() {
    console.log('✅ Flow complete, navigating to dashboard');
    goto('/dashboard');
  }
  
  function handleTestAgain() {
    step = 'instructions';
    metrics = null;
    sessionId = null;
    insight = null;
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 pwa-safe-screen">
  
  {#if !authCheckComplete}
    <div class="flex flex-col items-center gap-4">
      <div class="loading loading-spinner loading-lg text-brand-purple"></div>
      <p class="text-gray-600">Prüfe Authentifizierung...</p>
    </div>
  {:else if step === 'instructions'}
    <SartInstructions onStart={() => (step = 'test')} />
    
  {:else if step === 'test'}
    <SartTest onComplete={handleTestComplete} />
    
  {:else if step === 'result'}
    <SartResult 
      {metrics} 
      onNext={handleTestAgain} 
      onShowInvestment={sessionId ? handleShowInvestment : undefined}
    />
    
  {:else if step === 'investment-input' && sessionId && metrics}
    <PostTestInvestment 
      testId={sessionId}
      score={metrics.score}
      onComplete={handleInvestmentComplete}
    />
    
  {:else if step === 'insight-reward' && insight}
    <PostTestInsightScreen 
      {insight}
      onContinueToDashboard={handleInsightComplete}
      onTestAgain={handleTestAgain}
    />
  {/if}

</div>
