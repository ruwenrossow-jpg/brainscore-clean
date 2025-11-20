<script lang="ts">
  /**
   * Screentime Form - Manuelle Eingabe der Smartphone-Nutzung
   */
  
  import BaseCard from '$lib/components/base/BaseCard.svelte';
  import BaseButton from '$lib/components/base/BaseButton.svelte';
  import { SartService } from '$lib/services/sart.service';
  import { currentUser } from '$lib/stores/auth.store';
  
  interface Props {
    sessionId: string | null;
    onComplete: () => void;
  }
  
  let { sessionId, onComplete }: Props = $props();
  
  // Bildschirmzeit
  let hours = $state(0);
  let minutes = $state(0);
  let activations = $state(0);
  
  // Top 3 Apps
  let app1Name = $state('');
  let app1Activations = $state(0);
  let app2Name = $state('');
  let app2Activations = $state(0);
  let app3Name = $state('');
  let app3Activations = $state(0);
  
  let isLoading = $state(false);
  let statusMessage = $state('');
  
  let totalMinutes = $derived(hours * 60 + minutes);
  
  async function handleSave() {
    if (!sessionId) {
      statusMessage = '❌ Fehler: Keine Session-ID';
      return;
    }
    
    isLoading = true;
    statusMessage = '⏳ Speichere...';
    
    const success = await SartService.saveScreentimeReport(
      sessionId,
      totalMinutes,
      activations,
      $currentUser?.id,
      app1Name || undefined,
      app1Activations || undefined,
      app2Name || undefined,
      app2Activations || undefined,
      app3Name || undefined,
      app3Activations || undefined
    );
    
    isLoading = false;
    
    if (success) {
      statusMessage = '✅ Gespeichert!';
      setTimeout(onComplete, 800);
    } else {
      statusMessage = '❌ Fehler beim Speichern';
    }
  }
</script>

<BaseCard title="Screentime-Analyse" subtitle="Letzter Schritt (optional)" centered={true} maxWidth="lg">
  
  <div class="space-y-6 mt-6">
    
    <div class="bg-white p-4 rounded-lg border border-gray-300">
      <p class="text-sm text-gray-700 text-center">
        📱 Trage deine Smartphone-Nutzung der <strong>letzten 24 Stunden</strong> ein.<br/>
        <span class="text-xs text-gray-500">Zu finden in den Einstellungen unter "Bildschirmzeit" oder "Digitales Wohlbefinden"</span>
      </p>
    </div>

    <!-- Bildschirmzeit -->
    <div class="space-y-4">
      <h3 class="font-semibold text-lg text-black">📊 Bildschirmzeit</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label" for="hours">
            <span class="label-text text-black font-medium">Stunden</span>
          </label>
          <input 
            id="hours" 
            type="number" 
            min="0"
            max="24"
            placeholder="z.B. 3"
            class="input input-bordered w-full text-lg bg-white border-gray-300 focus:border-black" 
            bind:value={hours} 
          />
        </div>

        <div class="form-control w-full">
          <label class="label" for="minutes">
            <span class="label-text text-black font-medium">Minuten</span>
          </label>
          <input 
            id="minutes" 
            type="number" 
            min="0"
            max="59"
            placeholder="z.B. 45"
            class="input input-bordered w-full text-lg bg-white border-gray-300 focus:border-black" 
            bind:value={minutes} 
          />
        </div>
      </div>

      {#if totalMinutes > 0}
        <div class="text-center p-2 bg-gray-100 rounded">
          <p class="text-sm text-gray-600">Gesamt: <strong>{totalMinutes} Minuten</strong></p>
        </div>
      {/if}

      <div class="form-control w-full">
        <label class="label" for="activations">
          <span class="label-text text-black font-medium">Aktivierungen</span>
          <span class="label-text-alt text-gray-500">Wie oft das Handy entsperrt wurde</span>
        </label>
        <input 
          id="activations" 
          type="number" 
          min="0"
          placeholder="z.B. 65"
          class="input input-bordered w-full text-lg bg-white border-gray-300 focus:border-black" 
          bind:value={activations} 
        />
      </div>
    </div>

    <div class="divider my-2"></div>

    <!-- Top 3 Apps -->
    <div class="space-y-4">
      <h3 class="font-semibold text-lg text-black">📱 Top 3 Apps (optional)</h3>
      <p class="text-xs text-gray-500">Die Apps mit den meisten Aktivierungen</p>
      
      <!-- App 1 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label" for="app1">
            <span class="label-text text-black">1. App-Name</span>
          </label>
          <input 
            id="app1" 
            type="text" 
            placeholder="z.B. Instagram"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app1Name} 
          />
        </div>
        <div class="form-control w-full">
          <label class="label" for="app1Act">
            <span class="label-text text-black">Aktivierungen</span>
          </label>
          <input 
            id="app1Act" 
            type="number" 
            min="0"
            placeholder="z.B. 25"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app1Activations} 
          />
        </div>
      </div>

      <!-- App 2 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label" for="app2">
            <span class="label-text text-black">2. App-Name</span>
          </label>
          <input 
            id="app2" 
            type="text" 
            placeholder="z.B. WhatsApp"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app2Name} 
          />
        </div>
        <div class="form-control w-full">
          <label class="label" for="app2Act">
            <span class="label-text text-black">Aktivierungen</span>
          </label>
          <input 
            id="app2Act" 
            type="number" 
            min="0"
            placeholder="z.B. 18"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app2Activations} 
          />
        </div>
      </div>

      <!-- App 3 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label" for="app3">
            <span class="label-text text-black">3. App-Name</span>
          </label>
          <input 
            id="app3" 
            type="text" 
            placeholder="z.B. TikTok"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app3Name} 
          />
        </div>
        <div class="form-control w-full">
          <label class="label" for="app3Act">
            <span class="label-text text-black">Aktivierungen</span>
          </label>
          <input 
            id="app3Act" 
            type="number" 
            min="0"
            placeholder="z.B. 12"
            class="input input-bordered w-full bg-white border-gray-300 focus:border-black" 
            bind:value={app3Activations} 
          />
        </div>
      </div>
    </div>

    {#if statusMessage}
      <div class="text-center p-3 bg-gray-100 rounded-lg">
        <p class="text-sm font-medium">{statusMessage}</p>
      </div>
    {/if}

    <BaseButton 
      variant="primary" 
      size="lg" 
      fullWidth={true} 
      onclick={handleSave}
      loading={isLoading}
      disabled={isLoading}
    >
      Speichern & Abschließen
    </BaseButton>

    <button 
      class="btn btn-ghost btn-sm w-full text-gray-600"
      onclick={onComplete}
      disabled={isLoading}
    >
      Überspringen
    </button>

  </div>

</BaseCard>
