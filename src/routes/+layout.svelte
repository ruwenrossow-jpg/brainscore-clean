<script lang="ts">
  /**
   * Root Layout
   * Initialisiert Auth beim App-Start
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
    
    // Cleanup beim Unmount
    return () => {
      subscription?.subscription.unsubscribe();
    };
  });
</script>

{@render children()}
