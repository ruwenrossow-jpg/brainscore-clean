<script lang="ts">
  /**
   * Root Layout
   * Initialisiert Auth beim App-Start und PWA-Navigation
   */
  import '../app.css';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth.store';
  
  let { children } = $props();

  // Auth beim App-Start initialisieren
  onMount(() => {
    auth.initialize();
    
    // Auth Listener für Live-Updates
    const { data: subscription } = auth.setupAuthListener();
    
    // PWA: Verhindere, dass Links die App verlassen
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://');
    
    if (isPWA) {
      console.log('Running in PWA mode - intercepting navigation');
      
      // Stelle sicher, dass alle Links im standalone mode bleiben
      const handleClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a');
        if (!target || !target.hasAttribute('href')) return;
        
        const href = target.getAttribute('href');
        
        // Erlaube nur relative Links oder Links mit data-sveltekit-preload-data
        if (href && href.startsWith('http') && !target.hasAttribute('data-sveltekit-preload-data')) {
          console.warn('Blocked external navigation in PWA:', href);
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      document.addEventListener('click', handleClick, true);
      
      return () => {
        subscription?.subscription.unsubscribe();
        document.removeEventListener('click', handleClick, true);
      };
    }
    
    // Cleanup beim Unmount
    return () => {
      subscription?.subscription.unsubscribe();
    };
  });
</script>

{@render children()}
