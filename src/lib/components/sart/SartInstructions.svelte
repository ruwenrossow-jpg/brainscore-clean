<script lang="ts">
  /**
   * SART Instructions
   * Erklärt die Test-Regeln vor dem Start
   */
  
  import BaseCard from '$lib/components/base/BaseCard.svelte';
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  
  interface Props {
    onStart: () => void;
  }
  
  let { onStart }: Props = $props();
</script>

<BaseCard title="Konzentrationstest" subtitle="Sustained Attention to Response Task" centered={true} maxWidth="lg">
  
  <div class="space-y-6 mt-6">
    
    <div class="bg-white p-6 rounded-lg border border-gray-300">
      <h3 class="font-semibold text-lg mb-4 text-black">So funktioniert's:</h3>
      <ul class="space-y-3 text-left">
        <li class="flex items-start">
          <span class="text-2xl mr-3">👀</span>
          <span class="text-gray-700">Es erscheinen nacheinander <strong>Zahlen von 1-9</strong></span>
        </li>
        <li class="flex items-start">
          <span class="text-2xl mr-3">✓</span>
          <span class="text-gray-700">Klicke den Button bei <strong>allen Zahlen</strong></span>
        </li>
        <li class="flex items-start">
          <span class="text-2xl mr-3">⚠️</span>
          <span class="text-gray-700"><strong class="text-black">AUSNAHME:</strong> Bei der <strong class="text-2xl">3</strong> → <strong>NICHT</strong> klicken!</span>
        </li>
      </ul>
    </div>

    <div class="text-center">
      <p class="text-sm text-gray-600">
        ⏱️ Dauer: <strong>ca. 1,5 Minuten</strong>
      </p>
    </div>

    <BaseButton variant="primary" size="lg" fullWidth={true} onclick={onStart}>
      Jetzt starten
    </BaseButton>

    <p class="text-xs text-gray-500 text-center">
      💡 Tipp: Finde den richtigen Rhythmus zwischen Geschwindigkeit und Genauigkeit
    </p>
  </div>

</BaseCard>
