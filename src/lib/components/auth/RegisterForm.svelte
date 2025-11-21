/**
 * Register Form
 * E-Mail + Passwort + Name Registrierung
 */

<script lang="ts">
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  import { auth } from '$lib/stores/auth.store';
  
  interface Props {
    onSwitchToLogin?: () => void;
  }
  
  let { onSwitchToLogin }: Props = $props();
  
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let isLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!email || !password || !name) {
      errorMessage = 'Bitte alle Felder ausfüllen';
      return;
    }
    
    if (password.length < 6) {
      errorMessage = 'Passwort muss mindestens 6 Zeichen lang sein';
      return;
    }
    
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    
    const { error, requiresEmailConfirmation } = await auth.signUp(email, password, name);
    
    isLoading = false;
    
    if (error) {
      errorMessage = 'Registrierung fehlgeschlagen. E-Mail bereits registriert?';
    } else if (requiresEmailConfirmation) {
      successMessage = '✅ Registrierung erfolgreich! Bitte bestätige deine E-Mail.';
      // Form zurücksetzen
      email = '';
      password = '';
      name = '';
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 mt-6">
  
  {#if errorMessage}
    <div class="alert alert-error bg-red-50 border border-red-200 rounded-lg p-3">
      <span class="text-sm text-red-700">{errorMessage}</span>
    </div>
  {/if}
  
  {#if successMessage}
    <div class="alert alert-success bg-green-50 border border-green-200 rounded-lg p-3">
      <span class="text-sm text-green-700">{successMessage}</span>
    </div>
  {/if}
  
  <div class="form-control w-full">
    <label class="label" for="name">
      <span class="label-text text-black font-medium">Name</span>
    </label>
    <input 
      id="name" 
      type="text" 
      placeholder="Max Mustermann"
      class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
      bind:value={name}
      disabled={isLoading}
      required
    />
  </div>

  <div class="form-control w-full">
    <label class="label" for="email-reg">
      <span class="label-text text-black font-medium">E-Mail</span>
    </label>
    <input 
      id="email-reg" 
      type="email" 
      placeholder="deine@email.com"
      class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
      bind:value={email}
      disabled={isLoading}
      required
    />
  </div>

  <div class="form-control w-full">
    <label class="label" for="password-reg">
      <span class="label-text text-black font-medium">Passwort</span>
      <span class="label-text-alt text-gray-500">Min. 6 Zeichen</span>
    </label>
    <input 
      id="password-reg" 
      type="password" 
      placeholder="••••••••"
      class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
      bind:value={password}
      disabled={isLoading}
      required
      minlength="6"
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
    Registrieren
  </BaseButton>

  {#if onSwitchToLogin}
    <div class="text-center mt-4">
      <p class="text-sm text-gray-600">
        Bereits registriert? 
        <button 
          type="button"
          class="text-black font-semibold hover:underline"
          onclick={onSwitchToLogin}
        >
          Jetzt einloggen
        </button>
      </p>
    </div>
  {/if}

</form>
