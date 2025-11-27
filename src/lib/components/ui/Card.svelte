<!--
  Card Component v1
  
  Referenz: docs/master/design-system.md, Abschnitt "4. Karten-Typen (Cards)"
  
  Wiederverwendbare Card-Komponente für:
  - Primary Metric Cards (Dashboard-Hauptkarte)
  - Secondary Metric Cards (Kognitive Bausteine)
  - Form Cards (Screentime, Check-ins)
  - List Cards (Logbuch-Einträge)
  
  Design:
  - rounded-2xl (16px Border-Radius)
  - shadow-xl (große, weiche Schatten)
  - border-gray-100 (subtile Border)
  - Padding: p-6 bis p-10 (je nach Kontext)
-->
<script lang="ts">
  interface Props {
    variant?: 'default' | 'compact' | 'form' | 'list';
    title?: string;
    subtitle?: string;
    centered?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    hover?: boolean;
    children?: any;
  }
  
  let {
    variant = 'default',
    title = '',
    subtitle = '',
    centered = false,
    maxWidth = 'full',
    hover = false,
    children,
  }: Props = $props();
  
  // Max-Width-Mapping
  const widthClasses = {
    sm: 'max-w-sm',     // 384px
    md: 'max-w-md',     // 448px
    lg: 'max-w-lg',     // 512px
    xl: 'max-w-xl',     // 576px
    '2xl': 'max-w-2xl', // 672px
    full: 'w-full'
  };
  
  // Padding pro Variant
  const paddingClasses = {
    default: 'p-8',      // 32px - Standard
    compact: 'p-4',      // 16px - List-Cards
    form: 'p-6 md:p-8',  // 24px / 32px - Form-Cards
    list: 'p-4'          // 16px - Logbuch
  };
  
  const hoverClass = hover ? 'hover:shadow-2xl transition-all duration-300' : '';
  const centerClass = centered ? 'items-center text-center' : '';
</script>

<div class="card-modern {widthClasses[maxWidth]} {paddingClasses[variant]} {hoverClass}">
  <div class="{centerClass}">
    
    {#if title}
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 {centered ? 'text-center' : ''}">
        {title}
      </h2>
    {/if}
    
    {#if subtitle}
      <p class="text-sm text-gray-600 {centered ? 'text-center' : ''} mb-4">
        {subtitle}
      </p>
    {/if}

    {#if children}
      {@render children()}
    {/if}

  </div>
</div>

<style>
  /* Card-Base-Styles bereits in app.css definiert (.card-modern) */
  /* Hier nur Component-spezifische Overrides, falls nötig */
</style>
