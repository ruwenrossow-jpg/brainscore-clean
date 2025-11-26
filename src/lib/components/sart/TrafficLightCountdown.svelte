<script lang="ts">
  /**
   * TrafficLightCountdown.svelte
   * 
   * Ampel-Countdown für SART-Test (ersetzt numerischen 3-2-1 Countdown)
   * Verhindert Verwechslung der Countdown-Zahlen mit Test-Stimuli
   * 
   * Ablauf:
   * - Phase 1 (800-1000ms): Rot leuchtet
   * - Phase 2 (800-1000ms): Gelb leuchtet
   * - Phase 3 (800-1000ms): Grün leuchtet
   * - → Test startet
   */
  
  import { onMount } from 'svelte';
  
  interface Props {
    onComplete: () => void;
  }
  
  let { onComplete }: Props = $props();
  
  let phase = $state<1 | 2 | 3>(1);
  
  onMount(() => {
    // Phase 1: Rot (1200ms - langsamer für Tutorial-Komfort)
    const timer1 = setTimeout(() => {
      phase = 2;
      
      // Phase 2: Gelb (1200ms)
      const timer2 = setTimeout(() => {
        phase = 3;
        
        // Phase 3: Grün (1000ms)
        const timer3 = setTimeout(() => {
          onComplete();
        }, 1000);
        
        return () => clearTimeout(timer3);
      }, 1200);
      
      return () => clearTimeout(timer2);
    }, 1200);
    
    return () => clearTimeout(timer1);
  });
</script>

<!-- 
  POSITION: Diese Ampel erscheint absichtlich an der Stelle des späteren Reaktionsfeldes.
  ZWECK: Nutzer sehen schon im Countdown, wo später geklickt wird (bessere Orientierung).
-->
<div class="flex flex-col items-center justify-center">
  
  <!-- Traffic Light Circles (horizontal) -->
  <div class="flex items-center justify-center gap-4 md:gap-6 mb-6">
    <!-- Red Light -->
    <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 transition-all duration-300 {
      phase === 1 
        ? 'bg-red-500 border-red-600 shadow-2xl shadow-red-500/50 scale-110' 
        : 'bg-gray-200 border-gray-300'
    }"></div>
    
    <!-- Yellow Light -->
    <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 transition-all duration-300 {
      phase === 2 
        ? 'bg-yellow-400 border-yellow-500 shadow-2xl shadow-yellow-400/50 scale-110' 
        : 'bg-gray-200 border-gray-300'
    }"></div>
    
    <!-- Green Light -->
    <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 transition-all duration-300 {
      phase === 3 
        ? 'bg-green-500 border-green-600 shadow-2xl shadow-green-500/50 scale-110' 
        : 'bg-gray-200 border-gray-300'
    }"></div>
  </div>
  
  <!-- Text -->
  <p class="text-center text-gray-700 font-bold text-base md:text-lg mb-4">
    {#if phase === 1}
      Bereit machen...
    {:else if phase === 2}
      Gleich geht's los...
    {:else}
      Los! 🚀
    {/if}
  </p>
  
  <!-- Hinweis-Text (wo später Reaktionsfeld ist) -->
  <p class="text-center text-sm text-gray-600 max-w-xs">
    Gleich startet der Test – dann tippst du hier, wenn <strong>KEINE 3</strong> angezeigt wird.
  </p>
  
</div>
