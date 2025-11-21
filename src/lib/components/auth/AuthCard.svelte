<script lang="ts">
  /**
   * Auth Card - Wrapper für Login/Register Forms
   * Nutzt bestehende BaseCard für konsistentes Design
   */
  import BaseCard from '$lib/components/base/BaseCard.svelte';
  
  interface Props {
    title: string;
    subtitle?: string;
    children?: any;
  }
  
  let { title, subtitle, children }: Props = $props();
</script>

<div class="min-h-screen bg-white flex items-center justify-center px-4 py-12">
  <BaseCard {title} {subtitle} centered={true} maxWidth="md">
    {@render children()}
  </BaseCard>
</div>
