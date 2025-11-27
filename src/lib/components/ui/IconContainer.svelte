<!--
  IconContainer Component v1
  
  Referenz: docs/master/design-system.md, Abschnitt "4. Komponenten" (Icon Container)
  
  Icon-Container mit farbigem Hintergrund (10% Opacity) für:
  - Onboarding-Step-Icons
  - Metric-Card-Icons
  - Feature-Highlights
  
  Design:
  - Rounded-full
  - Background: Primärfarbe mit 10% Opacity
  - Icon: Volle Primärfarbe
  - Padding: p-3 (12px)
-->
<script lang="ts">
  interface Props {
    icon: string; // Material Symbol name
    color?: 'purple' | 'green' | 'red' | 'yellow' | 'gray';
    size?: 'sm' | 'md' | 'lg';
  }
  
  let {
    icon,
    color = 'purple',
    size = 'md'
  }: Props = $props();
  
  // Color-Mapping
  const colorClasses = {
    purple: {
      bg: 'bg-brand-purple/10',
      icon: 'text-brand-purple'
    },
    green: {
      bg: 'bg-brand-green/10',
      icon: 'text-brand-green'
    },
    red: {
      bg: 'bg-red-500/10',
      icon: 'text-red-500'
    },
    yellow: {
      bg: 'bg-yellow-400/10',
      icon: 'text-yellow-600'
    },
    gray: {
      bg: 'bg-gray-200',
      icon: 'text-gray-600'
    }
  };
  
  // Size-Mapping
  const sizeClasses = {
    sm: {
      container: 'p-2',   // 8px padding
      icon: 'text-xl'     // 20px icon
    },
    md: {
      container: 'p-3',   // 12px padding
      icon: 'text-2xl'    // 24px icon
    },
    lg: {
      container: 'p-4',   // 16px padding
      icon: 'text-3xl'    // 30px icon
    }
  };
</script>

<div class="rounded-full flex items-center justify-center {colorClasses[color].bg} {sizeClasses[size].container}">
  <span class="material-symbols-outlined {colorClasses[color].icon} {sizeClasses[size].icon}">
    {icon}
  </span>
</div>

<style>
  /* Icon-Container-Base bereits in app.css (.icon-container) definiert */
</style>
