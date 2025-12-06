<script lang="ts">
  /**
   * Post-Test Insight Screen (Variable Reward)
   * 
   * Hook-Model Reward Phase: Show user patterns discovered from their investment
   * - Display insight headline + body
   * - Show pattern visualization (if available)
   * - Provide clear CTAs to dashboard
   */
  import type { PostTestInsight } from '$lib/services/insight.service';
  
  interface Props {
    insight: PostTestInsight;
    onContinueToDashboard: () => void;
    onTestAgain?: () => void;
  }
  
  let { insight, onContinueToDashboard, onTestAgain }: Props = $props();
  
  // Pattern display helpers
  const hasPattern = $derived(insight.hasEnoughData && insight.pattern);
  const scoreDiff = $derived(hasPattern ? Math.abs(insight.pattern!.difference) : 0);
  const isPositivePattern = $derived(hasPattern && insight.pattern!.difference > 0);
</script>

<div class="card-modern w-full max-w-3xl animate-fadeIn">
  <div class="p-10 text-center">
    
    <!-- Icon Badge -->
    <div class="mb-6">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-purple/20 border-2 border-brand-accent/30 shadow-xl">
        <span class="material-symbols-outlined text-5xl text-brand-accent">insights</span>
      </div>
    </div>
    
    <!-- Headline -->
    <h2 class="text-4xl font-black text-gray-900 mb-4 leading-tight">
      {insight.headline}
    </h2>
    
    <!-- Body Text -->
    <p class="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8">
      {insight.body}
    </p>
    
    <!-- Pattern Visualization (if available) -->
    {#if hasPattern}
      <div class="bg-gradient-to-r from-brand-purple/5 to-brand-accent/5 border-2 border-brand-purple/20 rounded-2xl p-8 mb-8">
        <div class="grid grid-cols-2 gap-6">
          
          <!-- High Screentime Stats -->
          <div class="bg-white rounded-xl p-6 shadow-md">
            <div class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
              Viel Screentime
            </div>
            <div class="text-5xl font-black text-brand-purple mb-2">
              {Math.round(insight.pattern!.highScreentimeAvgScore)}
            </div>
            <div class="text-xs text-gray-600">
              Durchschnitt aus {insight.pattern!.highCount} {insight.pattern!.highCount === 1 ? 'Eintrag' : 'Einträgen'}
            </div>
          </div>
          
          <!-- Low Screentime Stats -->
          <div class="bg-white rounded-xl p-6 shadow-md">
            <div class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
              Wenig Screentime
            </div>
            <div class="text-5xl font-black text-brand-accent mb-2">
              {Math.round(insight.pattern!.lowScreentimeAvgScore)}
            </div>
            <div class="text-xs text-gray-600">
              Durchschnitt aus {insight.pattern!.lowCount} {insight.pattern!.lowCount === 1 ? 'Eintrag' : 'Einträgen'}
            </div>
          </div>
          
        </div>
        
        <!-- Difference Indicator -->
        <div class="mt-6 p-4 bg-white/80 rounded-xl">
          <div class="flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-3xl {isPositivePattern ? 'text-green-600' : 'text-red-600'}">
              {isPositivePattern ? 'trending_up' : 'trending_down'}
            </span>
            <span class="text-2xl font-black {isPositivePattern ? 'text-green-600' : 'text-red-600'}">
              {isPositivePattern ? '+' : ''}{Math.round(insight.pattern!.difference)} Punkte
            </span>
            <span class="text-sm text-gray-600">
              {isPositivePattern ? 'bei wenig Screentime' : 'bei viel Screentime'}
            </span>
          </div>
        </div>
      </div>
    {:else if !insight.hasEnoughData}
      <!-- Not Enough Data State -->
      <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-8">
        <span class="material-symbols-outlined text-6xl text-gray-400 mb-4">
          data_usage
        </span>
        <p class="text-base text-gray-600">
          Noch zu wenige Daten für Muster-Analyse.<br />
          <strong>Mach weiter so!</strong> Ab 3 Check-ins siehst du hier Trends.
        </p>
      </div>
    {/if}
    
    <!-- CTAs -->
    <div class="flex flex-col gap-4 max-w-md mx-auto mt-10">
      <button
        onclick={onContinueToDashboard}
        class="btn-gradient-primary text-xl font-black py-5 shadow-xl flex items-center justify-center gap-3"
      >
        <span class="material-symbols-outlined text-2xl">dashboard</span>
        Zum Dashboard
      </button>
      
      {#if onTestAgain}
        <button
          onclick={onTestAgain}
          class="text-sm text-gray-600 hover:text-brand-purple font-bold transition-colors"
        >
          Noch einen Test machen
        </button>
      {/if}
    </div>
    
  </div>
</div>
