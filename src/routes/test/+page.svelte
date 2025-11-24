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
  import DigitalCheckIn from '$features/digitalLog/DigitalCheckIn.svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth.store';

  type ExtendedTestStep = TestStep | 'digital-checkin';
  
  let step = $state<ExtendedTestStep>('instructions');
  let metrics: SartMetrics | null = $state(null);
  let sessionId: string | null = $state(null);
  let showDigitalCheckIn = $state(false);
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
  
  function handleResultNext() {
    // Show digital check-in prompt
    showDigitalCheckIn = true;
  }
  
  function handleDigitalCheckInComplete() {
    console.log('✅ Digital Check-in completed');
    goto('/dashboard');
  }
  
  function handleDigitalCheckInSkip() {
    console.log('⏭️ Digital Check-in skipped');
    goto('/dashboard');
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
    {#if showDigitalCheckIn && sessionId}
      <!-- Digital Check-in View -->
      <div class="w-full max-w-lg space-y-8">
        <!-- Result Card (compact) -->
        <div class="flex justify-center">
          <SartResult {metrics} onNext={handleResultNext} />
        </div>
        
        <!-- Digital Check-in Card -->
        <div class="flex justify-center">
          <DigitalCheckIn 
            testId={sessionId} 
            onComplete={handleDigitalCheckInComplete}
            onSkip={handleDigitalCheckInSkip}
          />
        </div>
      </div>
    {:else}
      <!-- Result Only (with CTA to show check-in) -->
      <div class="w-full max-w-lg space-y-6">
        <SartResult {metrics} onNext={handleResultNext} />
        
        {#if !showDigitalCheckIn && sessionId}
          <div class="text-center">
            <button
              onclick={() => showDigitalCheckIn = true}
              class="btn-secondary w-full max-w-md"
            >
              <span class="material-symbols-outlined">smartphone</span>
              Digitalen Check-in ausfüllen (optional)
            </button>
          </div>
        {/if}
      </div>
    {/if}
  {/if}

</div>
