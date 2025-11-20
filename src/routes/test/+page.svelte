<script lang="ts">
  /**
   * Test Flow - State Machine
   * Orchestriert den gesamten SART-Test-Ablauf
   */
  
  import type { TestStep } from '$lib/types/sart.types';
  import type { SartMetrics } from '$lib/types/sart.types';
  
  import SartInstructions from '$lib/components/sart/SartInstructions.svelte';
  import SartTest from '$lib/components/sart/SartTest.svelte';
  import SartResult from '$lib/components/sart/SartResult.svelte';
  import ScreentimeForm from '$lib/components/sart/ScreentimeForm.svelte';
  import SuccessScreen from '$lib/components/sart/SuccessScreen.svelte';

  let step: TestStep = $state('instructions');
  let metrics: SartMetrics | null = $state(null);
  let sessionId: string | null = $state(null);

  function handleTestComplete(data: { metrics: SartMetrics; sessionId: string | null }) {
    metrics = data.metrics;
    sessionId = data.sessionId;
    step = 'result';
  }
</script>

<div class="min-h-screen bg-white flex items-center justify-center px-4 py-12">
  
  {#if step === 'instructions'}
    <SartInstructions onStart={() => (step = 'test')} />
    
  {:else if step === 'test'}
    <SartTest onComplete={handleTestComplete} />
    
  {:else if step === 'result'}
    <SartResult {metrics} onNext={() => (step = 'screentime')} />
    
  {:else if step === 'screentime'}
    <ScreentimeForm {sessionId} onComplete={() => (step = 'done')} />
    
  {:else if step === 'done'}
    <SuccessScreen />
  {/if}

</div>
