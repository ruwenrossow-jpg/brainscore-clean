<script lang="ts">
  /**
   * SART Result - Zeigt Test-Ergebnisse
   */
  
  import BaseCard from '$lib/components/base/BaseCard.svelte';
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  import { SartService } from '$lib/services/sart.service';
  import type { SartMetrics } from '$lib/types/sart.types';
  
  interface Props {
    metrics: SartMetrics | null;
    onNext: () => void;
  }
  
  let { metrics, onNext }: Props = $props();
  
  let scoreLabel = $derived(
    metrics ? SartService.getScoreLabel(metrics.score) : ''
  );
</script>

{#if metrics}
  <BaseCard title="Dein Ergebnis" subtitle="Konzentrationstest abgeschlossen" centered={true} maxWidth="lg">
    
    <div class="space-y-8 mt-6">
      
      <!-- Main Score -->
      <div class="bg-white p-8 rounded-lg border-2 border-black">
        <p class="text-sm text-gray-600 uppercase tracking-wide mb-2">BrainScore</p>
        <div class="text-7xl font-bold text-black mb-2">{metrics.score}</div>
        <p class="text-lg text-gray-700">{scoreLabel}</p>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 gap-4">
        
        <div class="bg-white p-4 rounded-lg border border-gray-300 text-center">
          <div class="text-3xl font-bold text-black">{metrics.commissionErrors}</div>
          <p class="text-xs text-gray-600 mt-1">Falsch reagiert<br/>(bei "3" geklickt)</p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-300 text-center">
          <div class="text-3xl font-bold text-black">{metrics.omissionErrors}</div>
          <p class="text-xs text-gray-600 mt-1">Ausgelassen<br/>(nicht geklickt)</p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-300 text-center col-span-2">
          <div class="text-3xl font-bold text-black">{metrics.meanReactionTimeMs} ms</div>
          <p class="text-xs text-gray-600 mt-1">Durchschnittliche Reaktionszeit</p>
        </div>

      </div>

      <BaseButton variant="primary" size="lg" fullWidth={true} onclick={onNext}>
        Weiter zu Screentime-Analyse
      </BaseButton>

      <p class="text-xs text-gray-500 text-center">
        📊 Deine Daten helfen uns, Zusammenhänge zwischen Bildschirmzeit und Konzentration zu verstehen
      </p>

    </div>

  </BaseCard>
{/if}
