<!-- BrainScore Landing Page -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth.store';
  import type { PageData } from './$types';
  
  // Server-Side Rendering: Diese Seite wird nur angezeigt wenn Server-Guard
  // KEINEN Redirect macht (= User ist nicht eingeloggt)
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>BrainrotAI - Cognitive Performance Testing</title>
</svelte:head>

<div class="min-h-screen bg-white flex flex-col items-center justify-center px-4 pwa-safe-screen">
  
  <!-- Top Navigation (wenn nicht eingeloggt) -->
  {#if !$isAuthenticated}
    <div class="absolute top-4 right-4">
      <button onclick={() => goto('/auth')} class="btn btn-ghost btn-sm text-black">
        Login / Registrieren
      </button>
    </div>
  {/if}
  
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
      BrainrotAI
    </h1>
    <p class="text-base md:text-lg text-gray-600 font-light">
      Cognitive Performance Testing
    </p>
  </div>

  <!-- Main Card -->
  <div class="card bg-base-200 shadow-lg w-full max-w-md border border-gray-200">
    <div class="card-body space-y-6">
      
      {#if $isAuthenticated}
        <!-- Eingeloggt: Fokus auf Kontrolle -->
        <h2 class="text-2xl md:text-3xl font-bold text-black text-center leading-tight">
          Gewinne die Kontrolle über deine Aufmerksamkeit zurück.
        </h2>
      {:else}
        <!-- Nicht eingeloggt: Fokus auf Klarheit -->
        <h2 class="text-2xl md:text-3xl font-bold text-black text-center leading-tight">
          Verstehe endlich, was deine Aufmerksamkeit wirklich steuert.
        </h2>
      {/if}

      <div class="card-actions flex-col justify-center pt-4 space-y-3">
        {#if $isAuthenticated}
          <button onclick={() => goto('/dashboard')} class="btn btn-primary btn-lg w-full text-white hover:opacity-90 transition-opacity">
            Zum Dashboard
          </button>
        {:else}
          <button onclick={() => goto('/auth')} class="btn btn-primary btn-lg w-full text-white hover:opacity-90 transition-opacity">
            Jetzt starten
          </button>
          <button onclick={() => goto('/test')} class="btn btn-ghost btn-lg w-full text-black border border-gray-300">
            Ohne Anmeldung testen
          </button>
        {/if}
      </div>

      <p class="text-xs text-gray-500 text-center mt-4">
        {#if $isAuthenticated}
          Deine Sessions werden gespeichert und sind im Dashboard verfügbar
        {:else}
          Registrierung empfohlen für Verlauf · Anonyme Tests möglich
        {/if}
      </p>
    </div>
  </div>

</div>
