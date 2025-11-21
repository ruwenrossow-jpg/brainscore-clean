<script lang="ts">
  /**
   * Onboarding Welcome Screen
   * Schritt 1: Begrüßung & Erklärung
   */
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  
  interface Props {
    onNext: () => void;
  }
  
  let { onNext }: Props = $props();
</script>

<div class="space-y-6">
  
  <!-- Welcome Icon -->
  <div class="text-center">
    <div class="text-6xl mb-4">🧠</div>
    <h2 class="text-3xl font-bold text-black mb-4">
      Willkommen bei BrainrotAI!
    </h2>
    <p class="text-gray-600">
      Lass uns dein Profil einrichten
    </p>
  </div>

  <!-- Info Cards -->
  <div class="space-y-4">
    
    <div class="bg-white p-4 rounded-lg border border-gray-300">
      <div class="flex items-start">
        <span class="text-2xl mr-3">📊</span>
        <div>
          <h3 class="font-semibold text-black mb-1">Was ist BrainScore?</h3>
          <p class="text-sm text-gray-700">
            Ein wissenschaftlich validierter Test zur Messung deiner 
            <strong>Konzentration</strong> und <strong>Reaktionsgeschwindigkeit</strong>.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg border border-gray-300">
      <div class="flex items-start">
        <span class="text-2xl mr-3">📈</span>
        <div>
          <h3 class="font-semibold text-black mb-1">Verlauf & Insights</h3>
          <p class="text-sm text-gray-700">
            Tracke deine Entwicklung über Zeit und erkenne Muster 
            zwischen Bildschirmzeit und kognitiver Performance.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg border border-gray-300">
      <div class="flex items-start">
        <span class="text-2xl mr-3">🔒</span>
        <div>
          <h3 class="font-semibold text-black mb-1">Deine Daten</h3>
          <p class="text-sm text-gray-700">
            Alle Daten werden <strong>anonym</strong> und sicher gespeichert. 
            Du behältst die volle Kontrolle.
          </p>
        </div>
      </div>
    </div>

  </div>

  <!-- Continue Button -->
  <BaseButton 
    variant="primary" 
    size="lg" 
    fullWidth={true}
    onclick={onNext}
  >
    Los geht's →
  </BaseButton>

  <p class="text-xs text-center text-gray-500">
    Dauert nur 2 Minuten
  </p>

</div>
