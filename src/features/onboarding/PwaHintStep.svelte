<script lang="ts">
  /**
   * PWA Hint Step - Tutorial zum Homescreen-Icon
   * 
   * Zeigt iOS und Android Anleitungen für PWA-Installation
   */
  
  type Platform = 'ios' | 'android';
  let activePlatform = $state<Platform>('ios');
</script>

<div class="space-y-5 md:space-y-6">
  <!-- Header -->
  <div class="text-center">
    <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3">
      Nutze BrainrotAI wie eine App
    </h2>
    <p class="text-sm md:text-base text-gray-600 leading-relaxed">
      Du kannst BrainrotAI auf deinem Startbildschirm ablegen, damit du deinen Test mit zwei Taps starten kannst.
    </p>
  </div>
  
  <!-- Platform Tabs -->
  <div class="flex gap-2 p-1 bg-gray-100 rounded-lg">
    <button
      onclick={() => activePlatform = 'ios'}
      class="flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-all {
        activePlatform === 'ios'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }"
    >
      <span class="material-symbols-outlined text-lg align-middle mr-1">phone_iphone</span>
      iPhone
    </button>
    <button
      onclick={() => activePlatform = 'android'}
      class="flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-all {
        activePlatform === 'android'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }"
    >
      <span class="material-symbols-outlined text-lg align-middle mr-1">phone_android</span>
      Android
    </button>
  </div>
  
  <!-- iOS Instructions -->
  {#if activePlatform === 'ios'}
    <div class="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200 animate-fadeIn">
      <h3 class="font-black text-lg text-gray-900 mb-4">So geht's auf dem iPhone:</h3>
      <ol class="space-y-3 text-sm md:text-base text-gray-700">
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span class="pt-0.5">Öffne <strong class="text-gray-900">BrainrotAI in Safari</strong> (nicht Chrome oder Firefox).</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <span class="pt-0.5">Tippe unten auf das <strong class="text-gray-900">Teilen-Symbol</strong> 
            <span class="inline-flex items-center mx-1">
              <svg class="w-4 h-4 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
            </span>.
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <span class="pt-0.5">Wähle <strong class="text-gray-900">"Zum Home-Bildschirm"</strong> aus.</span>
        </li>
      </ol>
      
      <div class="mt-4 p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/20">
        <div class="flex items-start gap-2 text-xs text-gray-700">
          <span class="material-symbols-outlined text-brand-purple text-sm flex-shrink-0 mt-0.5">info</span>
          <p>Nach der Installation erscheint das BrainrotAI-Icon auf deinem Homescreen. Du kannst es dann wie jede andere App öffnen – ohne Browser-Leiste.</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Android Instructions -->
  {#if activePlatform === 'android'}
    <div class="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200 animate-fadeIn">
      <h3 class="font-black text-lg text-gray-900 mb-4">So geht's auf Android:</h3>
      <ol class="space-y-3 text-sm md:text-base text-gray-700">
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span class="pt-0.5">Öffne <strong class="text-gray-900">BrainrotAI in Chrome</strong>.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <span class="pt-0.5">Tippe oben rechts auf das <strong class="text-gray-900">Drei-Punkte-Menü</strong> 
            <span class="inline-flex items-center mx-1">
              <svg class="w-4 h-4 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </span>.
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="flex-shrink-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <span class="pt-0.5">Wähle <strong class="text-gray-900">"Zum Startbildschirm hinzufügen"</strong> oder <strong class="text-gray-900">"App installieren"</strong>.</span>
        </li>
      </ol>
      
      <div class="mt-4 p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/20">
        <div class="flex items-start gap-2 text-xs text-gray-700">
          <span class="material-symbols-outlined text-brand-purple text-sm flex-shrink-0 mt-0.5">info</span>
          <p>Nach der Installation kannst du BrainrotAI wie jede andere App öffnen – schneller Zugriff auf deinen Test.</p>
        </div>
      </div>
    </div>
  {/if}
  

</div>
