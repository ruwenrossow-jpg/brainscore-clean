<script lang="ts">
  /**
   * DEBUG TOOL: Profile Onboarding Fix
   * 
   * Für bestehende User die im Onboarding-Loop hängen
   * Setzt onboarding_completed auf true
   */
  import { goto } from '$app/navigation';
  import { currentUser } from '$lib/stores/auth.store';
  import { supabase } from '$lib/services/supabase.client';
  import { onMount } from 'svelte';
  
  let loading = $state(false);
  let profileData = $state<any>(null);
  let message = $state('');
  let error = $state('');
  
  onMount(async () => {
    if ($currentUser) {
      await loadProfile();
    }
  });
  
  async function loadProfile() {
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', $currentUser!.id)
        .single();
      
      if (err) throw err;
      profileData = data;
    } catch (e: any) {
      error = e.message;
    }
  }
  
  async function fixProfile() {
    if (!$currentUser) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const { error: err } = await supabase
        .from('profiles')
        .upsert({
          id: $currentUser.id,
          name: profileData?.name || $currentUser.email?.split('@')[0] || 'User',
          onboarding_completed: true,
          data_consent: true
        } as any, {
          onConflict: 'id'
        });
      
      if (err) throw err;
      
      message = '✅ Profil erfolgreich aktualisiert!';
      await loadProfile();
      
      // Nach 2 Sekunden zum Dashboard
      setTimeout(() => {
        goto('/dashboard');
      }, 2000);
    } catch (e: any) {
      error = '❌ Fehler: ' + e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-12 max-w-2xl">
  <div class="mb-8">
    <button onclick={() => goto('/debug')} class="btn btn-ghost btn-sm">
      ← Zurück zu Debug
    </button>
  </div>
  
  <h1 class="text-3xl font-bold mb-2">🔧 Profile Onboarding Fix</h1>
  <p class="text-gray-600 mb-8">
    Tool für bestehende User, die im Onboarding-Loop hängen
  </p>
  
  {#if !$currentUser}
    <div class="alert alert-warning">
      <span>⚠️ Nicht eingeloggt. Bitte zuerst einloggen.</span>
    </div>
  {:else}
    
    <!-- Current Profile Status -->
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Aktueller Profil-Status</h2>
        
        {#if profileData}
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="font-semibold">User ID:</span>
              <span class="font-mono text-xs">{profileData.id}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Name:</span>
              <span>{profileData.name || '-'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">E-Mail:</span>
              <span>{$currentUser.email}</span>
            </div>
            <div class="divider my-2"></div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Onboarding Status:</span>
              <span class="badge {profileData.onboarding_completed ? 'badge-success' : 'badge-error'}">
                {profileData.onboarding_completed ? '✅ Abgeschlossen' : '❌ Nicht abgeschlossen'}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Data Consent:</span>
              <span class="badge {profileData.data_consent ? 'badge-success' : 'badge-warning'}">
                {profileData.data_consent ? '✅ Ja' : '⚠️ Nein'}
              </span>
            </div>
          </div>
        {:else}
          <div class="loading loading-spinner"></div>
        {/if}
      </div>
    </div>
    
    <!-- Problem Explanation -->
    {#if profileData && !profileData.onboarding_completed}
      <div class="alert alert-warning mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="font-bold">Problem erkannt!</h3>
          <div class="text-sm">
            Dein Profil hat <code>onboarding_completed: false</code>, deshalb landest du immer im Onboarding.
            <br>Das passiert bei bestehenden Accounts nach Code-Updates.
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Fix Button -->
    {#if profileData && !profileData.onboarding_completed}
      <div class="card bg-primary text-primary-content shadow-lg mb-6">
        <div class="card-body">
          <h2 class="card-title">Lösung: Onboarding als abgeschlossen markieren</h2>
          <p class="text-sm opacity-90">
            Dieser Button setzt <code>onboarding_completed: true</code> in deinem Profil.
            Danach kannst du normal weiterarbeiten.
          </p>
          <div class="card-actions justify-end mt-4">
            <button 
              class="btn btn-neutral"
              onclick={fixProfile}
              disabled={loading}
            >
              {#if loading}
                <span class="loading loading-spinner"></span>
                Aktualisiere...
              {:else}
                🔧 Profil jetzt fixen
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    {#if profileData && profileData.onboarding_completed}
      <div class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">Alles OK!</h3>
          <div class="text-sm">
            Dein Profil ist korrekt konfiguriert. Du solltest normal auf das Dashboard zugreifen können.
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Messages -->
    {#if message}
      <div class="alert alert-success mb-6">
        <span>{message}</span>
      </div>
    {/if}
    
    {#if error}
      <div class="alert alert-error mb-6">
        <span>{error}</span>
      </div>
    {/if}
    
    <!-- Info Box -->
    <div class="card bg-base-200 shadow-sm">
      <div class="card-body">
        <h3 class="font-semibold mb-2">ℹ️ Was macht dieses Tool?</h3>
        <ul class="text-sm space-y-1 list-disc list-inside text-gray-600">
          <li>Zeigt den aktuellen Status deines Profils</li>
          <li>Erkennt ob <code>onboarding_completed</code> fehlt/false ist</li>
          <li>Bietet Ein-Klick-Fix an</li>
          <li>Leitet dich automatisch zum Dashboard weiter</li>
        </ul>
        <div class="divider my-2"></div>
        <p class="text-xs text-gray-500">
          💡 <strong>Tipp:</strong> Nach dem Fix kannst du dieses Tool wieder schließen. 
          Es ist nur für bestehende User gedacht, die nach einem Code-Update im Onboarding-Loop hängen.
        </p>
      </div>
    </div>
  {/if}
</div>
