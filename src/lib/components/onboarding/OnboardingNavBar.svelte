<script lang="ts">
  /**
   * OnboardingNavBar - Einheitliche Navigation für ALLE Onboarding-Steps
   * 
   * ZWECK:
   * Diese Komponente standardisiert die Navigation am unteren Rand aller Onboarding-Seiten,
   * um Style-Drift zu vermeiden und eine konsistente UX zu gewährleisten.
   * 
   * VERWENDUNG:
   * - Alle Onboarding-Steps (Welcome, Name, Ziele, Kontexte, Registrierung, PWA, Summary)
   * - Tutorial-Einstieg und -Ende
   * - Jede Seite im Onboarding-Flow
   * 
   * DESIGN:
   * - Linker Button: Schwarzer Hintergrund/Rand, weißer Text, Pfeil ←
   * - Rechter Button: Lila Gradient (Brand-Farbe), weißer Text, Pfeil →
   * - Beide Buttons: Konsistente Höhe (h-12/h-14), sichtbarer Rand, gleicher Border-Radius
   * - Fingerfreundlich auf Mobile (min 44px Touch-Target gemäß HIG)
   * 
   * PROPS:
   * - showBack: Zurück-Button anzeigen (default: true)
   * - backLabel: Text des Zurück-Buttons (default: "Zurück")
   * - onBack: Callback für Zurück-Button
   * - showNext: Weiter-Button anzeigen (default: true)
   * - nextLabel: Text des Weiter-Buttons (default: "Weiter")
   * - nextDisabled: Weiter-Button deaktivieren (default: false)
   * - onNext: Callback für Weiter-Button
   */
  
  interface Props {
    showBack?: boolean;
    backLabel?: string;
    onBack?: () => void;
    showNext?: boolean;
    nextLabel?: string;
    nextDisabled?: boolean;
    onNext?: () => void;
  }
  
  let {
    showBack = true,
    backLabel = 'Zurück',
    onBack,
    showNext = true,
    nextLabel = 'Weiter',
    nextDisabled = false,
    onNext
  }: Props = $props();
</script>

<!-- Navigation Bar Container -->
<div class="flex gap-3 md:gap-4 w-full">
  
  <!-- Zurück-Button (Linke Seite) -->
  {#if showBack}
    <button 
      onclick={onBack}
      class="btn-secondary flex-1 h-12 md:h-14 text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
      type="button"
    >
      <span class="material-symbols-outlined">arrow_back</span>
      {backLabel}
    </button>
  {/if}
  
  <!-- Weiter-Button (Rechte Seite) -->
  {#if showNext}
    <button 
      onclick={onNext}
      class="btn-gradient-primary flex-1 h-12 md:h-14 text-base md:text-lg font-black flex items-center justify-center gap-2 transition-all active:scale-95"
      disabled={nextDisabled}
      type="button"
    >
      {nextLabel}
      <span class="ml-1">→</span>
    </button>
  {/if}
  
</div>

<style>
  /* Ensure buttons are always accessible on mobile (44px min touch target) */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Visual border consistency */
  button:not(:disabled) {
    border-width: 2px;
  }
</style>
