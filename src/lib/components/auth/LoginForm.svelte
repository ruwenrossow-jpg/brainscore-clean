/**
 * Login Form
 * E-Mail + Passwort Login
 */

<script lang="ts">
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  import { auth } from '$lib/stores/auth.store';
  import { goto } from '$app/navigation';
  
  interface Props {
    onSwitchToRegister?: () => void;
  }
  
  let { onSwitchToRegister }: Props = $props();
  
  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let errorMessage = $state('');
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!email || !password) {
      errorMessage = 'Bitte alle Felder ausfüllen';
      return;
    }
    
    console.log('🔑 [LoginForm] Submit started');
    const submitStart = performance.now();
    
    isLoading = true;
    errorMessage = '';
    
    try {
      console.log('🔑 [LoginForm] Calling auth.signIn...');
      const signInStart = performance.now();
      const result = await auth.signIn(email, password);
      const signInDuration = performance.now() - signInStart;
      console.log(`🔑 [LoginForm] auth.signIn completed: ${signInDuration.toFixed(0)}ms`);
      
      if (result.error) {
        console.error('❌ [LoginForm] Login failed:', result.error);
        errorMessage = 'Login fehlgeschlagen. Bitte Zugangsdaten prüfen.';
        isLoading = false;
      } else {
        console.log('✅ [LoginForm] Login success! Navigating to /dashboard...');
        const navStart = performance.now();
        goto('/dashboard');
        console.log(`📤 [LoginForm] Navigation triggered: ${(performance.now() - navStart).toFixed(0)}ms`);
        const totalDuration = performance.now() - submitStart;
        console.log(`🏁 [LoginForm] Total login flow: ${totalDuration.toFixed(0)}ms`);
      }
    } catch (e: any) {
      console.error('💥 [LoginForm] Exception:', e);
      errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      isLoading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 mt-6">
  
  {#if errorMessage}
    <div class="alert alert-error bg-red-50 border border-red-200 rounded-lg p-3">
      <span class="text-sm text-red-700">{errorMessage}</span>
    </div>
  {/if}
  
  <div class="form-control w-full">
    <label class="label" for="email">
      <span class="label-text text-black font-medium">E-Mail</span>
    </label>
    <input 
      id="email" 
      type="email" 
      placeholder="deine@email.com"
      class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
      bind:value={email}
      disabled={isLoading}
      required
    />
  </div>

  <div class="form-control w-full">
    <label class="label" for="password">
      <span class="label-text text-black font-medium">Passwort</span>
    </label>
    <input 
      id="password" 
      type="password" 
      placeholder="••••••••"
      class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
      bind:value={password}
      disabled={isLoading}
      required
    />
  </div>

  <BaseButton 
    type="submit"
    variant="primary" 
    size="lg" 
    fullWidth={true}
    loading={isLoading}
    disabled={isLoading}
  >
    Einloggen
  </BaseButton>

  {#if onSwitchToRegister}
    <div class="text-center mt-4">
      <p class="text-sm text-gray-600">
        Noch kein Account? 
        <button 
          type="button"
          class="text-black font-semibold hover:underline"
          onclick={onSwitchToRegister}
        >
          Jetzt registrieren
        </button>
      </p>
    </div>
  {/if}

</form>
