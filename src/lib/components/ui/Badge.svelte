<!--
  Badge Component v1
  
  Referenz: docs/master/design-system.md, Abschnitt "4. Komponenten" (Badges)
  
  Status-Badge für:
  - Ampel-Indikator (BrainScore-basiert)
  - Kontext-Tags (z.B. "Nach Social Media")
  - Allgemeine Status-Anzeigen
  
  Varianten:
  - success: Grün (≥70 Score, "Sehr gut")
  - warning: Gelb (50-69 Score, "Okay")
  - error: Rot (<50 Score, "Verbesserungsfähig")
  - info: Purple (Kontext-Tags)
-->
<script lang="ts">
  interface Props {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    icon?: string; // Material Symbol name (optional)
    size?: 'sm' | 'md' | 'lg';
    children: any;
  }
  
  let {
    variant = 'neutral',
    icon = '',
    size = 'md',
    children
  }: Props = $props();
  
  // Variant-Mapping zu Farben
  const variantClasses = {
    success: 'bg-brand-green text-white',
    warning: 'bg-yellow-400 text-gray-900',
    error: 'bg-red-500 text-white',
    info: 'bg-brand-purple text-white',
    neutral: 'bg-gray-100 text-gray-700'
  };
  
  // Size-Mapping
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  const iconSizeClasses = {
    sm: 'text-base',   // 16px
    md: 'text-lg',     // 18px
    lg: 'text-xl'      // 20px
  };
</script>

<div class="inline-flex items-center gap-2 rounded-full font-medium {variantClasses[variant]} {sizeClasses[size]}">
  {#if icon}
    <span class="material-symbols-outlined {iconSizeClasses[size]}">
      {icon}
    </span>
  {/if}
  {@render children()}
</div>

<style>
  /* Badge-Base bereits in app.css (.badge-status) definiert */
</style>
