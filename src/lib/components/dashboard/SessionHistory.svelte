<script lang="ts">
  /**
   * Session History Component
   * Displays a timeline/list of recent SART test sessions
   */
  import BaseCard from '../base/BaseCard.svelte';
  import type { SessionHistoryItem } from '$lib/services/dashboard.service';
  
  interface Props {
    sessions: SessionHistoryItem[];
    loading?: boolean;
  }
  
  let { sessions, loading = false }: Props = $props();
  
  function formatDateTime(date: Date): string {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-info';
    if (score >= 40) return 'badge-warning';
    return 'badge-error';
  }
</script>

<BaseCard>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-bold">Test-Verlauf</h3>
    {#if sessions.length > 0}
      <span class="text-sm text-gray-600">{sessions.length} Einträge</span>
    {/if}
  </div>
  
  {#if loading}
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
    </div>
  {:else if sessions.length === 0}
    <div class="text-center py-12 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="text-lg font-semibold mb-2">Noch keine Tests vorhanden</p>
      <p class="text-sm">Deine Test-Historie erscheint hier nach dem ersten Test.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each sessions as session (session.id)}
        <div class="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div class={`badge ${getScoreBadgeClass(session.score)}`}>
                {session.score} Punkte
              </div>
              <span class="text-sm text-gray-600">
                {formatDateTime(session.createdAt)}
              </span>
            </div>
            
            <div class="text-sm text-gray-600 flex gap-4">
              <span>
                <strong>CE:</strong> {session.commissionErrors}
              </span>
              <span>
                <strong>OE:</strong> {session.omissionErrors}
              </span>
            </div>
          </div>
          
          <!-- Visual indicator -->
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">
            {#if session.score >= 80}
              🎯
            {:else if session.score >= 60}
              ✨
            {:else if session.score >= 40}
              💪
            {:else}
              📚
            {/if}
          </div>
        </div>
      {/each}
    </div>
    
    {#if sessions.length >= 10}
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">Zeige die letzten 10 Tests</p>
      </div>
    {/if}
  {/if}
</BaseCard>
