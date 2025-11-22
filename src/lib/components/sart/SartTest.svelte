<script lang="ts">
  /**
   * SART Test - Der eigentliche Konzentrationstest
   * 
   * ARCHITEKTUR:
   * - Service-Layer macht Logik (kein Business-Code in UI)
   * - Komponente nur für Darstellung + User-Interaktion
   * - Performance.now() für präzise Zeitmessung
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { SartService } from '$lib/services/sart.service';
  import { currentUser } from '$lib/stores/auth.store';
  import type { SartTrial, SartMetrics, SartConfig } from '$lib/types/sart.types';
  
  interface Props {
    onComplete: (data: { metrics: SartMetrics; sessionId: string | null }) => void;
  }
  
  let { onComplete }: Props = $props();
  
  const CONFIG: SartConfig = {
    totalTrials: 60, // ✅ Updated to Brainrot-SART Short v1 spec (continuous sequence, 7-8 No-Go)
    trialDurationMs: 500,
    maskDurationMs: 900,
    noGoDigit: 3
  };
  
  type TestState = 'idle' | 'countdown' | 'running' | 'finished';
  
  let testState: TestState = $state('idle');
  let countdownValue = $state(3);
  let trials: SartTrial[] = $state([]);
  let currentIndex = $state(0);
  let showingMask = $state(false);
  let trialStartTime = 0;
  let timer: number | null = null;
  let countdownTimer: number | null = null;
  
  // Reactive: Aktuelles Trial
  let currentTrial = $derived(trials[currentIndex]);
  let currentDigit = $derived(currentTrial?.digit || 0);
  let progress = $derived((currentIndex / CONFIG.totalTrials) * 100);
  
  // Countdown starten beim Mount
  onMount(() => {
    testState = 'countdown';
    countdownValue = 3;
    
    countdownTimer = window.setInterval(() => {
      countdownValue -= 1;
      if (countdownValue === 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        startTest();
      }
    }, 1000);
    
    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
    };
  });
  
  function startTest() {
    // Initialisiere Test - Uses new Brainrot-SART Short v1 trial generation
    trials = SartService.generateTrials();
    currentIndex = 0;
    testState = 'running';
    nextTrial();
  }
  
  function nextTrial() {
    if (currentIndex >= trials.length) {
      finishTest();
      return;
    }
    
    // Zeige Zahl für 500ms
    showingMask = false;
    trialStartTime = performance.now();
    
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      // Nach 500ms: Zeige Maske für 900ms
      showingMask = true;
      
      timer = window.setTimeout(() => {
        currentIndex += 1;
        nextTrial();
      }, CONFIG.maskDurationMs);
    }, CONFIG.trialDurationMs);
  }
  
  function handleRespond() {
    if (testState !== 'running' || currentIndex >= trials.length || showingMask) return;
    
    const trial = trials[currentIndex];
    const reactionTime = performance.now() - trialStartTime;
    
    if (!trial.responded) {
      trial.responded = true;
      trial.reactionTimeMs = reactionTime;
    }
  }
  
  async function finishTest() {
    testState = 'finished';
    if (timer) clearTimeout(timer);
    
    const metrics = SartService.computeMetrics(trials);
    // User-ID mitgeben wenn eingeloggt
    const sessionId = await SartService.saveSartSession(metrics, $currentUser?.id);
    
    onComplete({ metrics, sessionId });
  }
  
  onDestroy(() => {
    if (timer) clearTimeout(timer);
    if (countdownTimer) clearInterval(countdownTimer);
  });
</script>

<div class="card bg-base-200 shadow-lg w-full max-w-lg border border-gray-200">
  <div class="card-body items-center text-center">
    
    <!-- Progress Header -->
    <div class="w-full flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-black">Konzentrationstest</h2>
      <span class="text-sm text-gray-600 font-mono">
        {currentIndex} / {CONFIG.totalTrials}
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-300 rounded-full h-2 mb-8">
      <div 
        class="bg-black h-2 rounded-full transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>

    <!-- Digit Display -->
    <div class="min-h-[300px] flex items-center justify-center my-8 p-8 bg-white rounded-lg border-2 border-gray-300 w-full">
      {#if testState === 'countdown'}
        <div class="text-center">
          <div class="text-9xl font-bold text-black mb-4">
            {countdownValue}
          </div>
          <p class="text-gray-600 text-lg">Test startet gleich...</p>
        </div>
      {:else if testState === 'running'}
        {#if showingMask}
          <div class="text-8xl font-bold text-gray-300">
            ✱
          </div>
        {:else}
          <div class="font-mono text-8xl font-bold text-black tracking-tighter">
            {currentDigit}
          </div>
        {/if}
      {:else if testState === 'finished'}
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-gray-600">Test wird ausgewertet...</p>
        </div>
      {/if}
    </div>

    <!-- Response Button -->
    <div class="w-full mt-4">
      <button 
        class="btn btn-lg w-full h-20 text-xl transition-opacity"
        class:btn-primary={testState === 'running'}
        class:btn-disabled={testState !== 'running'}
        class:text-white={testState === 'running'}
        onclick={handleRespond}
        disabled={testState !== 'running'}
      >
        {#if testState === 'countdown'}
          Gleich geht's los...
        {:else}
          Reagieren
        {/if}
      </button>
    </div>

    <p class="text-xs text-gray-500 mt-4">
      ⚠️ Nicht bei der <strong>3</strong> klicken!
    </p>

  </div>
</div>
