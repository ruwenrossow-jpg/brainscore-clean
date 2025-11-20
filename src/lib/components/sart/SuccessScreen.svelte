<script lang="ts">
  /**
   * Success Screen - Abschluss-Seite
   */
</script>

<div class="card bg-base-200 shadow-lg w-full max-w-md border border-gray-200">
  <div class="card-body items-center text-center space-y-6">
    
    <div class="bg-black text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl">
      ✓
    </div>

    <div>
      <h2 class="text-3xl font-bold text-black mb-2">Geschafft!</h2>
      <p class="text-gray-600">Vielen Dank für deine Teilnahme</p>
    </div>

    <div class="bg-white p-4 rounded-lg border border-gray-300 w-full">
      <p class="text-sm text-gray-700">
        Deine Daten wurden <strong>anonym gespeichert</strong> und helfen uns, 
        die Auswirkungen von Bildschirmzeit auf kognitive Performance besser zu verstehen.
      </p>
    </div>

    <div class="w-full space-y-3">
      <a href="/dashboard" class="btn btn-primary btn-lg w-full text-white" data-sveltekit-preload-data="hover">
        Zum Dashboard
      </a>
      <a href="/test" class="btn btn-ghost w-full text-gray-700" data-sveltekit-preload-data="hover">
        Nochmal testen
      </a>
    </div>

  </div>
</div>
