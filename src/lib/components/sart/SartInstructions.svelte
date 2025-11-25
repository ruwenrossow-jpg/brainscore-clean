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

<div class="card-modern w-full max-w-lg animate-fadeIn relative">
  <div class="p-8">
    
    <!-- Back Button - iOS Style (oben links) -->
    <div class="absolute top-4 left-4">
      <button
        onclick={() => window.history.back()}
        class="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors touch-target"
        aria-label="Zurück"
      >
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
        <span class="text-sm font-bold">Zurück</span>
      </button>
    </div>
    
    <!-- Header -->
    <div class="text-center mb-8 mt-8">
      <h2 class="text-3xl font-black text-gray-900 mb-3">Konzentrationstest</h2>
      <p class="text-sm text-gray-600 font-medium uppercase tracking-wider">Sustained Attention to Response Task</p>
    </div>
    
    <!-- Test Purpose Clarification -->
    <div class="p-4 bg-brand-purple/5 rounded-xl border border-brand-purple/20 mb-6">
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-brand-purple text-xl flex-shrink-0 mt-0.5">info</span>
        <div class="text-sm text-gray-700 leading-relaxed">
          <p class="mb-2 font-semibold text-gray-900">Wichtig zu wissen:</p>
          <p class="mb-1">Dieser Test misst, wie stabil du auf eine einfache Aufgabe reagieren kannst. Es geht <strong class="text-gray-900">nicht darum, alles perfekt zu machen</strong>.</p>
          <p>Wenn du öfter auf die 3 klickst oder Go-Reaktionen verpasst, ist das kein "Versagen", sondern ein Hinweis darauf, wie müde oder abgelenkt dein Gehirn gerade ist.</p>
        </div>
      </div>
    </div>
    
    <!-- Instructions Box -->
    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
      <h3 class="font-bold text-xl mb-6 text-gray-900">So funktioniert's:</h3>
      <ul class="space-y-4">
        <li class="flex items-start gap-4">
          <div class="icon-container flex-shrink-0">
            <span class="material-symbols-outlined text-brand-purple text-2xl">visibility</span>
          </div>
          <span class="text-gray-700 pt-1">Es erscheinen nacheinander <strong class="text-gray-900">Zahlen von 1-9</strong></span>
        </li>
        <li class="flex items-start gap-4">
          <div class="icon-container flex-shrink-0">
            <span class="material-symbols-outlined text-brand-purple text-2xl">touch_app</span>
          </div>
          <span class="text-gray-700 pt-1">Klicke den Button bei <strong class="text-gray-900">allen Zahlen</strong></span>
        </li>
        <li class="flex items-start gap-4">
          <div class="bg-yellow-100 p-3 rounded-full flex-shrink-0">
            <span class="text-2xl font-black">3</span>
          </div>
          <span class="text-gray-700 pt-1"><strong class="text-gray-900">AUSNAHME:</strong> Bei der <strong class="text-gray-900 text-xl">3</strong> → <strong class="text-gray-900">NICHT</strong> klicken!</span>
        </li>
      </ul>
    </div>

    <!-- Duration -->
    <div class="flex items-center justify-center gap-2 mb-8 text-gray-600">
      <span class="material-symbols-outlined">schedule</span>
      <p class="text-sm font-medium">
        Dauer: <strong class="text-gray-900">ca. 1,5 Minuten</strong>
      </p>
    </div>

    <!-- CTA Button -->
    <button 
      class="btn-gradient-primary w-full text-lg font-bold mb-4"
      onclick={onStart}
    >
      Jetzt starten
      <span class="ml-2">→</span>
    </button>

    <!-- Tip -->
    <div class="flex items-start gap-2 text-xs text-gray-500 bg-purple-50 p-3 rounded-lg">
      <span class="material-symbols-outlined text-brand-purple text-sm">tips_and_updates</span>
      <p class="pt-0.5">Tipp: Finde den richtigen Rhythmus zwischen Geschwindigkeit und Genauigkeit</p>
    </div>
  </div>
</div>
