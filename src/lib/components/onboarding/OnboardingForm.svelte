<script lang="ts">
  /**
   * Onboarding Form
   * Schritt 2: Name & Ziel erfassen
   */
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  
  interface Props {
    onComplete: (data: { name: string; goal: string }) => void;
    onBack: () => void;
  }
  
  let { onComplete, onBack }: Props = $props();
  
  let name = $state('');
  let goal = $state('');
  let errorMessage = $state('');
  
  const goalOptions = [
    { value: 'focus', label: '🎯 Fokus & Konzentration verbessern' },
    { value: 'digital_hygiene', label: '📱 Digitale Hygiene optimieren' },
    { value: 'experiments', label: '🔬 Selbstexperimente durchführen' },
    { value: 'performance', label: '⚡ Performance tracken' },
    { value: 'other', label: '💭 Andere Gründe' }
  ];
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!name.trim()) {
      errorMessage = 'Bitte gib einen Namen ein';
      return;
    }
    
    if (!goal) {
      errorMessage = 'Bitte wähle ein Ziel aus';
      return;
    }
    
    onComplete({ name: name.trim(), goal });
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  
  <!-- Header -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-black mb-2">
      Über dich
    </h2>
    <p class="text-gray-600">
      Hilf uns, dein Erlebnis zu personalisieren
    </p>
  </div>

  {#if errorMessage}
    <div class="alert alert-error bg-red-50 border border-red-200 rounded-lg p-3">
      <span class="text-sm text-red-700">{errorMessage}</span>
    </div>
  {/if}

  <!-- Name Input -->
  <div class="form-control w-full">
    <label class="label" for="name">
      <span class="label-text text-black font-medium">Wie sollen wir dich nennen?</span>
      <span class="label-text-alt text-gray-500">Spitzname oder echter Name</span>
    </label>
    <input 
      id="name" 
      type="text" 
      placeholder="z.B. Max oder MaxM"
      class="input input-bordered w-full text-lg bg-white border-gray-300 focus:border-black" 
      bind:value={name}
      required
      maxlength="50"
    />
  </div>

  <!-- Goal Selection -->
  <div class="form-control w-full">
    <label class="label" for="goal">
      <span class="label-text text-black font-medium">Warum nutzt du BrainrotAI?</span>
    </label>
    <select 
      id="goal" 
      class="select select-bordered w-full bg-white border-gray-300 focus:border-black text-base"
      bind:value={goal}
      required
    >
      <option value="" disabled selected>Wähle dein Hauptziel...</option>
      {#each goalOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <!-- Info Box -->
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <p class="text-xs text-gray-600 text-center">
      📊 Diese Infos helfen uns, relevante Insights für dich zu generieren. 
      Du kannst sie jederzeit in deinem Profil ändern.
    </p>
  </div>

  <!-- Buttons -->
  <div class="flex gap-3">
    <button 
      type="button"
      class="btn btn-ghost flex-1"
      onclick={onBack}
    >
      ← Zurück
    </button>
    
    <BaseButton 
      variant="primary" 
      size="lg" 
      fullWidth={false}
    >
      <span class="flex-1">Profil erstellen</span>
    </BaseButton>
  </div>

</form>
