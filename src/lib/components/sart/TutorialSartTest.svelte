<script lang="ts">
  /**
   * Tutorial SART Test - Geführte Demo für Onboarding
   * 
   * UNTERSCHIEDE ZUM PRODUCTION MODE:
   * - 10 Trials statt 60 (kurz & überschaubar)
   * - 800ms Stimulus + 1200ms Mask (langsamer für Learning)
   * - Step-by-Step Overlays mit Anweisungen
   * - Feste Trial-Sequenz für konsistente UX
   * - KEINE DB-Persistierung (Demo-Modus)
   * 
   * TUTORIAL-PHASEN:
   * Phase 1 (Trial 0-1): "Hier klicken wenn KEINE 3" + Pfeil
   * Phase 2 (Trial 2): Erste 3 → "Gleich kommt eine 3 - NICHT klicken"
   * Phase 3 (Trial 3-9): "So läuft der echte Test - nur etwas schneller"
   */
  
  import { onMount, onDestroy } from 'svelte';
  import TrafficLightCountdown from './TrafficLightCountdown.svelte';
  import { TUTORIAL_SART_CONFIG } from '$features/brainrotTest/brainrotSartConfig';
  import type { SartTrial } from '$lib/types/sart.types';
  
  interface Props {
    onComplete: (demoScore: number) => void;
  }
  
  let { onComplete }: Props = $props();
  
  type TestState = 'countdown' | 'running' | 'finished';
  type TutorialPhase = 'intro' | 'first-nogo' | 'remaining';
  
  let testState: TestState = $state('countdown');
  let tutorialPhase: TutorialPhase = $state('intro');
  let trials: SartTrial[] = $state([]);
  let currentIndex = $state(0);
  let showingMask = $state(false);
  let trialStartTime = 0;
  let timer: number | null = null;
  let showNoGoWarning = $state(false);
  let noGoFeedback = $state<'correct' | 'incorrect' | null>(null);
  
  // Reactive: Aktuelles Trial
  let currentTrial = $derived(trials[currentIndex]);
  let currentDigit = $derived(currentTrial?.digit || 0);
  let progress = $derived((currentIndex / TUTORIAL_SART_CONFIG.TOTAL_TRIALS) * 100);
  
  // Tutorial Overlay Text
  let overlayText = $derived.by(() => {
    if (testState !== 'running') return '';
    
    if (tutorialPhase === 'intro' && !showingMask) {
      return 'Klicke auf "Reagieren" wenn du eine Zahl siehst - außer bei der 3!';
    }
    
    if (tutorialPhase === 'first-nogo' && showNoGoWarning && !showingMask) {
      return 'Gleich kommt eine 3 – bei ihr klickst du NICHT!';
    }
    
    if (tutorialPhase === 'remaining' && currentIndex === 3 && !showingMask) {
      return 'Super! So läuft auch der echte Test – nur etwas schneller.';
    }
    
    return '';
  });
  
  function handleCountdownComplete() {
    startTest();
  }
  
  function startTest() {
    // Generiere feste Tutorial-Sequenz
    trials = TUTORIAL_SART_CONFIG.FIXED_SEQUENCE.map((digit, index) => ({
      index,
      digit,
      isNoGo: digit === TUTORIAL_SART_CONFIG.NO_GO_DIGIT,
      responded: false,
      reactionTimeMs: null,
    }));
    
    currentIndex = 0;
    testState = 'running';
    tutorialPhase = 'intro';
    nextTrial();
  }
  
  function nextTrial() {
    if (currentIndex >= trials.length) {
      finishTest();
      return;
    }
    
    // Update tutorial phase
    if (currentIndex === 2) {
      tutorialPhase = 'first-nogo';
      // Zeige Warning VOR dem No-Go Trial
      showNoGoWarning = true;
      noGoFeedback = null;
    } else if (currentIndex === 3) {
      tutorialPhase = 'remaining';
      showNoGoWarning = false;
    }
    
    // Zeige Zahl für 800ms (Tutorial-Timing)
    showingMask = false;
    trialStartTime = performance.now();
    
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      // Nach 800ms: Zeige Maske für 1200ms
      showingMask = true;
      
      // Check No-Go feedback after stimulus disappears
      if (tutorialPhase === 'first-nogo' && currentIndex === 2) {
        const trial = trials[currentIndex];
        if (!trial.responded) {
          noGoFeedback = 'correct';
        } else {
          noGoFeedback = 'incorrect';
        }
      }
      
      timer = window.setTimeout(() => {
        currentIndex += 1;
        nextTrial();
      }, TUTORIAL_SART_CONFIG.MASK_DURATION_MS);
    }, TUTORIAL_SART_CONFIG.STIMULUS_DURATION_MS);
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
  
  function finishTest() {
    testState = 'finished';
    if (timer) clearTimeout(timer);
    
    // Berechne Demo-Score (vereinfacht, nicht persisted)
    const correctResponses = trials.filter(t => 
      t.isNoGo ? !t.responded : t.responded
    ).length;
    const demoScore = Math.round((correctResponses / trials.length) * 100);
    
    // Kurze Pause für "Test wird ausgewertet" Effekt
    setTimeout(() => {
      onComplete(demoScore);
    }, 1500);
  }
  
  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<!-- Tutorial SART Test Card (immer sichtbar, Inhalt wechselt je nach State) -->
<div class="card-modern w-full max-w-lg animate-fadeIn relative">
  <div class="p-8 items-center text-center">
    
    <!-- Progress Header (nur während Test - IDENTISCH zu Production Test) -->
    {#if testState !== 'countdown'}
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

      <!-- Tutorial Overlay (klein, unauffällig über Stimulus) -->
      {#if overlayText && testState === 'running'}
        <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs md:text-sm font-semibold text-blue-800 leading-snug">
            {overlayText}
          </p>
        </div>
      {/if}

      <!-- No-Go Feedback (dezent, nach erster 3) -->
      {#if noGoFeedback && tutorialPhase === 'first-nogo' && showingMask}
        <div class="mb-3 p-3 rounded-lg {noGoFeedback === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}">
          {#if noGoFeedback === 'correct'}
            <p class="text-xs md:text-sm font-semibold text-green-800">
              Genau so – bei der 3 nicht klicken!
            </p>
          {:else}
            <p class="text-xs md:text-sm font-semibold text-yellow-800">
              Im echten Test wäre das ein Fehler – hier zum Lernen.
            </p>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- Stimulus Area (Zahlen / Maske / Ampel) -->
    <div class="min-h-[320px] flex items-center justify-center my-8 p-12 bg-gray-50 rounded-2xl border border-gray-200 w-full shadow-inner relative">
      {#if testState === 'countdown'}
        <!-- COUNTDOWN-PHASE: Ampel-Animation im Zentrum der Stimulus-Box -->
        <TrafficLightCountdown onComplete={handleCountdownComplete} />
      {:else if testState === 'running'}
        {#if showingMask}
          <div class="text-9xl font-black text-gray-300">
            ✱
          </div>
        {:else}
          <div class="font-mono text-9xl font-black {currentDigit === 3 ? 'text-red-500' : 'text-gray-900'} tracking-tighter">
            {currentDigit}
          </div>
        {/if}
      {:else if testState === 'finished'}
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4 text-brand-purple"></div>
          <p class="text-gray-600 font-medium">Demo wird ausgewertet...</p>
        </div>
      {/if}
    </div>

    <!-- Response Area (Button mit Tutorial-Highlighting) -->
    <div class="w-full mt-6 min-h-[6rem] relative">
      <!-- Intro Phase: Arrow pointing to button (nur während Test) -->
      {#if tutorialPhase === 'intro' && testState === 'running' && !showingMask}
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
          <span class="material-symbols-outlined text-4xl text-brand-purple">
            arrow_downward
          </span>
        </div>
      {/if}
      
      <button 
        class="btn-gradient-primary w-full h-24 text-2xl font-black transition-all duration-150 active:scale-95 active:shadow-lg {tutorialPhase === 'intro' && !showingMask ? 'ring-4 ring-brand-purple/50 ring-offset-4' : ''}"
        class:opacity-50={testState !== 'running'}
        class:cursor-not-allowed={testState !== 'running'}
        class:hover:scale-105={testState === 'running'}
        class:hover:shadow-purple-button-hover={testState === 'running'}
        onclick={handleRespond}
        disabled={testState !== 'running'}
      >
        Reagieren
      </button>
    </div>

  </div>
</div>
