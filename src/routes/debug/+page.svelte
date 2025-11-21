<script lang="ts">
  /**
   * Auth Debug Page
   * Zum Testen der Supabase-Verbindung
   */
  import { supabase } from '$lib/services/supabase.client';
  import { onMount } from 'svelte';
  
  let connectionStatus = $state('Testing...');
  let sessionInfo = $state<any>(null);
  let testResult = $state('');
  
  onMount(async () => {
    // Test 1: Verbindung
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        connectionStatus = '❌ Verbindungsfehler: ' + error.message;
      } else {
        connectionStatus = '✅ Verbindung OK';
        sessionInfo = data.session;
      }
    } catch (e) {
      connectionStatus = '❌ Exception: ' + e;
    }
  });
  
  async function testSignUp() {
    testResult = '⏳ Testing Sign Up...';
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
        options: {
          data: { name: 'Test User' }
        }
      });
      
      if (error) {
        testResult = '❌ Sign Up Error: ' + error.message;
      } else {
        testResult = '✅ Sign Up OK! User: ' + data.user?.email;
      }
    } catch (e: any) {
      testResult = '❌ Exception: ' + e.message;
    }
  }
  
  async function testSignIn() {
    const email = (document.getElementById('testEmail') as HTMLInputElement).value;
    const password = (document.getElementById('testPassword') as HTMLInputElement).value;
    
    if (!email || !password) {
      testResult = '❌ Bitte E-Mail und Passwort eingeben';
      return;
    }
    
    testResult = '⏳ Testing Sign In...';
    try {
      console.log('🔍 Attempting login with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('📥 Login response:', { data, error });
      
      if (error) {
        testResult = `❌ Sign In Error: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`;
      } else if (data.user) {
        // Check if email is confirmed
        const emailConfirmed = data.user.email_confirmed_at ? '✅ Bestätigt' : '❌ NICHT bestätigt';
        testResult = `✅ Sign In OK!\n\nUser: ${data.user.email}\nE-Mail: ${emailConfirmed}\nUser ID: ${data.user.id}\n\nSession Token: ${data.session?.access_token?.substring(0, 20)}...`;
      } else {
        testResult = '❌ Unerwartete Antwort: User ist null';
      }
    } catch (e: any) {
      console.error('💥 Exception:', e);
      testResult = `❌ Exception: ${e.message}\n\nStack: ${e.stack}`;
    }
  }
  
  async function checkEnvVars() {
    testResult = '⏳ Checking Environment Variables...';
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_KEY;
      
      testResult = `📋 Environment Check:\n\n` +
                   `URL: ${url ? '✅ Set (' + url.substring(0, 30) + '...)' : '❌ Missing'}\n` +
                   `KEY: ${key ? '✅ Set (' + key.substring(0, 20) + '...)' : '❌ Missing'}\n\n` +
                   `Current Origin: ${window.location.origin}`;
    } catch (e: any) {
      testResult = '❌ Exception: ' + e.message;
    }
  }
</script>

<div class="container mx-auto px-4 py-12 max-w-2xl">
  <h1 class="text-3xl font-bold mb-8">🔍 Auth Debug Tool</h1>
  
  <!-- Connection Status -->
  <div class="card bg-base-200 shadow-lg mb-6">
    <div class="card-body">
      <h2 class="card-title">Connection Status</h2>
      <p class="font-mono">{connectionStatus}</p>
      
      {#if sessionInfo}
        <div class="mt-4">
          <h3 class="font-semibold mb-2">Current Session:</h3>
          <pre class="bg-white p-4 rounded text-xs overflow-auto">{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>
      {:else}
        <p class="text-gray-600 mt-2">Keine aktive Session</p>
      {/if}
    </div>
  </div>
  
  <!-- Check Environment -->
  <div class="card bg-base-200 shadow-lg mb-6">
    <div class="card-body">
      <h2 class="card-title">Environment Check</h2>
      <p class="text-sm text-gray-600 mb-4">
        Überprüfe Supabase Credentials
      </p>
      <button class="btn btn-secondary" onclick={checkEnvVars}>
        Check Environment
      </button>
    </div>
  </div>
  
  <!-- Test Sign Up -->
  <div class="card bg-base-200 shadow-lg mb-6">
    <div class="card-body">
      <h2 class="card-title">Test Sign Up</h2>
      <p class="text-sm text-gray-600 mb-4">
        Erstellt einen Test-User mit zufälliger E-Mail
      </p>
      <button class="btn btn-primary" onclick={testSignUp}>
        Test Sign Up
      </button>
    </div>
  </div>
  
  <!-- Test Sign In -->
  <div class="card bg-base-200 shadow-lg mb-6">
    <div class="card-body">
      <h2 class="card-title">Test Sign In</h2>
      <div class="space-y-4">
        <input 
          id="testEmail"
          type="email" 
          placeholder="E-Mail"
          class="input input-bordered w-full"
        />
        <input 
          id="testPassword"
          type="password" 
          placeholder="Passwort"
          class="input input-bordered w-full"
        />
        <button class="btn btn-primary" onclick={testSignIn}>
          Test Sign In
        </button>
      </div>
    </div>
  </div>
  
  <!-- Test Result -->
  {#if testResult}
    <div class="alert {testResult.startsWith('✅') ? 'alert-success' : 'alert-error'} mb-6">
      <pre class="text-sm whitespace-pre-wrap">{testResult}</pre>
    </div>
  {/if}
  
  <!-- Troubleshooting -->
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <h2 class="card-title">🔧 Troubleshooting</h2>
      <ul class="space-y-2 text-sm">
        <li><strong>E-Mail bereits verwendet:</strong> User im Supabase Dashboard löschen</li>
        <li><strong>Login funktioniert nicht:</strong> E-Mail-Bestätigung prüfen (email_confirmed_at)</li>
        <li><strong>Kein Response:</strong> .env Credentials prüfen</li>
        <li><strong>CORS Error:</strong> Site URL in Supabase korrekt?</li>
      </ul>
    </div>
  </div>
  
  <div class="mt-6 text-center">
    <a href="/" class="btn btn-ghost" data-sveltekit-preload-data="hover">← Zurück zur Startseite</a>
  </div>
</div>
