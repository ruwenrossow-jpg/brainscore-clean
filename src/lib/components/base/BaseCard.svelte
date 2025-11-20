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

<div class="card bg-base-200 shadow-lg w-full {widthClasses[maxWidth]} border border-gray-200">
  <div class="card-body {centered ? 'items-center text-center' : ''}">
    
    {#if title}
      <h2 class="card-title text-2xl font-semibold text-black {centered ? 'justify-center' : ''}">
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
