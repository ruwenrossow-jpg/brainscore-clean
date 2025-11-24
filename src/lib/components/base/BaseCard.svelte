<script lang="ts">
  /**
   * BaseCard - Wiederverwendbare Card-Komponente
   * WARUM? DRY-Prinzip, konsistentes Design
   */
  
  interface Props {
    title?: string;
    subtitle?: string;
    centered?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
    children?: any;
  }
  
  let {
    title = '',
    subtitle = '',
    centered = false,
    maxWidth = 'md',
    children,
  }: Props = $props();
  
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
</script>

<div class="card-modern w-full {widthClasses[maxWidth]}">
  <div class="p-8 {centered ? 'items-center text-center' : ''}">
    
    {#if title}
      <h2 class="text-2xl font-bold text-gray-900 mb-4 {centered ? 'text-center' : ''}">
        {title}
      </h2>
    {/if}
    
    {#if subtitle}
      <p class="text-sm text-gray-600 {centered ? 'text-center' : ''} -mt-2">
        {subtitle}
      </p>
    {/if}

    {@render children()}

  </div>
</div>
