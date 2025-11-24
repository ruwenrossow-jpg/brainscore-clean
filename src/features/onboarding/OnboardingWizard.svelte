<script lang="ts">
  /**
   * Onboarding Wizard
   * 
   * 4-step onboarding flow:
   * 1. Welcome & Name
   * 2. Goal selection (max 3)
   * 3. Context + Time selection (max 3, combined)
   * 4. Summary + ICS download + first test
   */
  import { goto, invalidateAll } from '$app/navigation';
  import { onboarding } from './onboardingState';
  import { currentUser } from '$lib/stores/auth.store';
  import { ProfileService } from '$lib/services/profile.service';
  import ContextAndTimeStep from './ContextAndTimeStep.svelte';
  import { 
    USER_GOAL_LABELS,
    type UserGoal,
    type TrackingContext
  } from './onboardingTypes';
  
  type Step = 1 | 2 | 3 | 4;
  
  let currentStep = $state<Step>(1);
  let userName = $state('');
  let selectedGoals = $state<UserGoal[]>([]);
  let contexts = $state<TrackingContext[]>([]);
  let isDownloadingICS = $state(false);
  let isSaving = $state(false);
  
  // Step 2: Toggle goal selection
  function toggleGoal(goal: UserGoal) {
    const index = selectedGoals.indexOf(goal);
    if (index > -1) {
      selectedGoals = selectedGoals.filter(g => g !== goal);
    } else {
      if (selectedGoals.length >= 3) {
        return; // Max 3 goals
      }
      selectedGoals = [...selectedGoals, goal];
    }
  }
  
  // Step 3: Handle context changes from ContextAndTimeStep
  function handleContextsChange(newContexts: TrackingContext[]) {
    contexts = newContexts;
  }
  
  // Navigation
  function nextStep() {
    if (currentStep === 1 && !userName.trim()) {
      alert('Bitte gib deinen Namen ein.');
      return;
    }
    if (currentStep === 2 && selectedGoals.length === 0) {
      alert('Bitte wähle mindestens ein Ziel aus.');
      return;
    }
    if (currentStep === 3 && contexts.length === 0) {
      alert('Bitte wähle mindestens eine Situation mit Uhrzeit aus.');
      return;
    }
    if (currentStep < 4) {
      currentStep = (currentStep + 1) as Step;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep = (currentStep - 1) as Step;
    }
  }
  
  // Step 4: Download ICS
  async function downloadICS() {
    if (contexts.length === 0) {
      alert('Keine Kontexte zum Exportieren vorhanden.');
      return;
    }
    
    isDownloadingICS = true;
    try {
      const response = await fetch('/api/ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingContexts: contexts })
      });
      
      if (!response.ok) {
        throw new Error('ICS generation failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brainscore-reminders.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download ICS:', error);
      alert('Fehler beim Erstellen der Kalender-Datei.');
    } finally {
      isDownloadingICS = false;
    }
  }
  
  // Step 4: Complete onboarding and start first test
  async function startFirstTest() {
    if (!$currentUser) {
      alert('Du musst eingeloggt sein, um fortzufahren.');
      goto('/auth');
      return;
    }
    
    isSaving = true;
    try {
      // Save profile (name + primary goal)
      const primaryGoal = selectedGoals[0] || 'unsure';
      const { success, error } = await ProfileService.upsertProfile(
        $currentUser.id,
        userName.trim(),
        primaryGoal
      );
      
      if (!success) {
        throw new Error(error || 'Profile save failed');
      }
      
      // Save to onboarding store (for future use)
      onboarding.setGoals(selectedGoals);
      contexts.forEach(ctx => onboarding.addContext(ctx));
      onboarding.complete();
      
      // Invalidate server cache to reload profile
      await invalidateAll();
      
      console.log('✅ Onboarding completed, starting first test...');
      
      // Navigate to test
      goto('/test');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="min-h-screen bg-white flex items-center justify-center px-4 pwa-safe-screen">
  <div class="w-full max-w-2xl">
    
    <!-- Progress Indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-center gap-2 mb-4">
        {#each [1, 2, 3, 4] as step}
          <div class="w-2 h-2 rounded-full {currentStep === step ? 'bg-black' : currentStep > step ? 'bg-gray-400' : 'bg-gray-200'}"></div>
          {#if step < 4}
            <div class="w-8 h-0.5 bg-gray-300"></div>
          {/if}
        {/each}
      </div>
      <p class="text-center text-sm text-gray-500">
        Schritt {currentStep} von 4
      </p>
    </div>

    <!-- Card Container -->
    <div class="card bg-base-200 shadow-lg border border-gray-200">
      <div class="card-body">
        
        <!-- Step 1: Welcome & Name -->
        {#if currentStep === 1}
          <div class="space-y-8">
            <div class="text-center">
              <h1 class="text-5xl font-black text-gray-900 mb-6 leading-tight">
                WILLKOMMEN! LASS UNS DEINE <span class="text-gradient-hero">AUFMERKSAMKEIT</span> VERSTEHEN.
              </h1>
              <p class="text-gray-600 text-lg mb-4">
                In wenigen Minuten richten wir deinen persönlichen Fokus-Tracker ein.
              </p>
              <p class="text-sm text-gray-500">
                Dauert nur 3–4 Minuten
              </p>
            </div>
            <div>
              <label for="userName" class="block text-base font-bold text-gray-900 mb-3">
                Wie sollen wir dich nennen?
              </label>
              <input
                id="userName"
                type="text"
                bind:value={userName}
                placeholder="Dein Name"
                class="input input-bordered w-full h-14 text-lg font-medium rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                onkeydown={(e) => e.key === 'Enter' && nextStep()}
              />
            </div>
            <button 
              onclick={nextStep} 
              class="btn-gradient-primary w-full h-16 text-xl font-black"
              disabled={!userName.trim()}
            >
              Los geht's <span class="ml-2">→</span>
            </button>
          </div>
        {/if}
        
        <!-- Step 2: Goals Selection -->
        {#if currentStep === 2}
          <div class="space-y-6">
            <div>
              <h2 class="text-4xl font-black text-gray-900 mb-3">Deine Ziele</h2>
              <p class="text-gray-600 text-base">
                Wähle bis zu 3 Ziele aus, die für dich wichtig sind.
              </p>
            </div>
            
            <div class="space-y-3">
              {#each Object.entries(USER_GOAL_LABELS) as [goal, { label, description }]}
                <button
                  onclick={() => toggleGoal(goal as UserGoal)}
                  class="w-full text-left p-5 rounded-2xl border-2 transition-all transform hover:-translate-y-1 {
                    selectedGoals.includes(goal as UserGoal)
                      ? 'border-brand-purple bg-brand-purple text-white shadow-lg shadow-purple-500/30'
                      : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
                  }"
                  disabled={!selectedGoals.includes(goal as UserGoal) && selectedGoals.length >= 3}
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-black text-lg">{label}</div>
                      <div class="text-sm opacity-80">{description}</div>
                    </div>
                    {#if selectedGoals.includes(goal as UserGoal)}
                      <span class="material-symbols-outlined text-3xl">check_circle</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
            
            <div class="text-sm text-gray-500 text-center">
              {selectedGoals.length} von 3 ausgewählt
            </div>
            
            <div class="flex gap-4">
              <button onclick={prevStep} class="btn-secondary flex-1 h-14 font-bold">
                <span class="material-symbols-outlined">arrow_back</span>
                Zurück
              </button>
              <button 
                onclick={nextStep} 
                class="btn-gradient-primary flex-1 h-14 font-black"
                disabled={selectedGoals.length === 0}
              >
                Weiter <span class="ml-2">→</span>
              </button>
            </div>
          </div>
        {/if}
        
        <!-- Step 3: Context + Time Selection (Combined) -->
        {#if currentStep === 3}
          <ContextAndTimeStep 
            bind:contexts={contexts}
            onContextsChange={handleContextsChange}
          />
          
          <div class="flex gap-4 mt-6">
            <button onclick={prevStep} class="btn-secondary flex-1 h-14 font-bold">
              <span class="material-symbols-outlined">arrow_back</span>
              Zurück
            </button>
            <button 
              onclick={nextStep} 
              class="btn-gradient-primary flex-1 h-14 font-black"
              disabled={contexts.length === 0}
            >
              Weiter <span class="ml-2">→</span>
            </button>
          </div>
        {/if}
        
        <!-- Step 4: Summary & Actions -->
        {#if currentStep === 4}
          <div class="space-y-6">
            <div>
              <h2 class="text-4xl font-black text-gray-900 mb-3">Alles bereit!</h2>
              <p class="text-gray-600 text-base">
                Du hast deine Ziele und Check-in-Zeiten konfiguriert.
              </p>
            </div>
            
            <!-- Summary -->
            <div class="space-y-4">
              <div class="p-4 bg-white rounded-lg border border-gray-300">
                <div class="text-sm font-semibold mb-2">Deine Ziele:</div>
                <div class="flex flex-wrap gap-2">
                  {#each selectedGoals as goal}
                    <span class="badge badge-lg">
                      {USER_GOAL_LABELS[goal].label}
                    </span>
                  {/each}
                </div>
              </div>
              
              <div class="p-4 bg-white rounded-lg border border-gray-300">
                <div class="text-sm font-semibold mb-2">Deine Check-ins:</div>
                <div class="space-y-2">
                  {#each contexts as context}
                    <div class="flex justify-between text-sm">
                      <span>{context.label}</span>
                      <span class="text-gray-600 font-mono">
                        {context.time} Uhr
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="space-y-3">
              <button
                onclick={downloadICS}
                class="btn btn-outline w-full"
                disabled={isDownloadingICS}
              >
                {#if isDownloadingICS}
                  <span class="loading loading-spinner"></span>
                  Erstelle Kalender...
                {:else}
                  <span class="material-symbols-outlined mr-2">calendar_month</span>
                  Kalender-Reminder hinzufügen
                {/if}
              </button>
              
              <button
                onclick={startFirstTest}
                class="btn-gradient-primary w-full h-16 text-xl font-black"
                disabled={isSaving}
              >
                {#if isSaving}
                  <span class="loading loading-spinner"></span>
                  Speichere...
                {:else}
                  <span class="material-symbols-outlined mr-2">rocket_launch</span>
                  Ersten Test starten
                {/if}
              </button>
            </div>
            
            <div class="text-center">
              <button onclick={prevStep} class="btn btn-ghost btn-sm hover:bg-gray-100">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                Zurück
              </button>
            </div>
          </div>
        {/if}

      </div>
    </div>

  </div>
</div>
