/**
 * Current BrainScore Card Component
 * Displays the user's latest BrainScore in a prominent card
 */

<script lang="ts">
  import BaseCard from '../base/BaseCard.svelte';
  
  interface Props {
    score: number | null;
    loading?: boolean;
  }
  
  let { score, loading = false }: Props = $props();
</script>

<BaseCard>
  <div class="text-center py-8">
    <h2 class="text-2xl font-bold mb-4">Dein aktueller BrainScore</h2>
    
    {#if loading}
      <div class="flex justify-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    {:else if score !== null}
      <div class="text-7xl font-bold mb-2">
        {score}
      </div>
      <p class="text-gray-600">von 225 Punkten</p>
      
      <!-- Score interpretation -->
      <div class="mt-6 text-sm">
        {#if score >= 180}
          <div class="badge badge-success badge-lg">Ausgezeichnet 🎯</div>
          <p class="mt-2 text-gray-600">Deine Konzentration ist exzellent!</p>
        {:else if score >= 150}
          <div class="badge badge-info badge-lg">Sehr gut ✨</div>
          <p class="mt-2 text-gray-600">Du bist fokussiert und aufmerksam.</p>
        {:else if score >= 120}
          <div class="badge badge-warning badge-lg">Gut 💪</div>
          <p class="mt-2 text-gray-600">Solide Leistung, mit Luft nach oben.</p>
        {:else}
          <div class="badge badge-error badge-lg">Verbesserungswürdig 🎓</div>
          <p class="mt-2 text-gray-600">Mehr Übung bringt bessere Ergebnisse!</p>
        {/if}
      </div>
    {:else}
      <div class="text-gray-400 py-8">
        <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="text-xl font-semibold mb-2">Noch keine Tests absolviert</p>
        <p class="text-gray-600">Starte deinen ersten Konzentrationstest!</p>
      </div>
    {/if}
  </div>
</BaseCard>
