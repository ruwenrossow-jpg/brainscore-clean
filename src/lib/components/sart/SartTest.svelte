<script lang="ts">
  /**
   * SART Test - Der eigentliche Konzentrationstest
   * 
   * ARCHITEKTUR:
   * - Service-Layer macht Logik (kein Business-Code in UI)
   * - Komponente nur für Darstellung + User-Interaktion
   * - Performance.now() für präzise Zeitmessung
   */
  
  import { onDestroy } from 'svelte';
  import { SartService } from '$lib/services/sart.service';
  import { currentUser } from '$lib/stores/auth.store';
  import type { SartTrial, SartMetrics, SartConfig } from '$lib/types/sart.types';
  
  interface Props {
    onComplete: (data: { metrics: SartMetrics; sessionId: string | null }) => void;
  }
  
  let { onComplete }: Props = $props();
  
  const CONFIG: SartConfig = {
    totalTrials: 45,
    trialDurationMs: 500,
    maskDurationMs: 900,
    noGoDigit: 3
  };
  
  let trials: SartTrial[] = $state([]);
  let currentIndex = $state(0);
  let testRunning = $state(false);
  let showingMask = $state(false);
  let trialStartTime = 0;
  let timer: number | null = null;
  
  // Reactive: Aktuelles Trial
  let currentTrial = $derived(trials[currentIndex]);
  let currentDigit = $derived(currentTrial?.digit || 0);
  let progress = $derived((currentIndex / CONFIG.totalTrials) * 100);
  
  // Start Test
  trials = SartService.generateTrials(CONFIG);
  currentIndex = 0;
  testRunning = true;
  nextTrial();
  
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
    if (!testRunning || currentIndex >= trials.length || showingMask) return;
    
    const trial = trials[currentIndex];
    const reactionTime = performance.now() - trialStartTime;
    
    if (!trial.responded) {
      trial.responded = true;
      trial.reactionTimeMs = reactionTime;
    }
  }
  
  async function finishTest() {
    testRunning = false;
    if (timer) clearTimeout(timer);
    
    const metrics = SartService.computeMetrics(trials);
    // User-ID mitgeben wenn eingeloggt
    const sessionId = await SartService.saveSartSession(metrics, $currentUser?.id);
    
    onComplete({ metrics, sessionId });
  }
  
  onDestroy(() => {
    if (timer) clearTimeout(timer);
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
      {#if testRunning}
        {#if showingMask}
          <div class="text-8xl font-bold text-gray-300">
            ✱
          </div>
        {:else}
          <div class="font-mono text-8xl font-bold text-black tracking-tighter">
            {currentDigit}
          </div>
        {/if}
      {:else}
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-gray-600">Test wird ausgewertet...</p>
        </div>
      {/if}
    </div>

    <!-- Response Button -->
    <div class="w-full mt-4">
      <button 
        class="btn btn-primary btn-lg w-full h-20 text-white text-xl hover:opacity-90 transition-opacity"
        onclick={handleRespond}
        disabled={!testRunning}
      >
        Reagieren
      </button>
    </div>

    <p class="text-xs text-gray-500 mt-4">
      ⚠️ Nicht bei der <strong>3</strong> klicken!
    </p>

  </div>
</div>
