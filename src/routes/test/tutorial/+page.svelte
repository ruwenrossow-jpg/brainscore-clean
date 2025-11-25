<script lang="ts">
  /**
   * Tutorial Route - Geführter Onboarding-Test
   * 
   * FLOW:
   * 1. TutorialSartTest (10 Trials, 800ms/1200ms, Step-by-Step)
   * 2. TutorialResultGuide (UI Walkthrough mit Callouts)
   * 3. Dashboard
   * 
   * WICHTIG:
   * - KEINE DB-Persistierung (Demo-Modus)
   * - Demo-Score wird nur zwischen Komponenten übergeben
   * - Nutzer kann Tutorial jederzeit abbrechen (Back-Button → Dashboard)
   */
  
  import { goto } from '$app/navigation';
  import TutorialSartTest from '$lib/components/sart/TutorialSartTest.svelte';
  import TutorialResultGuide from '$lib/components/sart/TutorialResultGuide.svelte';
  
  type TutorialStep = 'test' | 'guide';
  
  let currentStep = $state<TutorialStep>('test');
  let demoScore = $state(0);
  
  function handleTestComplete(score: number) {
    demoScore = score;
    currentStep = 'guide';
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
</script>

<div class="min-h-screen bg-white">
  <!-- Back Button (oben links, immer sichtbar) -->
  <div class="absolute top-4 left-4 z-50">
    <button 
      onclick={() => goto('/dashboard')}
      class="btn btn-ghost btn-sm touch-target group"
    >
      <span class="material-symbols-outlined text-lg">arrow_back</span>
      <span class="text-sm font-bold group-hover:text-brand-purple transition-colors">
        Abbrechen
      </span>
    </button>
  </div>

  <!-- Tutorial Content -->
  <div class="flex items-center justify-center min-h-screen px-4 py-6 md:py-12 pwa-safe-screen">
    {#if currentStep === 'test'}
      <TutorialSartTest onComplete={handleTestComplete} />
    {:else}
      <TutorialResultGuide demoScore={demoScore} />
    {/if}
  </div>
</div>
