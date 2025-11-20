/**
 * Stats Card Component
 * Displays aggregated statistics (7-day average, total tests, etc.)
 */

<script lang="ts">
  import BaseCard from '../base/BaseCard.svelte';
  
  interface Props {
    averageScore7Days: number | null;
    totalTests: number;
    lastTestDate: Date | null;
    loading?: boolean;
  }
  
  let { averageScore7Days, totalTests, lastTestDate, loading = false }: Props = $props();
  
  function formatDate(date: Date | null): string {
    if (!date) return 'Nie';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Vor ${diffMins} Min.`;
    if (diffHours < 24) return `Vor ${diffHours} Std.`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
</script>

<BaseCard>
  <h3 class="text-xl font-bold mb-4">Statistiken</h3>
  
  {#if loading}
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 7-Day Average -->
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">7-Tage Ø</div>
        <div class="stat-value text-3xl">
          {averageScore7Days ?? '—'}
        </div>
        <div class="stat-desc">Durchschnittlicher Score</div>
      </div>
      
      <!-- Total Tests -->
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Gesamt Tests</div>
        <div class="stat-value text-3xl">
          {totalTests}
        </div>
        <div class="stat-desc">Absolvierte Tests</div>
      </div>
      
      <!-- Last Test -->
      <div class="stat bg-base-200 rounded-lg">
        <div class="stat-title">Letzter Test</div>
        <div class="stat-value text-2xl">
          {formatDate(lastTestDate)}
        </div>
        <div class="stat-desc">Zuletzt aktiv</div>
      </div>
    </div>
    
    {#if totalTests === 0}
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-800">
          💡 <strong>Tipp:</strong> Absolviere regelmäßig Tests, um deinen Fortschritt zu verfolgen!
        </p>
      </div>
    {/if}
  {/if}
</BaseCard>
