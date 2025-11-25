<script lang="ts">
  /**
   * Welcome Intro Step - Step 0 im Onboarding
   * 
   * Erklärt das Projekt, Datennutzung und Mehrwert
   * Für eingeloggte und nicht-eingeloggte Nutzer sichtbar
   */
  
  let showMoreInfo = $state(false);
</script>

<div class="space-y-6 md:space-y-8">
  <!-- Header -->
  <div class="text-center">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 md:mb-4 leading-tight">
      Willkommen bei <span class="text-gradient-purple">BrainrotAI</span>
    </h1>
    <p class="text-base md:text-lg text-gray-600 leading-relaxed">
      Gemeinsam erforschen wir, wie sich deine Handynutzung auf deinen Fokus auswirkt.
    </p>
  </div>
  
  <!-- Three Benefit Blocks -->
  <div class="space-y-4 md:space-y-5">
    
    <!-- Block 1: Was du hier machst -->
    <div class="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="bg-brand-purple/10 p-3 rounded-full">
            <span class="material-symbols-outlined text-brand-purple text-2xl">psychology</span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="font-black text-lg md:text-xl text-gray-900 mb-2">Was du hier machst</h3>
          <ul class="space-y-1.5 text-sm md:text-base text-gray-700 leading-relaxed">
            <li>• Du machst regelmäßig einen kurzen Aufmerksamkeitstest (ca. 2–3 Minuten).</li>
            <li>• Nach jedem Test kannst du angeben, wie du dein Handy genutzt hast.</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Block 2: Was du davon hast -->
    <div class="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="bg-brand-purple/10 p-3 rounded-full">
            <span class="material-symbols-outlined text-brand-purple text-2xl">insights</span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="font-black text-lg md:text-xl text-gray-900 mb-2">Was du davon hast</h3>
          <ul class="space-y-1.5 text-sm md:text-base text-gray-700 leading-relaxed">
            <li>• Du siehst, wie sich deine kognitiven Fähigkeiten über Tage und Wochen verändern.</li>
            <li>• Du erkennst, welche Gewohnheiten deine kognitiven Fähigkeiten eher schwächen oder stärken.</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Block 3: Woran wir arbeiten -->
    <div class="p-5 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="bg-brand-purple/10 p-3 rounded-full">
            <span class="material-symbols-outlined text-brand-purple text-2xl">science</span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="font-black text-lg md:text-xl text-gray-900 mb-2">Woran wir arbeiten</h3>
          <ul class="space-y-1.5 text-sm md:text-base text-gray-700 leading-relaxed">
            <li>• Wir nutzen deine anonymisierten Daten, um die Wechselwirkung zwischen Smartphone und Gehirn besser zu verstehen.</li>
            <li>• Langfristig wollen wir ein Tool entwickeln, das kognitive Zustände allein aus Handynutzungsdaten abschätzen kann.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Privacy Notice -->
  <div class="p-4 bg-brand-purple/5 rounded-xl border border-brand-purple/20">
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined text-brand-purple text-xl flex-shrink-0 mt-0.5">shield</span>
      <div class="text-sm text-gray-700 leading-relaxed">
        <p class="mb-2">
          <strong class="text-gray-900">Datennutzung & Forschung:</strong>
        </p>
        <ul class="space-y-1">
          <li>• Deine Test- und Screentime-Daten werden pseudonymisiert gespeichert.</li>
          <li>• Wir werten sie aggregiert aus, um Muster zwischen Handynutzung und Aufmerksamkeit zu finden.</li>
          <li>• Ergebnisse nutzen wir, um BrainrotAI besser zu machen und die Forschung zum Thema "Smartphone & Gehirn" voranzutreiben.</li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Expandable: Mehr über das Projekt -->
  <div>
    <button
      onclick={() => showMoreInfo = !showMoreInfo}
      class="w-full text-center text-sm text-gray-600 hover:text-brand-purple transition-colors py-2 font-medium"
    >
      {showMoreInfo ? '▼' : '▶'} Mehr über das Projekt erfahren
    </button>
    
    {#if showMoreInfo}
      <div class="mt-4 p-4 bg-white rounded-xl border border-gray-300 text-sm text-gray-700 leading-relaxed animate-fadeIn">
        <p class="mb-3">
          <strong class="text-gray-900">BrainrotAI</strong> ist ein Forschungsprojekt, das an der Schnittstelle zwischen Psychologie, Neurowissenschaften und Digital Health arbeitet.
        </p>
        <p class="mb-3">
          Unser Ziel ist es, die Auswirkungen von Smartphone-Nutzung auf kognitive Fähigkeiten wie Aufmerksamkeit und Konzentration besser zu verstehen. Dazu nutzen wir wissenschaftlich validierte Tests wie den <strong>SART (Sustained Attention to Response Task)</strong>, kombiniert mit Selbstangaben zu digitalen Gewohnheiten.
        </p>
        <p>
          Die gewonnenen Erkenntnisse sollen nicht nur dir persönlich helfen, sondern auch zur wissenschaftlichen Debatte über digitale Ablenkung und kognitives Wohlbefinden beitragen.
        </p>
      </div>
    {/if}
  </div>
  

</div>
