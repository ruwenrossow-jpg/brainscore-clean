<script lang="ts">
  /**
   * Onboarding Wizard (Extended Flow)
   * 
   * NEUER 7-STEP FLOW (v2.0):
   * Step 0: Welcome Intro (Projekterklärung, Datennutzung, Mehrwert)
   * Step 1: Name eingeben
   * Step 2: Ziele auswählen (max 3)
   * Step 3: Kontexte & Zeiten (max 3, combined)
   * Step 4: Registrierung (E-Mail/Passwort + E-Mail-Opt-in für Forschungs-Updates)
   * Step 5: PWA-Tutorial (iOS/Android Anleitung)
   * Step 6: Summary + erster Test
   * 
   * WICHTIG:
   * - Welcome Step auch für nicht-eingeloggte User sichtbar
   * - Registrierung NACH Ziel/Kontext-Auswahl (niedrigere Abbruchrate)
   * - E-Mail-Opt-in: Sonntags Forschungs-Updates (optional)
   * - PWA-Tutorial VOR erstem Test (bessere UX)
   * - Test-Instruktionen betonen: kein "Versagen", nur Zustandsmessung
   */
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { onboarding } from './onboardingState';
  import { currentUser, isAuthenticated, auth } from '$lib/stores/auth.store';
  import { ProfileService } from '$lib/services/profile.service';
  import WelcomeIntroStep from './WelcomeIntroStep.svelte';
  import ContextAndTimeStep from './ContextAndTimeStep.svelte';
  import PwaHintStep from './PwaHintStep.svelte';
  import OnboardingNavBar from '$lib/components/onboarding/OnboardingNavBar.svelte';
  import { 
    USER_GOAL_LABELS,
    type UserGoal,
    type TrackingContext
  } from './onboardingTypes';
  
  type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  let currentStep = $state<Step>(0);
  let userName = $state('');
  let selectedGoals = $state<UserGoal[]>([]);
  let contexts = $state<TrackingContext[]>([]);
  let isDownloadingICS = $state(false);
  let isSaving = $state(false);
  
  // Step 4: Registration state
  let email = $state('');
  let password = $state('');
  let emailConsentResearchUpdates = $state(false);
  let isRegistering = $state(false);
  let registrationError = $state('');
  let registrationSuccess = $state(false);
  
  // Disable browser scroll restoration for smooth step transitions
  onMount(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      const originalRestoration = history.scrollRestoration;
      history.scrollRestoration = 'manual';
      
      return () => {
        history.scrollRestoration = originalRestoration;
      };
    }
  });
  
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
  
  // Navigation with scroll-to-top
  async function nextStep() {
    // Step 0: Welcome - no validation
    if (currentStep === 0) {
      currentStep = 1;
      await tick();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    
    // Step 1: Name validation
    if (currentStep === 1 && !userName.trim()) {
      alert('Bitte gib deinen Namen ein.');
      return;
    }
    
    // Step 2: Goals validation
    if (currentStep === 2 && selectedGoals.length === 0) {
      alert('Bitte wähle mindestens ein Ziel aus.');
      return;
    }
    
    // Step 3: Contexts validation
    if (currentStep === 3 && contexts.length === 0) {
      alert('Bitte wähle mindestens eine Situation mit Uhrzeit aus.');
      return;
    }
    
    // Step 4: Registration
    if (currentStep === 4) {
      if (!email.trim() || !password.trim()) {
        registrationError = 'Bitte E-Mail und Passwort eingeben';
        return;
      }
      
      isRegistering = true;
      registrationError = '';
      
      try {
        const result = await auth.signUp(
          email, 
          password, 
          userName, 
          emailConsentResearchUpdates
        );
        
        if (result.error) {
          const errorMsg = (result.error as any)?.message || 'Registrierung fehlgeschlagen';
          registrationError = errorMsg === 'User already registered' 
            ? 'Diese E-Mail ist bereits registriert' 
            : errorMsg;
          isRegistering = false;
          return;
        }
        
        registrationSuccess = true;
        // Continue to next step
      } catch (err) {
        registrationError = 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
        isRegistering = false;
        return;
      } finally {
        isRegistering = false;
      }
    }
    
    // Step 5: PWA Hint - no validation
    
    if (currentStep < 6) {
      currentStep = (currentStep + 1) as Step;
      await tick();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }
  
  async function prevStep() {
    if (currentStep > 0) {
      currentStep = (currentStep - 1) as Step;
      await tick();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
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
    await completeOnboarding();
    if (isSaving) return; // Fehler beim Speichern
    
    console.log('✅ Onboarding completed, starting first test...');
    goto('/test');
  }
  
  // Step 4: Complete onboarding and go to dashboard
  async function goToDashboard() {
    await completeOnboarding();
    if (isSaving) return; // Fehler beim Speichern
    
    console.log('✅ Onboarding completed, redirecting to dashboard...');
    goto('/dashboard');
  }
  
  // Shared: Save onboarding data
  async function completeOnboarding() {
    if (!$currentUser) {
      alert('Du musst eingeloggt sein, um fortzufahren.');
      goto('/auth');
      return;
    }
    
    isSaving = true;
    try {
      // Save profile (name + primary goal + email consent)
      const primaryGoal = selectedGoals[0] || 'unsure';
      const { success, error } = await ProfileService.upsertProfile(
        $currentUser.id,
        userName.trim(),
        primaryGoal,
        emailConsentResearchUpdates
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
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="min-h-screen bg-white px-4 py-6 md:py-12 pwa-safe-screen">
  <div class="w-full max-w-2xl mx-auto">
    
    <!-- Progress Indicator -->
    <div class="mb-6 md:mb-8">
      <div class="flex items-center justify-center gap-2 mb-4">
        {#each [0, 1, 2, 3, 4, 5, 6] as step}
          <div class="w-2 h-2 rounded-full {currentStep === step ? 'bg-brand-purple' : currentStep > step ? 'bg-purple-300' : 'bg-gray-200'}"></div>
          {#if step < 6}
            <div class="w-6 h-0.5 bg-gray-300"></div>
          {/if}
        {/each}
      </div>
      <p class="text-center text-sm text-gray-600 font-medium">
        Schritt {currentStep + 1} von 7
      </p>
    </div>

    <!-- Card Container -->
    <div class="card bg-base-200 shadow-lg border border-gray-200">
      <div class="card-body">
        
        <!-- Step 0: Welcome Intro -->
        {#if currentStep === 0}
          <WelcomeIntroStep />
          <div class="mt-6 space-y-3">
            <button 
              onclick={nextStep} 
              class="btn-gradient-primary w-full h-12 md:h-14 text-lg md:text-xl font-black"
            >
              Weiter <span class="ml-2">→</span>
            </button>
            <div class="text-center">
              <button
                onclick={() => goto('/')}
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Zurück zur Startseite
              </button>
            </div>
          </div>
        {/if}
        
        <!-- Step 1: Name -->
        {#if currentStep === 1}
          <div class="space-y-6 md:space-y-8">
            <div class="text-center">
              <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 md:mb-4">
                Wie sollen wir dich nennen?
              </h2>
              <p class="text-gray-600 text-sm md:text-base">
                Dein Name wird nur lokal gespeichert und hilft uns, deine Erfahrung zu personalisieren.
              </p>
            </div>
            <div>
              <input
                id="userName"
                type="text"
                bind:value={userName}
                placeholder="Dein Name"
                class="input input-bordered w-full h-12 md:h-14 text-base md:text-lg font-medium rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                onkeydown={(e) => e.key === 'Enter' && nextStep()}
              />
            </div>
            <OnboardingNavBar 
              onBack={prevStep}
              onNext={nextStep}
              nextDisabled={!userName.trim()}
            />
          </div>
        {/if}
        
        <!-- Step 2: Goals Selection -->
        {#if currentStep === 2}
          <div class="space-y-4 md:space-y-6">
            <div>
              <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3">
                Wobei soll dir BrainrotAI helfen?
              </h2>
              <p class="text-gray-600 text-sm md:text-base">
                Wähle bis zu drei Bereiche, die für dich am wichtigsten sind. Wir nutzen sie, um dein Logbuch und spätere Auswertungen für dich sinnvoller zu gestalten.
              </p>
            </div>
            
            <div class="space-y-3">
              {#each Object.entries(USER_GOAL_LABELS) as [goal, { label, description }]}
                <button
                  onclick={() => toggleGoal(goal as UserGoal)}
                  class="w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all transform hover:-translate-y-1 {
                    selectedGoals.includes(goal as UserGoal)
                      ? 'border-brand-purple bg-brand-purple text-white shadow-lg shadow-purple-500/30'
                      : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'
                  }"
                  disabled={!selectedGoals.includes(goal as UserGoal) && selectedGoals.length >= 3}
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex-1">
                      <div class="font-black text-base md:text-lg">{label}</div>
                      <div class="text-xs md:text-sm text-white/90">{description}</div>
                    </div>
                    {#if selectedGoals.includes(goal as UserGoal)}
                      <span class="material-symbols-outlined text-2xl md:text-3xl">check_circle</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
            
            <div class="text-sm text-gray-700 text-center font-medium">
              {selectedGoals.length} von 3 ausgewählt
            </div>
            
            <OnboardingNavBar 
              onBack={prevStep}
              onNext={nextStep}
              nextDisabled={selectedGoals.length === 0}
            />
          </div>
        {/if}
        
        <!-- Step 3: Context + Time Selection (Combined) -->
        {#if currentStep === 3}
          <ContextAndTimeStep 
            bind:contexts={contexts}
            onContextsChange={handleContextsChange}
          />
          
          <div class="mt-4 md:mt-6">
            <OnboardingNavBar 
              onBack={prevStep}
              onNext={nextStep}
              nextDisabled={contexts.length === 0}
            />
          </div>
        {/if}
        
        <!-- Step 4: Registration -->
        {#if currentStep === 4}
          <div class="space-y-6 md:space-y-8">
            <div class="text-center">
              <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Account erstellen
              </h2>
              <p class="text-gray-600 text-sm md:text-base">
                Erstelle deinen Account, um deine Tests und Fortschritte zu speichern.
              </p>
            </div>
            
            <!-- Registration Form -->
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-bold text-gray-900 mb-2">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  placeholder="deine@email.de"
                  class="input input-bordered w-full h-12 rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-bold text-gray-900 mb-2">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  placeholder="Mindestens 6 Zeichen"
                  class="input input-bordered w-full h-12 rounded-xl bg-gray-50 border-gray-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>
              
              <!-- Email Consent for Research Updates -->
              <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  id="emailConsent"
                  type="checkbox"
                  bind:checked={emailConsentResearchUpdates}
                  class="checkbox checkbox-primary mt-0.5"
                />
                <label for="emailConsent" class="flex-1 text-sm text-gray-900 cursor-pointer">
                  <span class="font-bold">Ich möchte regelmäßig per E-Mail eine kurze Zusammenfassung der aktuellen Forschungsergebnisse und Erkenntnisse aus BrainrotAI erhalten.</span>
                  <span class="block text-xs text-gray-600 mt-1">Optional. Jederzeit änderbar in den Einstellungen.</span>
                </label>
              </div>
              
              {#if registrationError}
                <div class="alert alert-error">
                  <span class="material-symbols-outlined">error</span>
                  <span>{registrationError}</span>
                </div>
              {/if}
            </div>
            
            <OnboardingNavBar 
              onBack={prevStep}
              onNext={nextStep}
              nextLabel={isRegistering ? 'Wird erstellt...' : 'Account erstellen'}
              nextDisabled={isRegistering}
            />
          </div>
        {/if}
        
        <!-- Step 5: PWA Tutorial -->
        {#if currentStep === 5}
          <PwaHintStep />
          <div class="mt-6">
            <OnboardingNavBar 
              onBack={prevStep}
              onNext={nextStep}
              nextLabel="Verstanden"
            />
          </div>
        {/if}
        
        <!-- Step 6: Summary & Actions -->
        {#if currentStep === 6}
          <div class="space-y-4 md:space-y-6">
            <div>
              <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3">Alles bereit!</h2>
              <p class="text-gray-600 text-base">
                Bevor es losgeht: Probiere den Test einmal aus – in einem kurzen Tutorial-Modus.
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
              <!-- Kalender-Reminder (Sekundär) -->
              <button
                onclick={downloadICS}
                class="w-full h-12 md:h-14 px-6 rounded-xl font-bold text-sm md:text-base border-2 border-gray-300 hover:border-brand-purple hover:bg-brand-purple/5 transition-all active:scale-95"
                disabled={isDownloadingICS}
              >
                {#if isDownloadingICS}
                  <span class="loading loading-spinner"></span>
                  Erstelle Kalender...
                {:else}
                  Kalender-Reminder hinzufügen
                {/if}
              </button>
              
              <!-- Tutorial CTA (Primär) -->
              <button
                onclick={async () => {
                  await completeOnboarding();
                  if (!isSaving) goto('/test/tutorial');
                }}
                class="btn-gradient-primary w-full h-12 md:h-14 text-base md:text-lg font-black"
                disabled={isSaving}
              >
                {#if isSaving}
                  <span class="loading loading-spinner"></span>
                  Speichere...
                {:else}
                  Test-Tutorial starten
                {/if}
              </button>
              
              <!-- Skip Link (Tertiary) -->
              <div class="text-center mt-4">
                <button
                  onclick={goToDashboard}
                  class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isSaving}
                >
                  Tutorial überspringen – direkt zum Dashboard
                </button>
              </div>
            </div>
            
            <div class="mt-6">
              <OnboardingNavBar 
                onBack={prevStep}
                showNext={false}
              />
            </div>
          </div>
        {/if}

      </div>
    </div>

  </div>
</div>
