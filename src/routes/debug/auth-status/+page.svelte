<script lang="ts">
  /**
   * Auth Status Debug Page
   * Zeigt aktuellen Auth-Status ohne Redirects
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/services/supabase.client';
  
  let loading = $state(true);
  let session = $state<any>(null);
  let profile = $state<any>(null);
  let error = $state('');
  
  onMount(async () => {
    await checkStatus();
  });
  
  async function checkStatus() {
    loading = true;
    error = '';
    
    try {
      // Check Session
      const { data: { session: sess }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;
      session = sess;
      
      if (session) {
        // Check Profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profErr && profErr.code !== 'PGRST116') {
          error = 'Profile Error: ' + profErr.message;
        }
        profile = prof;
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  async function doLogin() {
    const email = (document.getElementById('testEmail') as HTMLInputElement).value;
    const password = (document.getElementById('testPw') as HTMLInputElement).value;
    
    if (!email || !password) {
      error = 'Bitte E-Mail und Passwort eingeben';
      return;
    }
    
    loading = true;
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      await checkStatus();
    } catch (e: any) {
      error = 'Login Error: ' + e.message;
      loading = false;
    }
  }
  
  async function doLogout() {
    loading = true;
    try {
      await supabase.auth.signOut();
      session = null;
      profile = null;
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-12 max-w-3xl">
  <h1 class="text-3xl font-bold mb-8">🔍 Auth Status Debug</h1>
  
  <div class="mb-4">
    <button class="btn btn-ghost btn-sm" onclick={() => goto('/debug')}>
      ← Zurück zu Debug
    </button>
  </div>
  
  {#if loading}
    <div class="alert">
      <span class="loading loading-spinner"></span>
      <span>Loading...</span>
    </div>
  {:else}
    
    <!-- Session Status -->
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Session Status</h2>
        {#if session}
          <div class="alert alert-success">
            <span>✅ Eingeloggt als: {session.user.email}</span>
          </div>
          <div class="text-sm space-y-1 mt-4">
            <div><strong>User ID:</strong> <code class="text-xs">{session.user.id}</code></div>
            <div><strong>Email Verified:</strong> {session.user.email_confirmed_at ? '✅ Ja' : '❌ Nein'}</div>
            <div><strong>Created:</strong> {new Date(session.user.created_at).toLocaleString()}</div>
          </div>
          <div class="card-actions mt-4">
            <button class="btn btn-error btn-sm" onclick={doLogout}>Logout</button>
          </div>
        {:else}
          <div class="alert alert-warning">
            <span>⚠️ Nicht eingeloggt</span>
          </div>
          
          <!-- Quick Login -->
          <div class="mt-4 space-y-2">
            <input 
              id="testEmail"
              type="email" 
              placeholder="E-Mail"
              class="input input-bordered input-sm w-full"
            />
            <input 
              id="testPw"
              type="password" 
              placeholder="Passwort"
              class="input input-bordered input-sm w-full"
            />
            <button class="btn btn-primary btn-sm" onclick={doLogin}>
              Login
            </button>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Profile Status -->
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Profile Status</h2>
        {#if !session}
          <p class="text-gray-600">Nicht eingeloggt - kein Profil geladen</p>
        {:else if profile}
          <div class="alert alert-success">
            <span>✅ Profil gefunden</span>
          </div>
          <div class="text-sm space-y-1 mt-4">
            <div><strong>Name:</strong> {profile.name || '-'}</div>
            <div><strong>Goal:</strong> {profile.goal || '-'}</div>
            <div>
              <strong>Onboarding Status:</strong> 
              <span class="badge {profile.onboarding_completed ? 'badge-success' : 'badge-error'}">
                {profile.onboarding_completed ? '✅ Abgeschlossen' : '❌ Nicht abgeschlossen'}
              </span>
            </div>
            <div>
              <strong>Data Consent:</strong> 
              <span class="badge {profile.data_consent ? 'badge-success' : 'badge-warning'}">
                {profile.data_consent ? '✅ Ja' : '⚠️ Nein'}
              </span>
            </div>
          </div>
        {:else}
          <div class="alert alert-error">
            <span>❌ Kein Profil gefunden</span>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            User ist eingeloggt, aber hat kein Profil in der DB.
            → Sollte zu Onboarding weitergeleitet werden.
          </p>
        {/if}
      </div>
    </div>
    
    <!-- Expected Behavior -->
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Expected Behavior</h2>
        {#if !session}
          <p class="text-sm">➡️ Bei Navigation zu <code>/</code> → Landing Page zeigen</p>
        {:else if !profile}
          <p class="text-sm">➡️ Bei Navigation zu <code>/</code> → Redirect zu <code>/onboarding</code></p>
        {:else if !profile.onboarding_completed}
          <p class="text-sm">➡️ Bei Navigation zu <code>/</code> → Redirect zu <code>/onboarding</code></p>
        {:else}
          <p class="text-sm">➡️ Bei Navigation zu <code>/</code> → Redirect zu <code>/dashboard</code></p>
        {/if}
        
        <div class="card-actions mt-4">
          <button class="btn btn-sm" onclick={() => goto('/')}>
            Test: Gehe zu /
          </button>
          <button class="btn btn-sm" onclick={() => goto('/dashboard')}>
            Test: Gehe zu /dashboard
          </button>
          <button class="btn btn-sm" onclick={() => goto('/onboarding')}>
            Test: Gehe zu /onboarding
          </button>
        </div>
      </div>
    </div>
    
    <!-- Error Display -->
    {#if error}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {/if}
    
    <!-- Refresh -->
    <div class="text-center mt-6">
      <button class="btn btn-outline btn-sm" onclick={checkStatus}>
        🔄 Status neu laden
      </button>
    </div>
  {/if}
</div>
