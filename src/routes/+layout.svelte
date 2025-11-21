<script lang="ts">
  /**
   * Root Layout
   * 
   * NEUE ARCHITEKTUR:
   * - Empfängt Session vom Server (+layout.server.ts)
   * - Hydriert Store mit Server-Daten
   * - Startet Auth Listener für Live-Updates
   * - PWA Navigation Handling
   */
  import '../app.css';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth.store';
  import type { LayoutData } from './$types';
  
  let { data, children }: { data: LayoutData; children: any } = $props();

  // Store mit Server-Session hydrieren
  onMount(() => {
    // Hydrate Store mit Server-Daten (aus +layout.server.ts)
    auth.hydrate(data.session);
    
    // Auth Listener für Live-Updates (Token Refresh, andere Tabs, etc.)
    const { data: subscription } = auth.setupAuthListener();
    
    // PWA: Verhindere, dass Links die App verlassen
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');
    
    if (isPWA) {
      console.log('🚀 Running in PWA mode - strict navigation control enabled');
      
      // Aggressive Link-Interception für iOS/Android
      const handleClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href) return;
        
        // Blockiere externe Links
        if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!href.includes(window.location.hostname)) {
            console.warn('❌ Blocked external URL in PWA:', href);
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        
        // Stelle sicher, dass target nicht gesetzt ist
        const targetAttr = target.getAttribute('target');
        if (targetAttr && targetAttr !== '_self') {
          console.warn('❌ Blocked target attribute in PWA:', targetAttr);
          target.setAttribute('target', '_self');
        }
      };
      
      // Capture phase für frühe Interception
      document.addEventListener('click', handleClick, true);
      
      // Verhindere Formular-Submissions die zu neuen Pages führen
      const handleSubmit = (e: Event) => {
        const form = e.target as HTMLFormElement;
        if (form.target && form.target !== '_self') {
          console.warn('❌ Blocked form target in PWA');
          form.target = '_self';
        }
      };
      
      document.addEventListener('submit', handleSubmit, true);
      
      return () => {
        subscription?.subscription.unsubscribe();
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('submit', handleSubmit, true);
      };
    }
    
    // Cleanup beim Unmount
    return () => {
      subscription?.subscription.unsubscribe();
    };
  });
</script>

{@render children()}
