/**
 * Auth Page
 * Kombinierte Login/Register Seite mit Tabs
 */

<script lang="ts">
  import AuthCard from '$lib/components/auth/AuthCard.svelte';
  import LoginForm from '$lib/components/auth/LoginForm.svelte';
  import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
  
  type AuthMode = 'login' | 'register';
  let mode = $state<AuthMode>('login');
</script>

<svelte:head>
  <title>Login - BrainScore</title>
</svelte:head>

<div class="min-h-screen bg-white flex items-center justify-center px-4 py-12">
  
  <div class="w-full max-w-md">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <a href="/" class="inline-block">
        <h1 class="text-4xl font-bold text-black mb-2">BrainScore</h1>
      </a>
      <p class="text-gray-600">Cognitive Performance Testing</p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-300 mb-6">
      <button
        class="flex-1 py-3 text-center font-semibold transition-colors
               {mode === 'login' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => (mode = 'login')}
      >
        Einloggen
      </button>
      <button
        class="flex-1 py-3 text-center font-semibold transition-colors
               {mode === 'register' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => (mode = 'register')}
      >
        Registrieren
      </button>
    </div>

    <!-- Card mit Form -->
    <div class="card bg-base-200 shadow-lg border border-gray-200">
      <div class="card-body">
        
        {#if mode === 'login'}
          <LoginForm onSwitchToRegister={() => (mode = 'register')} />
        {:else}
          <RegisterForm onSwitchToLogin={() => (mode = 'login')} />
        {/if}

      </div>
    </div>

    <!-- Back to Home -->
    <div class="text-center mt-6">
      <a href="/" class="text-sm text-gray-600 hover:text-black">
        ← Zurück zur Startseite
      </a>
    </div>

  </div>

</div>
