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

<div class="card-modern w-full max-w-lg animate-fadeIn">
  <div class="p-8 items-center text-center">
    
    <!-- Progress Header -->
    <div class="w-full flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Konzentrationstest</h2>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
      <div 
        class="bg-gradient-purple h-3 rounded-full transition-all duration-500 ease-out"
        style="width: {progress}%"
      ></div>
    </div>

    <!-- Digit Display -->
    <div class="min-h-[320px] flex items-center justify-center my-8 p-12 bg-gray-50 rounded-2xl border border-gray-200 w-full shadow-inner">
      {#if testState === 'countdown'}
        <div class="text-center">
          <div class="text-9xl font-black text-gray-900 mb-6 animate-pulse">
            {countdownValue}
          </div>
          <p class="text-gray-600 text-lg font-medium">Test startet gleich...</p>
        </div>
      {:else if testState === 'running'}
        {#if showingMask}
          <div class="text-9xl font-black text-gray-300">
            ✱
          </div>
        {:else}
          <div class="font-mono text-9xl font-black text-gray-900 tracking-tighter">
            {currentDigit}
          </div>
        {/if}
      {:else if testState === 'finished'}
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4 text-brand-purple"></div>
          <p class="text-gray-600 font-medium">Test wird ausgewertet...</p>
        </div>
      {/if}
    </div>

    <!-- Response Button -->
    <div class="w-full mt-6">
      <button 
        class="btn-gradient-primary w-full h-24 text-2xl font-black transition-all duration-150 active:scale-95 active:shadow-lg"
        class:opacity-50={testState !== 'running'}
        class:cursor-not-allowed={testState !== 'running'}
        class:hover:scale-105={testState === 'running'}
        class:hover:shadow-purple-button-hover={testState === 'running'}
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

  </div>
</div>
