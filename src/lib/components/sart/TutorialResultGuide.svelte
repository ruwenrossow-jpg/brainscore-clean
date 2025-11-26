<script lang="ts">
  /**
   * Tutorial Result Guide - Geführtes Walkthrough für UI-Verständnis
   * 
   * ZIEL:
   * - Zeige Demo-Ergebnis mit Callouts/Badges
   * - Erkläre Score, Logbuch-Verlauf, Screentime-Eingabe
   * - KEINE echten Daten (Demo-Modus)
   * - Button zum Dashboard
   * 
   * CALLOUTS:
   * 1. Score-Erklärung (0-100 Skala, Fokus-Indikator)
   * 2. Logbuch-Verlauf (Entwicklung über Tage)
   * 3. Screentime-Karte (Muster erkennen, Forschungsdaten)
   */
  
  import { goto } from '$app/navigation';
  
  interface Props {
    demoScore: number;
  }
  
  let { demoScore }: Props = $props();
  
  let currentCallout = $state(0);
  const totalCallouts = 3;
  
  function nextCallout() {
    if (currentCallout < totalCallouts - 1) {
      currentCallout += 1;
    }
  }
  
  function prevCallout() {
    if (currentCallout > 0) {
      currentCallout -= 1;
    }
  }
  
  function finishTutorial() {
    goto('/dashboard');
  }
  
  // Score-Label für Demo (KEINE Emojis)
  let scoreLabel = $derived.by(() => {
    if (demoScore >= 80) return 'Hervorragend';
    if (demoScore >= 60) return 'Gut';
    if (demoScore >= 40) return 'Durchschnittlich';
    return 'Übung macht den Meister';
  });
  
  let scoreColor = $derived.by(() => {
    if (demoScore >= 70) return 'text-green-600';
    if (demoScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  });
</script>

<div class="min-h-screen bg-white px-4 py-6 md:py-8 pwa-safe-screen">
  <div class="w-full max-w-2xl mx-auto">
    
    <!-- Header (kein Icon, kein Badge) -->
    <div class="text-center mb-6">
      <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">
        So sieht dein Ergebnis aus
      </h1>
      <p class="text-gray-600 text-sm md:text-base">
        Tippe auf die nummerierten Badges, um mehr zu erfahren
      </p>
    </div>

    <!-- Demo Result Card -->
    <div class="card bg-white shadow-xl border-2 border-gray-200 mb-6">
      <div class="card-body p-6 md:p-8">
        
        <!-- Callout 1: Score Display -->
        <div class="relative mb-8">
          <div class="text-center">
            <p class="text-sm font-semibold text-gray-600 mb-2">Demo-Ergebnis</p>
            <div class="score-display {scoreColor} text-6xl md:text-7xl font-black mb-2">
              {demoScore}
            </div>
            <p class="text-lg font-bold text-gray-900 mb-4">{scoreLabel}</p>
          </div>
          
          <!-- Callout Badge 1 -->
          {#if currentCallout === 0}
            <div class="absolute -top-2 -right-2 animate-pulse">
              <div class="badge badge-lg bg-brand-purple text-white font-black shadow-lg">
                1
              </div>
            </div>
            <div class="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
              <p class="text-sm md:text-base font-bold text-purple-900 mb-2">
                Dein BrainScore
              </p>
              <p class="text-sm text-purple-800">
                Hier siehst du später deinen BrainScore (0–100). 
                Höher = stabilerer Fokus in diesem Moment. 
                Der Score schwankt je nach Tagesform, Müdigkeit und Kontext.
              </p>
            </div>
          {/if}
        </div>

        <!-- Callout 2: Verlauf Preview (Mock) -->
        <div class="relative mb-8">
          <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-bold text-gray-900">14-Tage-Verlauf</p>
              <span class="text-xs text-gray-500">Demo-Daten</span>
            </div>
            
            <!-- Mock Chart -->
            <div class="flex items-end justify-between gap-1 h-24">
              {#each [45, 52, 48, 63, 58, 70, 65, 72, 68, 75, 71, 78, 74, demoScore] as score}
                <div class="flex-1 bg-gradient-to-t from-brand-purple to-purple-400 rounded-t-sm opacity-70 transition-all hover:opacity-100" 
                     style="height: {score}%"
                ></div>
              {/each}
            </div>
          </div>
          
          <!-- Callout Badge 2 -->
          {#if currentCallout === 1}
            <div class="absolute -top-2 -right-2 animate-pulse">
              <div class="badge badge-lg bg-brand-purple text-white font-black shadow-lg">
                2
              </div>
            </div>
            <div class="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
              <p class="text-sm md:text-base font-bold text-purple-900 mb-2">
                Verlauf über Tage
              </p>
              <p class="text-sm text-purple-800">
                Hier kannst du später sehen, wie sich dein Fokus über mehrere Tage entwickelt. 
                Du erkennst Muster: Welche Tageszeiten sind besser? Wie wirkt sich Schlaf aus?
              </p>
            </div>
          {/if}
        </div>

        <!-- Callout 3: Screentime/Context Card (Mock) -->
        <div class="relative">
          <div class="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
            <div class="mb-3">
              <p class="text-sm font-bold text-gray-900">Handynutzung & Kontext</p>
              <p class="text-xs text-gray-600">Nach jedem Test</p>
            </div>
            
            <div class="space-y-2 text-sm text-gray-700">
              <div class="flex justify-between">
                <span>Screentime heute</span>
                <span class="font-mono font-bold">3h 24min</span>
              </div>
              <div class="flex justify-between">
                <span>Entsperrt</span>
                <span class="font-mono font-bold">47×</span>
              </div>
              <div class="flex justify-between">
                <span>Situation</span>
                <span class="font-bold">Nach der Uni</span>
              </div>
            </div>
          </div>
          
          <!-- Callout Badge 3 -->
          {#if currentCallout === 2}
            <div class="absolute -top-2 -right-2 animate-pulse">
              <div class="badge badge-lg bg-brand-purple text-white font-black shadow-lg">
                3
              </div>
            </div>
            <div class="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
              <p class="text-sm md:text-base font-bold text-purple-900 mb-2">
                Screentime-Eingabe
              </p>
              <p class="text-sm text-purple-800">
                Hier trägst du nach jedem Test kurz deine Handynutzung ein. 
                Das hilft dir, Muster zu erkennen (z.B. "Nach 4h Handy sinkt mein Score") 
                und liefert wertvolle Daten für unsere Forschung.
              </p>
            </div>
          {/if}
        </div>

      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between mb-4">
      <button 
        onclick={prevCallout}
        class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        disabled={currentCallout === 0}
      >
        ← Zurück
      </button>
      
      <div class="flex gap-2">
        {#each Array(totalCallouts) as _, i}
          <div class="w-2 h-2 rounded-full {currentCallout === i ? 'bg-brand-purple' : 'bg-gray-300'}"></div>
        {/each}
      </div>
      
      {#if currentCallout < totalCallouts - 1}
        <button 
          onclick={nextCallout}
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          Weiter →
        </button>
      {:else}
        <button 
          onclick={finishTutorial}
          class="btn-gradient-primary px-6 h-10 text-sm font-black"
        >
          Verstanden
        </button>
      {/if}
    </div>

    <!-- Final Action (Always Visible) -->
    {#if currentCallout === totalCallouts - 1}
      <div class="text-center mt-6">
        <button
          onclick={finishTutorial}
          class="btn-gradient-primary w-full h-14 text-base md:text-lg font-black"
        >
          Zum Dashboard
        </button>
        <p class="text-xs text-gray-500 mt-3">
          Den ersten echten Test kannst du jederzeit im Dashboard starten
        </p>
      </div>
    {/if}

  </div>
</div>
