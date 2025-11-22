<script lang="ts">
  /**
   * Onboarding Page
   * Multi-Step Flow: Welcome → Form → Complete
   * 
   * ARCHITEKTUR:
   * - State Machine Pattern (wie SART-Test)
   * - Prüft ob User eingeloggt ist
   * - Speichert Profil in DB
   * - Redirect zu Dashboard nach Completion
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, currentUser } from '$lib/stores/auth.store';
  import { ProfileService } from '$lib/services/profile.service';
  import BaseCard from '$lib/components/base/BaseCard.svelte';
  import OnboardingWelcome from '$lib/components/onboarding/OnboardingWelcome.svelte';
  import OnboardingForm from '$lib/components/onboarding/OnboardingForm.svelte';
  
  type OnboardingStep = 'welcome' | 'form' | 'saving';
  
  let step = $state<OnboardingStep>('welcome');
  let isLoading = $state(false);
  let errorMessage = $state('');
  
  // KEINE CLIENT-SIDE GUARDS MEHR!
  // Server-Guard (+page.server.ts) prüft Auth BEVOR die Seite rendert
  
  async function handleComplete(data: { name: string; goal: string }) {
    if (!$currentUser) return;
    
    step = 'saving';
    isLoading = true;
    errorMessage = '';
    
    const { success, error } = await ProfileService.upsertProfile(
      $currentUser.id,
      data.name,
      data.goal
    );
    
    if (success) {
      // Weiterleitung zum Dashboard
      // Profile wird automatisch neu geladen bei nächster Navigation
      setTimeout(() => {
        goto('/dashboard');
      }, 500);
    } else {
      errorMessage = 'Fehler beim Speichern. Bitte versuche es erneut.';
      step = 'form';
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Onboarding - BrainrotAI</title>
</svelte:head>

<div class="min-h-screen bg-white flex items-center justify-center px-4 pwa-safe-screen">
  
  {#if $auth.loading}
    <div class="loading loading-spinner loading-lg"></div>
  {:else if $currentUser}
    
    <!-- Progress Indicator -->
    <div class="w-full max-w-2xl">
      
      <div class="mb-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="w-2 h-2 rounded-full {step === 'welcome' ? 'bg-black' : 'bg-gray-300'}"></div>
          <div class="w-8 h-0.5 bg-gray-300"></div>
          <div class="w-2 h-2 rounded-full {step === 'form' || step === 'saving' ? 'bg-black' : 'bg-gray-300'}"></div>
        </div>
        <p class="text-center text-sm text-gray-500">
          Schritt {step === 'welcome' ? '1' : '2'} von 2
        </p>
      </div>

      <!-- Card with Step Content -->
      <div class="card bg-base-200 shadow-lg border border-gray-200">
        <div class="card-body">
          
          {#if step === 'welcome'}
            <OnboardingWelcome onNext={() => (step = 'form')} />
            
          {:else if step === 'form'}
            {#if errorMessage}
              <div class="alert alert-error bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <span class="text-sm text-red-700">{errorMessage}</span>
              </div>
            {/if}
            <OnboardingForm 
              onComplete={handleComplete} 
              onBack={() => (step = 'welcome')} 
            />
            
          {:else if step === 'saving'}
            <div class="text-center py-12">
              <div class="loading loading-spinner loading-lg mb-4"></div>
              <p class="text-gray-600">Profil wird erstellt...</p>
            </div>
          {/if}

        </div>
      </div>

      <!-- Skip Option (optional) -->
      {#if step !== 'saving'}
        <div class="text-center mt-6">
          <button 
            class="text-sm text-gray-500 hover:text-gray-700"
            onclick={() => goto('/dashboard')}
          >
            Später vervollständigen →
          </button>
        </div>
      {/if}

    </div>

  {/if}

</div>
