<!-- BrainScore Landing Page -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  // Server-seitige Daten (Session + Profile)
  let isLoggedIn = $derived(!!data.session);
  let hasProfile = $derived(!!data.profile);
  let hasCompletedOnboarding = $derived((data.profile as any)?.onboarding_completed || false);
</script>

<svelte:head>
  <title>BrainrotAI - Cognitive Performance Testing</title>
</svelte:head>

<div class="min-h-screen bg-white flex flex-col items-center justify-center px-4 pwa-safe-screen">
  
  <!-- Header mit Logo -->
  <div class="text-center mb-12 animate-fadeIn">
    <div class="flex items-center justify-center gap-4 mb-6">
      <div class="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center shadow-purple-glow">
        <span class="text-white font-black text-3xl">B</span>
      </div>
      <h1 class="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
        BrainrotAI
      </h1>
    </div>
    <p class="text-lg md:text-xl text-gray-700 font-normal">
      Cognitive Performance Testing
    </p>
  </div>

  <!-- Main Card -->
  <div class="card-modern w-full max-w-md animate-slideUp">
    <div class="p-8 space-y-8">
      
      {#if !isLoggedIn}
        <!-- Nicht eingeloggt: Neuer User -->
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 text-center leading-tight">
          Verstehe endlich, was deine <span class="text-gradient-hero">Aufmerksamkeit</span> wirklich steuert.
        </h2>
      {:else if !hasProfile || !hasCompletedOnboarding}
        <!-- Eingeloggt, aber Onboarding nicht abgeschlossen -->
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 text-center leading-tight">
          Vervollständige dein <span class="text-gradient-hero">Setup</span>, um zu starten.
        </h2>
      {:else}
        <!-- Eingeloggt und bereit -->
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 text-center leading-tight">
          Gewinne die <span class="text-gradient-hero">Kontrolle</span> über deine Aufmerksamkeit zurück.
        </h2>
      {/if}

      <div class="flex flex-col justify-center pt-4 space-y-4">
        {#if !isLoggedIn}
          <!-- Gast: Jetzt starten / Einloggen -->
          <button onclick={() => goto('/onboarding')} class="btn-gradient-primary w-full h-14 text-lg font-bold">
            Jetzt starten
            <span class="ml-2">→</span>
          </button>
          <button onclick={() => goto('/auth')} class="btn-ghost w-full text-sm text-gray-700 hover:text-brand-purple transition-colors">
            Bereits ein Konto?
          </button>
        {:else if !hasProfile || !hasCompletedOnboarding}
          <!-- Eingeloggt, aber Onboarding incomplete -->
          <button onclick={() => goto('/onboarding')} class="btn-gradient-primary w-full h-14 text-lg font-bold">
            {!hasProfile ? 'Onboarding starten' : 'Onboarding fortsetzen'}
            <span class="ml-2">→</span>
          </button>
          <button onclick={() => goto('/auth')} class="btn-ghost w-full text-sm text-gray-700 hover:text-gray-900 transition-colors">
            Ausloggen
          </button>
        {:else}
          <!-- Eingeloggt und onboarding complete -->
          <button onclick={() => goto('/test')} class="btn-gradient-primary w-full text-lg font-bold">
            Test starten
            <span class="ml-2">→</span>
          </button>
          <button onclick={() => goto('/dashboard')} class="btn-secondary w-full text-base">
            Zum Dashboard
          </button>
        {/if}
      </div>

      <p class="text-xs text-gray-600 text-center mt-4">
        {#if !isLoggedIn}
          Erstelle einen Account, um deine Fortschritte zu tracken
        {:else if !hasProfile || !hasCompletedOnboarding}
          Noch ein paar Schritte, dann kann es losgehen
        {:else}
          Deine Tests werden automatisch gespeichert und sind jederzeit im Dashboard verfügbar
        {/if}
      </p>
    </div>
  </div>

</div>
