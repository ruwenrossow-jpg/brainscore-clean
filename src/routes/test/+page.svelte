<script lang="ts">
  /**
   * Test Flow - State Machine (Extended v2.0)
   * 
   * NEUER FLOW:
   * 1. Instructions (Instruktionen mit "Wichtig zu wissen"-Box)
   * 2. Test (Ampel-Countdown → SART)
   * 3. Result (Score anzeigen)
   * 4. Test Context Form (NEU: "Unter welchen Umständen?")
   * 5. Digital Check-in (Screentime + Kategorien - prominenter)
   * 6. Dashboard-Redirect
   * 
   * ⚠️ Auth-Guard: Nur für eingeloggte User zugänglich
   */
  
  import { onMount } from 'svelte';
  import type { TestStep } from '$lib/types/sart.types';
  import type { SartMetrics } from '$lib/types/sart.types';
  
  import SartInstructions from '$lib/components/sart/SartInstructions.svelte';
  import SartTest from '$lib/components/sart/SartTest.svelte';
  import SartResult from '$lib/components/sart/SartResult.svelte';
  import TestContextForm from '$lib/components/sart/TestContextForm.svelte';
  import DigitalCheckIn from '$features/digitalLog/DigitalCheckIn.svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth.store';

  type ExtendedTestStep = TestStep | 'test-context' | 'digital-checkin';
  
  let step = $state<ExtendedTestStep>('instructions');
  let metrics: SartMetrics | null = $state(null);
  let sessionId: string | null = $state(null);
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
    // Proceed to Test Context Form (NEW)
    step = 'test-context';
  }
  
  function handleTestContextComplete() {
    // Proceed to Digital Check-in
    step = 'digital-checkin';
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
    <!-- Back-Button wird in SartInstructions selbst gerendert -->
    <SartInstructions onStart={() => (step = 'test')} />
    
  {:else if step === 'test'}
    <!-- Kein Back während des Tests (würde Test abbrechen) -->
    <SartTest onComplete={handleTestComplete} />
    
  {:else if step === 'result'}
    <div class="w-full max-w-lg relative">
      <!-- Back to Dashboard Button -->
      <div class="absolute top-4 left-4 z-10">
        <button
          onclick={() => goto('/dashboard')}
          class="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors touch-target"
          aria-label="Zum Dashboard"
        >
          <span class="material-symbols-outlined text-2xl">arrow_back</span>
          <span class="text-sm font-bold">Dashboard</span>
        </button>
      </div>
      <SartResult {metrics} onNext={handleResultNext} />
    </div>
    
  {:else if step === 'test-context'}
    {#if sessionId}
      <div class="w-full max-w-lg relative">
        <!-- Back to Dashboard Button -->
        <div class="mb-4">
          <button
            onclick={() => goto('/dashboard')}
            class="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors touch-target"
            aria-label="Zum Dashboard"
          >
            <span class="material-symbols-oriented text-2xl">arrow_back</span>
            <span class="text-sm font-bold">Dashboard</span>
          </button>
        </div>
        <TestContextForm 
          testId={sessionId} 
          onComplete={handleTestContextComplete}
        />
      </div>
    {/if}
    
  {:else if step === 'digital-checkin'}
    {#if sessionId}
      <div class="w-full max-w-lg relative">
        <!-- Back to Dashboard Button -->
        <div class="mb-4">
          <button
            onclick={() => goto('/dashboard')}
            class="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors touch-target"
            aria-label="Zum Dashboard"
          >
            <span class="material-symbols-outlined text-2xl">arrow_back</span>
            <span class="text-sm font-bold">Dashboard</span>
          </button>
        </div>
        <DigitalCheckIn 
          testId={sessionId} 
          onComplete={handleDigitalCheckInComplete}
          onSkip={handleDigitalCheckInSkip}
        />
      </div>
    {/if}
  {/if}

</div>
