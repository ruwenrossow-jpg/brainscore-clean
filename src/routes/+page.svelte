<!-- BrainScore Landing Page -->

<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth.store';
</script>

<div class="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
  
  <!-- Top Navigation (wenn nicht eingeloggt) -->
  {#if !$isAuthenticated}
    <div class="absolute top-4 right-4">
      <a href="/auth" class="btn btn-ghost btn-sm text-black">
        Login / Registrieren
      </a>
    </div>
  {/if}
  
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
      BrainScore
    </h1>
    <p class="text-base md:text-lg text-gray-600 font-light">
      Cognitive Performance Testing
    </p>
  </div>

  <!-- Main Card -->
  <div class="card bg-base-200 shadow-lg w-full max-w-md border border-gray-200">
    <div class="card-body space-y-6">
      
      <h2 class="card-title text-2xl font-semibold text-black justify-center">
        Teste deine Konzentration
      </h2>

      <div class="space-y-4 text-center">
        <p class="text-base text-gray-700 leading-relaxed">
          Messe deine <strong>Aufmerksamkeit</strong> und <strong>Reaktionsgeschwindigkeit</strong> 
          mit einem wissenschaftlich validierten Test.
        </p>
        
        <div class="divider my-2"></div>

        <ul class="text-sm text-gray-600 space-y-2 text-left">
          <li class="flex items-start">
            <span class="mr-2">✓</span>
            <span>5 Minuten SART-Konzentrationstest</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✓</span>
            <span>Personalisierter Score & Metriken</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">✓</span>
            <span>Screentime-Analyse (optional)</span>
          </li>
        </ul>
      </div>

      <div class="card-actions flex-col justify-center pt-4 space-y-3">
        {#if $isAuthenticated}
          <a href="/dashboard" class="btn btn-primary btn-lg w-full text-white hover:opacity-90 transition-opacity">
            Zum Dashboard
          </a>
        {:else}
          <a href="/auth" class="btn btn-primary btn-lg w-full text-white hover:opacity-90 transition-opacity">
            Jetzt starten
          </a>
          <a href="/test" class="btn btn-ghost btn-lg w-full text-black border border-gray-300">
            Ohne Anmeldung testen
          </a>
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
